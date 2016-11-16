import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
import { ConnectableObservable } from '../observable/ConnectableObservable';
/**
 * @param bufferSize
 * @param windowTime
 * @param scheduler
 * @return {ConnectableObservable<T>}
 * @method publishReplay
 * @owner Observable
 */
export declare function publishReplay<T>(this: Observable<T>, bufferSize?: number, windowTime?: number, scheduler?: Scheduler): ConnectableObservable<T>;
