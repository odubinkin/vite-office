/** @fileoverview Checks native bullet scalar publication, export defaults and actual ODT/Worker owners. */
import { expect, it } from "vitest";
import { FastAttributeList } from "../core/xmlimp";
import { ODF_NAMESPACES, XMLToken } from "../core/xmltoken";
import { escapeXml } from "../text/txtparae";
import { SvxXMLListLevelStyleContext_Impl } from "./xmlnumi";
import { SvxXMLNumRuleExport } from "./xmlnume";
import { SwDoc } from "../../../sw/source/core/doc/doc";
import { applyWriterParagraphList } from "../../../sw/source/core/doc/list";
import { createWriterNumFormat } from "../../../sw/source/core/doc/number";
import { SwNumRuleItem } from "../../../sw/source/core/para/paratr";
import { readOdtDocument } from "../../../sw/source/filter/xml/swxml";
import { writeOdtDocument } from "../../../sw/source/filter/xml/wrtxml";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../sw/browser/filter/xml/writer-document-codec";

it("publishes one native scalar including zero for absent and empty bullet declarations", /** Checks independent literal source results without invoking pinned upstream. @returns Nothing. */ () => {
  for (const [raw, expected] of [
    [undefined, "\0"],
    ["", "\0"],
    ["\0", "\0"],
    ["\0●", "\0"],
    ["●tail", "●"],
    ["🔹tail", "🔹"],
    ["\u0001tail", "\u0001"],
    [" tail", " "],
  ] as const) {
    const attrs = new FastAttributeList(
      raw === undefined
        ? []
        : [
            {
              name: "bullet-char",
              local: "bullet-char",
              prefix: "text",
              uri: ODF_NAMESPACES.text,
              value: raw,
            },
          ],
    );
    const context = new SvxXMLListLevelStyleContext_Impl(
      XMLToken.TEXT_LIST_LEVEL_STYLE_BULLET,
      attrs,
    );
    for (let read = 0; read < 2; read++) {
      expect(context.GetProperties().bulletChar).toBe(expected);
      expect(context.GetProperties().bulletFont).toEqual({ name: "" });
    }
    expect(
      new SvxXMLListLevelStyleContext_Impl(
        XMLToken.TEXT_LIST_LEVEL_STYLE_NUMBER,
        attrs,
      ).GetProperties().bulletChar,
    ).toBeUndefined();
  }
});

it("exports first native scalar with distinct empty default zero and nonzero control behavior", /** Checks initialF095, zero-only blank and actual codepoint truncation independently of importer output. @returns Nothing. */ () => {
  const exporter = new SvxXMLNumRuleExport(escapeXml);
  for (const [raw, expected] of [
    [undefined, "\uf095"],
    ["", "\uf095"],
    ["\0", ""],
    ["\0●", ""],
    ["\u0001", "\uf095"],
    ["\u001ftail", "\uf095"],
    [" tail", " "],
    ["●tail", "●"],
    ["🔹tail", "🔹"],
    ["&tail", "&amp;"],
    ['"tail', "&quot;"],
  ] as const) {
    const properties = {
      kind: "bullet" as const,
      ...(raw === undefined ? {} : { bulletChar: raw }),
    };
    expect(exporter.exportLevelStyle(0, properties)).toContain(
      'text:bullet-char="' + expected + '"',
    );
  }
});

it("retains zero native bullet through common automatic body cell ODT and Worker cycles", /** Verifies original rule scalar ownership and sanitization through actual package filters, without browser empty-string projection. @returns Completion. */ async () => {
  const source = new SwDoc(),
    body = source.paragraphs[0];
  if (body === undefined) throw Error("Missing body");
  const table = source.GetNodes().MakeTableNode("Scalars");
  table.AddColumnWidth(6000);
  const cell = source.GetNodes().AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
  if (cell === undefined) throw Error("Missing cell");
  for (const [node, name, scalar] of [
    [body, "ZeroBody", 0],
    [cell, "ZeroCell", 0],
  ] as const) {
    node.SetText(name);
    applyWriterParagraphList(node, { kind: "bullet", level: 0, ruleName: name });
    const rule = node.GetNumRule();
    if (rule === undefined) throw Error("Missing rule");
    rule.Set(0, createWriterNumFormat("bullet", String.fromCodePoint(scalar)));
  }
  for (const [name, scalar] of [
    ["ZeroCommon", 0],
    ["ControlCommon", 1],
    ["AstralCommon", 0x1f539],
  ] as const) {
    source
      .EnsureNumRule(name, "bullet")
      .Set(0, createWriterNumFormat("bullet", String.fromCodePoint(scalar)));
    source.MakeTextFormatColl(name + "Style").SetFormatAttr(new SwNumRuleItem(name));
  }
  let imported: SwDoc | undefined, reopened: SwDoc | undefined, transferred: SwDoc | undefined;
  try {
    imported = (
      await readOdtDocument(writeOdtDocument(source, { title: "Scalars" }), { title: "Scalars" })
    ).document;
    reopened = (
      await readOdtDocument(writeOdtDocument(imported, { title: "Scalars" }), { title: "Scalars" })
    ).document;
    transferred = decodeWriterDocument(encodeWriterDocument(imported));
    for (const doc of [imported, reopened, transferred]) {
      for (const [name, scalar] of [
        ["ZeroBody", 0],
        ["ZeroCell", 0],
        ["ZeroCommon", 0],
        ["ControlCommon", 0xf095],
        ["AstralCommon", 0x1f539],
      ] as const)
        expect(doc.FindNumRulePtr(name)?.Get(0).GetBulletChar(), name).toBe(scalar);
      expect(doc.paragraphs[0]?.GetText()).toBe("ZeroBody");
      expect(
        doc.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText(),
      ).toBe("ZeroCell");
    }
  } finally {
    transferred?.Dispose();
    reopened?.Dispose();
    imported?.Dispose();
    source.Dispose();
  }
});
