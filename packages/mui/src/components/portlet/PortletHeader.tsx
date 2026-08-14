import { Box, type BoxProps } from '@mui/material';
import { clsx } from 'clsx';

export interface PortletHeaderProps extends BoxProps {
  noDivider?: boolean;
  noPadding?: boolean;
}

/**
 * Portlet의 Label과 Toolbar를 배치하는 상단 영역을 렌더링합니다.
 *
 * @param props Box 속성과 여백·구분선 설정
 * @returns 상단 레이아웃이 적용된 Box
 * @example
 * ```tsx
 * <Portlet.Header>
 *   <Portlet.Label title='제목' />
 *   <Portlet.Toolbar>도구</Portlet.Toolbar>
 * </Portlet.Header>
 * ```
 */
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
