import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'neon' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    className, variant = 'primary', size = 'md', loading, children, ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        primary: "bg-brand-primary text-white hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/20",
        secondary: "bg-space-card border border-brand-secondary/30 text-brand-secondary hover:bg-brand-secondary/10",
        ghost: "bg-transparent text-space-muted hover:text-white hover:bg-white/5",
        neon: "bg-brand-accent text-space-black shadow-neon hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]",
        danger: "bg-feedback-error/10 text-feedback-error border border-feedback-error/30 hover:bg-feedback-error/20"
    };

    const sizes = {
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base tracking-wide"
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? <span className="animate-spin mr-2">⏳</span> : null}
            {children}
        </button>
    );
};
