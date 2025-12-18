'use client';

import { LayoutGrid, Rows3, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ViewMode, GroupByField } from './swimlaneTypes';
import { GROUP_BY_LABELS } from './swimlaneTypes';

interface ViewToggleProps {
  viewMode: ViewMode;
  groupBy: GroupByField;
  onViewModeChange: (mode: ViewMode) => void;
  onGroupByChange: (groupBy: GroupByField) => void;
}

export function ViewToggle({
  viewMode,
  groupBy,
  onViewModeChange,
  onGroupByChange,
}: ViewToggleProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* View mode toggle */}
      <div className="flex items-center rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-0.5">
        <button
          onClick={() => onViewModeChange('board')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
            viewMode === 'board'
              ? 'bg-[var(--color-accent)] text-white'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Board
        </button>
        <button
          onClick={() => onViewModeChange('swimlanes')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
            viewMode === 'swimlanes'
              ? 'bg-[var(--color-accent)] text-white'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Rows3 className="w-4 h-4" />
          Swimlanes
        </button>
      </div>

      {/* Group by dropdown (only visible in swimlanes mode) */}
      <AnimatePresence>
        {viewMode === 'swimlanes' && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="relative overflow-hidden"
          >
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                bg-[var(--color-surface)] border border-[var(--color-border)]
                text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                hover:border-[var(--color-accent)]/50 transition-colors"
            >
              <span className="text-[var(--color-text-muted)]">Group:</span>
              <span className="font-medium text-[var(--color-text-primary)]">
                {GROUP_BY_LABELS[groupBy]}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-0 mt-1 min-w-[140px] p-1 rounded-lg
                    bg-[var(--color-surface-elevated)] border border-[var(--color-border)]
                    shadow-lg z-50"
                >
                  {(Object.keys(GROUP_BY_LABELS) as GroupByField[]).map(key => (
                    <button
                      key={key}
                      onClick={() => {
                        onGroupByChange(key);
                        setShowDropdown(false);
                      }}
                      className={`w-full px-3 py-1.5 rounded text-sm text-left transition-colors ${
                        groupBy === key
                          ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
                      }`}
                    >
                      {GROUP_BY_LABELS[key]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ViewToggle;
