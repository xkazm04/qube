import { useCallback } from 'react';
import type { FeedbackItem, KanbanStatus } from '../lib/kanbanTypes';
import { KANBAN_COLUMNS } from '../lib/kanbanTypes';
import type { UseFeedbackItemsResult } from '../hooks/useFeedbackItems';

interface UseKanbanDragHandlersProps {
  draggingItem: FeedbackItem | null;
  feedbackState: UseFeedbackItemsResult;
  handleCardDragEnd: () => void;
}

interface DropCheckResult {
  allowed: boolean;
  reason?: string;
}

export function useKanbanDragHandlers({
  draggingItem,
  feedbackState,
  handleCardDragEnd,
}: UseKanbanDragHandlersProps) {
  const canDrop = useCallback(
    (sourceColumn: KanbanStatus, targetColumn: KanbanStatus): DropCheckResult => {
      const targetConfig = KANBAN_COLUMNS.find((c) => c.id === targetColumn);
      const sourceConfig = KANBAN_COLUMNS.find((c) => c.id === sourceColumn);
      if (!targetConfig) return { allowed: false, reason: 'Invalid column' };

      // Same column - no drop allowed
      if (sourceColumn === targetColumn) {
        return { allowed: false, reason: 'Already in this column' };
      }

      if (!targetConfig.acceptsFrom.includes(sourceColumn)) {
        // Provide specific workflow guidance
        if (sourceColumn === 'new' && targetColumn !== 'analyzed') {
          return { allowed: false, reason: 'Must be analyzed first' };
        }
        if (sourceColumn === 'analyzed' && targetColumn === 'done') {
          return { allowed: false, reason: 'Cannot skip processing stage' };
        }
        if (sourceColumn === 'analyzed' && targetColumn === 'new') {
          return { allowed: false, reason: 'Cannot move back to New' };
        }
        if ((sourceColumn === 'manual' || sourceColumn === 'automatic') && targetColumn !== 'done') {
          return { allowed: false, reason: 'Can only move to Done' };
        }
        if (sourceColumn === 'done') {
          return { allowed: false, reason: 'Resolved items cannot be moved' };
        }
        return { allowed: false, reason: `Cannot move from ${sourceConfig?.title || sourceColumn} here` };
      }

      // Use normalized state's O(1) count by status
      const currentCount = feedbackState.getCountByStatus(targetColumn);
      if (targetConfig.maxItems && currentCount >= targetConfig.maxItems) {
        return { allowed: false, reason: `${targetConfig.title} queue is full (${targetConfig.maxItems} max)` };
      }

      return { allowed: true };
    },
    [feedbackState]
  );

  const handleDrop = useCallback(
    (targetColumn: KanbanStatus) => (e: React.DragEvent) => {
      e.preventDefault();

      if (!draggingItem) return;

      const sourceColumn = draggingItem.status;
      const dropCheck = canDrop(sourceColumn, targetColumn);

      if (!dropCheck.allowed) {
        console.log('Drop not allowed:', dropCheck.reason);
        handleCardDragEnd();
        return;
      }

      // O(1) status update using normalized state
      feedbackState.updateItemStatus(draggingItem.id, targetColumn);

      handleCardDragEnd();
    },
    [draggingItem, canDrop, handleCardDragEnd, feedbackState]
  );

  return {
    canDrop,
    handleDrop,
  };
}
