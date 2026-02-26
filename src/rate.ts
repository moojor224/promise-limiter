import type { Limiter, PromiseAction } from "./types";

/**
 * Class to limit the number of promises that are run per second.
 */
export class RateLimiter implements Limiter {
    /** ms between promises */
    private rate: number;
    /** setInterval id */
    private workInterval: number = 0;
    /** timestamp of last promise execution */
    private last = 0;
    /** unresolved promises */
    private queue: PromiseAction<any>[] = [];
    /**
     * @param rate number of promises per second
     */
    constructor(rate: number) {
        this.rate = 1000 / rate;
        this.start();
    }
    /** check the queue for promises to execute */
    private async doWork() {
        const now = Date.now();
        if (now - this.last > this.rate) {
            const action = this.queue.shift();
            if (action) {
                this.last = now;
                await action();
            }
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
     * update the maximum promise rate per second
     * @param rate number of promises per second
     */
    setRate(rate: number) {
        this.rate = 1 / rate;
    }
}
