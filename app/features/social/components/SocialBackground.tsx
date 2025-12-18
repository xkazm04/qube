'use client';

import React from 'react';

/**
 * Premium dark-mode background for the Social Hub
 * Features gradient orbs, grid pattern, and subtle decorative elements
 * Optimized for performance - no infinite animations
 */
export default function SocialBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient - deep purple to black */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0d0d1a] to-[#0a0a0a]" />

      {/* Primary gradient orb - top left */}
      <div
        className="absolute -top-[30%] -left-[20%] w-[70vw] h-[70vw] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Secondary gradient orb - bottom right */}
      <div
        className="absolute -bottom-[20%] -right-[15%] w-[60vw] h-[60vw] rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(59, 130, 246, 0.08) 40%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />

      {/* Accent orb - center right */}
      <div
        className="absolute top-[30%] right-[5%] w-[40vw] h-[40vw] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Subtle cyan accent - bottom left */}
      <div
        className="absolute bottom-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.08) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundSize: '60px 60px',
          backgroundImage: `
            linear-gradient(to right, rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
        }}
      />

      {/* Diagonal lines pattern - top section */}
      <div
        className="absolute top-0 left-0 w-full h-[40%] opacity-[0.015]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(139, 92, 246, 0.5) 20px,
            rgba(139, 92, 246, 0.5) 21px
          )`,
        }}
      />

      {/* Noise texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative circles - static geometric elements */}
      <div className="absolute top-[15%] left-[8%] w-32 h-32 rounded-full border border-purple-500/10" />
      <div className="absolute top-[12%] left-[6%] w-48 h-48 rounded-full border border-purple-500/5" />
      
      <div className="absolute bottom-[25%] right-[12%] w-24 h-24 rounded-full border border-cyan-500/10" />
      <div className="absolute bottom-[22%] right-[10%] w-40 h-40 rounded-full border border-cyan-500/5" />

      {/* Corner accent shapes */}
      <div 
        className="absolute top-0 right-0 w-[300px] h-[300px] opacity-[0.03]"
        style={{
          background: 'linear-gradient(225deg, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-[0.02]"
        style={{
          background: 'linear-gradient(45deg, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
        }}
      />

      {/* Horizontal gradient line accents */}
      <div className="absolute top-[20%] left-0 w-[30%] h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      <div className="absolute top-[80%] right-0 w-[25%] h-px bg-gradient-to-l from-transparent via-cyan-500/15 to-transparent" />

      {/* Dot pattern - sparse decorative dots */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dot-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(139, 92, 246, 0.5)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-pattern)" />
      </svg>

      {/* Vignette effect for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.4) 100%)',
        }}
      />
    </div>
  );
}
