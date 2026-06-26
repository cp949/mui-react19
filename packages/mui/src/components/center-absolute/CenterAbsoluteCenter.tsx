import { Box, type BoxProps } from '@mui/material';

export interface CenterAbsoluteCenterProps extends BoxProps {
  fullWidth?: boolean;
}

export const CenterAbsoluteCenter = ({
  fullWidth,
  sx,
  ref,
  ...props
}: CenterAbsoluteCenterProps) => {
  return (
    <Box
      ref={ref}
      sx={[
        {
          position: 'absolute',
          top: '50%',
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

CenterAbsoluteCenter.displayName = 'CenterAbsolute.Center';
