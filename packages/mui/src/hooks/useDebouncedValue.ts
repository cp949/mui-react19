import { useEffect, useMemo, useState } from 'react';
import { debounce } from '../misc/debounce.js';
import { useDidUpdate } from './useDidUpdate.js';
import { useLatest } from './useLatest.js';

/**
 * 값의 변화를 지연시키는 커스텀 훅
 *
 * @template T - 값의 타입. 기본값은 `any`.
 * @param value - 지연 처리할 값.
 * @param wait - 지연 시간(밀리초 단위).
 * @param options - 지연 처리 동작 방식을 설정하는 옵션.
 * - `leading`: 첫 번째 업데이트를 즉시 처리할지 여부 (기본값: `false`).
 *
 * @returns 지연 처리된 값과 타이머를 취소하는 함수.
 */
export function useDebouncedValue<T>(
  /** 지연 처리할 값 */
  value: T,

  /** 지연 시간(밀리초 단위) */
  wait: number,

  /** 옵션: 첫 업데이트 즉시 처리 여부 */
  options = { leading: false },
) {
  // 지연 처리된 값을 저장하는 상태
  const [debouncedValue, setDebouncedValue] = useState(value);

  // 타이머가 실제로 실행될 때 항상 최신 value를 반영하도록 ref로 감싼다.
  const valueRef = useLatest(value);

  const leading = options.leading ?? false;

  // wait/leading이 바뀔 때만 디바운스 인스턴스를 새로 만든다.
  // biome-ignore lint/correctness/useExhaustiveDependencies: 기존 훅의 의도된 의존성 및 실행 시점 계약을 유지합니다.
  const debounced = useMemo(
    () =>
      debounce(
        () => {
          setDebouncedValue(valueRef.current);
        },
        wait,
        { leading },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wait, leading],
  );

  // value가 바뀔 때마다 디바운스된 갱신을 예약한다.
  useDidUpdate(() => {
    debounced();
  }, [value, debounced]);

  // 인스턴스가 교체되거나 컴포넌트가 언마운트될 때 예약된 타이머를 정리한다.
  useEffect(() => debounced.cancel, [debounced]);

  return useMemo(
    () => [debouncedValue, debounced.cancel] as const,
    [debouncedValue, debounced.cancel],
  );
}
