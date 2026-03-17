'use client';

import React from 'react';

export default function Logo({ className = "w-10 h-10", markOnly = false }: { className?: string; markOnly?: boolean }) {
  return (
    <div className={`flex items-center ${markOnly ? '' : 'gap-2'} select-none`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
      >
        <defs>
          <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFDB5" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#AA7D1F" />
            <stop offset="100%" stopColor="#8A640F" />
          </linearGradient>
        </defs>

        {/* Círculo base de fondo para contraste */}
        <circle cx="50" cy="50" r="48" fill="#141414" />

        {/* Símbolo central: Combinación de navaja y 'S' estilizada */}
        {/* Curva S principal */}
        <path 
          d="M65 35 
             C60 25, 40 25, 35 30 
             C30 35, 35 45, 50 50 
             C65 55, 70 65, 65 70 
             C60 75, 40 75, 35 65" 
          stroke="url(#gold-grad)" 
          strokeWidth="6" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* Figura de la navaja clásica paralela */}
        <path 
          d="M40 30 L60 30 C63 30, 65 32, 65 35 L65 40 L40 40 Z" 
          fill="url(#gold-grad)" 
          opacity="0.15"
        />

        {/* Línea divisoria elegante / Reflejo de barbería */}
        <line x1="20" y1="50" x2="80" y2="50" stroke="#FFFFFF" strokeWidth="1" opacity="0.1" />

        {/* Marcación inferior de navaja */}
        <path 
          d="M48 45 L52 45 L50 49 Z" 
          fill="url(#gold-grad)" 
        />
      </svg>
      
      {!markOnly && (
        <span className="text-xl font-black tracking-tighter text-[#1A1A1A]">
          StylerNow
        </span>
      )}
    </div>
  );
}
