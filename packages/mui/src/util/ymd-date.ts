const MAX_DATE_DIGITS = 8;
const MAX_MONTH_DIGITS = 6;

/**
 * 날짜 포맷 옵션.
 *
 * @example
 * ```ts
 * formatYmd('19900101', { format: 'YYYY/MM/DD' }); // '1990/01/01'
 * ```
 */
export interface NumericDateFormatOptions {
  /**
   * 출력 포맷. 예: `YYYY-MM-DD`, `YY.MM.DD`, `YYYYMMDD`.
   * `YYYY`, `YY`, `MM`, `DD` 토큰을 실제 날짜 값으로 치환한다.
   * 지정하지 않으면 입력 연도 길이에 따라 `YY-MM-DD` 또는 `YYYY-MM-DD`로 표시한다.
   */
  format?: string;
}

/**
 * 날짜 입력값에서 숫자만 남기고 최대 8자리로 자른다.
 *
 * @example
 * ```ts
 * normalizeNumericDate('19-90 0101abc22'); // '19900101'
 * normalizeNumericDate('990101'); // '990101'
 * ```
 */
export function normalizeNumericDate(value?: string | null): string {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, MAX_DATE_DIGITS);
}

/**
 * 2자리 연도(YY)를 4자리 연도(YYYY)로 확장한다.
 * 현재 연도보다 20년 넘게 미래가 되면 이전 세기로 추론한다.
 * (예: 현재 2026년일 때 '80'은 2080년이 아니라 1980년)
 */
function expandYearToFourDigits(yyStr: string): string {
  if (yyStr.length !== 2) return yyStr;

  const yy = Number.parseInt(yyStr, 10);
  const currentYear = new Date().getFullYear();
  const currentCentury = Math.floor(currentYear / 100) * 100;

  let resultYear = currentCentury + yy;
  if (resultYear > currentYear + 20) {
    resultYear -= 100;
  }

  return resultYear.toString();
}

/**
 * YYYYMMDD(8자리) 또는 YYMMDD(6자리) 숫자 날짜를 표시용 문자열로 변환한다.
 *
 * - `number`는 YYYYMMDD/YYMMDD 숫자로 해석한다. epoch 값이 아니다.
 * - `number`는 앞자리 0이 사라지므로 `00`으로 시작하는 YYMMDD는 문자열로 넘긴다.
 * - 숫자 외 문자는 제거하고, 8자리를 넘는 입력은 잘라낸다.
 * - 값이 없으면 빈 문자열을 반환한다.
 * - 존재하는 날짜인지는 검사하지 않는다.
 *
 * @example
 * ```ts
 * formatYmd('990101'); // '99-01-01'
 * formatYmd(19900101); // '1990-01-01'
 * formatYmd('19900101', { format: 'YYYY.MM.DD' }); // '1990.01.01'
 * formatYmd('990101', { format: 'YYYY/MM/DD' }); // '1999/01/01'
 * ```
 */
export function formatYmd(
  value?: number | string | null,
  options?: NumericDateFormatOptions,
): string {
  const digits = normalizeNumericDate(value == null ? null : String(value));

  if (!digits) {
    return '';
  }

  const isSixDigits = digits.length <= 6;
  const rawYear = isSixDigits ? digits.slice(0, 2) : digits.slice(0, 4);
  const rawMonth = isSixDigits ? digits.slice(2, 4) : digits.slice(4, 6);
  const rawDay = isSixDigits ? digits.slice(4, 6) : digits.slice(6, 8);

  if (!options?.format) {
    return [rawYear, rawMonth, rawDay].filter(Boolean).join('-');
  }

  let year = rawYear;
  const resultFormat = options.format;

  // 포맷이 요구하는 연도 자릿수에 맞춰 입력 연도를 확장하거나 줄인다.
  if (resultFormat.includes('YYYY') && year.length === 2) {
    year = expandYearToFourDigits(year);
  } else if (resultFormat.includes('YY') && !resultFormat.includes('YYYY') && year.length === 4) {
    year = year.slice(2, 4);
  }

  return resultFormat
    .replace('YYYY', year)
    .replace('YY', year.length === 4 ? year.slice(2, 4) : year)
    .replace('MM', rawMonth)
    .replace('DD', rawDay);
}

/**
 * 연월 입력값에서 숫자만 남기고 최대 6자리로 자른다.
 */
function normalizeNumericMonth(value?: string | null): string {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, MAX_MONTH_DIGITS);
}

/**
 * YYYYMM(6자리) 숫자 연월을 표시용 문자열로 변환한다.
 *
 * - 기본 출력은 `YYYY-MM`이다.
 * - `format`을 지정하면 `YYYY`, `MM` 토큰을 치환한다.
 * - `number`는 YYYYMM 숫자로 해석한다.
 * - 숫자 외 문자는 제거하고, 6자리를 넘는 입력은 잘라낸다.
 * - 값이 없으면 빈 문자열을 반환한다.
 * - 존재하는 연월인지는 검사하지 않는다.
 *
 * @example
 * ```ts
 * formatYm('202601'); // '2026-01'
 * formatYm(202601); // '2026-01'
 * formatYm('202601', { format: 'YYYY/MM' }); // '2026/01'
 * formatYm('2026'); // '2026'
 * ```
 */
export function formatYm(
  value?: number | string | null,
  options?: Pick<NumericDateFormatOptions, 'format'>,
): string {
  const digits = normalizeNumericMonth(value == null ? null : String(value));

  if (!digits) {
    return '';
  }

  const rawYear = digits.slice(0, 4);
  const rawMonth = digits.slice(4, 6);

  if (!options?.format) {
    return [rawYear, rawMonth].filter(Boolean).join('-');
  }

  return options.format.replace('YYYY', rawYear).replace('MM', rawMonth);
}

/**
 * 포맷 문자열이 요구하는 날짜 자릿수를 계산한다.
 *
 * @returns `YYYY`가 있으면 8, `YY`만 있으면 6, 판별할 수 없으면 `null`
 */
function getRequiredDateDigits(format?: string): 6 | 8 | null {
  if (!format) return null;
  if (format.includes('YYYY')) return 8;
  if (format.includes('YY')) return 6;
  return null;
}

/**
 * 숫자 날짜 입력이 완성 길이(6/8자리)에 도달했을 때만 포맷한다.
 * 입력 중인 값은 숫자 원문 그대로 돌려줘 타이핑을 방해하지 않는다.
 *
 * - `format`이 있으면 `format`이 요구하는 자릿수와 입력 길이가 같을 때만 포맷한다.
 * - `format`이 없거나 자릿수를 판별할 수 없으면 6자리/8자리에서만 기본 포맷을 적용한다.
 * - 값이 없으면 빈 문자열을 반환한다.
 *
 * @example
 * ```ts
 * formatNumericDateWhenComplete('19900101', { format: 'YYYY-MM-DD' }); // '1990-01-01'
 * formatNumericDateWhenComplete('199001', { format: 'YYYY-MM-DD' }); // '199001'
 * formatNumericDateWhenComplete('990101', { format: 'YY/MM/DD' }); // '99/01/01'
 * ```
 */
export function formatNumericDateWhenComplete(
  value?: string | null,
  options?: NumericDateFormatOptions,
): string {
  const digits = normalizeNumericDate(value);
  if (!digits) return '';

  const requiredDigits = getRequiredDateDigits(options?.format);

  if (requiredDigits) {
    if (digits.length !== requiredDigits) return digits;
    return formatYmd(digits, options);
  }

  if (digits.length === 6 || digits.length === 8) {
    return formatYmd(digits, options);
  }

  return digits;
}
