import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DelayedRender } from './DelayedRender.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('DelayedRender', () => {
  let container: HTMLDivElement;
  let root: Root;

  const render = (ui: React.ReactNode) => {
    act(() => {
      root.render(ui);
    });
  };

  const advance = (ms: number) => {
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });

  it('지연 시간 전에는 렌더링하지 않고 지난 뒤에 렌더링한다', () => {
    render(<DelayedRender delayMs={300}>내용</DelayedRender>);
    expect(container.textContent).toBe('');

    advance(299);
    expect(container.textContent).toBe('');

    advance(1);
    expect(container.textContent).toBe('내용');
  });

  it('delayMs를 생략하면 500ms 뒤에 렌더링한다', () => {
    render(<DelayedRender>내용</DelayedRender>);

    advance(499);
    expect(container.textContent).toBe('');

    advance(1);
    expect(container.textContent).toBe('내용');
  });

  it('delayMs가 0 이하이면 지연 없이 바로 렌더링한다', () => {
    render(<DelayedRender delayMs={0}>내용</DelayedRender>);
    expect(container.textContent).toBe('내용');

    render(<DelayedRender delayMs={-10}>내용</DelayedRender>);
    expect(container.textContent).toBe('내용');
  });

  it('delayMs가 바뀌면 바로 숨기고 새 지연 시간 뒤에 다시 렌더링한다', () => {
    render(<DelayedRender delayMs={100}>내용</DelayedRender>);
    advance(100);
    expect(container.textContent).toBe('내용');

    render(<DelayedRender delayMs={200}>내용</DelayedRender>);
    expect(container.textContent).toBe('');

    advance(199);
    expect(container.textContent).toBe('');

    advance(1);
    expect(container.textContent).toBe('내용');
  });

  it('delayMs를 0에서 양수로 바꾸면 다시 지연한다', () => {
    render(<DelayedRender delayMs={0}>내용</DelayedRender>);
    expect(container.textContent).toBe('내용');

    render(<DelayedRender delayMs={100}>내용</DelayedRender>);
    expect(container.textContent).toBe('');

    advance(100);
    expect(container.textContent).toBe('내용');
  });

  it('한 번 표시된 뒤 children이 바뀌면 지연 없이 반영한다', () => {
    render(<DelayedRender delayMs={100}>첫째</DelayedRender>);
    advance(100);
    expect(container.textContent).toBe('첫째');

    render(<DelayedRender delayMs={100}>둘째</DelayedRender>);
    expect(container.textContent).toBe('둘째');
  });

  it('지연 중에 언마운트하면 타이머를 정리한다', () => {
    render(<DelayedRender delayMs={300}>내용</DelayedRender>);
    expect(vi.getTimerCount()).toBe(1);

    act(() => {
      root.unmount();
    });

    expect(vi.getTimerCount()).toBe(0);
    root = createRoot(container);
  });
});
