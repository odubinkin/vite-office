/** @fileoverview Named Word styles through the actual Writer graph, OOXML archive, and import. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { SvxAdjustItem } from "../../../../editeng/source/items/paraitem.adjust";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_WEIGHT, RES_PARATR_ADJUST } from "../../../inc/hintids";
import { SwDoc } from "../../core/doc/doc";
import { SwFormatCharFormat } from "../../core/txtnode/fmtatr2";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { writeOdtDocument } from "../xml/wrtxml";
import { readOdtDocument } from "../xml/swxml";
import {
  RES_CHRATR_LANGUAGE,
  RES_CHRATR_CJK_LANGUAGE,
  RES_CHRATR_CTL_LANGUAGE,
} from "../../../inc/hintids";
import { DocxExport } from "./docxexport";

it("keeps named style properties and native inheritance through DOCX", /** Exercises paragraph and character definitions, next-style relationships and direct run overrides. @returns Completion. */ async () => {
  const original = new SwDoc();
  let reopened: SwDoc | undefined;
  try {
    const standard = original.GetDfltTextFormatColl();
    const base = original.MakeTextFormatColl("Body Parent", standard);
    base.SetFormatAttr(new SvxAdjustItem(SvxAdjust.Center, RES_PARATR_ADJUST));
    const child = original.MakeTextFormatColl("Body Child", base);
    child.SetNextTextFormatColl(standard);
    child.SetAutoUpdateOnDirectFormat();
    const parentCharacter = original.MakeCharFormat("Letter Parent", original.GetDfltCharFormat());
    parentCharacter.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
    const emphasis = original.MakeCharFormat("Letter Child", parentCharacter);
    const paragraph = original.paragraphs[0];
    assert(paragraph);
    paragraph.SetText("สวัสดี World");
    paragraph.ChgFormatColl(child);
    paragraph.InsertItem(new SwFormatCharFormat(emphasis), 0, 6);
    const direct = new SfxItemSet(original.GetAttrPool(), [[RES_CHRATR_WEIGHT, RES_CHRATR_WEIGHT]]);
    direct.Put(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, RES_CHRATR_WEIGHT));
    paragraph.SetAttr(direct, 4, 6);
    const bytes = await DocxExport.WriteDocument(original);
    const archive = await DocumentArchive.open(bytes);
    const styles = await archive.readTextEntry("word/styles.xml");
    const document = await archive.readTextEntry("word/document.xml");
    expect(await archive.readTextEntry("word/_rels/document.xml.rels")).toContain(
      'Target="styles.xml"',
    );
    expect(await archive.readTextEntry("[Content_Types].xml")).toContain(
      'PartName="/word/styles.xml"',
    );
    expect(styles).toContain('<w:style w:type="paragraph" w:styleId="Normal" w:default="1">');
    expect(styles).toContain(
      '<w:name w:val="Body Child"/><w:basedOn w:val="BodyParent"/><w:next w:val="Normal"/><w:autoRedefine/>',
    );
    expect(styles).toContain('<w:jc w:val="center"/>');
    expect(styles).toContain('<w:name w:val="Letter Child"/><w:basedOn w:val="LetterParent"/>');
    expect(document).toContain('<w:pPr><w:pStyle w:val="BodyChild"/><w:rPr></w:rPr></w:pPr>');
    expect(document).toContain('<w:rPr><w:rStyle w:val="LetterChild"/><w:b/></w:rPr>');
    expect(document).toContain(
      '<w:rPr><w:rStyle w:val="LetterChild"/><w:b w:val="false"/></w:rPr>',
    );
    reopened = await importOOXML(bytes, {});
    const node = reopened.paragraphs[0];
    assert(node);
    const style = node.GetTextFormatColl();
    expect(node.GetText()).toBe("สวัสดี World");
    expect(style.GetName()).toBe("Body Child");
    expect(style.DerivedFrom()?.GetName()).toBe("Body Parent");
    expect(style.GetNextTextFormatColl()).toBe(reopened.GetDfltTextFormatColl());
    expect((node.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust()).toBe(SvxAdjust.Center);
    expect(reopened.FindCharFormatByName("Letter Child")?.DerivedFrom()?.GetName()).toBe(
      "Letter Parent",
    );
  } finally {
    reopened?.Dispose();
    original.Dispose();
  }
});

it("round trips the pinned character style without flattening its Word style ID", /** Uses the original LibreOffice DOCX character-highlight fixture. @returns Completion. */ async () => {
  const fixture = readFileSync(
    "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf138345_charStyleHighlight.docx",
  );
  const original = await importOOXML(new Uint8Array(fixture), {});
  let reopened: SwDoc | undefined, primary: SwDoc | undefined;
  try {
    const output = await DocxExport.WriteDocument(original);
    const archive = await DocumentArchive.open(output);
    const document = await archive.readTextEntry("word/document.xml");
    expect(document).toContain('<w:rStyle w:val="charBackground"/>');
    expect(await archive.readTextEntry("word/styles.xml")).not.toContain("<w:highlight");
    reopened = await importOOXML(output, {});
    const first = reopened.paragraphs[0];
    assert(first);
    const names = first
      .GetpSwpHints()
      ?.entries()
      .flatMap(
        /** Reads actual native character format spans. @param hint - Source text attribute. @returns Native style name if present. */
        ({ format }) =>
          format instanceof SwFormatCharFormat ? [format.GetCharFormat()?.GetName()] : [],
      );
    expect(names).toEqual(expect.arrayContaining(["charBackground"]));
    const metadata = { title: "Named styles" };
    const odt = await writeOdtDocument(original, metadata);
    const odtStyles = await (await DocumentArchive.open(odt)).readTextEntry("styles.xml");
    expect(odtStyles).toContain('fo:language="zxx"');
    expect(odtStyles).toContain('style:language-asian="zh"');
    expect(odtStyles).toContain('style:language-complex="ar"');
    primary = (await readOdtDocument(odt, metadata)).document;
    for (const which of [RES_CHRATR_LANGUAGE, RES_CHRATR_CJK_LANGUAGE, RES_CHRATR_CTL_LANGUAGE]) {
      expect(primary.GetDfltTextFormatColl().GetAttrSet().Get(which)).toEqual(
        original.GetDfltTextFormatColl().GetAttrSet().Get(which),
      );
    }
    expect(primary.paragraphs[0]?.GetText()).toBe("An orange background is so nice.");
    expect(primary.FindCharFormatByName("charBackground")).toBeDefined();
    const exportedPrimary = await DocumentArchive.open(await DocxExport.WriteDocument(primary));
    expect(await exportedPrimary.readTextEntry("word/document.xml")).toContain(
      '<w:rStyle w:val="charBackground"/>',
    );
  } finally {
    primary?.Dispose();
    reopened?.Dispose();
    original.Dispose();
  }
});
