import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from './SegmentedControl.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('SegmentedControl ref 전달', () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    vi.restoreAllMocks();
  });

  it('RefObject 전달 시 ref.current가 루트 DOM(HTMLDivElement)으로 설정된다', async () => {
    const ref = { current: null as HTMLDivElement | null };

    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root.render(<SegmentedControl ref={ref} data={['A', 'B']} />);
    });

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(container.querySelector('.SegmentedControl-root'));
  });

  it('callback ref 전달 시 동일 루트 DOM이 콜백 인자로 전달된다', async () => {
    const callbackRef = vi.fn();

    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root.render(<SegmentedControl ref={callbackRef} data={['A', 'B']} />);
    });

    const rendered = container.querySelector('.SegmentedControl-root');
    expect(callbackRef).toHaveBeenCalledWith(rendered);
    expect(rendered).toBeInstanceOf(HTMLDivElement);
  });
});
