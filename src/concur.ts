import type { Limiter, PromiseAction } from "./types";

/**
 * Class to limit the number of promises that can be active at once.
 *
 * Useful to prevent network bandwidth overloading
 */
export class ConcurrencyLimiter implements Limiter {
    /** max number of active promises */
    private concur: number;
    /** setInterval id */
    private workInterval: number = 0;
    /** current number of active promises */
    private active = 0;
    /** unresolved promises */
    private queue: PromiseAction<any>[] = [];
    /**
     * @param concur max number of concurrent promises
     */
    constructor(concur: number) {
        this.concur = concur;
        this.start();
    }
    /** check the queue for promises to execute */
    private async doWork() {
        if (this.active >= this.concur) return;
        const action = this.queue.shift();
        if (action) {
            this.active++;
            await action();
            this.active--;
        }
    }
    start() {
        clearInterval(this.workInterval);
        this.workInterval = setInterval(() => this.doWork());
    }
    run<T>(action: PromiseAction<T>): Promise<T> {
        return new Promise<T>((resolve) => {
            this.queue.push(async function () {
                const result = await action();
                resolve(result);
            });
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
        clearInterval(this.workInterval);
    }
    /**
     * update the maximum number of concurrent promises
     * @param rate max number of concurrent promises
     */
    setLimit(concur: number) {
        this.concur = concur;
    }
}
