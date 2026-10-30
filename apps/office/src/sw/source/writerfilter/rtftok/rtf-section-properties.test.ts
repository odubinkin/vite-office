/** @fileoverview Native section property scopes, original mapper geometry normalization and section paragraph lifetimes on actual Writer owners. */
import { afterEach, assert, expect, it } from "vitest";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import { SwDoc } from "../../core/doc/doc";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { RES_PAGEDESC } from "../../../inc/hintids";
const docs: SwDoc[] = [];
afterEach(
  /** Releases document-owned page and item graphs. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Imports literal native input through the actual parser/mapper. @param source - RTF. @returns Owned document. */
function read(source: string): SwDoc {
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  docs.push(doc);
  return doc;
}
it("retains current section properties across SECT until SECTD resets to global defaults", /** Native sectBreak sends current sprms but never resets the parser state. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1\paperw12000\paperh16000\margl1000\pgwsxn14000\marglsxn900\lndscpsxn A\sect B\sect\sectd C}`,
  );
  expect(doc.GetPageDesc().GetValue()).toMatchObject({
    width: 14000,
    leftMargin: 900,
    landscape: true,
  });
  expect(doc.FindPageDesc("Converted1")?.GetValue()).toMatchObject({
    width: 14000,
    leftMargin: 900,
    landscape: true,
  });
  expect(doc.FindPageDesc("Converted2")?.GetValue()).toMatchObject({
    width: 12000,
    leftMargin: 1000,
    landscape: false,
  });
});
it("restores grouped section geometry before the previous section is emitted", /** Nondefault section changes are native group-scoped, not global side effects. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1\paperw12000\margl1000 A{\pgwsxn14000\marglsxn900\lndscpsxn}\sect B}`,
  );
  for (const page of [doc.GetPageDesc(), doc.FindPageDesc("Converted1")]) {
    expect(page?.GetValue()).toMatchObject({ width: 12000, leftMargin: 1000, landscape: false });
  }
});
it("captures the actual nested section before restoring its parent group", /** A section emitted inside the group retains those properties; following sections use restored parent values. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1\paperw12000 A{\pgwsxn14000\sect}B}`);
  expect(doc.GetPageDesc().GetValue().width).toBe(14000);
  expect(doc.FindPageDesc("Converted1")?.GetValue().width).toBe(12000);
});
it("retains global defaults changed inside a group only when SECTD subsequently selects them", /** Global default controls update default and current; only the current state is rolled back on group pop. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1\paperw12000 A{\paperw14000}\sect B\sect\sectd C}`);
  expect(doc.GetPageDesc().GetValue().width).toBe(12000);
  expect(doc.FindPageDesc("Converted1")?.GetValue().width).toBe(12000);
  expect(doc.FindPageDesc("Converted2")?.GetValue().width).toBe(14000);
});
it.each([
  [String.raw`\paperw12000`, { width: 12000, height: 15840, leftMargin: 1440, rightMargin: 1440 }],
  [String.raw`\margl1000`, { width: 12240, height: 15840, leftMargin: 1000, rightMargin: 1440 }],
  [String.raw`\pgwsxn13000`, { width: 12983, height: 15840, leftMargin: 1440, rightMargin: 1440 }],
  [String.raw`\margt-1200\margb-1300`, { topMargin: 1200, bottomMargin: 1300 }],
  [String.raw`\margl40000\margr40000`, { leftMargin: 0, rightMargin: 0 }],
])(
  "applies native pgSz/pgMar defaults and conversions: %s",
  /** Parent property presence resets each compound to its own original defaults. @param controls - Native controls. @param expected - Independently source-derived values in twips. @returns Nothing. */ (
    controls,
    expected,
  ) => {
    const doc = read("{\\rtf1" + controls + " A}");
    expect(doc.GetPageDesc().GetValue()).toMatchObject(expected);
  },
);
it.each([
  [String.raw`\pgnrestart A\sect B`, [1, 1]],
  [String.raw`{\pgnrestart}A\sect B`, [undefined, undefined]],
  [String.raw`\pgnrestart A\sect\sectd B`, [1, undefined]],
])(
  "retains scoped page restarts and their native SECTD reset: %s",
  /** Original restart is part of section sprms, including the first section. @param body - Literal controls. @param offsets - Direct page restart expectations. @returns Nothing. */ (
    body,
    offsets,
  ) => {
    const doc = read("{\\rtf1" + body + "}");
    expect(doc.paragraphs).toHaveLength(2);
    for (let i = 0; i < 2; ++i) {
      const node = doc.paragraphs[i];
      assert(node);
      const page = node.GetpSwAttrSet()?.GetItemIfSet(RES_PAGEDESC, false);
      expect((page as SwFormatPageDesc | undefined)?.GetNumOffset()).toBe(offsets[i]);
    }
  },
);
it.each([
  [String.raw`A\sect`, ["A", ""]],
  [String.raw`\sect A`, ["", "A"]],
  [String.raw`A\sect\sect B`, ["A", "", "B"]],
])(
  "retains required dummy paragraphs for empty/final sections: %s",
  /** Native needPar remains true after SECT and requires a paragraph even without visible text. @param body - Native section stream. @param expected - Body paragraphs. @returns Nothing. */ (
    body,
    expected,
  ) => {
    const doc = read("{\\rtf1" + body + "}");
    expect(
      doc.paragraphs.map(
        /** Reads actual text nodes. @param node - Node. @returns Text. */ (node) => node.GetText(),
      ),
    ).toEqual(expected);
  },
);

it.each([
  String.raw`{\rtf1}`,
  String.raw`{\rtf1\paperw12000\margl1000}`,
  String.raw`{\rtf1\paperw12000\li100}`,
  String.raw`{\rtf1{\stylesheet{\s0 Normal;}}}`,
])(
  "does not emit section properties before the native first run: %s",
  /** Original root-pop section finalization is gated by !m_bFirstRun; control-only input retains the initial document geometry. @param source - No text/PAR input. @returns Nothing. */ (
    source,
  ) => {
    const baseline = new SwDoc();
    docs.push(baseline);
    const imported = read(source);
    expect(imported.GetPageDesc().GetValue()).toEqual(baseline.GetPageDesc().GetValue());
  },
);

it.each([false, true])(
  "retains the native LINE first-run section quirk until ordinary text arrives: %s",
  /** LINE calls singleChar/runProps without checkFirstRun; the ordinary following text finally starts the section. @param ordinaryText - Whether the source contains ordinary text after LINE. @returns Nothing. */ (
    ordinaryText,
  ) => {
    const baseline = new SwDoc();
    docs.push(baseline);
    const doc = read(String.raw`{\rtf1\paperw12000\line` + (ordinaryText ? " A}" : "}"));
    expect(doc.paragraphs[0]?.GetText()).toBe(ordinaryText ? "\nA" : "\n");
    expect(doc.GetPageDesc().GetValue().width).toBe(
      ordinaryText ? 12000 : baseline.GetPageDesc().GetValue().width,
    );
  },
);
