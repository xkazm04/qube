'use client';

import { useState, useEffect, useMemo } from 'react';
import type { FeedbackItem } from '../../lib/kanbanTypes';
import type { SLAInfo, SLAStatus } from './slaTypes';
import { getSLAThresholds, formatDuration } from './slaConfig';

function calculateSLAInfo(item: FeedbackItem): SLAInfo {
  const now = Date.now();
  const created = new Date(item.timestamp).getTime();
  const ageMinutes = (now - created) / (1000 * 60);

  // Don't show SLA for resolved items
  if (item.status === 'done') {
    return {
      status: 'ok',
      ageMinutes,
      remainingMinutes: null,
      formattedAge: formatDuration(ageMinutes),
      formattedRemaining: '-',
      percentComplete: 100,
    };
  }

  const thresholds = getSLAThresholds(item.channel, item.priority);

  let status: SLAStatus = 'ok';
  if (ageMinutes >= thresholds.overdue) {
    status = 'overdue';
  } else if (ageMinutes >= thresholds.critical) {
    status = 'critical';
  } else if (ageMinutes >= thresholds.warning) {
    status = 'warning';
  }

  const remainingMinutes = status === 'overdue'
    ? null
    : thresholds.overdue - ageMinutes;

  const percentComplete = Math.min(100, (ageMinutes / thresholds.overdue) * 100);

  return {
    status,
    ageMinutes,
    remainingMinutes,
    formattedAge: formatDuration(ageMinutes),
    formattedRemaining: remainingMinutes !== null
      ? formatDuration(remainingMinutes)
      : 'Overdue',
    percentComplete,
  };
}

export function useSLA(item: FeedbackItem, refreshInterval = 60000): SLAInfo {
  const [slaInfo, setSlaInfo] = useState(() => calculateSLAInfo(item));

  useEffect(() => {
    // Recalculate immediately when item changes
    setSlaInfo(calculateSLAInfo(item));

    // Set up interval for auto-refresh
    const interval = setInterval(() => {
      setSlaInfo(calculateSLAInfo(item));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [item, refreshInterval]);

  return slaInfo;
}

// Batch version for sorting/filtering
export function useSLABatch(items: FeedbackItem[]): Map<string, SLAInfo> {
  const [slaMap, setSlaMap] = useState<Map<string, SLAInfo>>(() => {
    const map = new Map();
    items.forEach(item => map.set(item.id, calculateSLAInfo(item)));
    return map;
  });

  useEffect(() => {
    const updateAll = () => {
      const map = new Map<string, SLAInfo>();
      items.forEach(item => map.set(item.id, calculateSLAInfo(item)));
      setSlaMap(map);
    };

    updateAll();
    const interval = setInterval(updateAll, 60000);
    return () => clearInterval(interval);
  }, [items]);

  return slaMap;
}

// Sort items by urgency (most urgent first)
export function sortByUrgency(items: FeedbackItem[]): FeedbackItem[] {
  return [...items].sort((a, b) => {
    const slaA = calculateSLAInfo(a);
    const slaB = calculateSLAInfo(b);

    // Overdue items first
    if (slaA.status === 'overdue' && slaB.status !== 'overdue') return -1;
    if (slaB.status === 'overdue' && slaA.status !== 'overdue') return 1;

    // Then by remaining time (less time = higher priority)
    const remainingA = slaA.remainingMinutes ?? -slaA.ageMinutes;
    const remainingB = slaB.remainingMinutes ?? -slaB.ageMinutes;
    return remainingA - remainingB;
  });
}
