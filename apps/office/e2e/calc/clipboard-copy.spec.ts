/** @fileoverview Actual general clipboard copy/completion owners in Chromium and a DOM-free Worker. */
import type { SfxHint } from "../../src/svl/inc/hint";
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
/** Bundled actual source declarations;no browser/document model replacement is used. */
type Fixture = typeof import("../../src/sc/source/core/data/document10") &
  typeof import("../../src/i18npool/source/breakiterator/breakiteratorImpl") &
  typeof import("../../src/vcl/inc/scheduler") &
  typeof import("../../src/vcl/browser/sal-timer") &
  typeof import("../../src/sc/inc/chartlis") &
  typeof import("../../src/sc/inc/reftokenhelper") &
  typeof import("../../src/sc/inc/attrib") &
  typeof import("../../src/sc/inc/patattr") &
  typeof import("../../src/svl/source/numbers/zformat") &
  typeof import("../../src/svl/source/numbers/zforlist") &
  typeof import("../../src/svl/source/numbers/zforscan") &
  typeof import("../../src/sal/inc/rtl/math") &
  typeof import("../../src/i18npool/source/localedata/localedata") &
  typeof import("../../src/udkapi/com/sun/star/lang/Locale") &
  typeof import("../../src/i18npool/inc/numberformatcode") &
  typeof import("../../src/offapi/com/sun/star/i18n/NumberFormatCode") &
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
    { module: "src/sc/source/core/data/document10.ts", names: ["CopyOneCellFromClip"] },
    {
      module: "src/i18npool/source/breakiterator/breakiteratorImpl.ts",
      names: ["BreakIteratorImpl"],
    },
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
    {
      module: "src/svl/source/numbers/zformat.ts",
      names: ["formatStandardNumber", "SvNumberformat"],
    },
    {
      module: "src/svl/source/numbers/zforlist.ts",
      names: [
        "ImpGetFormatCodeIndex",
        "ImpAdjustFormatCodeDefault",
        "SvNFFormatData",
        "SvNFLanguageData",
        "SvNumberFormatter",
        "generateStandardNumberFormat",
      ],
    },
    {
      module: "src/svl/source/numbers/zforscan.ts",
      names: ["extractStandardGeneralName", "ImpSvNumberformatScan", "KeywordLocalization"],
    },
    { module: "src/sal/inc/rtl/math.ts", names: ["round"] },
    { module: "src/i18npool/source/localedata/localedata.ts", names: ["getLocaleFormatElements"] },
    { module: "src/udkapi/com/sun/star/lang/Locale.ts", names: ["Locale"] },
    { module: "src/i18npool/inc/numberformatcode.ts", names: ["NumberFormatCodeMapper"] },
    { module: "src/offapi/com/sun/star/i18n/NumberFormatCode.ts", names: ["NumberFormatCode"] },
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
        rowContext.setTabRange(0, 0);
        rowClip.GetBreakIterator(
          /** Actual native script service binding. @returns Service. */ () =>
            new n.BreakIteratorImpl(),
        );
        doc.SetAutoCalc(false);
        doc.SetInsertingFromOtherDoc(true);
        const rowPrepared = n.CopyOneCellFromClip.call(doc, rowContext, 6, 8, 8, 9);
        const preparedScripts = [
          rowContext.getSingleCellAttr(0).mnScriptType,
          rowContext.getSingleCellAttr(1).mnScriptType,
        ];
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
        const general = n.formatStandardNumber(1e-10, 65535, 46),
          input = n.formatStandardNumber(1e-10, 65534, 46),
          language = n.unicode("de"),
          country = n.unicode("DE"),
          variant = n.unicode(""),
          locale = new n.Locale(language, country, variant),
          numberFormats = n.getLocaleFormatElements(locale),
          mapper = new n.NumberFormatCodeMapper(),
          mapped = mapper.getDefault(2, 4, locale),
          mappedSequence = mapper.getAllFormatCodes(locale),
          decimal = n.unicode(",");
        n.ImpAdjustFormatCodeDefault(
          mappedSequence.getArray() as import("../../src/cppu/inc/com/sun/star/uno/Sequence").SequenceElements,
          mappedSequence.getLength(),
        );
        const selectedFormat = n.ImpGetFormatCodeIndex(mappedSequence, 0, decimal),
          standardName = n.extractStandardGeneralName(
            n.NumberFormatCode.borrowed(mappedSequence.operatorIndex(selectedFormat)).Code,
          ),
          scanner = new n.ImpSvNumberformatScan(
            locale,
            standardName,
            n.KeywordLocalization.AllowEnglish,
          ),
          code = n.unicode("general"),
          compiledCheck: [number] = [-1],
          compiled = new n.SvNumberformat(code, scanner, compiledCheck, [0x0407]),
          compiledOut = n.unicode("");
        compiled.SetStandard();
        compiled.GetOutputString(0.125, compiledOut, [null], 65535, 44);
        const compiledCopy = new n.SvNumberformat(compiled),
          formatTable = new n.SvNFFormatData();
        n.generateStandardNumberFormat(formatTable, mapper, locale, scanner, [0x0407], decimal, 0);
        const tableEntry = formatTable.GetEntry(0);
        if (!tableEntry) throw Error("Missing actual generated General entry");
        tableEntry.GetOutputString(12.5, compiledOut, [null], 65535, 44);
        const tableOutput = n.text(compiledOut);
        const languageData = new n.SvNFLanguageData(mapper, 0x0407),
          originalScanner = languageData.GetFormatScanner(),
          languageTable = new n.SvNFFormatData();
        languageData.ChangeStandardPrec(65535);
        languageData.ChangeIntl(0x0409);
        n.generateStandardNumberFormat(
          languageTable,
          mapper,
          languageData.fields.locale,
          languageData.GetFormatScanner(),
          languageData.fields.ActLnge,
          languageData.GetNumDecimalSep(),
          0,
        );
        const languageEntry = languageTable.GetEntry(0);
        if (!languageEntry) throw Error("Missing actual language-owned General entry");
        languageEntry.GetOutputString(
          12.5,
          compiledOut,
          [null],
          languageData.GetStandardPrec(),
          languageData.GetNumDecimalSep().getStr()[0] as number,
        );
        const languageState = {
          initial: languageData.GetIniLanguage(),
          decimal: n.text(languageData.GetNumDecimalSep()),
          thousand: n.text(languageData.GetNumThousandSep()),
          scannerRetained: originalScanner === languageData.GetFormatScanner(),
          precision: languageData.GetStandardPrec(),
          code: n.text(languageEntry.GetFormatstring()),
          output: n.text(compiledOut),
        };
        languageTable.dispose();
        languageData.dispose();
        const formatter = new n.SvNumberFormatter(0x0407);
        formatter.ChangeStandardPrec(65535);
        formatter.ChangeNullDate(32, 2, 1999);
        formatter.SetYear2000(1980);
        formatter.GetOutputString(12.5, 0, compiledOut, [null]);
        const formatterState = {
          output: n.text(compiledOut),
          type: formatter.GetType(0),
          nullDate: formatter.GetNullDate().GetDate(),
          year: formatter.GetYear2000(),
        };
        formatter.dispose();

        compiledCopy.GetOutputString(0.125, compiledOut, [null], 65535, 44);
        const compiledOutput = n.text(compiledOut);
        const pooledFormatter = doc.GetFormatTable();
        pooledFormatter.ChangeStandardPrec(65535);
        pooledFormatter.GetOutputString(42.125, 0, compiledOut, [null]);
        const pooledFormatting = {
          output: n.text(compiledOut),
          shared: undo.GetFormatTable() === pooledFormatter,
        };
        const formatFoundation = {
          pooledFormatting,
          formatterState,
          languageState,
          tableOutput,
          tableType: formatTable.GetType(0),
          tableLastKey: tableEntry.GetLastInsertKey(),
          tableStandard: tableEntry.IsStandard(),
          compiledCheck: compiledCheck[0],
          compiledCode: n.text(compiledCopy.GetFormatstring()),
          compiledType: compiledCopy.GetMaskedType(),
          compiledOutput,
          selectedFormat,
          standardName: n.text(standardName),
          general: n.text(general),
          input: n.text(input),
          correctedRound: n.round(16.83 * 650),
          localeGeneral: numberFormats.find(
            /** Reads the native General format record. @param row - Original value row. @returns Match. */
            (row) => row.formatIndex === 0,
          )?.formatCode,
          localeFormats: numberFormats.length,
          mappedCode: n.text(mapped.Code),
          mappedType: mapped.Type,
          mappedUsage: mapped.Usage,
          mappedCount: mappedSequence.getLength(),
          mappedFirst: n.text(n.NumberFormatCode.borrowed(mappedSequence.operatorIndex(0)).Code),
        };
        formatTable.dispose();
        compiledCopy.dispose();
        compiledOut.dispose();
        compiled.dispose();
        code.dispose();
        scanner.dispose();
        standardName.dispose();
        decimal.dispose();
        mappedSequence.dispose();
        mapper.dispose();
        const retainedMappedCode = n.text(mapped.Code);
        if (retainedMappedCode !== formatFoundation.mappedCode)
          throw Error("Mapper return lifetime changed");
        mapped.dispose();
        general.dispose();
        input.dispose();
        locale.dispose();
        language.dispose();
        country.dispose();
        variant.dispose();
        const pasteDocument = new n.ScDocument(),
          pasteClip = new n.ScDocument(n.ScDocumentMode.SCDOCMODE_CLIP);
        pasteDocument.InsertTab(0, n.unicode("Paste"));
        pasteDocument.SetValue(new n.ScAddress(), 10);
        pasteDocument.SetFormula(new n.ScAddress(1, 0, 0), n.unicode("=A1+1"), grammar);
        pasteDocument.GetValue(new n.ScAddress(1, 0, 0));
        pasteClip.ResetClip(pasteDocument, 0);
        pasteClip.SetClipArea(new n.ScRange(0, 0, 0, 1, 0, 0));
        pasteDocument.CopyToDocument(
          new n.ScRange(0, 0, 0, 1, 0, 0),
          n.InsertDeleteFlags.CONTENTS,
          false,
          pasteClip,
        );
        pasteClip.GetBreakIterator(
          /** Uses the actual existing script service. @returns Service. */ () =>
            new n.BreakIteratorImpl(),
        );
        const pasteMarks = new n.ScMarkData(pasteDocument.GetSheetLimits());
        pasteMarks.SelectTable(0, true);
        pasteDocument.CopyFromClip(
          new n.ScRange(2, 3, 0, 3, 5, 0),
          pasteMarks,
          n.InsertDeleteFlags.CONTENTS,
          null,
          pasteClip,
        );
        const beforePasteChange = pasteDocument.GetValue(new n.ScAddress(3, 5, 0));
        pasteDocument.SetValue(new n.ScAddress(2, 5, 0), 20);
        const firstPublicPaste = {
          before: beforePasteChange,
          after: pasteDocument.GetValue(new n.ScAddress(3, 5, 0)),
          autoCalc: pasteDocument.GetAutoCalc(),
          inserting: pasteDocument.IsInsertingFromOtherDoc(),
          exchange: pasteDocument.GetFormatExchangeList(),
        };
        pasteDocument.SetValue(new n.ScAddress(0, 1, 0), 30);
        pasteDocument.SetTextCell(new n.ScAddress(1, 1, 0), n.unicode("tail"));
        pasteClip.ResetClip(pasteDocument, 0);
        pasteClip.SetClipArea(new n.ScRange(0, 0, 0, 1, 1, 0));
        pasteDocument.CopyToDocument(
          new n.ScRange(0, 0, 0, 1, 1, 0),
          n.InsertDeleteFlags.CONTENTS,
          false,
          pasteClip,
        );
        pasteDocument.CopyFromClip(
          new n.ScRange(6, 10, 0, 7, 13, 0),
          pasteMarks,
          n.InsertDeleteFlags.CONTENTS,
          null,
          pasteClip,
        );
        const publicPaste = {
          ...firstPublicPaste,
          generic: [
            pasteDocument.GetValue(new n.ScAddress(6, 10, 0)),
            pasteDocument.GetValue(new n.ScAddress(6, 11, 0)),
            pasteDocument.GetValue(new n.ScAddress(6, 12, 0)),
            pasteDocument.GetValue(new n.ScAddress(6, 13, 0)),
            pasteDocument.GetValue(new n.ScAddress(7, 10, 0)),
          ],
        };
        pasteClip.Dispose();
        pasteDocument.Dispose();
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
          publicPaste,
          rowPrepared,
          preparedScripts,
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
          formatFoundation,
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
              ")().then(value=>postMessage({value,dom:typeof document}),error=>postMessage({error:String(error)}));",
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
              ) => {
                if (event.data.error) reject(Error(event.data.error));
                else resolve(event.data);
              };
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
    publicPaste: {
      before: 11,
      after: 21,
      autoCalc: true,
      inserting: false,
      exchange: null,
      generic: [10, 30, 10, 30, 11],
    },
    rowPrepared: true,
    preparedScripts: [1, 1],
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
    formatFoundation: {
      pooledFormatting: { output: "42.125", shared: true },
      formatterState: { output: "12,5", type: 16, nullDate: 19990304, year: 1980 },
      languageState: {
        initial: 0x0407,
        decimal: ".",
        thousand: ",",
        scannerRetained: true,
        precision: 65535,
        code: "General",
        output: "12.5",
      },
      tableOutput: "12,5",
      tableType: 16,
      tableLastKey: 100,
      tableStandard: true,
      compiledCheck: 0,
      compiledCode: "Standard",
      compiledType: 16,
      compiledOutput: "0,125",
      selectedFormat: 0,
      standardName: "Standard",
      general: "1E-10",
      input: "0.0000000001",
      correctedRound: 10940,
      localeGeneral: "Standard",
      localeFormats: 55,
      mappedCode: "Standard",
      mappedType: 2,
      mappedUsage: 4,
      mappedCount: 55,
      mappedFirst: "Standard",
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
