/** @fileoverview Source-owned clipboard reset,sparse sheet and pooled-resource lifetime acceptance. */
import type { ScTable } from "../../../inc/table";
import { expect, it } from "vitest";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScMarkData } from "../../../inc/markdata";
import { ScClipParam } from "../../../inc/clipparam";
import { ScDocOptions } from "../../../inc/docoptio";
import { ScFormulaCell } from "../../../inc/formulacell";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { SetFormulaDirtyContext } from "../../../inc/refupdatecontext";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it("shares genuine pools and retains the same resources after source closure", /** Lazy source attribute initialization precedes sharing. @returns Nothing. */ () => {
  const source = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  source.InsertTab(0, unicode("Data"));
  const separateStrings = clip.GetSharedStringPool();
  clip.SharePooledResources(source);
  expect(clip.GetPool()).toBe(source.GetPool());
  expect(clip.GetStyleSheetPool()).toBe(source.GetStyleSheetPool());
  expect(clip.GetSharedStringPool()).toBe(source.GetSharedStringPool());
  expect(clip.GetSharedStringPool()).not.toBe(separateStrings);
  expect(clip.getCellAttributeHelper()).toBe(source.getCellAttributeHelper());
  const helper = clip.getCellAttributeHelper(),
    pool = clip.GetPool();
  source.Dispose();
  expect(clip.GetPool()).toBe(pool);
  expect(clip.getCellAttributeHelper()).toBe(helper);
  expect(clip.GetStyleSheetPool()?.GetDocument()).toBe(null);
  clip.Dispose();
});
it("resets a sparse clipboard at the original sheet index and copies options by value", /** Explicit-sheet ResetClip retains the native baeh name. @returns Nothing. */ () => {
  const source = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  for (const name of ["First", "Second", "Third"])
    source.InsertTab(source.GetTableCount(), unicode(name));
  source.FetchTable(2)?.SetLayoutRTL(true);
  const options = new ScDocOptions(source.GetDocOptions());
  options.SetIterCount(37);
  source.SetDocOptions(options);
  clip.ResetClip(source, 2);
  expect(clip.GetTableCount()).toBe(3);
  expect([clip.FetchTable(0), clip.FetchTable(1), clip.FetchTable(-1), clip.FetchTable(3)]).toEqual(
    [null, null, null, null],
  );
  expect(text((clip.FetchTable(2) as ScTable).GetName())).toBe("baeh");
  expect(clip.FetchTable(2)?.IsLayoutRTL()).toBe(true);
  expect(clip.GetAutoCalc()).toBe(false);
  expect(clip.GetDocOptions()).not.toBe(source.GetDocOptions());
  expect(clip.GetDocOptions().GetIterCount()).toBe(37);
  expect(clip.GetViewOptions()).not.toBe(source.GetViewOptions());
  options.SetIterCount(41);
  source.SetDocOptions(options);
  expect(clip.GetDocOptions().GetIterCount()).toBe(37);
  clip.SetAllFormulasDirty(new SetFormulaDirtyContext());
  clip.Dispose();
  source.Dispose();
});
it("releases previous real formulas before resetting source-selected sheets and resource owners", /** Selected-sheet and all-sheet overloads preserve holes. @returns Nothing. */ () => {
  const first = new ScDocument(),
    second = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  first.InsertTab(0, unicode("Old"));
  for (const name of ["Alpha", "Beta", "Gamma"])
    second.InsertTab(second.GetTableCount(), unicode(name));
  clip.ResetClip(first, 0);
  clip.SetFormulaCell(
    new ScAddress(),
    new ScFormulaCell(first, new ScAddress(), unicode("=1+2"), FormulaGrammar.Grammar.GRAM_NATIVE),
  );
  const marks = new ScMarkData(second.GetSheetLimits());
  marks.SelectTable(1, true);
  marks.SelectTable(2, true);
  clip.ResetClip(second, marks);
  expect(clip.FetchTable(0)).toBe(null);
  expect(text((clip.FetchTable(1) as ScTable).GetName())).toBe("Beta");
  expect(text((clip.FetchTable(2) as ScTable).GetName())).toBe("Gamma");
  expect(clip.GetSharedStringPool()).toBe(second.GetSharedStringPool());
  const nested = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  nested.ResetClip(clip, null);
  expect(nested.GetTableCount()).toBe(3);
  expect(nested.FetchTable(0)).toBe(null);
  nested.Clear();
  expect(nested.GetTableCount()).toBe(0);
  nested.ResetClip(second, new ScMarkData(second.GetSheetLimits()));
  expect(nested.GetTableCount()).toBe(0);
  nested.Dispose();
  clip.Dispose();
  first.Dispose();
  second.Dispose();
});
it("retains clipboard parameters across Clear and keeps normal-document reset diagnostic no-ops", /** Native no-op branches preserve existing content. @returns Nothing. */ () => {
  const source = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP),
    missing = new ScDocument();
  source.InsertTab(0, unicode("Data"));
  source.ResetClip(missing, 0);
  source.SetClipArea(new ScRange());
  expect(source.GetTableCount()).toBe(1);
  expect(source.GetClipParam().maRanges.empty()).toBe(true);
  clip.ResetClip(source, 4);
  expect(clip.FetchTable(4)?.IsLayoutRTL()).toBe(false);
  clip.SetClipArea(new ScRange(2, 3, 4, 5, 7, 4), true);
  const parameters = clip.GetClipParam();
  clip.Clear();
  expect(clip.GetClipParam()).toBe(parameters);
  expect(parameters.mbCutMode).toBe(true);
  expect(parameters.maRanges.size()).toBe(1);
  const copy = new ScClipParam(parameters);
  clip.SetClipParam(copy);
  copy.maRanges.RemoveAll();
  expect(clip.GetClipParam().maRanges.size()).toBe(1);
  clip.Dispose();
  source.Dispose();
  missing.Dispose();
});
it("reports inclusive clipboard extents and counts filtered rows on the first actual sparse sheet", /** Empty and nonclipboard reads preserve outputs. @returns Nothing. */ () => {
  const source = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP),
    x: [number] = [17],
    y: [number] = [19];
  source.GetClipArea(x, y, true);
  expect([x[0], y[0]]).toEqual([17, 19]);
  clip.GetClipArea(x, y, false);
  expect([x[0], y[0]]).toEqual([17, 19]);
  clip.ResetClip(source, 2);
  clip.SetClipArea(new ScRange(3, 4, 2, 4, 8, 2));
  clip.GetClipParam().maRanges.push_back(new ScRange(1, 2, 2, 6, 9, 2));
  clip.GetClipArea(x, y, true);
  expect([x[0], y[0]]).toEqual([5, 7]);
  clip.SetRowFiltered(2, 4, 2, true);
  clip.GetClipArea(x, y, false);
  expect([x[0], y[0]]).toEqual([5, 4]);
  clip.SetRowFiltered(2, 9, 2, true);
  clip.GetClipArea(x, y, false);
  expect([x[0], y[0]]).toEqual([5, 0]);
  clip.Dispose();
  source.Dispose();
});
