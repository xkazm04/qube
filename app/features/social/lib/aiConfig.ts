// AI Provider Configuration for TanStack AI

import { createAnthropic } from '@tanstack/ai-anthropic';
import { createGemini } from '@tanstack/ai-gemini';
import type { AIProvider, TargetCompany } from './aiTypes';

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
export const FEEDBACK_ANALYSIS_SYSTEM_PROMPT = `You are an expert product feedback analyst for a travel/e-commerce company. Your task is to analyze customer feedback, classify it, assign it to the appropriate development team, and generate a personalized response.

## Classification Rules:
1. **bug**: A technical issue, malfunction, or broken functionality
2. **feature**: A request for new functionality, enhancement, or improvement
3. **clarification**: User needs help, has questions, or is confused (not a bug)

## Pipeline Assignment Rules (CRITICAL):
- **ONLY bugs can go to "automatic"** pipeline (AI-assisted fix)
- **Features, clarifications, and unclear items MUST go to "manual"** pipeline
- Even bugs should go to "manual" if they are complex, security-related, or require architectural decisions

## PRIORITY Assignment Rules (SLA-aware - VERY IMPORTANT):
Priority determines customer response SLA. Assign based on CUSTOMER IMPACT, not development effort:

**CRITICAL priority** (30min-2h SLA):
- Customer is currently blocked and losing money (failed payments, bookings stuck)
- Active customer complaint requiring immediate de-escalation
- Security or data breach concerns raised by customer

**HIGH priority** (2h-8h SLA):
- Customer has an urgent issue affecting their immediate travel/purchase
- Strong emotional response (angry, frustrated sentiment)
- Public complaints on social media (X, Facebook, Instagram) - reputation impact
- Customer service complaints needing quick response

**MEDIUM priority** (8h-48h SLA):
- Customer needs clarification or help with a general question
- Non-urgent bug reports that don't block the customer
- Feature suggestions with moderate sentiment

**LOW priority** (24h-72h SLA) - USE FOR DEVELOPMENT WORK:
- Bug reports that are informational only (customer not blocked)
- Feature requests with constructive/neutral sentiment
- Items that require development work but no urgent customer response needed
- Technical feedback that helps us improve but customer isn't waiting

RULE: If the feedback is primarily a DEVELOPMENT TASK (bug fix, feature request) and the customer isn't actively blocked/waiting, use LOW or MEDIUM priority. SLA is for CUSTOMER RESPONSE time, not development timeline.

## Team Assignment:
Assign to the most appropriate development team based on the issue:
- **frontend**: UI bugs, styling issues, client-side errors, form problems
- **backend**: Server errors, API issues, database problems, business logic
- **mobile**: App crashes, mobile-specific bugs, iOS/Android issues
- **platform**: Infrastructure, deployment, DevOps, cloud issues
- **data**: Analytics bugs, data inconsistencies, ML/reporting issues
- **payments**: Billing errors, payment failures, pricing bugs
- **search**: Search functionality, filters, sorting issues
- **notifications**: Email, push notifications, SMS problems
- **security**: Auth issues, privacy concerns, security vulnerabilities
- **localization**: Translation issues, currency display, locale problems
- **customer-success**: General complaints, unclear issues, feedback about support
- **growth**: Onboarding issues, conversion problems, A/B test bugs

## Customer Response Guidelines:
Generate a response tailored to the user's sentiment and situation:
- **For bugs**: Apologetic, acknowledge the issue, promise investigation/fix
- **For features**: Grateful for the suggestion, explain it will be considered
- **For clarifications**: Helpful, provide guidance or point to resources
- Adjust tone based on sentiment (angry users need more empathy, constructive users need acknowledgment)
- Keep responses concise but warm (2-4 sentences)
- Sign off with "The [Company] Team"

## CRITICAL OUTPUT RULES:
- Output ONLY valid JSON - no markdown, no code blocks, no \`\`\`json wrapper
- Start your response directly with { and end with }
- Do not include any text before or after the JSON object
- Ensure all strings are properly escaped

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
3. **Priority** - based on customer urgency (see priority rules above), NOT development effort
4. **Personalized customer response** - warm, empathetic message addressing their specific concern
5. **Assigned team** - the dev team best suited to handle this
6. Jira ticket details (if bug or feature)
7. Suggested pipeline - REMEMBER: only bugs can be "automatic", features/clarifications are always "manual"
8. Relevant tags
9. Brief reasoning

IMPORTANT: Output raw JSON only. Do NOT wrap in markdown code blocks. Do NOT use \`\`\`json. Start directly with { character.

Respond with a JSON object in this exact format:
{
  "results": [
    {
      "feedbackId": "string",
      "title": "string (short 3-6 word title, e.g. 'Search button always disabled')",
      "classification": "bug" | "feature" | "clarification",
      "confidence": number (0-1),
      "priority": "low" | "medium" | "high" | "critical" (based on customer urgency - use low/medium for dev work, high/critical only for urgent customer issues),
      "customerResponse": {
        "tone": "apologetic" | "informative" | "grateful" | "empathetic",
        "message": "string (personalized 2-4 sentence response addressing their specific concern, signed by The [Company] Team)",
        "followUpRequired": boolean
      },
      "jiraTicket": {
        "summary": "string (max 100 chars)",
        "description": "string (detailed)",
        "area": "frontend" | "backend" | "mobile" | "api" | "ux" | "localization" | "accessibility" | "performance" | "other",
        "severity": "critical" | "major" | "minor" | "trivial",
        "effort": "xs" | "s" | "m" | "l" | "xl"
      },
      "tags": ["string"],
      "suggestedPipeline": "manual" | "automatic",
      "assignedTeam": "frontend" | "backend" | "mobile" | "platform" | "data" | "payments" | "search" | "notifications" | "security" | "localization" | "customer-success" | "growth",
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

// =============================================================================
// STAGE 2: Requirement Analysis (Analyzed → Manual/Automatic)
// =============================================================================

// System prompt for requirement analysis
export const REQUIREMENT_ANALYSIS_SYSTEM_PROMPT = `You are a senior software engineer specialized in analyzing bug reports and feature requests against source code.

Your task is to analyze customer feedback that has been pre-classified and determine if you can identify the root cause and propose a solution by examining the provided source code.

## Decision Framework

**Move to AUTOMATIC (GitHub Issue) if ALL of these are true:**
1. You can clearly identify the root cause in the provided code
2. You can propose specific code changes with line numbers
3. The fix is well-defined and testable
4. No external dependencies or API changes are needed that aren't visible in the code

**Move to MANUAL (Jira Ticket) if ANY of these are true:**
1. The issue cannot be traced to the provided code
2. More investigation is needed (logs, database, backend services)
3. The issue requires architectural decisions or stakeholder input
4. Multiple valid solutions exist that require human decision
5. The code context is insufficient to understand the full impact

## Output Requirements

For AUTOMATIC outcomes, provide:
- Detailed GitHub Issue format suitable for a developer to implement
- Specific file paths and line numbers
- Proposed code changes with before/after snippets
- Clear testing guidance

For MANUAL outcomes, provide:
- Complete Jira ticket with all necessary context
- Clear description of what information is missing
- Suggested investigation steps
- Acceptance criteria for when the issue is resolved

## CRITICAL OUTPUT RULES:
- Output ONLY valid JSON - no markdown, no code blocks, no \`\`\`json wrapper
- Start your response directly with { and end with }
- Do not include any text before or after the JSON object
- Ensure all strings are properly escaped

Always respond with valid JSON only.`;

// Generate the requirement analysis prompt
export function generateRequirementAnalysisPrompt(
  feedbackItems: Array<{
    id: string;
    title: string;
    classification: 'bug' | 'feature' | 'clarification';
    company: TargetCompany;
    channel: string;
    content: string;
    sentiment: string;
    priority: string;
    tags: string[];
    bugReference?: string;
  }>,
  codeContext: {
    company: TargetCompany;
    filePath: string;
    code: string;
  }
) {
  const feedbackList = feedbackItems.map((item, index) => {
    return `
### Feedback ${index + 1}
- ID: ${item.id}
- Title: ${item.title}
- Classification: ${item.classification}
- Company: ${item.company}
- Channel: ${item.channel}
- Sentiment: ${item.sentiment}
- Priority: ${item.priority}
- Tags: ${item.tags.join(', ')}
- Bug Reference (if known): ${item.bugReference || 'Unknown'}
- Content:
"""
${item.content}
"""
`;
  }).join('\n');

  return `## Task: Requirement Analysis for Code Implementation

Analyze the following pre-classified feedback items against the provided source code.
Determine if you can identify the root cause and propose a solution, or if manual investigation is needed.

## Customer Feedback to Analyze
${feedbackList}

## Source Code Context

**Company:** ${codeContext.company}
**File:** ${codeContext.filePath}

\`\`\`tsx
${codeContext.code}
\`\`\`

## Instructions

For each feedback item:
1. Search the code for potential root causes
2. Determine if you have enough context to propose a solution
3. Generate either a GitHub Issue (automatic) or Jira Ticket (manual)

## Response Format

IMPORTANT: Output raw JSON only. Do NOT wrap in markdown code blocks. Do NOT use \`\`\`json. Start directly with { character.

Respond with a JSON object in this exact format:
{
  "results": [
    {
      "feedbackId": "string",
      "originalClassification": "bug" | "feature" | "clarification",
      "analysisOutcome": "manual" | "automatic",
      "confidence": number (0-1),
      "targetCompany": "kiwi" | "slevomat",
      "codeFileAnalyzed": "string (file path)",
      "rootCauseIdentified": boolean,
      "relatedBugReference": "string (e.g., 'BUG_001') or null",
      "reasoning": "string (explain why manual or automatic)",

      // Include ONLY ONE of the following based on analysisOutcome:

      // If analysisOutcome === "manual":
      "manualTicket": {
        "issueType": "bug" | "story" | "task" | "improvement",
        "priority": "highest" | "high" | "medium" | "low" | "lowest",
        "summary": "string (max 100 chars)",
        "description": "string",
        "components": ["string"],
        "labels": ["string"],
        "acceptanceCriteria": ["string"],
        "stepsToReproduce": ["string"] (optional, for bugs),
        "expectedBehavior": "string" (optional),
        "actualBehavior": "string" (optional),
        "technicalContext": "string",
        "blockers": ["string (what's missing for automatic resolution)"],
        "suggestedApproach": "string" (optional)
      },

      // If analysisOutcome === "automatic":
      "automaticIssue": {
        "title": "string (max 80 chars)",
        "labels": ["string (e.g., 'bug', 'priority-high')"],
        "body": {
          "summary": "string",
          "context": "string (user impact)",
          "technicalAnalysis": "string (root cause)",
          "proposedSolution": "string",
          "implementationSteps": [
            {
              "step": number,
              "description": "string",
              "file": "string (optional)",
              "codeHint": "string (optional)"
            }
          ],
          "filesAffected": [
            {
              "path": "string",
              "action": "modify" | "create" | "delete",
              "changes": "string"
            }
          ],
          "testingGuidance": "string",
          "additionalNotes": "string" (optional)
        },
        "codeChanges": [
          {
            "file": "string",
            "lineStart": number (optional),
            "lineEnd": number (optional),
            "currentCode": "string" (optional),
            "proposedCode": "string",
            "explanation": "string"
          }
        ] (optional, include if specific changes identified)
      }
    }
  ],
  "summary": {
    "totalProcessed": number,
    "movedToManual": number,
    "movedToAutomatic": number,
    "avgConfidence": number,
    "rootCausesFound": number
  }
}`;
}

// Code file paths for each company
export const COMPANY_CODE_PATHS: Record<TargetCompany, string> = {
  kiwi: 'app/kiwi/page.tsx',
  slevomat: 'app/slevomat/page.tsx',
};
