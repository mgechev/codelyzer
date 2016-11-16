import { Observable } from '../Observable';
export declare function toPromise<T>(this: Observable<T>): Promise<T>;
export declare function toPromise<T>(this: Observable<T>, PromiseCtor: typeof Promise): Promise<T>;
