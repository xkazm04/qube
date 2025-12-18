'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { FeedbackItem } from '../lib/kanbanTypes';
import { CHANNEL_ICONS, PRIORITY_INDICATORS } from '../lib/kanbanTypes';
import { getTimeAgo } from '../lib/kanbanMockData';

interface CardDetailModalProps {
  isOpen: boolean;
  item: FeedbackItem | null;
  onClose: () => void;
  onAction: (action: string) => void;
}

export default function CardDetailModal({
  isOpen,
  item,
  onClose,
  onAction,
}: CardDetailModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!item) return null;

  const getActionButtons = () => {
    switch (item.status) {
      case 'new':
        return [
          { id: 'analyze', label: 'Run Analysis', icon: '🔍', primary: true },
        ];
      case 'analyzed':
        return [
          { id: 'assign-manual', label: 'Move to Manual', icon: '👨‍💻', primary: false },
          { id: 'assign-auto', label: 'Send to AI Agent', icon: '🤖', primary: true },
        ];
      case 'manual':
      case 'automatic':
        return [
          { id: 'mark-done', label: 'Mark as Done', icon: '✅', primary: true },
        ];
      case 'done':
        return [
          { id: 'reopen', label: 'Reopen', icon: '🔄', primary: false },
        ];
      default:
        return [];
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[80vh] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="text-lg">{CHANNEL_ICONS[item.channel]}</span>
                <h2 className="text-base font-semibold text-[var(--color-text-primary)] capitalize">
                  {item.channel.replace('_', ' ')} Feedback
                </h2>
                <span className="text-xs text-[var(--color-text-muted)]">
                  • {getTimeAgo(item.timestamp)}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-[var(--color-surface-elevated)] rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* Author info */}
              <div className="space-y-1">
                <div className="text-sm text-[var(--color-text-secondary)]">
                  <span className="text-[var(--color-text-muted)]">From: </span>
                  <span className="text-[var(--color-text-primary)] font-medium">
                    {item.author.name}
                    {item.author.handle && ` (${item.author.handle})`}
                    {item.author.email && ` <${item.author.email}>`}
                  </span>
                </div>
                {item.author.followers && (
                  <div className="text-xs text-[var(--color-text-muted)]">
                    Followers: {item.author.followers.toLocaleString()}
                  </div>
                )}
                {item.author.device && (
                  <div className="text-xs text-[var(--color-text-muted)]">
                    Device: {item.author.device}
                  </div>
                )}
              </div>

              {item.content.subject && (
                <div>
                  <div className="text-xs text-[var(--color-text-muted)] mb-1">Subject:</div>
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">
                    {item.content.subject}
                  </div>
                </div>
              )}

              <div className="border-t border-[var(--color-border-subtle)]" />

              <div>
                <div className="text-xs text-[var(--color-text-muted)] mb-2">Content:</div>
                <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap bg-[var(--color-surface-elevated)] p-3 rounded-[var(--radius-md)]">
                  {item.content.body}
                </div>
              </div>

              {item.content.translation && (
                <div>
                  <div className="text-xs text-[var(--color-text-muted)] mb-2">Translation:</div>
                  <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed italic border-l-2 border-[var(--color-accent)] pl-3">
                    {item.content.translation}
                  </div>
                </div>
              )}

              {item.conversation && item.conversation.length > 0 && (
                <div>
                  <div className="text-xs text-[var(--color-text-muted)] mb-2">Conversation:</div>
                  <div className="space-y-2 bg-[var(--color-surface-elevated)] p-3 rounded-[var(--radius-md)]">
                    {item.conversation.map((msg, index) => (
                      <div key={index} className="flex gap-2 text-sm">
                        <span>{msg.role === 'customer' ? '👤' : '🎧'}</span>
                        <span
                          className={
                            msg.role === 'agent'
                              ? 'text-[var(--color-text-muted)] italic'
                              : 'text-[var(--color-text-secondary)]'
                          }
                        >
                          {msg.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item.rating !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-text-muted)]">Rating:</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < item.rating! ? 'star-filled' : 'text-[var(--color-text-muted)]'}>
                        {i < item.rating! ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-[var(--color-border-subtle)]" />

              {item.analysis && (
                <div className="bg-[var(--color-accent-subtle)] p-3 rounded-[var(--radius-md)] space-y-2">
                  <div className="text-xs font-medium text-[var(--color-text-primary)]">
                    Analysis Results
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[var(--color-text-muted)]">Bug ID: </span>
                      <span className="text-[var(--color-text-primary)] font-mono">
                        {item.analysis.bugId}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted)]">Tag: </span>
                      <span className="text-[var(--color-text-primary)]">{item.analysis.bugTag}</span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted)]">Sentiment: </span>
                      <span className="text-[var(--color-text-primary)] capitalize">
                        {item.analysis.sentiment}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted)]">Suggested: </span>
                      <span className="text-[var(--color-text-primary)] capitalize">
                        {item.analysis.suggestedPipeline}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[var(--color-text-muted)]">Confidence: </span>
                      <span className="text-[var(--color-text-primary)]">
                        {(item.analysis.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-[var(--color-text-muted)]">Priority: </span>
                  <span className="text-[var(--color-text-primary)]">
                    {PRIORITY_INDICATORS[item.priority]} {item.priority}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)]">Status: </span>
                  <span className="text-[var(--color-text-primary)] capitalize">{item.status}</span>
                </div>
              </div>

              {item.linkedTickets && item.linkedTickets.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[var(--color-text-muted)]">Linked Tickets:</span>
                  <div className="flex gap-1">
                    {item.linkedTickets.map((ticket) => (
                      <span
                        key={ticket}
                        className="px-2 py-0.5 bg-[var(--color-surface-elevated)] text-[var(--color-accent)] rounded font-mono"
                      >
                        {ticket}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-[var(--color-text-muted)]">Tags:</span>
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with actions */}
            <div className="p-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3">
              <button
                onClick={() => onAction('link-jira')}
                className="px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] rounded-[var(--radius-md)] transition-colors flex items-center gap-2"
              >
                🎫 Create Jira Ticket
              </button>

              <div className="flex items-center gap-2">
                {getActionButtons().map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => onAction(btn.id)}
                    className={`
                      px-4 py-2 text-sm rounded-[var(--radius-md)] transition-colors flex items-center gap-2
                      ${
                        btn.primary
                          ? 'bg-[var(--color-accent)] text-white hover:opacity-90'
                          : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
                      }
                    `}
                  >
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
