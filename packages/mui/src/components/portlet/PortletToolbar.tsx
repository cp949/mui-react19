import { Box, type BoxProps } from '@mui/material';

export type PortletToolbarProps = BoxProps;

export const PortletToolbar = (props: PortletToolbarProps) => {
  const { className, sx, children, ref, ...restProps } = props;
  return (
    <Box
      {...restProps}
      ref={ref}
      className={className ? `PortletToolbar-root ${className}` : 'PortletToolbar-root'}
      sx={[
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        },
        ...(Array.isArray(sx) ? sx : [sx ?? false]),
      ]}
    >
      {children}
    </Box>
  );
};

PortletToolbar.displayName = 'PortletToolbar';
