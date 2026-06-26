import { Box, type BoxProps } from '@mui/material';
import { clsx } from 'clsx';

export interface PortletContentProps extends BoxProps {
  noPadding?: boolean;
}

export const PortletContent = (props: PortletContentProps) => {
  const { noPadding = false, className, sx, children, ref, ...restProps } = props;
  return (
    <Box
      {...restProps}
      className={clsx('PortletContent-root', className, {
        'PortletContent-noPadding': noPadding,
      })}
      ref={ref}
      sx={[
        (theme) => ({
          flex: 1,
          p: theme.spacing(2, 3),
          '&.PortletContent-noPadding': {
            p: 0,
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx ?? false]),
      ]}
    >
      {children}
    </Box>
  );
};

PortletContent.displayName = 'PortletContent';
