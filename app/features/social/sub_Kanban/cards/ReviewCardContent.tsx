'use client';

import React, { useState } from 'react';
import type { FeedbackItem } from '../../lib/kanbanTypes';

interface ReviewCardContentProps {
  item: FeedbackItem;
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5 text-xs" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < rating ? 'star-filled' : 'text-[var(--color-text-muted)]'}>
          {i < rating ? '★' : '☆'}
        </span>
      ))}
      <span className="ml-1.5 text-[var(--color-text-secondary)] text-[11px]">({rating}/{max})</span>
    </div>
  );
}

export default function ReviewCardContent({ item }: ReviewCardContentProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      {/* Author and rating row */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-medium text-[var(--color-text-primary)]">
            {item.author.name}
          </div>
          {item.author.verified && (
            <span className="text-[10px] text-green-400">✓ Verified Purchase</span>
          )}
        </div>
        {item.rating !== undefined && <StarRating rating={item.rating} />}
      </div>

      {/* Platform/version info for app store */}
      {item.channel === 'app_store' && (
        <div className="text-[10px] text-[var(--color-text-muted)]">
          {item.platform === 'ios' ? '🍎 iOS' : '🤖 Android'} • {item.appVersion}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-[var(--color-border-subtle)]" />

      {/* Review title */}
      {item.content.subject && (
        <div className="text-xs font-medium text-[var(--color-text-primary)]">
          &quot;{item.content.subject}&quot;
        </div>
      )}

      {/* Review body */}
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
