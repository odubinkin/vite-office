/** @fileoverview Native RTF document admission, field URL and border-width contracts. */
import { assert, expect, it } from "vitest";
import type { SfxBoolItem } from "../../../../svl/inc/eitem";
import { RES_PARATR_SPLIT } from "../../../inc/hintids";
import { SwTableNode } from "../../core/docnode/node";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { RtfDocumentImpl } from "./rtfdocumentimpl";

it("defaults parameterless metadata controls without leaking their destination state into body text", /** Checks tolerant source admission of incomplete style, font, color and list declarations. @returns Nothing. */ () => {
  const source = String.raw`{\rtf1{\fonttbl\f;}{\colortbl\red\green\blue\unknown;}{\stylesheet{\s\sbasedon\snext Default;}}{\*\listtable{\list\listid\levelnfc\levelstartat{\listlevel\levelnfc\levelstartat{\leveltext ;}}}}{\*\listoverridetable{\listoverride\listid\ls}}\pard\s0\plain\fs\f\cf\highlight\ulc\up\dn\ls\ilvl Body}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  try {
    const paragraph = doc.paragraphs[0];
    assert(paragraph);
    expect(paragraph.GetText()).toBe("Body");
    expect(projectWriterTextRuns(paragraph)[0]?.attributes).toMatchObject({
      bold: false,
      italic: false,
      underline: false,
    });
  } finally {
    doc.Dispose();
  }
});

it("uses zero for missing row dimensions, paddings and border values", /** Checks actual native table defaults after the parser admits absent numeric payloads. @returns Nothing. */ () => {
  const source = String.raw`{\rtf1\trowd\trrh\trleft\trpaddt\trpaddl\trpaddb\trpaddr\clpadt\clpadl\clpadb\clpadr\clbrdrt\brdrw\brdrcf\cellx\cellx1000\intbl Cell\cell\row}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  try {
    const table = doc
      .GetNodes()
      .getBodyContent()
      .find(
        /** Selects the original imported table. @param node - Native content node. @returns Table match. */ (
          node,
        ) => node instanceof SwTableNode,
      );
    assert(table instanceof SwTableNode);
    const boxes = table.GetTable().GetTabLines()[0]?.GetTabBoxes();
    expect(boxes).toHaveLength(1);
    expect(boxes?.[0]?.GetParagraphs()[0]?.GetText()).toBe("Cell");
  } finally {
    doc.Dispose();
  }
});

it("rejects missing headers and content outside a pretokenized root", /** Checks the public pretokenized admission route independently of lexical validation. @returns Nothing. */ () => {
  expect(
    /** Resolves a stream lacking a version control. @returns No document. */ () =>
      new RtfDocumentImpl().Resolve([{ kind: "group-start" }, { kind: "group-end" }]),
  ).toThrow("RTF version control is missing");
  expect(
    /** Resolves text without an owner group. @returns No document. */ () =>
      new RtfDocumentImpl().Resolve([{ kind: "text", value: "outside" }]),
  ).toThrow("RTF content is outside the root group");
});

it("admits an empty pretokenized text span without creating a spurious run", /** Checks the public token route's empty-text boundary. @returns Nothing. */ () => {
  const doc = new RtfDocumentImpl().Resolve([
    { kind: "group-start" },
    { kind: "control", name: "rtf", parameter: 1 },
    { kind: "text", value: "" },
    { kind: "group-end" },
  ]);
  try {
    expect(doc.paragraphs[0]?.GetText()).toBe("");
  } finally {
    doc.Dispose();
  }
});

it("assigns distinct generated page descriptors to consecutive native sections", /** Checks the fresh-document section namespace and original geometry owners. @returns Nothing. */ () => {
  const source = String.raw`{\rtf1 A\sect\sectd\pgwsxn15000 B\sect\sectd\pgwsxn16000 C}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  try {
    expect(
      doc.paragraphs.map(
        /** Reads original paragraph text. @param node - Native node. @returns Text. */ (node) =>
          node.GetText(),
      ),
    ).toEqual(["A", "B", "C"]);
    expect(doc.FindPageDesc("Converted1")?.GetValue().width).toBe(15000);
    expect(doc.FindPageDesc("Converted2")?.GetValue().width).toBe(16000);
    expect(doc.FindPageDesc("Converted1")).not.toBe(doc.FindPageDesc("Converted2"));
  } finally {
    doc.Dispose();
  }
});

it("keeps escaped CR and LF inside list level text and ignores unrelated destination controls", /** Checks destination-aware resolveChars without creating extra body paragraphs. @returns Nothing. */ () => {
  const source = String.raw`{\rtf1{\*\listtable\b{\list\listid1{\listlevel\levelnfc23{\leveltext\i\'01\'0d\'0a*;}}}}{\*\listoverridetable\i{\listoverride\listid1\ls1}}\ls1 Item}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  try {
    expect(doc.paragraphs).toHaveLength(1);
    const paragraph = doc.paragraphs[0];
    assert(paragraph);
    expect(paragraph.GetText()).toBe("Item");
    expect(paragraph.GetNumRule()?.Get(0).GetBulletChar()).toBe(0x2a);
    expect(projectWriterTextRuns(paragraph)[0]?.attributes).toMatchObject({
      bold: false,
      italic: false,
    });
  } finally {
    doc.Dispose();
  }
});

it("inherits native font codepages through nested font-table groups", /** Checks group-state copying rather than a browser text decoder shortcut. @returns Nothing. */ () => {
  const source = String.raw`{\rtf1{\fonttbl\f0\fcharset128{MS Gothic;}}\f0\'82\'a0}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  try {
    expect(doc.paragraphs[0]?.GetText()).toBe("あ");
  } finally {
    doc.Dispose();
  }
});

it("retains nested style identities and discards empty bookmark names", /** Checks original group-scoped style and mark admission. @returns Nothing. */ () => {
  const source = String.raw`{\rtf1{\stylesheet{\s1\sbasedon0\snext1{Nested;}}}{\*\bkmkstart }\s1 Body}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  try {
    expect(doc.paragraphs[0]?.GetTextFormatColl().GetName()).toBe("Nested");
    expect(doc.GetIDocumentMarkAccess().GetBookmarks()).toHaveLength(0);
  } finally {
    doc.Dispose();
  }
});

it("uses the native ANSI default for zero codepages and unknown font or charset metadata", /** Checks meaningful recovery of the Euro byte and automatic color. @returns Nothing. */ () => {
  const source = String.raw`{\rtf1\ansicpg0\cpg0\fcharset0\fcharset999\f9999\cf9999\ulc0\'80}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  try {
    const paragraph = doc.paragraphs[0];
    assert(paragraph);
    expect(paragraph.GetText()).toBe("€");
    expect(projectWriterTextRuns(paragraph)[0]?.attributes.color).toBe("auto");
  } finally {
    doc.Dispose();
  }
});

it("flushes the completed table before accepting following body text without pard", /** Checks native body order through the AppendText recovery boundary. @returns Nothing. */ () => {
  const source = String.raw`{\rtf1\trowd\cellx1000\intbl cell\cell\row after}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  try {
    const body = doc.GetNodes().getBodyContent();
    const tableIndex = body.findIndex(
      /** Selects the table owner. @param node - Body node. @returns Whether a table. */ (node) =>
        node instanceof SwTableNode,
    );
    const paragraph = doc.paragraphs.find(
      /** Selects following body text. @param node - Text node. @returns Whether the expected paragraph. */ (
        node,
      ) => node.GetText() === "after",
    );
    assert(paragraph);
    expect(tableIndex).toBeGreaterThanOrEqual(0);
    expect(body.indexOf(paragraph)).toBeGreaterThan(tableIndex);
  } finally {
    doc.Dispose();
  }
});

it("retains style keep-together and soft character controls without leaking stylesheet formatting", /** Checks destination-specific admission through a real named style and body. @returns Nothing. */ () => {
  const source = String.raw`{\rtf1{\stylesheet\b{\s1\keep Saved;}}\s1 A\line B\tab C\~D\-E}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  try {
    const paragraph = doc.paragraphs[0];
    assert(paragraph);
    expect(paragraph.GetText()).toBe("A\nB\tC\u00a0D\u00adE");
    expect(projectWriterTextRuns(paragraph)[0]?.attributes.bold).toBe(false);
    expect(
      (paragraph.GetTextFormatColl().GetAttrSet().Get(RES_PARATR_SPLIT) as SfxBoolItem).GetValue(),
    ).toBe(false);
  } finally {
    doc.Dispose();
  }
});

it("commits the final native table cell when the row arrives without a separate cell marker", /** Checks row-boundary recovery with actual pending paragraph text. @returns Nothing. */ () => {
  const doc = new RtfDocumentImpl().ResolveBytes(
    new TextEncoder().encode(String.raw`{\rtf1\trowd\cellx1000\intbl final\row}`),
  );
  try {
    const table = doc
      .GetNodes()
      .getBodyContent()
      .find(
        /** Finds the actual imported table. @param node - Body node. @returns Whether a table. */ (
          node,
        ) => node instanceof SwTableNode,
      );
    assert(table instanceof SwTableNode);
    expect(table.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe(
      "final",
    );
  } finally {
    doc.Dispose();
  }
});

it("preserves the pinned screen-tip backslash and closing-quote rule", /** Checks DomainMapper_Impl.cxx GetCommandParts behavior through native hyperlink hints. @returns Nothing. */ () => {
  const source = String.raw`{\rtf1{\field{\*\fldinst HYPERLINK "https://example.test" \\o "Tip \\path"}{\fldrslt Label}}}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  try {
    const paragraph = doc.paragraphs[0];
    assert(paragraph);
    expect(projectWriterTextRuns(paragraph)[0]?.hyperlink).toEqual({
      url: "https://example.test",
      name: 'Tip path"',
    });
  } finally {
    doc.Dispose();
  }
});

it.each([
  ["", undefined],
  ["HYPERLINK", undefined],
  [String.raw`HYPERLINK ""`, undefined],
  [String.raw`HYPERLINK \\l`, "#"],
  [String.raw`HYPERLINK "https://example.test" \\t`, "https://example.test"],
  [String.raw`HYPERLINK "https://example.test" \\o`, "https://example.test"],
  [String.raw`HYPERLINK "https://example.test" \\m \\n \\h`, "https://example.test"],
  [String.raw`HYPERLINK "file:///C:\\\\folder\\\\document.odt"`, "file:///C:/folder/document.odt"],
] as const)(
  "normalizes the native hyperlink field %s",
  /** Checks actual field instruction parsing and native text hints. @param instruction - RTF field instruction. @param url - Normalized URL or absent link. @returns Nothing. */ (
    instruction,
    url,
  ) => {
    const source = String.raw`{\rtf1{\field{\*\fldinst ${instruction}}{\fldrslt Label}}}`;
    const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
    try {
      const paragraph = doc.paragraphs[0];
      assert(paragraph);
      expect(paragraph.GetText()).toBe("Label");
      expect(projectWriterTextRuns(paragraph)[0]?.hyperlink?.url).toBe(url);
    } finally {
      doc.Dispose();
    }
  },
);

it.each([
  ["brdrhair", 1, 2],
  ["brdrth", 300, undefined],
  ["brdrs\\brdrth", 300, 300],
] as const)(
  "imports native border %s with Word width %i",
  /** Checks source hairline quantization and the ignored thick flag through a table box. @param control - RTF border selector. @param width - Word width. @param expected - Native twip width or no line. @returns Nothing. */ (
    control,
    width,
    expected,
  ) => {
    const borderControl = "\\" + control;
    const source = String.raw`{\rtf1\trowd\clbrdrt${borderControl}\brdrw${width}\cellx1000\intbl X\cell\row}`;
    const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
    try {
      const table = doc
        .GetNodes()
        .getBodyContent()
        .find(
          /** Finds the real imported table. @param node - Body node. @returns Whether a table. */ (
            node,
          ) => node instanceof SwTableNode,
        );
      assert(table instanceof SwTableNode);
      expect(
        table.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetBox().GetTop()?.GetWidth(),
      ).toBe(expected);
    } finally {
      doc.Dispose();
    }
  },
);

it("clears the active superscript before appending normal text", /** Checks native character state reset at the represented nosupersub boundary. @returns Nothing. */ () => {
  const doc = new RtfDocumentImpl().ResolveBytes(
    new TextEncoder().encode(String.raw`{\rtf1\super raised\nosupersub plain}`),
  );
  try {
    const paragraph = doc.paragraphs[0];
    assert(paragraph);
    const runs = projectWriterTextRuns(paragraph);
    expect(runs[0]?.attributes.escapement?.offset).toBeGreaterThan(0);
    expect(runs.at(-1)?.attributes.escapement?.offset ?? 0).toBe(0);
    expect(paragraph.GetText()).toBe("raisedplain");
  } finally {
    doc.Dispose();
  }
});

it("decodes legacy font names and body bytes through the same native SAL wrapper", () => {
  const source = String.raw`{\rtf1{\fonttbl{\f0\fcharset128 \'82\'a0;}}\f0\'82\'a0}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  try {
    const node = doc.paragraphs[0];
    assert(node);
    expect(node.GetText()).toBe("あ");
    expect(projectWriterTextRuns(node)[0]?.attributes.fontFamily).toBe("あ");
  } finally {
    doc.Dispose();
  }
});
it("uses MS1252 for Symbol font-entry hex bytes and preserves Symbol body conversion", () => {
  const source = String.raw`{\rtf1{\fonttbl{\f0\fcharset2 \'53\'79\'6d\'62\'6f\'6c;}}\f0\'41}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  try {
    const node = doc.paragraphs[0];
    assert(node);
    expect(node.GetText()).toBe("\uf041");
    expect(projectWriterTextRuns(node)[0]?.attributes.fontFamily).toBe("Symbol");
  } finally {
    doc.Dispose();
  }
});
