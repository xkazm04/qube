'use client';

import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface SwimlaneHeaderProps {
  label: string;
  count: number;
  color: string;
  icon?: LucideIcon;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SwimlaneHeader({
  label,
  count,
  color,
  icon: Icon,
  isCollapsed,
  onToggle,
}: SwimlaneHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 p-3 rounded-lg
        bg-[var(--color-surface)] border border-[var(--color-border)]
        hover:bg-[var(--color-surface-elevated)] transition-colors"
    >
      {/* Collapse indicator */}
      <motion.div
        animate={{ rotate: isCollapsed ? 0 : 90 }}
        transition={{ duration: 0.15 }}
      >
        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
      </motion.div>

      {/* Color indicator */}
      <div className={`w-3 h-3 rounded-full ${color}`} />

      {/* Icon (if provided) */}
      {Icon && <Icon className="w-4 h-4 text-[var(--color-text-secondary)]" />}

      {/* Label */}
      <span className="font-medium text-[var(--color-text-primary)]">{label}</span>

      {/* Count badge */}
      <span className="px-2 py-0.5 rounded-full text-xs font-medium
        bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]
        border border-[var(--color-border-subtle)]">
        {count}
      </span>

      {/* Spacer */}
      <span className="flex-1" />

      {/* Keyboard hint */}
      <span className="text-[10px] text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100">
        {isCollapsed ? 'Expand' : 'Collapse'}
      </span>
    </button>
  );
}

export default SwimlaneHeader;
