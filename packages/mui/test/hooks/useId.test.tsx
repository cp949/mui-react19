import { describe, expect, test } from 'vitest';
import { useId } from '../../src/hooks/useId.js';
import { renderHook } from './internal/render-hook.js';

describe('useId', () => {
  test('staticId가 string이면 그대로 반환한다', () => {
    const hook = renderHook((props: { staticId?: string }) => useId(props.staticId), {
      staticId: 'static-id',
    });

    expect(hook.result.current).toBe('static-id');
    hook.unmount();
  });

  test('staticId가 없으면 네이티브 id를 반환한다 (mantine- / 콜론 없음)', () => {
    const hook = renderHook((props: { staticId?: string }) => useId(props.staticId), {
      staticId: undefined,
    });

    const id = hook.result.current;
    expect(id).toBeTruthy();
    expect(id).not.toContain('mantine-');
    expect(id).not.toContain(':');
    hook.unmount();
  });

  test('동일 props로 재렌더해도 id가 변하지 않는다', () => {
    const hook = renderHook((props: { staticId?: string }) => useId(props.staticId), {
      staticId: undefined,
    });

    const firstId = hook.result.current;
    hook.rerender({ staticId: undefined });

    expect(hook.result.current).toBe(firstId);
    hook.unmount();
  });
});
