import { Observable } from '../Observable';
import { ConnectableObservable } from '../observable/ConnectableObservable';
export declare function publish<T>(this: Observable<T>): ConnectableObservable<T>;
export declare function publish<T>(this: Observable<T>, selector: selector<T>): Observable<T>;
export declare type selector<T> = (source: Observable<T>) => Observable<T>;
