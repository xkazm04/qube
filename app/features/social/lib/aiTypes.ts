// AI Processing Types for Feedback Analysis

import { z } from 'zod';

// Feedback classification type
export type FeedbackClassification = 'bug' | 'feature' | 'clarification';

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
  // AI processing result
  aiResult?: FeedbackAnalysisResult;
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
