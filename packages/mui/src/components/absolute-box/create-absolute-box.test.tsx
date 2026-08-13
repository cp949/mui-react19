import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createAbsoluteBox } from './create-absolute-box.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('createAbsoluteBox', () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    vi.restoreAllMocks();
  });

  const renderInto = async (renderNode: (ref: { current: HTMLElement | null }) => ReactElement) => {
    const ref = { current: null as HTMLElement | null };
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root.render(renderNode(ref));
    });
    return ref.current as HTMLElement;
  };

  it('axis 기본값이 sx에 반영된다', async () => {
    const Probe = createAbsoluteBox({
      displayName: 'Probe',
      axes: [{ cssProp: 'top', defaultValue: 0 }],
      supportsFullWidth: false,
    });
    const el = await renderInto((ref) => <Probe ref={ref}>x</Probe>);
    const style = getComputedStyle(el);
    expect(style.position).toBe('absolute');
    expect(style.top).toBe('0px');
  });

  it('axis 커스텀 값이 기본값을 덮어쓴다', async () => {
    const Probe = createAbsoluteBox({
      displayName: 'Probe',
      axes: [{ cssProp: 'top', defaultValue: 0 }],
      supportsFullWidth: false,
    });
    const el = await renderInto((ref) => (
      <Probe ref={ref} top='12px'>
        x
      </Probe>
    ));
    expect(getComputedStyle(el).top).toBe('12px');
  });

  it('defaultValue가 없는 axis는 미지정 시 빈 문자열로 남는다', async () => {
    const Probe = createAbsoluteBox({
      displayName: 'Probe',
      axes: [{ cssProp: 'top' }],
      supportsFullWidth: false,
    });
    const el = await renderInto((ref) => <Probe ref={ref}>x</Probe>);
    expect(getComputedStyle(el).top).toBe('');
  });

  it('fixedStyle이 sx에 병합된다', async () => {
    const Probe = createAbsoluteBox({
      displayName: 'Probe',
      axes: [],
      fixedStyle: { left: '50%', transform: 'translateY(-50%)' },
      supportsFullWidth: false,
    });
    const el = await renderInto((ref) => <Probe ref={ref}>x</Probe>);
    const style = getComputedStyle(el);
    expect(style.left).toBe('50%');
    expect(style.transform).toBe('translateY(-50%)');
  });

  it('supportsFullWidth: true면 fullWidth prop이 width:100%로 반영된다', async () => {
    const Probe = createAbsoluteBox({
      displayName: 'Probe',
      axes: [],
      supportsFullWidth: true,
    });
    const el = await renderInto((ref) => (
      <Probe ref={ref} fullWidth>
        x
      </Probe>
    ));
    expect(getComputedStyle(el).width).toBe('100%');
  });

  it('supportsFullWidth: false면 fullWidth prop을 전달해도 width에 영향 없다', async () => {
    const Probe = createAbsoluteBox({
      displayName: 'Probe',
      axes: [],
      supportsFullWidth: false,
    });
    const el = await renderInto((ref) => (
      <Probe ref={ref} fullWidth>
        x
      </Probe>
    ));
    expect(getComputedStyle(el).width).not.toBe('100%');
  });

  it('config.displayName이 컴포넌트에 그대로 설정된다', () => {
    const Probe = createAbsoluteBox({
      displayName: 'MyProbe.Left',
      axes: [],
      supportsFullWidth: false,
    });
    expect(Probe.displayName).toBe('MyProbe.Left');
  });

  it('callback ref로 렌더된 DOM 요소가 전달된다', async () => {
    const Probe = createAbsoluteBox({
      displayName: 'Probe',
      axes: [],
      supportsFullWidth: false,
    });
    const callbackRef = vi.fn();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root.render(<Probe ref={callbackRef}>x</Probe>);
    });
    expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('sx prop(단일 객체)이 axis 기본값을 덮어쓴다', async () => {
    const Probe = createAbsoluteBox({
      displayName: 'Probe',
      axes: [{ cssProp: 'top', defaultValue: 0 }],
      supportsFullWidth: false,
    });
    const el = await renderInto((ref) => (
      <Probe ref={ref} sx={{ top: '40px' }}>
        x
      </Probe>
    ));
    expect(getComputedStyle(el).top).toBe('40px');
  });

  it('sx prop(배열)이 중첩되지 않고 평탄하게 스프레드된다', async () => {
    const Probe = createAbsoluteBox({
      displayName: 'Probe',
      axes: [{ cssProp: 'top', defaultValue: 0 }],
      supportsFullWidth: false,
    });
    const el = await renderInto((ref) => (
      <Probe ref={ref} sx={[{ top: '40px' }, { left: '5px' }]}>
        x
      </Probe>
    ));
    const style = getComputedStyle(el);
    expect(style.top).toBe('40px');
    expect(style.left).toBe('5px');
  });

  it('fullWidth로 계산된 width:100%를 사용자 sx.width가 덮어쓴다', async () => {
    const Probe = createAbsoluteBox({
      displayName: 'Probe',
      axes: [],
      supportsFullWidth: true,
    });
    const el = await renderInto((ref) => (
      <Probe ref={ref} fullWidth sx={{ width: '200px' }}>
        x
      </Probe>
    ));
    expect(getComputedStyle(el).width).toBe('200px');
  });
});
