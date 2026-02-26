import { ConcurrencyLimiter, ConcurrencyRateLimiter, RateLimiter } from "./index";
import type { Limiter } from "./types";

function TS(id: number) {
    return async function () {
        console.log(id);
        await new Promise((r) => {
            setTimeout(r, 1000);
        });
    };
}

async function test(limit: Limiter, expectedLength: number) {
    const start = Date.now();
    for (let i = 0; i < 10; i++) {
        limit.run(TS(i));
    }
    await limit.wait();
    const end = Date.now();
    console.log("ran in " + (end - start) + "ms. should be ~=", expectedLength);
    limit.stop();
}

async function run() {
    await test(new RateLimiter(2), 4500);
    await test(new ConcurrencyLimiter(3), 3000);
    await test(new ConcurrencyRateLimiter(2, 1), 9000);
}
run();
