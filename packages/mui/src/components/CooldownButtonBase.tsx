'use client';

import { ButtonBase, type ButtonBaseProps } from '@mui/material';
import type { MouseEvent } from 'react';
import { useState } from 'react';

export interface CooldownButtonBaseProps extends ButtonBaseProps {
  /**
   * Cooldown duration in milliseconds
   */
  cooldown?: number;
}

export const CooldownButtonBase = ({
  cooldown = 1000,
  onClick,
  disabled,
  ref,
  ...props
}: CooldownButtonBaseProps) => {
  const [isCooldown, setIsCooldown] = useState(false);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!isCooldown && onClick) {
      onClick(event);
      setIsCooldown(true);
      setTimeout(() => setIsCooldown(false), cooldown);
    }
  };

  return (
    <ButtonBase {...props} ref={ref} onClick={handleClick} disabled={disabled || isCooldown}>
      {props.children}
    </ButtonBase>
  );
};

CooldownButtonBase.displayName = 'CooldownButtonBase';
