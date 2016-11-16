import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
export declare function find<T, S extends T>(this: Observable<T>, predicate: ((value: T, index: number, source: Observable<T>) => boolean) | ((value: T, index: number, source: Observable<T>) => value is S), thisArg?: any): Observable<S>;
export declare class FindValueOperator<T> implements Operator<T, T> {
    private predicate;
    private source;
    private yieldIndex;
    private thisArg;
    constructor(predicate: (value: T, index: number, source: Observable<T>) => boolean, source: Observable<T>, yieldIndex: boolean, thisArg?: any);
    call(observer: Subscriber<T>, source: any): any;
}
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export declare class FindValueSubscriber<T> extends Subscriber<T> {
    private predicate;
    private source;
    private yieldIndex;
    private thisArg;
    private index;
    constructor(destination: Subscriber<T>, predicate: (value: T, index: number, source: Observable<T>) => boolean, source: Observable<T>, yieldIndex: boolean, thisArg?: any);
    private notifyComplete(value);
    protected _next(value: T): void;
    protected _complete(): void;
}
