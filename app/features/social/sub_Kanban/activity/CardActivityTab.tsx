'use client';

import { ActivityTimeline } from './ActivityTimeline';
import { useActivityEvents } from './useActivity';

interface CardActivityTabProps {
  feedbackId: string;
}

export function CardActivityTab({ feedbackId }: CardActivityTabProps) {
  const events = useActivityEvents(feedbackId);

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
        Activity History
      </h3>
      <ActivityTimeline events={events} maxItems={20} />
    </div>
  );
}

export default CardActivityTab;
