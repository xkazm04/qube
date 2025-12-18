'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  Sparkles,
  CheckCircle,
  Rocket,
  ArrowRight,
} from 'lucide-react';
import {
  iconClass,
  opacityClass,
  radius,
  card,
  transition,
} from '@/app/lib/design-tokens';
import type { RawFeedback, EvaluatedFeedback } from '../lib/types';

interface PipelineStage {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  count: number;
  description: string;
}

interface FeedbackPipelineProgressProps {
  rawFeedback: RawFeedback[];
  evaluatedFeedback: EvaluatedFeedback[];
  isProcessing?: boolean;
}

export default function FeedbackPipelineProgress({
  rawFeedback,
  evaluatedFeedback,
  isProcessing = false,
}: FeedbackPipelineProgressProps) {
  // Calculate counts for each stage
  const stageCounts = useMemo(() => {
    const incoming = rawFeedback.length;
    const processing = isProcessing ? rawFeedback.length : 0;
    const processed = evaluatedFeedback.length;
    const actioned = evaluatedFeedback.filter(
      (fb) => fb.ticket || fb.reply
    ).length;

    return { incoming, processing, processed, actioned };
  }, [rawFeedback, evaluatedFeedback, isProcessing]);

  const stages: PipelineStage[] = [
    {
      id: 'incoming',
      label: 'Incoming',
      icon: Inbox,
      color: 'purple',
      count: stageCounts.incoming,
      description: 'Awaiting review',
    },
    {
      id: 'processing',
      label: 'AI Processing',
      icon: Sparkles,
      color: 'cyan',
      count: stageCounts.processing,
      description: 'Being analyzed',
    },
    {
      id: 'processed',
      label: 'Processed',
      icon: CheckCircle,
      color: 'emerald',
      count: stageCounts.processed,
      description: 'Ready for action',
    },
    {
      id: 'actioned',
      label: 'Actioned',
      icon: Rocket,
      color: 'amber',
      count: stageCounts.actioned,
      description: 'Tickets or replies',
    },
  ];

  const getColorClasses = (color: string) => ({
    bg: `bg-${color}-500${opacityClass.default}`,
    bgActive: `bg-${color}-500${opacityClass.moderate}`,
    text: `text-${color}-400`,
    textBright: `text-${color}-300`,
    border: `border-${color}-500${opacityClass.moderate}`,
    glow: `shadow-${color}-500/20`,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-4 ${radius.xl} bg-gray-900${opacityClass.interactive} border ${card.border} backdrop-blur-xl shadow-2xl shadow-purple-500/5`}
      data-testid="feedback-pipeline-progress"
    >
      {/* Pipeline Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          Feedback Pipeline
        </h3>
        <span className="text-xs text-gray-500">
          {stageCounts.processed + stageCounts.incoming} total items
        </span>
      </div>

      {/* Pipeline Stages */}
      <div className="flex items-center justify-between gap-2">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const colors = getColorClasses(stage.color);
          const isActive = stage.count > 0;
          const isProcessingStage = stage.id === 'processing' && isProcessing;

          return (
            <React.Fragment key={stage.id}>
              {/* Stage Card */}
              <motion.div
                className={`
                  flex-1 relative p-3 ${radius.lg}
                  ${isActive ? colors.bgActive : `bg-gray-800${opacityClass.default}`}
                  border ${isActive ? colors.border : 'border-gray-700/30'}
                  ${transition.normal}
                  ${isActive ? `shadow-lg ${colors.glow}` : ''}
                `}
                data-testid={`pipeline-stage-${stage.id}`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {/* Processing Animation Overlay */}
                {isProcessingStage && (
                  <motion.div
                    className={`absolute inset-0 ${radius.lg} bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent`}
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                )}

                <div className="relative flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className={`
                      p-2 ${radius.md}
                      ${isActive ? colors.bg : `bg-gray-700${opacityClass.default}`}
                      ${isProcessingStage ? 'animate-pulse' : ''}
                    `}
                  >
                    <Icon
                      className={`${iconClass.lg} ${isActive ? colors.text : 'text-gray-500'}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-medium ${isActive ? colors.textBright : 'text-gray-500'}`}
                      >
                        {stage.label}
                      </span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={stage.count}
                          initial={{ opacity: 0, scale: 0.5, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.5, y: 5 }}
                          className={`
                            text-lg font-bold tabular-nums
                            ${isActive ? colors.textBright : 'text-gray-600'}
                          `}
                          data-testid={`pipeline-count-${stage.id}`}
                        >
                          {stage.count}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <span className="text-[10px] text-gray-500 truncate block">
                      {stage.description}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Arrow Connector */}
              {index < stages.length - 1 && (
                <div className="flex-shrink-0 px-1">
                  <motion.div
                    animate={
                      isProcessing && index === 0
                        ? { x: [0, 4, 0], opacity: [0.5, 1, 0.5] }
                        : {}
                    }
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <ArrowRight
                      className={`${iconClass.md} ${
                        isProcessing && index === 0
                          ? 'text-cyan-400'
                          : 'text-gray-600'
                      }`}
                    />
                  </motion.div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className={`h-1.5 ${radius.full} bg-gray-800/60 overflow-hidden`}>
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{
              width: `${
                stageCounts.processed > 0
                  ? Math.min(
                      ((stageCounts.actioned / stageCounts.processed) * 100) || 0,
                      100
                    )
                  : 0
              }%`,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-gray-500">Pipeline Progress</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {stageCounts.processed > 0
              ? `${Math.round((stageCounts.actioned / stageCounts.processed) * 100)}%`
              : '0%'}{' '}
            actioned
          </span>
        </div>
      </div>
    </motion.div>
  );
}
