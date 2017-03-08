export function union<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...Array.from(a), ...Array.from(b)]);
}

export function intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set(Array.from(a).filter(t => b.has(t)));
}

export function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set(Array.from(a).filter(t => !b.has(t)));
}
