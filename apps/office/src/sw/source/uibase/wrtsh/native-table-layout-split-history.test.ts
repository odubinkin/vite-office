/** @fileoverview Verifies native table split item XML mapping, canonical history and original ownership. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh1";
import { SwEditWin } from "../docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { ODF_NAMESPACES, XMLToken } from "../../../../xmloff/source/core/xmltoken";
import {
  XMLTableStyleContext,
  type OdfTableStyle,
} from "../../../../xmloff/source/table/XMLTableImport";
import { SwTabFrame } from "../../core/layout/tabfrm";
const shells: SwWrtShell[] = [];
afterEach(
  /** Releases original shells. @returns Nothing. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
  },
);
/** Creates namespace-aware SAX input. @param name - Style attribute. @param value - Lexical value. @returns Native attribute list. */
function attribute(name: string, value: string) {
  return { name: "style:" + name, local: name, prefix: "style", uri: ODF_NAMESPACES.style, value };
}
it.each([
  ["true", true],
  ["auto", true],
  ["false", false],
  ["always", false],
  ["1", undefined],
  ["0", undefined],
  ["invalid", undefined],
  ["TRUE", undefined],
] as const)(
  "native table split XML mapper admits source lexical value%s",
  /** Checks source legacy values and no publication for invalid tokens. @param value - Source input. @param expected - Independent native item. @returns Nothing. */ (
    value,
    expected,
  ) => {
    let published: OdfTableStyle | undefined;
    const context = new XMLTableStyleContext(
      {
        registerTableStyle:
          /** Captures the actual SAX style item. @param _name - Existing style name. @param style - Published style. @returns Nothing. */ (
            _name,
            style,
          ) => {
            published = style;
          },
      },
      new FastAttributeList([attribute("name", "Split"), attribute("family", "table")]),
    );
    context.createFastChildContext(
      XMLToken.STYLE_TABLE_PROPERTIES,
      new FastAttributeList([attribute("may-break-between-rows", value)]),
    );
    context.endFastElement();
    expect(published?.family).toBe("table");
    if (published?.family !== "table") throw new Error("Missing native table style");
    expect(published.layoutSplit).toBe(expected);
  },
);
it.each([undefined, true, false])(
  "native table split item survives ODT and grouped attribute history original=%s",
  /** Checks genuine document round trip and native shell history. @param original - Authored item/default. @returns Completion. */ async (
    original,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode(
        "Split",
        { width: 6000, ...(original === undefined ? {} : { layoutSplit: original }) },
        doc.paragraphs[0],
      );
    table.AddColumnWidth(6000);
    for (let r = 0; r < 3; r++) doc.nodes.AppendTableRow(table, 1, { keepTogether: r === 1 });
    const row = table.GetTabLines()[0],
      box = row?.GetTabBoxes()[0],
      node = box?.GetParagraphs()[0];
    if (row === undefined || box === undefined || node === undefined)
      throw new Error("Missing native split graph");
    node.SetText("Cell");
    doc.EnsureNumRule("Numbering", "numbered");
    node.SetNumRule("Numbering");
    node.SetListId("split-list");
    const shell = new SwWrtShell(
        new SwDocShell(
          doc,
          createDocument({ id: "split-history", suiteId: "writer", title: "Split" }),
        ),
      ),
      edit = new SwEditWin(shell);
    shells.push(shell);
    edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
    const frame = new SwTabFrame(table),
      initialBytes = writeOdtDocument(doc, { title: "Split" }),
      initialXml = await new ZipFile(initialBytes).readTextEntry("content.xml");
    if (original === undefined) expect(initialXml).not.toContain("may-break-between-rows");
    else expect(initialXml).toContain('style:may-break-between-rows="' + String(original) + '"');
    const opened = await readOdtDocument(initialBytes, { title: "Split" });
    expect(opened.document.GetTables()[0]?.GetFormat().layoutSplit).toBe(original);
    expect(frame.IsLayoutSplitAllowed()).toBe(original ?? true);
    const undo = doc.GetUndoManager();
    undo.StartUndo("Split policy");
    try {
      expect(shell.SetTableAttr({ layoutSplit: !(original ?? true) })).toBe(true);
    } finally {
      undo.EndUndo();
    }
    expect(undo.GetUndoActionCount()).toBe(1);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(frame.IsLayoutSplitAllowed()).toBe(!(original ?? true));
      expect(shell.Undo()).toBe(true);
      expect(table.GetFormat().layoutSplit).toBe(original);
      expect(frame.IsLayoutSplitAllowed()).toBe(original ?? true);
      expect(shell.Redo()).toBe(true);
      expect(frame.IsLayoutSplitAllowed()).toBe(!(original ?? true));
      expect(table.GetTabLines()[0]).toBe(row);
      expect(row.GetTabBoxes()[0]).toBe(box);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(table.GetTabLines()[1]?.GetFormat().keepTogether).toBe(true);
    }
    edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
    edit.InsertText("X");
    expect([node.GetText(), node.GetListId(), node.GetNumRuleName()]).toEqual([
      "CeXll",
      "split-list",
      "Numbering",
    ]);
    const restored = await readOdtDocument(writeOdtDocument(doc, { title: "Split" }), {
      title: "Split",
    });
    expect(restored.document.GetTables()[0]?.GetFormat().layoutSplit).toBe(!(original ?? true));
    expect(
      restored.document
        .GetTables()[0]
        ?.GetTabLines()[0]
        ?.GetTabBoxes()[0]
        ?.GetParagraphs()[0]
        ?.GetText(),
    ).toBe("CeXll");
  },
);
