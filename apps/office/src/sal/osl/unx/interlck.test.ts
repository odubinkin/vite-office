/** @fileoverview Replays genuine OSL count/macro observations and complete concurrent adjusted returns through the actual shared native JS atomic owner. */
import { createHash } from "node:crypto";
import { Worker } from "node:worker_threads";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gunzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import {
  osl_incrementInterlockedCount,
  osl_decrementInterlockedCount,
  osl_atomic_increment,
  osl_atomic_decrement,
} from "../../inc/osl/interlck";
import native from "../../../cppu/source/typelib/native-type-primitives-cases.json";

/** Reconstructs every original native byte. @param corpus - Complete compressed capture. @returns Verified original output. */
function bytes(corpus: { gzipBase64: string; rawHash: string }): Buffer {
  const result = gunzipSync(Buffer.from(corpus.gzipBase64, "base64"));
  expect(createHash("sha256").update(result).digest("hex")).toBe(corpus.rawHash);
  return result;
}

/** Runs one real worker against the same addressed count and the actual source module. @param buffer - Shared original count/neighbor storage. @param direction - Native increment/decrement selection. @param calls - Complete per-worker calls. @returns All actual adjusted values after the worker exits. */
function workerValues(
  buffer: SharedArrayBuffer,
  direction: number,
  calls: number,
): Promise<Int32Array> {
  const module = pathToFileURL(
    resolve(dirname(fileURLToPath(import.meta.url)), "interlck.ts"),
  ).href;
  const code = `import { parentPort, workerData } from 'node:worker_threads';
import { osl_incrementInterlockedCount, osl_decrementInterlockedCount } from ${JSON.stringify(module)};
const pointer = new Int32Array(workerData.buffer, 4, 1);
const values = new Int32Array(workerData.calls);
const operation = workerData.direction > 0 ? osl_incrementInterlockedCount : osl_decrementInterlockedCount;
for(let i=0;i<values.length;i++) values[i]=operation(pointer);
parentPort.postMessage(values);`;
  return new Promise<Int32Array>(
    /** Retains real worker exit/error observations. @param resolve - Complete-return callback. @param reject - Failure callback. @returns Nothing. */ (
      resolve,
      reject,
    ) => {
      const worker = new Worker(new URL("data:text/javascript," + encodeURIComponent(code)), {
        workerData: { buffer, direction, calls },
      });
      let result: Int32Array | null = null;
      worker.once(
        "message",
        /** Saves every actual worker return. @param value - Complete return array. @returns Nothing. */ (
          value: Int32Array,
        ) => {
          result = value;
        },
      );
      worker.once("error", reject);
      worker.once(
        "exit",
        /** Requires authoritative terminal state before accepting results. @param status - Process exit code. @returns Nothing. */ (
          status,
        ) => {
          if (status === 0 && result !== null) resolve(result);
          else reject(new Error(`Atomic worker failed or omitted returns: ${status}`));
        },
      );
    },
  );
}

describe("original OSL adjusted count operations", /** Groups complete true native observations. @returns Nothing. */ () => {
  it("matches every native C and macro return and addressed storage including signed overflow", /** Replays all diagonal bit patterns and original boundary witnesses through offset views. @returns Nothing. */ () => {
    const expected = bytes(native.counts),
      actual = Buffer.alloc(expected.length);
    const inputs: number[] = [];
    for (let word = 0; word < 65536; word++) inputs.push((word << 16) | word);
    inputs.push(...native.counts.boundaries);
    expect(inputs.length).toBe(native.counts.count);
    expect(expected.length).toBe(inputs.length * native.counts.width * 4);
    let offset = 0;
    for (const initial of inputs) {
      const storage = new Int32Array([111, initial, 222]),
        pointer = storage.subarray(1, 2);
      for (const operation of [
        osl_incrementInterlockedCount,
        osl_decrementInterlockedCount,
        osl_atomic_increment,
        osl_atomic_decrement,
      ]) {
        storage[1] = initial;
        const value = operation(pointer);
        for (const observed of [value, storage[0], storage[1], storage[2]]) {
          actual.writeInt32LE(observed as number, offset);
          offset += 4;
        }
      }
    }
    expect(offset).toBe(actual.length);
    expect(actual.equals(expected)).toBe(true);
  });

  it("matches complete original concurrent returned values and neighboring storage", /** Executes actual core functions in real workers and compares all original sorted returns. @returns Completion after every worker exits. */ async () => {
    const expected = bytes(native.threads),
      actual = Buffer.alloc(expected.length);
    let offset = 0;
    for (const initial of native.threads.initials) {
      for (const direction of native.threads.directions) {
        const buffer = new SharedArrayBuffer(12),
          storage = new Int32Array(buffer);
        storage.set([111, initial, 222]);
        const pending: Promise<Int32Array>[] = [];
        for (let worker = 0; worker < native.threads.workers; worker++)
          pending.push(workerValues(buffer, direction, native.threads.calls));
        const outputs = await Promise.all(pending);
        const values = outputs.flatMap(
          /** Retains all worker values without summation or sampling. @param output - Complete worker observations. @returns Every return. */ (
            output,
          ) => [...output],
        );
        values.sort(
          /** Uses the original signed32 ascending observation order. @param first - First value. @param second - Second value. @returns Signed ordering. */ (
            first,
            second,
          ) => first - second,
        );
        expect(values.length).toBe(native.threads.workers * native.threads.calls);
        for (const value of [initial, storage[0], storage[1], storage[2], ...values]) {
          actual.writeInt32LE(value as number, offset);
          offset += 4;
        }
      }
    }
    expect(offset).toBe(actual.length);
    expect(actual.equals(expected)).toBe(true);
  }, 30000);
});
