'use client';

import React from 'react';
import type { FeedbackItem } from '../../lib/kanbanTypes';

interface FacebookCardContentProps {
  item: FeedbackItem;
}

export default function FacebookCardContent({ item }: FacebookCardContentProps) {
  const reactions = item.engagement?.reactions;

  return (
    <div className="space-y-2">
      {/* Author name */}
      <div className="text-sm font-medium text-[var(--color-text-primary)]">
        {item.author.name}
      </div>

      {/* Context type */}
      {item.contextType && (
        <div className="text-xs text-[var(--color-text-muted)]">{item.contextType}</div>
      )}

      {/* Divider */}
      <div className="border-t border-[var(--color-border-subtle)]" />

      {/* Content */}
      <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
        &quot;{item.content.body}&quot;
      </div>

      {/* Reactions */}
      {reactions && Object.keys(reactions).length > 0 && (
        <div className="flex gap-3 pt-2 text-xs text-[var(--color-text-secondary)]">
          {reactions.angry !== undefined && reactions.angry > 0 && (
            <span title="Angry">😠 {reactions.angry}</span>
          )}
          {reactions.haha !== undefined && reactions.haha > 0 && (
            <span title="Haha">😆 {reactions.haha}</span>
          )}
          {reactions.sad !== undefined && reactions.sad > 0 && (
            <span title="Sad">😢 {reactions.sad}</span>
          )}
          {reactions.like !== undefined && reactions.like > 0 && (
            <span title="Like">👍 {reactions.like}</span>
          )}
          {reactions.love !== undefined && reactions.love > 0 && (
            <span title="Love">❤️ {reactions.love}</span>
          )}
        </div>
      )}
    </div>
  );
}
