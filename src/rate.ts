import type { PromiseAction } from "./types";

export class RateLimiter {
    /** ms between promises */
    private rate: number;
    /** ms interval to check queue for unresolved promises */
    private interval: number;
    private workInterval: number = 0;
    /** unresolved promises */
    private queue: PromiseAction<any>[] = [];
    private last = 0;
    /**
     *
     * @param rate number of promises per second
     * @param interval ms interval to check queue for unresolved promises
     */
    constructor(rate: number, interval = 0) {
        this.rate = 1000 / rate;
        this.interval = interval;
        this.start();
    }
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
        this.workInterval = setInterval(() => this.doWork(), this.interval);
    }
    run<T>(action: PromiseAction<T>): Promise<T> {
        return new Promise<T>((resolve) => {
            this.queue.push(async function () {
                const result = await action();
                resolve(result);
            });
        });
    }
    stop() {
        clearInterval(this.workInterval);
    }
}
