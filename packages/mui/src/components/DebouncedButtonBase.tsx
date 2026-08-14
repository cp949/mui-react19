'use client';

import { ButtonBase, type ButtonBaseProps } from '@mui/material';
import type { MouseEvent } from 'react';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback.js';

export interface DebouncedButtonBaseProps extends ButtonBaseProps {
  /**
   * Debounce duration in milliseconds
   */
  debounce?: number;
}

export const DebouncedButtonBase = ({
  debounce = 700,
  onClick,
  disabled,
  children,
  ref,
  ...props
}: DebouncedButtonBaseProps) => {
  const handleClick = useDebouncedCallback((event: MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onClick) {
      onClick(event);
    }
  }, debounce);

  return (
    <ButtonBase {...props} ref={ref} onClick={handleClick} disabled={disabled}>
      {children}
    </ButtonBase>
  );
};
