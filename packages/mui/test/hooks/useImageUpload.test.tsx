import { act } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useImageUpload } from '../../src/hooks/useImageUpload.js';
import { renderHook } from './internal/render-hook.js';

/** 비동기 업로드 완료 시점을 테스트에서 제어하기 위한 deferred promise를 생성한다. */
function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('useImageUpload', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('업로드 성공 시 handleFileUpload 결과가 callback으로 전달되고 loading이 토글됨', async () => {
    vi.useFakeTimers();
    const file = new Blob(['x']);
    const result = { id: '1', url: 'blob:1' };
    const handleFileUpload = vi.fn().mockResolvedValue(result);
    const callback = vi.fn();

    const hook = renderHook(
      ({ file }: { file: Blob | null }) => useImageUpload(file, handleFileUpload, callback),
      { file },
    );

    expect(hook.result.current).toBe(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(handleFileUpload).toHaveBeenCalledWith(file);
    expect(callback).toHaveBeenCalledWith(result);
    expect(hook.result.current).toBe(false);

    hook.unmount();
  });

  test('file이 null이면 handleFileUpload를 호출하지 않음', async () => {
    vi.useFakeTimers();
    const handleFileUpload = vi.fn();
    const callback = vi.fn();

    const hook = renderHook(
      ({ file }: { file: Blob | null }) => useImageUpload(file, handleFileUpload, callback),
      { file: null },
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(handleFileUpload).not.toHaveBeenCalled();
    hook.unmount();
  });

  test('디바운스 만료 시 최신 업로더를 사용하고 완료 결과를 최신 callback에 전달함', async () => {
    vi.useFakeTimers();
    const file = new Blob(['x']);
    const uploads: string[] = [];
    const calls: string[] = [];

    const hook = renderHook(
      ({ label }: { label: string }) =>
        useImageUpload(
          file,
          async () => {
            uploads.push(label);
            return { id: label, url: `blob:${label}` };
          },
          (result) => {
            calls.push(`${label}:${result?.id}`);
          },
        ),
      { label: 'first' },
    );

    hook.rerender({ label: 'second' });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(uploads).toEqual(['second']);
    expect(calls).toEqual(['second:second']);
    hook.unmount();
  });

  test('진행 중이던 업로드가 취소되면 결과가 도착해도 callback이 호출되지 않고, 최신 파일 결과만 전달됨', async () => {
    vi.useFakeTimers();
    const fileA = new Blob(['a']);
    const fileB = new Blob(['b']);
    const resultA = { id: 'a', url: 'blob:a' };
    const resultB = { id: 'b', url: 'blob:b' };

    const deferredA = deferred<typeof resultA>();
    const deferredB = deferred<typeof resultB>();

    const handleFileUpload = vi.fn((blob: Blob) =>
      blob === fileA ? deferredA.promise : deferredB.promise,
    );
    const callback = vi.fn();

    const hook = renderHook(
      ({ file }: { file: Blob | null }) => useImageUpload(file, handleFileUpload, callback),
      { file: fileA },
    );

    // fileA 업로드가 시작되지만 아직 완료되지 않음
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(handleFileUpload).toHaveBeenCalledWith(fileA);

    // fileA가 완료되기 전에 fileB로 교체 → 다음 디바운스 사이클에서 fileA 업로드가 취소됨
    hook.rerender({ file: fileB });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(handleFileUpload).toHaveBeenCalledWith(fileB);

    // 늦게 도착한 fileA 결과는 무시됨
    await act(async () => {
      deferredA.resolve(resultA);
      await Promise.resolve();
    });
    expect(callback).not.toHaveBeenCalledWith(resultA);

    // fileB 결과만 callback으로 전달됨
    await act(async () => {
      deferredB.resolve(resultB);
      await Promise.resolve();
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(resultB);

    hook.unmount();
  });
});
