'use client';

import { Button, type ButtonProps } from '@mui/material';
import type { MouseEvent } from 'react';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export interface CooldownButtonProps extends ButtonProps {
  /**
   * Cooldown duration in milliseconds
   */
  cooldown?: number;
}

export const CooldownButton = forwardRef<HTMLButtonElement, CooldownButtonProps>(
  ({ cooldown = 1000, onClick, disabled, ...props }, ref) => {
    const [isCooldown, setIsCooldown] = useState(false);
    const internalRef = useRef<HTMLButtonElement>(null);

    useImperativeHandle(ref, () => internalRef.current!);

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (!isCooldown && onClick) {
        onClick(event);
        setIsCooldown(true);
        setTimeout(() => setIsCooldown(false), cooldown);
      }
    };

    return (
      <Button {...props} ref={internalRef} onClick={handleClick} disabled={disabled || isCooldown}>
        {props.children}
      </Button>
    );
  },
);

CooldownButton.displayName = 'CooldownButton';
