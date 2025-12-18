import { useCallback } from 'react';
import type { FeedbackItem, KanbanStatus } from '../lib/kanbanTypes';
import type { UseFeedbackItemsResult } from '../hooks/useFeedbackItems';
import type { ClassificationResult, RequirementAnalysisResult } from '../lib/aiTypes';
import type { ToastContextType } from '@/app/components/ui/ToastProvider';
import { handleCreateJiraTicket } from './handlers/createJiraTicket';
import { handleCreateGithubIssue } from './handlers/createGithubIssue';
import {
  handleAnalyzeAction,
  handleAssignManualAction,
  handleAssignAutoAction,
  handleMarkDoneAction,
  handleReopenAction,
  handleLinkJiraAction,
  handleCopyLinkAction,
} from './handlers/cardActions';

interface UseKanbanCardHandlersProps {
  feedbackState: UseFeedbackItemsResult;
  aiResults: Map<string, ClassificationResult>;
  requirementResults: Map<string, RequirementAnalysisResult> | undefined;
  toast: ToastContextType;
  addEvent: (event: any) => void;
  setSelectedItem: (item: FeedbackItem | null) => void;
  setModalOpen: (open: boolean) => void;
  createStatusChangeEvent: (feedbackId: string, from: KanbanStatus, to: KanbanStatus) => any;
}

export function useKanbanCardHandlers({
  feedbackState,
  aiResults,
  requirementResults,
  toast,
  addEvent,
  setSelectedItem,
  setModalOpen,
  createStatusChangeEvent,
}: UseKanbanCardHandlersProps) {
  // Optimistic update helper with rollback capability
  const performOptimisticUpdate = useCallback(
    async <T,>(
      updateFn: () => T,
      asyncOperation?: () => Promise<void>,
      rollbackFn?: () => void,
      successMessage?: { title: string; description: string }
    ) => {
      // Apply optimistic update immediately
      updateFn();

      // If there's an async operation, execute it and handle failure
      if (asyncOperation) {
        try {
          await asyncOperation();
          if (successMessage) {
            toast.success(successMessage.title, successMessage.description);
          }
        } catch (error) {
          // Rollback on failure
          if (rollbackFn) {
            rollbackFn();
          }
          toast.error('Action failed', error instanceof Error ? error.message : 'Please try again');
        }
      } else if (successMessage) {
        toast.success(successMessage.title, successMessage.description);
      }
    },
    [toast]
  );

  const handleCardClick = useCallback((item: FeedbackItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  }, [setSelectedItem, setModalOpen]);

  const handleCardRightClick = useCallback(
    (item: FeedbackItem, e: React.MouseEvent, toggleSelection: (id: string) => void) => {
      e.preventDefault();
      toggleSelection(item.id);
    },
    []
  );

  const handleCardAction = useCallback(
    (action: string, item: FeedbackItem) => {
      const trackStatusChange = (from: KanbanStatus, to: KanbanStatus) => {
        addEvent(createStatusChangeEvent(item.id, from, to));
      };

      // Store original state for potential rollback
      const originalItem = { ...item };

      switch (action) {
        case 'view':
          setSelectedItem(item);
          setModalOpen(true);
          break;
        case 'analyze':
          handleAnalyzeAction(item, feedbackState, addEvent, trackStatusChange);
          break;
        case 'assign-manual':
          handleAssignManualAction(item, originalItem, feedbackState, trackStatusChange, performOptimisticUpdate);
          break;
        case 'assign-auto':
          handleAssignAutoAction(item, originalItem, feedbackState, trackStatusChange, performOptimisticUpdate);
          break;
        case 'mark-done':
          handleMarkDoneAction(item, originalItem, feedbackState, addEvent, trackStatusChange, performOptimisticUpdate);
          break;
        case 'reopen':
          handleReopenAction(item, originalItem, feedbackState, addEvent, performOptimisticUpdate);
          break;
        case 'link-jira':
          handleLinkJiraAction(item, originalItem, feedbackState, addEvent, performOptimisticUpdate);
          break;
        case 'create-jira':
          handleCreateJiraTicket(item, aiResults, feedbackState, addEvent, toast);
          break;
        case 'create-github':
          handleCreateGithubIssue(item, aiResults, requirementResults, feedbackState, addEvent, toast);
          break;
        case 'copy-link':
          handleCopyLinkAction(item, toast);
          break;
        default:
          console.log('Unknown action:', action);
      }
    },
    [toast, addEvent, performOptimisticUpdate, feedbackState, aiResults, requirementResults, setSelectedItem, setModalOpen, createStatusChangeEvent]
  );

  return {
    handleCardClick,
    handleCardRightClick,
    handleCardAction,
  };
}
