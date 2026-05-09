import React from 'react';

type Color = 'teal' | 'blue' | 'amber' | 'rose' | 'green' | 'slate' | 'orange' | 'cyan';

interface BadgeProps {
  children: React.ReactNode;
  color?: Color;
  size?: 'sm' | 'md';
  className?: string;
}

const colorClasses: Record<Color, string> = {
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
};

export default function Badge({ children, color = 'teal', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center border font-medium rounded-full
        ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
        ${colorClasses[color]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
