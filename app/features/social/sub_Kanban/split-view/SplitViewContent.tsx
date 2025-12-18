'use client';

import {
  Search,
  UserCog,
  Bot,
  CheckCircle,
  RotateCcw,
  Ticket,
  MessageCircle,
  Share2,
  type LucideIcon,
} from 'lucide-react';
import type { FeedbackItem } from '../../lib/kanbanTypes';
import { getTimeAgo } from '../../lib/kanbanMockData';
import { SLABadge } from '../sla';
import {
  SentimentBadge,
  PriorityBadge,
  ConfidenceBadge,
  SENTIMENT_ICONS,
} from '../lib/sentimentUtils';

interface SplitViewContentProps {
  item: FeedbackItem;
  onAction: (action: string) => void;
}

export function SplitViewContent({ item, onAction }: SplitViewContentProps) {
  const getActionButtons = (): { id: string; label: string; icon: LucideIcon; primary: boolean }[] => {
    switch (item.status) {
      case 'new':
        return [{ id: 'analyze', label: 'Run Analysis', icon: Search, primary: true }];
      case 'analyzed':
        return [
          { id: 'assign-manual', label: 'Manual', icon: UserCog, primary: false },
          { id: 'assign-auto', label: 'AI Agent', icon: Bot, primary: true },
        ];
      case 'manual':
      case 'automatic':
        return [{ id: 'mark-done', label: 'Done', icon: CheckCircle, primary: true }];
      case 'done':
        return [{ id: 'reopen', label: 'Reopen', icon: RotateCcw, primary: false }];
      default:
        return [];
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-4 space-y-4">
        {/* Top indicators row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <SLABadge item={item} />
            <PriorityBadge priority={item.priority} />
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">
            {getTimeAgo(item.timestamp)}
          </span>
        </div>

        {/* Sentiment and Confidence badges */}
        {item.analysis && (
          <div className="flex items-center gap-2 flex-wrap">
            <SentimentBadge sentiment={item.analysis.sentiment} />
            <ConfidenceBadge confidence={item.analysis.confidence} />
          </div>
        )}

        {/* Content */}
        <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 border border-[var(--color-border-subtle)]">
          {item.content.subject && (
            <h3 className="font-medium text-[var(--color-text-primary)] mb-2">
              {item.content.subject}
            </h3>
          )}
          <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">
            {item.content.body}
          </p>

          {/* Engagement (for social channels) */}
          {item.engagement && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
              {item.engagement.replies !== undefined && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <MessageCircle className="w-3 h-3" /> {item.engagement.replies}
                </span>
              )}
              {item.engagement.retweets !== undefined && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <Share2 className="w-3 h-3" /> {item.engagement.retweets}
                </span>
              )}
              {item.engagement.likes !== undefined && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  ❤️ {item.engagement.likes}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Status info */}
        <div className="p-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]">
          <div className="text-[10px] text-[var(--color-text-muted)] uppercase mb-1">Status</div>
          <div className="text-sm font-medium capitalize text-[var(--color-text-primary)]">
            {item.status}
          </div>
        </div>

        {/* AI Analysis */}
        {item.analysis && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-medium text-blue-400">AI Analysis</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Classification</span>
                <span className="text-[var(--color-text-primary)]">{item.analysis.bugTag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Pipeline</span>
                <span className="text-[var(--color-text-primary)] capitalize">
                  {item.analysis.suggestedPipeline}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--color-surface-elevated)]
                  text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions footer */}
      <div className="sticky bottom-0 p-3 border-t border-[var(--color-border)]
        bg-[var(--color-surface)] flex items-center justify-between gap-2">
        <button
          onClick={() => onAction('link-jira')}
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]
            hover:bg-[var(--color-surface-elevated)] rounded transition-colors"
          title="Link Jira"
        >
          <Ticket className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          {getActionButtons().map(btn => {
            const BtnIcon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => onAction(btn.id)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium flex items-center gap-1.5
                  transition-colors ${
                    btn.primary
                      ? 'bg-[var(--color-accent)] text-white hover:opacity-90'
                      : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
                  }`}
              >
                <BtnIcon className="w-3.5 h-3.5" />
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SplitViewContent;
