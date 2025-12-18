'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bug,
  Lightbulb,
  MessageCircle,
  Facebook,
  Mail,
  ChevronDown,
  ChevronUp,
  Ticket,
  Send,
  Check,
  Clock,
  FileCode,
} from 'lucide-react';

// Custom X (formerly Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
import type { EvaluatedFeedback } from '../lib/types';
import {
  iconClass,
  opacityClass,
  priorityDot as priorityDotColors,
  card,
  radius,
  transition,
} from '@/app/lib/design-tokens';

interface CompactFeedbackItemProps {
  feedback: EvaluatedFeedback;
  index: number;
  onCreateTicket: (feedbackId: string) => void;
  onSendReply: (feedbackId: string) => void;
  onViewTicket?: (feedback: EvaluatedFeedback) => void;
  onViewRequirement?: (feedback: EvaluatedFeedback) => void;
  isCreatingTicket?: boolean;
  isSendingReply?: boolean;
}

// Using design tokens for consistent styling
const categoryConfig = {
  bug: { icon: Bug, color: 'text-red-400', bg: `bg-red-500${opacityClass.subtle}`, dot: 'bg-red-400' },
  proposal: { icon: Lightbulb, color: 'text-amber-400', bg: `bg-amber-500${opacityClass.subtle}`, dot: 'bg-amber-400' },
  feedback: { icon: MessageCircle, color: 'text-emerald-400', bg: `bg-emerald-500${opacityClass.subtle}`, dot: 'bg-emerald-400' },
};

const channelIcons = {
  facebook: Facebook,
  x: XIcon,
  email: Mail,
};

// Using design token for priority colors
const priorityDots = priorityDotColors;

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}

export default function CompactFeedbackItem({
  feedback,
  index,
  onCreateTicket,
  onSendReply,
  onViewTicket,
  onViewRequirement,
  isCreatingTicket,
  isSendingReply,
}: CompactFeedbackItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTicketClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewTicket && feedback.ticket) {
      onViewTicket(feedback);
    }
  };

  const handleRequirementClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewRequirement) {
      onViewRequirement(feedback);
    }
  };

  const category = categoryConfig[feedback.category];
  const CategoryIcon = category.icon;
  const ChannelIcon = channelIcons[feedback.channel];
  const priorityDotColor = priorityDots[feedback.priority];

  const hasTicket = !!feedback.ticket;
  const hasReply = !!feedback.reply;
  const replySent = feedback.reply?.status === 'sent';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`${radius.lg} border ${card.border} ${card.bg} hover:${card.bgElevated} ${transition.colors}`}
      data-testid={`feedback-item-${feedback.originalFeedbackId}`}
    >
      {/* Collapsed view */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className="w-full px-3 py-2.5 flex items-center gap-3 text-left cursor-pointer"
      >
        {/* Priority + Category indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${priorityDotColor}`} />
          <div className={`p-1.5 ${radius.sm} ${category.bg}`}>
            <CategoryIcon className={`${iconClass.sm} ${category.color}`} />
          </div>
        </div>

        {/* Summary */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-200 truncate">
            {feedback.summary}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
            <ChannelIcon className={iconClass.xs} />
            <span className="truncate">{feedback.author}</span>
            <span>•</span>
            <span>{formatTimeAgo(feedback.timestamp)}</span>
          </div>
        </div>

        {/* Action indicators */}
        <div className="flex items-center gap-2">
          {/* Bug category - show requirement icon */}
          {feedback.category === 'bug' && (
            <button
              onClick={handleRequirementClick}
              className={`flex items-center gap-1 px-2 py-1 ${radius.sm} bg-blue-500${opacityClass.subtle} hover:bg-blue-500${opacityClass.default} text-blue-400 ${transition.colors}`}
              title="View Claude Code requirement"
              data-testid={`feedback-req-btn-${feedback.originalFeedbackId}`}
            >
              <FileCode className={iconClass.xs} />
              <span className="text-xs">REQ</span>
            </button>
          )}

          {/* Ticket - clickable */}
          {hasTicket && (
            <button
              onClick={handleTicketClick}
              className={`flex items-center gap-1 px-2 py-1 ${radius.sm} bg-purple-500${opacityClass.subtle} hover:bg-purple-500${opacityClass.default} text-purple-400 ${transition.colors}`}
              title="View Jira ticket"
              data-testid={`feedback-ticket-btn-${feedback.originalFeedbackId}`}
            >
              <Ticket className={iconClass.xs} />
              <span className="text-xs font-mono">{feedback.ticket?.key}</span>
            </button>
          )}

          {replySent && (
            <div className={`p-1 ${radius.sm} bg-emerald-500${opacityClass.subtle}`}>
              <Check className={`${iconClass.xs} text-emerald-400`} />
            </div>
          )}
          {hasReply && !replySent && (
            <div className={`p-1 ${radius.sm} bg-amber-500${opacityClass.subtle}`}>
              <Clock className={`${iconClass.xs} text-amber-400`} />
            </div>
          )}

          {/* Expand icon */}
          <div className="text-gray-400">
            {isExpanded ? (
              <ChevronUp className={iconClass.md} />
            ) : (
              <ChevronDown className={iconClass.md} />
            )}
          </div>
        </div>
      </div>

      {/* Expanded view */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 space-y-3 border-t border-gray-700/30">
              {/* Original message */}
              <div className="text-xs">
                <div className="text-gray-400 mb-1">Original message:</div>
                <div className="text-gray-300 bg-gray-900/40 rounded p-2">
                  {feedback.content}
                </div>
              </div>

              {/* Suggested action */}
              <div className="text-xs">
                <div className="text-gray-400 mb-1">Suggested action:</div>
                <div className="text-gray-300">{feedback.suggestedAction}</div>
              </div>

              {/* Ticket details */}
              {feedback.ticket && (
                <div className={`p-2 ${radius.sm} bg-purple-500${opacityClass.subtle} border border-purple-500${opacityClass.default}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Ticket className={`${iconClass.sm} text-purple-400`} />
                    <span className="text-xs font-medium text-purple-300">
                      {feedback.ticket.key}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 ${radius.sm} bg-gray-700/50 text-gray-400`}>
                      {feedback.ticket.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300">{feedback.ticket.title}</div>
                </div>
              )}

              {/* Reply details */}
              {feedback.reply && (
                <div className={`p-2 ${radius.sm} bg-blue-500${opacityClass.subtle} border border-blue-500${opacityClass.default}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Send className={`${iconClass.sm} text-blue-400`} />
                    <span className="text-xs font-medium text-blue-300">Reply</span>
                    <span className={`text-[10px] px-1.5 py-0.5 ${radius.sm} ${
                      feedback.reply.status === 'sent'
                        ? `bg-emerald-500${opacityClass.default} text-emerald-400`
                        : 'bg-gray-700/50 text-gray-400'
                    }`}>
                      {feedback.reply.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300">{feedback.reply.content}</div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                {!hasTicket && (feedback.category === 'bug' || feedback.category === 'proposal') && (
                  <button
                    onClick={() => onCreateTicket(feedback.originalFeedbackId)}
                    disabled={isCreatingTicket}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 ${radius.sm} bg-purple-500${opacityClass.default} hover:bg-purple-500${opacityClass.moderate} text-purple-300 text-xs font-medium ${transition.colors} disabled:opacity-50`}
                    data-testid={`feedback-create-ticket-btn-${feedback.originalFeedbackId}`}
                  >
                    <Ticket className={iconClass.sm} />
                    Create Ticket
                  </button>
                )}
                {!replySent && (
                  <button
                    onClick={() => onSendReply(feedback.originalFeedbackId)}
                    disabled={isSendingReply}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 ${radius.sm} bg-blue-500${opacityClass.default} hover:bg-blue-500${opacityClass.moderate} text-blue-300 text-xs font-medium ${transition.colors} disabled:opacity-50`}
                    data-testid={`feedback-send-reply-btn-${feedback.originalFeedbackId}`}
                  >
                    <Send className={iconClass.sm} />
                    Send Reply
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
