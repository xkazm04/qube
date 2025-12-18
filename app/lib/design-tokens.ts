/**
 * Design Tokens
 *
 * Standardized values for spacing, colors, sizing, and other visual properties.
 * Use these tokens to ensure visual consistency across all components.
 *
 * Usage:
 * - Import specific tokens: import { iconSize, opacity, radius } from '@/app/lib/design-tokens'
 * - Use in Tailwind classes: className={`w-${iconSize.md} h-${iconSize.md}`}
 * - Use CSS variables from globals.css for colors that need theme support
 */

// =============================================================================
// ICON SIZES
// =============================================================================
// Standardized icon sizes for consistent visual hierarchy
// Use these sizes based on context:
// - xs: Inline indicators, badges
// - sm: Secondary icons, list items
// - md: Primary interactive elements, buttons
// - lg: Featured icons, headers
// - xl: Hero elements, empty states

export const iconSize = {
  /** 12px - Inline indicators, status dots, minimal icons */
  xs: '3',
  /** 14px - Small secondary icons, compact list items */
  sm: '3.5',
  /** 16px - Default icon size for buttons and interactive elements */
  md: '4',
  /** 20px - Featured icons, section headers */
  lg: '5',
  /** 24px - Large icons, empty states */
  xl: '6',
  /** 32px - Hero elements, major empty states */
  '2xl': '8',
} as const;

// Tailwind class helpers for icons
export const iconClass = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
  '2xl': 'w-8 h-8',
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================
// Matches CSS variables in globals.css
// Use CSS variables (--radius-*) directly in styles when possible

export const radius = {
  /** 4px - Subtle rounding for small elements */
  sm: 'rounded-sm',
  /** 8px - Default rounding for cards, buttons */
  md: 'rounded-md',
  /** 12px - Prominent rounding for modals, panels */
  lg: 'rounded-lg',
  /** 16px - Extra rounding for featured elements */
  xl: 'rounded-xl',
  /** 24px - Maximum rounding for pills, badges */
  '2xl': 'rounded-2xl',
  /** Fully rounded for circles */
  full: 'rounded-full',
} as const;

// CSS variable references for use in style objects
export const radiusValue = {
  sm: 'var(--radius-sm)',   // 4px
  md: 'var(--radius-md)',   // 8px
  lg: 'var(--radius-lg)',   // 12px
} as const;

// =============================================================================
// OPACITY LEVELS
// =============================================================================
// Standardized opacity values for backgrounds, borders, and interactive states
// Pattern: bg-{color}-500/{opacity}

export const opacity = {
  /** 10% - Subtle backgrounds, disabled states */
  subtle: '10',
  /** 20% - Default background tint, borders */
  default: '20',
  /** 30% - Enhanced background, hover states */
  moderate: '30',
  /** 40% - Interactive states, focus backgrounds */
  interactive: '40',
  /** 50% - Strong emphasis, overlays */
  strong: '50',
} as const;

// Pre-built Tailwind class suffixes
export const opacityClass = {
  subtle: '/10',
  default: '/20',
  moderate: '/30',
  interactive: '/40',
  strong: '/50',
} as const;

// =============================================================================
// SPACING SCALE
// =============================================================================
// Based on Tailwind's default 4px base unit
// Provides semantic naming for consistent spacing patterns

export const spacing = {
  /** 0px */
  none: '0',
  /** 2px - Minimal spacing for tight elements */
  px: 'px',
  /** 4px - Compact internal spacing */
  xs: '1',
  /** 8px - Default gap between small elements */
  sm: '2',
  /** 12px - Medium internal padding */
  md: '3',
  /** 16px - Standard component padding */
  lg: '4',
  /** 20px - Section separation */
  xl: '5',
  /** 24px - Major section padding */
  '2xl': '6',
  /** 32px - Large section separation */
  '3xl': '8',
  /** 40px - Page-level spacing */
  '4xl': '10',
  /** 48px - Major vertical rhythm */
  '5xl': '12',
} as const;

// =============================================================================
// COLOR PALETTE
// =============================================================================
// Semantic color tokens for consistent color usage
// These complement the CSS variables in globals.css

export const colorToken = {
  // Status colors
  success: 'emerald',
  warning: 'amber',
  error: 'red',
  info: 'blue',

  // UI colors
  accent: 'purple',
  secondary: 'gray',

  // Category colors (for feedback types)
  bug: 'red',
  proposal: 'amber',
  feedback: 'emerald',
  feature: 'blue',
  clarification: 'yellow',

  // Channel colors
  facebook: 'blue',
  twitter: 'sky',
  email: 'amber',
  chat: 'green',
  instagram: 'pink',
  trustpilot: '[#00b67a]',
} as const;

// =============================================================================
// COMPONENT-SPECIFIC TOKENS
// =============================================================================

// Status badge configurations
export const statusBadge = {
  bug: {
    bg: `bg-red-500${opacityClass.subtle}`,
    text: 'text-red-400',
    border: `border-red-500${opacityClass.default}`,
  },
  proposal: {
    bg: `bg-amber-500${opacityClass.subtle}`,
    text: 'text-amber-400',
    border: `border-amber-500${opacityClass.default}`,
  },
  feedback: {
    bg: `bg-emerald-500${opacityClass.subtle}`,
    text: 'text-emerald-400',
    border: `border-emerald-500${opacityClass.default}`,
  },
  feature: {
    bg: `bg-blue-500${opacityClass.subtle}`,
    text: 'text-blue-400',
    border: `border-blue-500${opacityClass.default}`,
  },
} as const;

// Priority indicators
export const priorityDot = {
  low: 'bg-gray-400',
  medium: 'bg-amber-400',
  high: 'bg-orange-400',
  critical: 'bg-red-400',
} as const;

export const priorityDotSize = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
} as const;

// Button sizes
export const buttonSize = {
  xs: {
    padding: 'px-2 py-1',
    text: 'text-xs',
    icon: iconClass.xs,
    gap: 'gap-1',
  },
  sm: {
    padding: 'px-3 py-1.5',
    text: 'text-xs',
    icon: iconClass.sm,
    gap: 'gap-1.5',
  },
  md: {
    padding: 'px-4 py-2',
    text: 'text-sm',
    icon: iconClass.md,
    gap: 'gap-2',
  },
  lg: {
    padding: 'px-5 py-2.5',
    text: 'text-base',
    icon: iconClass.lg,
    gap: 'gap-2.5',
  },
} as const;

// Card component tokens
export const card = {
  /** Standard card background */
  bg: 'bg-gray-800/20',
  /** Elevated card background for hover/focus */
  bgElevated: 'bg-gray-800/40',
  /** Card border */
  border: 'border-gray-700/40',
  /** Card border on hover */
  borderHover: 'border-gray-600/50',
  /** Standard card padding */
  padding: 'p-3',
  /** Compact card padding */
  paddingCompact: 'p-2',
  /** Standard card radius */
  radius: radius.lg,
} as const;

// Modal tokens
export const modal = {
  bg: 'bg-gray-900/95',
  border: 'border-gray-700/50',
  radius: radius.xl,
  padding: 'p-6',
  headerPadding: 'px-6 py-4',
  footerPadding: 'px-6 py-4',
  backdrop: 'bg-black/60',
} as const;

// =============================================================================
// ANIMATION TOKENS
// =============================================================================

export const transition = {
  fast: 'transition-all duration-150',
  normal: 'transition-all duration-200',
  slow: 'transition-all duration-300',
  colors: 'transition-colors duration-200',
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate a background color class with standardized opacity
 * @param color - Tailwind color (e.g., 'purple', 'blue', 'red')
 * @param level - Opacity level from opacity tokens
 */
export function bgOpacity(color: string, level: keyof typeof opacity = 'default'): string {
  return `bg-${color}-500${opacityClass[level]}`;
}

/**
 * Generate a border color class with standardized opacity
 */
export function borderOpacity(color: string, level: keyof typeof opacity = 'default'): string {
  return `border-${color}-500${opacityClass[level]}`;
}

/**
 * Get consistent icon classes for a given size
 */
export function getIconClass(size: keyof typeof iconClass = 'md'): string {
  return iconClass[size];
}

// Type exports for TypeScript support
export type IconSize = keyof typeof iconSize;
export type OpacityLevel = keyof typeof opacity;
export type Radius = keyof typeof radius;
export type Spacing = keyof typeof spacing;
export type ColorToken = keyof typeof colorToken;
export type PriorityLevel = keyof typeof priorityDot;
export type ButtonSize = keyof typeof buttonSize;
