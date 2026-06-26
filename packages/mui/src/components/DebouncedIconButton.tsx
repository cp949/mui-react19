'use client';

import { IconButton, type IconButtonProps } from '@mui/material';
import type { MouseEvent } from 'react';
import { useEffect, useRef } from 'react';

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
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 언마운트 시 타이머 정리
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
};
