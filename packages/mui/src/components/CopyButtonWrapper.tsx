'use client';

import type { ReactNode } from 'react';
import { useClipboard } from '../hooks/useClipboard.js';

export interface CopyButtonWrapperProps {
  /**
   * 자식 컴포넌트 렌더링을 위한 콜백 함수입니다.
   * 현재 복사 상태(`copied`, `failed`)와 복사 함수(`copy`)를 인자로 제공합니다.
   *
   * @param payload - 현재 상태 및 복사 함수
   * @param payload.copied - 가장 최근 복사 시도가 성공했는지 나타내는 상태
   * @param payload.failed - 가장 최근 복사 시도가 실패했는지 나타내는 상태. `copied`와 동시에 켜지지 않습니다.
   * @param payload.copy - 값을 클립보드에 복사하는 함수
   *
   * @example
   * ```tsx
   * <CopyButtonWrapper value="복사할 텍스트">
   *   {({ copy, copied, failed }) => (
   *     <button onClick={copy}>
   *       {failed ? "복사 실패" : copied ? "복사 완료!" : "복사하기"}
   *     </button>
   *   )}
   * </CopyButtonWrapper>
   * ```
   */
  children: (payload: { copied: boolean; failed: boolean; copy: () => void }) => ReactNode;

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
   * 복사 성공(`copied`), 실패(`failed`) 상태가 유지되는 시간(밀리초)입니다. 기본값은 `1000`ms입니다.
   *
   * @default 1000
   */
  timeout?: number;

  /**
   * 클립보드 복사가 성공했을 때 호출되는 콜백 함수입니다.
   *
   * @param value - 클립보드에 복사된 문자열
   */
  onCopySuccess?: (value: string) => void;

  /**
   * 클립보드 복사가 실패했을 때 호출되는 콜백 함수입니다.
   * `navigator.clipboard`를 쓸 수 없거나 `writeText`가 실패한 경우, `value` 함수가 예외를 던진 경우에 호출됩니다.
   * `value`가 비어 있어 복사를 건너뛴 경우는 실패로 보지 않으며 호출하지 않습니다.
   * 연속으로 복사하면 시도마다 자기 `value`로 호출됩니다.
   *
   * @param error - 실패 원인
   * @param value - 복사하려던 문자열. `value` 함수가 예외를 던진 경우에는 `undefined`입니다.
   *
   * @example
   * ```tsx
   * <CopyButtonWrapper value="복사할 텍스트" onCopyFailed={(error) => showToast(error.message)}>
   *   ...
   * </CopyButtonWrapper>
   * ```
   */
  onCopyFailed?: (error: Error, value: string | undefined) => void;
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
  const { children, onCopySuccess, onCopyFailed, value, timeout = 1000 } = props;
  const clipboard = useClipboard({ timeout, onError: onCopyFailed });

  // 클립보드에 값을 복사합니다. `value`가 함수인 경우 값을 동적으로 평가합니다.
  const copy = () => {
    let v: string | null | undefined;
    try {
      v = typeof value === 'function' ? value() : value;
    } catch (err) {
      // 복사할 값을 만들지 못한 경우도 실패 상태로 기록한다. 클립보드는 호출하지 않는다.
      const error = err instanceof Error ? err : new Error(String(err));
      clipboard.fail(error);
      onCopyFailed?.(error, undefined);
      return;
    }
    if (typeof v === 'string' && v.length > 0) {
      void clipboard.copy(v).then((copied) => {
        if (copied) {
          onCopySuccess?.(v);
        }
      });
    }
  };

  return <>{children({ copy, copied: clipboard.copied, failed: clipboard.failed })}</>;
}
