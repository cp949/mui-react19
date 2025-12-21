import { Box, type BoxProps } from '@mui/material';
import { forwardRef } from 'react';

export interface CenterProps extends BoxProps {
  vertical?: boolean;
}

export const Center = forwardRef<HTMLDivElement, CenterProps>(
  ({ vertical = false, sx, ...props }, ref) => {
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
  },
);

Center.displayName = 'Center';
