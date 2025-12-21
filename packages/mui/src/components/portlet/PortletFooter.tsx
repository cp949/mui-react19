import { Box, type BoxProps } from '@mui/material';
import { clsx } from 'clsx';
import { forwardRef } from 'react';

export interface PortletFooterProps extends BoxProps {
  noDivider?: boolean;
}

export const PortletFooter = forwardRef<HTMLDivElement, PortletFooterProps>((props, ref) => {
  const { noDivider, sx, className, children, ...rest } = props;
  return (
    <Box
      {...rest}
      className={clsx('PortletFooter-root', className, {
        'PortletFooter-noDivider': noDivider,
      })}
      ref={ref}
      sx={[
        (theme) => ({
          p: theme.spacing(1, 2),
          borderTop: '1px solid #E0E4EE',
          borderBottomLeftRadius: '2px',
          borderBottomRightRadius: '2px',
          '&.PortletFooter-noDivider': {
            borderTop: 'none',
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx ?? false]),
      ]}
    >
      {children}
    </Box>
  );
});

PortletFooter.displayName = 'PortletFooter';
