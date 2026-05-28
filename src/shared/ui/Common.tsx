import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 transition-all duration-300",
        hoverable && "hover:bg-white/10 hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  ...props
}) => {
  return (
    <button
      className={cn(
        "bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-full px-6 py-3 transition-all duration-300 hover:bg-white/15 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest",
        variant === 'ghost' && "bg-transparent border-white/5",
        variant === 'danger' && "border-red-500/20 text-red-400 hover:bg-red-500/10",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode, color?: string }> = ({ children, color = 'var(--color-accent-cyan)' }) => (
    <div
        className="px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tighter"
        style={{ borderColor: `${color}40`, backgroundColor: `${color}10`, color }}
    >
        {children}
    </div>
);
