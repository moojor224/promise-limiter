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
    private useTimeouts = false;
    /**
     * @param concur max number of concurrent promises
     * @param useTimeouts use `setTimeout` instead of `queueMicrotask` to run next promise when one finishes.\
     * set to true if data needs to be shown in the DOM when a promise finishes
     */
    constructor(concur: number, useTimeouts: boolean = false) {
        this.concur = concur;
        this.useTimeouts = useTimeouts;
        this.start();
    }
    /** check the queue for promises to execute */
    private async doWork() {
        if (!this.isActive) return;
        if ((this.active >= this.concur && this.concur > 0) || this.queue.length <= 0) return;
        this.active++;
        const queueItem = this.queue.shift()!;
        queueItem().finally(() => {
            this.active--;
            if (this.useTimeouts) setTimeout(() => this.doWork());
            else queueMicrotask(() => this.doWork());
        });
    }
    start() {
        this.isActive = true;
    }
    async run<T>(action: PromiseAction<T>): Promise<T> {
        return await new Promise<T>((resolve) => {
            this.queue.push(function () {
                return action().then(resolve);
            });
            this.doWork();
        });
    }
    wait() {
        return new Promise<void>((resolve) => {
            let i = setInterval(() => {
                if (this.queue.length == 0) {
                    clearInterval(i);
                    resolve();
                }
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
