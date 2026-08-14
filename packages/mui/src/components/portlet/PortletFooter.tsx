import { Box, type BoxProps } from '@mui/material';
import { clsx } from 'clsx';

export interface PortletFooterProps extends BoxProps {
  noDivider?: boolean;
}

/**
 * Portlet의 하단 영역을 렌더링합니다.
 *
 * @param props Box 속성과 구분선 설정
 * @returns 하단 레이아웃이 적용된 Box
 * @example
 * ```tsx
 * <Portlet.Footer noDivider>하단 내용</Portlet.Footer>
 * ```
 */
export const PortletFooter = (props: PortletFooterProps) => {
  const { noDivider, sx, className, children, ref, ...rest } = props;
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
};

PortletFooter.displayName = 'PortletFooter';
