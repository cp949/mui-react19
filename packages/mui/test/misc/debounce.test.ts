import { afterEach, describe, expect, test, vi } from 'vitest';
import { throttle } from '../../src/misc/debounce.js';

describe('throttle', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('연속 호출을 wait 간격으로 제한하고 마지막 호출을 실행', () => {
    vi.useFakeTimers();
    const calls: string[] = [];
    const throttled = throttle((value: string) => {
      calls.push(value);
    }, 100);

    throttled('first');
    throttled('second');
    throttled('third');

    expect(calls).toEqual(['first']);

    vi.advanceTimersByTime(100);

    expect(calls).toEqual(['first', 'third']);
  });

  test('cancel 호출 시 예약된 마지막 호출을 취소', () => {
    vi.useFakeTimers();
    const calls: string[] = [];
    const throttled = throttle((value: string) => {
      calls.push(value);
    }, 100);

    throttled('first');
    throttled('second');
    throttled.cancel();

    vi.advanceTimersByTime(100);

    expect(calls).toEqual(['first']);
  });
});
