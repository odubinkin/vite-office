/** @fileoverview Actual general clipboard copy/completion owners in Chromium and a DOM-free Worker. */
import type { SfxHint } from "../../src/svl/inc/hint";
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
/** Bundled actual source declarations;no browser/document model replacement is used. */
type Fixture = typeof import("../../src/vcl/inc/scheduler") &
  typeof import("../../src/vcl/browser/sal-timer") &
  typeof import("../../src/sc/inc/chartlis") &
  typeof import("../../src/sc/inc/reftokenhelper") &
  typeof import("../../src/sc/inc/attrib") &
  typeof import("../../src/sc/inc/patattr") &
  typeof import("../../src/sc/inc/document") &
  typeof import("../../src/sc/inc/address") &
  typeof import("../../src/sc/inc/markdata") &
  typeof import("../../src/sc/inc/clipcontext") &
  typeof import("../../src/sc/inc/scopetools") &
  typeof import("../../src/sc/inc/conditio") &
  typeof import("../../src/sc/inc/rangelst") &
  typeof import("../../src/svl/source/notify/listener") &
  typeof import("../../src/sc/inc/refupdatecontext") &
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
    { module: "src/vcl/inc/scheduler.ts", names: ["bindSchedulerPlatform", "Scheduler"] },
    { module: "src/vcl/browser/sal-timer.ts", names: ["browserSchedulerPlatform"] },
    { module: "src/sc/inc/chartlis.ts", names: ["ScChartListener"] },
    {
      module: "src/sc/inc/reftokenhelper.ts",
      names: [
        "getTokenFromRange",
        "getRangeFromToken",
        "getRangeListFromTokens",
        "getSingleRef",
        "intersects",
      ],
    },
    { module: "src/sc/inc/attrib.ts", names: ["ScCondFormatItem", "ScMergeAttr"] },
    { module: "src/sc/inc/patattr.ts", names: ["ScPatternAttr"] },
    { module: "src/sc/inc/conditio.ts", names: ["ScConditionalFormat", "ScCondDateFormatEntry"] },
    { module: "src/sc/inc/rangelst.ts", names: ["ScRangeList"] },
    { module: "src/sc/inc/scopetools.ts", names: ["DelayDeletingBroadcasters", "AutoCalcSwitch"] },
    { module: "src/svl/source/notify/listener.ts", names: ["SvtListener"] },
    { module: "src/sc/inc/document.ts", names: ["ScDocument", "ScDocumentMode"] },
    { module: "src/sc/inc/address.ts", names: ["ScAddress", "ScRange"] },
    { module: "src/sc/inc/markdata.ts", names: ["ScMarkData"] },
    { module: "src/sc/inc/clipcontext.ts", names: ["CopyFromClipContext", "CopyToDocContext"] },
    { module: "src/sc/inc/columnspanset.ts", names: ["ColumnSpanSet"] },
    { module: "src/sc/inc/global.ts", names: ["InsertDeleteFlags", "UpdateRefMode"] },
    { module: "src/sc/inc/refupdatecontext.ts", names: ["RefUpdateContext"] },
    { module: "src/sc/inc/formulacell.ts", names: ["ScFormulaCell"] },
    { module: "src/sc/source/core/data/documen7.ts", names: ["BroadcastAction"] },
    { module: "src/formula/inc/grammar.ts", names: ["FormulaGrammar"] },
    { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode", "text"] },
  ]);
  const observations = await page.evaluate(
    /** Runs actual compiled source owners without DOM dependencies. @returns Main/Worker observations. */ async () => {
      /** Executes the real default-content phases;document-level paste orchestration and history are not claimed here. @returns Native values. */ async function run() {
        const n = (globalThis as unknown as { CalcClipboardFixture: Fixture }).CalcClipboardFixture,
          doc = new n.ScDocument(),
          clip = new n.ScDocument(n.ScDocumentMode.SCDOCMODE_CLIP),
          undo = new n.ScDocument(n.ScDocumentMode.SCDOCMODE_UNDO),
          grammar = n.FormulaGrammar.Grammar.GRAM_NATIVE;
        n.bindSchedulerPlatform(n.browserSchedulerPlatform);
        for (let tab = 0; tab < 3; ++tab) doc.InsertTab(tab, n.unicode(`Sheet${tab}`));
        undo.InitUndo(doc, 0, 0);
        const undoTable = undo.FetchTable(0);
        if (!undoTable) throw Error("Missing actual Undo table");
        const originalUndoWidth = undoTable.GetColWidth(0);
        undoTable.SetColWidth(0, originalUndoWidth + 100);
        const undoGeometryDisabled = undoTable.GetColWidth(0) === originalUndoWidth,
          undoShared = undo.GetPool() === doc.GetPool();
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
        source.SetNeedNumberFormat(false);
        doc.SetValue(new n.ScAddress(2, 4, 0), 1);
        doc.SetValue(new n.ScAddress(3, 5, 0), 7);
        doc.SetFormula(new n.ScAddress(5, 0, 0), n.unicode("=SUM(C5:C6)"), grammar);
        doc.GetValue(new n.ScAddress(5, 0, 0));
        const context = new n.CopyFromClipContext(
            doc,
            undo,
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
        doc.CopyBlockFromClip(context, 2, 4, 2, 5, marks, 2, 4);
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
          sparse = clip.FetchTable(0) === null,
          formatRequests = [source.NeedsNumberFormat(), formulaCell.NeedsNumberFormat()];
        string.dispose();
        doc.CopyToDocument(
          new n.ScRange(2, 4, 0, 2, 5, 0),
          n.InsertDeleteFlags.CONTENTS,
          false,
          undo,
        );
        const snapshot = undoTable.CreateColumnIfNotExists(2);
        const saved = snapshot.GetFormulaCell(5);
        if (!saved) throw Error("Missing actual Undo formula snapshot");
        const snapshotFormula = saved.GetFormula(grammar),
          snapshotCodeIndependent = saved.GetCode() !== formulaCell.GetCode();
        const undoCopy = {
          value: snapshot.GetValue(4),
          formula: n.text(snapshotFormula),
          independent: snapshotCodeIndependent,
          needsFormat: saved.NeedsNumberFormat(),
        };
        snapshotFormula.dispose();
        doc.SetAutoCalc(false);
        undo.CopyToDocument(
          new n.ScRange(2, 4, 0, 2, 5, 0),
          n.InsertDeleteFlags.CONTENTS,
          false,
          doc,
        );
        doc.SetAutoCalc(true);
        doc.SetValue(new n.ScAddress(3, 5, 0), 30);
        const restoredDependency = doc.GetValue(new n.ScAddress(5, 0, 0));
        const rowClip = new n.ScDocument(n.ScDocumentMode.SCDOCMODE_CLIP);
        rowClip.ResetClip(doc, 0);
        rowClip.SetClipArea(new n.ScRange(0, 0, 0, 1, 0, 0));
        rowClip.SetValue(new n.ScAddress(), 3);
        rowClip.SetValue(new n.ScAddress(1, 0, 0), 7);
        const rowSource = rowClip.FetchTable(0),
          rowContext = new n.CopyFromClipContext(
            doc,
            null,
            rowClip,
            n.InsertDeleteFlags.CONTENTS,
            false,
            false,
          ),
          rowSpans = new n.ColumnSpanSet();
        if (!rowSource) throw Error("Missing actual single-row source");
        rowContext.setSingleCellColumnSize(2);
        for (let col = 0; col < 2; ++col)
          rowContext.setSingleCell(
            new n.ScAddress(col, 0, 0),
            rowSource.CreateColumnIfNotExists(col),
          );
        doc.SetAutoCalc(false);
        doc.SetInsertingFromOtherDoc(true);
        target.CopyOneCellFromClip(rowContext, 6, 8, 8, 9, 0, rowSource);
        doc.SetInsertingFromOtherDoc(false);
        rowContext.setListeningFormulaSpans(0, 6, 8, 8, 9);
        rowContext.startListeningFormulas();
        doc.SetDirtyFromClip(6, 8, 8, 9, marks, n.InsertDeleteFlags.CONTENTS, rowSpans);
        rowSpans.executeColumnAction(doc, new n.BroadcastAction(doc));
        doc.SetAutoCalc(true);
        const singleRow: number[] = [];
        for (let row = 8; row < 10; ++row)
          for (let col = 6; col < 9; ++col)
            singleRow.push(doc.GetValue(new n.ScAddress(col, row, 0)));
        const listener = new n.SvtListener<SfxHint>(),
          listeningColumn = doc.FetchTable(0)?.CreateColumnIfNotExists(9);
        if (!listeningColumn) throw Error("Missing actual listening column");
        listeningColumn.StartListening(listener, 9);
        const delay = new n.DelayDeletingBroadcasters(doc);
        listeningColumn.EndListening(listener, 9);
        const retained = listeningColumn.GetBroadcaster(9) !== null;
        delay.Dispose();
        const delayedBroadcasters = {
          retained,
          removed: listeningColumn.GetBroadcaster(9) === null,
          flag: doc.IsDelayedDeletingBroadcasters(),
        };
        listener.Dispose();
        const conditional = new n.ScConditionalFormat(21, doc);
        conditional.SetRange(new n.ScRangeList(new n.ScRange(9, 9, 0, 9, 9, 0)));
        conditional.AddEntry(new n.ScCondDateFormatEntry(doc));
        const sourceTable = doc.FetchTable(0);
        if (!sourceTable) throw Error("Missing actual conditional-format table");
        sourceTable.GetCondFormList().InsertNew(conditional);
        doc.AddCondFormatData(conditional.GetRange(), 0, 21);
        doc.AddCondFormatData(conditional.GetRange(), 0, 21);
        conditional.SetCache([4]);
        doc.SetValue(new n.ScAddress(9, 9, 0), 2);
        undoTable.SetCondFormList(sourceTable.GetCondFormList().Clone(undo));
        const conditionalSnapshot = undoTable.GetCondFormList().GetFormat(21);
        if (!conditionalSnapshot) throw Error("Missing actual conditional-format snapshot");
        const conditionalValues = conditionalSnapshot.GetCache();
        if (!conditionalValues) throw Error("Missing actual conditional-format cache");
        const conditionalCopy = {
          invalidated: conditional.GetCache()?.length === 0,
          independent: conditionalSnapshot.GetEntry(0) !== conditional.GetEntry(0),
          range: conditionalSnapshot.GetRange().at(0).GetVars(),
          type: conditionalSnapshot.GetEntry(0)?.GetType(),
          cached: Array.from(conditionalValues),
          indexes: Array.from(
            (
              doc.GetPattern(new n.ScAddress(9, 9, 0))?.GetItem(154) as InstanceType<
                Fixture["ScCondFormatItem"]
              >
            ).GetCondFormatData(),
          ),
        };
        const snapshotContext = new n.CopyToDocContext(undo);
        snapshotContext.setStartListening(false);
        for (let col = 2; col <= 9; ++col)
          sourceTable
            .CreateColumnIfNotExists(col)
            .CopyToColumn(
              snapshotContext,
              4,
              9,
              n.InsertDeleteFlags.CONTENTS | n.InsertDeleteFlags.ATTRIB,
              false,
              undoTable.CreateColumnIfNotExists(col),
            );
        doc.AddCondFormatData(conditional.GetRange(), 0, 22);
        doc.RemoveCondFormatData(conditional.GetRange(), 0, 21);
        const removedIndexes = Array.from(
          (
            doc.GetPattern(new n.ScAddress(9, 9, 0))?.GetItem(154) as InstanceType<
              Fixture["ScCondFormatItem"]
            >
          ).GetCondFormatData(),
        );
        doc.RemoveCondFormatData(conditional.GetRange(), 0, 0);
        const clearedIndexes = Array.from(
          (
            doc.GetPattern(new n.ScAddress(9, 9, 0))?.GetItem(154) as InstanceType<
              Fixture["ScCondFormatItem"]
            >
          ).GetCondFormatData(),
        );
        doc.SetValue(new n.ScAddress(2, 4, 0), 999);
        doc.SetValue(new n.ScAddress(2, 5, 0), 999);
        const undoCalc = new n.AutoCalcSwitch(doc, false);
        try {
          undoTable.UndoToTable(
            new n.CopyToDocContext(doc),
            2,
            4,
            9,
            9,
            n.InsertDeleteFlags.CONTENTS | n.InsertDeleteFlags.ATTRIB,
            false,
            sourceTable,
          );
        } finally {
          undoCalc.Dispose();
        }
        sourceTable.SetStreamValid(true);
        doc.LockStreamValid(true);
        sourceTable.SetRowManualBreaks(new Set([8, 2]));
        const lockedStream = sourceTable.IsStreamValid(),
          breaks = new Set<number>();
        sourceTable.GetAllRowBreaks(breaks, false, true);
        doc.LockStreamValid(false);
        sourceTable.RemoveManualBreaks();
        const tableUndo = {
          value: doc.GetValue(new n.ScAddress(2, 4, 0)),
          formula: doc.GetValue(new n.ScAddress(2, 5, 0)),
          dependency: doc.GetValue(new n.ScAddress(5, 0, 0)),
          independent:
            sourceTable.GetCondFormList().GetFormat(21)?.GetEntry(0) !==
            conditionalSnapshot.GetEntry(0),
          breaks: Array.from(breaks),
          lockedStream,
          restoredAutoCalc: doc.GetAutoCalc(),
          invalidatedStream: !sourceTable.IsStreamValid(),
        };
        const reference: Parameters<Fixture["getTokenFromRange"]>[1] = [null];
        n.getTokenFromRange(doc, reference, new n.ScRange(2, 4, 0, 2, 5, 0));
        const referenceToken = reference[0];
        if (!referenceToken) throw Error("Missing actual range reference token");
        const referenceRange = new n.ScRange(),
          referenceRanges = new n.ScRangeList();
        n.getRangeFromToken(doc, referenceRange, referenceToken, new n.ScAddress());
        n.getRangeListFromTokens(doc, referenceRanges, [referenceToken], new n.ScAddress());
        const referenceData = n.getSingleRef(referenceToken);
        if (!referenceData) throw Error("Missing actual reference endpoint");
        const referenceHelper = {
          range: referenceRange.GetVars(),
          sheetFlag: referenceData.IsFlag3D(),
          count: referenceRanges.size(),
          overlap: n.intersects(doc, [referenceToken], referenceToken, new n.ScAddress()),
        };
        const chartName = n.unicode("Copied chart"),
          chartListener = new n.ScChartListener(chartName, doc, [referenceToken]);
        chartName.dispose();
        chartListener.SetDirty(true);
        const chartOwnership = {
          range: chartListener.GetRangeList().at(0).GetVars(),
          used: chartListener.IsUsed(),
          dirty: chartListener.IsDirty(),
          selfEqual: chartListener.equals(chartListener),
        };
        const collection = doc.GetChartListenerCollection();
        if (!collection) throw Error("Missing actual chart collection");
        const notified = new Promise<number>(
          /** The real chart callback resolves host-delivered completion. @param resolve - Completion. @returns Nothing. */ (
            resolve,
          ) => {
            chartListener.SetUno(
              {
                /** Observes the actual native ALL event. @param event - Changed data. @returns Nothing. */
                chartDataChanged(event) {
                  resolve(event.Type);
                },
              },
              null,
            );
          },
        );
        collection.insert(chartListener);
        collection.StartAllListeners();
        doc.SetValue(new n.ScAddress(2, 4, 0), 17);
        const chartNotification = { type: await notified, dirty: chartListener.IsDirty() };
        const allocated = target.GetAllocatedColumnsCount(),
          sparseMerge = doc.IsMerged(new n.ScAddress(doc.MaxCol(), 0, 0)),
          allocationUnchanged = target.GetAllocatedColumnsCount() === allocated,
          mergePattern = new n.ScPatternAttr(doc.getCellAttributeHelper());
        mergePattern.ItemSetPut(new n.ScMergeAttr(2, 1));
        doc.ApplyPattern(12, 12, 0, mergePattern);
        mergePattern.Dispose();
        const borrowedPattern = doc.GetPattern(new n.ScAddress(12, 12, 0));
        rowContext.setSingleCellPattern(0, borrowedPattern);
        rowContext.setSingleCellColumnSize(3);
        const pastePreparation = {
          anchor: doc.IsMerged(new n.ScAddress(12, 12, 0)),
          ordinary: doc.IsMerged(new n.ScAddress(12, 11, 0)),
          absentSheet: doc.IsMerged(new n.ScAddress(0, 0, 7)),
          sparseMerge,
          allocationUnchanged,
          retainedPattern: rowContext.getSingleCellPattern(0) === borrowedPattern,
          newPattern: rowContext.getSingleCellPattern(2),
        };
        referenceToken.dispose();
        rowContext.Dispose();
        rowClip.Dispose();
        context.Dispose();
        clip.Dispose();
        undo.Dispose();
        doc.Dispose();
        n.Scheduler.ImplDeInitScheduler();
        return {
          value,
          changed,
          formula,
          sparse,
          undoGeometryDisabled,
          undoShared,
          singleRow,
          formatRequests,
          undoCopy,
          restoredDependency,
          delayedBroadcasters,
          conditionalCopy,
          removedIndexes,
          clearedIndexes,
          tableUndo,
          referenceHelper,
          chartOwnership,
          chartNotification,
          pastePreparation,
        };
      }
      const script = Array.from(document.scripts).find(
        /** Locates the actual kernel compiler output. @param item - Script. @returns Match. */ (
          item,
        ) => item.textContent?.includes(';globalThis["CalcClipboardFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing native clipboard bundle");
      const url = URL.createObjectURL(
          new Blob(
            [
              script,
              "\n(",
              run.toString(),
              ")().then(value=>postMessage({value,dom:typeof document}));",
            ],
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
        return { main: await run(), other };
      } finally {
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    },
  );
  const expected = {
    referenceHelper: { range: [2, 4, 0, 2, 5, 0], sheetFlag: true, count: 1, overlap: true },
    chartOwnership: { range: [2, 4, 0, 2, 5, 0], used: false, dirty: true, selfEqual: true },
    chartNotification: { type: 0, dirty: false },
    value: 21,
    changed: 34,
    formula: "=D6+1",
    sparse: true,
    undoGeometryDisabled: true,
    undoShared: true,
    singleRow: [3, 7, 3, 3, 7, 3],
    pastePreparation: {
      anchor: true,
      ordinary: false,
      absentSheet: false,
      sparseMerge: false,
      allocationUnchanged: true,
      retainedPattern: true,
      newPattern: null,
    },
    formatRequests: [false, false],
    undoCopy: { value: 13, formula: "=D6+1", independent: true, needsFormat: false },
    restoredDependency: 44,
    delayedBroadcasters: { retained: true, removed: true, flag: false },
    tableUndo: {
      value: 13,
      formula: 31,
      dependency: 44,
      independent: true,
      breaks: [2, 8],
      lockedStream: true,
      restoredAutoCalc: true,
      invalidatedStream: true,
    },
    removedIndexes: [22],
    clearedIndexes: [],
    conditionalCopy: {
      invalidated: true,
      independent: true,
      range: [9, 9, 0, 9, 9, 0],
      type: 5,
      cached: [],
      indexes: [21],
    },
  };
  expect(observations).toEqual({ main: expected, other: { value: expected, dom: "undefined" } });
});
