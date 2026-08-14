import { act } from 'react';
import { describe, expect, test } from 'vitest';
import { useCallbackRef } from '../../src/hooks/useCallbackRef.js';
import { renderHook } from './internal/render-hook.js';

describe('useCallbackRef', () => {
  test('반환하는 함수의 참조는 콜백이 바뀌어도 동일하게 유지된다', () => {
    const hook = renderHook(({ callback }: { callback: () => void }) => useCallbackRef(callback), {
      callback: () => {},
    });
    const firstFn = hook.result.current;

    hook.rerender({ callback: () => {} });

    expect(hook.result.current).toBe(firstFn);
    hook.unmount();
  });

  test('호출 시 항상 최신 콜백을 실행한다', () => {
    const calls: string[] = [];
    const hook = renderHook(
      ({ label }: { label: string }) => useCallbackRef(() => calls.push(label)),
      { label: 'first' },
    );

    hook.rerender({ label: 'second' });

    act(() => {
      hook.result.current();
    });

    expect(calls).toEqual(['second']);
    hook.unmount();
  });

  test('콜백이 undefined면 호출해도 에러 없이 무시한다', () => {
    const hook = renderHook(
      ({ callback }: { callback: (() => void) | undefined }) => useCallbackRef(callback),
      { callback: undefined },
    );

    expect(() => {
      act(() => {
        hook.result.current();
      });
    }).not.toThrow();

    hook.unmount();
  });
});
