
export interface F0<R> {
    ():R;
}
export interface F1<A0, R> {
    (a0: A0):R;
}
export interface F2<A0, A1, R> {
    (a0: A0, a1: A1):R;
}
export interface F3<A0, A1, A2, R> {
    (a0: A0, a1: A1, a2: A2):R;
}

export class Maybe<T> {

    static nothing = new Maybe<any>(undefined);
    static lift<T>(t: T) {
        if (!t) {
            return Maybe.nothing;
        }
        return new Maybe<T>(t);
    }

        bind<R>(fn: F1<T, Maybe<R>>):Maybe<R> {
        if (!!this.t) {
            return fn(this.t);
        }
        return Maybe.nothing;
    }

    fmap<R>(fn: F1<T, R>):Maybe<R> {
        return this.bind(t => Maybe.lift(fn(t)));
    }

    get isNothing() {
        return !this.t;
    }

    get isSomething() {
        return !!this.t;
    }

    catch(def: () => Maybe<T>):Maybe<T> {
        if (this.isNothing) {
            return def();
        }
        return this;
    }

    unwrap():T | undefined {
        return this.t;
    };

    private constructor(private t: T | undefined) { }
}

export function unwrapFirst<T>(ts: Maybe<T>[]):T|undefined {
    const f = ts.find((t: Maybe<T>) => t.isSomething);
    if (!!f) {
        return f.unwrap();
    }
    return undefined;
}

export function all<T>(...preds: F1<T, boolean>[]): F1<T, boolean> {
    return (t: T) => !preds.find(p => !p(t));
}
export function any<T>(...preds: F1<T, boolean>[]): F1<T, boolean> {
    return (t: T) => !!preds.find(p => p(t));
}

export function ifTrue<T>(pred: F1<T, boolean>): F1<T, Maybe<T>> {
    return (t: T) => (pred(t)) ? Maybe.lift(t) : Maybe.nothing;
}

