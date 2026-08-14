'use client';

import { Button, type ButtonProps } from '@mui/material';
import type { MouseEvent } from 'react';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback.js';

export interface DebouncedButtonProps extends ButtonProps {
  /**
   * Debounce duration in milliseconds
   */
  debounce?: number;
}

export const DebouncedButton = ({
  debounce = 700,
  onClick,
  disabled,
  children,
  ref,
  ...props
}: DebouncedButtonProps) => {
  const handleClick = useDebouncedCallback((event: MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onClick) {
      onClick(event);
    }
  }, debounce);

  return (
    <Button {...props} ref={ref} onClick={handleClick} disabled={disabled}>
      {children}
    </Button>
  );
};
