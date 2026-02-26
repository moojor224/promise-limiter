import { ConcurrencyLimiter } from "./concur";
import { RateLimiter } from "./rate";

async function TS() {
    console.log(Date.now());
}

async function testRate() {
    const start = Date.now();
    const rateLimit = new RateLimiter(2);

    for (let i = 0; i < 10; i++) {
        await rateLimit.run(TS);
    }
    const end = Date.now();
    console.log("ran in " + (end - start) + "ms");
}
testRate();

async function testConcur() {
    const start = Date.now();
    const limit = new ConcurrencyLimiter(1);

    for (let i = 0; i < 100; i++) {
        await limit.run(TS);
    }
    const end = Date.now();
    console.log("ran in " + (end - start) + "ms");
}
// testConcur();
