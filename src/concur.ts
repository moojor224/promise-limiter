import type { Limiter, PromiseAction } from "./types";

/**
 * Class to limit the number of promises that can be active at once.
 *
 * Useful to prevent network bandwidth overloading
 */
export class ConcurrencyLimiter implements Limiter {
    /** max number of active promises */
    private concur: number;
    /** current number of active promises */
    private active = 0;
    /** unresolved promises */
    private queue: PromiseAction<any>[] = [];
    /** whether the limiter should doWork */
    private isActive = true;
    /**
     * @param concur max number of concurrent promises
     */
    constructor(concur: number) {
        this.concur = concur;
        this.start();
    }
    /** check the queue for promises to execute */
    private doWork() {
        if (!this.isActive) return;
        if (this.active >= this.concur || this.queue.length <= 0) return;
        this.active++;
        const queueItem = this.queue.shift()!;
        queueItem().finally(() => {
            this.active--;
            queueMicrotask(() => this.doWork());
        });
    }
    start() {
        this.isActive = true;
    }
    run<T>(action: PromiseAction<T>): Promise<T> {
        return new Promise<T>((resolve) => {
            this.queue.push(function () {
                return action().then(resolve);
            });
            this.doWork();
        });
    }
    wait() {
        return new Promise<void>((resolve) => {
            setInterval(() => {
                if (this.queue.length == 0) resolve();
            });
        });
    }
    stop() {
        this.isActive = false;
    }
    /**
     * update the maximum number of concurrent promises
     * @param rate max number of concurrent promises
     */
    setLimit(concur: number) {
        this.concur = concur;
    }
}
