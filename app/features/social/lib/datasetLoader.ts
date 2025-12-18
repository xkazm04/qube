// Dataset loader for feedback data from qube/data/dataset.json

import type { FeedbackItem, KanbanChannel, KanbanStatus, Sentiment, KanbanPriority } from './kanbanTypes';

// Dataset types matching the JSON structure
interface DatasetCustomer {
  name: string;
  handle?: string;
  email?: string;
  locale?: string;
  device?: string;
  followers?: number;
  platform?: string;
  bio?: string;
  verified_purchase?: boolean;
  location?: string;
  profile?: string;
  type?: string;
}

interface DatasetConversation {
  role: string;
  message: string;
  name?: string;
}

interface DatasetEngagement {
  likes?: number;
  retweets?: number;
  replies?: number;
  comments?: number;
  views?: number;
}

interface DatasetReactions {
  angry?: number;
  sad?: number;
  like?: number;
  haha?: number;
}

interface DatasetFeedbackItem {
  id: string;
  company: 'kiwi' | 'slevomat';
  channel: string;
  timestamp: string;
  customer: DatasetCustomer;
  conversation?: DatasetConversation[];
  subject?: string;
  body?: string;
  tweet?: string;
  content?: string;
  review?: string;
  title?: string;
  post_type?: string;
  rating?: number;
  app_version?: string;
  bug_reference: string;
  sentiment: string;
  priority: string;
  tags: string[];
  engagement?: DatasetEngagement;
  reactions?: DatasetReactions;
  replies?: DatasetConversation[];
  comments?: DatasetConversation[];
  dm_followup?: boolean;
  story_views?: number;
  poll_results?: Record<string, string>;
  original_post?: string;
  original_ad?: string;
  recommendation?: string;
}

interface Dataset {
  metadata: {
    description: string;
    companies: string[];
    channels: string[];
    generated_for: string;
    total_feedback_count: number;
  };
  feedback: DatasetFeedbackItem[];
  summary: {
    kiwi: object;
    slevomat: object;
  };
}

// Map dataset channel to KanbanChannel
function mapChannel(channel: string): KanbanChannel {
  const channelMap: Record<string, KanbanChannel> = {
    support_chat: 'support_chat',
    email: 'email',
    facebook: 'facebook',
    twitter: 'twitter',
    trustpilot: 'trustpilot',
    app_store_review: 'app_store',
    instagram: 'instagram',
  };
  return channelMap[channel] || 'email';
}

// Map dataset sentiment to Kanban Sentiment
function mapSentiment(sentiment: string): Sentiment {
  const sentimentMap: Record<string, Sentiment> = {
    frustrated: 'frustrated',
    disappointed: 'disappointed',
    angry: 'angry',
    mocking: 'mocking',
    confused: 'neutral',
    concerned: 'frustrated',
    constructive: 'constructive',
    patient: 'neutral',
    accusatory: 'angry',
    polite: 'helpful',
    helpful: 'helpful',
    suspicious: 'frustrated',
    formal: 'neutral',
    cooperative: 'constructive',
    light: 'neutral',
    understanding: 'constructive',
    fed_up: 'angry',
    hopeful: 'constructive',
    critical: 'disappointed',
    warning: 'disappointed',
    threatening: 'angry',
    friendly: 'helpful',
    balanced: 'neutral',
    urgent: 'frustrated',
    sarcastic: 'mocking',
    annoyed: 'frustrated',
    advocacy: 'constructive',
    professional: 'neutral',
    polite_frustrated: 'frustrated',
    helpful_warning: 'helpful',
    casual_frustrated: 'frustrated',
    frustrated_then_partially_satisfied: 'neutral',
    mild_frustration: 'frustrated',
  };
  return sentimentMap[sentiment] || 'neutral';
}

// Map dataset priority to KanbanPriority
function mapPriority(priority: string): KanbanPriority {
  const priorityMap: Record<string, KanbanPriority> = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'critical',
  };
  return priorityMap[priority] || 'medium';
}

// Get content from various possible sources in the dataset item
function getContent(item: DatasetFeedbackItem): { body: string; subject?: string; excerpt?: string } {
  let body = '';
  let subject = item.subject;

  if (item.body) {
    body = item.body;
  } else if (item.tweet) {
    body = item.tweet;
  } else if (item.review) {
    body = item.review;
  } else if (item.content) {
    body = item.content;
  } else if (item.conversation && item.conversation.length > 0) {
    // Combine conversation messages
    body = item.conversation
      .filter((c) => c.role === 'customer')
      .map((c) => c.message)
      .join('\n\n');
  }

  const excerpt = body.length > 150 ? body.substring(0, 150) + '...' : body;

  return { body, subject, excerpt };
}

// Transform dataset feedback to FeedbackItem
export function transformDatasetToFeedbackItem(
  item: DatasetFeedbackItem,
  index: number
): FeedbackItem {
  const content = getContent(item);

  // Distribute items across statuses based on index for demo purposes
  const statusDistribution: KanbanStatus[] = ['new', 'new', 'new', 'analyzed', 'analyzed', 'manual', 'automatic', 'done'];
  const status = statusDistribution[index % statusDistribution.length];

  const feedbackItem: FeedbackItem = {
    id: item.id,
    company: item.company,
    channel: mapChannel(item.channel),
    timestamp: item.timestamp,
    status,
    priority: mapPriority(item.priority),
    author: {
      name: item.customer.name,
      handle: item.customer.handle,
      email: item.customer.email,
      locale: item.customer.locale,
      device: item.customer.device,
      followers: item.customer.followers,
      verified: item.customer.verified_purchase,
    },
    content: {
      subject: content.subject,
      body: content.body,
      excerpt: content.excerpt,
    },
    conversation: item.conversation?.map((c) => ({
      role: c.role === 'customer' ? 'customer' as const : 'agent' as const,
      message: c.message,
    })),
    rating: item.rating,
    tags: item.tags,
    platform: item.customer.platform === 'ios' ? 'ios' : item.customer.platform === 'android' ? 'android' : undefined,
    appVersion: item.app_version,
    contextType: item.post_type,
  };

  // Add engagement if available
  if (item.engagement) {
    feedbackItem.engagement = {
      likes: item.engagement.likes,
      retweets: item.engagement.retweets,
      replies: item.engagement.replies,
      views: item.engagement.views,
    };
  }

  // Add analysis for items that aren't 'new'
  if (status !== 'new') {
    feedbackItem.analysis = {
      bugId: item.bug_reference,
      bugTag: item.bug_reference.replace('BUG_', '').replace(/_/g, ' '),
      sentiment: mapSentiment(item.sentiment),
      suggestedPipeline: mapPriority(item.priority) === 'critical' ? 'manual' : 'automatic',
      confidence: 0.85 + Math.random() * 0.15,
    };
  }

  // Mark resolved items
  if (status === 'done') {
    feedbackItem.resolvedAt = new Date().toISOString();
    feedbackItem.resolvedBy = Math.random() > 0.5 ? 'ai' : 'human';
  }

  return feedbackItem;
}

// Load and transform dataset
export async function loadDataset(): Promise<FeedbackItem[]> {
  try {
    // In client-side, fetch from API
    const response = await fetch('/api/dataset');
    if (!response.ok) {
      throw new Error('Failed to load dataset');
    }
    const data: Dataset = await response.json();
    return data.feedback.map((item, index) => transformDatasetToFeedbackItem(item, index));
  } catch (error) {
    console.error('Error loading dataset:', error);
    return [];
  }
}

// Static dataset for SSR/initial render
// This will be populated from the actual dataset.json on import
export const DATASET_FEEDBACK: DatasetFeedbackItem[] = [];
