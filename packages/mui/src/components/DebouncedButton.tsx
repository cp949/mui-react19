'use client';

import { Button, type ButtonProps } from '@mui/material';
import type { MouseEvent } from 'react';
import { forwardRef, useEffect, useRef } from 'react';

export interface DebouncedButtonProps extends ButtonProps {
  /**
   * Debounce duration in milliseconds
   */
  debounce?: number;
}

export const DebouncedButton = forwardRef<HTMLButtonElement, DebouncedButtonProps>(
  ({ debounce = 700, onClick, disabled, children, ...props }, ref) => {
    const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup timer on unmount
    useEffect(() => {
      return () => {
        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
        }
      };
    }, []);

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        if (!disabled && onClick) onClick(event);
      }, debounce);
    };

    return (
      <Button {...props} ref={ref} onClick={handleClick} disabled={disabled}>
        {children}
      </Button>
    );
  },
);

DebouncedButton.displayName = 'DebouncedButton';
