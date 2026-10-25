/** @fileoverview Real native post-paste merge refresh in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
/** Actual compiled kernel exports. */
type Fixture = typeof import("../../src/sc/inc/document") &
  typeof import("../../src/sc/inc/scitems") &
  typeof import("../../src/sc/inc/address") &
  typeof import("../../src/sc/inc/attrib") &
  typeof import("../../src/sc/inc/patattr") &
  typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
test("refreshes actual merge geometry and filter flags in browser and Worker", /** Both runtimes run identical source owners. @param fixtures - Real page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "CalcPasteBlockFixture", [
    { module: "src/sc/inc/document.ts", names: ["ScDocument"] },
    { module: "src/sc/inc/scitems.ts", names: ["ATTR_MERGE_FLAG"] },
    { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
    { module: "src/sc/inc/attrib.ts", names: ["ScMergeAttr", "ScMF"] },
    { module: "src/sc/inc/patattr.ts", names: ["ScPatternAttr"] },
    { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode"] },
  ]);
  const result = await page.evaluate(
    /** Exercises real document ownership without any DOM calls. @returns Observations. */ async () => {
      /** Runs native refresh and examines canonical flag values. @returns Geometry and flags. */ async function run() {
        const n = (globalThis as unknown as { CalcPasteBlockFixture: Fixture })
          .CalcPasteBlockFixture;
        const doc = new n.ScDocument();
        doc.InsertTab(0, n.unicode("Data"));
        const pattern = new n.ScPatternAttr(doc.getCellAttributeHelper());
        pattern.ItemSetPut(new n.ScMergeAttr(3, 2));
        doc.ApplyPattern(1, 1, 0, pattern);
        doc.ApplyFlagsTab(1, 1, 3, 2, 0, n.ScMF.Auto);
        const col: [number] = [1],
          row: [number] = [1];
        const found = doc.ExtendMerge(1, 1, col, row, 0, true);
        const values = [
          [1, 1],
          [2, 1],
          [1, 2],
          [3, 2],
        ].map(
          /** Reads actual pooled attributes. @param position - Cell. @returns Native flags. */ ([
            x,
            y,
          ]) => {
            const attr = doc.GetPattern(new n.ScAddress(x as number, y as number, 0));
            if (!attr) throw Error("Missing real pattern");
            return (
              attr.GetItem(n.ATTR_MERGE_FLAG) as import("../../src/sc/inc/attrib").ScMergeFlagAttr
            ).GetValue();
          },
        );
        const unchanged = doc.RefreshAutoFilter(1, 1, 3, 2, 0);
        pattern.Dispose();
        doc.Dispose();
        return { found, extent: [col[0], row[0]], values, unchanged };
      }
      const script = Array.from(document.scripts).find(
        /** Locates compiled actual owners. @param item - Script. @returns Match. */ (item) =>
          item.textContent?.includes(';globalThis["CalcPasteBlockFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing actual native bundle");
      const url = URL.createObjectURL(
        new Blob(
          [
            script,
            "\n(",
            run.toString(),
            ")().then(value=>postMessage({value,dom:typeof document}),error=>postMessage({error:String(error)}));",
          ],
          { type: "text/javascript" },
        ),
      );
      const worker = new Worker(url);
      try {
        const other = await new Promise(
          /** Reads actual worker completion. @param resolve - Result. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Forwards real worker result. @param event - Message. @returns Nothing. */ (
                event,
              ) => (event.data.error ? reject(Error(event.data.error)) : resolve(event.data));
            worker.onerror =
              /** Forwards worker failure. @param event - Error. @returns Nothing. */ (event) =>
                reject(Error(event.message));
          },
        );
        return { main: await run(), other };
      } finally {
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    },
  );
  const expected = { found: true, extent: [3, 2], values: [0, 1, 2, 3], unchanged: false };
  expect(result).toEqual({ main: expected, other: { value: expected, dom: "undefined" } });
});
