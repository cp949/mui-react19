import { Box, type BoxProps } from '@mui/material';
import { clsx } from 'clsx';

export type PortletToolbarProps = BoxProps;

/**
 * Portlet Header의 도구를 우측에 배치합니다.
 *
 * @param props Box 속성과 Toolbar 자식 요소
 * @returns 우측 정렬된 Toolbar Box
 * @example
 * ```tsx
 * <Portlet.Toolbar>도구</Portlet.Toolbar>
 * ```
 */
export const PortletToolbar = (props: PortletToolbarProps) => {
  const { className, sx, children, ref, ...restProps } = props;
  return (
    <Box
      {...restProps}
      ref={ref}
      className={clsx('PortletToolbar-root', className)}
      sx={[
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          ml: 'auto',
        },
        ...(Array.isArray(sx) ? sx : [sx ?? false]),
      ]}
    >
      {children}
    </Box>
  );
};

PortletToolbar.displayName = 'PortletToolbar';
