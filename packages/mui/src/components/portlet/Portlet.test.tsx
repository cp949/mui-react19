import { afterEach, beforeAll, describe, expect, it } from 'vitest';
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
});
