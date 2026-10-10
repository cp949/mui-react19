'use client';

import type { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { ReactNode } from 'react';

export interface LgOrUpProps {
  children?: ReactNode | ReactNode[];
}

export function LgOrUp(props: LgOrUpProps) {
  const { children } = props;
  const matched = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  if (!matched || !children) return null;
  return <>{children}</>;
}
