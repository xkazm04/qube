'use client';

import { useCallback, useState } from 'react';
import type { RequirementAnalysisResult, GitHubIssueData, JiraManualTicketData } from '../lib/aiTypes';
import { useToast } from '@/app/components/ui/ToastProvider';

interface IntegrationResult {
  feedbackId: string;
  success: boolean;
  type: 'github' | 'jira';
  url?: string;
  key?: string;
  error?: string;
}

interface IntegrationState {
  isCreating: boolean;
  pendingItems: Set<string>;
  results: Map<string, IntegrationResult>;
}

/**
 * Hook for managing GitHub and JIRA integrations
 * Automatically creates issues/tickets when items move to automatic/manual columns
 */
export function useIntegrations() {
  const toast = useToast();
  const [state, setState] = useState<IntegrationState>({
    isCreating: false,
    pendingItems: new Set(),
    results: new Map(),
  });

  /**
   * Create a GitHub issue for an automatic pipeline item
   */
  const createGitHubIssue = useCallback(
    async (feedbackId: string, issue: GitHubIssueData): Promise<IntegrationResult> => {
      setState((prev) => ({
        ...prev,
        isCreating: true,
        pendingItems: new Set([...prev.pendingItems, feedbackId]),
      }));

      try {
        const response = await fetch('/api/integrations/github', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            feedbackId,
            issue,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create GitHub issue');
        }

        const result: IntegrationResult = {
          feedbackId,
          success: true,
          type: 'github',
          url: data.issue.url,
          key: `#${data.issue.number}`,
        };

        setState((prev) => {
          const newPending = new Set(prev.pendingItems);
          newPending.delete(feedbackId);
          const newResults = new Map(prev.results);
          newResults.set(feedbackId, result);
          return {
            ...prev,
            isCreating: newPending.size > 0,
            pendingItems: newPending,
            results: newResults,
          };
        });

        toast.success(
          'GitHub Issue Created',
          `Issue #${data.issue.number} created successfully`
        );

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        const result: IntegrationResult = {
          feedbackId,
          success: false,
          type: 'github',
          error: errorMessage,
        };

        setState((prev) => {
          const newPending = new Set(prev.pendingItems);
          newPending.delete(feedbackId);
          const newResults = new Map(prev.results);
          newResults.set(feedbackId, result);
          return {
            ...prev,
            isCreating: newPending.size > 0,
            pendingItems: newPending,
            results: newResults,
          };
        });

        toast.error('GitHub Issue Failed', errorMessage);
        return result;
      }
    },
    [toast]
  );

  /**
   * Create a JIRA ticket for a manual pipeline item
   */
  const createJiraTicket = useCallback(
    async (
      feedbackId: string,
      ticket: JiraManualTicketData,
      assignedTeam?: string
    ): Promise<IntegrationResult> => {
      setState((prev) => ({
        ...prev,
        isCreating: true,
        pendingItems: new Set([...prev.pendingItems, feedbackId]),
      }));

      try {
        const response = await fetch('/api/integrations/jira', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            feedbackId,
            ticket,
            assignedTeam,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create JIRA ticket');
        }

        const result: IntegrationResult = {
          feedbackId,
          success: true,
          type: 'jira',
          url: data.ticket.url,
          key: data.ticket.key,
        };

        setState((prev) => {
          const newPending = new Set(prev.pendingItems);
          newPending.delete(feedbackId);
          const newResults = new Map(prev.results);
          newResults.set(feedbackId, result);
          return {
            ...prev,
            isCreating: newPending.size > 0,
            pendingItems: newPending,
            results: newResults,
          };
        });

        toast.success(
          'JIRA Ticket Created',
          `Ticket ${data.ticket.key} created successfully`
        );

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        const result: IntegrationResult = {
          feedbackId,
          success: false,
          type: 'jira',
          error: errorMessage,
        };

        setState((prev) => {
          const newPending = new Set(prev.pendingItems);
          newPending.delete(feedbackId);
          const newResults = new Map(prev.results);
          newResults.set(feedbackId, result);
          return {
            ...prev,
            isCreating: newPending.size > 0,
            pendingItems: newPending,
            results: newResults,
          };
        });

        toast.error('JIRA Ticket Failed', errorMessage);
        return result;
      }
    },
    [toast]
  );

  /**
   * Process requirement analysis results and create integrations
   * - Items going to 'automatic' → Create GitHub issue
   * - Items going to 'manual' → Create JIRA ticket
   */
  const processIntegrationsFromResults = useCallback(
    async (results: RequirementAnalysisResult[]): Promise<Map<string, IntegrationResult>> => {
      const integrationResults = new Map<string, IntegrationResult>();

      // Process in parallel for efficiency
      const promises = results.map(async (result) => {
        if (result.analysisOutcome === 'automatic' && result.automaticIssue) {
          // Create GitHub issue for automatic items
          const integrationResult = await createGitHubIssue(
            result.feedbackId,
            result.automaticIssue
          );
          integrationResults.set(result.feedbackId, integrationResult);
        } else if (result.analysisOutcome === 'manual' && result.manualTicket) {
          // Create JIRA ticket for manual items
          const integrationResult = await createJiraTicket(
            result.feedbackId,
            result.manualTicket
          );
          integrationResults.set(result.feedbackId, integrationResult);
        }
      });

      await Promise.all(promises);
      return integrationResults;
    },
    [createGitHubIssue, createJiraTicket]
  );

  /**
   * Get the integration result for a feedback item
   */
  const getResult = useCallback(
    (feedbackId: string): IntegrationResult | undefined => {
      return state.results.get(feedbackId);
    },
    [state.results]
  );

  /**
   * Check if an item has a pending integration
   */
  const isPending = useCallback(
    (feedbackId: string): boolean => {
      return state.pendingItems.has(feedbackId);
    },
    [state.pendingItems]
  );

  /**
   * Clear all results
   */
  const clearResults = useCallback(() => {
    setState({
      isCreating: false,
      pendingItems: new Set(),
      results: new Map(),
    });
  }, []);

  return {
    // State
    isCreating: state.isCreating,
    pendingItems: state.pendingItems,
    results: state.results,

    // Actions
    createGitHubIssue,
    createJiraTicket,
    processIntegrationsFromResults,
    clearResults,

    // Utilities
    getResult,
    isPending,
  };
}
