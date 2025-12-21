'use client';

import type { ReactNode } from 'react';
import { useClipboard } from '../hooks/useClipboard.js';

export interface CopyButtonWrapperProps {
  /**
   * 자식 컴포넌트 렌더링을 위한 콜백 함수입니다.
   * 현재 복사 상태(`copied`)와 복사 함수(`copy`)를 인자로 제공합니다.
   *
   * @param payload - 현재 상태 및 복사 함수
   * @param payload.copied - 복사 성공 여부를 나타내는 상태
   * @param payload.copy - 값을 클립보드에 복사하는 함수
   *
   * @example
   * ```tsx
   * <CopyButtonWrapper value="복사할 텍스트">
   *   {({ copy, copied }) => (
   *     <button onClick={copy}>
   *       {copied ? "복사 완료!" : "복사하기"}
   *     </button>
   *   )}
   * </CopyButtonWrapper>
   * ```
   */
  children: (payload: { copied: boolean; copy: () => void }) => ReactNode;

  /**
   * 버튼 클릭 시 클립보드에 복사될 값입니다.
   * 문자열 또는 문자열을 반환하는 함수 형태를 지원합니다.
   *
   * @example
   * ```tsx
   * <CopyButtonWrapper value="복사할 텍스트">
   *   ...
   * </CopyButtonWrapper>
   *
   * <CopyButtonWrapper value={() => dynamicValue()}>
   *   ...
   * </CopyButtonWrapper>
   * ```
   */
  value: string | null | undefined | (() => string | null | undefined);

  /**
   * 복사 성공 상태가 유지되는 시간(밀리초)입니다. 기본값은 `1000`ms입니다.
   *
   * @default 1000
   */
  timeout?: number;
}

/**
 * 클립보드 복사 버튼을 쉽게 구현하기 위한 래퍼 컴포넌트입니다.
 *
 * @param props - `CopyButtonWrapper`의 속성
 * @returns 자식 콜백 함수로 전달된 UI 요소를 렌더링합니다.
 *
 * @example
 * ```tsx
 * <CopyButtonWrapper value="복사할 텍스트" timeout={2000}>
 *   {({ copy, copied }) => (
 *     <button onClick={copy}>
 *       {copied ? "복사되었습니다!" : "복사"}
 *     </button>
 *   )}
 * </CopyButtonWrapper>
 * ```
 */
export function CopyButtonWrapper(props: CopyButtonWrapperProps) {
  const { children, value, timeout = 1000 } = props;
  const clipboard = useClipboard({ timeout });

  // 클립보드에 값을 복사합니다. `value`가 함수인 경우 값을 동적으로 평가합니다.
  const copy = () => {
    const v = typeof value === 'function' ? value() : value;
    if (typeof v === 'string' && v.length > 0) {
      clipboard.copy(v);
    }
  };

  return <>{children({ copy, copied: clipboard.copied })}</>;
}
