import pLimit, { type LimitFunction } from "p-limit";
import { ConcurrencyLimiter } from "./concur";
import type { Limiter } from "./types";

function TS(id: number) {
    return async function () {
        // console.log(id);
        await new Promise((r) => {
            setTimeout(r, 1000);
        });
    };
}
async function testPLimit(limit: LimitFunction, expectedLength: number) {
    const start = Date.now();
    const promises: Promise<any>[] = [];
    for (let i = 0; i < 99; i++) {
        promises.push(limit(TS(i)));
    }
    await Promise.all(promises);
    const end = Date.now();
    const duration = end - start;
    // console.log("ran in " + duration + "ms. should be ~=", expectedLength);
    return duration;
}

async function test(limit: Limiter, expectedLength: number) {
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
        limit.run(TS(i));
    }
    await limit.wait();
    const end = Date.now();
    const duration = end - start;
    // console.log("ran in " + duration + "ms. should be ~=", expectedLength);
    limit.stop();
    return duration;
}

async function run() {
    const as: number[] = [];
    const bs: number[] = [];
    for (let i = 0; i < 1; i++) {
        // await test(new RateLimiter(2), 4500);
        let a = await Promise.all(new Array(100).fill(0).map((e) => test(new ConcurrencyLimiter(3), 3000)));
        let b = await Promise.all(new Array(100).fill(0).map((e) => testPLimit(pLimit(3), 3000)));
        // await test(new ConcurrencyRateLimiter(2, 1), 9000);
        let aavg = a.reduce((a, b) => a + b, 0) / a.length;
        let bavg = b.reduce((a, b) => a + b, 0) / b.length;
        console.log([aavg, bavg], (aavg - bavg).toFixed(2));
        as.push(aavg);
        bs.push(bavg);
    }
    console.log((as.reduce((a, b) => a + b, 0) / as.length).toFixed(2));
    console.log((bs.reduce((a, b) => a + b, 0) / bs.length).toFixed(2));
    throw new Error();
}
run();
