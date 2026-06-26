import { Box, type BoxProps } from '@mui/material';
import { clsx } from 'clsx';

export interface PortletHeaderProps extends BoxProps {
  noDivider?: boolean;
  noPadding?: boolean;
}

export const PortletHeader = (props: PortletHeaderProps) => {
  const { children, noDivider, className, noPadding = false, sx, ref, ...rest } = props;

  return (
    <Box
      {...rest}
      className={clsx('PortletHeader-root', className, {
        'PortletHeader-noPadding': noPadding,
        'PortletHeader-noDivider': noDivider,
      })}
      ref={ref}
      sx={[
        (theme) => ({
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E0E4EE',
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          height: 56,
          minHeight: 56,
          p: theme.spacing(0.5, 1, 0.5, 3),
          '&.PortletHeader-noPadding': {
            p: theme.spacing(0.5, 0, 0.5, 0),
          },
          '&.PortletHeader-noDivider': {
            borderBottom: 'none',
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx ?? false]),
      ]}
    >
      {children}
    </Box>
  );
};

PortletHeader.displayName = 'PortletHeader';
