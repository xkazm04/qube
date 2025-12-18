import { useState, useCallback, useMemo, useEffect } from 'react';
import type { FeedbackItem, KanbanStatus, KanbanChannel } from '../lib/kanbanTypes';
import { mockKanbanFeedback } from '../lib/kanbanMockData';
import { transformDatasetToFeedbackItem } from '../lib/datasetLoader';
import type { RequirementAnalysisResult } from '../lib/aiTypes';
import { useAIProcessing } from '../hooks/useAIProcessing';
import { useIntegrations } from '../hooks/useIntegrations';
import { useFeedbackItems } from '../hooks/useFeedbackItems';
import { useToast } from '@/app/components/ui/ToastProvider';
import {
  useDragState,
  useSelectionState,
  useViewMode,
} from './state';
import { useFilters } from './filters';
import { useSwimlanes } from './swimlanes';
import { useActivity, createStatusChangeEvent } from './activity';

interface UseKanbanBoardLogicProps {
  useDataset?: boolean;
}

export function useKanbanBoardLogic({ useDataset = false }: UseKanbanBoardLogicProps) {
  const toast = useToast();
  const { addEvent } = useActivity();

  // Get state from providers - each provider manages its own slice
  const dragState = useDragState();
  const selectionState = useSelectionState();
  const viewModeState = useViewMode();

  // Integrations hook for GitHub/JIRA
  const integrations = useIntegrations();

  // Normalized feedback items state - O(1) lookups and efficient status grouping
  // Start with empty state - data is loaded by clicking channel icons
  const feedbackState = useFeedbackItems({
    initialItems: [],
  });
  const [datasetLoaded, setDatasetLoaded] = useState(false);

  // Convenience accessor for feedbackItems array (for hooks that need it)
  const feedbackItems = feedbackState.getAllItems();

  // Modal state (local as it's specific to this component)
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Load dataset if enabled
  useEffect(() => {
    if (useDataset && !datasetLoaded) {
      fetch('/api/dataset')
        .then((res) => res.json())
        .then((data) => {
          if (data.feedback) {
            const transformedItems = data.feedback.map(
              (item: Parameters<typeof transformDatasetToFeedbackItem>[0], index: number) =>
                transformDatasetToFeedbackItem(item, index)
            );
            feedbackState.setItems(transformedItems);
            setDatasetLoaded(true);
          }
        })
        .catch((err) => {
          console.error('Failed to load dataset:', err);
        });
    }
  }, [useDataset, datasetLoaded, feedbackState]);

  // Track which channels have been loaded
  const [loadedChannels, setLoadedChannels] = useState<Set<KanbanChannel>>(new Set());

  // Load or unload data for a specific channel
  const handleLoadChannelData = useCallback((channel: KanbanChannel) => {
    if (loadedChannels.has(channel)) {
      // Channel is already loaded - unload it by removing those items
      const itemsToRemove = feedbackItems
        .filter(item => item.channel === channel)
        .map(item => item.id);
      
      // Remove each item individually (hook only has removeItem, not removeItems)
      itemsToRemove.forEach(id => feedbackState.removeItem(id));
      
      setLoadedChannels(prev => {
        const next = new Set(prev);
        next.delete(channel);
        return next;
      });
    } else {
      // Channel not loaded - load it
      const newItems = mockKanbanFeedback
        .filter(item => item.channel === channel);
      
      feedbackState.addItems(newItems);
      setLoadedChannels(prev => new Set(prev).add(channel));
    }
  }, [loadedChannels, feedbackItems, feedbackState]);

  // Filters hook
  const filtersState = useFilters(feedbackItems);

  // Swimlanes hook
  const swimlanesState = useSwimlanes(filtersState.filteredItems, viewModeState.groupBy);

  // AI Processing state
  const aiProcessingState = useAIProcessing({
    onSuccess: (results) => {
      // After successful Stage 1 processing, move items to 'analyzed' status with animation
      // Create a result lookup map for O(1) access
      const resultMap = new Map(results.map((r) => [r.feedbackId, r]));
      const resultIds = Array.from(resultMap.keys());

      // Use batch update for efficiency - O(n) where n is affected items only
      feedbackState.updateItems(resultIds, (item) => {
        const result = resultMap.get(item.id);
        if (!result) return item;
        return {
          ...item,
          status: 'analyzed' as KanbanStatus,
          // Update priority based on AI analysis (realistic SLA)
          priority: result.priority || item.priority,
          analysis: {
            bugId: result.jiraTicket?.summary || 'AI-Analysis',
            bugTag: result.classification.toUpperCase() || 'ANALYZED',
            sentiment: item.analysis?.sentiment || 'neutral',
            suggestedPipeline: result.suggestedPipeline || 'manual',
            confidence: result.confidence || 0.8,
            assignedTeam: result.assignedTeam,
            reasoning: result.reasoning,
          },
          // Store the customer response
          customerResponse: result.customerResponse,
        };
      });
      // Clear selection after processing
      selectionState.deselectAll();
      // Show toast notification
      toast.success(
        'Classification completed',
        `Successfully analyzed ${results.length} feedback item${results.length !== 1 ? 's' : ''}`
      );
    },
    onRequirementSuccess: (results: RequirementAnalysisResult[]) => {
      // After successful Stage 2 processing, move items to 'manual' or 'automatic' based on analysis
      const resultMap = new Map(results.map((r) => [r.feedbackId, r]));
      const resultIds = Array.from(resultMap.keys());

      // Use batch update for efficiency
      feedbackState.updateItems(resultIds, (item) => {
        const result = resultMap.get(item.id);
        if (!result) return item;

        // Move to manual or automatic based on analysisOutcome
        const newStatus = result.analysisOutcome === 'automatic' ? 'automatic' : 'manual';
        return {
          ...item,
          status: newStatus as KanbanStatus,
          analysis: {
            ...item.analysis,
            bugId: result.relatedBugReference || item.analysis?.bugId || 'REQ-Analysis',
            bugTag: result.originalClassification.toUpperCase(),
            sentiment: item.analysis?.sentiment || 'neutral',
            suggestedPipeline: result.analysisOutcome,
            confidence: result.confidence,
            assignedTeam: item.analysis?.assignedTeam,
            reasoning: result.reasoning || item.analysis?.reasoning,
          },
        };
      });
      // Clear selection after processing
      selectionState.deselectAll();
      // Show toast notification
      const manualCount = results.filter((r) => r.analysisOutcome === 'manual').length;
      const autoCount = results.filter((r) => r.analysisOutcome === 'automatic').length;
      toast.success(
        'Requirement analysis completed',
        `${autoCount} item${autoCount !== 1 ? 's' : ''} ready for automation, ${manualCount} need${manualCount === 1 ? 's' : ''} manual review`
      );

      // Automatically create GitHub issues and JIRA tickets
      integrations.processIntegrationsFromResults(results).then((integrationResults) => {
        // Update feedback items with integration URLs/keys
        integrationResults.forEach((integrationResult, feedbackId) => {
          if (integrationResult.success) {
            feedbackState.updateItems([feedbackId], (item) => ({
              ...item,
              githubIssueUrl: integrationResult.type === 'github' ? integrationResult.url : item.githubIssueUrl,
              jiraTicketKey: integrationResult.type === 'jira' ? integrationResult.key : item.jiraTicketKey,
            }));
          }
        });
      });
    },
    onError: (error) => {
      console.error('AI Processing error:', error);
      toast.error('Processing failed', error);
    },
  });

  // Reset the view to start fresh
  const handleResetView = useCallback(() => {
    feedbackState.clear();
    setDatasetLoaded(false);
    selectionState.deselectAll();
    aiProcessingState.clearResults();
  }, [feedbackState, selectionState.deselectAll, aiProcessingState.clearResults]);

  // Group filtered items by status - uses the filtered items from useFilters hook
  // This creates a filtered view while the normalized state maintains the pre-computed index
  const filteredItemsByStatus = useMemo(() => {
    const grouped: Record<KanbanStatus, FeedbackItem[]> = {
      new: [],
      analyzed: [],
      manual: [],
      automatic: [],
      done: [],
    };

    filtersState.filteredItems.forEach((item) => {
      grouped[item.status].push(item);
    });

    return grouped;
  }, [filtersState.filteredItems]);

  // Select all items in 'new' column (filtered view)
  const handleSelectAllNew = useCallback(() => {
    const newItemIds = filteredItemsByStatus.new.map((item) => item.id);
    selectionState.selectAll(newItemIds);
  }, [filteredItemsByStatus.new, selectionState.selectAll]);

  return {
    // State
    dragState,
    selectionState,
    viewModeState,
    feedbackState,
    filtersState,
    swimlanesState,
    aiProcessingState,
    integrations, // GitHub/JIRA integrations
    selectedItem,
    setSelectedItem,
    modalOpen,
    setModalOpen,
    feedbackItems,
    filteredItemsByStatus,
    loadedChannels,

    // Handlers
    handleLoadChannelData,
    handleResetView,
    handleSelectAllNew,

    // Utilities
    addEvent,
    createStatusChangeEvent,
    toast,
  };
}
