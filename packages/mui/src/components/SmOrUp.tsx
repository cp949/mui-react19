'use client';

import type { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { ReactNode } from 'react';

export interface SmOrUpProps {
  children?: ReactNode | ReactNode[];
}

export function SmOrUp(props: SmOrUpProps) {
  const { children } = props;
  const matched = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
  if (!matched || !children) return null;
  return <>{children}</>;
}
