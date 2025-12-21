'use client';

import type { BoxProps } from '@mui/material';
import { Box } from '@mui/material';
import clsx from 'clsx';
import { forwardRef, useRef } from 'react';
import { useComposedRefs } from '../../hooks/useComposedRefs.js';
import { useFloatingIndicator } from './useFloatingIndicator.js';

/**
 * FloatingIndicator 컴포넌트의 속성 타입입니다.
 */
export interface FloatingIndicatorProps extends BoxProps {
  /** 인디케이터가 표시될 대상 요소 */
  target: HTMLElement | null | undefined;

  /** 인디케이터의 위치를 기준으로 계산할 부모 요소 */
  parent: HTMLElement | null | undefined;

  /** 전환 시간(ms), 기본값은 150ms */
  transitionDuration?: number | string;

  /** 인디케이터가 전환이 끝난 후에 표시되는지 여부 (transform: scale(n) 스타일이 적용된 컨테이너 내부에서 사용 시 설정해야 함) */
  displayAfterTransitionEnd?: boolean;

  /**
   * 대상 요소의 보더 두께를 제외하여 인디케이터 크기를 계산할지 여부
   * 기본적으로는 대상 요소의 보더를 포함한 크기로 계산됩니다.
   */
  excludeTargetBorderWidth?: boolean;
}

/**
 * 주어진 `target`과 `parent` 요소를 기준으로 인디케이터를 화면에 표시하는 컴포넌트입니다.
 * 인디케이터는 부모 요소를 기준으로 `absolute` 위치로 배치되며, 다양한 전환 효과를 지원합니다.
 */
export const FloatingIndicator = forwardRef<HTMLElement, FloatingIndicatorProps>((props, ref) => {
  const {
    target,
    parent,
    transitionDuration = 150,
    excludeTargetBorderWidth = false,
    displayAfterTransitionEnd,
    sx,
    className,
    ...restProps
  } = props;

  // 인디케이터 요소의 참조
  const innerRef = useRef<HTMLDivElement>(null!);

  // 커스텀 훅을 통해 인디케이터의 초기화 및 표시 여부를 관리
  const { initialized, hidden } = useFloatingIndicator({
    target,
    parent,
    indicatorRef: innerRef,
    excludeTargetBorderWidth,
    displayAfterTransitionEnd,
  });

  // forwarded ref와 내부 ref 결합
  const mergedRef = useComposedRefs(ref, innerRef);

  // 대상 요소와 부모 요소가 없으면 렌더링하지 않음
  if (!target || !parent) {
    return null;
  }

  return (
    <Box
      className={clsx('FloatingIndicator-root', className)}
      ref={mergedRef} // mergedRef를 사용하여 ref 전달
      sx={[
        {
          position: 'absolute', // 절대 위치 지정
          top: 0,
          left: 0,
          transition: `transform ${transitionDuration}ms`, // 전환 효과 적용
          opacity: initialized ? 1 : 0, // 초기화 여부에 따른 opacity
          ...(hidden ? { display: 'none' } : undefined), // 숨겨진 경우 display: none 설정
        },
        ...(Array.isArray(sx) ? sx : [sx ?? false]),
      ]}
      {...restProps} // 나머지 속성들
    />
  );
});

FloatingIndicator.displayName = 'FloatingIndicator';
