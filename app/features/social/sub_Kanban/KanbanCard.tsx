'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Twitter,
  Facebook,
  MessageCircle,
  Star,
  Smartphone,
  Instagram,
  MoreHorizontal,
  Check,
  Frown,
  Meh,
  ThumbsUp,
  Lightbulb,
  Bot,
  User,
  Loader2,
} from 'lucide-react';
import type { FeedbackItem, KanbanChannel } from '../lib/kanbanTypes';
import { PRIORITY_DOT_COLORS } from '../lib/kanbanTypes';
import { getTimeAgo } from '../lib/kanbanMockData';
import type { FeedbackAnalysisResult, AIProcessingStatus } from '../lib/aiTypes';
import CardMenu from './CardMenu';

// Channel icon component map
const ChannelIcon: Record<KanbanChannel, React.FC<{ className?: string }>> = {
  email: Mail,
  twitter: Twitter,
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
  processingStatus?: AIProcessingStatus;
  aiResult?: FeedbackAnalysisResult;
  onDragStart?: (e: React.DragEvent, item: FeedbackItem) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onClick?: (item: FeedbackItem) => void;
  onRightClick?: (item: FeedbackItem, e: React.MouseEvent) => void;
  onAction?: (action: string, item: FeedbackItem) => void;
}

export default function KanbanCard({
  item,
  isDragging = false,
  isSelected = false,
  processingStatus,
  aiResult,
  onDragStart,
  onDragEnd,
  onClick,
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

  // Channel-specific card styles that emulate platform aesthetics
  const getChannelCardStyle = () => {
    switch (item.channel) {
      case 'email':
        return 'bg-white dark:bg-slate-900 border-l-4 border-l-blue-500 rounded-sm shadow-md hover:shadow-blue-500/20';
      case 'twitter':
        return 'bg-black border border-gray-800 rounded-2xl hover:border-gray-700';
      case 'facebook':
        return 'bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md';
      case 'support_chat':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-2xl rounded-bl-sm';
      case 'trustpilot':
        return 'bg-[#00b67a]/5 dark:bg-[#00b67a]/10 border border-[#00b67a]/30 rounded-lg hover:border-[#00b67a]/50';
      case 'app_store':
        return 'bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl';
      case 'instagram':
        return 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 border border-pink-200 dark:border-pink-800/50 rounded-xl';
      default:
        return 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg';
    }
  };

  // Channel-specific header styling
  const getChannelHeaderStyle = () => {
    switch (item.channel) {
      case 'twitter':
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
        return <Frown className="w-3 h-3 text-red-400" />;
      case 'disappointed':
        return <Meh className="w-3 h-3 text-orange-400" />;
      case 'constructive':
        return <Lightbulb className="w-3 h-3 text-green-400" />;
      case 'helpful':
        return <ThumbsUp className="w-3 h-3 text-green-400" />;
      default:
        return <Meh className="w-3 h-3 text-gray-400" />;
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

      case 'twitter':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold">
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

  // Selection and processing state styling
  const getSelectionClass = () => {
    if (isSelected) {
      return 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[var(--color-background)]';
    }
    return '';
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

  // Classification badge colors
  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'bug':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'feature':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'clarification':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  const getBorderStyle = () => {
    return item.channel === 'twitter' ? 'border-gray-800' : 'border-gray-200 dark:border-gray-700';
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
        {/* Selection indicator */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-2 left-2 z-10 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg"
            >
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing overlay */}
        <AnimatePresence>
          {processingStatus === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <span className="text-xs text-white font-medium">Analyzing...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`p-3 ${isSelected ? 'pl-8' : ''}`}>
          {/* Header */}
          <div className={`flex justify-between items-center pb-2 mb-2 border-b ${getBorderStyle()}`}>
            <div className={`flex items-center gap-1.5 text-xs ${getChannelHeaderStyle()}`}>
              <Icon className="w-4 h-4" />
              <span className="font-semibold capitalize">{item.channel.replace('_', ' ')}</span>
              <span className={item.channel === 'twitter' ? 'text-gray-500' : 'text-gray-400'}>•</span>
              <span className={item.channel === 'twitter' ? 'text-gray-500' : 'text-gray-400'}>{getTimeAgo(item.timestamp)}</span>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full ${PRIORITY_DOT_COLORS[item.priority]}`} title={`${item.priority} priority`} />
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${getClassificationColor(aiResult.classification)}`}>
                    {aiResult.classification}
                  </span>
                  <span className={`text-[10px] ${item.channel === 'twitter' ? 'text-gray-500' : 'text-gray-400'}`}>
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
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">
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
                className={`p-1 rounded transition-colors ${
                  item.channel === 'twitter'
                    ? 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
                aria-label="Card actions"
              >
                <MoreHorizontal className="w-4 h-4" />
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
          <div className="absolute top-2 right-8 text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 flex items-center gap-1">
            {item.resolvedBy === 'ai' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
            <span>Resolved</span>
          </div>
        )}

        {/* Right-click hint */}
        <div className={`absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] ${item.channel === 'twitter' ? 'text-gray-600' : 'text-gray-400'}`}>
          Right-click to select
        </div>
      </div>
    </motion.div>
  );
}
