import { useEffect, useState } from 'react';
import { describe, expect, test } from 'vitest';
import { renderHook } from './render-hook.js';

describe('renderHook', () => {
  test('훅 결과를 읽고 rerender로 props를 갱신', () => {
    const hook = renderHook(
      ({ value }: { value: number }) => {
        const [state, setState] = useState(value);

        useEffect(() => {
          setState(value);
        }, [value]);

        return state;
      },
      { value: 1 },
    );

    expect(hook.result.current).toBe(1);

    hook.rerender({ value: 2 });

    expect(hook.result.current).toBe(2);
    hook.unmount();
  });
});
