'use client';

import { IconButton, type IconButtonProps } from '@mui/material';
import type { MouseEvent } from 'react';
import { forwardRef, useEffect, useRef } from 'react';

export interface DebouncedIconButtonProps extends IconButtonProps {
  /**
   * Debounce duration in milliseconds
   */
  debounce?: number;
}

export const DebouncedIconButton = forwardRef<HTMLButtonElement, DebouncedIconButtonProps>(
  ({ debounce = 700, onClick, disabled, ...props }, ref) => {
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
      <IconButton {...props} ref={ref} onClick={handleClick} disabled={disabled}>
        {props.children}
      </IconButton>
    );
  },
);

DebouncedIconButton.displayName = 'DebouncedIconButton';
