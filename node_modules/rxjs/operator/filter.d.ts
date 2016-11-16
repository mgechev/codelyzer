import { Observable } from '../Observable';
export declare function filter<T, S extends T>(this: Observable<T>, predicate: ((value: T, index: number) => boolean) | ((value: T, index: number) => value is S), thisArg?: any): Observable<S>;
