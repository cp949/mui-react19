import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatNumericDateWhenComplete,
  formatYm,
  formatYmd,
  normalizeNumericDate,
} from './ymd-date.js';

describe('normalizeNumericDate', () => {
  it('숫자 외 문자를 제거하고 8자리로 자른다', () => {
    expect(normalizeNumericDate('19-90 0101abc22')).toBe('19900101');
  });

  it('null과 undefined는 빈 문자열을 반환한다', () => {
    expect(normalizeNumericDate(null)).toBe('');
    expect(normalizeNumericDate(undefined)).toBe('');
  });
});

describe('formatYmd', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('8자리 문자열은 YYYY-MM-DD로 표시한다', () => {
    expect(formatYmd('19900101')).toBe('1990-01-01');
  });

  it('6자리 문자열은 YY-MM-DD로 표시한다', () => {
    expect(formatYmd('990101')).toBe('99-01-01');
  });

  it('number는 epoch가 아니라 YYYYMMDD로 해석한다', () => {
    expect(formatYmd(20260101)).toBe('2026-01-01');
  });

  it('값이 없으면 빈 문자열을 반환한다', () => {
    expect(formatYmd(null)).toBe('');
    expect(formatYmd(undefined)).toBe('');
    expect(formatYmd('')).toBe('');
  });

  it('format 토큰을 치환한다', () => {
    expect(formatYmd('19900101', { format: 'YYYY.MM.DD' })).toBe('1990.01.01');
    expect(formatYmd('19900101', { format: 'YY/MM/DD' })).toBe('90/01/01');
    expect(formatYmd('19900101', { format: 'YYYYMMDD' })).toBe('19900101');
  });

  it('4자리 연도 포맷이면 2자리 연도를 현재 연도 기준으로 확장한다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T00:00:00'));

    expect(formatYmd('260101', { format: 'YYYY/MM/DD' })).toBe('2026/01/01');
    expect(formatYmd('450101', { format: 'YYYY/MM/DD' })).toBe('2045/01/01');
    expect(formatYmd('470101', { format: 'YYYY/MM/DD' })).toBe('1947/01/01');
    expect(formatYmd('990101', { format: 'YYYY/MM/DD' })).toBe('1999/01/01');
  });

  it('입력이 완성되지 않았으면 있는 부분만 표시한다', () => {
    expect(formatYmd('1990')).toBe('19-90');
    expect(formatYmd('199001')).toBe('19-90-01');
  });
});

describe('formatYm', () => {
  it('6자리 문자열은 YYYY-MM으로 표시한다', () => {
    expect(formatYm('202601')).toBe('2026-01');
  });

  it('number를 YYYYMM으로 해석한다', () => {
    expect(formatYm(202601)).toBe('2026-01');
  });

  it('숫자 외 문자를 제거하고 6자리로 자른다', () => {
    expect(formatYm('2026-01-15')).toBe('2026-01');
  });

  it('값이 없으면 빈 문자열을 반환한다', () => {
    expect(formatYm(null)).toBe('');
    expect(formatYm(undefined)).toBe('');
    expect(formatYm('')).toBe('');
  });

  it('format 토큰을 치환한다', () => {
    expect(formatYm('202601', { format: 'YYYY/MM' })).toBe('2026/01');
    expect(formatYm('202601', { format: 'YYYY년 MM월' })).toBe('2026년 01월');
  });

  it('입력이 완성되지 않았으면 있는 부분만 표시한다', () => {
    expect(formatYm('2026')).toBe('2026');
    expect(formatYm('20260')).toBe('2026-0');
  });
});

describe('formatNumericDateWhenComplete', () => {
  it('format이 요구하는 자릿수와 같을 때만 포맷한다', () => {
    expect(formatNumericDateWhenComplete('19900101', { format: 'YYYY-MM-DD' })).toBe('1990-01-01');
    expect(formatNumericDateWhenComplete('990101', { format: 'YY/MM/DD' })).toBe('99/01/01');
  });

  it('입력 중인 값은 숫자 원문 그대로 반환한다', () => {
    expect(formatNumericDateWhenComplete('199001', { format: 'YYYY-MM-DD' })).toBe('199001');
    expect(formatNumericDateWhenComplete('9901', { format: 'YY/MM/DD' })).toBe('9901');
  });

  it('format과 자릿수가 맞지 않으면 포맷하지 않는다', () => {
    expect(formatNumericDateWhenComplete('990101', { format: 'YYYY-MM-DD' })).toBe('990101');
    expect(formatNumericDateWhenComplete('19900101', { format: 'YY/MM/DD' })).toBe('19900101');
  });

  it('format이 없으면 6자리와 8자리에서 기본 포맷을 적용한다', () => {
    expect(formatNumericDateWhenComplete('990101')).toBe('99-01-01');
    expect(formatNumericDateWhenComplete('19900101')).toBe('1990-01-01');
    expect(formatNumericDateWhenComplete('1990010')).toBe('1990010');
  });

  it('숫자 외 문자를 제거하고 값이 없으면 빈 문자열을 반환한다', () => {
    expect(formatNumericDateWhenComplete('1990-01-01', { format: 'YYYY.MM.DD' })).toBe(
      '1990.01.01',
    );
    expect(formatNumericDateWhenComplete(null)).toBe('');
    expect(formatNumericDateWhenComplete('')).toBe('');
  });
});
