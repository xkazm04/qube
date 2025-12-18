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
        throw new Error('ANTHROPIC_API_KEY is not set');
      }
      return createAnthropic(anthropicKey);
    case 'gemini':
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error('GEMINI_API_KEY is not set');
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
    const adapter = getAdapter(provider);
    const model = AI_MODELS[provider];

    // Generate the analysis prompt
    const userPrompt = generateAnalysisPrompt(feedbackItems);

    // Create chat messages - combine system prompt with user prompt
    // since @tanstack/ai doesn't support 'system' role directly
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
      // Return complete response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stream = chat({
        adapter: adapter as any,
        messages,
        model,
      });

      // Collect the full response
      let fullResponse = '';
      for await (const chunk of stream) {
        if (chunk.type === 'content') {
          fullResponse += chunk.content;
        }
      }

      // Parse the JSON response
      try {
        // Extract JSON from the response (handle markdown code blocks)
        let jsonStr = fullResponse.trim();
        const jsonMatch = fullResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
        
        if (jsonMatch) {
          jsonStr = jsonMatch[1].trim();
        } else {
          // Fallback: Try to find the JSON object if it's not wrapped in code blocks
          const firstOpenBrace = jsonStr.indexOf('{');
          const lastCloseBrace = jsonStr.lastIndexOf('}');
          if (firstOpenBrace !== -1 && lastCloseBrace !== -1 && lastCloseBrace > firstOpenBrace) {
            jsonStr = jsonStr.substring(firstOpenBrace, lastCloseBrace + 1);
          }
        }

        const result = JSON.parse(jsonStr);
        return NextResponse.json(result);
      } catch (parseError) {
        console.error('Failed to parse AI response:', fullResponse);
        return NextResponse.json(
          {
            error: 'Failed to parse AI response',
            rawResponse: fullResponse
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('AI analysis error:', error);
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
