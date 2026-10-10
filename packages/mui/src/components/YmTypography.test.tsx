import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { YmTypography, type YmTypographyProps } from './YmTypography.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('YmTypography', () => {
  let container: HTMLDivElement;
  let root: Root;

  const render = (props: YmTypographyProps) => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(<YmTypography {...props} />);
    });
    return container.firstElementChild as HTMLElement;
  };

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
  });

  it('6자리 문자열을 YYYY-MM으로 표시한다', () => {
    expect(render({ value: '202601' }).textContent).toBe('2026-01');
  });

  it('number를 YYYYMM으로 해석해 표시한다', () => {
    expect(render({ value: 202601 }).textContent).toBe('2026-01');
  });

  it('format을 적용한다', () => {
    expect(render({ value: '202601', format: 'YYYY/MM' }).textContent).toBe('2026/01');
  });

  it('값이 없으면 기본 fallback인 -를 표시한다', () => {
    expect(render({ value: null }).textContent).toBe('-');
  });

  it('fallback을 지정하면 그 문자열을 표시한다', () => {
    expect(render({ value: undefined, fallback: '없음' }).textContent).toBe('없음');
  });

  it('raw면 값을 가공하지 않고 표시한다', () => {
    expect(render({ value: '202601', raw: true }).textContent).toBe('202601');
  });

  it('className에 YmTypography-root를 포함하고 사용자 className을 유지한다', () => {
    const el = render({ value: '202601', className: 'custom' });
    expect(el.classList.contains('YmTypography-root')).toBe(true);
    expect(el.classList.contains('custom')).toBe(true);
  });
});
