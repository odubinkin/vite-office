/** @fileoverview Raw HTML table import through the native Markdown and Writer HTML filter entry points. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  ICULanguageBreakFactory,
  type WordDictionaryName,
} from "../../../../external/icu/source/common/brkeng";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwDoc } from "../../core/doc/doc";
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
