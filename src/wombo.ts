import { ConcurrencyLimiter } from "./concur";
import { RateLimiter } from "./rate";
import type { PromiseAction } from "./types";

export class ConcurrencyRateLimiter {
    private rate: RateLimiter;
    private concur: ConcurrencyLimiter;
    constructor(rate: number, concur: number, rateInterval: number, concurInterval = rateInterval) {
        this.rate = new RateLimiter(rate, rateInterval);
        this.concur = new ConcurrencyLimiter(concur, concurInterval);
    }
    async run<T>(action: PromiseAction<T>): Promise<T> {
        return this.rate.run(() => this.concur.run(action));
    }
}
