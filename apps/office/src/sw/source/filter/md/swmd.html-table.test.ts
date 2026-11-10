/** @fileoverview Raw HTML table import through the native Markdown and Writer HTML filter entry points. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  ICULanguageBreakFactory,
  type WordDictionaryName,
} from "../../../../external/icu/source/common/brkeng";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwDoc } from "../../core/doc/doc";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { RtfExport } from "../ww8/rtfexport";
import { RtfDocumentImpl } from "../../writerfilter/rtftok/rtfdocumentimpl";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { SwPosition } from "../../core/crsr/pam";
import { SwTableNode } from "../../core/docnode/node";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";

/** Loads original shipped ICU dictionary bytes. @param name - Native dictionary. @returns Exact resource. */
function loadDictionary(name: WordDictionaryName): Uint8Array {
  return readFileSync(`src/external/icu/source/data/brkitr/${name}.dict`);
}

/** Opens UTF-8 Markdown through the same shell route as the file dialog. @param source - Authored input. @returns Actual installed document and its owner. */
function open(source: string) {
  const seed = new SwDoc({
    defaultFontDevice: {
      /** Uses the native default selection. @returns Absent host preference. */
      getDefaultFont: () => undefined,
      /** Supplies controlled native measurements through the shell's device port. @param _font - Actual selected font. @param _value - Original text. @param _start - First code unit. @param length - Measured UTF16 units. @returns Width in twips. */
      measureTextWidth: (_font, _value, _start, length) => 30 * length,
    },
  });
  const state = createDocument({
    id: "native-md-table",
    suiteId: "writer",
    title: "Native raw tables",
  });
  const medium = {
    kind: "input",
    name: "native.md",
    source: { kind: "external", reference: {} },
  } as const;
  const shell = new SwDocShell(seed, state, medium);
  const dictionaries = new ICULanguageBreakFactory({
    thaidict: loadDictionary("thaidict"),
    laodict: loadDictionary("laodict"),
    burmesedict: loadDictionary("burmesedict"),
    khmerdict: loadDictionary("khmerdict"),
    cjdict: loadDictionary("cjdict"),
  });
  try {
    return {
      shell,
      doc: shell.OpenMarkdown(new TextEncoder().encode(source), state, medium, dictionaries),
    };
  } catch (error) {
    shell.Close();
    throw error;
  }
}

it("opens a raw table with real rows, formatted cells, caption and subsequent Markdown text", /** Exercises the ordinary document-shell open path and the HTML body token consumer. @returns Nothing. */ () => {
  const { shell, doc } = open(
    '# Before\n\n<table border="1"><caption>Table title</caption><thead><tr><th>Left</th><th>Right</th></tr></thead>' +
      "<tbody><tr><td><b>alpha</b></td><td>beta</td></tr></tbody></table>\n\nAfter.\n",
  );
  try {
    const nodes = doc.GetNodes();
    const table = nodes
      .entries()
      .find(
        /** Selects the actual materialized table node. @param node - Actual document node. @returns Table-node admission. */ (
          node,
        ): node is SwTableNode => node instanceof SwTableNode,
      );
    assert(table);
    const core = table.GetTable();
    const [first, second] = core.GetTabLines();
    assert(first && second);
    const head = first.GetTabBoxes()[0]?.GetParagraphs()[0];
    const body = second.GetTabBoxes()[0]?.GetParagraphs()[0];
    assert(head && body);
    expect(head.GetTextFormatColl().GetPoolFormatId()).toBe(SwPoolFormatId.COLL_TABLE_HDLN);
    expect(head.GetText()).toBe("Left");
    expect(second.GetTabBoxes()[1]?.GetParagraphs()[0]?.GetText()).toBe("beta");
    expect(body.GetText()).toBe("alpha");
    expect(projectWriterTextRuns(body)[0]?.attributes.bold).toBe(true);
    expect(core.GetRowsToRepeat()).toBe(1);
    expect(core.GetHTMLTableLayout()?.GetMax()).toBeGreaterThan(0);
    expect(
      nodes
        .at(table.GetIndex() - 1)
        .GetTextNode()
        ?.GetText(),
    ).toBe("Table title");
    expect(doc.paragraphs.at(-2)?.GetText()).toBe("After.");
  } finally {
    shell.Close();
  }
});

it("replays omitted cell and row endings through the original lexer cursor", /** Implicit group/row boundaries keep all text in its own cell. @returns Nothing. */ () => {
  const { shell, doc } = open("<table><td>one<td>two<tr><td>three<td>four</table>\n");
  try {
    const table = doc
      .GetNodes()
      .entries()
      .find(
        /** Selects the native table. @param node - Actual document node. @returns Whether table. */ (
          node,
        ): node is SwTableNode => node instanceof SwTableNode,
      );
    assert(table);
    const [first, second] = table.GetTable().GetTabLines();
    expect(first?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe("one");
    expect(first?.GetTabBoxes()[1]?.GetParagraphs()[0]?.GetText()).toBe("two");
    expect(second?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe("three");
    expect(second?.GetTabBoxes()[1]?.GetParagraphs()[0]?.GetText()).toBe("four");
  } finally {
    shell.Close();
  }
});

it("creates the source anchored fly when an HTML table has explicit left alignment", /** Confirms the real style, anchor, wrap and nested node owners reached by the shell. @returns Nothing. */ () => {
  const { shell, doc } = open(
    'Lead.\n\n<table align="left"><tr><td>Floating</td></tr></table>\n\nAfter.\n',
  );
  try {
    const [fly] = [...doc.GetSpzFrameFormats()];
    assert(fly);
    expect(fly.DerivedFrom()?.GetPoolFormatId()).toBe(SwPoolFormatId.FRM_FRAME);
    expect(fly.GetSurround().GetSurround()).toBe(WrapTextMode.RIGHT);
    expect(fly.GetAnchor().GetAnchorNode()?.GetTextNode()).toBeDefined();
    const content = fly.GetContent().GetContentIdx();
    assert(content);
    const table = doc.GetNodes().at(content.GetIndex() + 1);
    assert(table instanceof SwTableNode);
    expect(table.GetFlyFormat()).toBe(fly);
    expect(table.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe(
      "Floating",
    );
  } finally {
    shell.Close();
  }
});

it("round trips the anchored HTML table and its section through the Writer Worker graph", /** Verifies the actual imported frame anchor, original items, table content and bookmark after a structured-clone boundary. @returns Nothing. */ () => {
  const { shell, doc } = open(
    'Lead.\n\n<table align="right" hspace="8" vspace="3"><tr><td>Floating</td></tr></table>\n\nAfter.\n',
  );
  let restored: SwDoc | undefined;
  try {
    const [frame] = [...doc.GetSpzFrameFormats()];
    const original = frame?.GetContent().GetContentIdx()?.GetNode();
    assert(frame && original?.IsStartNode());
    const [originalTable] = doc.nodes.GetSectionContent(original);
    assert(originalTable instanceof SwTableNode);
    const originalText = originalTable
      .GetTable()
      .GetTabLines()[0]
      ?.GetTabBoxes()[0]
      ?.GetParagraphs()[0];
    assert(originalText);
    doc.GetIDocumentMarkAccess().MakeMark(originalText, 3, "InsideFly");
    const snapshot = structuredClone(encodeWriterDocument(doc));
    expect(snapshot.textFrames).toHaveLength(1);
    expect(snapshot.tables).toEqual([]);
    restored = decodeWriterDocument(snapshot);
    const [fly] = [...restored.GetSpzFrameFormats()];
    const content = fly?.GetContent().GetContentIdx()?.GetNode();
    assert(fly && content?.IsStartNode());
    const [table] = restored.nodes.GetSectionContent(content);
    assert(table instanceof SwTableNode);
    expect(table.GetFlyFormat()).toBe(fly);
    expect(fly.GetName()).toBe(frame.GetName());
    expect(fly.DerivedFrom()?.GetPoolFormatId()).toBe(SwPoolFormatId.FRM_FRAME);
    expect(fly.GetSurround().GetSurround()).toBe(WrapTextMode.LEFT);
    expect(fly.GetAnchor().GetAnchorId()).toBe(frame.GetAnchor().GetAnchorId());
    const anchorText = frame.GetAnchor().GetAnchorNode()?.GetTextNode();
    assert(anchorText);
    const anchorIndex = doc.paragraphs.indexOf(anchorText);
    expect(anchorIndex).toBeGreaterThanOrEqual(0);
    expect(fly.GetAnchor().GetAnchorNode()).toBe(restored.paragraphs[anchorIndex]);
    const text = table.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
    expect(text?.GetText()).toBe("Floating");
    expect(restored.GetIDocumentMarkAccess().GetBookmarks()[0]?.GetMarkPos().GetNode()).toBe(text);
    expect(encodeWriterDocument(restored).textFrames).toEqual(snapshot.textFrames);
  } finally {
    restored?.Dispose();
    shell.Close();
  }
});

it.each(["paragraph", "char"] as const)(
  "persists native Markdown tables and their %s anchors in ODT",
  /** Exercises native frame/style SAX and the ODT-to-Worker handoff. @param type - Native anchor type. @returns Completion. */ async (
    type,
  ) => {
    const { shell, doc } = open(
      'Lead.\n\n<table align="left" hspace="8" vspace="3"><tr><td><b>Floating</b></td></tr></table>\n\nAfter.\n',
    );
    const metadata = { title: "Native floating table" };
    let reopened: SwDoc | undefined, transferred: SwDoc | undefined;
    try {
      const [original] = [...doc.GetSpzFrameFormats()];
      assert(original);
      if (type === "char") {
        const owner = doc.paragraphs.find(
          /** Selects the body paragraph containing text before and after the char anchor. @param node - Body paragraph. @returns Whether selected. */
          (node) => node.GetText() === "After.",
        );
        assert(owner);
        const point = new SwPosition(owner, 2);
        const anchor = new SwFormatAnchor(RndStdIds.FLY_AT_CHAR);
        const size = original.GetFrameSize().Clone();
        try {
          anchor.SetAnchor(point);
          original.SetFormatAttr(anchor);
          size.SetWidthPercent(70);
          original.SetFormatAttr(size);
        } finally {
          size.Dispose();
          anchor.Dispose();
          point.Dispose();
        }
      }
      const bytes = writeOdtDocument(doc, metadata);
      const xml = await new ZipFile(bytes).readTextEntry("content.xml");
      expect(xml).toContain('<draw:frame draw:style-name="fr1"');
      expect(xml).toContain('<draw:text-box fo:min-height="0cm">');
      expect(xml).toContain('style:horizontal-pos="left"');
      expect(xml).toContain('style:wrap="right"');
      expect(xml).toContain(`text:anchor-type="${type}" svg:width=`);
      if (type === "char") expect(xml).toContain('style:rel-width="70%"');
      reopened = (await readOdtDocument(bytes, metadata)).document;
      transferred = decodeWriterDocument(encodeWriterDocument(reopened));
      for (const candidate of [reopened, transferred]) {
        const [fly] = [...candidate.GetSpzFrameFormats()];
        const start = fly?.GetContent().GetContentIdx()?.GetNode();
        assert(fly && start?.IsStartNode());
        const content = candidate.nodes.GetSectionContent(start);
        const table = content[0];
        expect(content).toHaveLength(1);
        assert(table instanceof SwTableNode);
        expect(table.GetFlyFormat()).toBe(fly);
        const paragraph = table.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
        assert(paragraph);
        expect(paragraph.GetText()).toBe("Floating");
        expect(projectWriterTextRuns(paragraph)[0]?.attributes.bold).toBe(true);
        expect(fly.GetName()).toBe(original.GetName());
        expect(fly.GetFrameSize().GetWidth()).toBe(original.GetFrameSize().GetWidth());
        expect(original.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Variable);
        expect(fly.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Minimum);
        expect(fly.GetFrameSize().GetWidthPercent()).toBe(
          original.GetFrameSize().GetWidthPercent(),
        );
        expect(fly.GetAnchor().GetAnchorContentOffset()).toBe(type === "char" ? 2 : 0);
        expect(fly.GetSurround().GetSurround()).toBe(WrapTextMode.RIGHT);
        expect(fly.GetLRSpace().ResolveLeft()).toBe(original.GetLRSpace().ResolveLeft());
        expect(fly.GetULSpace().GetUpper()).toBe(original.GetULSpace().GetUpper());
        expect(fly.GetAnchor().GetAnchorId()).toBe(original.GetAnchor().GetAnchorId());
        expect(fly.GetAnchor().GetAnchorNode()?.GetTextNode()?.GetText()).toBe(
          original.GetAnchor().GetAnchorNode()?.GetTextNode()?.GetText(),
        );
        expect(
          candidate.paragraphs.map(
            /** Observes the original body, excluding the floating text section. @param node - Body owner. @returns Text. */
            (node) => node.GetText(),
          ),
        ).toEqual(
          doc.paragraphs.map(
            /** Observes the original HTML-imported body. @param node - Body owner. @returns Text. */
            (node) => node.GetText(),
          ),
        );
      }
    } finally {
      transferred?.Dispose();
      reopened?.Dispose();
      shell.Close();
    }
  },
);

it("keeps a child table reached through the recursive original table token loop", /** Inspects actual table section ownership and the parent's live layout. @returns Nothing. */ () => {
  const { shell, doc } = open(
    "<table><tr><td>Before<table><tr><td>Nested</td></tr></table>After</td></tr></table>\n",
  );
  try {
    const tables = doc
      .GetNodes()
      .entries()
      .filter(
        /** Retains real table node identities in document order. @param node - Actual document node. @returns Whether a table. */ (
          node,
        ): node is SwTableNode => node instanceof SwTableNode,
      );
    const [parent, child] = tables;
    assert(parent && child);
    expect(tables).toHaveLength(2);
    const box = parent.GetTable().GetTabLines()[0]?.GetTabBoxes()[0];
    expect(child.StartOfSectionNode()).toBe(box?.GetSttNd());
    expect(child.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe(
      "Nested",
    );
    expect(parent.GetTable().GetHTMLTableLayout()?.GetMin()).toBeGreaterThan(0);
  } finally {
    shell.Close();
  }
});

it("exports a Markdown HTML text fly through the ordinary RTF shape path", /** Preserves the imported frame table across the native filters. @returns Nothing. */ () => {
  const { shell, doc } = open(
    'Lead.\n\n<table align="right"><tr><td>Floating table</td></tr></table>\n\nTail.\n',
  );
  let restored: SwDoc | undefined;
  try {
    const rtf = RtfExport.WriteDocument(doc);
    expect(new TextDecoder().decode(rtf)).toContain(String.raw`{\*\shpinst`);
    restored = new RtfDocumentImpl().ResolveBytes(rtf);
    expect(restored.GetTables()).toHaveLength(0);
    const [fly] = [...restored.GetSpzFrameFormats()];
    const section = fly?.GetContent().GetContentIdx()?.GetNode();
    assert(fly && section?.IsStartNode());
    expect(fly.GetFlySplit().GetValue()).toBe(false);
    const [table] = restored.nodes.GetSectionContent(section);
    assert(table instanceof SwTableNode);
    expect(table.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe(
      "Floating table",
    );
    expect(
      restored.paragraphs.some(
        /** Finds the main text after the independent shape stream. @param node - Body text node. @returns Whether this is the tail. */
        (node) => node.GetText() === "Tail.",
      ),
    ).toBe(true);
  } finally {
    restored?.Dispose();
    shell.Close();
  }
});
