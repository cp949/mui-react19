'use client';

import { type Theme, useMediaQuery } from '@mui/material';
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
