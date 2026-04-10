'use client';

import { type Theme, useMediaQuery } from '@mui/material';
import type { ReactNode } from 'react';

export interface SmOrDownProps {
  children?: ReactNode | ReactNode[];
}

export function SmOrDown(props: SmOrDownProps) {
  const { children } = props;
  const matched = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  if (!matched || !children) return null;
  return <>{children}</>;
}
