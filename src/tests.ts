import process from "node:process";
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

const taskConcur = 5; // run X tasks at once
const taskCount = 20; // this many times

async function testPLimit(limit: LimitFunction, expectedLength: number) {
    const start = Date.now();
    const promises: Promise<any>[] = [];
    for (let i = 0; i < taskCount * taskConcur; i++) {
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
    for (let i = 0; i < taskCount * taskConcur + 1; i++) {
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
    for (let i = 0; i < 10; i++) {
        // run 10 rounds of tests
        // run 5 limiters at the same time
        let a = await Promise.all(new Array(5).fill(0).map((e) => test(new ConcurrencyLimiter(taskConcur), 3000)));
        let b = await Promise.all(new Array(5).fill(0).map((e) => testPLimit(pLimit(taskConcur), 3000)));

        // await test(new ConcurrencyRateLimiter(2, 1), 9000);
        let aavg = a.reduce((a, b) => a + b, 0) / a.length;
        let bavg = b.reduce((a, b) => a + b, 0) / b.length;
        console.log([aavg, bavg], (aavg - bavg).toFixed(2));
        as.push(aavg);
        bs.push(bavg);
    }
    const tas = as.reduce((a, b) => a + b, 0) / as.length;
    const tbs = bs.reduce((a, b) => a + b, 0) / bs.length;
    console.log(tas.toFixed(2));
    console.log(tbs.toFixed(2));
    console.log((tas - tbs).toFixed(2));
    process.exit(0);
}
run();
