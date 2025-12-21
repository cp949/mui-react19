import { Box, type BoxProps } from '@mui/material';
import { forwardRef } from 'react';
import type { CSSProperties } from 'react';

export interface CenterAbsoluteRightProps extends BoxProps {
  right?: CSSProperties['right'];
  fullWidth?: boolean;
}

export const CenterAbsoluteRight = forwardRef<HTMLDivElement, CenterAbsoluteRightProps>(
  ({ fullWidth, right = 0, sx, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={[
          {
            position: 'absolute',
            top: '50%',
            right,
            transform: 'translateY(-50%)',
            ...(fullWidth && {
              width: '100%',
            }),
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      />
    );
  },
);

CenterAbsoluteRight.displayName = 'CenterAbsolute.Right';
