// Kanban Board Types

export type KanbanChannel =
  | 'email'
  | 'twitter'
  | 'facebook'
  | 'support_chat'
  | 'trustpilot'
  | 'app_store'
  | 'instagram';

export type KanbanStatus = 'new' | 'analyzed' | 'manual' | 'automatic' | 'done';

export type KanbanPriority = 'low' | 'medium' | 'high' | 'critical';

export type Sentiment =
  | 'angry'
  | 'frustrated'
  | 'disappointed'
  | 'neutral'
  | 'constructive'
  | 'helpful'
  | 'mocking';

export interface FeedbackAuthor {
  name: string;
  handle?: string;
  email?: string;
  followers?: number;
  verified?: boolean;
  locale?: string;
  device?: string;
}

export interface FeedbackContent {
  subject?: string;
  body: string;
  excerpt?: string;
  translation?: string;
}

export interface FeedbackEngagement {
  likes?: number;
  retweets?: number;
  replies?: number;
  reactions?: Record<string, number>;
  views?: number;
}

export interface ConversationMessage {
  role: 'customer' | 'agent';
  message: string;
}

export interface FeedbackAnalysis {
  bugId: string;
  bugTag: string;
  sentiment: Sentiment;
  suggestedPipeline: 'manual' | 'automatic';
  confidence: number;
}

export interface FeedbackItem {
  id: string;
  company: 'kiwi' | 'slevomat';
  channel: KanbanChannel;
  timestamp: string;
  status: KanbanStatus;
  priority: KanbanPriority;
  author: FeedbackAuthor;
  content: FeedbackContent;
  engagement?: FeedbackEngagement;
  conversation?: ConversationMessage[];
  rating?: number;
  analysis?: FeedbackAnalysis;
  tags: string[];
  linkedTickets?: string[];
  resolvedAt?: string;
  resolvedBy?: 'human' | 'ai';
  contextType?: string;
  appVersion?: string;
  platform?: 'ios' | 'android';
}

export interface KanbanColumn {
  id: KanbanStatus;
  title: string;
  subtitle: string;
  icon: string;
  acceptsFrom: KanbanStatus[];
  maxItems: number | null;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'new',
    title: 'New',
    subtitle: 'Incoming feedback',
    icon: '📥',
    acceptsFrom: [],
    maxItems: null,
  },
  {
    id: 'analyzed',
    title: 'Analyzed',
    subtitle: 'Triaged & categorized',
    icon: '🔍',
    acceptsFrom: ['new'],
    maxItems: null,
  },
  {
    id: 'manual',
    title: 'Manual',
    subtitle: 'Human dev pipeline',
    icon: '👨‍💻',
    acceptsFrom: ['analyzed'],
    maxItems: 10,
  },
  {
    id: 'automatic',
    title: 'Automatic',
    subtitle: 'AI agent pipeline',
    icon: '🤖',
    acceptsFrom: ['analyzed'],
    maxItems: 5,
  },
  {
    id: 'done',
    title: 'Done',
    subtitle: 'Resolved',
    icon: '✅',
    acceptsFrom: ['manual', 'automatic'],
    maxItems: null,
  },
];

export const CHANNEL_ICONS: Record<KanbanChannel, string> = {
  email: '📧',
  twitter: '🐦',
  facebook: '📘',
  support_chat: '💬',
  trustpilot: '⭐',
  app_store: '📱',
  instagram: '📸',
};

export const PRIORITY_COLORS: Record<KanbanPriority, string> = {
  low: 'text-gray-400',
  medium: 'text-blue-400',
  high: 'text-yellow-400',
  critical: 'text-red-400',
};

export const PRIORITY_INDICATORS: Record<KanbanPriority, string> = {
  low: '🟢',
  medium: '🔵',
  high: '🟡',
  critical: '🔴',
};
