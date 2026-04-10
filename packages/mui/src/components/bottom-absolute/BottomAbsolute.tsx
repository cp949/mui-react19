import { Box, type BoxProps } from '@mui/material';
import type { CSSProperties } from 'react';
import { forwardRef } from 'react';
import { BottomAbsoluteCenter } from './BottomAbsoluteCenter.js';
import { BottomAbsoluteLeft } from './BottomAbsoluteLeft.js';
import { BottomAbsoluteRight } from './BottomAbsoluteRight.js';

export type { BottomAbsoluteCenterProps } from './BottomAbsoluteCenter.js';
export type { BottomAbsoluteLeftProps } from './BottomAbsoluteLeft.js';
export type { BottomAbsoluteRightProps } from './BottomAbsoluteRight.js';

export interface BottomAbsoluteProps extends BoxProps {
  left?: CSSProperties['left'];
  right?: CSSProperties['right'];
  bottom?: CSSProperties['bottom'];
}

interface BottomAbsoluteComponent extends React.ForwardRefExoticComponent<BottomAbsoluteProps> {
  Left: typeof BottomAbsoluteLeft;
  Right: typeof BottomAbsoluteRight;
  Center: typeof BottomAbsoluteCenter;
}

const BottomAbsoluteBase = forwardRef<HTMLDivElement, BottomAbsoluteProps>(
  ({ bottom = 0, left = 0, right = 0, sx, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={[
          {
            position: 'absolute',
            bottom,
            left,
            right,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      />
    );
  },
) as BottomAbsoluteComponent;

BottomAbsoluteBase.displayName = 'BottomAbsoluteBase';

export const BottomAbsolute = BottomAbsoluteBase;
BottomAbsolute.displayName = 'BottomAbsolute';
BottomAbsolute.Left = BottomAbsoluteLeft;
BottomAbsolute.Right = BottomAbsoluteRight;
BottomAbsolute.Center = BottomAbsoluteCenter;
