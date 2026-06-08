import type { DebugLevel } from '../types.js';

/**
 * file-drop 런타임 로그 정책을 레벨별 no-op 함수로 정규화한다.
 */
type LogArguments = readonly unknown[];

/**
 * file-drop 내부 디버그 로그 출력 정책을 한곳에서 관리한다.
 */
export interface FileDropDebugLogger {
  /** 주요 처리 단계 로그 */
  info: (...args: LogArguments) => void;

  /** 항목 단위 상세 로그 */
  verbose: (...args: LogArguments) => void;

  /** 디버깅용 상세 진단 로그 */
  debug: (...args: LogArguments) => void;

  /** 비치명 경고 로그 */
  warn: (...args: LogArguments) => void;

  /** 실패 원인 확인용 오류 로그 */
  error: (...args: LogArguments) => void;
}

const noop = () => {};

/**
 * debug 레벨에 맞는 logger를 생성한다.
 *
 * 기본값인 `warn`에서는 경고 로그만 출력한다.
 */
export function createFileDropLogger(debugLevel: DebugLevel = 'warn'): FileDropDebugLogger {
  const isWarnEnabled = debugLevel !== 'none';
  const isInfoEnabled = debugLevel === 'info' || debugLevel === 'verbose';
  const isVerboseEnabled = debugLevel === 'verbose';

  return {
    info: isInfoEnabled ? (...args) => console.log(...args) : noop,
    verbose: isVerboseEnabled ? (...args) => console.log(...args) : noop,
    debug: isVerboseEnabled ? (...args) => console.debug(...args) : noop,
    warn: isWarnEnabled ? (...args) => console.warn(...args) : noop,
    error: isInfoEnabled ? (...args) => console.error(...args) : noop,
  };
}
