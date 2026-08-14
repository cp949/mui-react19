import { describe, expect, test } from 'vitest';
import { useLatest } from '../../src/hooks/useLatest.js';
import { renderHook } from './internal/render-hook.js';

describe('useLatest', () => {
  test('최초 렌더링 시 초기값을 즉시 보유한다', () => {
    const hook = renderHook(({ value }: { value: number }) => useLatest(value), { value: 1 });

    expect(hook.result.current.current).toBe(1);
    hook.unmount();
  });

  test('값이 바뀌면 재렌더링 후 ref.current가 최신 값을 반영한다', () => {
    const hook = renderHook(({ value }: { value: number }) => useLatest(value), { value: 1 });

    hook.rerender({ value: 2 });

    expect(hook.result.current.current).toBe(2);
    hook.unmount();
  });

  test('반환하는 ref 객체의 참조는 재렌더링에도 동일하게 유지된다', () => {
    const hook = renderHook(({ value }: { value: number }) => useLatest(value), { value: 1 });
    const firstRef = hook.result.current;

    hook.rerender({ value: 2 });

    expect(hook.result.current).toBe(firstRef);
    hook.unmount();
  });
});
