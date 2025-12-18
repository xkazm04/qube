import type { FeedbackItem, KanbanStatus } from '../../lib/kanbanTypes';
import type { UseFeedbackItemsResult } from '../../hooks/useFeedbackItems';
import type { ToastContextType } from '@/app/components/ui/ToastProvider';

export function handleAnalyzeAction(
  item: FeedbackItem,
  feedbackState: UseFeedbackItemsResult,
  addEvent: (event: any) => void,
  trackStatusChange: (from: KanbanStatus, to: KanbanStatus) => void
) {
  const analysisData = {
    bugId: `BUG_${Date.now()}`,
    bugTag: 'Auto-detected',
    sentiment: 'neutral' as const,
    suggestedPipeline: 'automatic' as const,
    confidence: 0.85,
  };

  // O(1) single-item update using normalized state
  feedbackState.updateItem(item.id, (fb) => ({
    ...fb,
    status: 'analyzed' as KanbanStatus,
    analysis: analysisData,
  }));
  trackStatusChange(item.status, 'analyzed');
  addEvent({ feedbackId: item.id, type: 'analyzed', actor: 'ai', metadata: { confidence: 0.85 } });
}

export function handleAssignManualAction(
  item: FeedbackItem,
  originalItem: FeedbackItem,
  feedbackState: UseFeedbackItemsResult,
  trackStatusChange: (from: KanbanStatus, to: KanbanStatus) => void,
  performOptimisticUpdate: <T>(
    updateFn: () => T,
    asyncOperation?: () => Promise<void>,
    rollbackFn?: () => void,
    successMessage?: { title: string; description: string }
  ) => Promise<void>
) {
  // O(1) status update using normalized state
  feedbackState.updateItemStatus(item.id, 'manual');
  trackStatusChange(item.status, 'manual');

  // Simulate async operation (e.g., API call) with rollback on failure
  performOptimisticUpdate(
    () => {},
    async () => {},
    () => {
      // Rollback to original state
      feedbackState.updateItemStatus(item.id, originalItem.status);
    }
  );
}

export function handleAssignAutoAction(
  item: FeedbackItem,
  originalItem: FeedbackItem,
  feedbackState: UseFeedbackItemsResult,
  trackStatusChange: (from: KanbanStatus, to: KanbanStatus) => void,
  performOptimisticUpdate: <T>(
    updateFn: () => T,
    asyncOperation?: () => Promise<void>,
    rollbackFn?: () => void,
    successMessage?: { title: string; description: string }
  ) => Promise<void>
) {
  // O(1) status update using normalized state
  feedbackState.updateItemStatus(item.id, 'automatic');
  trackStatusChange(item.status, 'automatic');

  // Simulate async operation with rollback on failure
  performOptimisticUpdate(
    () => {},
    async () => {},
    () => {
      // Rollback to original state
      feedbackState.updateItemStatus(item.id, originalItem.status);
    }
  );
}

export function handleMarkDoneAction(
  item: FeedbackItem,
  originalItem: FeedbackItem,
  feedbackState: UseFeedbackItemsResult,
  addEvent: (event: any) => void,
  trackStatusChange: (from: KanbanStatus, to: KanbanStatus) => void,
  performOptimisticUpdate: <T>(
    updateFn: () => T,
    asyncOperation?: () => Promise<void>,
    rollbackFn?: () => void,
    successMessage?: { title: string; description: string }
  ) => Promise<void>
) {
  const resolvedAt = new Date().toISOString();
  const resolvedBy = item.status === 'automatic' ? 'ai' as const : 'human' as const;

  // O(1) single-item update using normalized state
  feedbackState.updateItem(item.id, (fb) => ({
    ...fb,
    status: 'done' as KanbanStatus,
    resolvedAt,
    resolvedBy,
  }));
  trackStatusChange(item.status, 'done');
  addEvent({ feedbackId: item.id, type: 'resolved', actor: item.status === 'automatic' ? 'ai' : 'user', metadata: {} });

  // Simulate async operation with rollback on failure
  performOptimisticUpdate(
    () => {},
    async () => {},
    () => {
      // Rollback to original state
      feedbackState.updateItem(item.id, (fb) => ({
        ...fb,
        status: originalItem.status,
        resolvedAt: undefined,
        resolvedBy: undefined,
      }));
    },
    { title: 'Feedback resolved', description: 'Item marked as done' }
  );
}

export function handleReopenAction(
  item: FeedbackItem,
  originalItem: FeedbackItem,
  feedbackState: UseFeedbackItemsResult,
  addEvent: (event: any) => void,
  performOptimisticUpdate: <T>(
    updateFn: () => T,
    asyncOperation?: () => Promise<void>,
    rollbackFn?: () => void,
    successMessage?: { title: string; description: string }
  ) => Promise<void>
) {
  // O(1) single-item update using normalized state
  feedbackState.updateItem(item.id, (fb) => ({
    ...fb,
    status: 'analyzed' as KanbanStatus,
    resolvedAt: undefined,
    resolvedBy: undefined,
  }));
  addEvent({ feedbackId: item.id, type: 'reopened', actor: 'user', metadata: {} });

  // Simulate async operation with rollback on failure
  performOptimisticUpdate(
    () => {},
    async () => {},
    () => {
      // Rollback to original state
      feedbackState.updateItem(item.id, (fb) => ({
        ...fb,
        status: originalItem.status,
        resolvedAt: originalItem.resolvedAt,
        resolvedBy: originalItem.resolvedBy,
      }));
    }
  );
}

export function handleLinkJiraAction(
  item: FeedbackItem,
  originalItem: FeedbackItem,
  feedbackState: UseFeedbackItemsResult,
  addEvent: (event: any) => void,
  performOptimisticUpdate: <T>(
    updateFn: () => T,
    asyncOperation?: () => Promise<void>,
    rollbackFn?: () => void,
    successMessage?: { title: string; description: string }
  ) => Promise<void>
) {
  const ticketId = `JIRA-${Math.floor(Math.random() * 9000) + 1000}`;

  // O(1) single-item update using normalized state
  feedbackState.updateItem(item.id, (fb) => ({
    ...fb,
    linkedTickets: [...(fb.linkedTickets || []), ticketId],
  }));
  addEvent({ feedbackId: item.id, type: 'ticket_linked', actor: 'user', metadata: { ticketId } });

  // Simulate async operation with rollback on failure
  performOptimisticUpdate(
    () => {},
    async () => {},
    () => {
      // Rollback to original state
      feedbackState.updateItem(item.id, (fb) => ({
        ...fb,
        linkedTickets: originalItem.linkedTickets || [],
      }));
    },
    { title: 'Ticket linked', description: `Linked to ${ticketId}` }
  );
}

export function handleCopyLinkAction(item: FeedbackItem, toast: ToastContextType) {
  navigator.clipboard.writeText(`https://app.example.com/feedback/${item.id}`);
  toast.info('Link copied', 'Feedback link copied to clipboard');
}
