'use client';

import { Button, type ButtonProps } from '@mui/material';
import type { MouseEvent } from 'react';
import { useEffect, useRef } from 'react';

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
      if (!disabled && onClick) onClick(event);
    }, debounce);
  };

  return (
    <Button {...props} ref={ref} onClick={handleClick} disabled={disabled}>
      {children}
    </Button>
  );
};
