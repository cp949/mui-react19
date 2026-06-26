import { Box, type BoxProps } from '@mui/material';

export interface CenterProps extends BoxProps {
  vertical?: boolean;
}

export const Center = ({ vertical = false, sx, ref, ...props }: CenterProps) => {
  return (
    <Box
      ref={ref}
      sx={[
        {
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
};

Center.displayName = 'Center';
