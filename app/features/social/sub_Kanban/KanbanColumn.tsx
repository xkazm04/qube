'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FeedbackItem, KanbanColumn as KanbanColumnType } from '../lib/kanbanTypes';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  column: KanbanColumnType;
  items: FeedbackItem[];
  isDragOver: boolean;
  isValidDrop: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onCardDragStart: (e: React.DragEvent, item: FeedbackItem) => void;
  onCardDragEnd: (e: React.DragEvent) => void;
  onCardClick: (item: FeedbackItem) => void;
  onCardAction: (action: string, item: FeedbackItem) => void;
  draggingItem: FeedbackItem | null;
}

export default function KanbanColumn({
  column,
  items,
  isDragOver,
  isValidDrop,
  onDragOver,
  onDragLeave,
  onDrop,
  onCardDragStart,
  onCardDragEnd,
  onCardClick,
  onCardAction,
  draggingItem,
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
    if (!isDragOver) return '';
    if (isValidDrop) {
      return 'bg-green-500/10 border-green-500/50';
    }
    return 'bg-red-500/10 border-red-500/50';
  };

  return (
    <div
      className={`
        flex-1 min-w-[300px] max-w-[380px] flex flex-col
        bg-[var(--color-background)] rounded-[var(--radius-lg)]
        border border-[var(--color-border-subtle)]
        ${getDropIndicatorClass()}
        transition-colors duration-150
      `}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      data-column-id={column.id}
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
          <span className="text-base">{column.icon}</span>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {column.title}
          </h3>
          <span className="ml-auto px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated)] rounded-full">
            {items.length}
            {column.maxItems && `/${column.maxItems}`}
          </span>
        </div>
        <span className="text-[11px] text-[var(--color-text-muted)] mt-1 block">
          {column.subtitle}
        </span>
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
              onDragStart={onCardDragStart}
              onDragEnd={onCardDragEnd}
              onClick={onCardClick}
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
            className="border-2 border-dashed border-[var(--color-accent)] rounded-[var(--radius-md)] bg-[var(--color-accent-subtle)] flex items-center justify-center"
          >
            <span className="text-xs text-[var(--color-accent)]">Drop here</span>
          </motion.div>
        )}

        {/* Empty state */}
        {items.length === 0 && !isDragOver && (
          <div className="flex-1 flex items-center justify-center text-center py-8">
            <div className="text-[var(--color-text-muted)]">
              <div className="text-2xl mb-2 opacity-50">{column.icon}</div>
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
