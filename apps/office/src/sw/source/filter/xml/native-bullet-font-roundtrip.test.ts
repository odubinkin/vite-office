/** @fileoverview Checks native UNO bullet font copying and real ODT common/automatic/Worker cycles. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SwNumFormat } from "../../core/doc/number";
import { NumberingRulePropertyError, SwXNumberingRules } from "../../core/unocore/unosett";
import { SwNumRuleItem } from "../../core/para/paratr";
import { Font } from "../../../../vcl/source/font/font";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { writeOdtDocument } from "./wrtxml";
import { readOdtDocument } from "./swxml";
import { exportContentXml, exportStylesXml } from "./xmlexp";
import { importWriterXml } from "./xmlimp";

it("applies named descriptors by native copy and ignores empty descriptors while rejecting malformed values atomically", /** Checks the real UNO copy/apply/commit boundary without clearing optional native font ownership. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    rule = doc.EnsureNumRule("UNO", "bullet"),
    service = new SwXNumberingRules(rule);
  try {
    const input = { name: "Native Mono" };
    service.replaceByIndex(0, { kind: "bullet", suffix: "", bulletFont: input });
    input.name = "Changed caller";
    expect(rule.Get(0).GetBulletFont()?.GetFamilyName()).toBe("Native Mono");
    service.replaceByIndex(0, { kind: "bullet", suffix: "", bulletFont: { name: "" } });
    expect(rule.Get(0).GetBulletFont()?.GetFamilyName()).toBe("Native Mono");
    service.replaceByIndex(0, { kind: "bullet", suffix: "" });
    expect(rule.Get(0).GetBulletFont()?.GetFamilyName()).toBe("Native Mono");
    for (const bulletFont of [null, "Wrong", {}, { name: 1 }]) {
      expect(
        /** Rejects a malformed descriptor before committing any format fields. @returns Nothing. */ () =>
          service.replaceByIndex(0, { kind: "numbered", suffix: "Wrong", bulletFont } as never),
      ).toThrow(NumberingRulePropertyError);
      expect(rule.Get(0).GetBulletFont()?.GetFamilyName()).toBe("Native Mono");
      expect(rule.Get(0).GetSuffix()).toBe("");
    }
    const empty = new SwNumFormat(rule.Get(1));
    empty.SetBulletFont(undefined);
    rule.Set(1, empty);
    service.replaceByIndex(1, { kind: "bullet", suffix: "", bulletFont: { name: "" } });
    expect(rule.Get(1).GetBulletFont()).toBeUndefined();
  } finally {
    doc.Dispose();
  }
});

it("retains custom bullet families through common and automatic ODT rules, body/cell nodes and Worker graph", /** Checks real packages with both declared face and direct quoted family paths. @returns Completion. */ async () => {
  const source = new SwDoc(),
    body = source.paragraphs[0];
  if (body === undefined) throw Error("Missing body");
  const table = source.GetNodes().MakeTableNode("Fonts");
  table.AddColumnWidth(6000);
  const cell = source.GetNodes().AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
  if (cell === undefined) throw Error("Missing cell");
  for (const [node, family, ruleName] of [
    [body, "Native Marker;Comma, Face", "BodyFont"],
    [cell, "Liberation Mono", "CellFont"],
  ] as const) {
    node.SetText(ruleName);
    applyWriterParagraphList(node, { kind: "bullet", level: 0, ruleName });
    const rule = node.GetNumRule();
    if (rule === undefined) throw Error("Missing rule");
    const format = new SwNumFormat(rule.Get(0)),
      font = new Font();
    font.SetFamilyName(family);
    format.SetBulletFont(font);
    rule.Set(0, format);
  }
  const common = source.EnsureNumRule("CommonFont", "bullet"),
    commonFormat = new SwNumFormat(common.Get(0)),
    commonFont = new Font();
  commonFont.SetFamilyName("Liberation Serif");
  commonFormat.SetBulletFont(commonFont);
  common.Set(0, commonFormat);
  source.MakeTextFormatColl("CommonFontStyle").SetFormatAttr(new SwNumRuleItem("CommonFont"));
  let imported: SwDoc | undefined, reopened: SwDoc | undefined, transferred: SwDoc | undefined;
  try {
    const bytes = writeOdtDocument(source, { title: "Native font" }),
      zip = new ZipFile(bytes);
    const content = await zip.readTextEntry("content.xml"),
      styles = await zip.readTextEntry("styles.xml");
    expect(content).toContain(
      'fo:font-family="&apos;Native Marker&apos;, &apos;Comma, Face&apos;"',
    );
    expect(styles).toContain('<style:text-properties style:font-name="Liberation Serif"/>');
    imported = (await readOdtDocument(bytes, { title: "Native font" })).document;
    reopened = (
      await readOdtDocument(writeOdtDocument(imported, { title: "Native font" }), {
        title: "Native font",
      })
    ).document;
    transferred = decodeWriterDocument(encodeWriterDocument(imported));
    for (const doc of [imported, reopened, transferred]) {
      for (const [name, family] of [
        ["BodyFont", "Native Marker;Comma, Face"],
        ["CellFont", "Liberation Mono"],
        ["CommonFont", "Liberation Serif"],
      ] as const)
        expect(doc.FindNumRulePtr(name)?.Get(0).GetBulletFont()?.GetFamilyName()).toBe(family);
      expect(
        doc.paragraphs.map(
          /** Reads actual document text nodes. @param node - Node. @returns Text. */ (node) =>
            node.GetText(),
        ),
      ).toContain("BodyFont");
      expect(
        doc.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText(),
      ).toBe("CellFont");
    }
  } finally {
    transferred?.Dispose();
    reopened?.Dispose();
    imported?.Dispose();
    source.Dispose();
  }
});

it("includes the native represented font family when checking duplicate common and automatic rule definitions", /** Checks same-family retention and different-family collision through the real XML import boundary. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const declaration =
    /** Emits otherwise identical definitions with distinct XML aliases for one native rule name. @param family - Font family. @param alias - XML style identity. @returns Definition XML. */ (
      family: string,
      alias: string,
    ) =>
      `<text:list-style style:name="${alias}" style:display-name="Shared"><text:list-level-style-bullet text:level="1" text:bullet-char="•"><style:text-properties fo:font-family="${family}"/></text:list-level-style-bullet></text:list-style>`;
  try {
    const styles = exportStylesXml(doc).replace(
        "</office:styles>",
        declaration("NativeA", "CommonAlias") + "</office:styles>",
      ),
      content = exportContentXml(doc);
    const same = importWriterXml(
      styles,
      content.replace(
        "</office:automatic-styles>",
        declaration("NativeA", "AutomaticAlias") + "</office:automatic-styles>",
      ),
      { title: "Same" },
    ).document;
    expect(same.FindNumRulePtr("Shared")?.Get(0).GetBulletFont()?.GetFamilyName()).toBe("NativeA");
    same.Dispose();
    expect(
      /** Rejects only the changed family in an otherwise identical rule. @returns Candidate document. */ () =>
        importWriterXml(
          styles,
          content.replace(
            "</office:automatic-styles>",
            declaration("NativeB", "AutomaticAlias") + "</office:automatic-styles>",
          ),
          { title: "Different" },
        ),
    ).toThrow("Conflicting ODF list rule: Shared");
  } finally {
    doc.Dispose();
  }
});
