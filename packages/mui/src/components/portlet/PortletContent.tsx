import { Box, type BoxProps } from '@mui/material';
import { clsx } from 'clsx';

export interface PortletContentProps extends BoxProps {
  noPadding?: boolean;
}

/**
 * Portlet의 본문 영역을 렌더링합니다.
 *
 * @param props Box 속성과 여백 설정
 * @returns 본문 레이아웃이 적용된 Box
 * @example
 * ```tsx
 * <Portlet.Content noPadding>내용</Portlet.Content>
 * ```
 */
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
