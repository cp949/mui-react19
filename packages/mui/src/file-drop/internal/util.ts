export function errmsg(err: unknown): string {
  if (typeof err === 'undefined' || err === null) return 'unknown';
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return String(err);
}
