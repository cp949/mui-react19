import { Box, type BoxProps } from '@mui/material';
import { forwardRef } from 'react';
import type { CSSProperties } from 'react';

export interface CenterAbsoluteLeftProps extends BoxProps {
  left?: CSSProperties['left'];
  fullWidth?: boolean;
}

export const CenterAbsoluteLeft = forwardRef<HTMLDivElement, CenterAbsoluteLeftProps>(
  ({ fullWidth, left = 0, sx, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={[
          {
            position: 'absolute',
            top: '50%',
            left,
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

CenterAbsoluteLeft.displayName = 'CenterAbsolute.Left';
