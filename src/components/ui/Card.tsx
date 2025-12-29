import React from 'react';
import { cn } from './Button'; // Reusing cn utility if exported or duplicate utility

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'glass' | 'solid' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    className, variant = 'solid', padding = 'md', children, ...props
}) => {
    const baseStyles = "rounded-3xl overflow-hidden transition-all";

    const variants = {
        glass: "bg-space-card/60 backdrop-blur-xl border border-white/10 shadow-card",
        solid: "bg-space-card border border-space-border shadow-card",
        outlined: "bg-transparent border-2 border-dashed border-space-border hover:border-brand-primary/50"
    };

    const paddings = {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8 md:p-10"
    };

    return (
        <div className={cn(baseStyles, variants[variant], paddings[padding], className)} {...props}>
            {children}
        </div>
    );
};
