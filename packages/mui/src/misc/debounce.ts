/**
 * debounce와 throttle 타이밍 제어 유틸을 제공한다.
 *
 * lodash 의존성을 늘리지 않기 위해 필요한 동작만 내부 구현으로 유지한다.
 */

/** 지연 실행 함수에 정리와 즉시 실행 제어 메서드를 더한 타입 */
type DebouncedFunction<T extends (...args: any[]) => any> = T & {
  /** 예약된 trailing 호출 취소 */
  cancel: () => void;

  /** 예약된 trailing 호출 즉시 실행 */
  flush: () => ReturnType<T> | undefined;
};

/** debounce 실행 시점 제어 옵션 */
interface DebounceOptions {
  /** 첫 호출 시 즉시 실행 여부 */
  leading?: boolean;

  /** 마지막 호출을 wait 이후 실행할지 여부 */
  trailing?: boolean;

  /** 연속 호출 중에도 실행을 보장할 최대 대기 시간 */
  maxWait?: number;
}

/** throttle에서 노출하는 실행 시점 옵션 */
type ThrottleOptions = Pick<DebounceOptions, 'leading' | 'trailing'>;

/**
 * 연속 호출이 멈춘 뒤 지정한 시간만큼 기다렸다가 마지막 호출을 실행한다.
 *
 * @param func 지연 실행할 함수
 * @param wait 호출을 미룰 시간
 * @param options leading, trailing, maxWait 실행 정책
 * @returns 취소와 즉시 실행 제어가 가능한 함수
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 0,
  options: DebounceOptions = {},
): DebouncedFunction<T> {
  let lastArgs: any;
  let lastThis: any;
  let maxWait: number | undefined;
  let result: ReturnType<T>;
  let timerId: ReturnType<typeof setTimeout> | undefined;
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;
  const { leading = false, trailing = true, maxWait: userMaxWait } = options;

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }

  if (typeof userMaxWait === 'number') {
    maxWait = Math.max(userMaxWait, wait);
  }

  // 테스트와 런타임에서 같은 시간 기준을 사용하도록 현재 시각 조회를 한곳에 모은다.
  function now(): number {
    return Date.now();
  }

  // 마지막 호출 인자와 this를 사용해 실제 함수를 실행하고 대기 상태를 비운다.
  function invokeFunc(time: number) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = undefined;
    lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  // leading 실행 여부와 관계없이 다음 trailing 판단을 위한 타이머를 시작한다.
  function leadingEdge(time: number) {
    lastInvokeTime = time;
    timerId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  // wait와 maxWait 중 먼저 도달하는 시점을 다음 확인 시각으로 사용한다.
  function remainingWait(time: number): number {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  // 첫 호출, wait 경과, 시계 보정, maxWait 도달 여부를 실행 기준으로 삼는다.
  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }

  // 아직 실행 조건이 아니면 남은 시간만큼 다시 예약한다.
  function timerExpired() {
    const time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  // trailing 정책이 켜져 있고 마지막 호출 정보가 남아 있을 때만 실행한다.
  function trailingEdge(time: number) {
    timerId = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = undefined;
    lastThis = undefined;
    return result;
  }

  // 예약된 타이머와 마지막 호출 정보를 모두 초기화한다.
  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = undefined;
    lastCallTime = undefined;
    lastThis = undefined;
    timerId = undefined;
  }

  // 예약된 trailing 호출이 있으면 즉시 실행하고, 없으면 마지막 결과를 반환한다.
  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  // 호출 정보는 항상 최신 값으로 갱신하고, 실행 가능 여부만 정책으로 판단한다.
  function debounced(this: any, ...args: any[]) {
    const time = now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }

      // maxWait가 있으면 연속 호출 중에도 주기적으로 실제 함수를 실행한다.
      if (maxWait !== undefined) {
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }

    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced as DebouncedFunction<T>;
}

/**
 * 지정한 시간 간격 안에서 함수 실행 빈도를 제한한다.
 *
 * debounce에 maxWait를 적용해 lodash throttle과 같은 기본 정책을 제공한다.
 *
 * @param func 실행 빈도를 제한할 함수
 * @param wait 최소 실행 간격
 * @param options leading과 trailing 실행 여부
 * @returns 취소와 즉시 실행 제어가 가능한 함수
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 0,
  options: ThrottleOptions = {},
): DebouncedFunction<T> {
  return debounce(func, wait, {
    leading: options.leading ?? true,
    trailing: options.trailing ?? true,
    maxWait: wait,
  });
}

export { debounce, throttle };
