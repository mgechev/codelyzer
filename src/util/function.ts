export interface F0<R> {
  (): R;
}
export interface F1<A0, R> {
  (a0: A0): R;
}
export interface F2<A0, A1, R> {
  (a0: A0, a1: A1): R;
}
export interface F3<A0, A1, A2, R> {
  (a0: A0, a1: A1, a2: A2): R;
}

function nullOrUndef(t: any): t is null | undefined {
  return t === null || t === undefined;
}

export class Maybe<T> {
  static nothing = new Maybe(undefined);

  static lift<T>(t: T | undefined): Maybe<T> {
    return new Maybe<T>(nullOrUndef(t) ? undefined : t);
  }

  static all<T0, T1>(t0: Maybe<T0>, t1: Maybe<T1>): Maybe<[T0, T1] | undefined> {
    return t0.bind((_t0) => t1.fmap((_t1) => [_t0, _t1] as [T0, T1]));
  }

  private constructor(private readonly t: T | undefined) {}

  bind<R>(fn: F1<T, Maybe<R>>): Maybe<R | undefined> {
    return nullOrUndef(this.t) ? Maybe.nothing : fn(this.t);
  }

  fmap<R>(fn: F1<T, R>): Maybe<R | undefined> {
    return this.bind((t) => Maybe.lift(fn(t!)));
  }

  get isNothing(): boolean {
    return nullOrUndef(this.t);
  }

  get isSomething(): boolean {
    return !nullOrUndef(this.t);
  }

  catch(def: () => Maybe<T>): Maybe<T> {
    if (this.isNothing) {
      return def();
    }

    return this;
  }

  unwrap(): T | undefined {
    return this.t;
  }
}

export function unwrapFirst<T>(ts: Maybe<T>[]): T | undefined {
  const f = ts.find((t: Maybe<T>) => t.isSomething);
  if (f) {
    return f.unwrap();
  }
  return undefined;
}

export function all<T>(...preds: F1<T, boolean>[]): F1<T, boolean> {
  return (t: T | undefined) => !preds.find((p) => !p(t!));
}
export function any<T>(...preds: F1<T, boolean>[]): F1<T, boolean> {
  return (t: T | undefined) => !!preds.find((p) => p(t!));
}

export function ifTrue<T>(pred: F1<T, boolean>): F1<T, Maybe<T | undefined>> {
  return (t: T | undefined) => (pred(t!) ? Maybe.lift(t) : Maybe.nothing);
}

export function listToMaybe<T>(ms?: Maybe<T>[]): Maybe<(T | undefined)[]> | Maybe<undefined> {
  const unWrapped = (ms || []).filter((m) => m.isSomething).map((m) => m.unwrap());

  return unWrapped.length === 0 ? Maybe.nothing : Maybe.lift(unWrapped);
}
