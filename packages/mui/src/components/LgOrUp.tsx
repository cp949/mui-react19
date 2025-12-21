'use client';

import { type Theme, useMediaQuery } from '@mui/material';
import { type ReactNode } from 'react';

export interface LgOrUpProps {
  children?: ReactNode | ReactNode[];
}

export function LgOrUp(props: LgOrUpProps) {
  const { children } = props;
  const matched = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  if (!matched || !children) return null;
  return <>{children}</>;
}
