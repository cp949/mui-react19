import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CopyButtonWrapper, type CopyButtonWrapperProps } from './CopyButtonWrapper.js';

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

describe('CopyButtonWrapper', () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    vi.restoreAllMocks();
    vi.useRealTimers();
    // 실행 순서에 의존하지 않도록 인스턴스와 prototype의 clipboard를 모두 원래대로 돌린다
    Reflect.deleteProperty(navigator, 'clipboard');
    if (originalInstanceDescriptor) {
      Object.defineProperty(navigator, 'clipboard', originalInstanceDescriptor);
    }
    if (originalProtoDescriptor) {
      Object.defineProperty(navigatorProto, 'clipboard', originalProtoDescriptor);
    }
  });

  // 상태를 data 속성으로 노출하는 버튼 하나를 렌더링한다
  const mount = async (props: Omit<CopyButtonWrapperProps, 'children'>) => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root.render(
        <CopyButtonWrapper {...props}>
          {({ copy, copied, failed }) => (
            <button
              type='button'
              data-copied={String(copied)}
              data-failed={String(failed)}
              onClick={copy}
            >
              copy
            </button>
          )}
        </CopyButtonWrapper>,
      );
    });
  };

  const click = async () => {
    await act(async () => {
      container.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  };

  const state = () => {
    const button = container.querySelector('button');
    return {
      copied: button?.getAttribute('data-copied'),
      failed: button?.getAttribute('data-failed'),
    };
  };

  it('클립보드 복사가 성공하면 onCopySuccess를 호출한다', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const onCopySuccess = vi.fn();
    installClipboard(writeText);

    await mount({ value: 'copied text', onCopySuccess });
    await click();

    expect(writeText).toHaveBeenCalledWith('copied text');
    expect(onCopySuccess).toHaveBeenCalledTimes(1);
    expect(onCopySuccess).toHaveBeenCalledWith('copied text');
    expect(state()).toEqual({ copied: 'true', failed: 'false' });
  });

  it('writeText가 거부되면 onCopyFailed를 오류와 값으로 호출하고 failed가 켜진다', async () => {
    const error = new Error('거부됨');
    installClipboard(vi.fn().mockRejectedValue(error));
    const onCopySuccess = vi.fn();
    const onCopyFailed = vi.fn();

    await mount({ value: 'copied text', onCopySuccess, onCopyFailed });
    await click();

    expect(onCopyFailed).toHaveBeenCalledTimes(1);
    expect(onCopyFailed).toHaveBeenCalledWith(error, 'copied text');
    expect(onCopySuccess).not.toHaveBeenCalled();
    expect(state()).toEqual({ copied: 'false', failed: 'true' });
  });

  it('navigator.clipboard를 쓸 수 없으면 onCopyFailed를 호출한다', async () => {
    // 'clipboard' in navigator 검사가 false가 되도록 인스턴스와 prototype의 속성을 제거한다
    Reflect.deleteProperty(navigator, 'clipboard');
    Reflect.deleteProperty(navigatorProto, 'clipboard');
    const onCopyFailed = vi.fn();

    await mount({ value: 'copied text', onCopyFailed });
    await click();

    expect(onCopyFailed).toHaveBeenCalledTimes(1);
    expect(onCopyFailed.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect(onCopyFailed.mock.calls[0]?.[1]).toBe('copied text');
    expect(state().failed).toBe('true');
  });

  it('value 함수가 예외를 던지면 복사를 시도하지 않고 failed를 켜며 onCopyFailed를 undefined 값으로 호출한다', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    installClipboard(writeText);
    const error = new Error('값 계산 실패');
    const onCopyFailed = vi.fn();

    await mount({
      value: () => {
        throw error;
      },
      onCopyFailed,
    });
    await click();

    expect(onCopyFailed).toHaveBeenCalledTimes(1);
    expect(onCopyFailed).toHaveBeenCalledWith(error, undefined);
    expect(writeText).not.toHaveBeenCalled();
    expect(state()).toEqual({ copied: 'false', failed: 'true' });
  });

  it('value가 비어 있으면 실패로 보지 않고 아무 일도 하지 않는다', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    installClipboard(writeText);
    const onCopyFailed = vi.fn();
    const onCopySuccess = vi.fn();

    for (const empty of ['', null, undefined]) {
      await mount({ value: empty, onCopyFailed, onCopySuccess });
      await click();
      act(() => {
        root.unmount();
      });
      container.remove();
    }

    expect(writeText).not.toHaveBeenCalled();
    expect(onCopyFailed).not.toHaveBeenCalled();
    expect(onCopySuccess).not.toHaveBeenCalled();
  });

  it('성공 뒤 실패하면 copied가 즉시 꺼지고 copied와 failed는 동시에 켜지지 않는다', async () => {
    installClipboard(
      vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('실패')),
    );

    await mount({ value: 'text', timeout: 10_000 });
    await click();
    expect(state()).toEqual({ copied: 'true', failed: 'false' });

    await click();
    expect(state()).toEqual({ copied: 'false', failed: 'true' });
  });

  it('copied와 failed는 timeout 뒤에 꺼진다', async () => {
    vi.useFakeTimers();
    installClipboard(
      vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('실패')),
    );

    await mount({ value: 'text', timeout: 300 });

    await click();
    expect(state()).toEqual({ copied: 'true', failed: 'false' });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(state()).toEqual({ copied: 'false', failed: 'false' });

    await click();
    expect(state()).toEqual({ copied: 'false', failed: 'true' });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(state()).toEqual({ copied: 'false', failed: 'false' });
  });

  it('연속 시도에서 콜백은 시도마다 자기 value로 호출되고 상태는 마지막 시도가 정한다', async () => {
    const first = deferred();
    const second = deferred();
    installClipboard(
      vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise),
    );
    const onCopySuccess = vi.fn();
    const onCopyFailed = vi.fn();
    let current = 'A';

    await mount({ value: () => current, timeout: 10_000, onCopySuccess, onCopyFailed });

    await click();
    current = 'B';
    await click();

    // 나중 시도가 먼저 성공한 뒤 먼저 시작한 시도가 실패한다
    await act(async () => {
      second.resolve();
      await second.promise;
    });
    const lateFailure = new Error('A 실패');
    await act(async () => {
      first.reject(lateFailure);
      await first.promise.catch(() => undefined);
    });

    expect(onCopySuccess).toHaveBeenCalledTimes(1);
    expect(onCopySuccess).toHaveBeenCalledWith('B');
    expect(onCopyFailed).toHaveBeenCalledTimes(1);
    expect(onCopyFailed).toHaveBeenCalledWith(lateFailure, 'A');
    expect(state()).toEqual({ copied: 'true', failed: 'false' });
  });
});
