'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { deepEq } from '../misc/deepEq.js';
import { useDeepCompareEffect } from './useDeepCompareEffect.js';
import { useLatest } from './useLatest.js';

// 부모가 반영해 주기를 기다리는 발행값을 최대 몇 개까지 기억할지 정한다.
const MAX_PENDING_PUBLISHED = 10;

export interface UseDebouncedParamsOptions {
  /** 마지막 입력 후 발행까지 기다릴 시간(ms). 기본값: 200 */
  delayMs?: number;
}

export interface UseDebouncedParamsResult<T> {
  /** 화면에 보여줄 초안 검색 조건. 입력 즉시 갱신된다. */
  params: Partial<T>;

  /** 초안에 부분 변경을 병합하고 발행을 예약한다. */
  onChange: (updated: Partial<T>) => void;

  /** 대기 중인 입력이 있으면 기다리지 않고 바로 발행한다. 없으면 아무 일도 하지 않는다. */
  flush: () => void;
}

/**
 * 검색 조건 입력을 초안으로 보관하고, 입력이 멈추면 한 번만 외부로 발행하는 훅.
 *
 * 외부 조건(`params`)이 바뀌면 초안을 외부 값으로 맞춘다. 단, 이 훅이 발행한 값이
 * 부모를 거쳐 돌아온 경우(에코)는 초안을 되돌리지 않는다. 부모의 갱신이 비동기여도
 * 그 사이에 입력한 내용이 사라지지 않는다.
 *
 * @param params - 외부 검색 조건. 깊은 비교로 변경 여부를 판단한다.
 * @param onChange - 디바운스가 끝난 시점에 초안 전체를 전달받는 콜백. 항상 최신 콜백이 호출된다.
 * @param options - `delayMs`: 발행 지연 시간(ms)
 * @returns `params`(초안), `onChange`(입력 핸들러), `flush`(즉시 발행)
 *
 * @remarks
 * - 외부 값이 발행값과 다르게 돌아오면(부모가 값을 보정한 경우 등) 외부 값이 우선하고, 대기 중인 입력은 버린다.
 * - 대기 중에 언마운트하면 입력을 발행하지 않고 버린다.
 *
 * @example
 * ```tsx
 * const { params: draft, onChange, flush } = useDebouncedParams(searchParams, setSearchParams);
 *
 * <TextField
 *   value={draft.keyword ?? ''}
 *   onChange={(e) => onChange({ keyword: e.target.value })}
 *   onKeyDown={(e) => e.key === 'Enter' && flush()}
 * />
 * ```
 */
export function useDebouncedParams<T>(
  params: Partial<T>,
  onChange: (params: Partial<T>) => void,
  options: UseDebouncedParamsOptions = {},
): UseDebouncedParamsResult<T> {
  const { delayMs = 200 } = options;

  const [draft, setDraft] = useState<Partial<T>>(params);

  // flush와 타이머 콜백이 항상 최신 초안을 읽도록 state와 같은 값을 ref에도 둔다.
  const draftRef = useRef<Partial<T>>(params);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 발행했지만 아직 부모의 params로 돌아오지 않은 값들. 오래된 순서로 쌓인다.
  const pendingPublishedRef = useRef<Partial<T>[]>([]);

  const onChangeRef = useLatest(onChange);
  const delayMsRef = useLatest(delayMs);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const publish = useCallback(() => {
    clearTimer();

    const next = { ...draftRef.current };
    const pending = pendingPublishedRef.current;
    pending.push(next);
    if (pending.length > MAX_PENDING_PUBLISHED) {
      pending.shift();
    }

    onChangeRef.current(next);
  }, [clearTimer, onChangeRef]);

  // 외부 조건이 바뀌면 초안을 맞춘다. 내가 발행한 값의 에코는 초안을 건드리지 않는다.
  useDeepCompareEffect(() => {
    const pending = pendingPublishedRef.current;
    const echoIndex = pending.findIndex((published) => deepEq(published, params));

    if (echoIndex >= 0) {
      // 에코가 도착했으므로 그 값까지의 발행 기록을 정리한다. 더 최근 입력은 그대로 둔다.
      pending.splice(0, echoIndex + 1);
      return;
    }

    pending.length = 0;
    clearTimer();
    draftRef.current = params;
    setDraft(params);
  }, [params]);

  useEffect(() => clearTimer, [clearTimer]);

  const handleChange = useCallback(
    (updated: Partial<T>) => {
      const next = { ...draftRef.current, ...updated };
      draftRef.current = next;
      setDraft(next);

      clearTimer();
      timerRef.current = setTimeout(publish, delayMsRef.current);
    },
    [clearTimer, publish, delayMsRef],
  );

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      publish();
    }
  }, [publish]);

  return { params: draft, onChange: handleChange, flush };
}
