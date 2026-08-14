'use client';

import { IconButton, type IconButtonProps } from '@mui/material';
import { useCooldown } from '../hooks/useCooldown.js';

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
  const { isCooldown, trigger } = useCooldown(onClick, cooldown);

  return (
    <IconButton {...props} ref={ref} onClick={trigger} disabled={disabled || isCooldown}>
      {props.children}
    </IconButton>
  );
};

CooldownIconButton.displayName = 'CooldownIconButton';
