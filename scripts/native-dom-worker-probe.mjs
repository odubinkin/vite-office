/** @fileoverview Qualifies actual native UNO document/parser/IO/event-list behavior in a Chromium module Worker with no DOM globals, and in the browser main realm. */
import { build } from "vite";
import { chromium } from "@playwright/test";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import assert from "node:assert/strict";

const built = await build({
  configFile: false,
  logLevel: "error",
  build: {
    write: false,
    minify: false,
    lib: {
      entry: resolve("scripts/fixtures/native-dom-worker-probe.ts"),
      name: "NativeDomProbe",
      formats: ["iife"],
    },
  },
});
const outputs = Array.isArray(built)
  ? built.flatMap(
      /** Collects actual bundle chunks. @param output - Build result. @returns Chunks. */ (
        output,
      ) => output.output,
    )
  : built.output;
const code = outputs.find(
  /** Selects the real emitted entry chunk. @param chunk - Build chunk. @returns Entry predicate. */ (
    chunk,
  ) => chunk.type === "chunk",
).code;
const server = createServer(
  /** Supplies the same-origin fixture only. @param request - Request. @param response - Response. @returns Nothing. */ (
    request,
    response,
  ) => {
    void request;
    response.writeHead(200, { "content-type": "text/html" });
    response.end("<!doctype html><title>Native DOM worker qualification</title>");
  },
);
await new Promise(
  /** Binds only the loopback fixture origin. @param resolve - Listening callback. @param reject - Failure callback. @returns Nothing. */ (
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
  const workerResult = await page.evaluate(
    /** Runs the actual bundled graph in a genuine module Worker. @param code - Emitted source. @returns Worker result. */ (
      code,
    ) =>
      new Promise(
        /** Waits for the structured-clone-only result. @param resolve - Result callback. @param reject - Failure callback. @returns Nothing. */ (
          resolve,
          reject,
        ) => {
          const program =
              code +
              "\nNativeDomProbe.runNativeDomWorkerProbe().then(value => postMessage({ok:true,value}), error => postMessage({ok:false,message:String(error),stack:error?.stack}));",
            url = URL.createObjectURL(new Blob([program], { type: "text/javascript" })),
            worker = new Worker(url, { type: "module" });
          /** Releases the actual Worker and object URL. @returns Nothing. */
          function close() {
            worker.terminate();
            URL.revokeObjectURL(url);
          }
          const timer = setTimeout(
            /** Reports a real fixture deadline. @returns Nothing. */ () => {
              close();
              reject(new Error("Native DOM worker timed out"));
            },
            20000,
          );
          worker.onmessage =
            /** Receives only public scalar observations. @param event - Native message. @returns Nothing. */ (
              event,
            ) => {
              clearTimeout(timer);
              close();
              if (event.data.ok) resolve(event.data.value);
              else reject(new Error(event.data.message + "\n" + event.data.stack));
            };
          worker.onerror =
            /** Propagates actual Worker errors. @param event - Native error. @returns Nothing. */ (
              event,
            ) => {
              clearTimeout(timer);
              close();
              reject(new Error(event.message));
            };
        },
      ),
    code,
  );
  const expected = {
    conversion: {
      serviceValue: 42,
      rowValue: 42,
      rowWasNull: false,
      failedFirst: 0,
      failedFirstWasNull: false,
      failedSecond: 0,
      failedSecondWasNull: true,
    },
    nativePropertyControl: {
      value: 42,
      storedLong: true,
      notifications: 1,
      notifiedTypeLong: false,
      notifiedValue: 42,
      notifiedOld: 41,
      sameSource: true,
      state: 0,
      initialStates: [1, 0],
      typeCount: 7,
    },
    nativeAnyFields: { value: 43, initialDefault: 41, liveType: true, interfaceIdentity: true },
    legacyListeners: { remaining: 1, sameFirst: true, sameSnapshot: true, keyCount: 1, key: -7 },
    propertyArray: {
      count: 1,
      handle: 7,
      missing: -1,
      snapshotName: "workerValue",
      sameInfoIdentity: true,
    },
    dynamicProperties: {
      changed: true,
      value: 42,
      initialDefault: 41,
      name: "workerValue",
      handle: 7,
      declaredLong: true,
      stableTypeField: true,
    },
    publicHelpers: { notifications: 1, sameEventSource: true, componentTypeCount: 3 },
    xpath: { count: 1, listLength: 1, sameRoot: true },
    documentBuilder: {
      rootName: "document-content",
      streamOpen: true,
      namespaceAware: true,
      validating: false,
      emptyImplementation: true,
      capturedType: true,
      sameContext: true,
      exceptionMessage: "worker exception",
    },
    globals: { window: "undefined", document: "undefined", DOMParser: "undefined" },
    rootName: "document-content",
    attribute: "1.0",
    listCounts: [0, 1, 0],
    sameOwner: true,
    unicode: "😀字",
    utf16Length: 3,
    borrowedStreamOpen: true,
    warnings: 1,
    errors: 0,
    warningLine: 1,
  };
  assert.deepEqual(workerResult, expected);
  await page.addScriptTag({ content: code });
  const mainResult = await page.evaluate(
    /** Repeats the genuine native graph in the browser main realm. @returns Native observations. */ () =>
      globalThis.NativeDomProbe.runNativeDomWorkerProbe(),
  );
  assert.deepEqual(mainResult, {
    ...expected,
    globals: { window: "object", document: "object", DOMParser: "function" },
  });
  await writeFile(
    "apps/office/coverage/native-dom-worker-result.json",
    JSON.stringify({ workerResult, mainResult }, null, 2) + "\n",
  );
  console.info(
    "PASS: native dynamic properties and Type field transport, public comphelper lifecycle, registered XPathAPI/DocumentBuilder and JavaScript UNO exception ABI, registered Converter/PropertyValueSet, actual UNO DOM, C SAX callbacks, typed parser diagnostics, native stream IO, live mutation lists and Unicode in Chromium main realm and DOM-free module Worker",
  );
} finally {
  await browser.close();
  await new Promise(
    /** Releases the fixture origin. @param resolve - Close callback. @returns Nothing. */ (
      resolve,
    ) => server.close(resolve),
  );
}
