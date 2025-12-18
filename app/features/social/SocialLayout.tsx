'use client';

import React from 'react';
import KanbanBoard from './sub_Kanban/KanbanBoard';

export default function SocialLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="p-4">
        <KanbanBoard />
      </div>
    </div>
  );
}
