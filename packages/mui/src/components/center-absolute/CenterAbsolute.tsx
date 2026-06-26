import { Box, type BoxProps } from '@mui/material';
import type { CSSProperties } from 'react';
import { CenterAbsoluteCenter } from './CenterAbsoluteCenter.js';
import { CenterAbsoluteLeft } from './CenterAbsoluteLeft.js';
import { CenterAbsoluteRight } from './CenterAbsoluteRight.js';

export type { CenterAbsoluteCenterProps } from './CenterAbsoluteCenter.js';
export type { CenterAbsoluteLeftProps } from './CenterAbsoluteLeft.js';
export type { CenterAbsoluteRightProps } from './CenterAbsoluteRight.js';

export interface CenterAbsoluteProps extends BoxProps {
  left?: CSSProperties['left'];
  right?: CSSProperties['right'];
}

interface CenterAbsoluteComponent extends React.FunctionComponent<CenterAbsoluteProps> {
  Left: typeof CenterAbsoluteLeft;
  Right: typeof CenterAbsoluteRight;
  Center: typeof CenterAbsoluteCenter;
}

const CenterAbsoluteBase = (({ left = 0, right = 0, sx, ref, ...props }: CenterAbsoluteProps) => {
  return (
    <Box
      ref={ref}
      sx={[
        {
          position: 'absolute',
          top: '50%',
          left,
          right,
          transform: 'translateY(-50%)',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}) as CenterAbsoluteComponent;

CenterAbsoluteBase.displayName = 'CenterAbsoluteBase';

export const CenterAbsolute = CenterAbsoluteBase;
CenterAbsolute.displayName = 'CenterAbsolute';
CenterAbsolute.Left = CenterAbsoluteLeft;
CenterAbsolute.Right = CenterAbsoluteRight;
CenterAbsolute.Center = CenterAbsoluteCenter;
