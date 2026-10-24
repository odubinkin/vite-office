/** @fileoverview Source-owned clipboard reset,sparse sheet and pooled-resource lifetime acceptance. */
import { SimpleReferenceObject } from "../../../../salhelper/source/simplereferenceobject";
import { ScPoolHelper } from "./poolhelp";
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

it("owns one lazy formatter across real source, clipboard and undo lifetimes", /** The final intrusive owner releases the actual parsed format string. @returns Nothing. */ () => {
  const source = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  const options = new ScDocOptions(source.GetDocOptions());
  options.SetDate(1, 1, 1904);
  options.SetStdPrecision(5);
  options.SetYear2000(1975);
  source.SetDocOptions(options);
  const formatter = source.GetFormatTable();
  expect(formatter.GetStandardPrec()).toBe(5);
  expect(formatter.GetYear2000()).toBe(1975);
  expect(formatter.GetNullDate().GetDate()).toBe(19040101);
  clip.SharePooledResources(source);
  clip.SharePooledResources(source);
  undo.SharePooledResources(clip);
  expect(clip.GetFormatTable()).toBe(formatter);
  expect(undo.GetFormatTable()).toBe(formatter);
  const entry = formatter.GetEntry(0);
  if (!entry) throw Error("Missing native General entry");
  const body = entry.GetFormatstring().pData;
  if (!body) throw Error("Missing actual General string body");
  const refs = body.refCount;
  source.Dispose();
  expect(body.refCount).toBe(refs);
  expect(clip.GetFormatTable()).toBe(formatter);
  clip.Dispose();
  expect(body.refCount).toBe(refs);
  undo.Dispose();
  expect(body.refCount).toBeLessThan(refs);
});
it("updates existing formatter options and releases replaced pooled owners", /** A real helper factory also starts with native default options independently of the source document. @returns Nothing. */ () => {
  const source = new ScDocument(),
    replacement = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  const formatter = source.GetFormatTable();
  const options = new ScDocOptions(source.GetDocOptions());
  options.SetDate(2, 3, 1901);
  options.SetStdPrecision(7);
  options.SetYear2000(1980);
  source.SetDocOptions(options);
  expect(source.GetFormatTable()).toBe(formatter);
  expect(formatter.GetStandardPrec()).toBe(7);
  expect(formatter.GetYear2000()).toBe(1980);
  expect(formatter.GetNullDate().GetDate()).toBe(19010302);
  const helper = new ScPoolHelper(source);
  helper.acquire();
  const independent = helper.CreateNumberFormatter();
  expect(independent.GetStandardPrec()).toBe(new ScDocOptions().GetStdPrecision());
  independent.dispose();
  helper.SourceDocumentGone();
  expect(
    /** Exercises the native absent-source assertion. @returns No formatter. */ () =>
      helper.CreateNumberFormatter(),
  ).toThrow("Source style-pool document assertion");
  helper.release();
  clip.SharePooledResources(source);
  source.Dispose();
  const entry = formatter.GetEntry(0);
  if (!entry) throw Error("Missing native General entry");
  const body = entry.GetFormatstring().pData;
  if (!body) throw Error("Missing actual General string body");
  const refs = body.refCount;
  clip.SharePooledResources(replacement);
  expect(body.refCount).toBeLessThan(refs);
  expect(clip.GetFormatTable()).toBe(replacement.GetFormatTable());
  clip.Dispose();
  replacement.Dispose();
  const empty = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  expect(
    /** Exercises the native absent-helper dereference precondition. @returns No formatter. */ () =>
      empty.GetFormatTable(),
  ).toThrow("Document pool helper assertion");
  empty.Dispose();
});
it("retains native intrusive staticization and zero-count virtual destruction", /** A real derived native reference object exposes its protected lifetime hooks for assertions. @returns Nothing. */ () => {
  /** Actual derived native reference object with observable virtual destruction. */
  class Reference extends SimpleReferenceObject {
    destroyed = false;
    /** Exposes native protected staticization. @returns Nothing. */
    makeStatic(): void {
      this.staticize();
    }
    /** Exposes the native protected destructor assertion. @returns Nothing. */
    assertDestroyed(): void {
      super.destroy();
    }
    /** Virtual derived destructor participates in the actual base release. @returns Nothing. */
    protected override destroy(): void {
      this.destroyed = true;
      super.destroy();
    }
  }
  const value = new Reference();
  value.acquire();
  value.acquire();
  value.release();
  expect(value.destroyed).toBe(false);
  expect(
    /** Exercises the native live-reference destructor assertion. @returns Nothing. */ () =>
      value.assertDestroyed(),
  ).toThrow("count-zero");
  value.release();
  expect(value.destroyed).toBe(true);
  const permanent = new Reference();
  permanent.makeStatic();
  permanent.acquire();
  permanent.release();
  expect(permanent.destroyed).toBe(false);
});
