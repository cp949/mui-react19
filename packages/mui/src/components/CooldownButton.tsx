'use client';

import { Button, type ButtonProps } from '@mui/material';
import { useCooldown } from '../hooks/useCooldown.js';

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
  const { isCooldown, trigger } = useCooldown(onClick, cooldown);

  return (
    <Button {...props} ref={ref} onClick={trigger} disabled={disabled || isCooldown}>
      {props.children}
    </Button>
  );
};

CooldownButton.displayName = 'CooldownButton';
