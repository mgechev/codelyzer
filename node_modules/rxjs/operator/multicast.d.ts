import { Subject } from '../Subject';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { ConnectableObservable } from '../observable/ConnectableObservable';
export declare function multicast<T>(this: Observable<T>, subjectOrSubjectFactory: factoryOrValue<Subject<T>>): ConnectableObservable<T>;
export declare function multicast<T>(SubjectFactory: (this: Observable<T>) => Subject<T>, selector?: selector<T>): Observable<T>;
export declare type factoryOrValue<T> = T | (() => T);
export declare type selector<T> = (source: Observable<T>) => Observable<T>;
export declare class MulticastOperator<T> implements Operator<T, T> {
    private subjectFactory;
    private selector;
    constructor(subjectFactory: () => Subject<T>, selector: (source: Observable<T>) => Observable<T>);
    call(subscriber: Subscriber<T>, source: any): any;
}
