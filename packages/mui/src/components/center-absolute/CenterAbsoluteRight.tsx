import { Box, type BoxProps } from '@mui/material';
import type { CSSProperties } from 'react';

export interface CenterAbsoluteRightProps extends BoxProps {
  right?: CSSProperties['right'];
  fullWidth?: boolean;
}

export const CenterAbsoluteRight = ({
  fullWidth,
  right = 0,
  sx,
  ref,
  ...props
}: CenterAbsoluteRightProps) => {
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
};

CenterAbsoluteRight.displayName = 'CenterAbsolute.Right';
