'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Server } from 'lucide-react';
import ProjectServerButton from './ProjectServerButton';
import { mockProjects } from '../lib/mockData';
import type { ProcessInfo } from '../lib/types';

export default function ProjectServersGrid() {
  // Use mock projects directly for UI mock
  const projects = mockProjects;

  // Mock statuses state - simulates server status
  const [statuses, setStatuses] = useState<Record<string, ProcessInfo>>({
    'project-1': { status: 'running', port: 3000 },
    'project-2': { status: 'stopped' },
    'project-3': { status: 'stopped' },
    'project-4': { status: 'running', port: 4000 },
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock toggle handler - simulates starting/stopping servers
  const handleToggle = useCallback(async (projectId: string, isRunning: boolean) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    setStatuses(prev => ({
      ...prev,
      [projectId]: isRunning
        ? { status: 'stopped' }
        : { status: 'running', port: projects.find(p => p.id === projectId)?.port }
    }));
  }, [projects]);

  // Manual refresh (mock)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <Server className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">No projects configured</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Server className="w-4 h-4" />
          Project Servers
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
          title="Refresh status"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Projects Grid */}
      <motion.div
        className="flex flex-wrap gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {projects.map((project) => (
          <ProjectServerButton
            key={project.id}
            project={project}
            status={statuses[project.id] || null}
            onToggle={handleToggle}
          />
        ))}
      </motion.div>

      {/* Running count */}
      <div className="text-xs text-gray-500 px-1">
        {Object.values(statuses).filter(s => s.status === 'running').length} of {projects.length} servers running
      </div>
    </div>
  );
}
