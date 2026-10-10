'use client';

import type { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { ReactNode } from 'react';

export interface MdOrDownProps {
  children?: ReactNode | ReactNode[];
}

export function MdOrDown(props: MdOrDownProps) {
  const { children } = props;
  const matched = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));
  if (!matched || !children) return null;
  return <>{children}</>;
}
