import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { FloatingIndicator } from './FloatingIndicator.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('FloatingIndicator ref 전달', () => {
  let container: HTMLDivElement;
  let root: Root;
  let target: HTMLElement;
  let parent: HTMLElement;

  beforeAll(() => {
    // target/parent가 있어야 조기 반환을 거치지 않고 Box DOM이 렌더된다
    target = document.createElement('div');
    parent = document.createElement('div');
    parent.append(target);
    document.body.append(parent);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    vi.restoreAllMocks();
  });

  it('RefObject 전달 시 ref.current가 렌더된 Box DOM 요소로 설정된다', async () => {
    const ref = { current: null as HTMLElement | null };

    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root.render(<FloatingIndicator ref={ref} target={target} parent={parent} />);
    });

    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current).toBe(container.querySelector('.FloatingIndicator-root'));
  });

  it('callback ref 전달 시 동일 Box DOM 요소가 콜백 인자로 전달된다', async () => {
    const callbackRef = vi.fn();

    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root.render(<FloatingIndicator ref={callbackRef} target={target} parent={parent} />);
    });

    const rendered = container.querySelector('.FloatingIndicator-root');
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef).toHaveBeenCalledWith(rendered);
    expect(rendered).toBeInstanceOf(HTMLElement);
  });
});
