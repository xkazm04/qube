import type { FeedbackItem } from '../../lib/kanbanTypes';
import type { ClassificationResult, RequirementAnalysisResult } from '../../lib/aiTypes';
import type { UseFeedbackItemsResult } from '../../hooks/useFeedbackItems';
import type { ToastContextType } from '@/app/components/ui/ToastProvider';

export async function handleCreateGithubIssue(
  item: FeedbackItem,
  aiResults: Map<string, ClassificationResult>,
  requirementResults: Map<string, RequirementAnalysisResult> | undefined,
  feedbackState: UseFeedbackItemsResult,
  addEvent: (event: any) => void,
  toast: ToastContextType
) {
  // Create GitHub issue via API
  const aiResult = aiResults.get(item.id);
  const reqResult = requirementResults?.get?.(item.id);
  
  // Get GitHub issue data from requirement result or construct from AI result
  const githubIssue = reqResult?.automaticIssue || (aiResult ? {
    title: aiResult.title || 'Issue from feedback',
    labels: ['bug', 'ai-generated', aiResult.classification],
    body: {
      summary: aiResult.jiraTicket?.summary || 'Issue detected from customer feedback',
      context: `Customer feedback from ${item.channel} channel`,
      technicalAnalysis: aiResult.reasoning || 'Analysis pending',
      proposedSolution: 'To be determined',
      implementationSteps: [{ step: 1, description: 'Investigate the reported issue' }],
      filesAffected: [],
      testingGuidance: 'Manual testing required',
    },
  } : null);

  if (!githubIssue) {
    toast.error('Missing data', 'No GitHub issue data available. Please analyze the item first.');
    return;
  }

  toast.info('Creating issue...', 'Sending request to GitHub');

  try {
    const response = await fetch('/api/integrations/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feedbackId: item.id,
        issue: githubIssue,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create GitHub issue');
    }

    const result = await response.json();
    
    // Update item with GitHub issue URL
    feedbackState.updateItem(item.id, (fb) => ({
      ...fb,
      githubIssueUrl: result.issue.url,
    }));
    
    addEvent({ feedbackId: item.id, type: 'ticket_linked', actor: 'user', metadata: { url: result.issue.url, type: 'github' } });
    toast.success('GitHub issue created', `Created issue #${result.issue.number}`);
  } catch (error) {
    toast.error('Failed to create issue', error instanceof Error ? error.message : 'Unknown error');
  }
}
