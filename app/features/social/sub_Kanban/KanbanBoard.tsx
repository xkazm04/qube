'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { FeedbackItem, KanbanStatus } from '../lib/kanbanTypes';
import { KANBAN_COLUMNS } from '../lib/kanbanTypes';
import { mockKanbanFeedback } from '../lib/kanbanMockData';
import KanbanColumn from './KanbanColumn';
import CardDetailModal from './CardDetailModal';

export default function KanbanBoard() {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(mockKanbanFeedback);
  const [draggingItem, setDraggingItem] = useState<FeedbackItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanStatus | null>(null);
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const itemsByStatus = useMemo(() => {
    const grouped: Record<KanbanStatus, FeedbackItem[]> = {
      new: [],
      analyzed: [],
      manual: [],
      automatic: [],
      done: [],
    };

    feedbackItems.forEach((item) => {
      grouped[item.status].push(item);
    });

    return grouped;
  }, [feedbackItems]);

  const canDrop = useCallback(
    (sourceColumn: KanbanStatus, targetColumn: KanbanStatus): { allowed: boolean; reason?: string } => {
      const targetConfig = KANBAN_COLUMNS.find((c) => c.id === targetColumn);
      if (!targetConfig) return { allowed: false, reason: 'Invalid column' };

      if (!targetConfig.acceptsFrom.includes(sourceColumn)) {
        return { allowed: false, reason: 'Invalid workflow transition' };
      }

      const currentCount = itemsByStatus[targetColumn].length;
      if (targetConfig.maxItems && currentCount >= targetConfig.maxItems) {
        return { allowed: false, reason: `${targetConfig.title} queue is full` };
      }

      return { allowed: true };
    },
    [itemsByStatus]
  );

  const handleCardDragStart = useCallback((e: React.DragEvent, item: FeedbackItem) => {
    setDraggingItem(item);
  }, []);

  const handleCardDragEnd = useCallback(() => {
    setDraggingItem(null);
    setDragOverColumn(null);
  }, []);

  const handleDragOver = useCallback(
    (columnId: KanbanStatus) => (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverColumn(columnId);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    (targetColumn: KanbanStatus) => (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverColumn(null);

      if (!draggingItem) return;

      const sourceColumn = draggingItem.status;
      const dropCheck = canDrop(sourceColumn, targetColumn);

      if (!dropCheck.allowed) {
        console.log('Drop not allowed:', dropCheck.reason);
        return;
      }

      setFeedbackItems((prev) =>
        prev.map((item) =>
          item.id === draggingItem.id ? { ...item, status: targetColumn } : item
        )
      );

      setDraggingItem(null);
    },
    [draggingItem, canDrop]
  );

  const handleCardClick = useCallback((item: FeedbackItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  }, []);

  const handleCardAction = useCallback(
    (action: string, item: FeedbackItem) => {
      switch (action) {
        case 'view':
          setSelectedItem(item);
          setModalOpen(true);
          break;
        case 'analyze':
          setFeedbackItems((prev) =>
            prev.map((fb) =>
              fb.id === item.id
                ? {
                    ...fb,
                    status: 'analyzed' as KanbanStatus,
                    analysis: {
                      bugId: `BUG_${Date.now()}`,
                      bugTag: 'Auto-detected',
                      sentiment: 'neutral',
                      suggestedPipeline: 'automatic',
                      confidence: 0.85,
                    },
                  }
                : fb
            )
          );
          break;
        case 'assign-manual':
          setFeedbackItems((prev) =>
            prev.map((fb) => (fb.id === item.id ? { ...fb, status: 'manual' as KanbanStatus } : fb))
          );
          break;
        case 'assign-auto':
          setFeedbackItems((prev) =>
            prev.map((fb) => (fb.id === item.id ? { ...fb, status: 'automatic' as KanbanStatus } : fb))
          );
          break;
        case 'mark-done':
          setFeedbackItems((prev) =>
            prev.map((fb) =>
              fb.id === item.id
                ? {
                    ...fb,
                    status: 'done' as KanbanStatus,
                    resolvedAt: new Date().toISOString(),
                    resolvedBy: item.status === 'automatic' ? 'ai' : 'human',
                  }
                : fb
            )
          );
          break;
        case 'reopen':
          setFeedbackItems((prev) =>
            prev.map((fb) =>
              fb.id === item.id
                ? { ...fb, status: 'analyzed' as KanbanStatus, resolvedAt: undefined, resolvedBy: undefined }
                : fb
            )
          );
          break;
        case 'link-jira':
          const ticketId = `JIRA-${Math.floor(Math.random() * 9000) + 1000}`;
          setFeedbackItems((prev) =>
            prev.map((fb) =>
              fb.id === item.id
                ? { ...fb, linkedTickets: [...(fb.linkedTickets || []), ticketId] }
                : fb
            )
          );
          break;
        case 'copy-link':
          navigator.clipboard.writeText(`https://app.example.com/feedback/${item.id}`);
          break;
        default:
          console.log('Unknown action:', action);
      }
    },
    []
  );

  const handleModalAction = useCallback(
    (action: string) => {
      if (selectedItem) {
        handleCardAction(action, selectedItem);
      }
      setModalOpen(false);
    },
    [selectedItem, handleCardAction]
  );

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Board Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-center justify-between"
      >
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Feedback Pipeline
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Drag cards between columns to update their status
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
          <span>Total: {feedbackItems.length}</span>
          <span className="text-green-400">Done: {itemsByStatus.done.length}</span>
        </div>
      </motion.div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {KANBAN_COLUMNS.map((column) => {
          const isDragOver = dragOverColumn === column.id;
          const isValidDrop = draggingItem
            ? canDrop(draggingItem.status, column.id).allowed
            : false;

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              items={itemsByStatus[column.id]}
              isDragOver={isDragOver}
              isValidDrop={isValidDrop}
              onDragOver={handleDragOver(column.id)}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop(column.id)}
              onCardDragStart={handleCardDragStart}
              onCardDragEnd={handleCardDragEnd}
              onCardClick={handleCardClick}
              onCardAction={handleCardAction}
              draggingItem={draggingItem}
            />
          );
        })}
      </div>

      {/* Card Detail Modal */}
      <CardDetailModal
        isOpen={modalOpen}
        item={selectedItem}
        onClose={() => {
          setModalOpen(false);
          setSelectedItem(null);
        }}
        onAction={handleModalAction}
      />
    </div>
  );
}
