/** @fileoverview Bundles the selected JS XML DOM backend and verifies real Chromium Worker behavior, metadata preservation and malformed XML rejection. */
import { build } from "vite";
import { chromium } from "@playwright/test";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { createServer } from "node:http";
const built = await build({
  configFile: false,
  logLevel: "error",
  build: {
    write: false,
    minify: false,
    lib: {
      entry: resolve("scripts/fixtures/xmldom-worker-probe.mjs"),
      name: "DOMProbe",
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
    initiallyEmpty: true,
    replaced: true,
    namespaceAttribute: "changed & 字",
    errors: [],
    globals: { window: "undefined", document: "undefined", DOMParser: "undefined" },
    generator: "Changed 字 & < >",
    unknown: 1,
    flag: "a&b",
    cdata: 4,
    comment: 8,
    pi: true,
    imported: true,
    rejected: true,
  });
  await writeFile(
    "apps/office/coverage/xmldom-browser-probe-result.json",
    JSON.stringify({ package: "@xmldom/xmldom@0.9.12", result }, null, 2) + "\n",
  );
  console.info(
    "PASS: real Chromium Worker; no window/document/native DOMParser; namespace edit, unknown nodes, CDATA/comment/PI, importNode, XML roundtrip, malformed rejection",
  );
} finally {
  await browser.close();
  await new Promise(
    /** Releases the fixture origin. @param resolve - Closed callback. @returns Nothing. */ (
      resolve,
    ) => server.close(resolve),
  );
}
