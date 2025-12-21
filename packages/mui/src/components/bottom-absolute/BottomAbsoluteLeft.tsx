import { Box, type BoxProps } from '@mui/material';
import { forwardRef } from 'react';
import { type CSSProperties } from 'react';

export interface BottomAbsoluteLeftProps extends BoxProps {
  fullWidth?: boolean;
  bottom?: CSSProperties['bottom'];
  left?: CSSProperties['left'];
}

export const BottomAbsoluteLeft = forwardRef<HTMLDivElement, BottomAbsoluteLeftProps>(
  ({ fullWidth, left = 0, bottom = 0, sx, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={[
          {
            position: 'absolute',
            left,
            bottom,
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

BottomAbsoluteLeft.displayName = 'BottomAbsolute.Left';
