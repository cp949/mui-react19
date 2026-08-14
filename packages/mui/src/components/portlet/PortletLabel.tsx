import { Box, type BoxProps, Typography } from '@mui/material';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export interface PortletLabelProps extends BoxProps {
  icon?: ReactNode;
  /** 제목 Typography에 표시할 텍스트입니다. HTML `title` 속성으로 전달되지 않습니다. */
  title?: string;
  subtitle?: string;
}

/**
 * Portlet Header에 아이콘, 제목, 부제목을 표시합니다.
 *
 * @param props Box 속성과 표시할 아이콘·제목·부제목
 * @returns Label 레이아웃이 적용된 Box
 * @example
 * ```tsx
 * <Portlet.Label title='제목' subtitle='부제목' />
 * ```
 */
export const PortletLabel = (props: PortletLabelProps) => {
  const { icon, title, subtitle, className, sx, ref, ...rest } = props;
  return (
    <Box
      {...rest}
      className={clsx('PortletLabel-root', className)}
      ref={ref}
      sx={[
        {
          display: 'flex',
          alignItems: 'center',
        },
        ...(Array.isArray(sx) ? sx : [sx ?? false]),
      ]}
    >
      {icon && (
        <Box
          component='span'
          sx={{
            fontSize: '1.2rem',
            mr: 1,
            color: 'text.secondary',
            alignItems: 'center',
            display: 'flex',
          }}
        >
          {icon}
        </Box>
      )}
      {title && (
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: '1.1rem',
          }}
          variant='h6'
        >
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography
          variant='subtitle2'
          sx={{
            fontWeight: 400,
            ml: 1,
            color: 'text.secondary',
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

PortletLabel.displayName = 'PortletLabel';
