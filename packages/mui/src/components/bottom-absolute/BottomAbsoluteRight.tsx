import { Box, type BoxProps } from '@mui/material';
import type { CSSProperties } from 'react';

export interface BottomAbsoluteRightProps extends BoxProps {
  fullWidth?: boolean;
  bottom?: CSSProperties['bottom'];
  right?: CSSProperties['right'];
}

export const BottomAbsoluteRight = ({
  fullWidth,
  right = 0,
  bottom = 0,
  sx,
  ref,
  ...props
}: BottomAbsoluteRightProps) => {
  return (
    <Box
      ref={ref}
      sx={[
        {
          position: 'absolute',
          right,
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
};

BottomAbsoluteRight.displayName = 'BottomAbsolute.Right';
