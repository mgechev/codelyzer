import { toPromise } from '../../operator/toPromise';
declare module '../../Observable' {
    interface Observable<T> {
        toPromise: typeof toPromise;
    }
}
