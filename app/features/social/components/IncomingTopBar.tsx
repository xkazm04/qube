'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Facebook,
  Mail,
  TrendingUp,
  Bug,
  Lightbulb,
  MessageCircle,
  Inbox
} from 'lucide-react';

// Custom X (formerly Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
import type { FeedbackChannel, ProcessingStats } from '../lib/types';
import {
  iconClass,
  opacityClass,
  radius,
  card,
  transition,
} from '@/app/lib/design-tokens';

interface IncomingTopBarProps {
  activeChannel: FeedbackChannel;
  onChannelChange: (channel: FeedbackChannel) => void;
  channelCounts: Record<FeedbackChannel, number>;
  stats: ProcessingStats;
  pendingCount: number;
}

const channelTabs = [
  { channel: 'all' as const, label: 'All', icon: MessageSquare, color: 'purple' },
  { channel: 'facebook' as const, label: 'Facebook', icon: Facebook, color: 'blue' },
  { channel: 'x' as const, label: 'X', icon: XIcon, color: 'gray' },
  { channel: 'email' as const, label: 'Email', icon: Mail, color: 'amber' },
];

// Using design tokens for consistent opacity levels
const getColorClasses = (color: string, isActive: boolean) => {
  const colors: Record<string, { active: string; inactive: string; badge: string }> = {
    purple: {
      active: `bg-purple-500${opacityClass.default} text-purple-300 border-purple-500/50`,
      inactive: `text-gray-400 hover:text-purple-300 hover:bg-purple-500${opacityClass.subtle}`,
      badge: `bg-purple-500${opacityClass.moderate} text-purple-300`,
    },
    blue: {
      active: `bg-blue-500${opacityClass.default} text-blue-300 border-blue-500/50`,
      inactive: `text-gray-400 hover:text-blue-300 hover:bg-blue-500${opacityClass.subtle}`,
      badge: `bg-blue-500${opacityClass.moderate} text-blue-300`,
    },
    sky: {
      active: `bg-sky-500${opacityClass.default} text-sky-300 border-sky-500/50`,
      inactive: `text-gray-400 hover:text-sky-300 hover:bg-sky-500${opacityClass.subtle}`,
      badge: `bg-sky-500${opacityClass.moderate} text-sky-300`,
    },
    amber: {
      active: `bg-amber-500${opacityClass.default} text-amber-300 border-amber-500/50`,
      inactive: `text-gray-400 hover:text-amber-300 hover:bg-amber-500${opacityClass.subtle}`,
      badge: `bg-amber-500${opacityClass.moderate} text-amber-300`,
    },
  };
  return isActive ? colors[color].active : colors[color].inactive;
};

const getBadgeColor = (color: string) => {
  const colors: Record<string, string> = {
    purple: `bg-purple-500${opacityClass.moderate} text-purple-300`,
    blue: `bg-blue-500${opacityClass.moderate} text-blue-300`,
    sky: `bg-sky-500${opacityClass.moderate} text-sky-300`,
    amber: `bg-amber-500${opacityClass.moderate} text-amber-300`,
  };
  return colors[color];
};

export default function IncomingTopBar({
  activeChannel,
  onChannelChange,
  channelCounts,
  stats,
  pendingCount,
}: IncomingTopBarProps) {

  return (
    <div className={`p-4 ${radius.xl} bg-gray-900${opacityClass.interactive} border ${card.border} backdrop-blur-sm space-y-4`} data-testid="incoming-topbar">
      {/* Top row - Pending count and Stats */}
      <div className="flex items-center justify-between">
        {/* Pending count */}
        <div className="flex items-center gap-3">
          <div className={`p-2 ${radius.lg} bg-purple-500${opacityClass.default}`}>
            <Inbox className={`${iconClass.lg} text-purple-400`} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{pendingCount}</div>
            <div className="text-xs text-gray-400">Pending Feedback</div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="flex items-center gap-1.5">
              <Bug className={`${iconClass.md} text-red-400`} />
              <span className="text-lg font-semibold text-red-300">{stats.bugs}</span>
            </div>
            <div className="text-[10px] text-gray-400 uppercase">Bugs</div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1.5">
              <Lightbulb className={`${iconClass.md} text-amber-400`} />
              <span className="text-lg font-semibold text-amber-300">{stats.proposals}</span>
            </div>
            <div className="text-[10px] text-gray-400 uppercase">Proposals</div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1.5">
              <MessageCircle className={`${iconClass.md} text-emerald-400`} />
              <span className="text-lg font-semibold text-emerald-300">{stats.feedback}</span>
            </div>
            <div className="text-[10px] text-gray-400 uppercase">Feedback</div>
          </div>
          <div className="h-8 w-px bg-gray-700/50" />
          <div className="text-center">
            <div className="flex items-center gap-1.5">
              <TrendingUp className={`${iconClass.md} text-purple-400`} />
              <span className="text-lg font-semibold text-purple-300">{stats.totalProcessed}</span>
            </div>
            <div className="text-[10px] text-gray-400 uppercase">Processed</div>
          </div>
        </div>
      </div>

      {/* Channel filter tabs */}
      <div className={`flex items-center gap-2 p-1 bg-gray-800${opacityClass.interactive} ${radius.lg} border ${card.border}`}>
        {channelTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeChannel === tab.channel;
          const count = channelCounts[tab.channel];

          return (
            <button
              key={tab.channel}
              onClick={() => onChannelChange(tab.channel)}
              className={`
                relative flex items-center gap-2 px-3 py-2 ${radius.md}
                text-sm font-medium ${transition.normal}
                border border-transparent
                ${getColorClasses(tab.color, isActive)}
              `}
              data-testid={`channel-tab-${tab.channel}`}
            >
              <Icon className={iconClass.md} />
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`
                  min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium
                  flex items-center justify-center
                  ${getBadgeColor(tab.color)}
                `}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
