import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
export declare function reduce<T>(this: Observable<T>, accumulator: (acc: T, value: T, index: number) => T, seed?: T): Observable<T>;
export declare function reduce<T>(this: Observable<T>, accumulator: (acc: T[], value: T, index: number) => T[], seed?: T[]): Observable<T[]>;
export declare function reduce<T, R>(this: Observable<T>, accumulator: (acc: R, value: T, index: number) => R, seed?: R): Observable<R>;
export declare class ReduceOperator<T, R> implements Operator<T, R> {
    private accumulator;
    private seed;
    private hasSeed;
    constructor(accumulator: (acc: R, value: T) => R, seed?: R, hasSeed?: boolean);
    call(subscriber: Subscriber<R>, source: any): any;
}
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export declare class ReduceSubscriber<T, R> extends Subscriber<T> {
    private accumulator;
    private hasSeed;
    acc: T | R;
    hasValue: boolean;
    constructor(destination: Subscriber<R>, accumulator: (acc: R, value: T) => R, seed: R, hasSeed: boolean);
    protected _next(value: T): void;
    private _tryReduce(value);
    protected _complete(): void;
}
