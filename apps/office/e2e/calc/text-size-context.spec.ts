/** @fileoverview Actual native Calc size-context and script-service/cache ownership in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
const nativeExports = [
  {
    module: "src/i18npool/source/breakiterator/breakiteratorImpl.ts",
    names: ["BreakIteratorImpl"],
  },
  { module: "src/sc/inc/document.ts", names: ["ScDocument"] },
  { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
  { module: "src/sc/inc/rowheightcontext.ts", names: ["RowHeightContext"] },
  { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode"] },
] as const;
/** Genuine repository source exports used in both realms. */
type Runtime = typeof import("../../src/i18npool/source/breakiterator/breakiteratorImpl") &
  typeof import("../../src/sc/inc/document") &
  typeof import("../../src/sc/inc/address") &
  typeof import("../../src/sc/inc/rowheightcontext") &
  typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
test("keeps native text-size and script boundaries independent of DOM in the real Worker", /** Executes actual source classes without a replacement model. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcTextSizeFixture", nativeExports);
  const results = await page.evaluate(
    /** Executes identical real native operations in both environments. @returns Source observations. */ async () => {
      /** Reads original context values and document-owned service/cache fields. @returns Initialized source results. */ function run() {
        const n = (globalThis as unknown as { CalcTextSizeFixture: Runtime }).CalcTextSizeFixture,
          d = new n.ScDocument(),
          name = n.unicode("Native"),
          text = n.unicode("A中文عربي"),
          context = new n.RowHeightContext(10, 1 / 15, 1 / 12, 1.25, 0.75, null),
          pos = new n.ScAddress();
        try {
          d.InsertTab(0, name);
          const missing = d.GetScriptType(pos);
          d.SetValue(pos, 12);
          const unknown = d.GetScriptType(pos);
          d.SetScriptType(pos, 2);
          const set = d.GetScriptType(pos);
          d.SetValue(pos, 13);
          const reset = d.GetScriptType(pos),
            service = d.GetBreakIterator(
              /** Supplies the actual host backend. @returns Real script service. */ () =>
                new n.BreakIteratorImpl(),
            );
          context.setExtraHeight(65539);
          context.setForceAutoSize(true);
          context.getHeightArray().SetValue(2, 4, 321);
          return {
            scales: [context.getPPTX(), context.getPPTY(), context.getZoomX(), context.getZoomY()],
            device: context.getOutputDevice(),
            extra: context.getExtraHeight(),
            force: context.isForceAutoSize(),
            height: context.getHeightArray().GetValue(3),
            scripts: d.GetStringScriptType(text),
            serviceStable: d.GetBreakIterator() === service,
            cache: [missing, unknown, set, reset],
          };
        } finally {
          name.dispose();
          text.dispose();
          d.DisposeAttributes();
        }
      }
      const script = Array.from(document.scripts).find(
        /** Finds the actual installed source bundle. @param node - Script. @returns Kernel match. */ (
          node,
        ) => node.textContent?.includes(';globalThis["CalcTextSizeFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing source bundle");
      const url = URL.createObjectURL(
          new Blob(
            [
              script,
              "\nonmessage=()=>postMessage({result:(",
              run.toString(),
              ")(),dom:typeof document});",
            ],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = new Promise(
          /** Observes genuine Worker output and failures. @param resolve - Completion. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Publishes source observations. @param event - Worker message. @returns Nothing. */ (
                event,
              ) => {
                resolve(event.data);
              };
            worker.onerror =
              /** Propagates actual failures. @param event - Error event. @returns Nothing. */ (
                event,
              ) => {
                reject(Error(event.message));
              };
          },
        );
        worker.postMessage(null);
        return { main: run(), other: await other };
      } finally {
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    },
  );
  const expected = {
    scales: [1 / 15, 1 / 12, 1.25, 0.75],
    device: null,
    extra: 3,
    force: true,
    height: 321,
    scripts: 7,
    serviceStable: true,
    cache: [0, 8, 2, 8],
  };
  expect(results).toEqual({ main: expected, other: { result: expected, dom: "undefined" } });
});
