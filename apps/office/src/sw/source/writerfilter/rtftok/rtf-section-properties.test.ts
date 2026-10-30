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

import { UseOnPage } from "../../core/layout/pagedesc";
import { RES_TEXTGRID } from "../../../inc/hintids";

it.each([
  ["sbkeven", UseOnPage.Left],
  ["sbkodd", UseOnPage.Right],
])(
  "creates a first-section parity style that follows the unrestricted Standard style: %s",
  /** Original parity needs its own native descriptor, including at document start. @param control - Native parity. @param use - Native usage. @returns Nothing. */ (
    control,
    use,
  ) => {
    const doc = read("{\\rtf1\\paperw12000\\" + control + " A}");
    const first = doc.FindPageDesc("Converted1");
    assert(first);
    expect(first.GetUseOn()).toBe(use);
    expect(first.GetFollow()).toBe(doc.GetPageDesc());
    expect(first.GetValue().width).toBe(12000);
    expect(doc.GetPageDesc().GetUseOn()).toBe(UseOnPage.All);
    expect((doc.paragraphs[0]?.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetPageDescName()).toBe(
      "Converted1",
    );
  },
);
it.each([
  ["sbkeven", UseOnPage.Left],
  ["sbkodd", UseOnPage.Right],
])(
  "deep-copies later page properties and follows the actual regular section style: %s",
  /** A later section allocates its regular style before the parity copy and advances the original name allocator twice. @param control - Parity. @param use - Native usage. @returns Nothing. */ (
    control,
    use,
  ) => {
    const doc = read(
      "{\\rtf1\\paperw12000 A\\sect\\sectd\\pgwsxn14000\\marglsxn900\\pgnrestart\\" +
        control +
        " B\\sect\\sectd C}",
    );
    const regular = doc.FindPageDesc("Converted1"),
      parity = doc.FindPageDesc("Converted2");
    assert(regular);
    assert(parity);
    expect(parity.GetUseOn()).toBe(use);
    expect(regular.GetUseOn()).toBe(UseOnPage.All);
    expect(parity.GetFollow()).toBe(regular);
    expect(parity.GetValue()).toMatchObject({ width: 14000, leftMargin: 900 });
    expect(
      parity
        .GetMaster()
        .GetAttrSet()
        .Get(RES_TEXTGRID)
        .equals(regular.GetMaster().GetAttrSet().Get(RES_TEXTGRID)),
    ).toBe(true);
    expect((doc.paragraphs[1]?.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetPageDescName()).toBe(
      "Converted2",
    );
    expect((doc.paragraphs[1]?.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset()).toBe(1);
    expect((doc.paragraphs[2]?.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetPageDescName()).toBe(
      "Converted3",
    );
  },
);
it("restores a section-type flag at native group pop", /** A scoped parity request must not constrain the outer section. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1{\sbkeven}A}`);
  expect(doc.GetPageDescCnt()).toBe(1);
  expect(doc.GetPageDesc().GetUseOn()).toBe(UseOnPage.All);
});
it("inherits a continuous section's page style and ignores its changed geometry until a page section", /** No header/footer or orientation change causes the original continuous branch to inherit the prior style. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1\paperw12000 A\sect\sectd\sbknone\pgwsxn14000\marglsxn900 B\sect\sbkpage C}`,
  );
  expect(doc.GetPageDesc().GetValue().width).toBe(12000);
  expect(doc.GetPageDescCnt()).toBe(2);
  expect(doc.paragraphs[1]?.GetpSwAttrSet()?.GetItemIfSet(RES_PAGEDESC, false)).toBeUndefined();
  expect((doc.paragraphs[2]?.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetPageDescName()).toBe(
    "Converted1",
  );
  expect(doc.FindPageDesc("Converted1")?.GetValue()).toMatchObject({
    width: 14000,
    leftMargin: 900,
  });
});
it("promotes a continuous orientation change to the original next-page branch", /** Landscape differs from the actual previous context even when width and height are unchanged. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1 A\sect\sectd\sbknone\lndscpsxn B}`);
  expect(doc.FindPageDesc("Converted1")?.GetValue().landscape).toBe(true);
  expect((doc.paragraphs[1]?.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetPageDescName()).toBe(
    "Converted1",
  );
});
it("uses a page section for SBKCOL in the current one-column profile", /** Native nextColumn is promoted when the section has fewer than two columns. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1 A\sect\sectd\sbkcol\pgwsxn14000 B}`);
  expect((doc.paragraphs[1]?.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetPageDescName()).toBe(
    "Converted1",
  );
  expect(doc.FindPageDesc("Converted1")?.GetValue().width).toBe(14000);
});
it("keeps the explicit first continuous section's Standard attachment and native restart omission", /** Linked-header defaults bypass page-number assignment in the original continuous branch. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1\sbknone\pgnrestart A\sect B}`);
  expect(doc.GetPageDescCnt()).toBe(1);
  const page = doc.paragraphs[0]?.GetAttr(RES_PAGEDESC) as SwFormatPageDesc;
  expect(page.GetPageDescName()).toBe("Standard");
  expect(page.GetNumOffset()).toBeUndefined();
  expect(doc.paragraphs[1]?.GetpSwAttrSet()?.GetItemIfSet(RES_PAGEDESC, false)).toBeUndefined();
});
it("removes an only-section final continuous type before mapping page restart", /** Original sectBreak finalization erases continuous when there was no SECT. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1\sbknone\pgnrestart A}`);
  expect((doc.paragraphs[0]?.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset()).toBe(1);
});

import { SwTextGridItem } from "../../../inc/tgrditem";
it.each([
  [String.raw``, 200],
  [String.raw`{\stylesheet{\s0\dbch\fs40 Normal;}}`, 400],
])(
  "applies original page-grid defaults using imported Standard Asian height: %s",
  /** The page section resets document page mode and computes grid width after stylesheet import. @param styles - Native stylesheet. @param width - Native twip width. @returns Nothing. */ (
    styles,
    width,
  ) => {
    const doc = read("{\\rtf1" + styles + " A}");
    const grid = doc.GetPageDesc().GetMaster().GetAttrSet().Get(RES_TEXTGRID) as SwTextGridItem;
    expect(doc.IsSquaredPageMode()).toBe(false);
    expect(grid.GetLines()).toBe(22860);
    expect(grid.GetBaseHeight()).toBe(100);
    expect(grid.GetBaseWidth()).toBe(width);
  },
);

it.each([
  ["sbkeven", UseOnPage.Left, 1100, 900],
  ["sbkodd", UseOnPage.Right, 900, 1100],
])(
  "preserves mirrored follow-style usage and the native even-only margin swap: %s",
  /** Source parity copies get physical left/right usage; their regular follow remains mirrored. @param control - Parity control. @param use - Native start usage. @param left - Physical left. @param right - Physical right. @returns Nothing. */ (
    control,
    use,
    left,
    right,
  ) => {
    const doc = read("{\\rtf1\\margmirror\\margl900\\margr1100\\" + control + " A}");
    const page = doc.FindPageDesc("Converted1");
    assert(page);
    expect(page.GetUseOn()).toBe(use);
    expect(page.GetFollow()).toBe(doc.GetPageDesc());
    expect(doc.GetPageDesc().GetUseOn()).toBe(UseOnPage.Mirror);
    expect(page.GetValue()).toMatchObject({ leftMargin: left, rightMargin: right });
    expect(doc.GetPageDesc().GetValue()).toMatchObject({ leftMargin: 900, rightMargin: 1100 });
  },
);
it.each([String.raw`\margmirror`, String.raw`\margmirror0`, String.raw`{\margmirror}`])(
  "emits original global mirror-margin settings before first run: %s",
  /** MARGMIRROR is a flag with no numeric off form, and its settings owner is outside group state. @param controls - Literal input. @returns Nothing. */ (
    controls,
  ) => {
    const doc = read("{\\rtf1" + controls + " A}");
    expect(doc.GetPageDesc().GetUseOn()).toBe(UseOnPage.Mirror);
  },
);
it("does not re-emit a mirror setting written after the original first-run table", /** Settings snapshots use native COW references, so later raw changes do not mutate the table already sent to the mapper. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1 A\margmirror\sect B}`);
  expect(doc.GetPageDesc().GetUseOn()).toBe(UseOnPage.All);
  expect(doc.FindPageDesc("Converted1")?.GetUseOn()).toBe(UseOnPage.All);
});

import { SwTextGrid } from "../../../inc/tgrditem";
import { RtfExport } from "../../filter/ww8/rtfexport";
it("retains the pinned native RTF grid-export no-op and reader defaults", /** RtfAttributeOutput::FormatTextGrid is an explicit TODO; authored grid metadata is not a native RTF roundtrip promise. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1 A}`);
  const grid = (
    doc.GetPageDesc().GetMaster().GetAttrSet().Get(RES_TEXTGRID) as SwTextGridItem
  ).Clone();
  grid.SetBaseHeight(800);
  grid.SetGridType(SwTextGrid.LinesAndChars);
  doc.GetPageDesc().GetMaster().SetFormatAttr(grid);
  const imported = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(doc));
  docs.push(imported);
  const result = imported
    .GetPageDesc()
    .GetMaster()
    .GetAttrSet()
    .Get(RES_TEXTGRID) as SwTextGridItem;
  expect(result.GetGridType()).toBe(SwTextGrid.NONE);
  expect(result.GetBaseHeight()).toBe(100);
  expect(imported.paragraphs[0]?.GetText()).toBe("A");
});
