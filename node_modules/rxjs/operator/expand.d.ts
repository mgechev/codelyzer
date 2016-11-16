import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
export declare function expand<T>(this: Observable<T>, project: (value: T, index: number) => Observable<T>, concurrent?: number, scheduler?: Scheduler): Observable<T>;
export declare function expand<T, R>(this: Observable<T>, project: (value: T, index: number) => Observable<R>, concurrent?: number, scheduler?: Scheduler): Observable<R>;
export declare class ExpandOperator<T, R> implements Operator<T, R> {
    private project;
    private concurrent;
    private scheduler;
    constructor(project: (value: T, index: number) => Observable<R>, concurrent: number, scheduler: Scheduler);
    call(subscriber: Subscriber<R>, source: any): any;
}
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export declare class ExpandSubscriber<T, R> extends OuterSubscriber<T, R> {
    private project;
    private concurrent;
    private scheduler;
    private index;
    private active;
    private hasCompleted;
    private buffer;
    constructor(destination: Subscriber<R>, project: (value: T, index: number) => Observable<R>, concurrent: number, scheduler: Scheduler);
    private static dispatch<T, R>(arg);
    protected _next(value: any): void;
    private subscribeToProjection(result, value, index);
    protected _complete(): void;
    notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number, innerSub: InnerSubscriber<T, R>): void;
    notifyComplete(innerSub: Subscription): void;
}
