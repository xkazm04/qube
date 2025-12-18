'use client';

import { useState, useCallback, useMemo, createContext, useContext, type ReactNode } from 'react';
import type { ActivityEvent, ActivityType, Actor, ActivityFilter } from './activityTypes';

interface ActivityState {
  events: ActivityEvent[];
  // Indexed structure for O(1) lookups by feedbackId
  eventsByFeedbackId: Map<string, ActivityEvent[]>;
}

interface ActivityContextValue extends ActivityState {
  addEvent: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  getItemEvents: (feedbackId: string) => ActivityEvent[];
  filterEvents: (filter: Partial<ActivityFilter>) => ActivityEvent[];
  clearEvents: () => void;
}

const ActivityContext = createContext<ActivityContextValue | null>(null);

let eventIdCounter = 0;

// Helper to rebuild the feedbackId index from events array
function buildFeedbackIndex(events: ActivityEvent[]): Map<string, ActivityEvent[]> {
  const index = new Map<string, ActivityEvent[]>();
  for (const event of events) {
    const existing = index.get(event.feedbackId);
    if (existing) {
      existing.push(event);
    } else {
      index.set(event.feedbackId, [event]);
    }
  }
  return index;
}

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ActivityState>({
    events: [],
    eventsByFeedbackId: new Map(),
  });

  const addEvent = useCallback((event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: `activity-${++eventIdCounter}`,
      timestamp: new Date().toISOString(),
    };
    setState(prev => {
      const newEvents = [newEvent, ...prev.events].slice(0, 500); // Keep last 500 events

      // Update the index efficiently - rebuild only if events were truncated
      let newIndex: Map<string, ActivityEvent[]>;
      if (prev.events.length >= 500) {
        // Events were truncated, rebuild the index
        newIndex = buildFeedbackIndex(newEvents);
      } else {
        // Just add to existing index
        newIndex = new Map(prev.eventsByFeedbackId);
        const existing = newIndex.get(newEvent.feedbackId);
        if (existing) {
          // Add to beginning of array (new events are prepended)
          newIndex.set(newEvent.feedbackId, [newEvent, ...existing]);
        } else {
          newIndex.set(newEvent.feedbackId, [newEvent]);
        }
      }

      return {
        events: newEvents,
        eventsByFeedbackId: newIndex,
      };
    });
  }, []);

  // O(1) lookup using indexed structure
  const getItemEvents = useCallback((feedbackId: string) => {
    return state.eventsByFeedbackId.get(feedbackId) ?? [];
  }, [state.eventsByFeedbackId]);

  const filterEvents = useCallback((filter: Partial<ActivityFilter>) => {
    return state.events.filter(event => {
      if (filter.types?.length && !filter.types.includes(event.type)) return false;
      if (filter.feedbackIds?.length && !filter.feedbackIds.includes(event.feedbackId)) return false;
      if (filter.actors?.length && !filter.actors.includes(event.actor)) return false;
      return true;
    });
  }, [state.events]);

  const clearEvents = useCallback(() => {
    setState({ events: [], eventsByFeedbackId: new Map() });
  }, []);

  const value: ActivityContextValue = {
    events: state.events,
    eventsByFeedbackId: state.eventsByFeedbackId,
    addEvent,
    getItemEvents,
    filterEvents,
    clearEvents,
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}

// Standalone hook for components outside provider (returns empty state)
export function useActivityEvents(feedbackId?: string) {
  const context = useContext(ActivityContext);

  return useMemo(() => {
    if (!context) return [];
    if (feedbackId) return context.getItemEvents(feedbackId);
    return context.events;
  }, [context, feedbackId]);
}

// Helper to create common events
export function createStatusChangeEvent(
  feedbackId: string,
  from: string,
  to: string,
  actor: Actor = 'user'
): Omit<ActivityEvent, 'id' | 'timestamp'> {
  return {
    feedbackId,
    type: 'status_changed',
    actor,
    metadata: { from, to },
  };
}

export function createAnalyzedEvent(
  feedbackId: string,
  confidence: number
): Omit<ActivityEvent, 'id' | 'timestamp'> {
  return {
    feedbackId,
    type: 'analyzed',
    actor: 'ai',
    metadata: { confidence },
  };
}

export function createTicketLinkedEvent(
  feedbackId: string,
  ticketId: string
): Omit<ActivityEvent, 'id' | 'timestamp'> {
  return {
    feedbackId,
    type: 'ticket_linked',
    actor: 'user',
    metadata: { ticketId },
  };
}
