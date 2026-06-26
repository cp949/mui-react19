'use client';

import { Button, type ButtonProps } from '@mui/material';
import type { MouseEvent } from 'react';
import { useState } from 'react';

export interface CooldownButtonProps extends ButtonProps {
  /**
   * Cooldown duration in milliseconds
   */
  cooldown?: number;
}

export const CooldownButton = ({
  cooldown = 1000,
  onClick,
  disabled,
  ref,
  ...props
}: CooldownButtonProps) => {
  const [isCooldown, setIsCooldown] = useState(false);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!isCooldown && onClick) {
      onClick(event);
      setIsCooldown(true);
      setTimeout(() => setIsCooldown(false), cooldown);
    }
  };

  return (
    <Button {...props} ref={ref} onClick={handleClick} disabled={disabled || isCooldown}>
      {props.children}
    </Button>
  );
};

CooldownButton.displayName = 'CooldownButton';
