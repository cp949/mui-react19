'use client';

import { ButtonBase, type ButtonBaseProps } from '@mui/material';
import { useCooldown } from '../hooks/useCooldown.js';

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
  const { isCooldown, trigger } = useCooldown(onClick, cooldown);

  return (
    <ButtonBase {...props} ref={ref} onClick={trigger} disabled={disabled || isCooldown}>
      {props.children}
    </ButtonBase>
  );
};

CooldownButtonBase.displayName = 'CooldownButtonBase';
