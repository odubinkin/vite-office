/** @fileoverview Checks complete native legacy symbol table output and actual list/ODT/Worker ownership. */
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { createLegacySymbolImportConverter } from "../../../unotools/source/misc/fontcvt";
import { parseOdfXmlStream, SvXMLImport } from "../core/xmlimp";
import { ODF_NAMESPACES } from "../core/xmltoken";
import { escapeXml } from "../text/txtparae";
import { SvxXMLListLevelStyleContext_Impl } from "./xmlnumi";
import { SwDoc } from "../../../sw/source/core/doc/doc";
import { applyWriterParagraphList } from "../../../sw/source/core/doc/list";
import { createWriterNumFormat } from "../../../sw/source/core/doc/number";
import { SwNumRuleItem } from "../../../sw/source/core/para/paratr";
import { SvxFontItem } from "../../../editeng/source/items/textitem";
import { RES_CHRATR_FONT } from "../../../sw/inc/hintids";
import { readOdtDocument } from "../../../sw/source/filter/xml/swxml";
import { writeOdtDocument } from "../../../sw/source/filter/xml/wrtxml";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../sw/browser/filter/xml/writer-document-codec";

it("matches the complete native224slot StarBats and StarMath observable output census and alias boundaries", /** Checks frozen source-derived output digests, all aliases/holes and native unsigned arithmetic independently from any upstream runtime. @returns Nothing. */ () => {
  for (const [family, digest, holes] of [
    ["StarBats", "b38a0e2c74c5a58d7f1eaf8c11d6feb5eb3e8954945290006fa44042cdbb7e77", 29],
    ["StarMath", "86d64838b3b06ed42f60d4e9db288064c3985a30f7b07885cd44d26294738db3", 5],
  ] as const) {
    const converter = createLegacySymbolImportConverter(family),
      bytes = Buffer.alloc(448);
    let substitutions = 0;
    for (let scalar = 0x20; scalar <= 0xff; scalar++) {
      const mapped = converter.RecodeChar(scalar);
      expect(converter.RecodeChar(scalar + 0xf000)).toBe(mapped);
      bytes.writeUInt16LE(mapped, (scalar - 0x20) * 2);
      if (mapped === 0xe12c) substitutions++;
    }
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(digest);
    expect(substitutions).toBe(holes);
    expect(Object.isFrozen(converter)).toBe(true);
    for (const scalar of [0, 1, 0x1f, 0x100, 0xe022, 0xf000, 0xf01f, 0xf100, 0xffff])
      expect(converter.RecodeChar(scalar)).toBe(scalar);
    expect(converter.RecodeChar(0x1f022)).toBe(converter.RecodeChar(0x22));
    expect(converter.RecodeChar(0x10022)).toBe(converter.RecodeChar(0x22));
  }
  const owner = new SvXMLImport();
  expect(owner.ConvStarBatsCharToStarSymbol(0xf022)).toBe(0x25cf);
  expect(owner.ConvStarBatsCharToStarSymbol(0x5b)).toBe(0xe12c);
  expect(owner.ConvStarMathCharToStarSymbol(0xf027)).toBe(0x221e);
  expect(owner.ConvStarMathCharToStarSymbol(0x37)).toBe(0xe12c);
});

/** Actual source-shaped import owner with an existing font declaration. */
class SymbolImport extends SvXMLImport {
  /** Resolves one existing font alias. @param name - XML alias. @returns Existing family or absence. */
  public getFontFace(name: string): string | undefined {
    return name === "Legacy" ? "StarBats" : undefined;
  }
}

/** Parses a real owning level context. @param family - Literal direct family. @param glyph - Literal glyph. @param kind - List family. @param extra - Optional additional native properties. @returns Owned context. */
function level(
  family: string,
  glyph: string,
  kind = "bullet",
  extra = "",
): SvxXMLListLevelStyleContext_Impl {
  let context: SvxXMLListLevelStyleContext_Impl | undefined;
  const owner = new SymbolImport();
  parseOdfXmlStream(
    `<text:list-level-style-${kind} xmlns:text="${ODF_NAMESPACES.text}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:fo="${ODF_NAMESPACES.fo}" text:level="1" text:bullet-char="${escapeXml(glyph)}"><style:text-properties fo:font-family="${escapeXml(family)}" ${extra}/></text:list-level-style-${kind}>`,
    {
      /** Creates the actual level borrowing the import owner. @param token - Native level. @param attrs - Declaration. @returns Context. */
      createFastContext(token, attrs) {
        context = new SvxXMLListLevelStyleContext_Impl(token, attrs, owner);
        return context;
      },
      /** Rejects unknown roots. @returns Null. */ createUnknownContext: () => null,
    },
  );
  if (context === undefined) throw Error("Missing level");
  return context;
}

it("recodes exact ASCII legacy bullet families at GetProperties with native declaration precedence and repeated mutation", /** Checks literal source results, omitted/other families, holes, scalar narrowing and observable repeated publication. @returns Nothing. */ () => {
  for (const [family, scalar, expected] of [
    ["StarBats", 0xf022, 0x25cf],
    ["starbats", 0x22, 0x25cf],
    ["STARBATS", 0x5b, 0xe12c],
    ["StarMath", 0xf027, 0x221e],
    ["starmath", 0x27, 0x221e],
    ["STARMATH", 0x37, 0xe12c],
    ["StarBats", 0x1f022, 0x25cf],
    ["StarMath", 0x10022, 0x22],
  ] as const) {
    const properties = level(family, String.fromCodePoint(scalar)).GetProperties();
    expect(properties.bulletChar).toBe(String.fromCodePoint(expected));
    expect(properties.bulletFont).toEqual({ name: "StarSymbol" });
  }
  expect(level("StarBats", "").GetProperties().bulletChar).toBe("\0");
  expect(level("", "\uf022", "bullet", 'style:font-name="Legacy"').GetProperties().bulletChar).toBe(
    "●",
  );
  expect(
    level("StarMath", "\uf027", "bullet", 'style:font-name="Legacy"').GetProperties().bulletChar,
  ).toBe("∞");
  for (const family of ["", "OpenSymbol", "Star Bats", "ſtarBats", "StarBats;Other"])
    expect(level(family, "\uf022").GetProperties().bulletChar).toBe("\uf022");
  const numbered = level("StarBats", "\uf022", "number").GetProperties();
  expect(numbered.bulletFont).toBeUndefined();
  expect(numbered.bulletChar).toBeUndefined();
  const repeated = level("StarMath", "?");
  expect(repeated.GetProperties().bulletChar).toBe("¿");
  expect(repeated.GetProperties().bulletChar).toBe("\ue0aa");
  expect(repeated.GetProperties().bulletFont).toEqual({ name: "StarSymbol" });
});

it("preserves converted native glyph and family through common automatic body cell ODT and Worker cycles", /** Checks real source filter/graph owners and repeated packages without a browser conversion adapter. @returns Completion. */ async () => {
  const source = new SwDoc(),
    body = source.paragraphs[0];
  if (body === undefined) throw Error("Missing body");
  const table = source.GetNodes().MakeTableNode("Legacy");
  table.AddColumnWidth(6000);
  const cell = source.GetNodes().AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
  if (cell === undefined) throw Error("Missing cell");
  for (const [node, family, scalar, name] of [
    [body, "StarBats", 0xf022, "Bats"],
    [cell, "StarMath", 0xf027, "Math"],
  ] as const) {
    node.SetText(name);
    applyWriterParagraphList(node, { kind: "bullet", level: 0, ruleName: name });
    const rule = node.GetNumRule();
    if (rule === undefined) throw Error("Missing rule");
    rule.Set(
      0,
      createWriterNumFormat("bullet", String.fromCodePoint(scalar), { bulletFont: family }),
    );
  }
  const common = source.EnsureNumRule("CommonLegacy", "bullet");
  common.Set(0, createWriterNumFormat("bullet", "[", { bulletFont: "StarBats" }));
  const style = source.MakeTextFormatColl("LegacyStyle");
  style.SetFormatAttr(new SwNumRuleItem("CommonLegacy"));
  style.SetFormatAttr(new SvxFontItem("StarBats", RES_CHRATR_FONT));
  let imported: SwDoc | undefined, reopened: SwDoc | undefined, transferred: SwDoc | undefined;
  try {
    imported = (
      await readOdtDocument(writeOdtDocument(source, { title: "Legacy" }), { title: "Legacy" })
    ).document;
    reopened = (
      await readOdtDocument(writeOdtDocument(imported, { title: "Legacy" }), { title: "Legacy" })
    ).document;
    transferred = decodeWriterDocument(encodeWriterDocument(imported));
    for (const doc of [imported, reopened, transferred]) {
      for (const [name, scalar] of [
        ["Bats", 0x25cf],
        ["Math", 0x221e],
        ["CommonLegacy", 0xe12c],
      ] as const) {
        expect(doc.FindNumRulePtr(name)?.Get(0).GetBulletChar()).toBe(scalar);
        expect(doc.FindNumRulePtr(name)?.Get(0).GetBulletFont()?.GetFamilyName()).toBe(
          "StarSymbol",
        );
      }
      expect(doc.paragraphs[0]?.GetText()).toBe("Bats");
      expect(
        doc.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText(),
      ).toBe("Math");
    }
  } finally {
    transferred?.Dispose();
    reopened?.Dispose();
    imported?.Dispose();
    source.Dispose();
  }
});
