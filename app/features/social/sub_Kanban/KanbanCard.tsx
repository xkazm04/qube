'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { FeedbackItem } from '../lib/kanbanTypes';
import { CHANNEL_ICONS, PRIORITY_INDICATORS } from '../lib/kanbanTypes';
import { getTimeAgo } from '../lib/kanbanMockData';
import EmailCardContent from './cards/EmailCardContent';
import TwitterCardContent from './cards/TwitterCardContent';
import FacebookCardContent from './cards/FacebookCardContent';
import ChatCardContent from './cards/ChatCardContent';
import ReviewCardContent from './cards/ReviewCardContent';
import InstagramCardContent from './cards/InstagramCardContent';
import CardMenu from './CardMenu';

interface KanbanCardProps {
  item: FeedbackItem;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, item: FeedbackItem) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onClick?: (item: FeedbackItem) => void;
  onAction?: (action: string, item: FeedbackItem) => void;
}

export default function KanbanCard({
  item,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onClick,
  onAction,
}: KanbanCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    onDragStart?.(e, item);
  };

  const renderChannelContent = () => {
    switch (item.channel) {
      case 'email':
        return <EmailCardContent item={item} />;
      case 'twitter':
        return <TwitterCardContent item={item} />;
      case 'facebook':
        return <FacebookCardContent item={item} />;
      case 'support_chat':
        return <ChatCardContent item={item} />;
      case 'trustpilot':
      case 'app_store':
        return <ReviewCardContent item={item} />;
      case 'instagram':
        return <InstagramCardContent item={item} />;
      default:
        return <div className="text-sm text-[var(--color-text-secondary)]">{item.content.excerpt || item.content.body}</div>;
    }
  };

  const priorityBorderClass =
    item.priority === 'critical'
      ? 'border-l-[3px] border-l-[var(--color-error)]'
      : item.priority === 'high'
      ? 'border-l-[3px] border-l-[var(--color-warning)]'
      : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
    >
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onClick={() => onClick?.(item)}
        className={`
          relative group cursor-grab active:cursor-grabbing
          bg-[var(--color-surface)] border border-[var(--color-border-subtle)]
          rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]
          transition-all duration-150 min-h-[120px] max-h-[280px] overflow-hidden
          hover:border-[var(--color-border)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5
          ${priorityBorderClass}
          ${isDragging ? 'kanban-dragging' : ''}
        `}
      >
        <div className="p-3">
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-[var(--color-border-subtle)] mb-2.5">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
              <span className="text-sm">{CHANNEL_ICONS[item.channel]}</span>
              <span className="font-semibold capitalize">{item.channel.replace('_', ' ')}</span>
              <span className="text-[var(--color-text-muted)]">•</span>
              <span className="text-[var(--color-text-muted)]">{getTimeAgo(item.timestamp)}</span>
            </div>
            <span className="text-[10px]" title={`${item.priority} priority`}>
              {PRIORITY_INDICATORS[item.priority]}
            </span>
          </div>

          {/* Channel-specific content */}
          <div className="overflow-hidden">{renderChannelContent()}</div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-2.5 mt-2.5 border-t border-[var(--color-border-subtle)]">
            <div className="flex gap-2 flex-wrap">
              {item.analysis && (
                <span className="text-[11px] px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-accent-subtle)] text-[var(--color-text-primary)]">
                  {item.analysis.bugTag}
                </span>
              )}
              {item.analysis?.sentiment && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-[var(--radius-sm)] ${
                    ['angry', 'frustrated'].includes(item.analysis.sentiment)
                      ? 'bg-red-500/15 text-red-300'
                      : ['constructive', 'helpful'].includes(item.analysis.sentiment)
                      ? 'bg-green-500/15 text-green-300'
                      : 'bg-gray-500/15 text-gray-300'
                  }`}
                >
                  {item.analysis.sentiment === 'angry' && '😠'}
                  {item.analysis.sentiment === 'frustrated' && '😤'}
                  {item.analysis.sentiment === 'disappointed' && '😞'}
                  {item.analysis.sentiment === 'constructive' && '💡'}
                  {item.analysis.sentiment === 'helpful' && '🙂'}
                  {item.analysis.sentiment === 'mocking' && '😏'}
                  {item.analysis.sentiment === 'neutral' && '😐'}
                  {' '}{item.analysis.sentiment}
                </span>
              )}
            </div>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="px-2 py-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)] rounded-[var(--radius-sm)] text-base tracking-wider"
                aria-label="Card actions"
              >
                ···
              </button>
              {menuOpen && (
                <CardMenu
                  item={item}
                  onClose={() => setMenuOpen(false)}
                  onAction={(action) => {
                    onAction?.(action, item);
                    setMenuOpen(false);
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Resolved indicator */}
        {item.status === 'done' && item.resolvedBy && (
          <div className="absolute top-2 right-8 text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
            {item.resolvedBy === 'ai' ? '🤖' : '👨‍💻'} Resolved
          </div>
        )}
      </div>
    </motion.div>
  );
}
