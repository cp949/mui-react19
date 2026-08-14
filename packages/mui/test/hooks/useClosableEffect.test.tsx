import { describe, expect, test, vi } from 'vitest';
import { useClosableEffect } from '../../src/hooks/useClosableEffect.js';
import { renderHook } from './internal/render-hook.js';

describe('useClosableEffect', () => {
  test('deps가 변경되지 않으면 재실행되지 않고, 변경되면 최신 callback으로 재실행됨', () => {
    const calls: string[] = [];

    const hook = renderHook(
      ({ label, dep }: { label: string; dep: number }) =>
        useClosableEffect(() => {
          calls.push(label);
        }, [dep]),
      { label: 'first', dep: 1 },
    );

    expect(calls).toEqual(['first']);

    hook.rerender({ label: 'second', dep: 1 });
    expect(calls).toEqual(['first']);

    hook.rerender({ label: 'third', dep: 2 });
    expect(calls).toEqual(['first', 'third']);

    hook.unmount();
  });

  test('cleanup 시 dispose 함수와 closables.close()가 모두 호출됨', () => {
    const dispose = vi.fn();
    const closeSpy = vi.fn();

    const hook = renderHook(
      () =>
        useClosableEffect((closables) => {
          closables.add(closeSpy);
          return dispose;
        }, []),
      {},
    );

    hook.unmount();

    expect(dispose).toHaveBeenCalledTimes(1);
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  test('dispose를 반환하지 않아도 closables.close()는 호출됨', () => {
    const closeSpy = vi.fn();

    const hook = renderHook(
      () =>
        useClosableEffect((closables) => {
          closables.add(closeSpy);
        }, []),
      {},
    );

    hook.unmount();

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });
});
