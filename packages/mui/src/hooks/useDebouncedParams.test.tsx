import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { type UseDebouncedParamsResult, useDebouncedParams } from './useDebouncedParams.js';

type P = { q?: string; page?: number };

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('useDebouncedParams', () => {
  let root: Root;
  let result: { current: UseDebouncedParamsResult<P> | null };

  const advance = (ms: number) => {
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  };

  const change = (updated: P) => {
    act(() => {
      result.current?.onChange(updated);
    });
  };

  const draft = () => result.current?.params;

  function Harness(props: { params: P; onChange: (params: P) => void; delayMs?: number }) {
    result.current = useDebouncedParams<P>(props.params, props.onChange, {
      delayMs: props.delayMs,
    });
    return null;
  }

  // 부모가 delay(ms) 뒤에 발행값을 params로 돌려주는 상황을 흉내 낸다. (라우터/URL 갱신)
  function AsyncParent(props: { delay: number; published: P[]; delayMs?: number }) {
    const [params, setParams] = useState<P>({ q: '' });
    return (
      <Harness
        params={params}
        delayMs={props.delayMs}
        onChange={(next) => {
          props.published.push(next);
          setTimeout(() => setParams(next), props.delay);
        }}
      />
    );
  }

  const render = (ui: React.ReactNode) => {
    act(() => {
      root.render(ui);
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    result = { current: null };
    root = createRoot(document.createElement('div'));
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    vi.useRealTimers();
  });

  it('입력은 초안에 바로 반영하고 발행은 delayMs 뒤에 한 번만 한다', () => {
    const onChange = vi.fn();
    render(<Harness params={{ q: '' }} onChange={onChange} delayMs={100} />);

    change({ q: 'a' });
    expect(draft()).toEqual({ q: 'a' });
    expect(onChange).not.toHaveBeenCalled();

    advance(99);
    expect(onChange).not.toHaveBeenCalled();

    advance(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ q: 'a' });
  });

  it('delayMs를 생략하면 200ms 뒤에 발행한다', () => {
    const onChange = vi.fn();
    render(<Harness params={{ q: '' }} onChange={onChange} />);

    change({ q: 'a' });
    advance(199);
    expect(onChange).not.toHaveBeenCalled();

    advance(1);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('연속 입력은 타이머를 다시 시작하고 병합한 초안을 한 번 발행한다', () => {
    const onChange = vi.fn();
    render(<Harness params={{ q: '', page: 1 }} onChange={onChange} delayMs={100} />);

    change({ q: 'a' });
    advance(60);
    change({ q: 'ab' });
    advance(60);
    expect(onChange).not.toHaveBeenCalled();

    advance(40);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ q: 'ab', page: 1 });
  });

  it('flush는 대기 중인 입력을 기다리지 않고 바로 발행한다', () => {
    const onChange = vi.fn();
    render(<Harness params={{ q: '' }} onChange={onChange} delayMs={100} />);

    change({ q: 'a' });
    act(() => {
      result.current?.flush();
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ q: 'a' });

    // 예약된 타이머는 취소되어 다시 발행하지 않는다.
    advance(500);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('flush는 대기 중인 입력이 없으면 발행하지 않는다', () => {
    const onChange = vi.fn();
    render(<Harness params={{ q: '' }} onChange={onChange} />);

    act(() => {
      result.current?.flush();
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('발행 시점에는 가장 최신 onChange를 호출한다', () => {
    const first = vi.fn();
    const second = vi.fn();
    render(<Harness params={{ q: '' }} onChange={first} delayMs={100} />);

    change({ q: 'a' });
    render(<Harness params={{ q: '' }} onChange={second} delayMs={100} />);
    advance(100);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith({ q: 'a' });
  });

  it('외부 조건이 실제로 바뀌면 초안을 맞추고 대기 중인 입력을 취소한다', () => {
    const onChange = vi.fn();
    render(<Harness params={{ q: '' }} onChange={onChange} delayMs={100} />);

    change({ q: 'a' });
    render(<Harness params={{ q: 'reset' }} onChange={onChange} delayMs={100} />);

    expect(draft()).toEqual({ q: 'reset' });
    advance(500);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('내용이 같은 새 객체가 들어와도 초안과 대기 중인 입력을 유지한다', () => {
    const onChange = vi.fn();
    render(<Harness params={{ q: '' }} onChange={onChange} delayMs={100} />);

    change({ q: 'a' });
    render(<Harness params={{ q: '' }} onChange={onChange} delayMs={100} />);

    expect(draft()).toEqual({ q: 'a' });
    advance(100);
    expect(onChange).toHaveBeenCalledWith({ q: 'a' });
  });

  it('부모 갱신이 비동기여도 그 사이에 입력한 내용을 잃지 않는다', () => {
    const published: P[] = [];
    render(<AsyncParent delay={100} published={published} delayMs={50} />);

    change({ q: 'ab' });
    advance(50); // t=50 'ab' 발행, 부모 반영은 t=150
    advance(90); // t=140
    change({ q: 'abc' }); // 부모 반영 직전 추가 입력, 발행은 t=190

    advance(10); // t=150 부모가 { q: 'ab' }를 반영
    expect(draft()).toEqual({ q: 'abc' });

    advance(1000);
    expect(published).toEqual([{ q: 'ab' }, { q: 'abc' }]);
    expect(draft()).toEqual({ q: 'abc' });
  });

  it('오래된 발행값의 에코가 늦게 도착해도 더 최근 발행값을 되돌리지 않는다', () => {
    const published: P[] = [];
    render(<AsyncParent delay={100} published={published} delayMs={50} />);

    change({ q: 'ab' });
    advance(50); // t=50 'ab' 발행, 에코는 t=150
    advance(10); // t=60
    change({ q: 'abc' });
    advance(50); // t=110 'abc' 발행, 에코는 t=210
    expect(published).toEqual([{ q: 'ab' }, { q: 'abc' }]);

    advance(40); // t=150 'ab'의 에코 도착
    expect(draft()).toEqual({ q: 'abc' });

    advance(60); // t=210 'abc'의 에코 도착
    expect(draft()).toEqual({ q: 'abc' });
  });

  it('부모가 값을 보정해 돌려주면 보정된 값이 우선한다', () => {
    const onChange = vi.fn();
    render(<Harness params={{ q: '', page: 3 }} onChange={onChange} delayMs={100} />);

    change({ q: 'a' });
    advance(100);
    expect(onChange).toHaveBeenCalledWith({ q: 'a', page: 3 });

    // 부모가 page를 1로 되돌려 반영한다.
    render(<Harness params={{ q: 'a', page: 1 }} onChange={onChange} delayMs={100} />);
    expect(draft()).toEqual({ q: 'a', page: 1 });
  });

  it('외부 값이 예전에 발행한 값과 같아도 진짜 외부 변경이면 초안을 맞춘다', () => {
    const onChange = vi.fn();
    render(<Harness params={{ q: '' }} onChange={onChange} delayMs={100} />);

    change({ q: 'a' });
    advance(100); // 'a' 발행 (부모는 아직 반영하지 않음)

    render(<Harness params={{ q: 'x' }} onChange={onChange} delayMs={100} />);
    expect(draft()).toEqual({ q: 'x' });

    // 'x'로 바뀐 뒤 다시 'a'가 외부에서 들어오면 에코가 아니라 외부 변경이다.
    render(<Harness params={{ q: 'a' }} onChange={onChange} delayMs={100} />);
    expect(draft()).toEqual({ q: 'a' });
  });

  it('대기 중에 언마운트하면 타이머를 정리하고 발행하지 않는다', () => {
    const onChange = vi.fn();
    render(<Harness params={{ q: '' }} onChange={onChange} delayMs={100} />);

    change({ q: 'a' });
    expect(vi.getTimerCount()).toBe(1);

    act(() => {
      root.unmount();
    });

    expect(vi.getTimerCount()).toBe(0);
    advance(500);
    expect(onChange).not.toHaveBeenCalled();
    root = createRoot(document.createElement('div'));
  });
});
