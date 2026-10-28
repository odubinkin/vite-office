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
it("creates distinct native character owners and resolves forward parent references", /** Character definitions never become paragraph collections; matching direct controls deduplicate to the real named style. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\stylesheet{\s0 Normal;}{\*\cs22\sbasedon21\i Child;}{\*\cs21\b Parent;}}\pard\cs22\b\i Styled}`,
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
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.bold).toBe(false);
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
