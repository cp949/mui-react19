'use client';

import type { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { ReactNode } from 'react';

export interface XsOrDownProps {
  children?: ReactNode | ReactNode[];
}

export function XsOrDown(props: XsOrDownProps) {
  const { children } = props;
  const matched = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  if (!matched || !children) return null;
  return <>{children}</>;
}
