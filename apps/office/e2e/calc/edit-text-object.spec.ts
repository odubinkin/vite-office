/** @fileoverview Actual shared EditEngine pool and rich-text value ownership in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
const nativeExports = [
  { module: "src/editeng/inc/editobj.ts", names: ["EditTextObjectImpl", "TextRotation"] },
  { module: "src/editeng/inc/editdoc.ts", names: ["EditEngineItemPool"] },
  { module: "src/tools/inc/mapunit.ts", names: ["MapUnit"] },
  { module: "src/svl/inc/languageoptions.ts", names: ["SvtScriptType"] },
  { module: "src/svl/inc/style-values.ts", names: ["SfxStyleFamily"] },
  { module: "src/editeng/inc/flditem.ts", names: ["SvxFieldItem", "SvxTableField"] },
  { module: "src/editeng/inc/eeitem.ts", names: ["EE_FEATURE_FIELD"] },
  { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode", "text"] },
] as const;
/** Actual native exports, with no substitute engine. */
type Runtime = typeof import("../../src/editeng/inc/editobj") &
  typeof import("../../src/editeng/inc/editdoc") &
  typeof import("../../src/tools/inc/mapunit") &
  typeof import("../../src/svl/inc/languageoptions") &
  typeof import("../../src/svl/inc/style-values") &
  typeof import("../../src/editeng/inc/flditem") &
  typeof import("../../src/editeng/inc/eeitem") &
  typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
test("retains real EditEngine pool and rich-text ownership in Chromium and the DOM-free Worker", /** Executes actual source classes without a replacement model. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcEditTextFixture", nativeExports);
  const results = await page.evaluate(
    /** Executes identical real native operations in both environments. @returns Source observations. */ async () => {
      /** Reads actual source names and static defaults. @returns Initialized source results. */ function run() {
        const n = (globalThis as unknown as { CalcEditTextFixture: Runtime }).CalcEditTextFixture,
          owner = new n.EditTextObjectImpl(
            null,
            n.MapUnit.MapTwip,
            false,
            n.TextRotation.NONE,
            n.SvtScriptType.LATIN,
          ),
          value = n.unicode("x"),
          style = n.unicode("Heading"),
          output = n.unicode("");
        try {
          const paragraph = owner.CreateAndInsertContent();
          paragraph.SetText(value);
          paragraph
            .GetCharAttribs()
            .push(
              owner.CreateAttrib(
                new n.SvxFieldItem(new n.SvxTableField(4), n.EE_FEATURE_FIELD),
                0,
                1,
              ),
            );
          owner.SetStyleSheet(0, style, n.SfxStyleFamily.Para);
          owner.GetFieldUpdater().updateTableFields(9);
          const family: [Runtime["SfxStyleFamily"]["Para"]] = [n.SfxStyleFamily.Para];
          owner.GetStyleSheet(0, output, family);
          const clone = owner.Clone(),
            joined = clone.GetText();
          try {
            return {
              genuinePool: owner.GetPool() instanceof n.EditEngineItemPool,
              range: [owner.GetPool().GetFirstWhich(), owner.GetPool().GetLastWhich()],
              text: n.text(joined),
              style: n.text(output),
              field: (
                (
                  clone.GetField() as InstanceType<Runtime["SvxFieldItem"]>
                ).GetField() as InstanceType<Runtime["SvxTableField"]>
              ).GetTab(),
              copyEqual: clone.equals(owner),
              samePool: clone.GetPool() === owner.GetPool(),
              independentParagraph: clone.GetContents()[0] !== paragraph,
            };
          } finally {
            joined.dispose();
            clone.dispose();
          }
        } finally {
          owner.dispose();
          value.dispose();
          style.dispose();
          output.dispose();
        }
      }
      const script = Array.from(document.scripts).find(
        /** Finds the actual installed source bundle. @param node - Script. @returns Kernel match. */ (
          node,
        ) => node.textContent?.includes(';globalThis["CalcEditTextFixture"]='),
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
    genuinePool: true,
    range: [4021, 4081],
    text: "x",
    style: "Heading",
    field: 9,
    copyEqual: true,
    samePool: true,
    independentParagraph: true,
  };
  expect(results).toEqual({ main: expected, other: { result: expected, dom: "undefined" } });
});
