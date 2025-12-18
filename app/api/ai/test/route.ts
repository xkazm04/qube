import { NextRequest, NextResponse } from 'next/server';
import { chat } from '@tanstack/ai';
import { createAnthropic } from '@tanstack/ai-anthropic';
import { createGemini } from '@tanstack/ai-gemini';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider') || 'gemini';

  try {
    // Check API keys
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    console.log('[AI Test] Anthropic key set:', !!anthropicKey);
    console.log('[AI Test] Gemini key set:', !!geminiKey);

    // Create adapter
    let adapter;
    let model: string;

    if (provider === 'claude') {
      if (!anthropicKey) {
        return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });
      }
      adapter = createAnthropic(anthropicKey);
      model = 'claude-haiku-4-5-20251001';
    } else {
      if (!geminiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
      }
      adapter = createGemini(geminiKey);
      model = 'gemini-2.5-flash';
    }

    console.log(`[AI Test] Using provider: ${provider}, model: ${model}`);

    // Simple test message
    const messages = [
      { role: 'user' as const, content: 'Respond with exactly: {"test": "success", "message": "Hello from AI!"}' },
    ];

    console.log('[AI Test] Starting chat...');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = chat({
      adapter: adapter as any,
      messages,
      model,
    });

    // Collect response
    let fullResponse = '';
    const chunks: Array<{ type: string; data: string }> = [];

    try {
      for await (const chunk of stream) {
        const chunkStr = JSON.stringify(chunk);
        chunks.push({ type: chunk.type, data: chunkStr.substring(0, 100) });

        // TanStack AI chunk types: "error" | "content" | "tool_call" | "tool_result" | "done" | "approval-requested" | "tool-input-available" | "thinking"
        if (chunk.type === 'content' && 'content' in chunk && typeof chunk.content === 'string') {
          fullResponse += chunk.content;
        } else if (chunk.type === 'error') {
          console.error('[AI Test] Error chunk:', chunk);
        }
      }
    } catch (streamError) {
      console.error('[AI Test] Stream error:', streamError);
      return NextResponse.json({
        error: 'Stream error',
        details: streamError instanceof Error ? streamError.message : 'Unknown',
        chunks,
      }, { status: 500 });
    }

    console.log('[AI Test] Response:', fullResponse);

    return NextResponse.json({
      success: true,
      provider,
      model,
      chunkCount: chunks.length,
      chunks: chunks.slice(0, 5), // First 5 chunks for debugging
      response: fullResponse,
      responseLength: fullResponse.length,
    });

  } catch (error) {
    console.error('[AI Test] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
