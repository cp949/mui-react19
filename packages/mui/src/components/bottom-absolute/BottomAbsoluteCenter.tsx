import { Box, type BoxProps } from '@mui/material';
import type { CSSProperties } from 'react';

export interface BottomAbsoluteCenterProps extends BoxProps {
  fullWidth?: boolean;
  bottom?: CSSProperties['bottom'];
}

export const BottomAbsoluteCenter = ({
  fullWidth,
  bottom = 0,
  sx,
  ref,
  ...props
}: BottomAbsoluteCenterProps) => {
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
};

BottomAbsoluteCenter.displayName = 'BottomAbsolute.Center';
