export function isNil<T>(v: T | null | undefined): v is null | undefined {
  return typeof v === 'undefined' || v === null;
}

export function isNotNil<T>(v: T | null | undefined): v is T {
  return !isNil(v);
}

export function isEmptyObject(value: object) {
  for (const _ in value) {
    return false;
  }
  return true;
}
