/** @fileoverview Original RTF language control routing, group state, paragraph emission and native Locale/item round-trip. */
import { afterEach, assert, expect, it } from "vitest";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import { RtfExport } from "../../filter/ww8/rtfexport";
import { RunType, type RtfState } from "./rtfdocumentimpl.context";
import { getNestedAttribute } from "./rtfdocumentimpl.properties";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { SwDoc } from "../../core/doc/doc";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import * as H from "../../../inc/hintids";
const docs: SwDoc[] = [];
afterEach(
  /** Releases actual imported models. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Parses original ASCII RTF through live tokenizer state feedback. @param source - RTF bytes. @returns Actual model. */
function read(source: string): SwDoc {
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  docs.push(doc);
  return doc;
}
for (const [flags, script, state] of [
  ["", 1, RunType.NONE],
  ["\\loch", 1, RunType.LOCH],
  ["\\hich", 3, RunType.HICH],
  ["\\dbch", 2, RunType.DBCH],
  ["\\ltrch", 1, RunType.LTRCH_RTLCH_1],
  ["\\ltrch\\rtlch", 3, RunType.LTRCH_RTLCH_2],
  ["\\rtlch", 3, RunType.RTLCH_LTRCH_1],
  ["\\rtlch\\ltrch", 1, RunType.RTLCH_LTRCH_2],
] as const)
  for (const control of ["lang", "alang"])
    it(`routes ${flags}/${control} through native associated run type`, /** Text stays Latin; explicit native script queries prove slot selection independently. @returns Nothing. */ () => {
      let observed: RunType | undefined;
      /** Observes original parser run-type selection. */
      class Reader extends RtfDocumentImpl {
        /** Observes actual parser state without replacing dispatch or mapper behavior. @param value - Native decoded text. @param current - Actual group. @returns Nothing. */
        protected override AppendText(value: string, current: RtfState): void {
          observed = current.runType;
          super.AppendText(value, current);
        }
      }
      const doc = new Reader().ResolveBytes(
        new TextEncoder().encode(`{\\rtf1${flags}\\${control}1031 A}`),
      );
      docs.push(doc);
      expect(observed).toBe(state);
      const node = doc.paragraphs[0];
      assert(node);
      expect(node.GetLang(0, 1, script)).toBe(0x407);
    });
it("makes langfe CJK regardless of associated run type", /** HICH normally selects CTL for lang/alang, but not langfe. @returns Nothing. */ () => {
  const node = read(String.raw`{\rtf1\hich\langfe1041 A}`).paragraphs[0];
  assert(node);
  expect(node.GetLang(0, 1, 2)).toBe(0x411);
});
it("restores run type and actual language properties at group close", /** Both state and reference-counted property snapshots are original group values. @returns Nothing. */ () => {
  const node = read(String.raw`{\rtf1\loch\lang1031 A{\lang1036 B}\lang1040 C}`).paragraphs[0];
  assert(node);
  expect(
    [0, 1, 2].map(
      /** Reads one native text range. @param i - Offset. @returns Western language. */ (i) =>
        node.GetLang(i, 1, 1),
    ),
  ).toEqual([0x407, 0x40c, 0x410]);
});
it("uses the emitted paragraph language before later run changes", /** checkNeedPap must capture before text, rather than borrowing the final group's state. @returns Nothing. */ () => {
  const node = read(String.raw`{\rtf1\lang1031 A\lang1036 B}`).paragraphs[0];
  assert(node);
  const item = node.GetAttr(H.RES_CHRATR_LANGUAGE);
  assert(item instanceof SvxLanguageItem);
  expect(item.GetLanguage()).toBe(0x407);
  expect([node.GetLang(0, 1, 1), node.GetLang(1, 1, 1)]).toEqual([0x407, 0x40c]);
});
it("retains paragraph emission from a nested group after that group closes", /** Native mapper has already received the group's paragraph properties when its first text is emitted. @returns Nothing. */ () => {
  const node = read(String.raw`{\rtf1{\lang1031 A}B}`).paragraphs[0];
  assert(node);
  const item = node.GetAttr(H.RES_CHRATR_LANGUAGE);
  assert(item instanceof SvxLanguageItem);
  expect(item.GetLanguage()).toBe(0x407);
});
it("resets source run type with plain and paragraph direction markers", /** Associated direction state does not survive the original reset operations. @returns Nothing. */ () => {
  for (const flag of ["plain", "ltrpar", "rtlpar", "ltrrow", "rtlrow"]) {
    const node = read(`{\\rtf1\\hich\\${flag}\\lang1036 A}`).paragraphs[0];
    assert(node);
    expect(node.GetLang(0, 1, 1)).toBe(0x40c);
  }
});
it("narrows numeric IDs before LanguageTag conversion", /** UInt16 conversion precedes canonical BCP47 transport and native Locale mapping. @returns Nothing. */ () => {
  const node = read(String.raw`{\rtf1\lang66567 A}`).paragraphs[0];
  assert(node);
  expect(node.GetLang(0, 1, 1)).toBe(0x407);
});
it("keeps original zero-child default-language property nesting", /** These upstream branches do not assign nSprm after initializing it to zero; no invented val/bidi replacement is applied. @returns Nothing. */ () => {
  const observed: string[] = [];
  /** Observes original default-language property trees. */
  class Reader extends RtfDocumentImpl {
    /** Borrows the actual malformed property trees before normal text insertion. @param value - Text. @param state - Real group. @returns Nothing. */
    protected override AppendText(value: string, state: RtfState): void {
      for (const parent of [N.LN_EG_RPrBase_lang, N.LN_CT_Language_bidi]) {
        const p = getNestedAttribute(state.characterSprms, parent, 0);
        try {
          const s = p.operatorDereference().getString();
          try {
            observed.push(text(s));
          } finally {
            s.dispose();
          }
        } finally {
          p.dispose();
        }
      }
      super.AppendText(value, state);
    }
  }
  const doc = new Reader().ResolveBytes(
    new TextEncoder().encode(String.raw`{\rtf1\deflang1031\adeflang1036 A}`),
  );
  docs.push(doc);
  expect(observed).toEqual(["de-DE", "fr-FR"]);
});
it("imports language-bearing character and paragraph styles", /** Native style rPr properties use the same mapper/UNO item conversion as direct runs. @returns Nothing. */ () => {
  const node = read(
    String.raw`{\rtf1{\stylesheet{\s0\lang1031 Normal;}{\*\cs1\lang1036 French;}}\cs1 A}`,
  ).paragraphs[0];
  assert(node);
  expect(node.GetLang(0, 1, 1)).toBe(0x40c);
});
it("round-trips independent script languages through native RTF export and import", /** All values are actual pooled items on a current Writer paragraph. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1 A}`),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("A漢ع");
  for (const [which, id] of [
    [H.RES_CHRATR_LANGUAGE, 0x407],
    [H.RES_CHRATR_CJK_LANGUAGE, 0x411],
    [H.RES_CHRATR_CTL_LANGUAGE, 0x401],
  ] as const)
    node.SetAttr(new SvxLanguageItem(id, which));
  const restored = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(doc));
  docs.push(restored);
  const other = restored.paragraphs[0];
  assert(other);
  expect(
    [other.GetLang(0, 1), other.GetLang(1, 1), other.GetLang(2, 1)],
    new TextDecoder().decode(RtfExport.WriteDocument(doc)),
  ).toEqual([0x407, 0x411, 0x401]);
});

it("retains the native first-run distinction for language-only input and explicit empty paragraphs", /** Native LANG stores pending properties but root-pop emits them only after checkFirstRun; explicit PAR starts that path. @returns Nothing. */ () => {
  for (const tail of ["", "\\par"]) {
    const doc = read(`{\\rtf1\\lang1031${tail}}`);
    expect(doc.paragraphs).toHaveLength(1);
    const node = doc.paragraphs[0];
    assert(node);
    const item = node.GetAttr(H.RES_CHRATR_LANGUAGE);
    assert(item instanceof SvxLanguageItem);
    expect(item.GetLanguage()).toBe(tail === "" ? 0x3ff : 0x407);
    const other = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(doc));
    docs.push(other);
    expect(other.paragraphs).toHaveLength(1);
    const result = other.paragraphs[0]?.GetAttr(H.RES_CHRATR_LANGUAGE);
    assert(result instanceof SvxLanguageItem);
    expect(result.GetLanguage()).toBe(tail === "" ? 0x3ff : 0x407);
  }
});

it("preserves the upstream HICH associated-language overwrite", /** Exporter HICH repeats Western properties while the native reader selects the bidi language slot for HICH. Do not change that dispatch to repair inactive-script metadata. @returns Nothing. */ () => {
  const node = read(
    String.raw`{\rtf1\rtlch\alang1025\ltrch\hich\alang1031\dbch\langfe1041\loch\lang1031 A}`,
  ).paragraphs[0];
  assert(node);
  expect(node.GetLang(0, 1, 3)).toBe(0x407);
});
