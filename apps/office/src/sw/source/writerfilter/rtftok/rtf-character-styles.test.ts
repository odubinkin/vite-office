/** @fileoverview Named RTF character-style identity, native style-default policy, direct formatting precedence and group restoration on real Writer owners. */
import { afterEach, assert, expect, it } from "vitest";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import { RtfExport } from "../../filter/ww8/rtfexport";
import { SwFormatCharFormat } from "../../core/txtnode/fmtatr2";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import type { SwDoc } from "../../core/doc/doc";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_WEIGHT } from "../../../inc/hintids";
import native from "./rtf-style-defaults-native.json";
const docs: SwDoc[] = [];
afterEach(
  /** Releases real imported documents after every case. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Reads source bytes through the live tokenizer feedback path. @param source - RTF source. @returns Owned document. */
function read(source: string): SwDoc {
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  docs.push(doc);
  return doc;
}
/** Returns actual named-style references and native UTF16 ranges. @param doc - Real document. @returns Native hint projections. */
function named(doc: SwDoc) {
  return (
    doc.paragraphs[0]
      ?.GetpSwpHints()
      ?.entries()
      .flatMap(
        /** Inspects actual named-style items rather than flattened character values. @param hint - Real hint. @returns Reference if named. */ (
          hint,
        ) =>
          hint.format instanceof SwFormatCharFormat
            ? [{ start: hint.GetStart(), end: hint.GetEnd(), style: hint.format.GetCharFormat() }]
            : [],
      ) ?? []
  );
}
it("creates distinct character owners and retains direct properties absent from the raw child reference", /** Normalization reads the original child rPr, while the model separately owns its named parent. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\stylesheet{\s0 Normal;}{\*\cs21\b Parent;}{\*\cs22\sbasedon21\i Child;}}\pard\cs22\b\i Styled}`,
  );
  const child = doc.FindCharFormatByName("Child"),
    parent = doc.FindCharFormatByName("Parent");
  assert(child);
  assert(parent);
  expect(child.DerivedFrom()).toBe(parent);
  expect(doc.FindTextFormatCollByName("Child")).toBeUndefined();
  expect(named(doc)).toEqual([{ start: 0, end: 6, style: child }]);
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes).toMatchObject({
    bold: true,
    italic: true,
  });
  parent.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, RES_CHRATR_WEIGHT));
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.bold).toBe(true);
});
it("exports the actual cs reference before repeated style properties and preserves identity on reopen", /** The source requires named character properties alongside their reference. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1{\stylesheet{\s0 Normal;}{\*\cs21\b Named;}}\cs21\b AB}`);
  const bytes = RtfExport.WriteDocument(doc),
    text = new TextDecoder().decode(bytes);
  expect(text).toMatch(/\{\\cs\d+[^{}]*\\b[^{}]* AB\}/u);
  const restored = new RtfDocumentImpl().ResolveBytes(bytes);
  docs.push(restored);
  const style = restored.FindCharFormatByName("Named");
  assert(style);
  expect(named(restored)).toEqual([{ start: 0, end: 2, style }]);
  expect(projectWriterTextRuns(restored.paragraphs[0])[0]?.attributes.bold).toBe(true);
});
it("keeps style identity while applying native missing-run defaults from the unchanged compiled helper", /** Missing bold/italic/font-size controls override style appearance while non-defaulted strikeout remains inherited. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\stylesheet{\s0 Normal;}{\*\cs21\b\i\fs36\strike Named;}}\cs21 Missing}`,
  );
  const attributes = projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes;
  expect(attributes?.bold).toBe(Boolean(native.characterDefaults.LN_EG_RPrBase_b));
  expect(attributes?.italic).toBe(Boolean(native.characterDefaults.LN_EG_RPrBase_i));
  expect(attributes?.fontSizeTwips).toBe(native.characterDefaults.LN_EG_RPrBase_sz * 10);
  expect(attributes?.strikeout).not.toBe(0);
  expect(named(doc)[0]?.style).toBe(doc.FindCharFormatByName("Named"));
});
it("restores named styles across groups and clears the reference for plain", /** Group-scoped references split real hints even when adjacent text formatting is equal. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\stylesheet{\s0 Normal;}{\*\cs21\b First;}{\*\cs22\i Second;}}\cs21\b A{\cs22\i B}C{\plain D}E}`,
  );
  const first = doc.FindCharFormatByName("First"),
    second = doc.FindCharFormatByName("Second");
  expect(named(doc)).toEqual([
    { start: 0, end: 1, style: first },
    { start: 1, end: 2, style: second },
    { start: 2, end: 3, style: first },
    { start: 4, end: 5, style: first },
  ]);
  expect(doc.paragraphs[0]?.GetText()).toBe("ABCDE");
});
it("retains the selected reference for an unknown cs while using its separate native current index for deduplication", /** Unknown style lookup leaves the rStyle property intact but changes the native dedup reference index. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1{\stylesheet{\s0 Normal;}{\*\cs21\b Named;}}\cs21 A\cs999 B}`);
  expect(
    named(doc).every(
      /** Checks retained pointer identity. @param entry - Real range. @returns Whether correct. */ (
        entry,
      ) => entry.style === doc.FindCharFormatByName("Named"),
    ),
  ).toBe(true);
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads source-visible default differences. @param run - Real run. @returns Text and bold. */ (
        run,
      ) => [run.text, run.attributes.bold],
    ),
  ).toEqual([
    ["A", false],
    ["B", true],
  ]);
});
it("retains explicit direct overrides over named style and keeps character styles out of paragraph follow links", /** Family boundaries remain on actual SwTextFormatColl/SwCharFormat owners. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\stylesheet{\s1\snext21 Paragraph;}{\*\cs21\b Named;}}\s1\cs21\b0 No}`,
  );
  expect(doc.paragraphs[0]?.GetTextFormatColl().GetName()).toBe("Paragraph");
  expect(doc.FindTextFormatCollByName("Paragraph")?.GetNextTextFormatColl().GetName()).toBe(
    "Paragraph",
  );
  expect(named(doc)[0]?.style).toBe(doc.FindCharFormatByName("Named"));
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.bold).toBe(false);
});
it("uses character-style baseline percentages instead of paragraph-style automatic superscript", /** The native mapper's positive paragraph-style substitution is not a character-style rule. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\stylesheet{\s0 Normal;}{\*\cs21\fs40\up10 Raised;}}\cs21\fs40\up10 Text}`,
  );
  const style = doc.FindCharFormatByName("Raised");
  assert(style);
  expect((style.GetAttrSet().Get(RES_CHRATR_ESCAPEMENT) as SvxEscapementItem).GetEsc()).toBe(25);
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.escapement?.offset).toBe(25);
});
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { RES_CHRATR_ESCAPEMENT } from "../../../inc/hintids";

it("retains real named style identity and parent ownership through the browser worker snapshot", /** The existing file UI crosses this actual codec boundary after import. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\stylesheet{\s0 Normal;}{\*\cs21\b Parent;}{\*\cs22\sbasedon21\i Child;}}\cs22\b\i Text}`,
  );
  const restored = decodeWriterDocument(encodeWriterDocument(doc));
  docs.push(restored);
  const child = restored.FindCharFormatByName("Child"),
    parent = restored.FindCharFormatByName("Parent");
  assert(child);
  assert(parent);
  expect(child.DerivedFrom()).toBe(parent);
  expect(named(restored)).toEqual([{ start: 0, end: 4, style: child }]);
  expect(projectWriterTextRuns(restored.paragraphs[0])[0]?.attributes).toMatchObject({
    bold: true,
    italic: true,
  });
});
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

it("captures parent and follow names when their controls are parsed", /** Unknown names become the original non-forced empty RTFValue string, whose query returns zero; later definitions do not fix them up. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\stylesheet{\s0 Normal;}{\*\cs22\sbasedon21 Child;}{\*\cs21\b Parent;}{\s2\snext3 Before;}{\s3 After;}{\s4\snext3 Backward;}}\cs22 Text}`,
  );
  expect(doc.FindCharFormatByName("Child")?.DerivedFrom()).toBe(doc.GetDfltCharFormat());
  const before = doc.FindTextFormatCollByName("Before");
  expect(before?.GetNextTextFormatColl()).toBe(before);
  expect(doc.FindTextFormatCollByName("Backward")?.GetNextTextFormatColl()).toBe(
    doc.FindTextFormatCollByName("After"),
  );
});

it("preserves explicit normal weight across later paragraph-style changes", /** The actual mapper vector inserts an explicit range item even when its value equals the initial inherited value. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1{\stylesheet{\s0 Normal;}}\b0 Text}`);
  doc.paragraphs[0]
    ?.GetTextFormatColl()
    .SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.bold).toBe(false);
});

it("preserves synthesized normal weight across later named-style changes", /** Missing direct bold against a raw bold reference produces a real b0 range item. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1{\stylesheet{\s0 Normal;}{\*\cs21\b Named;}}\cs21 Text}`);
  const style = doc.FindCharFormatByName("Named");
  assert(style);
  style.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, RES_CHRATR_WEIGHT));
  style.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
  expect(named(doc)[0]?.style).toBe(style);
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.bold).toBe(false);
});

it("keeps equal raw character properties inherited after native deduplication", /** An equal direct command disappears and later changes follow the actual named owner. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1{\stylesheet{\s0 Normal;}{\*\cs21\b Named;}}\cs21\b Text}`);
  const style = doc.FindCharFormatByName("Named");
  assert(style);
  style.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, RES_CHRATR_WEIGHT));
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.bold).toBe(false);
});

it("keeps the native mapper script scope for Western bold and font controls", /** Original b writes Western and CJK weights; rFonts/ascii writes only the Western font, and neither invents CTL values. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1{\fonttbl{\f0 Arial;}}\f0\b Text}`);
  const items =
    doc.paragraphs[0]
      ?.GetpSwpHints()
      ?.entries()
      .flatMap(
        /** Reads the actual inserted character item sets. @param hint - Native range hint. @returns Direct items. */ (
          hint,
        ) =>
          hint.format instanceof SwFormatAutoFormat
            ? [...hint.format.GetStyleHandle().entries()]
            : [],
      ) ?? [];
  expect(
    items.find(
      /** Finds native CJK weight. @param item - Native item. @returns Match. */ (item) =>
        item.Which() === RES_CHRATR_CJK_WEIGHT,
    ),
  ).toBeInstanceOf(SvxWeightItem);
  expect(
    items.some(
      /** CTL is a separate native property. @param item - Native item. @returns Whether CTL. */ (
        item,
      ) => item.Which() === RES_CHRATR_CTL_WEIGHT,
    ),
  ).toBe(false);
  expect(
    items.some(
      /** ASCII font does not set other script families. @param item - Native item. @returns Whether extra font. */ (
        item,
      ) => item.Which() === RES_CHRATR_CJK_FONT || item.Which() === RES_CHRATR_CTL_FONT,
    ),
  ).toBe(false);
});
import { SwFormatAutoFormat } from "../../core/txtnode/txatbase";
import {
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CTL_FONT,
} from "../../../inc/hintids";

it("releases actual raw stylesheet owners when parsing fails before materialization", /** An invalid stream cannot retain native style references merely because no document was created. @returns Nothing. */ () => {
  /** Observes genuine parser-owned reference destruction without replacing the resource owners. */
  class ObservedReader extends RtfDocumentImpl {
    readonly released: number[] = [];
    /** Observes actual destructor counts after original cleanup. @returns Nothing. */
    protected override ClearStyleTable(): void {
      const owners = [...this.m_pStyleTableEntries.values()].map(
        /** Borrows each actual native owner. @param pointer - Native pointer. @returns Borrowed owner. */ (
          pointer,
        ) => pointer.operatorDereference(),
      );
      super.ClearStyleTable();
      for (const owner of owners) this.released.push(owner.GetRefCount());
    }
  }
  const reader = new ObservedReader();
  expect(
    /** Parses an unclosed root after complete stylesheet entries. @returns Never. */ () =>
      reader.ResolveBytes(
        new TextEncoder().encode(
          String.raw`{\rtf1{\stylesheet{\s0 Normal;}{\*\cs21\b Named;}}\cs21 Unclosed`,
        ),
      ),
  ).toThrow();
  expect(reader.released).toEqual([1 << 30, 1 << 30]);
});

it("retains explicit paragraph-style normal weight through a later parent edit", /** Paragraph style deduplication retains equal character item values, and UNO insertion must preserve that direct presence. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\stylesheet{\s0 Normal;}{\s1\b0 Parent;}{\s2\sbasedon1\b0 Child;}}\s2 Text}`,
  );
  const parent = doc.FindTextFormatCollByName("Parent"),
    child = doc.FindTextFormatCollByName("Child");
  assert(parent);
  assert(child);
  expect(child.GetAttrSet().GetItemIfSet(RES_CHRATR_WEIGHT, false)).toBeDefined();
  parent.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.bold).toBe(false);
});

it("deduplicates character style properties against raw parent content before model insertion", /** An equal b0 disappears when a distinct italic child keeps rPr nonempty; the raw table still remains the run normalization reference. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\stylesheet{\s0 Normal;}{\*\cs21\b0 Parent;}{\*\cs22\sbasedon21\b0\i Child;}}\cs22\b0\i Text}`,
  );
  const parent = doc.FindCharFormatByName("Parent"),
    child = doc.FindCharFormatByName("Child");
  assert(parent);
  assert(child);
  expect(child.GetAttrSet().GetItemIfSet(RES_CHRATR_WEIGHT, false)).toBeUndefined();
  parent.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.bold).toBe(true);
});

it("applies raw style font and weight controls with original independent script scopes", /** Styles use the same real mapper property vector as runs instead of the legacy all-script difference projection. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\fonttbl{\f0 Arial;}}{\stylesheet{\s0 Normal;}{\*\cs21\f0\b Named;}}\cs21\f0\b Text}`,
  );
  const style = doc.FindCharFormatByName("Named");
  assert(style);
  expect(style.GetAttrSet().GetItemIfSet(RES_CHRATR_CJK_WEIGHT, false)).toBeDefined();
  expect(style.GetAttrSet().GetItemIfSet(RES_CHRATR_CTL_WEIGHT, false)).toBeUndefined();
  expect(style.GetAttrSet().GetItemIfSet(RES_CHRATR_CJK_FONT, false)).toBeUndefined();
  expect(style.GetAttrSet().GetItemIfSet(RES_CHRATR_CTL_FONT, false)).toBeUndefined();
});

it("resolves native built-in character style aliases and resets existing pool properties", /** Imported sparse definitions replace direct built-in values via SetPropertiesToDefault before the actual mapper applies their properties. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\stylesheet{\s0 Normal;}{\*\cs21 Hyperlink;}{\*\cs22 Emphasis;}}\cs21 Link\cs22 Text}`,
  );
  expect(doc.FindCharFormatByName("Internet link")).toBeUndefined();
  const hyperlink = doc.GetCharFormatFromPool(SwPoolFormatId.CHR_INET_NORMAL);
  expect(named(doc)[0]?.style).toBe(hyperlink);
  const emphasis = doc.FindCharFormatByName("Emphasis");
  assert(emphasis);
  expect(emphasis.GetAttrSet().GetItemIfSet(RES_CHRATR_POSTURE, false)).toBeUndefined();
});
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { RES_CHRATR_POSTURE } from "../../../inc/hintids";

it("keeps an original character style at index zero separate from the paragraph fallback", /** The source raw table permits character type at0 and EnsureDefaultStyle never replaces that entry. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1{\stylesheet{\*\cs0\b Zero character;}}\cs0\b Text}`);
  const style = doc.FindCharFormatByName("Zero character");
  assert(style);
  expect((style.GetAttrSet().Get(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(
    FontWeight.WEIGHT_BOLD,
  );
  expect(
    doc.GetDfltTextFormatColl().GetAttrSet().GetItemIfSet(RES_CHRATR_WEIGHT, false),
  ).toBeUndefined();
  expect(named(doc)[0]?.style).toBe(style);
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.bold).toBe(true);
});
