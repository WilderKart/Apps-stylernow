'use client'

import React from 'react'

export interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  isEmpty?: boolean
  emptyMessage?: string
  trend?: string | number
  trendLabel?: string
  isCurrency?: boolean
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  isEmpty = false,
  emptyMessage = "Sin métricas suficientes",
  trend,
  trendLabel,
  isCurrency = false
}: MetricCardProps) {
  
  // Condición estricta de Empty State (Zero Trust Frontend)
  const isTrulyEmpty = isEmpty || value === 0 || value === '0' || value === '$0'

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <p className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest leading-tight w-2/3">
          {title}
        </p>
        {icon && <div className="text-zinc-300 pointer-events-none">{icon}</div>}
      </div>

      <div className="relative z-10 mt-auto">
        {isTrulyEmpty ? (
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 mt-2 flex items-center justify-center min-h-[60px]">
             <p className="text-xs text-zinc-500 font-medium text-center">{emptyMessage}</p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-black text-[#101010] tracking-tight">
              {isCurrency && typeof value === 'number' ? `$${value.toLocaleString()}` : value}
            </h2>
            
            {title && subtitle && !trend && (
               <p className="text-xs text-zinc-500 font-medium mt-1">{subtitle}</p>
            )}

            {trend && (
              <p className={`text-xs font-bold flex items-center gap-1 mt-2 ${Number(trend) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Number(trend) >= 0 ? '+' : ''}{trend} {trendLabel}
              </p>
            )}
          </>
        )}
      </div>

      {/* Decorative Blur */}
      {!isTrulyEmpty && icon && (
         <div className="absolute -bottom-4 -right-4 opacity-5 blur-xl pointer-events-none scale-150">
            {icon}
         </div>
      )}
    </div>
  )
}
