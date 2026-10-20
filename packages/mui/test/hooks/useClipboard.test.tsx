import { act } from 'react';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { useClipboard } from '../../src/hooks/useClipboard.js';
import { renderHook } from './internal/render-hook.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

// 테스트가 navigator.clipboard를 바꾸므로 인스턴스와 prototype의 원래 상태를 기억해 복원한다
const navigatorProto = Object.getPrototypeOf(navigator) as object;
const originalInstanceDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
const originalProtoDescriptor = Object.getOwnPropertyDescriptor(navigatorProto, 'clipboard');

const installClipboard = (writeText: (value: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
};

// 'clipboard' in navigator 검사가 false가 되게 한다
const removeClipboard = () => {
  Reflect.deleteProperty(navigator, 'clipboard');
  Reflect.deleteProperty(navigatorProto, 'clipboard');
};

// 테스트가 끝나는 시점을 직접 정하는 Promise
const deferred = () => {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('useClipboard', () => {
  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(navigator, 'clipboard');
    if (originalInstanceDescriptor) {
      Object.defineProperty(navigator, 'clipboard', originalInstanceDescriptor);
    }
    if (originalProtoDescriptor) {
      Object.defineProperty(navigatorProto, 'clipboard', originalProtoDescriptor);
    }
  });

  test('복사에 성공하면 copied가 켜지고 timeout 뒤에 꺼진다', async () => {
    vi.useFakeTimers();
    installClipboard(vi.fn().mockResolvedValue(undefined));
    const hook = renderHook(() => useClipboard({ timeout: 500 }), undefined);

    let result: boolean | undefined;
    await act(async () => {
      result = await hook.result.current.copy('hello');
    });

    expect(result).toBe(true);
    expect(hook.result.current.copied).toBe(true);
    expect(hook.result.current.failed).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(hook.result.current.copied).toBe(false);
    hook.unmount();
  });

  test('writeText가 거부되면 onError를 오류와 복사하려던 값으로 호출한다', async () => {
    const failure = new Error('거부됨');
    installClipboard(vi.fn().mockRejectedValue(failure));
    const onError = vi.fn();
    const hook = renderHook(() => useClipboard({ onError }), undefined);

    let result: boolean | undefined;
    await act(async () => {
      result = await hook.result.current.copy('hello');
    });

    expect(result).toBe(false);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(failure, 'hello');
    expect(hook.result.current.failed).toBe(true);
    expect(hook.result.current.error).toBe(failure);
    hook.unmount();
  });

  test('writeText가 동기로 던져도 실패로 처리한다', async () => {
    const failure = new Error('동기 오류');
    installClipboard(() => {
      throw failure;
    });
    const onError = vi.fn();
    const hook = renderHook(() => useClipboard({ onError }), undefined);

    await act(async () => {
      await hook.result.current.copy('hello');
    });

    expect(onError).toHaveBeenCalledWith(failure, 'hello');
    expect(hook.result.current.failed).toBe(true);
    hook.unmount();
  });

  test('Error가 아닌 값이 던져지면 Error로 감싸서 전달한다', async () => {
    installClipboard(vi.fn().mockRejectedValue('문자열 오류'));
    const onError = vi.fn();
    const hook = renderHook(() => useClipboard({ onError }), undefined);

    await act(async () => {
      await hook.result.current.copy('hello');
    });

    const [error, value] = onError.mock.calls[0] ?? [];
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('문자열 오류');
    expect(value).toBe('hello');
    hook.unmount();
  });

  test('navigator.clipboard가 없는 환경에서도 onError를 호출한다', async () => {
    removeClipboard();
    const onError = vi.fn();
    const hook = renderHook(() => useClipboard({ onError }), undefined);

    await act(async () => {
      await hook.result.current.copy('hello');
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0]?.[1]).toBe('hello');
    expect(hook.result.current.failed).toBe(true);
    hook.unmount();
  });

  test('실패 뒤 성공하면 error가 비워진다', async () => {
    installClipboard(vi.fn().mockRejectedValueOnce(new Error('실패')).mockResolvedValue(undefined));
    const hook = renderHook(() => useClipboard(), undefined);

    await act(async () => {
      await hook.result.current.copy('hello');
    });
    expect(hook.result.current.error).not.toBeNull();

    await act(async () => {
      await hook.result.current.copy('hello');
    });

    expect(hook.result.current.error).toBeNull();
    expect(hook.result.current.failed).toBe(false);
    expect(hook.result.current.copied).toBe(true);
    hook.unmount();
  });

  test('새 시도가 시작되면 copied가 즉시 꺼지고, 실패하면 copied 없이 failed만 켜진다', async () => {
    installClipboard(
      vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('실패')),
    );
    const hook = renderHook(() => useClipboard({ timeout: 10_000 }), undefined);

    await act(async () => {
      await hook.result.current.copy('first');
    });
    expect(hook.result.current.copied).toBe(true);

    await act(async () => {
      await hook.result.current.copy('second');
    });

    expect(hook.result.current.copied).toBe(false);
    expect(hook.result.current.failed).toBe(true);
    hook.unmount();
  });

  test('실패 상태는 timeout 뒤에 꺼지고 error는 다음 시도까지 남는다', async () => {
    vi.useFakeTimers();
    installClipboard(vi.fn().mockRejectedValue(new Error('실패')));
    const hook = renderHook(() => useClipboard({ timeout: 300 }), undefined);

    await act(async () => {
      await hook.result.current.copy('hello');
    });
    expect(hook.result.current.failed).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(hook.result.current.failed).toBe(false);
    expect(hook.result.current.error).not.toBeNull();
    hook.unmount();
  });

  test('늦게 끝난 이전 시도의 실패가 최신 시도의 성공 상태를 덮어쓰지 않는다', async () => {
    const first = deferred();
    const second = deferred();
    installClipboard(
      vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise),
    );
    const onError = vi.fn();
    const hook = renderHook(() => useClipboard({ timeout: 10_000, onError }), undefined);

    let firstResult: Promise<boolean> | undefined;
    let secondResult: Promise<boolean> | undefined;
    act(() => {
      firstResult = hook.result.current.copy('A');
    });
    act(() => {
      secondResult = hook.result.current.copy('B');
    });

    await act(async () => {
      second.resolve();
      await secondResult;
    });
    expect(hook.result.current.copied).toBe(true);

    const lateFailure = new Error('늦은 실패');
    await act(async () => {
      first.reject(lateFailure);
      await firstResult;
    });

    expect(await firstResult).toBe(false);
    expect(hook.result.current.copied).toBe(true);
    expect(hook.result.current.failed).toBe(false);
    expect(hook.result.current.error).toBeNull();
    // 상태는 덮어쓰지 않아도 콜백은 시도마다 자기 값으로 호출된다
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(lateFailure, 'A');
    hook.unmount();
  });

  test('늦게 끝난 이전 시도의 성공이 최신 시도의 실패 상태를 덮어쓰지 않는다', async () => {
    const first = deferred();
    const second = deferred();
    installClipboard(
      vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise),
    );
    const hook = renderHook(() => useClipboard({ timeout: 10_000 }), undefined);

    let firstResult: Promise<boolean> | undefined;
    let secondResult: Promise<boolean> | undefined;
    act(() => {
      firstResult = hook.result.current.copy('A');
    });
    act(() => {
      secondResult = hook.result.current.copy('B');
    });

    await act(async () => {
      second.reject(new Error('B 실패'));
      await secondResult;
    });
    expect(hook.result.current.failed).toBe(true);

    await act(async () => {
      first.resolve();
      await firstResult;
    });

    expect(await firstResult).toBe(true);
    expect(hook.result.current.copied).toBe(false);
    expect(hook.result.current.failed).toBe(true);
    hook.unmount();
  });

  test('fail은 클립보드를 거치지 않고 실패 상태를 기록하며 onError는 호출하지 않는다', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    installClipboard(writeText);
    const onError = vi.fn();
    const hook = renderHook(() => useClipboard({ onError }), undefined);
    const failure = new Error('값 계산 실패');

    act(() => {
      hook.result.current.fail(failure);
    });

    expect(hook.result.current.failed).toBe(true);
    expect(hook.result.current.copied).toBe(false);
    expect(hook.result.current.error).toBe(failure);
    expect(writeText).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    hook.unmount();
  });

  test('reset은 copied, failed, error를 모두 초기화한다', async () => {
    installClipboard(vi.fn().mockRejectedValue(new Error('실패')));
    const hook = renderHook(() => useClipboard(), undefined);

    await act(async () => {
      await hook.result.current.copy('hello');
    });
    act(() => {
      hook.result.current.reset();
    });

    expect(hook.result.current.copied).toBe(false);
    expect(hook.result.current.failed).toBe(false);
    expect(hook.result.current.error).toBeNull();
    hook.unmount();
  });

  test('언마운트하면 남은 타이머를 정리한다', async () => {
    vi.useFakeTimers();
    installClipboard(vi.fn().mockResolvedValue(undefined));
    const hook = renderHook(() => useClipboard({ timeout: 1000 }), undefined);

    await act(async () => {
      await hook.result.current.copy('hello');
    });
    expect(vi.getTimerCount()).toBe(1);

    hook.unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  test('언마운트 뒤에 끝난 시도는 타이머를 새로 만들지 않는다', async () => {
    vi.useFakeTimers();
    const pending = deferred();
    installClipboard(vi.fn().mockReturnValue(pending.promise));
    const hook = renderHook(() => useClipboard({ timeout: 1000 }), undefined);

    let result: Promise<boolean> | undefined;
    act(() => {
      result = hook.result.current.copy('hello');
    });
    hook.unmount();

    await act(async () => {
      pending.resolve();
      await result;
    });

    expect(vi.getTimerCount()).toBe(0);
  });
});
