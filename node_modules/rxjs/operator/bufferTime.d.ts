import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
export declare function bufferTime<T>(this: Observable<T>, bufferTimeSpan: number, scheduler?: Scheduler): Observable<T[]>;
export declare function bufferTime<T>(this: Observable<T>, bufferTimeSpan: number, bufferCreationInterval: number, scheduler?: Scheduler): Observable<T[]>;
export declare function bufferTime<T>(this: Observable<T>, bufferTimeSpan: number, bufferCreationInterval: number, maxBufferSize: number, scheduler?: Scheduler): Observable<T[]>;
