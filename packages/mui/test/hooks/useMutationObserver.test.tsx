import { act } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useMutationObserver } from '../../src/hooks/useMutationObserver.js';
import { renderHook } from './internal/render-hook.js';

class MockMutationObserver {
  static instances: MockMutationObserver[] = [];
  callback: MutationCallback;
  disconnect = vi.fn();
  observe = vi.fn();

  constructor(callback: MutationCallback) {
    this.callback = callback;
    MockMutationObserver.instances.push(this);
  }
}

describe('useMutationObserver', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    MockMutationObserver.instances = [];
  });

  test('MutationObserver를 연결하고 최신 callback을 사용', () => {
    vi.stubGlobal('MutationObserver', MockMutationObserver);
    const target = document.createElement('div');
    const calls: string[] = [];

    const hook = renderHook(
      ({ label }: { label: string }) =>
        useMutationObserver(
          () => {
            calls.push(label);
          },
          { childList: true },
          target,
        ),
      { label: 'first' },
    );

    hook.rerender({ label: 'second' });

    act(() => {
      MockMutationObserver.instances[0].callback(
        [],
        MockMutationObserver.instances[0] as unknown as MutationObserver,
      );
    });

    expect(calls).toEqual(['second']);
    hook.unmount();
    expect(MockMutationObserver.instances[0].disconnect).toHaveBeenCalled();
  });
});
