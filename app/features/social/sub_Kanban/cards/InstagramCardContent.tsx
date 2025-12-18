'use client';

import React from 'react';
import type { FeedbackItem } from '../../lib/kanbanTypes';

interface InstagramCardContentProps {
  item: FeedbackItem;
}

function formatViews(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export default function InstagramCardContent({ item }: InstagramCardContentProps) {
  return (
    <div className="space-y-2">
      {/* Handle and followers */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          {item.author.handle}
        </span>
        {item.author.followers && (
          <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
            {formatViews(item.author.followers)} <span className="text-[10px]">▼</span>
          </span>
        )}
      </div>

      {/* Content type */}
      {item.contextType && (
        <div className="text-[10px] text-[var(--color-text-muted)]">
          📖 {item.contextType}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-[var(--color-border-subtle)]" />

      {/* Content */}
      <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
        &quot;{item.content.body}&quot;
      </div>

      {/* Translation if available */}
      {item.content.translation && (
        <div className="text-[10px] text-[var(--color-text-muted)] italic border-l-2 border-[var(--color-border-subtle)] pl-2">
          🌐 {item.content.translation}
        </div>
      )}

      {/* Views/engagement */}
      {item.engagement?.views && (
        <div className="flex gap-4 pt-2 border-t border-dashed border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1" title="Views">
            👁️ {formatViews(item.engagement.views)} views
          </span>
        </div>
      )}
    </div>
  );
}
