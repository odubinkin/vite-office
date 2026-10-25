/** @fileoverview Native detached formula relocation, reference ordering and token ownership contracts. */
import { expect, it } from "vitest";
import { ScAddress } from "../../../inc/address";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { StartListeningContext, EndListeningContext } from "../../../inc/listenercontext";
import { SfxStyleFamily, SfxStyleSearchBits } from "../../../../svl/inc/style-values";
import { ScFormulaCell } from "../../../inc/formulacell";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it("relocates mixed relative and absolute references through tokens and adopts dependency listeners only on insertion", /** Original copy retains its cached value until the document inserts and dirties it. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const sourcePosition = new ScAddress(2, 2, 0),
    destination = new ScAddress(3, 3, 0),
    grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
  doc.SetValue(new ScAddress(0, 0, 0), 2);
  doc.SetValue(new ScAddress(0, 1, 0), 3);
  doc.SetValue(new ScAddress(1, 0, 0), 5);
  doc.SetValue(new ScAddress(1, 1, 0), 7);
  doc.SetFormula(sourcePosition, unicode("=A1+$A1+A$1+$A$1"), grammar);
  const source = doc.GetFormulaCell(sourcePosition) as ScFormulaCell;
  expect(source.GetValue()).toBe(8);
  const copy = source.Clone(destination);
  expect(text(copy.GetFormula(grammar))).toBe("=B2+$A2+B$1+$A$1");
  expect(copy.GetCode()).not.toBe(source.GetCode());
  expect(copy.GetCode().GetArray()?.[0]).not.toBe(source.GetCode().GetArray()?.[0]);
  expect(copy.GetValue()).toBe(8);
  expect(copy.GetDirty()).toBe(false);
  doc.SetValue(new ScAddress(1, 1, 0), 11);
  expect(copy.GetDirty()).toBe(false);
  doc.SetFormulaCell(destination, copy);
  expect(doc.GetValue(destination)).toBe(21);
  doc.SetValue(new ScAddress(1, 0, 0), 13);
  expect(copy.GetDirty()).toBe(true);
  expect(doc.GetValue(destination)).toBe(29);
  expect(doc.GetValue(sourcePosition)).toBe(8);
});

it("orders mixed range endpoints at the new position without changing source tokens", /** Moving an absolute/relative endpoint across the other swaps native coordinate flags. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const grammar = FormulaGrammar.Grammar.GRAM_NATIVE,
    source = new ScFormulaCell(doc, new ScAddress(2, 2, 0), unicode("=SUM(A1:$B$2)"), grammar),
    copy = source.Clone(new ScAddress(5, 5, 0));
  expect(text(source.GetFormula(grammar))).toBe("=SUM(A1:$B$2)");
  expect(text(copy.GetFormula(grammar))).toBe("=SUM($B$2:D4)");
  source.Dispose();
  copy.Dispose();
});

it("retains cached values on detached out-of-bounds copies and reports the native reference error after adoption", /** Relative coordinates remain relative rather than being clamped to the sheet. @returns Nothing. */ () => {
  for (const bottom of [false, true]) {
    const doc = new ScDocument();
    doc.InsertTab(0, unicode("Data"));
    const sourcePosition = bottom ? new ScAddress() : new ScAddress(1, 0, 0),
      input = bottom ? new ScAddress(0, 1, 0) : new ScAddress(),
      destination = bottom ? new ScAddress(0, doc.MaxRow(), 0) : new ScAddress();
    doc.SetValue(input, 4);
    doc.SetFormula(
      sourcePosition,
      unicode(bottom ? "=A2*2" : "=A1*2"),
      FormulaGrammar.Grammar.GRAM_NATIVE,
    );
    const source = doc.GetFormulaCell(sourcePosition) as ScFormulaCell;
    expect(source.GetValue()).toBe(8);
    const copy = source.Clone(destination);
    expect(copy.GetValue()).toBe(8);
    expect(copy.GetDirty()).toBe(false);
    doc.SetFormulaCell(destination, copy);
    expect(copy.GetErrCode()).toBe(FormulaError.NoRef);
    expect(copy.GetDirty()).toBe(false);
    doc.Dispose();
  }
});

it.each([
  [ScDocumentMode.SCDOCMODE_DOCUMENT, false, false, false, true],
  [ScDocumentMode.SCDOCMODE_CLIP, true, false, false, false],
  [ScDocumentMode.SCDOCMODE_UNDO, false, true, false, false],
  [ScDocumentMode.SCDOCMODE_FUNCTIONACCESS, false, false, true, true],
] as const)(
  "constructs native mode %s with original resources and defaults",
  /** Reads actual allocation identities, never a mode surrogate. @param mode - Native mode. @param clip - Clipboard flag. @param undo - Undo flag. @param functions - Function-access flag. @param resources - Own resources. @returns Nothing. */ (
    mode,
    clip,
    undo,
    functions,
    resources,
  ) => {
    const doc = new ScDocument(mode),
      other = new ScDocument(mode);
    expect(doc.IsClipboard()).toBe(clip);
    expect(doc.IsUndo()).toBe(undo);
    expect(doc.IsClipOrUndo()).toBe(clip || undo);
    expect(doc.IsFunctionAccess()).toBe(functions);
    expect(doc.GetAutoCalc()).toBe(resources);
    expect(doc.GetNoListening()).toBe(false);
    expect(doc.GetSharedStringPool()).not.toBe(other.GetSharedStringPool());
    const pool = doc.GetPool(),
      styles = doc.GetStyleSheetPool();
    if (resources) {
      expect(pool).not.toBeNull();
      expect(pool).not.toBe(other.GetPool());
      expect(doc.GetPool()).toBe(pool);
      expect(doc.GetBASM()).not.toBeNull();
      expect(styles?.GetDocument()).toBe(doc);
      expect(styles?.GetPool()).toBe(pool);
      expect(doc.getCellAttributeHelper()).toBe(doc.getCellAttributeHelper());
      expect(doc.getCellAttributeHelper().GetPool()).toBe(pool);
      doc.InsertTab(0, unicode("Mode data"));
      doc.SetValue(new ScAddress(), 3);
      const formulaPosition = new ScAddress(1, 0, 0);
      doc.SetFormula(formulaPosition, unicode("=A1+2"), FormulaGrammar.Grammar.GRAM_NATIVE);
      expect(doc.GetValue(formulaPosition)).toBe(5);
      doc.SetValue(new ScAddress(), 7);
      expect(doc.GetValue(formulaPosition)).toBe(9);
      expect(
        /** Exercises the explicit Calc factory boundary. @returns No style. */ () =>
          styles?.Make(
            unicode("Unported Calc style"),
            SfxStyleFamily.Para,
            SfxStyleSearchBits.UserDefined,
          ),
      ).toThrow("native Calc style factory is not ported");
    } else {
      expect(pool).toBeNull();
      expect(styles).toBeNull();
      expect(doc.GetBASM()).toBeNull();
      expect(
        /** An unshared temporary document must not manufacture a pool. @returns No helper. */ () =>
          doc.getCellAttributeHelper(),
      ).toThrow("needs to be shared");
      const cell = new ScFormulaCell(
        doc,
        new ScAddress(),
        unicode("=1+2"),
        FormulaGrammar.Grammar.GRAM_NATIVE,
      );
      cell.SetNeedsListening(true);
      cell.StartListeningTo(doc);
      cell.StartListeningTo(new StartListeningContext(doc));
      expect(cell.NeedsListening()).toBe(true);
      expect(cell.HasBroadcaster()).toBe(false);
      cell.EndListeningTo(doc);
      cell.EndListeningTo(new EndListeningContext(doc));
      cell.Dispose();
    }
    doc.Dispose();
    other.Dispose();
    expect(styles?.GetDocument() ?? null).toBeNull();
    expect(doc.GetPool()).toBeNull();
    expect(doc.GetStyleSheetPool()).toBeNull();
  },
);

it("retains native start/end asymmetry for no-listening and change-track flags", /** Real registered references prove suppression and deferred cleanup. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  doc.SetValue(new ScAddress(), 4);
  const cell = new ScFormulaCell(
      doc,
      new ScAddress(1, 0, 0),
      unicode("=A1+1"),
      FormulaGrammar.Grammar.GRAM_NATIVE,
    ),
    start = new StartListeningContext(doc),
    end = new EndListeningContext(doc);
  expect(cell.IsInChangeTrack()).toBe(false);
  for (const context of [false, true]) {
    cell.SetNeedsListening(true);
    doc.SetNoListening(true);
    cell.StartListeningTo(context ? start : doc);
    expect(cell.HasBroadcaster()).toBe(false);
    expect(cell.NeedsListening()).toBe(true);
    doc.SetNoListening(false);
    cell.SetInChangeTrack(true);
    cell.StartListeningTo(context ? start : doc);
    expect(cell.HasBroadcaster()).toBe(false);
    cell.SetInChangeTrack(false);
    cell.StartListeningTo(context ? start : doc);
    expect(cell.HasBroadcaster()).toBe(true);
    expect(cell.NeedsListening()).toBe(false);
    cell.SetInChangeTrack(true);
    cell.EndListeningTo(context ? end : doc);
    expect(cell.HasBroadcaster()).toBe(true);
    cell.SetInChangeTrack(false);
    doc.SetNoListening(true);
    cell.EndListeningTo(context ? end : doc);
    expect(cell.HasBroadcaster()).toBe(false);
    end.purgeEmptyBroadcasters();
    doc.SetNoListening(false);
  }
  cell.Dispose();
  doc.Dispose();
});

it("copies into native clipboard mode without ordinary-document reference invalidation or error reset", /** The actual mode owner selects copy-constructor branches before clipboard sharing is implemented. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO),
    grammar = FormulaGrammar.Grammar.GRAM_NATIVE,
    source = new ScFormulaCell(doc, new ScAddress(1, 1, 0), unicode("=A1+$A$1"), grammar),
    copy = new ScFormulaCell(source, clip, new ScAddress(1, 0, 0));
  expect(copy.GetCode()).not.toBe(source.GetCode());
  // Relative offsets remain native offsets; no deleted-reference flags are set in clipboard copies.
  expect(text(copy.GetFormula(grammar))).toContain("$A$1");
  expect(copy.GetCode().GetCodeError()).toBe(FormulaError.NONE);
  expect(copy.IsInChangeTrack()).toBe(false);
  const second = copy.Clone();
  expect(second.GetCode()).not.toBe(copy.GetCode());
  const bad = new ScFormulaCell(doc, new ScAddress(), unicode("=1+"), grammar),
    retained = new ScFormulaCell(bad, clip, new ScAddress());
  expect(bad.GetCode().GetCodeError()).not.toBe(FormulaError.NONE);
  expect(retained.GetCode().GetCodeError()).toBe(bad.GetCode().GetCodeError());
  const undoSource = new ScFormulaCell(
      undo,
      new ScAddress(1, 1, 0),
      source.GetCode().Clone(),
      grammar,
    ),
    undoCopy = undoSource.Clone(new ScAddress(1, 0, 0));
  expect(undoCopy.GetCode().GetCodeError()).toBe(FormulaError.NONE);
  const invalidUndo = new ScFormulaCell(undo, new ScAddress(), bad.GetCode().Clone(), grammar),
    deferred = invalidUndo.Clone();
  expect(invalidUndo.GetCode().GetCodeError()).not.toBe(FormulaError.NONE);
  expect(deferred.GetCode().GetCodeError()).toBe(FormulaError.NONE);
  expect(deferred.GetCode().GetCodeLen()).toBe(invalidUndo.GetCode().GetCodeLen());
  for (const cell of [
    source,
    copy,
    second,
    bad,
    retained,
    undoSource,
    undoCopy,
    invalidUndo,
    deferred,
  ])
    cell.Dispose();
  doc.Dispose();
  clip.Dispose();
  undo.Dispose();
});

it.each(["=$A$1+A1", "=SUM($A$1:$A$1)+SUM(A1:A1)"])(
  "ends valid subscriptions beside genuinely relocated invalid references: %s",
  /** A copy across the first row creates native invalid relative references while the absolute reference remains live. @param formula - Original reference expression. @returns Nothing. */ (
    formula,
  ) => {
    const doc = new ScDocument();
    doc.InsertTab(0, unicode("Data"));
    doc.SetValue(new ScAddress(), 2);
    const source = new ScFormulaCell(
        doc,
        new ScAddress(1, 1, 0),
        unicode(formula),
        FormulaGrammar.Grammar.GRAM_NATIVE,
      ),
      position = new ScAddress(1, 0, 0),
      copy = source.Clone(position),
      start = new StartListeningContext(doc),
      end = new EndListeningContext(doc);
    doc.SetFormulaCell(position, copy);
    expect(copy.HasBroadcaster()).toBe(true);
    copy.EndListeningTo(doc);
    expect(copy.HasBroadcaster()).toBe(false);
    copy.StartListeningTo(start);
    expect(copy.HasBroadcaster()).toBe(true);
    copy.EndListeningTo(end);
    expect(copy.HasBroadcaster()).toBe(false);
    end.purgeEmptyBroadcasters();
    expect(text(copy.GetFormula(FormulaGrammar.Grammar.GRAM_NATIVE))).toContain("#REF!");
    source.Dispose();
    doc.Dispose();
  },
);

it("rejects lazy attribute creation after observable document closure", /** A genuine empty document closes before any attribute helper is needed;late consumers must not manufacture a replacement pool. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.Dispose();
  expect(doc.GetPool()).toBeNull();
  expect(
    /** Exercises the consumed native no-pool diagnostic after actual resource release. @returns No helper. */ () =>
      doc.getCellAttributeHelper(),
  ).toThrow("No SfxItemPool");
});
