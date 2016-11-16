import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
/**
 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from previous items.
 * If a keySelector function is provided, then it will project each value from the source observable into a new value that it will
 * check for equality with previously projected values. If a keySelector function is not provided, it will use each value from the
 * source observable directly with an equality check against previous values.
 * In JavaScript runtimes that support `Set`, this operator will use a `Set` to improve performance of the distinct value checking.
 * In other runtimes, this operator will use a minimal implementation of `Set` that relies on an `Array` and `indexOf` under the
 * hood, so performance will degrade as more values are checked for distinction. Even in newer browsers, a long-running `distinct`
 * use might result in memory leaks. To help alleviate this in some scenarios, an optional `flushes` parameter is also provided so
 * that the internal `Set` can be "flushed", basically clearing it of values.
 * @param {function} [keySelector] optional function to select which value you want to check as distinct.
 * @param {Observable} [flushes] optional Observable for flushing the internal HashSet of the operator.
 * @return {Observable} an Observable that emits items from the source Observable with distinct values.
 * @method distinct
 * @owner Observable
 */
export declare function distinct<T, K>(this: Observable<T>, keySelector?: (value: T) => K, flushes?: Observable<any>): Observable<T>;
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export declare class DistinctSubscriber<T, K> extends OuterSubscriber<T, T> {
    private keySelector;
    private values;
    constructor(destination: Subscriber<T>, keySelector: (value: T) => K, flushes: Observable<any>);
    notifyNext(outerValue: T, innerValue: T, outerIndex: number, innerIndex: number, innerSub: InnerSubscriber<T, T>): void;
    notifyError(error: any, innerSub: InnerSubscriber<T, T>): void;
    protected _next(value: T): void;
    private _useKeySelector(value);
    private _finalizeNext(key, value);
}
