'use client';

import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { formatYmd } from '../util/ymd-date.js';

/**
 * 숫자 날짜 문자열을 포매팅해 출력하는 타이포그래피 컴포넌트 속성입니다.
 */
export interface YmdTypographyProps extends Omit<TypographyProps, 'children'> {
  /** YYYYMMDD 또는 YYMMDD 형식의 날짜 문자열 또는 숫자입니다. */
  value: number | string | null | undefined;

  /** 출력 포맷입니다. 예: `YYYY-MM-DD`, `YY/MM/DD` */
  format?: string;

  /** 값이 없거나 포매팅에 실패했을 때 대신 표시할 문자열입니다. */
  fallback?: string;

  /**
   * 가공하지 않고 표시, 기본값: false
   */
  raw?: boolean;
}

/**
 * YMD 날짜 문자열을 지정한 형식으로 변환해 표시합니다.
 */
export function YmdTypography(props: YmdTypographyProps) {
  const { className, value, format, fallback = '-', raw = false, ...typographyProps } = props;
  const formatted = raw ? value : formatYmd(value, format ? { format } : undefined);
  const display = formatted || fallback;

  return (
    <Typography className={clsx('YmdTypography-root', className)} {...typographyProps}>
      {display}
    </Typography>
  );
}
