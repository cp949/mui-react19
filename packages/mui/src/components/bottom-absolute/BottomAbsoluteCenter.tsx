import { Box, type BoxProps } from '@mui/material';
import { forwardRef } from 'react';
import { type CSSProperties } from 'react';

export interface BottomAbsoluteCenterProps extends BoxProps {
  fullWidth?: boolean;
  bottom?: CSSProperties['bottom'];
}

export const BottomAbsoluteCenter = forwardRef<HTMLDivElement, BottomAbsoluteCenterProps>(
  ({ fullWidth, bottom = 0, sx, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={[
          {
            position: 'absolute',
            bottom,
            left: '50%',
            transform: 'translate(-50%, -50%)',
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

BottomAbsoluteCenter.displayName = 'BottomAbsolute.Center';
