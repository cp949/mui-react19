import { act } from 'react';
import { describe, expect, test } from 'vitest';
import { useImageLoadCallback } from '../../src/hooks/useImageLoadCallback.js';
import { renderHook } from './internal/render-hook.js';

describe('useImageLoadCallback', () => {
  test('load 이벤트가 발생하는 시점의 최신 onLoaded를 호출한다', () => {
    const img = document.createElement('img');
    // src가 비어 있으면 훅이 즉시 리턴하므로(가드: `if (!img?.src) return;`) 리스너가 등록되도록 src를 지정한다.
    img.src = 'https://example.com/a.png';
    const calls: string[] = [];

    const hook = renderHook(
      ({ label }: { label: string }) =>
        // keepListening: true는 img.complete 값과 무관하게 항상 리스너를 등록해 테스트를 안정시킨다.
        useImageLoadCallback(img, {
          keepListening: true,
          onLoaded: () => calls.push(label),
        }),
      { label: 'first' },
    );

    // happy-dom에서는 img.complete가 항상 true이므로, mount 시점에 이미 'first'로 1회 호출된다.
    expect(calls).toEqual(['first']);

    hook.rerender({ label: 'second' });

    act(() => {
      img.dispatchEvent(new Event('load'));
    });

    expect(calls).toEqual(['first', 'second']);
    hook.unmount();
  });

  test('error 이벤트가 발생하는 시점의 최신 onError를 호출한다', () => {
    const img = document.createElement('img');
    img.src = 'https://example.com/a.png';
    const calls: string[] = [];

    const hook = renderHook(
      ({ label }: { label: string }) =>
        useImageLoadCallback(img, {
          keepListening: true,
          onLoaded: () => {},
          onError: () => calls.push(label),
        }),
      { label: 'first' },
    );

    hook.rerender({ label: 'second' });

    act(() => {
      img.dispatchEvent(new Event('error'));
    });

    expect(calls).toEqual(['second']);
    hook.unmount();
  });
});
