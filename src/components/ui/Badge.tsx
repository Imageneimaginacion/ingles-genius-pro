import React from 'react';
import { cn } from './Button';

interface BadgeProps {
    variant?: 'success' | 'warning' | 'error' | 'info' | 'level';
    children: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'info', children, className }) => {
    const variants = {
        success: "bg-feedback-success/10 text-feedback-success border-feedback-success/20",
        warning: "bg-feedback-warning/10 text-feedback-warning border-feedback-warning/20",
        error: "bg-feedback-error/10 text-feedback-error border-feedback-error/20",
        info: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
        level: "bg-brand-secondary/20 text-brand-secondary border-brand-secondary/50 font-black tracking-widest uppercase text-[10px]"
    };

    return (
        <span className={cn("px-3 py-1 rounded-full text-xs font-bold border flex items-center justify-center w-fit", variants[variant], className)}>
            {children}
        </span>
    );
};
