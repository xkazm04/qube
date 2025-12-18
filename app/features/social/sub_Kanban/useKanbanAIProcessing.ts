import { useCallback } from 'react';
import type { FeedbackItem } from '../lib/kanbanTypes';
import type { UIFeedbackItem, ClassificationResult, TargetCompany } from '../lib/aiTypes';
import type { ToastContextType } from '@/app/components/ui/ToastProvider';

interface UseKanbanAIProcessingProps {
  feedbackItems: FeedbackItem[];
  selectedIds: Set<string>;
  aiResults: Map<string, ClassificationResult>;
  processFeedback: (items: UIFeedbackItem[]) => Promise<any>;
  processRequirements: (items: UIFeedbackItem[], company: TargetCompany) => Promise<any>;
  toast: ToastContextType;
}

export function useKanbanAIProcessing({
  feedbackItems,
  selectedIds,
  aiResults,
  processFeedback,
  processRequirements,
  toast,
}: UseKanbanAIProcessingProps) {
  // Transform FeedbackItem to UIFeedbackItem for the API
  const transformToUIItem = useCallback((item: FeedbackItem): UIFeedbackItem => ({
    id: item.id,
    company: item.company,
    channel: item.channel,
    timestamp: item.timestamp,
    author: item.author,
    content: item.content,
    conversation: item.conversation,
    rating: item.rating,
    bugReference: item.analysis?.bugId || '',
    sentiment: item.analysis?.sentiment || 'neutral',
    priority: item.priority,
    tags: item.tags,
    engagement: item.engagement,
    aiResult: aiResults.get(item.id),
  }), [aiResults]);

  // Handle AI Processing - determines which stage to run based on selected items' column
  const handleProcessSelected = useCallback(async () => {
    const selectedItems = feedbackItems.filter((item) => selectedIds.has(item.id));
    if (selectedItems.length === 0) return;

    // Determine which columns the selected items are in
    const itemsInNew = selectedItems.filter((item) => item.status === 'new');
    const itemsInAnalyzed = selectedItems.filter((item) => item.status === 'analyzed');

    // Check if we have a mix of columns (not allowed)
    if (itemsInNew.length > 0 && itemsInAnalyzed.length > 0) {
      toast.error(
        'Mixed selection',
        'Please select items from only one column (New or Analyzed) for processing'
      );
      return;
    }

    if (itemsInNew.length > 0) {
      // Stage 1: Classification (New → Analyzed)
      const uiFeedbackItems = itemsInNew.map(transformToUIItem);
      await processFeedback(uiFeedbackItems);
    } else if (itemsInAnalyzed.length > 0) {
      // Stage 2: Requirement Analysis (Analyzed → Manual/Automatic)
      // Check that all items are from the same company
      const companies = new Set(itemsInAnalyzed.map((item) => item.company));
      if (companies.size > 1) {
        toast.error(
          'Mixed companies',
          'Please select items from the same company for requirement analysis'
        );
        return;
      }

      const company = itemsInAnalyzed[0].company as TargetCompany;
      const uiFeedbackItems = itemsInAnalyzed.map(transformToUIItem);
      await processRequirements(uiFeedbackItems, company);
    } else {
      // Items are in other columns (manual, automatic, done) - not processable
      toast.info(
        'Nothing to process',
        'Selected items have already been processed. Select items from New or Analyzed columns.'
      );
    }
  }, [feedbackItems, selectedIds, transformToUIItem, processFeedback, processRequirements, toast]);

  return {
    handleProcessSelected,
  };
}
