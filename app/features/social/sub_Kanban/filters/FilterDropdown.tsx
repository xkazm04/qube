'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterOption<T> {
  value: T;
  label: string;
}

interface FilterDropdownProps<T extends string> {
  label: string;
  options: FilterOption<T>[];
  selected: T[];
  onChange: (value: T) => void;
  onClearAll?: () => void;
}

export function FilterDropdown<T extends string>({
  label,
  options,
  selected,
  onChange,
  onClearAll,
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasSelection = selected.length > 0;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
          border transition-colors ${
            hasSelection
              ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/30 text-[var(--color-accent)]'
              : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
          } hover:border-[var(--color-accent)]/50`}
      >
        <span>{label}</span>
        {hasSelection && (
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-xs">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 min-w-[180px] p-1 rounded-lg
              bg-[var(--color-surface-elevated)] border border-[var(--color-border)]
              shadow-lg z-50"
          >
            {/* Select All / Clear */}
            {onClearAll && (
              <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b border-[var(--color-border)]">
                <button
                  onClick={() => options.forEach(opt => !selected.includes(opt.value) && onChange(opt.value))}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  Select all
                </button>
                <button
                  onClick={onClearAll}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Options */}
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
              {options.map(option => {
                const isSelected = selected.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm
                      text-left transition-colors ${
                        isSelected
                          ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
                      }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center
                      ${isSelected ? 'bg-[var(--color-accent)] border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FilterDropdown;
