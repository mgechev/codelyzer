import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { Observable } from '../Observable';
import { Subject } from '../Subject';
export declare function groupBy<T, K>(this: Observable<T>, keySelector: (value: T) => K): Observable<GroupedObservable<K, T>>;
export declare function groupBy<T, K>(this: Observable<T>, keySelector: (value: T) => K, elementSelector: void, durationSelector: (grouped: GroupedObservable<K, T>) => Observable<any>): Observable<GroupedObservable<K, T>>;
export declare function groupBy<T, K, R>(this: Observable<T>, keySelector: (value: T) => K, elementSelector?: (value: T) => R, durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>): Observable<GroupedObservable<K, R>>;
export declare function groupBy<T, K, R>(this: Observable<T>, keySelector: (value: T) => K, elementSelector?: (value: T) => R, durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>, subjectSelector?: () => Subject<R>): Observable<GroupedObservable<K, R>>;
export interface RefCountSubscription {
    count: number;
    unsubscribe: () => void;
    closed: boolean;
    attemptedToUnsubscribe: boolean;
}
/**
 * An Observable representing values belonging to the same group represented by
 * a common key. The values emitted by a GroupedObservable come from the source
 * Observable. The common key is available as the field `key` on a
 * GroupedObservable instance.
 *
 * @class GroupedObservable<K, T>
 */
export declare class GroupedObservable<K, T> extends Observable<T> {
    key: K;
    private groupSubject;
    private refCountSubscription;
    constructor(key: K, groupSubject: Subject<T>, refCountSubscription?: RefCountSubscription);
    protected _subscribe(subscriber: Subscriber<T>): Subscription;
}
