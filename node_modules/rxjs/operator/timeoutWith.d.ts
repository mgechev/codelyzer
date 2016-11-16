import { Scheduler } from '../Scheduler';
import { Observable, ObservableInput } from '../Observable';
export declare function timeoutWith<T>(this: Observable<T>, due: number | Date, withObservable: ObservableInput<T>, scheduler?: Scheduler): Observable<T>;
export declare function timeoutWith<T, R>(this: Observable<T>, due: number | Date, withObservable: ObservableInput<R>, scheduler?: Scheduler): Observable<T | R>;
