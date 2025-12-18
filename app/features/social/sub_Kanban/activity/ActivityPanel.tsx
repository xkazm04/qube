'use client';

import { useState } from 'react';
import { X, Activity, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ActivityType, Actor } from './activityTypes';
import { ACTIVITY_TYPE_LABELS, ACTOR_LABELS } from './activityTypes';
import { ActivityTimeline } from './ActivityTimeline';
import { useActivity } from './useActivity';

interface ActivityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToItem?: (feedbackId: string) => void;
}

export function ActivityPanel({ isOpen, onClose, onJumpToItem }: ActivityPanelProps) {
  const { events, filterEvents } = useActivity();
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>([]);
  const [selectedActors, setSelectedActors] = useState<Actor[]>([]);

  const filteredEvents = filterEvents({
    types: selectedTypes.length ? selectedTypes : undefined,
    actors: selectedActors.length ? selectedActors : undefined,
  });

  const toggleType = (type: ActivityType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleActor = (actor: Actor) => {
    setSelectedActors(prev =>
      prev.includes(actor) ? prev.filter(a => a !== actor) : [...prev, actor]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="h-full w-[320px] flex flex-col bg-[var(--color-surface)]
            border-r border-[var(--color-border)] shadow-2xl shadow-black/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <span className="font-medium text-[var(--color-text-primary)]">Activity</span>
              <span className="px-1.5 py-0.5 rounded text-xs bg-[var(--color-surface-elevated)]
                text-[var(--color-text-muted)]">
                {events.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[var(--color-surface-elevated)] transition-colors"
            >
              <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-3 border-b border-[var(--color-border)] space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              <Filter className="w-3 h-3" />
              <span>Filter by</span>
            </div>

            {/* Actor filters */}
            <div className="flex flex-wrap gap-1">
              {(Object.keys(ACTOR_LABELS) as Actor[]).map(actor => (
                <button
                  key={actor}
                  onClick={() => toggleActor(actor)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    selectedActors.includes(actor)
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {ACTOR_LABELS[actor]}
                </button>
              ))}
            </div>

            {/* Type filters (scrollable) */}
            <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto custom-scrollbar">
              {(Object.keys(ACTIVITY_TYPE_LABELS) as ActivityType[]).slice(0, 5).map(type => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                    selectedTypes.includes(type)
                      ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30'
                      : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                  }`}
                >
                  {ACTIVITY_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            <ActivityTimeline
              events={filteredEvents}
              showFeedbackId
              onJumpToItem={onJumpToItem}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ActivityPanel;
