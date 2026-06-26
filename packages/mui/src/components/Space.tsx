import { Box, type BoxProps } from '@mui/material';

export interface SpaceProps extends BoxProps {
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
}

export const Space = ({ width, height, minWidth, minHeight, sx, ref, ...props }: SpaceProps) => {
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
};

Space.displayName = 'Space';
