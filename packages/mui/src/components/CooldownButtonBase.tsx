'use client';

import { ButtonBase, type ButtonBaseProps } from '@mui/material';
import type { MouseEvent } from 'react';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export interface CooldownButtonBaseProps extends ButtonBaseProps {
  /**
   * Cooldown duration in milliseconds
   */
  cooldown?: number;
}

export const CooldownButtonBase = forwardRef<HTMLButtonElement, CooldownButtonBaseProps>(
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
      <ButtonBase
        {...props}
        ref={internalRef}
        onClick={handleClick}
        disabled={disabled || isCooldown}
      >
        {props.children}
      </ButtonBase>
    );
  },
);

CooldownButtonBase.displayName = 'CooldownButtonBase';
