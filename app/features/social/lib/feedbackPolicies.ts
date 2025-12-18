/**
 * Feedback Policies - Priority SLAs and State Transition Rules
 *
 * This file documents and enforces:
 * 1. Priority level meanings and SLA response times
 * 2. Valid ticket status transitions
 * 3. Valid reply status transitions and retry behavior
 */

import type { TicketStatus, ReplyStatus } from './types';

// =============================================================================
// PRIORITY DEFINITIONS AND SLAs
// =============================================================================

/**
 * Priority levels for feedback items and tickets.
 * Each level has a defined meaning and expected response time (SLA).
 */
export type Priority = 'low' | 'medium' | 'high' | 'critical';

/**
 * SLA configuration for each priority level.
 */
export interface PrioritySLA {
  /** The priority level */
  priority: Priority;
  /** Human-readable name for display */
  displayName: string;
  /** Description of what this priority level means */
  description: string;
  /** Maximum response time in hours */
  responseTimeHours: number;
  /** Human-readable response time */
  responseTimeDisplay: string;
  /** Whether this priority requires immediate escalation */
  requiresEscalation: boolean;
  /** Color code for UI display */
  colorCode: string;
}

/**
 * Priority SLA definitions - defines what each priority level means
 * and the expected response times.
 */
export const PRIORITY_SLAS: Record<Priority, PrioritySLA> = {
  critical: {
    priority: 'critical',
    displayName: 'Critical',
    description:
      'Service outage, security vulnerability, or issue affecting many users. Requires immediate attention and escalation to senior team members.',
    responseTimeHours: 4,
    responseTimeDisplay: '4 hours',
    requiresEscalation: true,
    colorCode: '#ef4444', // red-500
  },
  high: {
    priority: 'high',
    displayName: 'High',
    description:
      'Significant functionality broken or major user experience degradation. Important issue requiring prompt attention within the business day.',
    responseTimeHours: 24,
    responseTimeDisplay: '24 hours',
    requiresEscalation: false,
    colorCode: '#eab308', // yellow-500
  },
  medium: {
    priority: 'medium',
    displayName: 'Medium',
    description:
      'Moderate issue with available workaround, or feature request from active users. Should be addressed within a reasonable timeframe.',
    responseTimeHours: 48,
    responseTimeDisplay: '48 hours',
    requiresEscalation: false,
    colorCode: '#3b82f6', // blue-500
  },
  low: {
    priority: 'low',
    displayName: 'Low',
    description:
      'Minor issue, cosmetic problem, or general feedback. Addressed on a best-effort basis as resources permit.',
    responseTimeHours: Infinity,
    responseTimeDisplay: 'Best effort',
    requiresEscalation: false,
    colorCode: '#22c55e', // green-500
  },
};

/**
 * Get the SLA configuration for a given priority level.
 */
export function getPrioritySLA(priority: Priority): PrioritySLA {
  return PRIORITY_SLAS[priority];
}

/**
 * Check if a ticket/feedback is past its SLA deadline.
 * @param priority - The priority level
 * @param createdAt - When the item was created
 * @param now - Current time (defaults to now)
 * @returns true if SLA is breached, false otherwise
 */
export function isSLABreached(
  priority: Priority,
  createdAt: Date,
  now: Date = new Date()
): boolean {
  const sla = PRIORITY_SLAS[priority];
  if (sla.responseTimeHours === Infinity) {
    return false; // Best effort never breaches
  }
  const deadlineMs = createdAt.getTime() + sla.responseTimeHours * 60 * 60 * 1000;
  return now.getTime() > deadlineMs;
}

/**
 * Get time remaining until SLA breach in milliseconds.
 * Returns negative value if already breached, Infinity for best-effort.
 */
export function getTimeToSLABreach(
  priority: Priority,
  createdAt: Date,
  now: Date = new Date()
): number {
  const sla = PRIORITY_SLAS[priority];
  if (sla.responseTimeHours === Infinity) {
    return Infinity;
  }
  const deadlineMs = createdAt.getTime() + sla.responseTimeHours * 60 * 60 * 1000;
  return deadlineMs - now.getTime();
}

// =============================================================================
// TICKET STATUS TRANSITIONS
// =============================================================================

/**
 * Valid transitions for ticket statuses.
 * Key: current status, Value: array of valid next statuses
 *
 * Transition rules:
 * - created → in_progress: Work has begun on the ticket
 * - created → closed: Ticket was closed without being worked (e.g., duplicate)
 * - in_progress → resolved: Issue has been fixed/addressed
 * - in_progress → created: Work was paused, ticket returned to queue (deprioritized)
 * - resolved → in_progress: Issue reopened (regression or incomplete fix)
 * - resolved → closed: Resolution verified and ticket finalized
 * - closed → in_progress: Reopened after being closed (rare, for edge cases)
 */
export const VALID_TICKET_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  created: ['in_progress', 'closed'],
  in_progress: ['resolved', 'created'],
  resolved: ['in_progress', 'closed'],
  closed: ['in_progress'],
};

/**
 * Human-readable descriptions for ticket status transitions.
 */
export const TICKET_TRANSITION_DESCRIPTIONS: Record<
  TicketStatus,
  Record<TicketStatus, string>
> = {
  created: {
    created: '',
    in_progress: 'Start working on this ticket',
    resolved: '',
    closed: 'Close without working (duplicate, invalid, etc.)',
  },
  in_progress: {
    created: 'Return to queue (deprioritize)',
    in_progress: '',
    resolved: 'Mark as resolved (issue fixed)',
    closed: '',
  },
  resolved: {
    created: '',
    in_progress: 'Reopen (regression or incomplete fix)',
    resolved: '',
    closed: 'Finalize and close',
  },
  closed: {
    created: '',
    in_progress: 'Reopen and resume work',
    resolved: '',
    closed: '',
  },
};

/**
 * Type guard to check if a ticket status transition is valid.
 * @param currentStatus - The current status of the ticket
 * @param nextStatus - The proposed next status
 * @returns true if the transition is valid, false otherwise
 */
export function isValidTicketTransition(
  currentStatus: TicketStatus,
  nextStatus: TicketStatus
): boolean {
  if (currentStatus === nextStatus) {
    return false; // Cannot transition to same status
  }
  return VALID_TICKET_TRANSITIONS[currentStatus].includes(nextStatus);
}

/**
 * Get all valid next statuses for a given ticket status.
 */
export function getValidTicketNextStatuses(currentStatus: TicketStatus): TicketStatus[] {
  return VALID_TICKET_TRANSITIONS[currentStatus];
}

/**
 * Assert that a ticket transition is valid, throwing an error if not.
 * Use this for runtime validation before state changes.
 */
export function assertValidTicketTransition(
  currentStatus: TicketStatus,
  nextStatus: TicketStatus
): void {
  if (!isValidTicketTransition(currentStatus, nextStatus)) {
    throw new Error(
      `Invalid ticket status transition: cannot transition from '${currentStatus}' to '${nextStatus}'. ` +
        `Valid transitions from '${currentStatus}' are: [${VALID_TICKET_TRANSITIONS[currentStatus].join(', ')}]`
    );
  }
}

// =============================================================================
// REPLY STATUS TRANSITIONS
// =============================================================================

/**
 * Valid transitions for reply statuses.
 * Key: current status, Value: array of valid next statuses
 *
 * Transition rules:
 * - draft → sending: User initiated send action
 * - draft → (deleted): Drafts can be deleted (not a status, just removed)
 * - sending → sent: Send operation completed successfully
 * - sending → failed: Send operation failed
 * - sent → (terminal): Sent is a terminal state, no further transitions
 * - failed → sending: Retry the send operation
 * - failed → draft: Return to editing before retry
 */
export const VALID_REPLY_TRANSITIONS: Record<ReplyStatus, ReplyStatus[]> = {
  draft: ['sending'],
  sending: ['sent', 'failed'],
  sent: [], // Terminal state
  failed: ['sending', 'draft'],
};

/**
 * Human-readable descriptions for reply status transitions.
 */
export const REPLY_TRANSITION_DESCRIPTIONS: Record<
  ReplyStatus,
  Record<ReplyStatus, string>
> = {
  draft: {
    draft: '',
    sending: 'Send the reply',
    sent: '',
    failed: '',
  },
  sending: {
    draft: '',
    sending: '',
    sent: 'Send completed successfully',
    failed: 'Send operation failed',
  },
  sent: {
    draft: '',
    sending: '',
    sent: '',
    failed: '',
  },
  failed: {
    draft: 'Return to draft for editing',
    sending: 'Retry sending',
    sent: '',
    failed: '',
  },
};

/**
 * Type guard to check if a reply status transition is valid.
 * @param currentStatus - The current status of the reply
 * @param nextStatus - The proposed next status
 * @returns true if the transition is valid, false otherwise
 */
export function isValidReplyTransition(
  currentStatus: ReplyStatus,
  nextStatus: ReplyStatus
): boolean {
  if (currentStatus === nextStatus) {
    return false; // Cannot transition to same status
  }
  return VALID_REPLY_TRANSITIONS[currentStatus].includes(nextStatus);
}

/**
 * Get all valid next statuses for a given reply status.
 */
export function getValidReplyNextStatuses(currentStatus: ReplyStatus): ReplyStatus[] {
  return VALID_REPLY_TRANSITIONS[currentStatus];
}

/**
 * Assert that a reply transition is valid, throwing an error if not.
 * Use this for runtime validation before state changes.
 */
export function assertValidReplyTransition(
  currentStatus: ReplyStatus,
  nextStatus: ReplyStatus
): void {
  if (!isValidReplyTransition(currentStatus, nextStatus)) {
    throw new Error(
      `Invalid reply status transition: cannot transition from '${currentStatus}' to '${nextStatus}'. ` +
        `Valid transitions from '${currentStatus}' are: [${VALID_REPLY_TRANSITIONS[currentStatus].join(', ') || 'none (terminal state)'}]`
    );
  }
}

// =============================================================================
// RETRY BEHAVIOR FOR FAILED REPLIES
// =============================================================================

/**
 * Configuration for retry behavior when reply sending fails.
 */
export interface ReplyRetryConfig {
  /** Maximum number of automatic retry attempts */
  maxRetries: number;
  /** Base delay between retries in milliseconds */
  baseDelayMs: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
  /** Maximum delay cap in milliseconds */
  maxDelayMs: number;
}

/**
 * Default retry configuration for failed replies.
 * Uses exponential backoff: 1s, 2s, 4s, 8s... capped at 30s
 */
export const DEFAULT_REPLY_RETRY_CONFIG: ReplyRetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 30000,
};

/**
 * Calculate the delay before the next retry attempt.
 * @param attemptNumber - The retry attempt number (1-based)
 * @param config - Retry configuration (defaults to DEFAULT_REPLY_RETRY_CONFIG)
 * @returns Delay in milliseconds before next retry
 */
export function calculateRetryDelay(
  attemptNumber: number,
  config: ReplyRetryConfig = DEFAULT_REPLY_RETRY_CONFIG
): number {
  const delay =
    config.baseDelayMs * Math.pow(config.backoffMultiplier, attemptNumber - 1);
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Check if another retry should be attempted.
 * @param currentAttempt - Current attempt number (1-based)
 * @param config - Retry configuration
 * @returns true if another retry is allowed
 */
export function shouldRetry(
  currentAttempt: number,
  config: ReplyRetryConfig = DEFAULT_REPLY_RETRY_CONFIG
): boolean {
  return currentAttempt < config.maxRetries;
}

// =============================================================================
// TYPE GUARDS FOR PRIORITY
// =============================================================================

/**
 * All valid priority values.
 */
export const ALL_PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];

/**
 * Type guard to check if a value is a valid Priority.
 */
export function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && ALL_PRIORITIES.includes(value as Priority);
}

/**
 * Assert that a value is a valid Priority.
 */
export function assertPriority(value: unknown): asserts value is Priority {
  if (!isPriority(value)) {
    throw new Error(
      `Invalid priority: '${value}'. Valid priorities are: [${ALL_PRIORITIES.join(', ')}]`
    );
  }
}

// =============================================================================
// STATUS TYPE GUARDS
// =============================================================================

/**
 * All valid ticket statuses.
 */
export const ALL_TICKET_STATUSES: TicketStatus[] = [
  'created',
  'in_progress',
  'resolved',
  'closed',
];

/**
 * All valid reply statuses.
 */
export const ALL_REPLY_STATUSES: ReplyStatus[] = ['draft', 'sending', 'sent', 'failed'];

/**
 * Type guard to check if a value is a valid TicketStatus.
 */
export function isTicketStatus(value: unknown): value is TicketStatus {
  return (
    typeof value === 'string' && ALL_TICKET_STATUSES.includes(value as TicketStatus)
  );
}

/**
 * Type guard to check if a value is a valid ReplyStatus.
 */
export function isReplyStatus(value: unknown): value is ReplyStatus {
  return typeof value === 'string' && ALL_REPLY_STATUSES.includes(value as ReplyStatus);
}

/**
 * Assert that a value is a valid TicketStatus.
 */
export function assertTicketStatus(value: unknown): asserts value is TicketStatus {
  if (!isTicketStatus(value)) {
    throw new Error(
      `Invalid ticket status: '${value}'. Valid statuses are: [${ALL_TICKET_STATUSES.join(', ')}]`
    );
  }
}

/**
 * Assert that a value is a valid ReplyStatus.
 */
export function assertReplyStatus(value: unknown): asserts value is ReplyStatus {
  if (!isReplyStatus(value)) {
    throw new Error(
      `Invalid reply status: '${value}'. Valid statuses are: [${ALL_REPLY_STATUSES.join(', ')}]`
    );
  }
}
