'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Facebook,
  MessageCircle,
  Star,
  Smartphone,
  Instagram,
  RotateCcw,
  Activity,
  type LucideIcon,
} from 'lucide-react';

// Custom X (formerly Twitter) icon component
const XIcon = (({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)) as unknown as LucideIcon;
import type { FeedbackItem, KanbanStatus, KanbanChannel } from '../lib/kanbanTypes';
import { KANBAN_COLUMNS } from '../lib/kanbanTypes';
import { mockKanbanFeedback } from '../lib/kanbanMockData';
import { transformDatasetToFeedbackItem } from '../lib/datasetLoader';
import type { AIProvider, FeedbackAnalysisResult, UIFeedbackItem } from '../lib/aiTypes';
import { useAIProcessing, useFeedbackSelection } from '../hooks/useAIProcessing';
import KanbanColumn from './KanbanColumn';
import CardDetailModal from './CardDetailModal';
import AIProcessingPanel from './AIProcessingPanel';
import { useToast } from '@/app/components/ui/ToastProvider';

// New feature imports
import { FilterBar, useFilters } from './filters';
import { ViewToggle, SwimlanesView, useSwimlanes, type ViewMode, type GroupByField } from './swimlanes';
import { SplitViewPanel, useSplitView } from './split-view';
import { ActivityProvider, ActivityPanel, useActivity, createStatusChangeEvent } from './activity';
import KanbanCard from './KanbanCard';
import StatsBar from './StatsBar';

// Channel icon mapping
const ChannelIconMap: Record<KanbanChannel, LucideIcon> = {
  email: Mail,
  x: XIcon,
  facebook: Facebook,
  support_chat: MessageCircle,
  trustpilot: Star,
  app_store: Smartphone,
  instagram: Instagram,
};

interface KanbanBoardProps {
  useDataset?: boolean;
}

// Inner component that uses activity context
function KanbanBoardInner({ useDataset = false }: KanbanBoardProps) {
  const toast = useToast();
  const { addEvent } = useActivity();

  // Initialize with empty "new" items to simulate empty state
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(() =>
    mockKanbanFeedback.filter(item => item.status !== 'new')
  );
  const [datasetLoaded, setDatasetLoaded] = useState(false);

  // New feature states
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [groupBy, setGroupBy] = useState<GroupByField>('none');
  const [activityPanelOpen, setActivityPanelOpen] = useState(false);

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

  // Filters hook
  const {
    filters,
    setFilter,
    clearFilters,
    toggleArrayFilter,
    filteredItems,
    activeFilterCount,
    totalCount,
    filteredCount,
  } = useFilters(feedbackItems);

  // Swimlanes hook
  const { swimlanes, toggleCollapse, isCollapsed } = useSwimlanes(filteredItems, groupBy);

  // Split-view hook
  const splitView = useSplitView({ items: filteredItems });

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
      // Show toast notification
      toast.success(
        'Bulk processing completed',
        `Successfully analyzed ${results.length} feedback item${results.length !== 1 ? 's' : ''}`
      );
    },
    onError: (error) => {
      console.error('AI Processing error:', error);
      toast.error('Processing failed', error);
    },
  });

  // Reset the view to start fresh
  const handleResetView = useCallback(() => {
    setFeedbackItems([]);
    setDatasetLoaded(false);
    deselectAll();
    clearResults();
  }, [deselectAll, clearResults]);

  // Group filtered items by status
  const itemsByStatus = useMemo(() => {
    const grouped: Record<KanbanStatus, FeedbackItem[]> = {
      new: [],
      analyzed: [],
      manual: [],
      automatic: [],
      done: [],
    };

    filteredItems.forEach((item) => {
      grouped[item.status].push(item);
    });

    return grouped;
  }, [filteredItems]);

  const canDrop = useCallback(
    (sourceColumn: KanbanStatus, targetColumn: KanbanStatus): { allowed: boolean; reason?: string } => {
      const targetConfig = KANBAN_COLUMNS.find((c) => c.id === targetColumn);
      const sourceConfig = KANBAN_COLUMNS.find((c) => c.id === sourceColumn);
      if (!targetConfig) return { allowed: false, reason: 'Invalid column' };

      // Same column - no drop allowed
      if (sourceColumn === targetColumn) {
        return { allowed: false, reason: 'Already in this column' };
      }

      if (!targetConfig.acceptsFrom.includes(sourceColumn)) {
        // Provide specific workflow guidance
        if (sourceColumn === 'new' && targetColumn !== 'analyzed') {
          return { allowed: false, reason: 'Must be analyzed first' };
        }
        if (sourceColumn === 'analyzed' && targetColumn === 'done') {
          return { allowed: false, reason: 'Cannot skip processing stage' };
        }
        if (sourceColumn === 'analyzed' && targetColumn === 'new') {
          return { allowed: false, reason: 'Cannot move back to New' };
        }
        if ((sourceColumn === 'manual' || sourceColumn === 'automatic') && targetColumn !== 'done') {
          return { allowed: false, reason: 'Can only move to Done' };
        }
        if (sourceColumn === 'done') {
          return { allowed: false, reason: 'Resolved items cannot be moved' };
        }
        return { allowed: false, reason: `Cannot move from ${sourceConfig?.title || sourceColumn} here` };
      }

      const currentCount = itemsByStatus[targetColumn].length;
      if (targetConfig.maxItems && currentCount >= targetConfig.maxItems) {
        return { allowed: false, reason: `${targetConfig.title} queue is full (${targetConfig.maxItems} max)` };
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

  // Single-click opens split view
  const handleCardClick = useCallback((item: FeedbackItem) => {
    splitView.openItem(item.id);
  }, [splitView]);

  // Double-click opens modal
  const handleCardDoubleClick = useCallback((item: FeedbackItem) => {
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
      const trackStatusChange = (from: KanbanStatus, to: KanbanStatus) => {
        addEvent(createStatusChangeEvent(item.id, from, to));
      };

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
          trackStatusChange(item.status, 'analyzed');
          addEvent({ feedbackId: item.id, type: 'analyzed', actor: 'ai', metadata: { confidence: 0.85 } });
          break;
        case 'assign-manual':
          setFeedbackItems((prev) =>
            prev.map((fb) => (fb.id === item.id ? { ...fb, status: 'manual' as KanbanStatus } : fb))
          );
          trackStatusChange(item.status, 'manual');
          break;
        case 'assign-auto':
          setFeedbackItems((prev) =>
            prev.map((fb) => (fb.id === item.id ? { ...fb, status: 'automatic' as KanbanStatus } : fb))
          );
          trackStatusChange(item.status, 'automatic');
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
          trackStatusChange(item.status, 'done');
          addEvent({ feedbackId: item.id, type: 'resolved', actor: item.status === 'automatic' ? 'ai' : 'user', metadata: {} });
          toast.success('Feedback resolved', 'Item marked as done');
          break;
        case 'reopen':
          setFeedbackItems((prev) =>
            prev.map((fb) =>
              fb.id === item.id
                ? { ...fb, status: 'analyzed' as KanbanStatus, resolvedAt: undefined, resolvedBy: undefined }
                : fb
            )
          );
          addEvent({ feedbackId: item.id, type: 'reopened', actor: 'user', metadata: {} });
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
          addEvent({ feedbackId: item.id, type: 'ticket_linked', actor: 'user', metadata: { ticketId } });
          toast.success('Ticket linked', `Linked to ${ticketId}`);
          break;
        case 'copy-link':
          navigator.clipboard.writeText(`https://app.example.com/feedback/${item.id}`);
          toast.info('Link copied', 'Feedback link copied to clipboard');
          break;
        default:
          console.log('Unknown action:', action);
      }
    },
    [toast, addEvent]
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

  // Card renderer for swimlanes
  const renderCard = useCallback((item: FeedbackItem) => (
    <KanbanCard
      item={item}
      isSelected={isSelected(item.id)}
      isProcessing={processingStatus === 'processing' && selectedIds.has(item.id)}
      aiResult={aiResults.get(item.id)}
      onDragStart={(e) => handleCardDragStart(e, item)}
      onDragEnd={handleCardDragEnd}
      onClick={() => handleCardClick(item)}
      onRightClick={(_, e) => handleCardRightClick(item, e)}
      onAction={(action) => handleCardAction(action, item)}
    />
  ), [isSelected, processingStatus, selectedIds, aiResults, handleCardDragStart, handleCardDragEnd, handleCardClick, handleCardRightClick, handleCardAction]);

  return (
    <div className="h-full flex">
      {/* Activity Panel (left) */}
      <ActivityPanel
        isOpen={activityPanelOpen}
        onClose={() => setActivityPanelOpen(false)}
        onJumpToItem={(id) => splitView.openItem(id)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Board Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center justify-between flex-shrink-0"
        >
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Feedback Pipeline
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Click card for details • Double-click for full modal • Right-click to select
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <ViewToggle
              viewMode={viewMode}
              groupBy={groupBy}
              onViewModeChange={setViewMode}
              onGroupByChange={setGroupBy}
            />

            <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-3">
              <span>Total: {feedbackItems.length}</span>
              {activeFilterCount > 0 && (
                <span className="text-yellow-400">Filtered: {filteredCount}</span>
              )}
              <span className="text-green-400">Done: {itemsByStatus.done.length}</span>
            </div>

            {/* Activity toggle */}
            <button
              onClick={() => setActivityPanelOpen(!activityPanelOpen)}
              className={`p-2 rounded-lg transition-colors ${
                activityPanelOpen
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
              title="Toggle Activity Panel"
            >
              <Activity className="w-4 h-4" />
            </button>

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

        {/* Filter Bar */}
        <div className="mb-4 flex-shrink-0">
          <FilterBar
            filters={filters}
            onSearchChange={(value) => setFilter('search', value)}
            onToggleFilter={toggleArrayFilter}
            onClearFilters={clearFilters}
            onClearField={(field) => setFilter(field, field === 'search' ? '' : [])}
            activeFilterCount={activeFilterCount}
            totalCount={totalCount}
            filteredCount={filteredCount}
          />
        </div>

        {/* Stats Bar */}
        <div className="mb-4 flex-shrink-0">
          <StatsBar
            stats={{
              new: itemsByStatus.new.length,
              analyzed: itemsByStatus.analyzed.length,
              manual: itemsByStatus.manual.length,
              automatic: itemsByStatus.automatic.length,
              done: itemsByStatus.done.length,
            }}
            aiStats={
              aiResults.size > 0
                ? {
                    bugs: Array.from(aiResults.values()).filter((r) => r.classification === 'bug').length,
                    features: Array.from(aiResults.values()).filter((r) => r.classification === 'feature').length,
                    clarifications: Array.from(aiResults.values()).filter((r) => r.classification === 'clarification').length,
                  }
                : undefined
            }
          />
        </div>

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

        {/* Main view area */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'board' ? (
            /* Kanban Columns */
            <div className="flex gap-4 overflow-x-auto pb-4 h-full custom-scrollbar">
              {KANBAN_COLUMNS.map((column) => {
                const isDragOver = dragOverColumn === column.id;
                const dropCheck = draggingItem
                  ? canDrop(draggingItem.status, column.id)
                  : { allowed: false, reason: undefined };
                const isValidDrop = dropCheck.allowed;
                const dropReason = dropCheck.reason;

                return (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    items={itemsByStatus[column.id]}
                    isDragOver={isDragOver}
                    isValidDrop={isValidDrop}
                    dropReason={dropReason}
                    isDragging={!!draggingItem}
                    selectedIds={selectedIds}
                    processingStatus={processingStatus}
                    aiResults={aiResults}
                    onDragOver={handleDragOver(column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop(column.id)}
                    onCardDragStart={handleCardDragStart}
                    onCardDragEnd={handleCardDragEnd}
                    onCardClick={handleCardClick}
                    onCardDoubleClick={handleCardDoubleClick}
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
          ) : (
            /* Swimlanes View */
            <SwimlanesView
              swimlanes={swimlanes}
              isCollapsed={isCollapsed}
              onToggleCollapse={toggleCollapse}
              onCardClick={handleCardClick}
              onCardDoubleClick={handleCardDoubleClick}
              renderCard={renderCard}
            />
          )}
        </div>
      </div>

      {/* Split View Panel (right) */}
      <SplitViewPanel
        state={splitView.state}
        item={splitView.currentItem}
        currentIndex={splitView.currentIndex}
        totalItems={splitView.totalItems}
        onClose={splitView.closePanel}
        onPrev={splitView.navigatePrev}
        onNext={splitView.navigateNext}
        onWidthChange={splitView.setWidth}
        onAction={handleCardAction}
        canPrev={splitView.canNavigatePrev}
        canNext={splitView.canNavigateNext}
      />

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

// Wrapper component with ActivityProvider
export default function KanbanBoard(props: KanbanBoardProps) {
  return (
    <ActivityProvider>
      <KanbanBoardInner {...props} />
    </ActivityProvider>
  );
}
