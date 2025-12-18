'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Server } from 'lucide-react';
import ProjectServerButton from './ProjectServerButton';
import type { Project, ProcessInfo } from '../lib/types';

// Mock projects data
const mockProjects: Project[] = [
  { id: 'kiwi', name: 'Kiwi.com', path: '/projects/kiwi', port: 3001 },
  { id: 'slevomat', name: 'Slevomat', path: '/projects/slevomat', port: 3002 },
  { id: 'pelikan', name: 'Pelikan', path: '/projects/pelikan', port: 3003 },
];

// Mock statuses
const mockStatuses: Record<string, ProcessInfo> = {
  kiwi: { status: 'running', pid: 12345, port: 3001, uptime: 3600 },
  slevomat: { status: 'stopped', pid: null, port: null, uptime: null },
  pelikan: { status: 'running', pid: 54321, port: 3003, uptime: 7200 },
};

export default function ProjectServersGrid() {
  const [projects] = useState<Project[]>(mockProjects);
  const [statuses, setStatuses] = useState<Record<string, ProcessInfo>>(mockStatuses);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle server toggle (mock)
  const handleToggle = useCallback(async (projectId: string, isRunning: boolean) => {
    setStatuses((prev) => ({
      ...prev,
      [projectId]: isRunning
        ? { status: 'stopped', pid: null, port: null, uptime: null }
        : { status: 'running', pid: Math.floor(Math.random() * 90000) + 10000, port: projects.find(p => p.id === projectId)?.port || 3000, uptime: 0 },
    }));
  }, [projects]);

  // Manual refresh (mock)
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

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
