import { NextRequest, NextResponse } from 'next/server';
import { chat, toStreamResponse } from '@tanstack/ai';
import { createAnthropic } from '@tanstack/ai-anthropic';
import { createGemini } from '@tanstack/ai-gemini';
import type { AIProvider } from '@/app/features/social/lib/aiTypes';
import {
  FEEDBACK_ANALYSIS_SYSTEM_PROMPT,
  generateAnalysisPrompt,
  AI_MODELS
} from '@/app/features/social/lib/aiConfig';

// Create adapter based on provider
function getAdapter(provider: AIProvider) {
  switch (provider) {
    case 'claude':
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) {
        throw new Error('ANTHROPIC_API_KEY is not set. Please add it to your .env.local file.');
      }
      return createAnthropic(anthropicKey);
    case 'gemini':
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error('GEMINI_API_KEY is not set. Please add it to your .env.local file.');
      }
      return createGemini(geminiKey);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// POST handler for feedback analysis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, feedbackItems, stream: useStream = false } = body as {
      provider: AIProvider;
      feedbackItems: Array<{
        id: string;
        company: string;
        channel: string;
        content: string;
        sentiment: string;
        priority: string;
        tags: string[];
      }>;
      stream?: boolean;
    };

    console.log(`[AI Analyze] Provider: ${provider}, Items: ${feedbackItems?.length || 0}`);

    // Validate input
    if (!provider || !['claude', 'gemini'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be "claude" or "gemini"' },
        { status: 400 }
      );
    }

    if (!feedbackItems || !Array.isArray(feedbackItems) || feedbackItems.length === 0) {
      return NextResponse.json(
        { error: 'feedbackItems must be a non-empty array' },
        { status: 400 }
      );
    }

    // Get adapter and model
    let adapter;
    try {
      adapter = getAdapter(provider);
    } catch (adapterError) {
      console.error('[AI Analyze] Adapter error:', adapterError);
      return NextResponse.json(
        { error: adapterError instanceof Error ? adapterError.message : 'Failed to create adapter' },
        { status: 500 }
      );
    }

    const model = AI_MODELS[provider];
    console.log(`[AI Analyze] Using model: ${model}`);

    // Generate the analysis prompt
    const userPrompt = generateAnalysisPrompt(feedbackItems);

    // Create chat messages - combine system prompt with user prompt
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      { role: 'user', content: `${FEEDBACK_ANALYSIS_SYSTEM_PROMPT}\n\n${userPrompt}` },
    ];

    if (useStream) {
      // Return streaming response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stream = chat({
        adapter: adapter as any,
        messages,
        model,
      });
      return toStreamResponse(stream);
    } else {
      console.log('[AI Analyze] Starting chat...');

      // Return complete response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stream = chat({
        adapter: adapter as any,
        messages,
        model,
      });

      // Collect the full response
      let fullResponse = '';
      let chunkCount = 0;

      try {
        for await (const chunk of stream) {
          chunkCount++;
          // Debug: log chunk structure for first few chunks
          if (chunkCount <= 3) {
            console.log(`[AI Analyze] Chunk ${chunkCount}:`, JSON.stringify(chunk).substring(0, 200));
          }

          // Handle TanStack AI chunk types
          // Available types: "error" | "content" | "tool_call" | "tool_result" | "done" | "approval-requested" | "tool-input-available" | "thinking"
          if (chunk.type === 'content') {
            // Content chunk contains the actual text response
            if ('content' in chunk && typeof chunk.content === 'string') {
              fullResponse += chunk.content;
            }
          } else if (chunk.type === 'error') {
            console.error('[AI Analyze] Error chunk:', chunk);
          }
          // 'done' and other types don't contain text content
        }
      } catch (streamError) {
        console.error('[AI Analyze] Stream error:', streamError);
        return NextResponse.json(
          {
            error: 'Error reading AI response stream',
            details: streamError instanceof Error ? streamError.message : 'Unknown stream error'
          },
          { status: 500 }
        );
      }

      console.log(`[AI Analyze] Received ${chunkCount} chunks, response length: ${fullResponse.length}`);

      if (!fullResponse || fullResponse.trim().length === 0) {
        console.error('[AI Analyze] Empty response received');
        return NextResponse.json(
          { error: 'Empty response from AI provider. Please check your API key and try again.' },
          { status: 500 }
        );
      }

      // Parse the JSON response
      try {
        console.log('[AI Analyze] Raw response preview:', fullResponse.substring(0, 300));

        let jsonStr = fullResponse.trim();

        // Strategy 1: Extract first complete JSON from markdown code block
        const codeBlockMatch = jsonStr.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1].trim();
          console.log('[AI Analyze] Extracted from code block');
        } else {
          // Strategy 2: Find the first complete JSON object with balanced braces
          const firstBrace = jsonStr.indexOf('{');
          if (firstBrace !== -1) {
            let braceCount = 0;
            let endIndex = -1;

            for (let i = firstBrace; i < jsonStr.length; i++) {
              if (jsonStr[i] === '{') braceCount++;
              if (jsonStr[i] === '}') braceCount--;
              if (braceCount === 0) {
                endIndex = i;
                break;
              }
            }

            if (endIndex !== -1) {
              jsonStr = jsonStr.substring(firstBrace, endIndex + 1);
              console.log('[AI Analyze] Extracted JSON with balanced braces');
            }
          }
        }

        // Clean up any remaining issues
        jsonStr = jsonStr
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        const result = JSON.parse(jsonStr);
        console.log('[AI Analyze] Successfully parsed response with', result.results?.length || 0, 'results');
        return NextResponse.json(result);
      } catch (parseError) {
        console.error('[AI Analyze] Parse error:', parseError);
        console.error('[AI Analyze] Failed response:', fullResponse.substring(0, 1000));
        return NextResponse.json(
          {
            error: 'Failed to parse AI response as JSON',
            rawResponse: fullResponse.substring(0, 1000)
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('[AI Analyze] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// GET handler for status check
export async function GET() {
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  return NextResponse.json({
    status: 'ready',
    providers: {
      claude: hasAnthropic ? 'configured' : 'not_configured',
      gemini: hasGemini ? 'configured' : 'not_configured',
    },
    models: AI_MODELS,
  });
}
