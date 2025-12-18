'use client';

import { useState, useCallback } from 'react';
import type {
  AIProvider,
  AIProcessingStatus,
  FeedbackAnalysisResult,
  BatchAnalysisResponse,
  UIFeedbackItem,
} from '../lib/aiTypes';

interface UseAIProcessingOptions {
  onSuccess?: (results: FeedbackAnalysisResult[]) => void;
  onError?: (error: string) => void;
  onProgress?: (current: number, total: number) => void;
}

interface AIProcessingState {
  status: AIProcessingStatus;
  provider: AIProvider;
  results: Map<string, FeedbackAnalysisResult>;
  error?: string;
  progress?: {
    current: number;
    total: number;
  };
}

export function useAIProcessing(options: UseAIProcessingOptions = {}) {
  const { onSuccess, onError, onProgress } = options;

  const [state, setState] = useState<AIProcessingState>({
    status: 'idle',
    provider: 'gemini',
    results: new Map(),
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
          throw new Error(errorData.error || 'Failed to process feedback');
        }

        const data: BatchAnalysisResponse = await response.json();

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

  return {
    // State
    status: state.status,
    provider: state.provider,
    results: state.results,
    error: state.error,
    progress: state.progress,
    isProcessing: state.status === 'processing',

    // Actions
    setProvider,
    processFeedback,
    clearResults,

    // Utilities
    getResult,
    isProcessed,
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
