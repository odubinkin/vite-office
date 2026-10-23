/** @fileoverview Actual general clipboard copy/completion owners in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
/** Bundled actual source declarations;no browser/document model replacement is used. */
type Fixture = typeof import("../../src/sc/inc/document") &
  typeof import("../../src/sc/inc/address") &
  typeof import("../../src/sc/inc/markdata") &
  typeof import("../../src/sc/inc/clipcontext") &
  typeof import("../../src/sc/inc/columnspanset") &
  typeof import("../../src/sc/inc/global") &
  typeof import("../../src/sc/inc/formulacell") &
  typeof import("../../src/sc/source/core/data/documen7") &
  typeof import("../../src/formula/inc/grammar") &
  typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
test("copies sparse clipboard blocks and completes real dependency notifications in Chromium and a DOM-free Worker", /** The same actual native owner graph executes in both runtimes. @param fixtures - Browser. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "CalcClipboardFixture", [
    { module: "src/sc/inc/document.ts", names: ["ScDocument", "ScDocumentMode"] },
    { module: "src/sc/inc/address.ts", names: ["ScAddress", "ScRange"] },
    { module: "src/sc/inc/markdata.ts", names: ["ScMarkData"] },
    { module: "src/sc/inc/clipcontext.ts", names: ["CopyFromClipContext"] },
    { module: "src/sc/inc/columnspanset.ts", names: ["ColumnSpanSet"] },
    { module: "src/sc/inc/global.ts", names: ["InsertDeleteFlags"] },
    { module: "src/sc/inc/formulacell.ts", names: ["ScFormulaCell"] },
    { module: "src/sc/source/core/data/documen7.ts", names: ["BroadcastAction"] },
    { module: "src/formula/inc/grammar.ts", names: ["FormulaGrammar"] },
    { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode", "text"] },
  ]);
  const observations = await page.evaluate(
    /** Runs actual compiled source owners without DOM dependencies. @returns Main/Worker observations. */ async () => {
      /** Executes the real default-content phases;document-level paste orchestration and history are not claimed here. @returns Native values. */ function run() {
        const n = (globalThis as unknown as { CalcClipboardFixture: Fixture }).CalcClipboardFixture,
          doc = new n.ScDocument(),
          clip = new n.ScDocument(n.ScDocumentMode.SCDOCMODE_CLIP),
          grammar = n.FormulaGrammar.Grammar.GRAM_NATIVE;
        for (let tab = 0; tab < 3; ++tab) doc.InsertTab(tab, n.unicode(`Sheet${tab}`));
        clip.ResetClip(doc, 2);
        clip.SetClipArea(new n.ScRange(0, 0, 2, 0, 1, 2));
        clip.SetValue(new n.ScAddress(0, 0, 2), 13);
        const source = new n.ScFormulaCell(
          doc,
          new n.ScAddress(0, 1, 2),
          n.unicode("=B2+1"),
          grammar,
        );
        source.GetValue();
        clip.SetFormulaCell(new n.ScAddress(0, 1, 2), source);
        doc.SetValue(new n.ScAddress(2, 4, 0), 1);
        doc.SetValue(new n.ScAddress(3, 5, 0), 7);
        doc.SetFormula(new n.ScAddress(5, 0, 0), n.unicode("=SUM(C5:C6)"), grammar);
        doc.GetValue(new n.ScAddress(5, 0, 0));
        const context = new n.CopyFromClipContext(
            doc,
            null,
            clip,
            n.InsertDeleteFlags.CONTENTS,
            false,
            false,
          ),
          marks = new n.ScMarkData(doc.GetSheetLimits()),
          spans = new n.ColumnSpanSet(),
          target = doc.FetchTable(0),
          clipTable = clip.FetchTable(2);
        if (!target || !clipTable) throw Error("Missing actual native sheets");
        marks.SelectTable(0, true);
        context.setTabRange(0, 0);
        context.setDestRange(2, 4, 2, 5);
        context.setDeleteFlag(n.InsertDeleteFlags.CONTENTS);
        doc.SetAutoCalc(false);
        doc.SetInsertingFromOtherDoc(true);
        doc.DeleteBeforeCopyFromClip(context, marks, spans);
        target.CopyFromClip(context, 2, 4, 2, 5, 2, 4, clipTable);
        doc.SetInsertingFromOtherDoc(false);
        context.setListeningFormulaSpans(0, 2, 4, 2, 5);
        context.startListeningFormulas();
        doc.SetDirtyFromClip(2, 4, 2, 5, marks, n.InsertDeleteFlags.CONTENTS, spans);
        spans.executeColumnAction(doc, new n.BroadcastAction(doc));
        doc.SetAutoCalc(true);
        const value = doc.GetValue(new n.ScAddress(5, 0, 0));
        doc.SetValue(new n.ScAddress(3, 5, 0), 20);
        const changed = doc.GetValue(new n.ScAddress(5, 0, 0)),
          formulaCell = doc.GetFormulaCell(new n.ScAddress(2, 5, 0));
        if (!formulaCell) throw Error("Missing actual copied formula");
        const string = formulaCell.GetFormula(grammar),
          formula = n.text(string),
          sparse = clip.FetchTable(0) === null;
        string.dispose();
        context.Dispose();
        clip.Dispose();
        doc.Dispose();
        return { value, changed, formula, sparse };
      }
      const script = Array.from(document.scripts).find(
        /** Locates the actual kernel compiler output. @param item - Script. @returns Match. */ (
          item,
        ) => item.textContent?.includes(';globalThis["CalcClipboardFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing native clipboard bundle");
      const url = URL.createObjectURL(
          new Blob(
            [script, "\npostMessage({value:(", run.toString(), ")(),dom:typeof document});"],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = await new Promise(
          /** Reads actual Worker completion. @param resolve - Result. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Receives the actual native result. @param event - Message. @returns Nothing. */ (
                event,
              ) => resolve(event.data);
            worker.onerror =
              /** Forwards real worker failures. @param event - Error. @returns Nothing. */ (
                event,
              ) => reject(Error(event.message));
          },
        );
        return { main: run(), other };
      } finally {
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    },
  );
  const expected = { value: 21, changed: 34, formula: "=D6+1", sparse: true };
  expect(observations).toEqual({ main: expected, other: { value: expected, dom: "undefined" } });
});
