'use client';

import { ButtonBase, type ButtonBaseProps } from '@mui/material';
import type { MouseEvent } from 'react';
import { forwardRef, useEffect, useRef } from 'react';

export interface DebouncedButtonBaseProps extends ButtonBaseProps {
  /**
   * Debounce duration in milliseconds
   */
  debounce?: number;
}

export const DebouncedButtonBase = forwardRef<HTMLButtonElement, DebouncedButtonBaseProps>(
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
        if (!disabled && onClick) {
          onClick(event);
        }
      }, debounce);
    };

    return (
      <ButtonBase {...props} ref={ref} onClick={handleClick} disabled={disabled}>
        {children}
      </ButtonBase>
    );
  },
);

DebouncedButtonBase.displayName = 'DebouncedButtonBase';
