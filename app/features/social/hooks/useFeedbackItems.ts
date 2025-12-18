'use client';

/**
 * useFeedbackItems Hook
 *
 * Provides normalized state management for feedback items with:
 * - O(1) item lookup via Map
 * - Pre-computed status index for instant grouped views
 * - Efficient single-item updates without array mapping
 * - Memoized selectors for derived data
 */

import { useState, useCallback, useMemo } from 'react';
import type { FeedbackItem, KanbanStatus } from '../lib/kanbanTypes';
import {
  NormalizedFeedbackState,
  normalizeItems,
  addItems,
  updateItem,
  updateItems,
  removeItem,
  clearState,
  createEmptyNormalizedState,
} from '../lib/normalizedFeedbackTypes';

export interface UseFeedbackItemsOptions {
  /** Initial items to populate the state */
  initialItems?: FeedbackItem[];
}

export interface UseFeedbackItemsReturn {
  // State
  state: NormalizedFeedbackState;

  // Selectors - O(1) operations
  /** Get a single item by ID - O(1) */
  getItem: (id: string) => FeedbackItem | undefined;
  /** Get all items as array (derived) */
  getAllItems: () => FeedbackItem[];
  /** Get items by status - O(n) where n is items in that status only */
  getItemsByStatus: (status: KanbanStatus) => FeedbackItem[];
  /** Get items grouped by status - pre-computed, O(1) access per status */
  getItemsGroupedByStatus: () => Record<KanbanStatus, FeedbackItem[]>;
  /** Get count by status - O(1) */
  getCountByStatus: (status: KanbanStatus) => number;
  /** Get total count - O(1) */
  getTotalCount: () => number;
  /** Check if item exists - O(1) */
  hasItem: (id: string) => boolean;

  // Actions
  /** Set all items (replaces state) */
  setItems: (items: FeedbackItem[]) => void;
  /** Add new items */
  addItems: (items: FeedbackItem[]) => void;
  /** Update a single item - O(1) */
  updateItem: (id: string, updater: (item: FeedbackItem) => FeedbackItem) => void;
  /** Update multiple items */
  updateItems: (ids: string[], updater: (item: FeedbackItem) => FeedbackItem) => void;
  /** Update item status - convenience method */
  updateItemStatus: (id: string, status: KanbanStatus) => void;
  /** Remove an item */
  removeItem: (id: string) => void;
  /** Clear all items */
  clear: () => void;
}

export function useFeedbackItems(
  options: UseFeedbackItemsOptions = {}
): UseFeedbackItemsReturn {
  const { initialItems = [] } = options;

  const [state, setState] = useState<NormalizedFeedbackState>(() =>
    initialItems.length > 0 ? normalizeItems(initialItems) : createEmptyNormalizedState()
  );

  // Selectors - memoized for performance

  const getItem = useCallback(
    (id: string): FeedbackItem | undefined => {
      return state.byId.get(id);
    },
    [state.byId]
  );

  const getAllItems = useCallback((): FeedbackItem[] => {
    return state.allIds.map((id) => state.byId.get(id)!);
  }, [state.allIds, state.byId]);

  const getItemsByStatus = useCallback(
    (status: KanbanStatus): FeedbackItem[] => {
      const ids = state.byStatus[status];
      const items: FeedbackItem[] = [];
      ids.forEach((id) => {
        const item = state.byId.get(id);
        if (item) items.push(item);
      });
      return items;
    },
    [state.byId, state.byStatus]
  );

  // Memoized grouped items - recalculates only when state changes
  const itemsGroupedByStatus = useMemo((): Record<KanbanStatus, FeedbackItem[]> => {
    const result: Record<KanbanStatus, FeedbackItem[]> = {
      new: [],
      analyzed: [],
      manual: [],
      automatic: [],
      done: [],
    };

    for (const status of Object.keys(result) as KanbanStatus[]) {
      const ids = state.byStatus[status];
      ids.forEach((id) => {
        const item = state.byId.get(id);
        if (item) result[status].push(item);
      });
    }

    return result;
  }, [state.byId, state.byStatus]);

  const getItemsGroupedByStatus = useCallback(
    () => itemsGroupedByStatus,
    [itemsGroupedByStatus]
  );

  const getCountByStatus = useCallback(
    (status: KanbanStatus): number => {
      return state.byStatus[status].size;
    },
    [state.byStatus]
  );

  const getTotalCount = useCallback((): number => {
    return state.allIds.length;
  }, [state.allIds.length]);

  const hasItem = useCallback(
    (id: string): boolean => {
      return state.byId.has(id);
    },
    [state.byId]
  );

  // Actions

  const setItemsAction = useCallback((items: FeedbackItem[]) => {
    setState(normalizeItems(items));
  }, []);

  const addItemsAction = useCallback((items: FeedbackItem[]) => {
    setState((prev) => addItems(prev, items));
  }, []);

  const updateItemAction = useCallback(
    (id: string, updater: (item: FeedbackItem) => FeedbackItem) => {
      setState((prev) => updateItem(prev, id, updater));
    },
    []
  );

  const updateItemsAction = useCallback(
    (ids: string[], updater: (item: FeedbackItem) => FeedbackItem) => {
      setState((prev) => updateItems(prev, ids, updater));
    },
    []
  );

  const updateItemStatusAction = useCallback((id: string, status: KanbanStatus) => {
    setState((prev) =>
      updateItem(prev, id, (item) => ({ ...item, status }))
    );
  }, []);

  const removeItemAction = useCallback((id: string) => {
    setState((prev) => removeItem(prev, id));
  }, []);

  const clearAction = useCallback(() => {
    setState(clearState());
  }, []);

  return {
    state,
    getItem,
    getAllItems,
    getItemsByStatus,
    getItemsGroupedByStatus,
    getCountByStatus,
    getTotalCount,
    hasItem,
    setItems: setItemsAction,
    addItems: addItemsAction,
    updateItem: updateItemAction,
    updateItems: updateItemsAction,
    updateItemStatus: updateItemStatusAction,
    removeItem: removeItemAction,
    clear: clearAction,
  };
}
