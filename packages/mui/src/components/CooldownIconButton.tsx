'use client';

import { IconButton, type IconButtonProps } from '@mui/material';
import type { MouseEvent } from 'react';
import { useState } from 'react';

export interface CooldownIconButtonProps extends IconButtonProps {
  /**
   * Cooldown duration in milliseconds
   */
  cooldown?: number;
}

export const CooldownIconButton = ({
  cooldown = 700,
  onClick,
  disabled,
  ref,
  ...props
}: CooldownIconButtonProps) => {
  const [isCooldown, setIsCooldown] = useState(false);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!isCooldown && onClick) {
      onClick(event);
      setIsCooldown(true);
      setTimeout(() => setIsCooldown(false), cooldown);
    }
  };

  return (
    <IconButton {...props} ref={ref} onClick={handleClick} disabled={disabled || isCooldown}>
      {props.children}
    </IconButton>
  );
};

CooldownIconButton.displayName = 'CooldownIconButton';
