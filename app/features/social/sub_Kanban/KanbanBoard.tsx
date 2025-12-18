'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Twitter,
  Facebook,
  MessageCircle,
  Star,
  Smartphone,
  Instagram,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react';
import type { FeedbackItem, KanbanStatus, KanbanChannel } from '../lib/kanbanTypes';
import { KANBAN_COLUMNS } from '../lib/kanbanTypes';
import { mockKanbanFeedback } from '../lib/kanbanMockData';
import { transformDatasetToFeedbackItem } from '../lib/datasetLoader';
import type { AIProvider, FeedbackAnalysisResult, UIFeedbackItem } from '../lib/aiTypes';
import { useAIProcessing, useFeedbackSelection } from '../hooks/useAIProcessing';
import KanbanColumn from './KanbanColumn';
import CardDetailModal from './CardDetailModal';
import AIProcessingPanel from './AIProcessingPanel';

// Channel icon mapping
const ChannelIconMap: Record<KanbanChannel, LucideIcon> = {
  email: Mail,
  twitter: Twitter,
  facebook: Facebook,
  support_chat: MessageCircle,
  trustpilot: Star,
  app_store: Smartphone,
  instagram: Instagram,
};

interface KanbanBoardProps {
  useDataset?: boolean;
}

export default function KanbanBoard({ useDataset = false }: KanbanBoardProps) {
  // Initialize with empty "new" items to simulate empty state
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(() => 
    mockKanbanFeedback.filter(item => item.status !== 'new')
  );
  const [datasetLoaded, setDatasetLoaded] = useState(false);

  // Load dataset if enabled
  useEffect(() => {
    if (useDataset && !datasetLoaded) {
      fetch('/api/dataset')
        .then((res) => res.json())
        .then((data) => {
          if (data.feedback) {
            const transformedItems = data.feedback.map(
              (item: Parameters<typeof transformDatasetToFeedbackItem>[0], index: number) =>
                transformDatasetToFeedbackItem(item, index)
            );
            setFeedbackItems(transformedItems);
            setDatasetLoaded(true);
          }
        })
        .catch((err) => {
          console.error('Failed to load dataset:', err);
        });
    }
  }, [useDataset, datasetLoaded]);

  // Emulate loading data for a specific channel
  const handleLoadChannelData = useCallback((channel: KanbanChannel) => {
    const newItems = mockKanbanFeedback
      .filter(item => item.status === 'new' && item.channel === channel)
      .map(item => ({ ...item, id: `${item.id}-${Date.now()}` })); // Ensure unique IDs
    
    setFeedbackItems(prev => {
      // Avoid duplicates based on content/author if needed, but for now just append
      return [...prev, ...newItems];
    });
  }, []);

  // Reset the view to start fresh
  const handleResetView = useCallback(() => {
    setFeedbackItems([]);
    setDatasetLoaded(false);
    deselectAll();
    clearResults();
  }, [deselectAll, clearResults]);

  const [draggingItem, setDraggingItem] = useState<FeedbackItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanStatus | null>(null);
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Selection state
  const {
    selectedIds,
    selectedCount,
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected,
    getSelectedArray,
  } = useFeedbackSelection();

  // AI Processing state
  const {
    status: processingStatus,
    provider,
    results: aiResults,
    error: processingError,
    progress,
    isProcessing,
    setProvider,
    processFeedback,
    clearResults,
  } = useAIProcessing({
    onSuccess: (results) => {
      // After successful processing, move items to 'analyzed' status with animation
      const resultIds = new Set(results.map((r) => r.feedbackId));
      setFeedbackItems((prev) =>
        prev.map((item) =>
          resultIds.has(item.id)
            ? {
                ...item,
                status: 'analyzed' as KanbanStatus,
                analysis: {
                  bugId: results.find((r) => r.feedbackId === item.id)?.jiraTicket?.summary || 'AI-Analysis',
                  bugTag: results.find((r) => r.feedbackId === item.id)?.classification.toUpperCase() || 'ANALYZED',
                  sentiment: item.analysis?.sentiment || 'neutral',
                  suggestedPipeline: results.find((r) => r.feedbackId === item.id)?.suggestedPipeline || 'manual',
                  confidence: results.find((r) => r.feedbackId === item.id)?.confidence || 0.8,
                },
              }
            : item
        )
      );
      // Clear selection after processing
      deselectAll();
    },
    onError: (error) => {
      console.error('AI Processing error:', error);
    },
  });

  const itemsByStatus = useMemo(() => {
    const grouped: Record<KanbanStatus, FeedbackItem[]> = {
      new: [],
      analyzed: [],
      manual: [],
      automatic: [],
      done: [],
    };

    feedbackItems.forEach((item) => {
      grouped[item.status].push(item);
    });

    return grouped;
  }, [feedbackItems]);

  const canDrop = useCallback(
    (sourceColumn: KanbanStatus, targetColumn: KanbanStatus): { allowed: boolean; reason?: string } => {
      const targetConfig = KANBAN_COLUMNS.find((c) => c.id === targetColumn);
      if (!targetConfig) return { allowed: false, reason: 'Invalid column' };

      if (!targetConfig.acceptsFrom.includes(sourceColumn)) {
        return { allowed: false, reason: 'Invalid workflow transition' };
      }

      const currentCount = itemsByStatus[targetColumn].length;
      if (targetConfig.maxItems && currentCount >= targetConfig.maxItems) {
        return { allowed: false, reason: `${targetConfig.title} queue is full` };
      }

      return { allowed: true };
    },
    [itemsByStatus]
  );

  const handleCardDragStart = useCallback((e: React.DragEvent, item: FeedbackItem) => {
    setDraggingItem(item);
  }, []);

  const handleCardDragEnd = useCallback(() => {
    setDraggingItem(null);
    setDragOverColumn(null);
  }, []);

  const handleDragOver = useCallback(
    (columnId: KanbanStatus) => (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverColumn(columnId);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    (targetColumn: KanbanStatus) => (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverColumn(null);

      if (!draggingItem) return;

      const sourceColumn = draggingItem.status;
      const dropCheck = canDrop(sourceColumn, targetColumn);

      if (!dropCheck.allowed) {
        console.log('Drop not allowed:', dropCheck.reason);
        return;
      }

      setFeedbackItems((prev) =>
        prev.map((item) =>
          item.id === draggingItem.id ? { ...item, status: targetColumn } : item
        )
      );

      setDraggingItem(null);
    },
    [draggingItem, canDrop]
  );

  const handleCardClick = useCallback((item: FeedbackItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  }, []);

  const handleCardRightClick = useCallback(
    (item: FeedbackItem, e: React.MouseEvent) => {
      e.preventDefault();
      toggleSelection(item.id);
    },
    [toggleSelection]
  );

  const handleCardAction = useCallback(
    (action: string, item: FeedbackItem) => {
      switch (action) {
        case 'view':
          setSelectedItem(item);
          setModalOpen(true);
          break;
        case 'analyze':
          setFeedbackItems((prev) =>
            prev.map((fb) =>
              fb.id === item.id
                ? {
                    ...fb,
                    status: 'analyzed' as KanbanStatus,
                    analysis: {
                      bugId: `BUG_${Date.now()}`,
                      bugTag: 'Auto-detected',
                      sentiment: 'neutral',
                      suggestedPipeline: 'automatic',
                      confidence: 0.85,
                    },
                  }
                : fb
            )
          );
          break;
        case 'assign-manual':
          setFeedbackItems((prev) =>
            prev.map((fb) => (fb.id === item.id ? { ...fb, status: 'manual' as KanbanStatus } : fb))
          );
          break;
        case 'assign-auto':
          setFeedbackItems((prev) =>
            prev.map((fb) => (fb.id === item.id ? { ...fb, status: 'automatic' as KanbanStatus } : fb))
          );
          break;
        case 'mark-done':
          setFeedbackItems((prev) =>
            prev.map((fb) =>
              fb.id === item.id
                ? {
                    ...fb,
                    status: 'done' as KanbanStatus,
                    resolvedAt: new Date().toISOString(),
                    resolvedBy: item.status === 'automatic' ? 'ai' : 'human',
                  }
                : fb
            )
          );
          break;
        case 'reopen':
          setFeedbackItems((prev) =>
            prev.map((fb) =>
              fb.id === item.id
                ? { ...fb, status: 'analyzed' as KanbanStatus, resolvedAt: undefined, resolvedBy: undefined }
                : fb
            )
          );
          break;
        case 'link-jira':
          const ticketId = `JIRA-${Math.floor(Math.random() * 9000) + 1000}`;
          setFeedbackItems((prev) =>
            prev.map((fb) =>
              fb.id === item.id
                ? { ...fb, linkedTickets: [...(fb.linkedTickets || []), ticketId] }
                : fb
            )
          );
          break;
        case 'copy-link':
          navigator.clipboard.writeText(`https://app.example.com/feedback/${item.id}`);
          break;
        default:
          console.log('Unknown action:', action);
      }
    },
    []
  );

  const handleModalAction = useCallback(
    (action: string) => {
      if (selectedItem) {
        handleCardAction(action, selectedItem);
      }
      setModalOpen(false);
    },
    [selectedItem, handleCardAction]
  );

  // Handle AI Processing
  const handleProcessSelected = useCallback(async () => {
    const selectedItems = feedbackItems.filter((item) => selectedIds.has(item.id));
    if (selectedItems.length === 0) return;

    // Transform FeedbackItem to UIFeedbackItem for the API
    const uiFeedbackItems: UIFeedbackItem[] = selectedItems.map((item) => ({
      id: item.id,
      company: item.company,
      channel: item.channel,
      timestamp: item.timestamp,
      author: item.author,
      content: item.content,
      conversation: item.conversation,
      rating: item.rating,
      bugReference: item.analysis?.bugId || '',
      sentiment: item.analysis?.sentiment || 'neutral',
      priority: item.priority,
      tags: item.tags,
      engagement: item.engagement,
    }));

    await processFeedback(uiFeedbackItems);
  }, [feedbackItems, selectedIds, processFeedback]);

  // Select all items in 'new' column
  const handleSelectAllNew = useCallback(() => {
    const newItemIds = itemsByStatus.new.map((item) => item.id);
    selectAll(newItemIds);
  }, [itemsByStatus.new, selectAll]);

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Board Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-center justify-between"
      >
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Feedback Pipeline
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Right-click cards to select, then process with AI
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-3">
            <span>Total: {feedbackItems.length}</span>
            <span className="text-green-400">Done: {itemsByStatus.done.length}</span>
          </div>
          <button
            onClick={handleResetView}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-elevated)] hover:bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-lg transition-colors"
            title="Reset view and start fresh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset View
          </button>
        </div>
      </motion.div>

      {/* AI Processing Panel */}
      <AIProcessingPanel
        selectedCount={selectedCount}
        provider={provider}
        processingStatus={processingStatus}
        progress={progress}
        error={processingError}
        onProviderChange={setProvider}
        onProcess={handleProcessSelected}
        onClearSelection={deselectAll}
        onSelectAllNew={handleSelectAllNew}
        newItemsCount={itemsByStatus.new.length}
      />

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {KANBAN_COLUMNS.map((column) => {
          const isDragOver = dragOverColumn === column.id;
          const isValidDrop = draggingItem
            ? canDrop(draggingItem.status, column.id).allowed
            : false;

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              items={itemsByStatus[column.id]}
              isDragOver={isDragOver}
              isValidDrop={isValidDrop}
              selectedIds={selectedIds}
              processingStatus={processingStatus}
              aiResults={aiResults}
              onDragOver={handleDragOver(column.id)}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop(column.id)}
              onCardDragStart={handleCardDragStart}
              onCardDragEnd={handleCardDragEnd}
              onCardClick={handleCardClick}
              onCardRightClick={handleCardRightClick}
              onCardAction={handleCardAction}
              draggingItem={draggingItem}
              headerActions={
                column.id === 'new' ? (
                  <div className="flex gap-1 flex-wrap justify-center">
                    {(Object.entries(ChannelIconMap) as [KanbanChannel, LucideIcon][]).map(([channel, IconComponent]) => (
                      <button
                        key={channel}
                        onClick={() => handleLoadChannelData(channel)}
                        className="p-1.5 rounded-md hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                        title={`Load ${channel.replace('_', ' ')} feedback`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                ) : undefined
              }
            />
          );
        })}
      </div>

      {/* Card Detail Modal */}
      <CardDetailModal
        isOpen={modalOpen}
        item={selectedItem}
        onClose={() => {
          setModalOpen(false);
          setSelectedItem(null);
        }}
        onAction={handleModalAction}
      />
    </div>
  );
}
