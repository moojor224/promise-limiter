import type { PromiseAction } from "./types";

/**
 * Class to limit the number of promises that can be active at once.
 *
 * Useful to prevent network bandwidth overloading
 *
 * Promises don't necessarily resolve in the same order that they are initially called
 */
export class ConcurrencyLimiter {
    private concur: number;
    private interval: number;
    private workInterval: number = 0;
    private active = 0;
    private queue: PromiseAction<any>[] = [];
    constructor(concur: number, interval: number = 0) {
        this.concur = concur;
        this.interval = interval;
        this.start();
    }
    private async doWork() {
        if (this.active > this.concur) return;
        const action = this.queue.shift();
        if (action) {
            this.active++;
            await action();
            this.active--;
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
    setLimit(concur: number) {
        this.concur = concur;
    }
}
