'use client';

import React from 'react';
import type { FeedbackItem } from '../../lib/kanbanTypes';

interface TwitterCardContentProps {
  item: FeedbackItem;
}

function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export default function TwitterCardContent({ item }: TwitterCardContentProps) {
  const isViralRisk = (item.engagement?.likes || 0) > 100 || (item.engagement?.retweets || 0) > 50;

  return (
    <div className="space-y-2">
      {/* Handle and followers */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          {item.author.handle}
        </span>
        {item.author.followers && (
          <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
            {formatFollowers(item.author.followers)} <span className="text-[10px]">▼</span>
          </span>
        )}
      </div>

      {/* Tweet content */}
      <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
        &quot;{item.content.body}&quot;
      </div>

      {/* Engagement metrics */}
      {item.engagement && (
        <div className="flex gap-4 pt-2 border-t border-dashed border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)]">
          {item.engagement.likes !== undefined && (
            <span className="flex items-center gap-1" title="Likes">
              ❤️ {item.engagement.likes}
            </span>
          )}
          {item.engagement.retweets !== undefined && (
            <span className="flex items-center gap-1" title="Retweets">
              🔁 {item.engagement.retweets}
            </span>
          )}
          {item.engagement.replies !== undefined && (
            <span className="flex items-center gap-1" title="Replies">
              💬 {item.engagement.replies}
            </span>
          )}
        </div>
      )}

      {/* Viral risk indicator */}
      {isViralRisk && (
        <div className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded inline-block">
          📢 Viral Risk
        </div>
      )}
    </div>
  );
}
