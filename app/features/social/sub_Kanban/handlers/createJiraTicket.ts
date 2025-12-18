import type { FeedbackItem } from '../../lib/kanbanTypes';
import type { ClassificationResult } from '../../lib/aiTypes';
import type { UseFeedbackItemsResult } from '../../hooks/useFeedbackItems';
import type { ToastContextType } from '@/app/components/ui/ToastProvider';

export async function handleCreateJiraTicket(
  item: FeedbackItem,
  aiResults: Map<string, ClassificationResult>,
  feedbackState: UseFeedbackItemsResult,
  addEvent: (event: any) => void,
  toast: ToastContextType
) {
  // Create JIRA ticket via API
  const aiResult = aiResults.get(item.id);
  if (!aiResult?.jiraTicket) {
    toast.error('Missing data', 'No JIRA ticket data available. Please analyze the item first.');
    return;
  }

  toast.info('Creating ticket...', 'Sending request to JIRA');

  try {
    const response = await fetch('/api/integrations/jira', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feedbackId: item.id,
        ticket: aiResult.jiraTicket,
        assignedTeam: aiResult.assignedTeam,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create JIRA ticket');
    }

    const result = await response.json();
    
    // Update item with JIRA ticket key
    feedbackState.updateItem(item.id, (fb) => ({
      ...fb,
      jiraTicketKey: result.ticket.key,
      linkedTickets: [...(fb.linkedTickets || []), result.ticket.key],
    }));
    
    addEvent({ feedbackId: item.id, type: 'ticket_linked', actor: 'user', metadata: { ticketId: result.ticket.key, type: 'jira' } });
    toast.success('JIRA ticket created', `Created ${result.ticket.key}`);
  } catch (error) {
    toast.error('Failed to create ticket', error instanceof Error ? error.message : 'Unknown error');
  }
}
