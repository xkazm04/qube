'use client';

import React, { useEffect, useRef } from 'react';
import {
  Eye,
  Search,
  UserCog,
  Bot,
  CheckCircle,
  RotateCcw,
  Ticket,
  Link,
  type LucideIcon,
} from 'lucide-react';
import type { FeedbackItem, KanbanStatus } from '../lib/kanbanTypes';

interface CardMenuProps {
  item: FeedbackItem;
  onClose: () => void;
  onAction: (action: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  showIn?: KanbanStatus[];
  separator?: boolean;
}

const menuItems: MenuItem[] = [
  { id: 'view', label: 'View Details', icon: Eye },
  { id: 'analyze', label: 'Run Analysis', icon: Search, showIn: ['new'] },
  { id: 'assign-manual', label: 'Assign to Developer', icon: UserCog, showIn: ['analyzed'] },
  { id: 'assign-auto', label: 'Send to AI Agent', icon: Bot, showIn: ['analyzed'] },
  { id: 'mark-done', label: 'Mark as Done', icon: CheckCircle, showIn: ['manual', 'automatic'] },
  { id: 'reopen', label: 'Reopen', icon: RotateCcw, showIn: ['done'] },
  { id: 'separator-1', label: '', icon: Eye, separator: true },
  { id: 'link-jira', label: 'Create Jira Ticket', icon: Ticket },
  { id: 'copy-link', label: 'Copy Link', icon: Link },
];

export default function CardMenu({ item, onClose, onAction }: CardMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const visibleItems = menuItems.filter((menuItem) => {
    if (menuItem.separator) return true;
    if (!menuItem.showIn) return true;
    return menuItem.showIn.includes(item.status);
  });

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] min-w-[180px] py-1 z-50"
      role="menu"
    >
      {visibleItems.map((menuItem, index) => {
        if (menuItem.separator) {
          return (
            <div
              key={`sep-${index}`}
              className="h-px bg-[var(--color-border-subtle)] mx-2 my-1"
            />
          );
        }

        const IconComponent = menuItem.icon;

        return (
          <button
            key={menuItem.id}
            onClick={(e) => {
              e.stopPropagation();
              onAction(menuItem.id);
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] rounded-[var(--radius-sm)] mx-1 transition-colors"
            role="menuitem"
          >
            <IconComponent className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <span>{menuItem.label}</span>
          </button>
        );
      })}
    </div>
  );
}
