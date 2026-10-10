import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchBoxDebouncer } from './SearchBoxDebouncer.js';

type P = { q?: string };

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('SearchBoxDebouncer', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    vi.useRealTimers();
  });

  it('children에 초안 params와 onChange, flush를 전달한다', () => {
    type ChildProps = Parameters<React.ComponentProps<typeof SearchBoxDebouncer<P>>['children']>[0];
    const received: { current: ChildProps | null } = { current: null };

    act(() => {
      root.render(
        <SearchBoxDebouncer<P> params={{ q: 'init' }} onChange={vi.fn()}>
          {(props) => {
            received.current = props;
            return <span>{props.params.q}</span>;
          }}
        </SearchBoxDebouncer>,
      );
    });

    expect(container.textContent).toBe('init');
    expect(typeof received.current?.onChange).toBe('function');
    expect(typeof received.current?.flush).toBe('function');
  });

  it('입력은 바로 화면에 반영하고 외부 onChange는 delayMs 뒤에 호출한다', () => {
    const onChange = vi.fn();
    let change: (updated: P) => void = () => {};

    act(() => {
      root.render(
        <SearchBoxDebouncer<P> delayMs={100} params={{ q: '' }} onChange={onChange}>
          {(props) => {
            change = props.onChange;
            return <span>{props.params.q}</span>;
          }}
        </SearchBoxDebouncer>,
      );
    });

    act(() => change({ q: '검색어' }));
    expect(container.textContent).toBe('검색어');
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onChange).toHaveBeenCalledWith({ q: '검색어' });
  });

  it('flush를 호출하면 기다리지 않고 외부 onChange를 호출한다', () => {
    const onChange = vi.fn();
    let change: (updated: P) => void = () => {};
    let flush: () => void = () => {};

    act(() => {
      root.render(
        <SearchBoxDebouncer<P> delayMs={1000} params={{ q: '' }} onChange={onChange}>
          {(props) => {
            change = props.onChange;
            flush = props.flush;
            return null;
          }}
        </SearchBoxDebouncer>,
      );
    });

    act(() => change({ q: 'a' }));
    act(() => flush());

    expect(onChange).toHaveBeenCalledWith({ q: 'a' });
  });
});
