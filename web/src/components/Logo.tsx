'use client';

import React from 'react';

export default function Logo({ className = "w-10 h-10", markOnly = false }: { className?: string; markOnly?: boolean }) {
  return (
    <div className={`flex items-center ${markOnly ? '' : 'gap-2'} select-none`}>
      <img 
        src="/logo/logo.svg" 
        alt="Logo StylerNow" 
        className={className} 
        style={{ objectFit: 'contain' }}
      />
      
      {!markOnly && (
        <span className="text-xl font-black tracking-tighter text-[#1A1A1A]">
          StylerNow
        </span>
      )}
    </div>
  );
}
