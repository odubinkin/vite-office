/** @fileoverview Actual native Calc style-name conversion and static pool defaults in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
const nativeExports = [
  { module: "src/sc/source/core/data/docpool.ts", names: ["ScDocumentPool"] },
  { module: "src/sc/inc/stylehelper.ts", names: ["ScStyleNameConversion"] },
  { module: "src/svl/inc/style-values.ts", names: ["SfxStyleFamily"] },
  { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode", "text"] },
] as const;
/** Actual source exports in both realms. */
type Runtime = typeof import("../../src/sc/source/core/data/docpool") &
  typeof import("../../src/sc/inc/stylehelper") &
  typeof import("../../src/svl/inc/style-values") &
  typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
test("retains native style-name aliases and static page defaults in the DOM-free Worker", /** Executes actual source classes without a replacement model. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcStyleDefaultsFixture", nativeExports);
  const results = await page.evaluate(
    /** Executes identical real native operations in both environments. @returns Source observations. */ async () => {
      /** Reads actual source names and static defaults. @returns Initialized source results. */ function run() {
        const n = (globalThis as unknown as { CalcStyleDefaultsFixture: Runtime })
            .CalcStyleDefaultsFixture,
          pool = new n.ScDocumentPool(),
          other = new n.ScDocumentPool(),
          input = n.unicode("Heading1"),
          encoded = n.ScStyleNameConversion.DisplayToProgrammaticName(input, n.SfxStyleFamily.Para),
          decoded = n.ScStyleNameConversion.ProgrammaticToDisplayName(input, n.SfxStyleFamily.Para);
        try {
          return {
            names: [n.text(encoded), n.text(decoded)],
            range: [pool.GetFirstWhich(), pool.GetLastWhich()],
            shared: pool.GetPoolDefaultItem(176) === other.GetPoolDefaultItem(176),
            scale: [174, 175, 176].map(
              /** Reads actual unsigned defaults. @param id - Which. @returns Native value. */ (
                id,
              ) => pool.GetPoolDefaultItem(id).QueryValue(),
            ),
            tray: pool.GetPoolDefaultItem(159).QueryValue(),
            paper: pool.GetPoolDefaultItem(160).QueryValue(),
            richHeadersAvailable: pool.IsInRange(177),
          };
        } finally {
          input.dispose();
          encoded.dispose();
          decoded.dispose();
        }
      }
      const script = Array.from(document.scripts).find(
        /** Finds the actual installed source bundle. @param node - Script. @returns Kernel match. */ (
          node,
        ) => node.textContent?.includes(';globalThis["CalcStyleDefaultsFixture"]='),
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
    names: ["Heading1 (user)", "Heading 1"],
    range: [100, 176],
    shared: true,
    scale: [100, 1, 1],
    // Native SfxByteItem QueryValue transmits the signed8-bit representation of raw255.
    tray: -1,
    paper: { Width: 0, Height: 0 },
    richHeadersAvailable: false,
  };
  expect(results).toEqual({ main: expected, other: { result: expected, dom: "undefined" } });
});
