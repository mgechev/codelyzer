import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
/**
 * @param due
 * @param errorToSend
 * @param scheduler
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method timeout
 * @owner Observable
 */
export declare function timeout<T>(this: Observable<T>, due: number | Date, errorToSend?: any, scheduler?: Scheduler): Observable<T>;
