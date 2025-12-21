import type { SxProps } from '@mui/material';
import { Box } from '@mui/material';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { forwardRef } from 'react';

export interface MarkProps {
  sx?: SxProps;

  className?: string;

  color?: string;

  bgcolor?: string;

  children?: ReactNode;
}

export const Mark = forwardRef<HTMLElement, MarkProps>((props, ref) => {
  // restProps는 data-xxx를 적용하기 위해 필요함
  const { sx, className, color = '#000', bgcolor = '#ff0', children, ...restProps } = props;
  return (
    <Box
      className={clsx('Mark-root', className)}
      component="mark"
      ref={ref}
      sx={[
        {
          display: 'inline-block',
          color,
          bgcolor,
        },
        ...(Array.isArray(sx) ? sx : [sx ?? false]),
      ]}
      {...restProps}
    >
      {children}
    </Box>
  );
});

Mark.displayName = 'Mark';
