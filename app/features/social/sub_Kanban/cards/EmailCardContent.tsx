'use client';

import React, { useState } from 'react';
import type { FeedbackItem } from '../../lib/kanbanTypes';

interface EmailCardContentProps {
  item: FeedbackItem;
}

export default function EmailCardContent({ item }: EmailCardContentProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      {/* From */}
      <div className="text-xs text-[var(--color-text-secondary)]">
        <span className="text-[var(--color-text-muted)]">From: </span>
        <span className="text-[var(--color-text-primary)]">{item.author.name}</span>
      </div>

      {/* Subject */}
      {item.content.subject && (
        <div className="text-sm font-medium text-[var(--color-text-primary)]">
          {item.content.subject}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-[var(--color-border-subtle)]" />

      {/* Body excerpt */}
      <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
        {expanded ? (
          <span>&quot;{item.content.body}&quot;</span>
        ) : (
          <span>&quot;{item.content.excerpt || item.content.body.substring(0, 100)}...&quot;</span>
        )}
      </div>

      {/* Read more */}
      {item.content.body.length > 100 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="text-[11px] text-[var(--color-accent)] hover:underline"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
