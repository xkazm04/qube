'use client';

import React from 'react';
import KanbanBoard from './sub_Kanban/KanbanBoard';
import SocialBackground from './components/SocialBackground';

export default function SocialLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] relative">
      {/* Premium gradient/patterned background */}
      <SocialBackground />

      {/* Main content */}
      <div className="relative z-10 p-4">
        <KanbanBoard />
      </div>
    </div>
  );
}
