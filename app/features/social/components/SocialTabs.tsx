'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Server, Inbox, Send } from 'lucide-react';
import {
  iconClass,
  opacityClass,
  radius,
  card,
  transition,
} from '@/app/lib/design-tokens';

export type SocialTab = 'projects' | 'incoming' | 'outcoming';

interface SocialTabsProps {
  activeTab: SocialTab;
  onTabChange: (tab: SocialTab) => void;
}

const tabs = [
  { id: 'projects' as const, label: 'Projects', icon: Server },
  { id: 'incoming' as const, label: 'Incoming', icon: Inbox },
  { id: 'outcoming' as const, label: 'Outcoming', icon: Send },
];

export default function SocialTabs({ activeTab, onTabChange }: SocialTabsProps) {
  return (
    <div className={`flex items-center gap-2 p-1 bg-gray-800${opacityClass.interactive} ${radius.lg} border ${card.border}`} data-testid="social-tabs">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 ${radius.md}
              text-sm font-medium ${transition.normal}
              ${isActive
                ? 'text-purple-300'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
              }
            `}
            data-testid={`social-tab-${tab.id}`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className={`absolute inset-0 bg-purple-500${opacityClass.default} ${radius.md} border border-purple-500${opacityClass.interactive}`}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon className={`${iconClass.md} relative z-10`} />
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
