import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createDomHarness } from '../../test-utils/dom-harness.js';
import { createLayoutComponent } from './create-layout-component.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('createLayoutComponent', () => {
  const { mount, renderInto, cleanup } = createDomHarness();

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('base: stack이면 direction이 flexDirection에 반영된다 (Stack이 내부 처리)', async () => {
    const Probe = createLayoutComponent({ displayName: 'Probe', base: 'stack', direction: 'row' });
    const el = await renderInto((ref) => <Probe ref={ref}>x</Probe>);
    const style = getComputedStyle(el);
    expect(style.display).toBe('flex');
    expect(style.flexDirection).toBe('row');
  });

  it('base: box면 display/flexDirection을 팩토리가 직접 sx로 조립한다', async () => {
    const Probe = createLayoutComponent({ displayName: 'Probe', base: 'box', direction: 'column' });
    const el = await renderInto((ref) => <Probe ref={ref}>x</Probe>);
    const style = getComputedStyle(el);
    expect(style.display).toBe('flex');
    expect(style.flexDirection).toBe('column');
  });

  it('base: box + inlineFlex=true면 display가 inline-flex가 된다', async () => {
    const Probe = createLayoutComponent({ displayName: 'Probe', base: 'box', direction: 'row' });
    const el = await renderInto((ref) => (
      <Probe ref={ref} inlineFlex>
        x
      </Probe>
    ));
    expect(getComputedStyle(el).display).toBe('inline-flex');
  });

  it('base: box + flexWrap이 sx에 반영된다', async () => {
    const Probe = createLayoutComponent({ displayName: 'Probe', base: 'box', direction: 'row' });
    const el = await renderInto((ref) => (
      <Probe ref={ref} flexWrap='wrap'>
        x
      </Probe>
    ));
    expect(getComputedStyle(el).flexWrap).toBe('wrap');
  });

  it('defaultProps의 justifyContent가 기본 렌더에 반영된다 (서브변형 프리셋 흉내)', async () => {
    const Probe = createLayoutComponent({
      displayName: 'Probe',
      base: 'stack',
      direction: 'column',
      defaultProps: { justifyContent: 'flex-end' },
    });
    const el = await renderInto((ref) => <Probe ref={ref}>x</Probe>);
    expect(getComputedStyle(el).justifyContent).toBe('flex-end');
  });

  it('defaultProps가 있어도 명시 justifyContent가 우선한다 (서브변형 override 능력)', async () => {
    const Probe = createLayoutComponent({
      displayName: 'Probe',
      base: 'stack',
      direction: 'column',
      defaultProps: { justifyContent: 'flex-end' },
    });
    const el = await renderInto((ref) => (
      <Probe ref={ref} justifyContent='space-around'>
        x
      </Probe>
    ));
    expect(getComputedStyle(el).justifyContent).toBe('space-around');
  });

  it('base: stack + supportsCenterProp: true + center=true면 명시 값을 무시하고 강제 center가 된다', async () => {
    const Probe = createLayoutComponent({
      displayName: 'Probe',
      base: 'stack',
      direction: 'column',
      supportsCenterProp: true,
    });
    const el = await renderInto((ref) => (
      <Probe ref={ref} center alignItems='flex-end' justifyContent='space-between'>
        x
      </Probe>
    ));
    const style = getComputedStyle(el);
    expect(style.alignItems).toBe('center');
    expect(style.justifyContent).toBe('center');
  });

  it('base: box + supportsCenterProp: true + center=true면 명시 값이 center보다 우선한다', async () => {
    const Probe = createLayoutComponent({
      displayName: 'Probe',
      base: 'box',
      direction: 'column',
      supportsCenterProp: true,
    });
    const el = await renderInto((ref) => (
      <Probe ref={ref} center justifyContent='flex-end'>
        x
      </Probe>
    ));
    const style = getComputedStyle(el);
    expect(style.justifyContent).toBe('flex-end');
    expect(style.alignItems).toBe('center');
  });

  it('supportsCenterProp이 없으면 center prop을 전달해도 무시된다', async () => {
    const Probe = createLayoutComponent({
      displayName: 'Probe',
      base: 'stack',
      direction: 'column',
    });
    const el = await renderInto((ref) => (
      <Probe ref={ref} center>
        x
      </Probe>
    ));
    const style = getComputedStyle(el);
    expect(style.alignItems).toBe('');
    expect(style.justifyContent).toBe('');
  });

  it('config.displayName이 컴포넌트에 그대로 설정된다', () => {
    const Probe = createLayoutComponent({
      displayName: 'MyProbe.Left',
      base: 'box',
      direction: 'row',
    });
    expect(Probe.displayName).toBe('MyProbe.Left');
  });

  it('callback ref로 렌더된 DOM 요소가 전달된다 (base: stack)', async () => {
    const Probe = createLayoutComponent({
      displayName: 'Probe',
      base: 'stack',
      direction: 'column',
    });
    const callbackRef = vi.fn();
    await mount(<Probe ref={callbackRef}>x</Probe>);
    expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('callback ref로 렌더된 DOM 요소가 전달된다 (base: box)', async () => {
    const Probe = createLayoutComponent({ displayName: 'Probe', base: 'box', direction: 'row' });
    const callbackRef = vi.fn();
    await mount(<Probe ref={callbackRef}>x</Probe>);
    expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});
