/** the format to use when queueing a promise */
export type PromiseAction<T> = () => Promise<T>;
/** base schema for the 3 promise limiters */
export interface Limiter {
    /** start an interval to check for promises to execute */
    start(): void;
    /**
     * queue a promise to be run when the current limit is not exceeded
     * @example
     * ```javascript
     * limiter.run(() => fetch("https://example.com"));
     * limiter.run(async function () {
     *     return await fetch("https://example.com");
     * });
     * ```
     */
    run<T>(action: PromiseAction<T>): Promise<T>;
    /** waits for the queue to empty */
    wait(): Promise<void>;
    /** stop checking for promises to execute */
    stop(): void;
}
