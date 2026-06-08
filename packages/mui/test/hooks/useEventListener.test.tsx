import { act } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { useEventListener } from '../../src/hooks/useEventListener.js';
import { renderHook } from './internal/render-hook.js';

describe('useEventListener', () => {
  test('ref 요소에 이벤트를 등록하고 unmount 시 해제', () => {
    const element = document.createElement('button');
    const callback = vi.fn();

    // 최초 렌더에서는 ref가 비어 있어 리스너가 붙지 않는다.
    // ref에 요소를 연결한 뒤 listener 참조를 바꿔 effect를 다시 실행시켜 등록을 유도한다.
    const hook = renderHook(
      ({ listener }: { listener: () => void }) => useEventListener('click', listener),
      { listener: () => {} },
    );

    act(() => {
      hook.result.current.current = element;
      hook.rerender({ listener: callback });
    });

    element.click();
    expect(callback).toHaveBeenCalledTimes(1);

    hook.unmount();
    element.click();

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
