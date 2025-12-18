'use client';

import React from 'react';
import {
  Monitor,
  Server,
  Smartphone,
  Cloud,
  Database,
  CreditCard,
  Search,
  Bell,
  Shield,
  Globe,
  Headphones,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { DevTeam } from '../lib/aiTypes';
import { TEAM_COLORS } from '../lib/aiTypes';

// Map team names to Lucide icons
const TEAM_ICON_COMPONENTS: Record<DevTeam, LucideIcon> = {
  frontend: Monitor,
  backend: Server,
  mobile: Smartphone,
  platform: Cloud,
  data: Database,
  payments: CreditCard,
  search: Search,
  notifications: Bell,
  security: Shield,
  localization: Globe,
  'customer-success': Headphones,
  growth: TrendingUp,
};

// Team display names
const TEAM_DISPLAY_NAMES: Record<DevTeam, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  mobile: 'Mobile',
  platform: 'Platform',
  data: 'Data',
  payments: 'Payments',
  search: 'Search',
  notifications: 'Notifications',
  security: 'Security',
  localization: 'Localization',
  'customer-success': 'Customer Success',
  growth: 'Growth',
};

interface TeamIconProps {
  team: DevTeam;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const CONTAINER_SIZE_CLASSES = {
  xs: 'p-1',
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

export default function TeamIcon({
  team,
  size = 'sm',
  showLabel = false,
  showTooltip = true,
  className = '',
}: TeamIconProps) {
  const IconComponent = TEAM_ICON_COMPONENTS[team];
  const colors = TEAM_COLORS[team];
  const displayName = TEAM_DISPLAY_NAMES[team];

  if (!IconComponent) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      title={showTooltip ? `Assigned to: ${displayName}` : undefined}
    >
      <div className={`${CONTAINER_SIZE_CLASSES[size]} rounded-md ${colors}`}>
        <IconComponent className={`${SIZE_CLASSES[size]} ${colors.split(' ')[0]}`} />
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ${colors.split(' ')[0]}`}>
          {displayName}
        </span>
      )}
    </div>
  );
}

// Badge variant for inline display
export function TeamBadge({ team, className = '' }: { team: DevTeam; className?: string }) {
  const IconComponent = TEAM_ICON_COMPONENTS[team];
  const colors = TEAM_COLORS[team];
  const displayName = TEAM_DISPLAY_NAMES[team];

  if (!IconComponent) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors} ${className}`}
      title={`Assigned to: ${displayName}`}
    >
      <IconComponent className="w-3 h-3" />
      <span>{displayName}</span>
    </div>
  );
}

// Export helper function for getting icon component
export function getTeamIconComponent(team: DevTeam): LucideIcon {
  return TEAM_ICON_COMPONENTS[team];
}

export function getTeamDisplayName(team: DevTeam): string {
  return TEAM_DISPLAY_NAMES[team];
}
