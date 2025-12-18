'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Facebook,
  MessageCircle,
  Star,
  Smartphone,
  Instagram,
  MoreHorizontal,
  Frown,
  Meh,
  ThumbsUp,
  Lightbulb,
  Bot,
  User,
  Loader2,
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
import type { FeedbackItem, KanbanChannel } from '../lib/kanbanTypes';
import { PRIORITY_DOT_COLORS } from '../lib/kanbanTypes';
import { getTimeAgo } from '../lib/kanbanMockData';
import type { FeedbackAnalysisResult, AIProcessingStatus } from '../lib/aiTypes';
import CardMenu from './CardMenu';
import { SLABadge } from './sla';
import {
  iconClass,
  opacityClass,
  radius,
  transition,
} from '@/app/lib/design-tokens';

// Channel icon component map
const ChannelIcon: Record<KanbanChannel, React.FC<{ className?: string }>> = {
  email: Mail,
  x: XIcon,
  facebook: Facebook,
  support_chat: MessageCircle,
  trustpilot: Star,
  app_store: Smartphone,
  instagram: Instagram,
};

interface KanbanCardProps {
  item: FeedbackItem;
  isDragging?: boolean;
  isSelected?: boolean;
  isProcessing?: boolean;
  processingStatus?: AIProcessingStatus;
  aiResult?: FeedbackAnalysisResult;
  onDragStart?: (e: React.DragEvent, item: FeedbackItem) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onClick?: (item: FeedbackItem) => void;
  onDoubleClick?: (item: FeedbackItem) => void;
  onRightClick?: (item: FeedbackItem, e: React.MouseEvent) => void;
  onAction?: (action: string, item: FeedbackItem) => void;
}

export default function KanbanCard({
  item,
  isDragging = false,
  isSelected = false,
  isProcessing = false,
  processingStatus,
  aiResult,
  onDragStart,
  onDragEnd,
  onClick,
  onDoubleClick,
  onRightClick,
  onAction,
}: KanbanCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    onDragStart?.(e, item);
  };

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onRightClick?.(item, e);
    },
    [item, onRightClick]
  );

  const Icon = ChannelIcon[item.channel];

  // Channel-specific card styles - using shadows instead of borders, border on selection
  const getChannelCardStyle = () => {
    const baseStyle = 'rounded-xl shadow-sm hover:shadow-md';
    switch (item.channel) {
      case 'email':
        return `${baseStyle} bg-white dark:bg-slate-900 shadow-blue-500/10 hover:shadow-blue-500/20`;
      case 'x':
        return `${baseStyle} bg-black shadow-gray-500/10 hover:shadow-gray-500/20`;
      case 'facebook':
        return `${baseStyle} bg-white dark:bg-[#242526] shadow-indigo-500/10 hover:shadow-indigo-500/20`;
      case 'support_chat':
        return `${baseStyle} bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 shadow-green-500/10 hover:shadow-green-500/20`;
      case 'trustpilot':
        return `${baseStyle} bg-[#00b67a]/5 dark:bg-[#00b67a]/10 shadow-emerald-500/10 hover:shadow-emerald-500/20`;
      case 'app_store':
        return `${baseStyle} bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 shadow-purple-500/10 hover:shadow-purple-500/20`;
      case 'instagram':
        return `${baseStyle} bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 shadow-pink-500/10 hover:shadow-pink-500/20`;
      default:
        return `${baseStyle} bg-white dark:bg-gray-900 shadow-gray-500/10 hover:shadow-gray-500/20`;
    }
  };

  // Get background icon color based on channel
  const getBackgroundIconColor = () => {
    switch (item.channel) {
      case 'email':
        return 'text-blue-500';
      case 'x':
        return 'text-gray-400';
      case 'facebook':
        return 'text-[#1877f2]';
      case 'support_chat':
        return 'text-green-500';
      case 'trustpilot':
        return 'text-[#00b67a]';
      case 'app_store':
        return 'text-purple-500';
      case 'instagram':
        return 'text-pink-500';
      default:
        return 'text-gray-400';
    }
  };

  // Channel-specific header styling
  const getChannelHeaderStyle = () => {
    switch (item.channel) {
      case 'x':
        return 'text-white';
      case 'email':
        return 'text-blue-600 dark:text-blue-400';
      case 'facebook':
        return 'text-[#1877f2]';
      case 'support_chat':
        return 'text-green-600 dark:text-green-400';
      case 'trustpilot':
        return 'text-[#00b67a]';
      case 'instagram':
        return 'text-pink-600 dark:text-pink-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'angry':
      case 'frustrated':
        return <Frown className={`${iconClass.xs} text-red-400`} />;
      case 'disappointed':
        return <Meh className={`${iconClass.xs} text-orange-400`} />;
      case 'constructive':
        return <Lightbulb className={`${iconClass.xs} text-green-400`} />;
      case 'helpful':
        return <ThumbsUp className={`${iconClass.xs} text-green-400`} />;
      default:
        return <Meh className={`${iconClass.xs} text-gray-400`} />;
    }
  };

  const renderChannelSpecificContent = () => {
    switch (item.channel) {
      case 'email':
        return (
          <div className="space-y-2">
            {item.content.subject && (
              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
                {item.content.subject}
              </div>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span>From:</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{item.author.name}</span>
            </div>
          </div>
        );

      case 'x':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">
                {item.author.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{item.author.name}</div>
                <div className="text-xs text-gray-500">{item.author.handle}</div>
              </div>
            </div>
            <div className="text-sm text-white/90 line-clamp-2">{item.content.body.substring(0, 100)}</div>
          </div>
        );

      case 'facebook':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1877f2] flex items-center justify-center text-white text-xs font-bold">
                {item.author.name.charAt(0)}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.author.name}</div>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
              {item.content.body.substring(0, 80)}
            </div>
          </div>
        );

      case 'support_chat':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live Chat</span>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg rounded-bl-none p-2 text-sm text-gray-800 dark:text-gray-200 shadow-sm border border-green-100 dark:border-green-900">
              {item.content.body.substring(0, 60)}...
            </div>
          </div>
        );

      case 'trustpilot':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < (item.rating || 3) ? 'fill-[#00b67a] text-[#00b67a]' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {item.content.body.substring(0, 80)}
            </div>
          </div>
        );

      case 'app_store':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < (item.rating || 3) ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-500">{item.appVersion}</span>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {item.content.body.substring(0, 80)}
            </div>
          </div>
        );

      case 'instagram':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold p-0.5">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-pink-500">
                    {item.author.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.author.handle || item.author.name}</div>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {item.content.body.substring(0, 80)}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {item.content.body.substring(0, 100)}
          </div>
        );
    }
  };

  const priorityBorderClass =
    item.priority === 'critical'
      ? 'ring-1 ring-red-500'
      : item.priority === 'high'
      ? 'ring-1 ring-yellow-500'
      : '';

  // Selection state styling - use border instead of ring, no checkmark
  const getSelectionClass = () => {
    if (isSelected) {
      return 'border-2 border-blue-500';
    }
    return 'border-2 border-transparent';
  };

  const getProcessingClass = () => {
    if (processingStatus === 'processing') {
      return 'opacity-70';
    }
    if (processingStatus === 'success' || aiResult) {
      return 'ring-1 ring-green-500/50';
    }
    if (processingStatus === 'error') {
      return 'ring-1 ring-red-500/50';
    }
    return '';
  };

  // Classification badge colors - using design tokens for consistent opacity
  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'bug':
        return `bg-red-500${opacityClass.default} text-red-300 border border-red-500${opacityClass.moderate}`;
      case 'feature':
        return `bg-blue-500${opacityClass.default} text-blue-300 border border-blue-500${opacityClass.moderate}`;
      case 'clarification':
        return `bg-yellow-500${opacityClass.default} text-yellow-300 border border-yellow-500${opacityClass.moderate}`;
      default:
        return `bg-gray-500${opacityClass.default} text-gray-300 border border-gray-500${opacityClass.moderate}`;
    }
  };

  const getBorderStyle = () => {
    return item.channel === 'x' ? 'border-gray-800' : 'border-gray-200 dark:border-gray-700';
  };

  return (
    <motion.div
      layout
      layoutId={item.id}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{
        layout: { type: 'spring', stiffness: 200, damping: 25, mass: 0.8 },
        default: { type: 'spring', stiffness: 300, damping: 30 },
      }}
    >
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onClick={() => onClick?.(item)}
        onDoubleClick={() => onDoubleClick?.(item)}
        onContextMenu={handleContextMenu}
        className={`
          relative group cursor-grab active:cursor-grabbing
          transition-all duration-200 overflow-hidden
          ${getChannelCardStyle()}
          ${priorityBorderClass}
          ${isDragging ? 'opacity-50 scale-105' : ''}
          ${getSelectionClass()}
          ${getProcessingClass()}
        `}
      >
        {/* Background channel icon - subtle watermark effect */}
        <div
          className={`absolute bottom-2 right-2 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-300 pointer-events-none ${getBackgroundIconColor()}`}
        >
          <Icon className="w-24 h-24" />
        </div>

        {/* Processing overlay */}
        <AnimatePresence>
          {processingStatus === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 bg-black${opacityClass.strong} z-20 flex items-center justify-center backdrop-blur-sm`}
            >
              <div className="flex flex-col items-center gap-2">
                <Loader2 className={`${iconClass.xl} text-blue-400 animate-spin`} />
                <span className="text-xs text-white font-medium">Analyzing...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-3 relative z-10">
          {/* Header */}
          <div className={`flex justify-between items-center pb-2 mb-2 border-b ${getBorderStyle()}`}>
            <div className={`flex items-center gap-1.5 text-xs ${getChannelHeaderStyle()}`}>
              <Icon className={iconClass.md} />
              <span className="font-semibold capitalize">{item.channel.replace('_', ' ')}</span>
              <span className={item.channel === 'x' ? 'text-gray-500' : 'text-gray-400'}>•</span>
              <span className={item.channel === 'x' ? 'text-gray-500' : 'text-gray-400'}>{getTimeAgo(item.timestamp)}</span>
            </div>
            <div className="flex items-center gap-2">
              <SLABadge item={item} compact />
              <div className={`w-2.5 h-2.5 rounded-full ${PRIORITY_DOT_COLORS[item.priority]}`} title={`${item.priority} priority`} />
            </div>
          </div>

          {/* Channel-specific content */}
          <div className="overflow-hidden">{renderChannelSpecificContent()}</div>

          {/* AI Result Section */}
          <AnimatePresence>
            {aiResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-2 pt-2 border-t ${getBorderStyle()}`}
              >
                {/* AI Generated Title */}
                {aiResult.title && (
                  <div className={`text-sm font-semibold mb-2 ${item.channel === 'x' ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                    {aiResult.title}
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${getClassificationColor(aiResult.classification)}`}>
                    {aiResult.classification}
                  </span>
                  <span className={`text-[10px] ${item.channel === 'x' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {Math.round(aiResult.confidence * 100)}% confidence
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className={`flex justify-between items-center pt-2 mt-2 border-t ${getBorderStyle()}`}>
            <div className="flex gap-2 flex-wrap items-center">
              {item.analysis && (
                <span className={`text-[10px] px-2 py-0.5 ${radius.sm} bg-purple-500${opacityClass.default} text-purple-300 font-medium`}>
                  {item.analysis.bugTag}
                </span>
              )}
              {item.analysis?.sentiment && (
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  {getSentimentIcon(item.analysis.sentiment)}
                  <span className="capitalize">{item.analysis.sentiment}</span>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className={`p-1 ${radius.sm} ${transition.colors} ${
                  item.channel === 'x'
                    ? 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
                aria-label="Card actions"
                data-testid={`kanban-card-menu-${item.id}`}
              >
                <MoreHorizontal className={iconClass.md} />
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
          <div className={`absolute top-2 right-8 text-[10px] px-1.5 py-0.5 ${radius.sm} bg-green-500${opacityClass.default} text-green-400 flex items-center gap-1`}>
            {item.resolvedBy === 'ai' ? <Bot className={iconClass.xs} /> : <User className={iconClass.xs} />}
            <span>Resolved</span>
          </div>
        )}

        {/* Right-click hint */}
        <div className={`absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] ${item.channel === 'x' ? 'text-gray-600' : 'text-gray-400'}`}>
          Right-click to select
        </div>
      </div>
    </motion.div>
  );
}
