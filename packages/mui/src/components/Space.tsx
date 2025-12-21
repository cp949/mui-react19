import { Box, type BoxProps } from '@mui/material';
import { forwardRef } from 'react';

export interface SpaceProps extends BoxProps {
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
}

export const Space = forwardRef<HTMLDivElement, SpaceProps>(
  ({ width, height, minWidth, minHeight, sx, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={[
          {
            width,
            height,
            minWidth: minWidth ?? width,
            minHeight: minHeight ?? height,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      />
    );
  },
);

Space.displayName = 'Space';
