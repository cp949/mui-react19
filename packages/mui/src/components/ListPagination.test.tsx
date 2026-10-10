import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ListPagination, type ListPaginationProps } from './ListPagination.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('ListPagination', () => {
  let container: HTMLDivElement;
  let root: Root;
  let scrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.unstubAllGlobals();
  });

  const render = async (props: Partial<ListPaginationProps> = {}) => {
    await act(async () => {
      root.render(<ListPagination page={1} count={5} {...props} />);
    });
  };

  const selectedPage = () =>
    container.querySelector('button[aria-current="page"]')?.textContent ?? null;

  const clickPage = async (label: string) => {
    const button = container.querySelector(`button[aria-label="Go to page ${label}"]`);
    expect(button).not.toBeNull();
    await act(async () => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  };

  it('기본은 1-based로 page 그대로 선택 표시하고 onChange에 MUI 번호를 전달한다', async () => {
    const onChange = vi.fn();
    await render({ page: 2, onChange });

    expect(selectedPage()).toBe('2');

    await clickPage('3');
    expect(onChange).toHaveBeenCalledExactlyOnceWith(3);
  });

  it('zeroBased이면 page 0이 첫 페이지로 표시되고 onChange에 0-based 번호를 전달한다', async () => {
    const onChange = vi.fn();
    await render({ zeroBased: true, page: 0, onChange });

    expect(selectedPage()).toBe('1');

    await clickPage('3');
    expect(onChange).toHaveBeenCalledExactlyOnceWith(2);
  });

  it('count가 1 이하이면 아무것도 렌더링하지 않는다', async () => {
    await render({ count: 1 });
    expect(container.innerHTML).toBe('');

    await render({ count: 0, zeroBased: true, page: 0 });
    expect(container.innerHTML).toBe('');
  });

  it('hidden이면 아무것도 렌더링하지 않는다', async () => {
    await render({ hidden: true });
    expect(container.innerHTML).toBe('');
  });

  it('페이지를 바꾸면 기본으로 상단 스크롤하고 disableAutoScroll이면 하지 않는다', async () => {
    await render({ onChange: () => {} });
    await clickPage('2');
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 0, behavior: 'instant' });

    scrollTo.mockClear();
    await render({ onChange: () => {}, disableAutoScroll: true });
    await clickPage('2');
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('className과 sx는 바깥 래퍼에 적용되고 나머지 props는 Pagination에 전달된다', async () => {
    await render({ className: 'custom', sx: { mt: 2 }, disabled: true });

    const wrapper = container.firstElementChild;
    expect(wrapper?.classList.contains('custom')).toBe(true);
    expect(wrapper?.classList.contains('ListPagination-root')).toBe(true);
    expect(container.querySelector('button[aria-label="Go to page 2"]')).toHaveProperty(
      'disabled',
      true,
    );
  });
});
