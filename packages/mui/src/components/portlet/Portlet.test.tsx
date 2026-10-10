import { act } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createDomHarness } from '../../test-utils/dom-harness.js';
import { Portlet } from './Portlet.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('Portlet 조립 컴포넌트', () => {
  const { renderInto, cleanup } = createDomHarness();

  afterEach(() => {
    cleanup();
  });

  it('Label은 root 클래스와 사용자 className을 함께 유지한다', async () => {
    const label = await renderInto((ref) => (
      <Portlet.Label ref={ref} className='custom-label' title='제목' />
    ));

    expect(label.classList.contains('PortletLabel-root')).toBe(true);
    expect(label.classList.contains('custom-label')).toBe(true);
  });

  it('Toolbar는 Header의 단독 자식이어도 우측으로 정렬된다', async () => {
    const toolbar = await renderInto((ref) => (
      <Portlet.Header>
        <Portlet.Toolbar ref={ref}>도구</Portlet.Toolbar>
      </Portlet.Header>
    ));

    expect(getComputedStyle(toolbar).marginLeft).toBe('auto');
  });

  describe('Title', () => {
    const { renderInto, cleanup } = createDomHarness<HTMLDivElement>();

    afterEach(() => {
      cleanup();
    });

    it('기본 variant는 h5이고 titleVariant로 h6을 지정할 수 있다', async () => {
      const defaultRoot = await renderInto((ref) => <Portlet.Title ref={ref} title='목록' />);
      expect(defaultRoot.classList.contains('PortletTitle-root')).toBe(true);
      expect(defaultRoot.querySelector('h5.PortletTitle-title')?.textContent).toBe('목록');
      cleanup();

      const h6Root = await renderInto((ref) => (
        <Portlet.Title ref={ref} title='목록' titleVariant='h6' />
      ));
      expect(h6Root.querySelector('h6.PortletTitle-title')).not.toBeNull();
      expect(h6Root.querySelector('h5')).toBeNull();
    });

    it('itemCount가 0보다 클 때만 formatItemCount 결과를 표시한다', async () => {
      const withCount = await renderInto((ref) => (
        <Portlet.Title
          ref={ref}
          title='목록'
          itemCount={1234}
          formatItemCount={(n) => `${n.toLocaleString('en-US')}건`}
        />
      ));
      expect(withCount.querySelector('small')?.textContent).toBe('1,234건');
      cleanup();

      const zeroCount = await renderInto((ref) => <Portlet.Title ref={ref} title='목록' />);
      expect(zeroCount.querySelector('small')).toBeNull();
    });

    it('문자열이 아닌 title은 Typography로 감싸지 않고 그대로 렌더링한다', async () => {
      const root = await renderInto((ref) => (
        <Portlet.Title ref={ref} title={<span className='custom-title'>제목</span>} />
      ));
      expect(root.querySelector('.custom-title')?.textContent).toBe('제목');
      expect(root.querySelector('.PortletTitle-title')).toBeNull();
    });

    it('onClickRefresh가 있고 loading이 아닐 때 새로고침 버튼을 클릭할 수 있다', async () => {
      const onClickRefresh = vi.fn();
      const root = await renderInto((ref) => (
        <Portlet.Title ref={ref} title='목록' onClickRefresh={onClickRefresh} />
      ));
      const button = root.querySelector<HTMLButtonElement>('button[aria-label="새로고침"]');
      expect(button).not.toBeNull();

      await act(async () => {
        button?.click();
      });
      expect(onClickRefresh).toHaveBeenCalledTimes(1);
    });

    it('loading이면 버튼 대신 로딩 표시를 보여주고, onClickRefresh가 없으면 버튼이 없다', async () => {
      const loadingRoot = await renderInto((ref) => (
        <Portlet.Title ref={ref} title='목록' loading onClickRefresh={() => {}} />
      ));
      expect(loadingRoot.querySelector('button')).toBeNull();
      expect(loadingRoot.querySelector('[role="progressbar"]')).not.toBeNull();
      cleanup();

      const noHandlerRoot = await renderInto((ref) => <Portlet.Title ref={ref} title='목록' />);
      expect(noHandlerRoot.querySelector('button')).toBeNull();
      expect(noHandlerRoot.querySelector('[role="progressbar"]')).toBeNull();
    });
  });
});
