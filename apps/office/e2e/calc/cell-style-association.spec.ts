/** @fileoverview Native Calc pattern-style association in Chromium and a DOM-free Worker over actual shared styles;no fake Calc style pool. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
const nativeExports = [
  { module: "src/sc/inc/document.ts", names: ["ScDocument"] },
  { module: "src/sc/inc/patattr.ts", names: ["ScPatternAttr", "CellAttributeHolder"] },
  {
    module: "src/svl/inc/style.ts",
    names: ["SfxStyleSheetPool", "SfxStyleFamily", "SfxStyleSearchBits"],
  },
  { module: "src/editeng/inc/fhgtitem.ts", names: ["SvxFontHeightItem"] },
  { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode", "text"] },
] as const;
/** Real existing native style/value classes in both realms;the Calc style-pool subclass is not replaced. */
type Runtime = typeof import("../../src/sc/inc/document") &
  typeof import("../../src/sc/inc/patattr") &
  typeof import("../../src/svl/inc/style") &
  typeof import("../../src/editeng/inc/fhgtitem") &
  typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
test("retains native pattern style inheritance and registered rename/delete in the DOM-free Worker", /** Executes actual source classes without a replacement model. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcStyleAssociationFixture", nativeExports);
  const results = await page.evaluate(
    /** Executes identical real native operations in both environments. @returns Source observations. */ async () => {
      /** Reads native style inheritance and registry lifecycle. @returns Initialized source results. */ function run() {
        /** Requires a real native owner or value before observing its contract. @param value - Actual source result. @returns Present value. */
        function required<T>(value: T | null | undefined): T {
          if (value === null || value === undefined) throw Error("Missing native source value");
          return value;
        }

        const n = (
            globalThis as unknown as {
              CalcStyleAssociationFixture: Runtime;
            }
          ).CalcStyleAssociationFixture,
          d = new n.ScDocument(),
          pool = new n.SfxStyleSheetPool(d.GetPool()),
          helper = d.getCellAttributeHelper(),
          name = n.unicode("Native style"),
          renamed = n.unicode("Renamed style"),
          pattern = new n.ScPatternAttr(helper);
        let holder: InstanceType<Runtime["CellAttributeHolder"]> | undefined;
        try {
          const style = pool.Make(name, n.SfxStyleFamily.Para, n.SfxStyleSearchBits.UserDefined);
          style.GetItemSet().Put(new n.SvxFontHeightItem(400, 100, 101));
          pattern.ItemSetPut(new n.SvxFontHeightItem(300, 100, 101));
          pattern.SetStyleSheet(style);
          holder = new n.CellAttributeHolder(pattern);
          const registered = required(holder.getScPatternAttr()),
            before = {
              height: (
                registered.GetItem(101) as InstanceType<Runtime["SvxFontHeightItem"]>
              ).GetHeight(),
              style: registered.GetStyleSheet() === style,
              parent: registered.GetItemSet().GetParent() === style.GetItemSet(),
            };
          helper.RenameCellStyle(style, renamed);
          const afterRename = n.text(required(registered.GetStyleName()));
          helper.CellStyleDeleted(style);
          return {
            before,
            afterRename,
            afterDelete: {
              height: (
                registered.GetItem(101) as InstanceType<Runtime["SvxFontHeightItem"]>
              ).GetHeight(),
              name: n.text(required(registered.GetStyleName())),
              style: registered.GetStyleSheet(),
              parent: registered.GetItemSet().GetParent() === undefined,
            },
            sourceStillBorrowed: pattern.GetStyleSheet() === style,
          };
        } finally {
          holder?.Dispose();
          pattern.Dispose();
          helper.AllStylesToNames();
          pool.Dispose();
          name.dispose();
          renamed.dispose();
          d.DisposeAttributes();
        }
      }
      const script = Array.from(document.scripts).find(
        /** Finds the actual installed source bundle. @param node - Script. @returns Kernel match. */ (
          node,
        ) => node.textContent?.includes(';globalThis["CalcStyleAssociationFixture"]='),
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
    before: { height: 400, style: true, parent: true },
    afterRename: "Renamed style",
    afterDelete: { height: 200, name: "Renamed style", style: null, parent: true },
    sourceStillBorrowed: true,
  };
  expect(results).toEqual({ main: expected, other: { result: expected, dom: "undefined" } });
});
