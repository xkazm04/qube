'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';
import type { AIProvider, AIProcessingStatus } from '../lib/aiTypes';

interface AIProcessingPanelProps {
  selectedCount: number;
  provider: AIProvider;
  processingStatus: AIProcessingStatus;
  progress?: { current: number; total: number };
  error?: string;
  onProviderChange: (provider: AIProvider) => void;
  onProcess: () => void;
  onClearSelection: () => void;
  onSelectAllNew: () => void;
  newItemsCount: number;
}

export default function AIProcessingPanel({
  selectedCount,
  provider,
  processingStatus,
  progress,
  error,
  onProviderChange,
  onProcess,
  onClearSelection,
  onSelectAllNew,
  newItemsCount,
}: AIProcessingPanelProps) {
  const isProcessing = processingStatus === 'processing';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)]"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Left: Selection info and quick actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              AI Analysis
            </span>
            {selectedCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium text-white bg-blue-500 rounded-full">
                {selectedCount} selected
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-[var(--color-border-subtle)]" />

          {/* Quick selection buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSelectAllNew}
              disabled={newItemsCount === 0 || isProcessing}
              className="px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] rounded-[var(--radius-md)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select all new ({newItemsCount})
            </button>
            <button
              onClick={onClearSelection}
              disabled={selectedCount === 0 || isProcessing}
              className="px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] rounded-[var(--radius-md)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear selection
            </button>
          </div>
        </div>

        {/* Center: Provider selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">Provider:</span>
          <div className="flex rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] overflow-hidden">
            <button
              onClick={() => onProviderChange('gemini')}
              disabled={isProcessing}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                provider === 'gemini'
                  ? 'bg-blue-500 text-white'
                  : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              } disabled:opacity-50`}
            >
              Gemini 2.5 Flash
            </button>
            <button
              onClick={() => onProviderChange('claude')}
              disabled={isProcessing}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-[var(--color-border-subtle)] ${
                provider === 'claude'
                  ? 'bg-orange-500 text-white'
                  : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              } disabled:opacity-50`}
            >
              Claude Haiku
            </button>
          </div>
        </div>

        {/* Right: Process button */}
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {error && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-xs text-red-400 max-w-[200px] truncate"
                title={error}
              >
                {error}
              </motion.span>
            )}
          </AnimatePresence>

          <button
            onClick={onProcess}
            disabled={selectedCount === 0 || isProcessing}
            className={`
              relative px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-all
              ${
                isProcessing
                  ? 'bg-blue-500/20 text-blue-400 cursor-wait'
                  : selectedCount > 0
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25'
                  : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] cursor-not-allowed'
              }
            `}
          >
            <span className={isProcessing ? 'opacity-0' : ''}>
              Process with AI
            </span>
            {isProcessing && (
              <span className="absolute inset-0 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                <span>
                  {progress ? `${progress.current}/${progress.total}` : 'Processing...'}
                </span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <AnimatePresence>
        {isProcessing && progress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-[var(--color-border-subtle)]"
          >
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-1">
              <span>Analyzing feedback with {provider === 'gemini' ? 'Gemini' : 'Claude'}...</span>
              <span>{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success state */}
      <AnimatePresence>
        {processingStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] flex items-center gap-2 text-green-400"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Analysis complete! Items moved to Analyzed column.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
