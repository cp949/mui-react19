'use client';

import type { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { ReactNode } from 'react';

export interface MdOrUpProps {
  children?: ReactNode | ReactNode[];
}

export function MdOrUp(props: MdOrUpProps) {
  const { children } = props;
  const matched = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
  if (!matched || !children) return null;
  return <>{children}</>;
}
