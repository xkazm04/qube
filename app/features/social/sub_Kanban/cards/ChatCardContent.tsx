'use client';

import React, { useState } from 'react';
import type { FeedbackItem } from '../../lib/kanbanTypes';

interface ChatCardContentProps {
  item: FeedbackItem;
}

export default function ChatCardContent({ item }: ChatCardContentProps) {
  const [expanded, setExpanded] = useState(false);
  const conversation = item.conversation || [];
  const visibleMessages = expanded ? conversation : conversation.slice(0, 3);
  const hiddenCount = conversation.length - 3;

  return (
    <div className="space-y-2">
      {/* Customer info */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium text-[var(--color-text-primary)]">{item.author.name}</span>
        {item.author.device && (
          <span className="text-[var(--color-text-muted)]">• {item.author.device}</span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--color-border-subtle)]" />

      {/* Conversation thread */}
      <div className="space-y-2">
        {visibleMessages.map((msg, index) => (
          <div key={index} className="flex gap-2 text-xs leading-relaxed">
            <span className="flex-shrink-0">
              {msg.role === 'customer' ? '👤' : '🎧'}
            </span>
            <span
              className={
                msg.role === 'agent'
                  ? 'text-[var(--color-text-muted)] italic'
                  : 'text-[var(--color-text-primary)]'
              }
            >
              &quot;{msg.message}&quot;
            </span>
          </div>
        ))}
      </div>

      {/* Expand button */}
      {hiddenCount > 0 && !expanded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
          }}
          className="text-[11px] text-[var(--color-accent)] hover:underline"
        >
          +{hiddenCount} more messages
        </button>
      )}

      {expanded && hiddenCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(false);
          }}
          className="text-[11px] text-[var(--color-accent)] hover:underline"
        >
          Show less
        </button>
      )}
    </div>
  );
}
