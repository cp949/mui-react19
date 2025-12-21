'use client';

import { IconButton, type IconButtonProps } from '@mui/material';
import type { MouseEvent } from 'react';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export interface CooldownIconButtonProps extends IconButtonProps {
  /**
   * Cooldown duration in milliseconds
   */
  cooldown?: number;
}

export const CooldownIconButton = forwardRef<HTMLButtonElement, CooldownIconButtonProps>(
  ({ cooldown = 700, onClick, disabled, ...props }, ref) => {
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
      <IconButton
        {...props}
        ref={internalRef}
        onClick={handleClick}
        disabled={disabled || isCooldown}
      >
        {props.children}
      </IconButton>
    );
  },
);

CooldownIconButton.displayName = 'CooldownIconButton';
