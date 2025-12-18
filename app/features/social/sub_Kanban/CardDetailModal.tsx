'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Facebook,
  MessageCircle,
  Star,
  Smartphone,
  Instagram,
  Share2,
  Search,
  UserCog,
  Bot,
  CheckCircle,
  RotateCcw,
  Ticket,
  type LucideIcon,
} from 'lucide-react';
import { useFocusTrap } from '../lib/useFocusTrap';

// Custom X (formerly Twitter) icon component
const XIcon = (({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)) as unknown as LucideIcon;
import type { FeedbackItem, KanbanChannel } from '../lib/kanbanTypes';
import { PRIORITY_DOT_COLORS } from '../lib/kanbanTypes';
import { getTimeAgo } from '../lib/kanbanMockData';
import { SLABadge } from './sla';
import {
  SentimentBadge,
  PriorityBadge,
  ConfidenceBadge,
} from './lib/sentimentUtils';

// Channel icon component map
const ChannelIcon: Record<KanbanChannel, LucideIcon> = {
  email: Mail,
  x: XIcon,
  facebook: Facebook,
  support_chat: MessageCircle,
  trustpilot: Star,
  app_store: Smartphone,
  instagram: Instagram,
};

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
  const [mounted, setMounted] = useState(false);

  const focusTrapRef = useFocusTrap<HTMLDivElement>({
    isActive: isOpen && mounted && item !== null,
    onEscape: onClose,
    autoFocusSelector: '[data-testid="card-detail-close-btn"]',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !item) return null;

  const getActionButtons = () => {
    switch (item.status) {
      case 'new':
        return [
          { id: 'analyze', label: 'Run Analysis', icon: Search, primary: true },
        ];
      case 'analyzed':
        return [
          { id: 'assign-manual', label: 'Move to Manual', icon: UserCog, primary: false },
          { id: 'assign-auto', label: 'Send to AI Agent', icon: Bot, primary: true },
        ];
      case 'manual':
      case 'automatic':
        return [
          { id: 'mark-done', label: 'Mark as Done', icon: CheckCircle, primary: true },
        ];
      case 'done':
        return [
          { id: 'reopen', label: 'Reopen', icon: RotateCcw, primary: false },
        ];
      default:
        return [];
    }
  };

  const renderChannelSpecificContent = () => {
    switch (item.channel) {
      case 'email':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {item.content.subject || '(No Subject)'}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.author.name}</span>
                    <span>&lt;{item.author.email}&gt;</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="p-6 text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed font-serif text-base">
              {item.content.body}
            </div>
          </div>
        );

      case 'x':
        return (
          <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 p-4 max-w-xl mx-auto shadow-sm">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-lg">
                  {item.author.name.charAt(0)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 truncate">
                    <span className="font-bold text-gray-900 dark:text-white truncate">{item.author.name}</span>
                    <span className="text-gray-500 dark:text-gray-400 truncate">{item.author.handle}</span>
                    <span className="text-gray-500 dark:text-gray-400 mx-1">·</span>
                    <span className="text-gray-500 dark:text-gray-400 hover:underline cursor-pointer">
                      {getTimeAgo(item.timestamp)}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>
                  </div>
                </div>
                <div className="mt-1 text-gray-900 dark:text-white text-[15px] leading-normal whitespace-pre-wrap">
                  {item.content.body}
                </div>
                <div className="mt-3 flex items-center justify-between text-gray-500 dark:text-gray-400 max-w-md">
                  <div className="flex items-center gap-2 group cursor-pointer hover:text-gray-300">
                    <MessageCircle className="w-4 h-4 group-hover:bg-gray-500/10 rounded-full p-0.5 box-content transition-colors" />
                    <span className="text-xs">{item.engagement?.replies || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 group cursor-pointer hover:text-green-500">
                    <Share2 className="w-4 h-4 group-hover:bg-green-500/10 rounded-full p-0.5 box-content transition-colors" />
                    <span className="text-xs">{item.engagement?.retweets || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 group cursor-pointer hover:text-pink-500">
                    <div className="group-hover:bg-pink-500/10 rounded-full p-0.5 box-content transition-colors">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><g><path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.66-2.73 2.864 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"></path></g></svg>
                    </div>
                    <span className="text-xs">{item.engagement?.likes || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'support_chat':
        return (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-[400px]">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                {item.author.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.author.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.author.device || 'Online'}</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
              {item.conversation?.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      msg.role === 'customer'
                        ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                        : 'bg-blue-500 text-white rounded-tr-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              )) || (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none">
                    {item.content.body}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-[var(--color-surface-elevated)] p-4 rounded-lg border border-[var(--color-border-subtle)]">
            <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
              {item.content.body}
            </div>
          </div>
        );
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none"
          >
            <div ref={focusTrapRef} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto" role="dialog" aria-modal="true" aria-labelledby="card-detail-modal-title">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-surface-elevated)]">
                    {(() => {
                      const IconComp = ChannelIcon[item.channel];
                      return <IconComp className="w-5 h-5 text-[var(--color-text-secondary)]" />;
                    })()}
                  </div>
                  <div>
                    <h2 id="card-detail-modal-title" className="text-base font-semibold text-[var(--color-text-primary)] capitalize flex items-center gap-2">
                      {item.channel.replace('_', ' ')} Feedback
                      <PriorityBadge priority={item.priority} />
                    </h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[var(--color-surface-elevated)] rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                  aria-label="Close modal"
                  data-testid="card-detail-close-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[var(--color-surface)]">
                {/* Channel Specific View */}
                {renderChannelSpecificContent()}

                {/* Criticality Indicators */}
                <div className="flex items-center gap-3 flex-wrap">
                  <SLABadge item={item} />
                  <PriorityBadge priority={item.priority} size="md" />
                  {item.analysis && (
                    <>
                      <SentimentBadge sentiment={item.analysis.sentiment} size="md" />
                      <ConfidenceBadge confidence={item.analysis.confidence} size="md" />
                    </>
                  )}
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]">
                    <div className="text-xs text-[var(--color-text-muted)] mb-1">Status</div>
                    <div className="font-medium capitalize text-[var(--color-text-primary)]">{item.status}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]">
                    <div className="text-xs text-[var(--color-text-muted)] mb-1">Classification</div>
                    <div className="font-medium text-[var(--color-text-primary)]">
                      {item.analysis?.bugTag || '-'}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]">
                    <div className="text-xs text-[var(--color-text-muted)] mb-1">Pipeline</div>
                    <div className="font-medium capitalize text-[var(--color-text-primary)]">
                      {item.analysis?.suggestedPipeline || '-'}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]">
                    <div className="text-xs text-[var(--color-text-muted)] mb-1">Bug ID</div>
                    <div className="font-medium font-mono text-xs text-[var(--color-text-primary)] truncate">
                      {item.analysis?.bugId || '-'}
                    </div>
                  </div>
                </div>

                {/* Analysis Results */}
                {item.analysis && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <h3 className="text-sm font-semibold text-blue-400">AI Analysis</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex gap-2">
                        <span className="text-[var(--color-text-muted)] min-w-[80px]">Classification:</span>
                        <span className="text-[var(--color-text-primary)]">{item.analysis.bugTag}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[var(--color-text-muted)] min-w-[80px]">Suggestion:</span>
                        <span className="text-[var(--color-text-primary)] capitalize">{item.analysis.suggestedPipeline} pipeline</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer with actions */}
              <div className="p-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] flex items-center justify-between gap-3">
                <button
                  onClick={() => onAction('link-jira')}
                  className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] rounded-[var(--radius-md)] transition-colors flex items-center gap-2"
                  data-testid="card-detail-link-jira-btn"
                >
                  <Ticket className="w-4 h-4" /> Link Jira Ticket
                </button>

                <div className="flex items-center gap-2">
                  {getActionButtons().map((btn) => {
                    const BtnIcon = btn.icon;
                    return (
                      <button
                        key={btn.id}
                        onClick={() => onAction(btn.id)}
                        className={`
                          px-4 py-2 text-sm rounded-[var(--radius-md)] transition-colors flex items-center gap-2 font-medium
                          ${
                            btn.primary
                              ? 'bg-[var(--color-accent)] text-white hover:opacity-90 shadow-lg shadow-[var(--color-accent)]/20'
                              : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] border border-[var(--color-border-subtle)]'
                          }
                        `}
                        data-testid={`card-detail-action-${btn.id}-btn`}
                      >
                        <BtnIcon className="w-4 h-4" /> {btn.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
