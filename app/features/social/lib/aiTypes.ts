// AI Processing Types for Feedback Analysis

import { z } from 'zod';

// Feedback classification type
export type FeedbackClassification = 'bug' | 'feature' | 'clarification';

// Analysis stage type
export type AnalysisStage = 'classification' | 'requirement';

// Development team enum - realistic corporate structure
export const DEV_TEAMS = [
  'frontend',      // UI/UX implementation
  'backend',       // Server-side logic, APIs
  'mobile',        // iOS/Android apps
  'platform',      // Infrastructure, DevOps
  'data',          // Analytics, ML, data pipelines
  'payments',      // Payment processing, billing
  'search',        // Search functionality
  'notifications', // Email, push, SMS
  'security',      // Security, auth, compliance
  'localization',  // i18n, translations
  'customer-success', // Customer-facing issues, support tools
  'growth',        // A/B testing, onboarding, conversion
] as const;

export type DevTeam = typeof DEV_TEAMS[number];

// Team icon mapping (for UI reference)
export const TEAM_ICONS: Record<DevTeam, string> = {
  frontend: 'Monitor',
  backend: 'Server',
  mobile: 'Smartphone',
  platform: 'Cloud',
  data: 'Database',
  payments: 'CreditCard',
  search: 'Search',
  notifications: 'Bell',
  security: 'Shield',
  localization: 'Globe',
  'customer-success': 'Headphones',
  growth: 'TrendingUp',
};

// Team colors for UI
export const TEAM_COLORS: Record<DevTeam, string> = {
  frontend: 'text-blue-400 bg-blue-500/20',
  backend: 'text-green-400 bg-green-500/20',
  mobile: 'text-purple-400 bg-purple-500/20',
  platform: 'text-cyan-400 bg-cyan-500/20',
  data: 'text-orange-400 bg-orange-500/20',
  payments: 'text-emerald-400 bg-emerald-500/20',
  search: 'text-yellow-400 bg-yellow-500/20',
  notifications: 'text-pink-400 bg-pink-500/20',
  security: 'text-red-400 bg-red-500/20',
  localization: 'text-indigo-400 bg-indigo-500/20',
  'customer-success': 'text-teal-400 bg-teal-500/20',
  growth: 'text-lime-400 bg-lime-500/20',
};

// ============================================================================
// STAGE 1: Classification Analysis (New → Analyzed)
// ============================================================================

// Jira ticket structure schema
export const JiraTicketSchema = z.object({
  summary: z.string().describe('Brief summary of the issue (max 100 chars)'),
  description: z.string().describe('Detailed description of the issue'),
  area: z.enum(['frontend', 'backend', 'mobile', 'api', 'ux', 'localization', 'accessibility', 'performance', 'other']).describe('Technical area affected'),
  severity: z.enum(['critical', 'major', 'minor', 'trivial']).describe('Severity level'),
  effort: z.enum(['xs', 's', 'm', 'l', 'xl']).describe('Estimated effort to fix'),
});

export type JiraTicketData = z.infer<typeof JiraTicketSchema>;

// Customer response schema
export const CustomerResponseSchema = z.object({
  tone: z.enum(['apologetic', 'informative', 'grateful', 'empathetic']).describe('Tone of the response'),
  message: z.string().describe('Response message to send to customer'),
  followUpRequired: z.boolean().describe('Whether follow-up is needed'),
});

export type CustomerResponseData = z.infer<typeof CustomerResponseSchema>;

// Single feedback analysis result
export const FeedbackAnalysisResultSchema = z.object({
  feedbackId: z.string().describe('ID of the feedback item'),
  title: z.string().describe('Short 3-6 word title summarizing the issue'),
  classification: z.enum(['bug', 'feature', 'clarification']).describe('Type of feedback'),
  confidence: z.number().min(0).max(1).describe('Confidence score'),
  customerResponse: CustomerResponseSchema,
  jiraTicket: JiraTicketSchema.optional().describe('Jira ticket data (only for bugs and features)'),
  tags: z.array(z.string()).describe('Relevant tags'),
  suggestedPipeline: z.enum(['manual', 'automatic']).describe('Suggested processing pipeline'),
  assignedTeam: z.enum(['frontend', 'backend', 'mobile', 'platform', 'data', 'payments', 'search', 'notifications', 'security', 'localization', 'customer-success', 'growth']).describe('Development team responsible for this task'),
  reasoning: z.string().describe('Brief explanation of the analysis'),
});

export type FeedbackAnalysisResult = z.infer<typeof FeedbackAnalysisResultSchema>;

// Batch processing response
export const BatchAnalysisResponseSchema = z.object({
  results: z.array(FeedbackAnalysisResultSchema),
  summary: z.object({
    totalProcessed: z.number(),
    bugs: z.number(),
    features: z.number(),
    clarifications: z.number(),
    avgConfidence: z.number(),
  }),
});

export type BatchAnalysisResponse = z.infer<typeof BatchAnalysisResponseSchema>;

// ============================================================================
// STAGE 2: Requirement Analysis (Analyzed → Manual/Automatic)
// ============================================================================

// Company type for code context
export type TargetCompany = 'kiwi' | 'slevomat';

// Jira Manual Ticket Schema - Used when LLM doesn't have enough context
// This is a detailed Jira-style ticket for manual review
export const JiraManualTicketSchema = z.object({
  issueType: z.enum(['bug', 'story', 'task', 'improvement']).describe('Jira issue type'),
  priority: z.enum(['highest', 'high', 'medium', 'low', 'lowest']).describe('Jira priority'),
  summary: z.string().max(100).describe('Brief summary for Jira title'),
  description: z.string().describe('Detailed description of the issue'),
  components: z.array(z.string()).describe('Affected components/modules'),
  labels: z.array(z.string()).describe('Labels for categorization'),
  acceptanceCriteria: z.array(z.string()).describe('List of acceptance criteria'),
  stepsToReproduce: z.array(z.string()).optional().describe('Steps to reproduce (for bugs)'),
  expectedBehavior: z.string().optional().describe('Expected behavior'),
  actualBehavior: z.string().optional().describe('Actual/current behavior'),
  technicalContext: z.string().describe('Technical context and observations'),
  blockers: z.array(z.string()).describe('Missing information or blockers for automatic resolution'),
  suggestedApproach: z.string().optional().describe('High-level suggested approach if any'),
});

export type JiraManualTicketData = z.infer<typeof JiraManualTicketSchema>;

// GitHub Issue Schema - Used when LLM has enough context to provide solution
// Designed to match Claude Code requirement file format
export const GitHubIssueSchema = z.object({
  title: z.string().max(80).describe('GitHub issue title'),
  labels: z.array(z.string()).describe('GitHub labels (e.g., bug, enhancement, priority-high)'),
  assignees: z.array(z.string()).optional().describe('Suggested assignees if known'),
  milestone: z.string().optional().describe('Target milestone if applicable'),
  body: z.object({
    summary: z.string().describe('Brief summary of the issue'),
    context: z.string().describe('Background context and user impact'),
    technicalAnalysis: z.string().describe('Root cause analysis'),
    proposedSolution: z.string().describe('Detailed solution description'),
    implementationSteps: z.array(z.object({
      step: z.number(),
      description: z.string(),
      file: z.string().optional(),
      codeHint: z.string().optional(),
    })).describe('Step-by-step implementation guide'),
    filesAffected: z.array(z.object({
      path: z.string(),
      action: z.enum(['modify', 'create', 'delete']),
      changes: z.string(),
    })).describe('Files that need to be changed'),
    testingGuidance: z.string().describe('How to test the fix'),
    additionalNotes: z.string().optional().describe('Any additional notes or considerations'),
  }),
  codeChanges: z.array(z.object({
    file: z.string().describe('File path'),
    lineStart: z.number().optional().describe('Starting line number'),
    lineEnd: z.number().optional().describe('Ending line number'),
    currentCode: z.string().optional().describe('Current code snippet'),
    proposedCode: z.string().describe('Proposed code change'),
    explanation: z.string().describe('Explanation of the change'),
  })).optional().describe('Specific code changes if identifiable'),
});

export type GitHubIssueData = z.infer<typeof GitHubIssueSchema>;

// Requirement Analysis Result - Stage 2 response
export const RequirementAnalysisResultSchema = z.object({
  feedbackId: z.string().describe('ID of the feedback item'),
  originalClassification: z.enum(['bug', 'feature', 'clarification']).describe('Original classification from Stage 1'),
  analysisOutcome: z.enum(['manual', 'automatic']).describe('Determined pipeline'),
  confidence: z.number().min(0).max(1).describe('Confidence in the analysis'),
  targetCompany: z.enum(['kiwi', 'slevomat']).describe('Company the feedback relates to'),
  codeFileAnalyzed: z.string().describe('Path of the code file that was analyzed'),

  // Only one of these will be populated based on analysisOutcome
  manualTicket: JiraManualTicketSchema.optional().describe('Jira ticket data (if outcome is manual)'),
  automaticIssue: GitHubIssueSchema.optional().describe('GitHub issue data (if outcome is automatic)'),

  reasoning: z.string().describe('Explanation of why this outcome was chosen'),
  rootCauseIdentified: z.boolean().describe('Whether the root cause was identified in code'),
  relatedBugReference: z.string().optional().describe('Reference to known bug if applicable'),
});

export type RequirementAnalysisResult = z.infer<typeof RequirementAnalysisResultSchema>;

// Batch Requirement Analysis Response
export const BatchRequirementAnalysisResponseSchema = z.object({
  results: z.array(RequirementAnalysisResultSchema),
  summary: z.object({
    totalProcessed: z.number(),
    movedToManual: z.number(),
    movedToAutomatic: z.number(),
    avgConfidence: z.number(),
    rootCausesFound: z.number(),
  }),
});

export type BatchRequirementAnalysisResponse = z.infer<typeof BatchRequirementAnalysisResponseSchema>;

// ============================================================================
// Common Types
// ============================================================================

// Processing status
export type AIProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

// AI Provider type
export type AIProvider = 'gemini' | 'claude';

// AI Processing state
export interface AIProcessingState {
  status: AIProcessingStatus;
  provider: AIProvider;
  selectedIds: Set<string>;
  results: Map<string, FeedbackAnalysisResult>;
  error?: string;
  progress?: {
    current: number;
    total: number;
  };
}

// Extended feedback item with AI analysis
export interface ProcessedFeedbackItem {
  id: string;
  originalFeedbackId: string;
  classification: FeedbackClassification;
  customerResponse: CustomerResponseData;
  jiraTicket?: JiraTicketData;
  processedAt: string;
  processedBy: AIProvider;
  confidence: number;
  tags: string[];
}

// Dataset feedback structure (matches dataset.json)
export interface DatasetFeedback {
  id: string;
  company: 'kiwi' | 'slevomat';
  channel: string;
  timestamp: string;
  customer: {
    name: string;
    handle?: string;
    email?: string;
    locale?: string;
    device?: string;
    followers?: number;
  };
  subject?: string;
  body?: string;
  conversation?: Array<{
    role: string;
    message: string;
  }>;
  tweet?: string;
  content?: string;
  review?: string;
  rating?: number;
  bug_reference: string;
  sentiment: string;
  priority: string;
  tags: string[];
  engagement?: {
    likes?: number;
    retweets?: number;
    replies?: number;
  };
}

// Feedback item for UI (transformed from dataset)
export interface UIFeedbackItem {
  id: string;
  company: 'kiwi' | 'slevomat';
  channel: string;
  timestamp: string;
  author: {
    name: string;
    handle?: string;
    email?: string;
    locale?: string;
    device?: string;
    followers?: number;
  };
  content: {
    subject?: string;
    body: string;
    excerpt?: string;
  };
  conversation?: Array<{
    role: 'customer' | 'agent';
    message: string;
  }>;
  rating?: number;
  bugReference: string;
  sentiment: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  engagement?: {
    likes?: number;
    retweets?: number;
    replies?: number;
  };
  // Selection state
  isSelected?: boolean;
  // AI processing result (Stage 1: Classification)
  aiResult?: FeedbackAnalysisResult;
  // AI processing result (Stage 2: Requirement Analysis)
  requirementResult?: RequirementAnalysisResult;
  // Processing state
  processingStatus?: AIProcessingStatus;
}

// Transform dataset feedback to UI format
export function transformDatasetFeedback(data: DatasetFeedback): UIFeedbackItem {
  const getContent = (): string => {
    if (data.body) return data.body;
    if (data.tweet) return data.tweet;
    if (data.review) return data.review;
    if (data.content) return data.content;
    if (data.conversation && data.conversation.length > 0) {
      return data.conversation.map(c => `${c.role}: ${c.message}`).join('\n');
    }
    return '';
  };

  const content = getContent();

  return {
    id: data.id,
    company: data.company,
    channel: data.channel,
    timestamp: data.timestamp,
    author: {
      name: data.customer.name,
      handle: data.customer.handle,
      email: data.customer.email,
      locale: data.customer.locale,
      device: data.customer.device,
      followers: data.customer.followers,
    },
    content: {
      subject: data.subject,
      body: content,
      excerpt: content.length > 150 ? content.substring(0, 150) + '...' : content,
    },
    conversation: data.conversation?.map(c => ({
      role: c.role === 'customer' ? 'customer' as const : 'agent' as const,
      message: c.message,
    })),
    rating: data.rating,
    bugReference: data.bug_reference,
    sentiment: data.sentiment,
    priority: data.priority as 'low' | 'medium' | 'high' | 'critical',
    tags: data.tags,
    engagement: data.engagement,
  };
}

// ============================================================================
// Markdown Generation Helpers
// ============================================================================

/**
 * Generate GitHub Issue markdown body from GitHubIssueData
 * This matches Claude Code requirement file format
 */
export function generateGitHubIssueMarkdown(issue: GitHubIssueData): string {
  const { body, codeChanges } = issue;

  let md = `# ${issue.title}\n\n`;

  // Labels
  if (issue.labels.length > 0) {
    md += `**Labels:** ${issue.labels.map(l => `\`${l}\``).join(', ')}\n\n`;
  }

  // Summary
  md += `## Summary\n\n${body.summary}\n\n`;

  // Context
  md += `## Context\n\n${body.context}\n\n`;

  // Technical Analysis
  md += `## Technical Analysis\n\n${body.technicalAnalysis}\n\n`;

  // Proposed Solution
  md += `## Proposed Solution\n\n${body.proposedSolution}\n\n`;

  // Implementation Steps
  md += `## Implementation Steps\n\n`;
  for (const step of body.implementationSteps) {
    md += `${step.step}. ${step.description}`;
    if (step.file) md += ` (\`${step.file}\`)`;
    md += '\n';
    if (step.codeHint) {
      md += `   > Hint: ${step.codeHint}\n`;
    }
  }
  md += '\n';

  // Files Affected
  md += `## Files Affected\n\n`;
  for (const file of body.filesAffected) {
    const actionIcon = file.action === 'modify' ? '~' : file.action === 'create' ? '+' : '-';
    md += `- \`${actionIcon}\` \`${file.path}\` - ${file.changes}\n`;
  }
  md += '\n';

  // Code Changes (if any)
  if (codeChanges && codeChanges.length > 0) {
    md += `## Code Changes\n\n`;
    for (const change of codeChanges) {
      md += `### \`${change.file}\``;
      if (change.lineStart) {
        md += ` (L${change.lineStart}${change.lineEnd ? `-${change.lineEnd}` : ''})`;
      }
      md += '\n\n';

      if (change.currentCode) {
        md += `**Current:**\n\`\`\`tsx\n${change.currentCode}\n\`\`\`\n\n`;
      }
      md += `**Proposed:**\n\`\`\`tsx\n${change.proposedCode}\n\`\`\`\n\n`;
      md += `*${change.explanation}*\n\n`;
    }
  }

  // Testing Guidance
  md += `## Testing\n\n${body.testingGuidance}\n\n`;

  // Additional Notes
  if (body.additionalNotes) {
    md += `## Notes\n\n${body.additionalNotes}\n`;
  }

  return md;
}

/**
 * Generate Jira ticket markdown from JiraManualTicketData
 */
export function generateJiraTicketMarkdown(ticket: JiraManualTicketData): string {
  let md = `# ${ticket.summary}\n\n`;

  // Metadata
  md += `**Type:** ${ticket.issueType.toUpperCase()} | `;
  md += `**Priority:** ${ticket.priority.toUpperCase()}\n\n`;

  // Labels & Components
  if (ticket.labels.length > 0) {
    md += `**Labels:** ${ticket.labels.map(l => `\`${l}\``).join(', ')}\n`;
  }
  if (ticket.components.length > 0) {
    md += `**Components:** ${ticket.components.join(', ')}\n`;
  }
  md += '\n';

  // Description
  md += `## Description\n\n${ticket.description}\n\n`;

  // Steps to Reproduce (for bugs)
  if (ticket.stepsToReproduce && ticket.stepsToReproduce.length > 0) {
    md += `## Steps to Reproduce\n\n`;
    ticket.stepsToReproduce.forEach((step, i) => {
      md += `${i + 1}. ${step}\n`;
    });
    md += '\n';
  }

  // Expected vs Actual
  if (ticket.expectedBehavior || ticket.actualBehavior) {
    md += `## Behavior\n\n`;
    if (ticket.expectedBehavior) {
      md += `**Expected:** ${ticket.expectedBehavior}\n\n`;
    }
    if (ticket.actualBehavior) {
      md += `**Actual:** ${ticket.actualBehavior}\n\n`;
    }
  }

  // Technical Context
  md += `## Technical Context\n\n${ticket.technicalContext}\n\n`;

  // Blockers
  if (ticket.blockers.length > 0) {
    md += `## Blockers / Missing Information\n\n`;
    ticket.blockers.forEach(blocker => {
      md += `- ${blocker}\n`;
    });
    md += '\n';
  }

  // Suggested Approach
  if (ticket.suggestedApproach) {
    md += `## Suggested Approach\n\n${ticket.suggestedApproach}\n\n`;
  }

  // Acceptance Criteria
  md += `## Acceptance Criteria\n\n`;
  ticket.acceptanceCriteria.forEach(ac => {
    md += `- [ ] ${ac}\n`;
  });

  return md;
}
