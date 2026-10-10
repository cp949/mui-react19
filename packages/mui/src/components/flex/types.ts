import type { BoxProps } from '@mui/material/Box';
import type { CSSProperties } from 'react';

export interface FlexBaseProps extends BoxProps {
  alignItems?: CSSProperties['alignItems'];
  justifyContent?: CSSProperties['justifyContent'];
  flexWrap?: CSSProperties['flexWrap'];
  inlineFlex?: boolean;
}
