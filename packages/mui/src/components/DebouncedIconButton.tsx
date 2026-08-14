'use client';

import { IconButton, type IconButtonProps } from '@mui/material';
import type { MouseEvent } from 'react';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback.js';

export interface DebouncedIconButtonProps extends IconButtonProps {
  /**
   * Debounce duration in milliseconds
   */
  debounce?: number;
}

export const DebouncedIconButton = ({
  debounce = 700,
  onClick,
  disabled,
  ref,
  ...props
}: DebouncedIconButtonProps) => {
  const handleClick = useDebouncedCallback((event: MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onClick) {
      onClick(event);
    }
  }, debounce);

  return (
    <IconButton {...props} ref={ref} onClick={handleClick} disabled={disabled}>
      {props.children}
    </IconButton>
  );
};
