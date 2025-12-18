// AI Provider Configuration for TanStack AI

import { createAnthropic } from '@tanstack/ai-anthropic';
import { createGemini } from '@tanstack/ai-gemini';
import type { AIProvider } from './aiTypes';

// Create adapters with optional API keys from environment
export function createAIAdapter(provider: AIProvider) {
  switch (provider) {
    case 'claude':
      return createAnthropic(process.env.ANTHROPIC_API_KEY || '');
    case 'gemini':
      return createGemini(process.env.GEMINI_API_KEY || '');
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

// Model configurations
export const AI_MODELS = {
  claude: 'claude-haiku-4-5-20251001',
  gemini: 'gemini-2.5-flash',
} as const;

// System prompt for feedback analysis
export const FEEDBACK_ANALYSIS_SYSTEM_PROMPT = `You are an expert product feedback analyst. Your task is to analyze customer feedback and classify it appropriately.

For each piece of feedback, you must:
1. Classify it as either:
   - "bug": A technical issue or malfunction that needs fixing
   - "feature": A request for new functionality or improvement
   - "clarification": User needs more information or help understanding something

2. Generate a professional, empathetic customer response appropriate for the channel

3. For bugs and features, create a Jira ticket with:
   - Summary: Brief description (max 100 chars)
   - Description: Detailed explanation with reproduction steps if applicable
   - Area: Technical area (frontend, backend, mobile, api, ux, localization, accessibility, performance, other)
   - Severity: critical, major, minor, or trivial
   - Effort: xs (< 1 hour), s (1-4 hours), m (1-2 days), l (3-5 days), xl (> 1 week)

4. Suggest whether the fix should go through manual review or can be handled automatically

Consider:
- The sentiment and urgency of the feedback
- Technical complexity of the issue
- Impact on user experience
- Whether it affects business metrics (revenue, churn)
- Regulatory or compliance implications

Respond with valid JSON only.`;

// Generate the analysis prompt for a batch of feedback
export function generateAnalysisPrompt(feedbackItems: Array<{
  id: string;
  company: string;
  channel: string;
  content: string;
  sentiment: string;
  priority: string;
  tags: string[];
}>) {
  const feedbackList = feedbackItems.map((item, index) => {
    return `
### Feedback ${index + 1}
- ID: ${item.id}
- Company: ${item.company}
- Channel: ${item.channel}
- Sentiment: ${item.sentiment}
- Priority: ${item.priority}
- Tags: ${item.tags.join(', ')}
- Content:
"""
${item.content}
"""
`;
  }).join('\n');

  return `Analyze the following ${feedbackItems.length} customer feedback item(s) and provide structured analysis for each.

${feedbackList}

For each feedback item, provide:
1. Classification (bug/feature/clarification)
2. Confidence score (0-1)
3. Customer response with appropriate tone
4. Jira ticket details (if bug or feature)
5. Suggested pipeline (manual/automatic)
6. Relevant tags
7. Brief reasoning for your classification

Respond with a JSON object in this exact format (no markdown, just pure JSON):
{
  "results": [
    {
      "feedbackId": "string",
      "title": "string (short 3-6 word title summarizing the issue, e.g. 'Search button visibility issue')",
      "classification": "bug" | "feature" | "clarification",
      "confidence": number,
      "customerResponse": {
        "tone": "apologetic" | "informative" | "grateful" | "empathetic",
        "message": "string",
        "followUpRequired": boolean
      },
      "jiraTicket": {
        "summary": "string",
        "description": "string",
        "area": "frontend" | "backend" | "mobile" | "api" | "ux" | "localization" | "accessibility" | "performance" | "other",
        "severity": "critical" | "major" | "minor" | "trivial",
        "effort": "xs" | "s" | "m" | "l" | "xl"
      },
      "tags": ["string"],
      "suggestedPipeline": "manual" | "automatic",
      "reasoning": "string"
    }
  ],
  "summary": {
    "totalProcessed": number,
    "bugs": number,
    "features": number,
    "clarifications": number,
    "avgConfidence": number
  }
}`;
}
