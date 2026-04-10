/**
 * 기본 props 객체와 여러 오버라이드 props 객체를 병합하여 하나의 새로운 객체를 반환합니다.
 *
 * - `overrides`에 전달된 값들 중 `undefined`는 무시됩니다.
 * - 반환된 객체의 모든 프로퍼티에서 `undefined`가 제거됩니다.
 *
 * @template T - 기본 props 타입
 * @template R - 오버라이드할 props 타입 배열
 *
 * @param targetProps - 병합의 기준이 되는 기본 props 객체
 * @param overrides - 병합할 여러 오버라이드 props 객체 (가변인자)
 * @returns 병합된 새로운 객체로, `undefined` 값이 제거된 상태로 반환됩니다.
 *
 * @example
 * ```typescript
 * const defaultProps = {
 *   label: "기본값",
 *   onClick: () => console.log("기본 클릭"),
 * };
 *
 * const override1 = {
 *   label: "오버라이드 1",
 *   onClick: undefined, // undefined는 무시
 * };
 *
 * const override2 = {
 *   style: { color: "red" },
 * };
 *
 * const finalProps = overrideProps(defaultProps, override1, override2);
 *
 * // 결과:
 * // {
 * //   label: "오버라이드 1",
 * //   onClick: () => console.log("기본 클릭"), // 기본값 유지
 * //   style: { color: "red" }
 * // }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function overrideProps<T extends Record<string, any>, R extends Record<string, any>[]>(
  targetProps: T,
  ...overrides: R
): { [K in keyof (T & R[number])]: Exclude<(T & R[number])[K], undefined> } {
  // 기본 props를 필터링
  const filteredTargetProps = Object.fromEntries(
    Object.entries(targetProps).filter(([_, value]) => value !== undefined),
  );

  // 모든 overrides를 순차적으로 병합
  const filteredOverrides = overrides.reduce<Record<string, unknown>>((acc, current) => {
    const filteredCurrent = Object.fromEntries(
      Object.entries(current).filter(([_, value]) => value !== undefined),
    );
    Object.assign(acc, filteredCurrent);
    return acc;
  }, {});

  // 최종 병합된 결과 반환
  return {
    ...filteredTargetProps,
    ...filteredOverrides,
  } as { [K in keyof (T & R[number])]: Exclude<(T & R[number])[K], undefined> };
}
