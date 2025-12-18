'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Activity, type LucideIcon } from 'lucide-react';
import type { FeedbackItem, KanbanChannel } from '../lib/kanbanTypes';
import { KANBAN_COLUMNS } from '../lib/kanbanTypes';
import KanbanColumn from './KanbanColumn';
import CardDetailModal from './CardDetailModal';
import AIProcessingPanel from './AIProcessingPanel';
import { FilterBar } from './filters';
import { ViewToggle, SwimlanesView } from './swimlanes';
import { ActivityProvider, ActivityPanel } from './activity';
import KanbanCard from './KanbanCard';
import StatsBar from './StatsBar';
import { KanbanStateProviders } from './state';
import { ChannelIconMap, ChannelColorMap } from './KanbanBoardConstants';
import { useKanbanBoardLogic } from './useKanbanBoardLogic';
import { useKanbanDragHandlers } from './useKanbanDragHandlers';
import { useKanbanCardHandlers } from './useKanbanCardHandlers';
import { useKanbanAIProcessing } from './useKanbanAIProcessing';

interface KanbanBoardProps {
  useDataset?: boolean;
}

// Inner component that uses state providers
function KanbanBoardInner({ useDataset = false }: KanbanBoardProps) {
  // Get all state and handlers from the main logic hook
  const {
    dragState,
    selectionState,
    viewModeState,
    feedbackState,
    filtersState,
    swimlanesState,
    aiProcessingState,
    selectedItem,
    setSelectedItem,
    modalOpen,
    setModalOpen,
    feedbackItems,
    filteredItemsByStatus,
    loadedChannels,
    handleLoadChannelData,
    handleResetView,
    handleSelectAllNew,
    addEvent,
    createStatusChangeEvent,
    toast,
  } = useKanbanBoardLogic({ useDataset });

  // Extract drag and drop handlers
  const { canDrop, handleDrop } = useKanbanDragHandlers({
    draggingItem: dragState.draggingItem,
    feedbackState,
    handleCardDragEnd: dragState.handleCardDragEnd,
  });

  // Extract card handlers
  const cardHandlers = useKanbanCardHandlers({
    feedbackState,
    aiResults: aiProcessingState.results,
    requirementResults: aiProcessingState.requirementResults,
    toast,
    addEvent,
    setSelectedItem,
    setModalOpen,
    createStatusChangeEvent,
  });

  // Extract AI processing logic
  const { handleProcessSelected } = useKanbanAIProcessing({
    feedbackItems,
    selectedIds: selectionState.selectedIds,
    aiResults: aiProcessingState.results,
    processFeedback: aiProcessingState.processFeedback,
    processRequirements: aiProcessingState.processRequirements,
    toast,
  });

  const handleCardRightClick = useCallback(
    (item: FeedbackItem, e: React.MouseEvent) => {
      cardHandlers.handleCardRightClick(item, e, selectionState.toggleSelection);
    },
    [cardHandlers, selectionState.toggleSelection]
  );

  const handleModalAction = useCallback(
    (action: string) => {
      if (selectedItem) {
        cardHandlers.handleCardAction(action, selectedItem);
      }
      setModalOpen(false);
    },
    [selectedItem, cardHandlers, setModalOpen]
  );

  // Card renderer for swimlanes
  const renderCard = useCallback((item: FeedbackItem) => (
    <KanbanCard
      item={item}
      isSelected={selectionState.isSelected(item.id)}
      isProcessing={aiProcessingState.status === 'processing' && selectionState.selectedIds.has(item.id)}
      aiResult={aiProcessingState.results.get(item.id)}
      onDragStart={(e) => dragState.handleCardDragStart(e, item)}
      onDragEnd={dragState.handleCardDragEnd}
      onClick={() => cardHandlers.handleCardClick(item)}
      onRightClick={(_, e) => handleCardRightClick(item, e)}
      onAction={(action) => cardHandlers.handleCardAction(action, item)}
    />
  ), [
    selectionState,
    aiProcessingState,
    dragState,
    cardHandlers,
    handleCardRightClick,
  ]);

  return (
    <div className="h-full flex" data-testid="kanban-board">
      {/* Activity Panel (left) */}
      <ActivityPanel
        isOpen={viewModeState.activityPanelOpen}
        onClose={() => viewModeState.toggleActivityPanel()}
        onJumpToItem={(id) => {
          const item = feedbackState.getItem(id);
          if (item) {
            setSelectedItem(item);
            setModalOpen(true);
          }
        }}
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
              Click card for details • Right-click to select
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <ViewToggle
              viewMode={viewModeState.viewMode}
              groupBy={viewModeState.groupBy}
              onViewModeChange={viewModeState.setViewMode}
              onGroupByChange={viewModeState.setGroupBy}
            />

            <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-3">
              <span>Total: {feedbackState.getTotalCount()}</span>
              {filtersState.activeFilterCount > 0 && (
                <span className="text-yellow-400">Filtered: {filtersState.filteredCount}</span>
              )}
              <span className="text-green-400">Done: {feedbackState.getCountByStatus('done')}</span>
            </div>

            {/* Activity toggle */}
            <button
              onClick={() => viewModeState.toggleActivityPanel()}
              className={`p-2 rounded-lg transition-colors ${
                viewModeState.activityPanelOpen
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
              title="Toggle Activity Panel"
              data-testid="activity-panel-toggle"
            >
              <Activity className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetView}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-elevated)] hover:bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-lg transition-colors"
              title="Reset view and start fresh"
              data-testid="reset-view-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset View
            </button>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <div className="mb-4 flex-shrink-0">
          <FilterBar
            filters={filtersState.filters}
            onSearchChange={(value) => filtersState.setFilter('search', value)}
            onToggleFilter={filtersState.toggleArrayFilter}
            onClearFilters={filtersState.clearFilters}
            onClearField={(field) => filtersState.setFilter(field, field === 'search' ? '' : [])}
            activeFilterCount={filtersState.activeFilterCount}
            totalCount={filtersState.totalCount}
            filteredCount={filtersState.filteredCount}
          />
        </div>

        {/* Stats Bar - uses O(1) counts from normalized state */}
        <div className="mb-4 flex-shrink-0">
          <StatsBar
            stats={{
              new: feedbackState.getCountByStatus('new'),
              analyzed: feedbackState.getCountByStatus('analyzed'),
              manual: feedbackState.getCountByStatus('manual'),
              automatic: feedbackState.getCountByStatus('automatic'),
              done: feedbackState.getCountByStatus('done'),
            }}
            aiStats={
              aiProcessingState.results.size > 0
                ? {
                    bugs: Array.from(aiProcessingState.results.values()).filter((r) => r.classification === 'bug').length,
                    features: Array.from(aiProcessingState.results.values()).filter((r) => r.classification === 'feature').length,
                    clarifications: Array.from(aiProcessingState.results.values()).filter((r) => r.classification === 'clarification').length,
                  }
                : undefined
            }
          />
        </div>

        {/* AI Processing Panel */}
        <AIProcessingPanel
          selectedCount={selectionState.selectedCount}
          processingStatus={aiProcessingState.status}
          progress={aiProcessingState.progress}
          error={aiProcessingState.error}
          onProcess={handleProcessSelected}
          onClearSelection={selectionState.deselectAll}
          onSelectAllNew={handleSelectAllNew}
          newItemsCount={filteredItemsByStatus.new.length}
        />

        {/* Main view area */}
        <div className="flex-1 overflow-hidden">
          {viewModeState.viewMode === 'board' ? (
            /* Kanban Columns */
            <div className="flex gap-4 overflow-x-auto pb-4 h-full custom-scrollbar" data-testid="kanban-columns">
              {KANBAN_COLUMNS.map((column) => {
                const isDragOver = dragState.dragOverColumn === column.id;
                const dropCheck = dragState.draggingItem
                  ? canDrop(dragState.draggingItem.status, column.id)
                  : { allowed: false, reason: undefined };
                const isValidDrop = dropCheck.allowed;
                const dropReason = dropCheck.reason;

                return (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    items={filteredItemsByStatus[column.id]}
                    isDragOver={isDragOver}
                    isValidDrop={isValidDrop}
                    dropReason={dropReason}
                    isDragging={!!dragState.draggingItem}
                    selectedIds={selectionState.selectedIds}
                    processingStatus={aiProcessingState.status}
                    aiResults={aiProcessingState.results}
                    onDragOver={dragState.handleDragOver(column.id)}
                    onDragLeave={dragState.handleDragLeave}
                    onDrop={handleDrop(column.id)}
                    onCardDragStart={dragState.handleCardDragStart}
                    onCardDragEnd={dragState.handleCardDragEnd}
                    onCardClick={cardHandlers.handleCardClick}
                    onCardRightClick={handleCardRightClick}
                    onCardAction={cardHandlers.handleCardAction}
                    draggingItem={dragState.draggingItem}
                    headerActions={
                      column.id === 'new' ? (
                        <div className="flex gap-1 flex-wrap justify-center">
                          {(Object.entries(ChannelIconMap) as [KanbanChannel, LucideIcon][]).map(([channel, IconComponent]) => {
                            const isLoaded = loadedChannels.has(channel);
                            const colorClass = isLoaded ? ChannelColorMap[channel] : 'text-gray-400 dark:text-gray-600';
                            
                            return (
                              <button
                                key={channel}
                                onClick={() => handleLoadChannelData(channel)}
                                className={`p-1.5 rounded-md hover:bg-[var(--color-surface-elevated)] transition-all ${colorClass} ${isLoaded ? 'ring-1 ring-current' : ''}`}
                                title={`${isLoaded ? 'Unload' : 'Load'} ${channel.replace('_', ' ')} feedback`}
                                data-testid={`toggle-channel-${channel}-btn`}
                              >
                                <IconComponent className="w-4 h-4" />
                              </button>
                            );
                          })}
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
              swimlanes={swimlanesState.swimlanes}
              isCollapsed={swimlanesState.isCollapsed}
              onToggleCollapse={swimlanesState.toggleCollapse}
              onCardClick={cardHandlers.handleCardClick}
              renderCard={renderCard}
            />
          )}
        </div>
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

// Wrapper component with all providers
export default function KanbanBoard(props: KanbanBoardProps) {
  return (
    <ActivityProvider>
      <KanbanStateProviders>
        <KanbanBoardInner {...props} />
      </KanbanStateProviders>
    </ActivityProvider>
  );
}
