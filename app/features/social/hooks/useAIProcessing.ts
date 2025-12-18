'use client';

import { useState, useCallback } from 'react';
import type {
  AIProvider,
  AIProcessingStatus,
  FeedbackAnalysisResult,
  BatchAnalysisResponse,
  UIFeedbackItem,
  RequirementAnalysisResult,
  BatchRequirementAnalysisResponse,
  AnalysisStage,
  TargetCompany,
} from '../lib/aiTypes';

interface UseAIProcessingOptions {
  onSuccess?: (results: FeedbackAnalysisResult[]) => void;
  onRequirementSuccess?: (results: RequirementAnalysisResult[]) => void;
  onError?: (error: string) => void;
  onProgress?: (current: number, total: number) => void;
}

interface AIProcessingState {
  status: AIProcessingStatus;
  provider: AIProvider;
  results: Map<string, FeedbackAnalysisResult>;
  requirementResults: Map<string, RequirementAnalysisResult>;
  error?: string;
  progress?: {
    current: number;
    total: number;
  };
}

export function useAIProcessing(options: UseAIProcessingOptions = {}) {
  const { onSuccess, onRequirementSuccess, onError, onProgress } = options;

  const [state, setState] = useState<AIProcessingState>({
    status: 'idle',
    provider: 'gemini',
    results: new Map(),
    requirementResults: new Map(),
  });

  // Set the AI provider
  const setProvider = useCallback((provider: AIProvider) => {
    setState((prev) => ({ ...prev, provider }));
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      results: new Map(),
      requirementResults: new Map(),
      error: undefined,
      status: 'idle',
    }));
  }, []);

  // Process feedback items
  const processFeedback = useCallback(
    async (feedbackItems: UIFeedbackItem[]) => {
      if (feedbackItems.length === 0) {
        onError?.('No feedback items selected');
        return;
      }

      setState((prev) => ({
        ...prev,
        status: 'processing',
        error: undefined,
        progress: { current: 0, total: feedbackItems.length },
      }));

      try {
        // Transform feedback items to the format expected by the API
        const items = feedbackItems.map((item) => ({
          id: item.id,
          company: item.company,
          channel: item.channel,
          content: item.content.body,
          sentiment: item.sentiment,
          priority: item.priority,
          tags: item.tags,
        }));

        // Call the API
        const response = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: state.provider,
            feedbackItems: items,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.error || 'Failed to process feedback';
          const rawResponse = errorData.rawResponse ? `\n\nRaw response: ${errorData.rawResponse.substring(0, 200)}...` : '';
          throw new Error(`${errorMessage}${rawResponse}`);
        }

        const data: BatchAnalysisResponse = await response.json();

        // Validate response structure
        if (!data.results || !Array.isArray(data.results)) {
          throw new Error('Invalid response format: missing results array');
        }

        // Update results map
        const newResults = new Map(state.results);
        data.results.forEach((result) => {
          newResults.set(result.feedbackId, result);
        });

        setState((prev) => ({
          ...prev,
          status: 'success',
          results: newResults,
          progress: { current: data.results.length, total: feedbackItems.length },
        }));

        onSuccess?.(data.results);
        onProgress?.(data.results.length, feedbackItems.length);

        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: errorMessage,
        }));
        onError?.(errorMessage);
        throw error;
      }
    },
    [state.provider, state.results, onSuccess, onError, onProgress]
  );

  // Process requirement analysis (Stage 2: Analyzed → Manual/Automatic)
  const processRequirements = useCallback(
    async (feedbackItems: UIFeedbackItem[], company: TargetCompany) => {
      if (feedbackItems.length === 0) {
        onError?.('No feedback items selected');
        return;
      }

      setState((prev) => ({
        ...prev,
        status: 'processing',
        error: undefined,
        progress: { current: 0, total: feedbackItems.length },
      }));

      try {
        // Transform feedback items to the format expected by Stage 2 API
        const items = feedbackItems.map((item) => ({
          id: item.id,
          title: item.aiResult?.title || item.content.subject || 'Untitled',
          classification: item.aiResult?.classification || 'bug',
          company: item.company as TargetCompany,
          channel: item.channel,
          content: item.content.body,
          sentiment: item.sentiment,
          priority: item.priority,
          tags: item.tags,
          bugReference: item.bugReference,
        }));

        // Call the API with stage=requirement
        const response = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: state.provider,
            feedbackItems: items,
            stage: 'requirement',
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.error || 'Failed to process requirements';
          const rawResponse = errorData.rawResponse ? `\n\nRaw response: ${errorData.rawResponse.substring(0, 200)}...` : '';
          throw new Error(`${errorMessage}${rawResponse}`);
        }

        const data: BatchRequirementAnalysisResponse = await response.json();

        // Validate response structure
        if (!data.results || !Array.isArray(data.results)) {
          throw new Error('Invalid response format: missing results array');
        }

        // Update requirement results map
        const newResults = new Map(state.requirementResults);
        data.results.forEach((result) => {
          newResults.set(result.feedbackId, result);
        });

        setState((prev) => ({
          ...prev,
          status: 'success',
          requirementResults: newResults,
          progress: { current: data.results.length, total: feedbackItems.length },
        }));

        onRequirementSuccess?.(data.results);
        onProgress?.(data.results.length, feedbackItems.length);

        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: errorMessage,
        }));
        onError?.(errorMessage);
        throw error;
      }
    },
    [state.provider, state.requirementResults, onRequirementSuccess, onError, onProgress]
  );

  // Get result for a specific feedback ID
  const getResult = useCallback(
    (feedbackId: string): FeedbackAnalysisResult | undefined => {
      return state.results.get(feedbackId);
    },
    [state.results]
  );

  // Check if a feedback item has been processed
  const isProcessed = useCallback(
    (feedbackId: string): boolean => {
      return state.results.has(feedbackId);
    },
    [state.results]
  );

  // Get requirement result for a specific feedback ID
  const getRequirementResult = useCallback(
    (feedbackId: string): RequirementAnalysisResult | undefined => {
      return state.requirementResults.get(feedbackId);
    },
    [state.requirementResults]
  );

  // Check if a feedback item has been processed for requirements
  const hasRequirementResult = useCallback(
    (feedbackId: string): boolean => {
      return state.requirementResults.has(feedbackId);
    },
    [state.requirementResults]
  );

  return {
    // State
    status: state.status,
    provider: state.provider,
    results: state.results,
    requirementResults: state.requirementResults,
    error: state.error,
    progress: state.progress,
    isProcessing: state.status === 'processing',

    // Actions
    setProvider,
    processFeedback,
    processRequirements,
    clearResults,

    // Utilities
    getResult,
    isProcessed,
    getRequirementResult,
    hasRequirementResult,
  };
}

// Hook for managing selection state
export function useFeedbackSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string): boolean => {
      return selectedIds.has(id);
    },
    [selectedIds]
  );

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected,
    getSelectedArray: () => Array.from(selectedIds),
  };
}
