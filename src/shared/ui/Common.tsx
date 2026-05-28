import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

import { motion } from 'framer-motion';

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hoverable = false,
  ...props
}) => {
  const { onDrag, ...motionProps } = props as any;
  return (
    <motion.div
      whileHover={hoverable ? { y: -4, backgroundColor: "rgba(255, 255, 255, 0.08)" } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "bg-surface/40 backdrop-blur-md border border-accent-white/10 rounded-3xl p-6 transition-all duration-300",
        className
      )}
      {...motionProps}
    >
      {children}
    </motion.div>
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
  const { onDrag, ...motionProps } = props as any;
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02, backgroundColor: "rgba(139, 92, 246, 0.1)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "bg-surface/60 backdrop-blur-xl border border-accent-white/10 text-accent-white rounded-full px-6 py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest",
        variant === 'ghost' && "bg-transparent border-accent-white/5",
        variant === 'danger' && "border-red-500/20 text-red-400 hover:bg-red-500/10",
        className
      )}
      {...motionProps}
    >
      {children}
    </motion.button>
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

export const hapticFeedback = () => {
    if ('vibrate' in navigator) {
        navigator.vibrate(10);
    }
};
