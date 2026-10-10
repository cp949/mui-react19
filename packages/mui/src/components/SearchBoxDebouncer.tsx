'use client';

import type { ReactNode } from 'react';
import { useDebouncedParams } from '../hooks/useDebouncedParams.js';

/**
 * 검색 입력 초안과 외부 검색 조건을 중계하는 디바운서 컴포넌트의 속성입니다.
 */
export interface SearchBoxDebouncerProps<T> {
  /** 디바운스 시간(ms). 기본값: 200 */
  delayMs?: number;

  /** 외부 검색 조건입니다. */
  params: Partial<T>;

  /** 입력이 멈춘 뒤 초안 전체를 전달받는 콜백입니다. */
  onChange: (params: Partial<T>) => void;

  /**
   * 초안 상태로 검색 UI를 그립니다.
   *
   * - `params`: 화면에 보여줄 초안 조건
   * - `onChange`: 부분 변경을 초안에 병합하고 발행을 예약
   * - `flush`: 대기 중인 입력을 바로 발행 (예: Enter로 즉시 검색)
   */
  children: (props: {
    params: Partial<T>;
    onChange: (params: Partial<T>) => void;
    flush: () => void;
  }) => ReactNode;
}

/**
 * 검색 조건 변경을 일정 시간 모아서 외부 변경 콜백으로 전달합니다.
 *
 * 훅 `useDebouncedParams`를 render prop으로 감싼 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * <SearchBoxDebouncer<SearchParams> params={searchParams} onChange={setSearchParams}>
 *   {({ params, onChange, flush }) => (
 *     <TextField
 *       value={params.keyword ?? ''}
 *       onChange={(e) => onChange({ keyword: e.target.value })}
 *       onKeyDown={(e) => e.key === 'Enter' && flush()}
 *     />
 *   )}
 * </SearchBoxDebouncer>
 * ```
 */
export function SearchBoxDebouncer<T>(props: SearchBoxDebouncerProps<T>) {
  const { delayMs, params, onChange, children } = props;
  const debounced = useDebouncedParams<T>(params, onChange, { delayMs });

  return <>{children(debounced)}</>;
}
