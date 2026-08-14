import { act } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useCooldown } from '../../src/hooks/useCooldown.js';
import { renderHook } from './internal/render-hook.js';

describe('useCooldown', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('쿨다운 중이 아니면 콜백을 즉시 실행하고 isCooldown을 true로 전환한다', () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    const hook = renderHook(() => useCooldown(callback, 1000), undefined);

    act(() => {
      hook.result.current.trigger();
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(hook.result.current.isCooldown).toBe(true);
    hook.unmount();
  });

  test('쿨다운 중에는 트리거 호출을 무시한다', () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    const hook = renderHook(() => useCooldown(callback, 1000), undefined);

    act(() => {
      hook.result.current.trigger();
    });
    act(() => {
      hook.result.current.trigger();
    });

    expect(callback).toHaveBeenCalledTimes(1);
    hook.unmount();
  });

  test('쿨다운 시간이 지나면 isCooldown이 false로 복귀해 재실행을 허용한다', () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    const hook = renderHook(() => useCooldown(callback, 1000), undefined);

    act(() => {
      hook.result.current.trigger();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(hook.result.current.isCooldown).toBe(false);

    act(() => {
      hook.result.current.trigger();
    });

    expect(callback).toHaveBeenCalledTimes(2);
    hook.unmount();
  });

  test('콜백이 없으면 트리거를 호출해도 아무 일도 일어나지 않는다', () => {
    vi.useFakeTimers();

    const hook = renderHook(() => useCooldown(undefined, 1000), undefined);

    act(() => {
      hook.result.current.trigger();
    });

    expect(hook.result.current.isCooldown).toBe(false);
    hook.unmount();
  });

  test('언마운트 시 타이머를 정리한다', () => {
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(window, 'clearTimeout');
    const callback = vi.fn();

    const hook = renderHook(() => useCooldown(callback, 1000), undefined);

    act(() => {
      hook.result.current.trigger();
    });
    clearSpy.mockClear();

    hook.unmount();

    expect(clearSpy).toHaveBeenCalledTimes(1);
    clearSpy.mockRestore();
  });
});
