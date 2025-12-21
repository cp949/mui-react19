function escapeRegex(value: string) {
  return value.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&');
}

export function highlighter(
  value: string,
  _highlight: string | string[],
  option?: {
    ignorecase?: boolean;
  },
) {
  if (!_highlight || _highlight.length === 0) {
    return [{ chunk: value, highlighted: false }];
  }

  const ignorecase = option?.ignorecase ?? true;

  const highlight = Array.isArray(_highlight)
    ? _highlight.map(escapeRegex)
    : escapeRegex(_highlight);

  const shouldHighlight = Array.isArray(highlight)
    ? highlight.filter((part) => part.trim().length > 0).length > 0
    : highlight.trim() !== '';

  if (!shouldHighlight) {
    return [{ chunk: value, highlighted: false }];
  }

  const matcher =
    typeof highlight === 'string'
      ? highlight.trim()
      : highlight
          .filter((part) => part.trim().length !== 0)
          .map((part) => part.trim())
          .sort((a, b) => b.length - a.length)
          .join('|');

  const re = new RegExp(`(${matcher})`, ignorecase ? 'gi' : 'g');
  const chunks = value
    .split(re)
    .map((part) => ({ chunk: part, highlighted: re.test(part) }))
    .filter(({ chunk }) => chunk);

  return chunks;
}
