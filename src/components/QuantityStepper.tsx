import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showAnimation?: boolean;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  size = 'default',
  className,
  showAnimation = true,
}) => {
  const sizeClasses = {
    sm: 'h-7 gap-1',
    default: 'h-9 gap-2',
    lg: 'h-11 gap-3',
  };

  const buttonSizeClasses = {
    sm: 'h-7 w-7',
    default: 'h-9 w-9',
    lg: 'h-11 w-11',
  };

  const quantityClasses = {
    sm: 'min-w-[2rem] text-sm',
    default: 'min-w-[2.5rem] text-base',
    lg: 'min-w-[3rem] text-lg',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center bg-card border border-primary/30 rounded-lg shadow-sm',
        sizeClasses[size],
        showAnimation && 'animate-in fade-in-0 zoom-in-95 duration-200',
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onDecrement}
        className={cn(
          'hover:bg-primary/10 hover:text-primary transition-colors rounded-l-lg',
          buttonSizeClasses[size]
        )}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <div
        className={cn(
          'flex items-center justify-center font-semibold text-foreground',
          quantityClasses[size]
        )}
      >
        {quantity}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onIncrement}
        className={cn(
          'hover:bg-primary/10 hover:text-primary transition-colors rounded-r-lg',
          buttonSizeClasses[size]
        )}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
