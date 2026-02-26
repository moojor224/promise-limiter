import { ConcurrencyLimiter } from "./concur";
import { RateLimiter } from "./rate";
import type { Limiter, PromiseAction } from "./types";

/**
 * Class that combines the effects of both {@link ConcurrencyLimiter} and {@link RateLimiter}
 */
export class ConcurrencyRateLimiter implements Limiter {
    private rate: RateLimiter;
    private concur: ConcurrencyLimiter;
    constructor(concur: number, rate: number) {
        this.rate = new RateLimiter(rate);
        this.concur = new ConcurrencyLimiter(concur);
        // don't need to call this.start() because both other classes already do
    }
    start() {
        this.rate.start();
        this.concur.start();
    }
    run<T>(action: PromiseAction<T>): Promise<T> {
        // run through concurrency limit, then rate limit
        return this.concur.run(() => this.rate.run(action));
    }
    /** waits for the queue of both limiters to empty */
    async wait() {
        // wait for concurrency limit, then rate limit. this order MUST match the order in this.run<T>()
        await this.concur.wait();
        await this.rate.wait();
    }
    stop() {
        this.rate.stop();
        this.concur.stop();
    }
    /**
     * set the rate and concurrency limits
     * @param rate rate in promises per second
     * @param concur maximum number of concurrent promises
     */
    setRates(rate: number, concur: number) {
        this.rate.setRate(rate);
        this.concur.setLimit(concur);
    }
}
