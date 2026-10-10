import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { YmdTypography, type YmdTypographyProps } from './YmdTypography.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('YmdTypography', () => {
  let container: HTMLDivElement;
  let root: Root;

  const render = (props: YmdTypographyProps) => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(<YmdTypography {...props} />);
    });
    return container.firstElementChild as HTMLElement;
  };

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
  });

  it('8자리 문자열을 YYYY-MM-DD로 표시한다', () => {
    expect(render({ value: '19900101' }).textContent).toBe('1990-01-01');
  });

  it('number를 YYYYMMDD로 해석해 표시한다', () => {
    expect(render({ value: 20260101 }).textContent).toBe('2026-01-01');
  });

  it('format을 적용한다', () => {
    expect(render({ value: '19900101', format: 'YYYY.MM.DD' }).textContent).toBe('1990.01.01');
  });

  it('값이 없으면 기본 fallback인 -를 표시한다', () => {
    expect(render({ value: null }).textContent).toBe('-');
  });

  it('fallback을 지정하면 그 문자열을 표시한다', () => {
    expect(render({ value: undefined, fallback: '없음' }).textContent).toBe('없음');
  });

  it('raw면 값을 가공하지 않고 표시한다', () => {
    expect(render({ value: '19900101', raw: true }).textContent).toBe('19900101');
  });

  it('className에 YmdTypography-root를 포함하고 사용자 className을 유지한다', () => {
    const el = render({ value: '19900101', className: 'custom' });
    expect(el.classList.contains('YmdTypography-root')).toBe(true);
    expect(el.classList.contains('custom')).toBe(true);
  });

  it('Typography props를 전달한다', () => {
    const el = render({
      value: '19900101',
      component: 'time',
      'data-testid': 'ymd',
    } as YmdTypographyProps);
    expect(el.tagName).toBe('TIME');
    expect(el.getAttribute('data-testid')).toBe('ymd');
  });
});
