'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  Search,
  User,
  Bot,
  CheckCircle,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import type { FeedbackItem, KanbanColumnConfig } from '../lib/kanbanTypes';
import type { FeedbackAnalysisResult, AIProcessingStatus } from '../lib/aiTypes';
import KanbanCard from './KanbanCard';

// Icon mapping for column iconName
const ColumnIcons: Record<string, LucideIcon> = {
  inbox: Inbox,
  search: Search,
  user: User,
  bot: Bot,
  'check-circle': CheckCircle,
};

interface KanbanColumnProps {
  column: KanbanColumnConfig;
  items: FeedbackItem[];
  isDragOver: boolean;
  isValidDrop: boolean;
  dropReason?: string;
  isDragging?: boolean;
  selectedIds: Set<string>;
  processingStatus?: AIProcessingStatus;
  aiResults?: Map<string, FeedbackAnalysisResult>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onCardDragStart: (e: React.DragEvent, item: FeedbackItem) => void;
  onCardDragEnd: (e: React.DragEvent) => void;
  onCardClick: (item: FeedbackItem) => void;
  onCardDoubleClick?: (item: FeedbackItem) => void;
  onCardRightClick: (item: FeedbackItem, e: React.MouseEvent) => void;
  onCardAction: (action: string, item: FeedbackItem) => void;
  draggingItem: FeedbackItem | null;
  headerActions?: React.ReactNode;
}

export default function KanbanColumn({
  column,
  items,
  isDragOver,
  isValidDrop,
  dropReason,
  isDragging = false,
  selectedIds,
  processingStatus,
  aiResults,
  onDragOver,
  onDragLeave,
  onDrop,
  onCardDragStart,
  onCardDragEnd,
  onCardClick,
  onCardDoubleClick,
  onCardRightClick,
  onCardAction,
  draggingItem,
  headerActions,
}: KanbanColumnProps) {
  const getBorderColor = () => {
    switch (column.id) {
      case 'manual':
        return 'border-l-[var(--color-warning)]';
      case 'automatic':
        return 'border-l-[var(--color-accent)]';
      case 'done':
        return 'border-l-[var(--color-success)]';
      default:
        return '';
    }
  };

  const getDropIndicatorClass = () => {
    // When dragging but not over this column, show subtle indicator of valid/invalid state
    if (isDragging && !isDragOver) {
      if (isValidDrop) {
        return 'border-green-500/30 bg-green-500/5';
      }
      return 'border-red-500/20 bg-red-500/5 opacity-75';
    }
    // When hovering over the column
    if (isDragOver) {
      if (isValidDrop) {
        return 'bg-green-500/15 border-green-500/60 shadow-[0_0_15px_rgba(34,197,94,0.2)]';
      }
      return 'bg-red-500/15 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
    }
    return '';
  };

  // Count selected items in this column
  const selectedInColumn = items.filter((item) => selectedIds.has(item.id)).length;

  return (
    <div
      className={`
        relative flex-1 min-w-[300px] max-w-[380px] flex flex-col
        bg-[var(--color-background)] rounded-[var(--radius-lg)]
        border border-[var(--color-border-subtle)]
        ${getDropIndicatorClass()}
        transition-all duration-150
      `}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      data-column-id={column.id}
      data-testid={`kanban-column-${column.id}`}
    >
      {/* Column Header */}
      <div
        className={`
          p-4 border-b border-[var(--color-border-subtle)]
          sticky top-0 bg-[var(--color-background)] z-10
          ${getBorderColor() ? `border-l-[3px] ${getBorderColor()}` : ''}
        `}
      >
        <div className="flex items-center gap-2">
          {(() => {
            const IconComponent = ColumnIcons[column.iconName];
            return IconComponent ? (
              <IconComponent className="w-4 h-4 text-[var(--color-text-secondary)]" />
            ) : null;
          })()}
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {column.title}
          </h3>
          {selectedInColumn > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium text-white bg-blue-500 rounded-full">
              {selectedInColumn} selected
            </span>
          )}
          <span className="ml-auto px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated)] rounded-full">
            {items.length}
            {column.maxItems && `/${column.maxItems}`}
          </span>
        </div>
        <span className="text-[11px] text-[var(--color-text-muted)] mt-1 block">
          {column.subtitle}
        </span>
        {headerActions && (
          <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
            {headerActions}
          </div>
        )}
      </div>

      {/* Column Body */}
      <div
        className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 custom-scrollbar"
        role="list"
      >
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              isDragging={draggingItem?.id === item.id}
              isSelected={selectedIds.has(item.id)}
              processingStatus={selectedIds.has(item.id) ? processingStatus : undefined}
              aiResult={aiResults?.get(item.id)}
              onDragStart={onCardDragStart}
              onDragEnd={onCardDragEnd}
              onClick={onCardClick}
              onDoubleClick={onCardDoubleClick}
              onRightClick={onCardRightClick}
              onAction={onCardAction}
            />
          ))}
        </AnimatePresence>

        {/* Drop placeholder when dragging over empty valid column */}
        {isDragOver && isValidDrop && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 100 }}
            exit={{ opacity: 0, height: 0 }}
            className="border-2 border-dashed border-green-500 rounded-[var(--radius-md)] bg-green-500/10 flex items-center justify-center"
            data-testid={`kanban-column-valid-drop-${column.id}`}
          >
            <span className="text-xs text-green-400 font-medium">Drop here</span>
          </motion.div>
        )}

        {/* Invalid drop feedback tooltip */}
        <AnimatePresence>
          {isDragOver && !isValidDrop && dropReason && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
              data-testid={`kanban-column-invalid-drop-${column.id}`}
            >
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-900/95 border border-red-500/50 shadow-lg backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-100 font-medium whitespace-nowrap">
                  {dropReason}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {items.length === 0 && !isDragOver && (
          <div className="flex-1 flex items-center justify-center text-center py-8">
            <div className="text-[var(--color-text-muted)]">
              {(() => {
                const IconComponent = ColumnIcons[column.iconName];
                return IconComponent ? (
                  <IconComponent className="w-8 h-8 mx-auto mb-2 opacity-30" />
                ) : null;
              })()}
              <p className="text-xs">No items</p>
            </div>
          </div>
        )}

        {/* Column full indicator */}
        {column.maxItems && items.length >= column.maxItems && (
          <div className="text-center py-2 text-[10px] text-[var(--color-warning)]">
            Queue full ({column.maxItems} max)
          </div>
        )}
      </div>
    </div>
  );
}
