/** @fileoverview Verifies actual pinned libxml2 semantics in Node and a real Chromium module Worker without a browser DOM. */
import { build } from "vite";
import { chromium } from "@playwright/test";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { runNativeXmlProbe } from "./fixtures/libxml2-worker-probe.mjs";
const nodeResult = await runNativeXmlProbe();
const built = await build({
  configFile: false,
  logLevel: "error",
  build: {
    write: false,
    minify: false,
    lib: {
      entry: resolve("scripts/fixtures/libxml2-worker-probe.mjs"),
      name: "NativeXMLProbe",
      formats: ["iife"],
    },
  },
});
const outputs = Array.isArray(built)
  ? built.flatMap(
      /** Retains all library build outputs. @param output - Build output. @returns Chunks. */ (
        output,
      ) => output.output,
    )
  : built.output;
const code = outputs.find(
  /** Selects actual emitted JavaScript. @param chunk - Build output. @returns Chunk predicate. */ (
    chunk,
  ) => chunk.type === "chunk",
).code;
const server = createServer(
  /** Supplies the same-origin browser test document. @param request - Actual request. @param response - Actual response. @returns Nothing. */ (
    request,
    response,
  ) => {
    void request;
    response.writeHead(200, { "content-type": "text/html" });
    response.end("<!doctype html><title>DOM Worker probe</title>");
  },
);
await new Promise(
  /** Starts a loopback-only fixture origin. @param resolve - Listening callback. @param reject - Error callback. @returns Nothing. */ (
    resolve,
    reject,
  ) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  },
);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  const result = await page.evaluate(
    /** Executes only in the real Chromium page. @param code - Bundled Worker program. @returns Worker result. */ (
      code,
    ) =>
      new Promise(
        /** Waits for the actual worker message or error. @param resolve - Result callback. @param reject - Error callback. @returns Nothing. */ (
          resolve,
          reject,
        ) => {
          const url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
          const worker = new Worker(url, { type: "module" });
          const timer = setTimeout(
            /** Rejects an actual worker deadline and releases resources. @returns Nothing. */ () => {
              worker.terminate();
              URL.revokeObjectURL(url);
              reject(new Error("DOM worker timed out"));
            },
            10000,
          );
          worker.onmessage =
            /** Receives the actual structured-clone result. @param root0 - Native message. @param root0.data - Result. @returns Nothing. */ ({
              data,
            }) => {
              clearTimeout(timer);
              worker.terminate();
              URL.revokeObjectURL(url);
              resolve(data);
            };
          worker.onerror =
            /** Propagates actual worker errors. @param event - Native worker error. @returns Nothing. */ (
              event,
            ) => {
              clearTimeout(timer);
              worker.terminate();
              URL.revokeObjectURL(url);
              reject(
                new Error(
                  JSON.stringify({
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                  }),
                ),
              );
            };
        },
      ),
    code,
  );
  assert.deepEqual(result, {
    version: "2.15.3",
    globals: { window: "undefined", document: "undefined", DOMParser: "undefined" },
    attributeTree: true,
    attributeContent: "changed & 字",
    textCoalescing: true,
    sharedNamespace: true,
    copiedContent: "ab",
    cloneDocNull: true,
    countedUtf16: true,
    heapGrowth: true,
    roundtrip: true,
    rejected: true,
    ioClosedOnce: true,
    byteCountMatches: true,
  });
  assert.deepEqual(nodeResult, result);
  await page.addScriptTag({ content: code });
  const mainResult = await page.evaluate(
    /** Executes the same actual native operations in the main browser realm. @returns Native observations. */
    () => globalThis.NativeXMLProbe.runNativeXmlProbe(),
  );
  assert.deepEqual(mainResult.globals, {
    window: "object",
    document: "object",
    DOMParser: "function",
  });
  assert.deepEqual({ ...mainResult, globals: nodeResult.globals }, nodeResult);
  await writeFile(
    "apps/office/coverage/libxml2-browser-probe-result.json",
    JSON.stringify(
      { package: "@vite-office/libxml2-wasm@2.15.3", nodeResult, result, mainResult },
      null,
      2,
    ) + "\n",
  );
  console.info(
    "PASS: pinned native libxml2 in Node, Chromium main realm and real Worker; attribute child tree, shared namespace pointers, text coalescing, clone ownership, IO serialization, roundtrip and malformed rejection",
  );
} finally {
  await browser.close();
  await new Promise(
    /** Releases the fixture origin. @param resolve - Closed callback. @returns Nothing. */ (
      resolve,
    ) => server.close(resolve),
  );
}
