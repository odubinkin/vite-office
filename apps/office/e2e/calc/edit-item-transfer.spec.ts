/** @fileoverview Actual source Calc EditEngine attribute transfer in Chromium and a DOM-free Worker;no fake layout engine. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
const nativeExports = [
  { module: "src/sc/inc/document.ts", names: ["ScDocument"] },
  { module: "src/sc/inc/patattr.ts", names: ["ScPatternAttr"] },
  { module: "src/svl/inc/itemset.ts", names: ["SfxItemSet"] },
  { module: "src/editeng/inc/fhgtitem.ts", names: ["SvxFontHeightItem"] },
  {
    module: "src/editeng/inc/eeitem.ts",
    names: [
      "EE_ITEMS_START",
      "EE_ITEMS_END",
      "EE_CHAR_FONTHEIGHT",
      "EE_CHAR_FONTHEIGHT_CJK",
      "EE_CHAR_FONTHEIGHT_CTL",
      "EE_PARA_ASIANCJKSPACING",
      "EE_CHAR_COLOR",
    ],
  },
] as const;
/** Real native exports shared by both execution realms. */
type Runtime = typeof import("../../src/sc/inc/document") &
  typeof import("../../src/sc/inc/patattr") &
  typeof import("../../src/svl/inc/itemset") &
  typeof import("../../src/editeng/inc/fhgtitem") &
  typeof import("../../src/editeng/inc/eeitem");
test("transfers genuine Calc EditEngine formatting with original units in the DOM-free Worker", /** Executes actual source classes without a replacement model. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcEditTransferFixture", nativeExports);
  const results = await page.evaluate(
    /** Executes identical real native operations in both environments. @returns Source observations. */ async () => {
      /** Reads original three-script attribute units and EditEngine item states. @returns Initialized source results. */ function run() {
        const n = (globalThis as unknown as { CalcEditTransferFixture: Runtime })
            .CalcEditTransferFixture,
          d = new n.ScDocument(),
          pattern = new n.ScPatternAttr(d.getCellAttributeHelper()),
          reverse = new n.ScPatternAttr(d.getCellAttributeHelper()),
          edit = new n.SfxItemSet(d.GetPool(), [[n.EE_ITEMS_START, n.EE_ITEMS_END]]);
        try {
          pattern.GetItemSetWritable().Put(new n.SvxFontHeightItem(201, 100, 101));
          pattern.GetItemSetWritable().Put(new n.SvxFontHeightItem(301, 100, 112));
          pattern.GetItemSetWritable().Put(new n.SvxFontHeightItem(401, 100, 117));
          pattern.FillEditItemSet(edit);
          reverse.GetFromEditItemSet(edit);
          return {
            heights: [n.EE_CHAR_FONTHEIGHT, n.EE_CHAR_FONTHEIGHT_CJK, n.EE_CHAR_FONTHEIGHT_CTL].map(
              /** Reads native converted values. @param id - Which. @returns Height. */ (id) =>
                (edit.Get(id) as InstanceType<Runtime["SvxFontHeightItem"]>).GetHeight(),
            ),
            reverse: [101, 112, 117].map(
              /** Reads native reverse values. @param id - Which. @returns Height. */ (id) =>
                (reverse.GetItem(id) as InstanceType<Runtime["SvxFontHeightItem"]>).GetHeight(),
            ),
            automaticColor: edit.GetItemIfSet(n.EE_CHAR_COLOR) === undefined,
            spacing: edit.Get(n.EE_PARA_ASIANCJKSPACING).QueryValue(),
            count: edit.Count(),
          };
        } finally {
          edit.ClearItem();
          pattern.Dispose();
          reverse.Dispose();
          d.DisposeAttributes();
        }
      }
      const script = Array.from(document.scripts).find(
        /** Finds the actual installed source bundle. @param node - Script. @returns Kernel match. */ (
          node,
        ) => node.textContent?.includes(';globalThis["CalcEditTransferFixture"]='),
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
    heights: [355, 531, 707],
    reverse: [201, 301, 401],
    automaticColor: true,
    spacing: false,
    count: 27,
  };
  expect(results).toEqual({ main: expected, other: { result: expected, dom: "undefined" } });
});
