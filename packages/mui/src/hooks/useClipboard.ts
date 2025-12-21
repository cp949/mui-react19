// copy from mantine
import { useState } from 'react';

/**
 * 클립보드 복사 기능을 제공하는 React 훅입니다.
 *
 * @param options - 옵션 객체입니다.
 * @param options.timeout - 복사 완료 상태가 유지되는 시간(밀리초)입니다. 기본값은 2000ms입니다.
 * @returns
 * - `copy`: 문자열을 클립보드에 복사하는 함수
 * - `reset`: 상태를 초기화하는 함수
 * - `error`: 클립보드 복사 중 발생한 오류
 * - `copied`: 복사 성공 여부
 *
 * @example
 * ```tsx
 * const { copy, reset, error, copied } = useClipboard({ timeout: 3000 });
 *
 * return (
 *   <div>
 *     <button onClick={() => copy('복사할 내용')}>복사</button>
 *     {copied && <span>복사되었습니다!</span>}
 *     {error && <span>복사 실패: {error.message}</span>}
 *     <button onClick={reset}>초기화</button>
 *   </div>
 * );
 * ```
 */
export function useClipboard({ timeout = 1000 } = {}) {
  const [error, setError] = useState<Error | null>(null); // 복사 과정에서 발생한 오류 상태
  const [copied, setCopied] = useState(false); // 복사가 성공했는지 여부
  const [copyTimeout, setCopyTimeout] = useState<number | null>(null); // 복사 완료 상태 유지 타이머 ID

  /**
   * 복사 결과를 처리하고 복사 상태를 업데이트합니다.
   *
   * @param value - 복사가 성공했는지 여부
   */
  const handleCopyResult = (value: boolean) => {
    if (copyTimeout !== null) {
      window.clearTimeout(copyTimeout); // 기존 타이머 초기화
    }
    setCopyTimeout(window.setTimeout(() => setCopied(false), timeout)); // 새로운 타이머 설정
    setCopied(value); // 복사 상태 업데이트
  };

  /**
   * 클립보드에 문자열을 복사합니다.
   *
   * @param valueToCopy - 복사할 문자열
   */
  const copy = (valueToCopy: string) => {
    if ('clipboard' in navigator) {
      // navigator.clipboard API를 사용하여 텍스트를 복사
      navigator.clipboard
        .writeText(valueToCopy)
        .then(() => handleCopyResult(true))
        .catch((err) => setError(err)); // 오류 발생 시 상태 업데이트
    } else {
      // 브라우저가 clipboard API를 지원하지 않을 경우 오류 처리
      setError(new Error('useClipboard: navigator.clipboard is not supported'));
    }
  };

  /**
   * 복사 상태와 오류를 초기화합니다.
   */
  const reset = () => {
    setCopied(false); // 복사 상태 초기화
    setError(null); // 오류 상태 초기화
    if (copyTimeout !== null) {
      window.clearTimeout(copyTimeout); // 기존 타이머 초기화
    }
  };

  // 훅에서 반환되는 값
  return { copy, reset, error, copied };
}
