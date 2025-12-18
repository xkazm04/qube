// SLA Types for Kanban Board
import type { KanbanChannel, KanbanPriority } from '../../lib/kanbanTypes';

export type SLAStatus = 'ok' | 'warning' | 'critical' | 'overdue';

export interface SLAConfig {
  channel: KanbanChannel;
  priority: KanbanPriority;
  warningMinutes: number;    // Time until "warning" state
  criticalMinutes: number;   // Time until "critical" state
  overdueMinutes: number;    // Time until "overdue" state
}

export interface SLAInfo {
  status: SLAStatus;
  ageMinutes: number;
  remainingMinutes: number | null;  // null when overdue
  formattedAge: string;
  formattedRemaining: string;
  percentComplete: number;  // 0-100, for progress visualization
}

export interface SLAThresholds {
  warning: number;
  critical: number;
  overdue: number;
}
