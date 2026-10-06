/** @fileoverview Checks native NONE XML/UNO rule ownership without upstream test dependencies. */
import { expect, it } from "vitest";
import { SvxNumType, SwNumFormat, createWriterNumFormat } from "../../core/doc/number";
import { createWriterNumRule } from "../../core/doc/DocumentListsManager";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition } from "../../core/crsr/pam";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwModify } from "../../../inc/calbck";
import { Font } from "../../../../vcl/source/font/font";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import { parseOdfXmlStream } from "../../../../xmloff/source/core/xmlimp";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { SvxXMLListLevelStyleContext_Impl } from "../../../../xmloff/source/style/xmlnumi";
import { SvxXMLNumRuleExport } from "../../../../xmloff/source/style/xmlnume";
import { SwXNumberingRules, NumberingRulePropertyError } from "../../core/unocore/unosett";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";
import { importWriterXml } from "./xmlimp";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

/** Parses a literal list level through the real native XML context. @param attributes - Declaration attributes. @param bullet - Bullet element. @returns Native properties. */
function level(attributes: string, bullet = false) {
  let context: SvxXMLListLevelStyleContext_Impl | undefined;
  parseOdfXmlStream(
    `<text:list-level-style-${bullet ? "bullet" : "number"} xmlns:text="${ODF_NAMESPACES.text}" xmlns:style="${ODF_NAMESPACES.style}" text:level="3" ${attributes}/>`,
    {
      /** Captures the source-owned level. @param token - Native token. @param values - Native attributes. @returns Context. */
      createFastContext(token, values) {
        return (context = new SvxXMLListLevelStyleContext_Impl(token, values));
      },
      /** Rejects unsupported roots. @returns Null. */
      createUnknownContext: () => null,
    },
  );
  if (context === undefined) throw new Error("Missing XML level");
  return context.GetProperties();
}

it("converts represented number formats with native NONE permission and explicit unsupported scope", /** Verifies empty versus absent permission independently from XML callers. @returns Nothing. */ () => {
  const converter = new SvXMLUnitConverter("mm100"),
    type = { value: SvxNumType.SVX_NUM_CHAR_SPECIAL };
  expect(converter.convertNumFormat(type, "")).toBe(false);
  expect(type.value).toBe(6);
  expect(converter.convertNumFormat(type, "", true)).toBe(true);
  expect(type.value).toBe(5);
  expect(converter.convertNumFormat(type, "1")).toBe(true);
  expect(type.value).toBe(4);
  expect(converter.convertNumFormat(SvxNumType.SVX_NUM_ARABIC)).toBe("1");
  expect(converter.convertNumFormat(SvxNumType.SVX_NUM_NUMBER_NONE)).toBe("");
  for (const unsupported of ["a", "A", "i", "I", "custom"])
    expect(
      /** Rejects an unrepresented family. @returns Nothing. */ () =>
        converter.convertNumFormat(type, unsupported, true),
    ).toThrow("Unsupported ODF numbering format");
  for (const unsupported of [SvxNumType.SVX_NUM_CHAR_SPECIAL, SvxNumType.SVX_NUM_BITMAP])
    expect(
      /** Rejects nonnumeric conversion. @returns Nothing. */ () =>
        converter.convertNumFormat(unsupported),
    ).toThrow("Unsupported ODF numbering type");
});

it("imports empty format as NONE while absent format and bullet defaults retain native types", /** Checks actual XML properties and unchanged pattern generation. @returns Nothing. */ () => {
  expect(level("").numberingType).toBe(4);
  expect(level('style:num-format="1"').numberingType).toBe(4);
  expect(level('style:num-format="" text:display-levels="3"')).toMatchObject({
    numberingType: 5,
    kind: "numbered",
    parentNumbering: 3,
    listFormat: "%1%.%2%.%3%",
  });
  expect(level('style:num-format=""', true).numberingType).toBe(6);
  expect(
    /** Rejects an unsupported XML family. @returns Properties. */ () =>
      level('style:num-format="i"'),
  ).toThrow("Unsupported ODF numbering format");
});

it("exports actual NONE type with empty format and suppresses display levels while preserving start and affixes", /** Checks numeric property precedence over legacy kind input. @returns Nothing. */ () => {
  const exporter = new SvxXMLNumRuleExport(
    /** Encodes the literal fixture attributes. @param value - Attribute. @returns Encoded attribute. */ (
      value,
    ) => value.replaceAll("&", "&amp;"),
  );
  const xml = exporter.exportLevelStyle(2, {
    kind: "bullet",
    numberingType: SvxNumType.SVX_NUM_NUMBER_NONE,
    prefix: "[&",
    suffix: "]",
    startWith: 7,
    parentNumbering: 3,
  });
  expect(xml).toContain(
    '<text:list-level-style-number text:level="3" style:num-prefix="[&amp;" style:num-suffix="]" style:num-format="" text:start-value="7"',
  );
  expect(xml).not.toContain("text:display-levels");
  expect(xml).not.toContain("text:bullet-char");
  expect(
    exporter.exportLevelStyle(2, {
      kind: "numbered",
      numberingType: SvxNumType.SVX_NUM_ARABIC,
      parentNumbering: 3,
    }),
  ).toContain('text:display-levels="3"');
});

it("applies UNO properties to a native copy preserving font glyph visibility registration and inactive geometry", /** Checks removal of raw-field reconstruction and independent native setters. @returns Nothing. */ () => {
  const rule = createWriterNumRule("NativeCopy"),
    source = new SwNumFormat(),
    modify = new SwModify();
  source.GetRegisteredIn =
    /** Supplies the source registration; all target clients are actual owners. @returns Modify owner. */ () =>
      modify;
  const font = new Font();
  font.SetFamilyName("NativeFont");
  source.SetBulletFont(font);
  source.SetBulletChar(0x1f539);
  source.SetShowSymbol(false);
  source.SetAbsLSpace(4294967297);
  source.SetFirstLineOffset(4294967295);
  source.SetCharTextDistance(65535);
  source.SetFirstLineIndent(-400);
  source.SetIndentAt(1200);
  source.SetLabelFollowedBy("nothing");
  source.SetListtabPos(1400);
  rule.Set(2, source);
  const prior = rule.Get(2);
  new SwXNumberingRules(rule).replaceByIndex(2, {
    kind: "bullet",
    numberingType: SvxNumType.SVX_NUM_NUMBER_NONE,
    prefix: "[",
    suffix: "]",
  });
  const applied = rule.Get(2);
  expect(applied).not.toBe(prior);
  expect(applied.GetNumberingType()).toBe(5);
  expect(applied.GetBulletChar()).toBe(0x1f539);
  expect(applied.GetBulletFont()?.GetFamilyName()).toBe("NativeFont");
  expect(applied.IsShowSymbol()).toBe(false);
  expect(applied.GetRegisteredIn()).toBe(modify);
  expect(applied.GetPositionProperties()).toMatchObject({
    absLSpace: 1,
    firstLineOffset: -1,
    charTextDistance: -1,
    firstLineIndent: -400,
    indentAt: 1200,
    labelFollowedBy: "nothing",
    listTabPosition: 1400,
  });
  new SwXNumberingRules(rule).replaceByIndex(2, {
    kind: "numbered",
    numberingType: SvxNumType.SVX_NUM_NUMBER_NONE,
    suffix: "",
    bulletChar: "",
  });
  expect(rule.Get(2).GetBulletChar()).toBe(0);
});

it("rejects negative native NumberingType before committing the copied level", /** Verifies native invalid-property atomicity and numeric property precedence. @returns Nothing. */ () => {
  const rule = createWriterNumRule("Atomic"),
    service = new SwXNumberingRules(rule),
    prior = rule.Get(0);
  expect(
    /** Attempts a rejected native property. @returns Nothing. */ () =>
      service.replaceByIndex(0, {
        kind: "numbered",
        numberingType: -1 as SvxNumType,
        suffix: "lost",
        indentAt: 1000,
      }),
  ).toThrow(NumberingRulePropertyError);
  expect(rule.Get(0)).toBe(prior);
  service.replaceByIndex(0, {
    kind: "numbered",
    numberingType: SvxNumType.SVX_NUM_CHAR_SPECIAL,
    suffix: "",
    bulletChar: "●",
  });
  expect(rule.Get(0).GetNumberingType()).toBe(6);
  expect(rule.Get(0).GetBulletChar()).toBe(9679);
});

it("retains NONE list ownership through fresh ODT export import and Worker graph transfer", /** Checks actual package XML and native labels independent of browser projections. @returns Completion. */ async () => {
  const doc = new SwDoc(),
    first = doc.paragraphs[0],
    second = doc.nodes.MakeTextNode("Arabic"),
    metadata = createDocument({ id: "none", suiteId: "writer", title: "NONE" });
  if (first === undefined) throw new Error("Missing NONE fixture");
  first.SetText("No label");
  const shell = new SwWrtShell(new SwDocShell(doc, metadata));
  for (const [node, none] of [
    [first, true],
    [second, false],
  ] as const) {
    const point = new SwPosition(node, 0);
    try {
      shell.SetCursor(point);
    } finally {
      point.Dispose();
    }
    const rule = doc.GetDocumentListsManager().CreateAutomaticNumRule("numbered");
    rule.Set(
      0,
      createWriterNumFormat("numbered", "", {
        numberingType: none ? "none" : "arabic",
        suffix: "",
      }),
    );
    shell.SetCurNumRule(rule, false, "", true);
  }
  const bytes = writeOdtDocument(doc, metadata),
    content = await new ZipFile(bytes).readTextEntry("content.xml");
  expect(content).toContain('style:num-format=""');
  expect(content).toContain('style:num-format="1"');
  const imported = (await readOdtDocument(bytes, metadata)).document;
  for (const candidate of [imported, decodeWriterDocument(encodeWriterDocument(imported))]) {
    const none = candidate.paragraphs[0],
      arabic = candidate.paragraphs[1];
    expect(none?.IsInList()).toBe(true);
    expect(none?.GetNumRule()?.Get(0).GetNumberingType()).toBe(5);
    expect(none?.GetListLabel()).toBe("");
    expect(arabic?.GetNumRule()?.Get(0).GetNumberingType()).toBe(4);
    expect(arabic?.GetListLabel()).toBe("1");
  }
  shell.Close();
});

it("distinguishes NONE from Arabic when validating canonical rule aliases", /** Preserves the existing duplicate-rule policy while comparing native type. @returns Completion. */ async () => {
  const bytes = writeOdtDocument(new SwDoc(), { title: "Alias" }),
    zip = new ZipFile(bytes),
    styles = await zip.readTextEntry("styles.xml"),
    content = await zip.readTextEntry("content.xml");
  const declarations =
    '<text:list-style style:name="One" style:display-name="Shared"><text:list-level-style-number text:level="1" style:num-format=""/></text:list-style><text:list-style style:name="Two" style:display-name="Shared"><text:list-level-style-number text:level="1" style:num-format="1"/></text:list-style>';
  expect(
    /** Imports conflicting represented numeric types. @returns Imported model. */ () =>
      importWriterXml(
        styles.replace("</office:styles>", declarations + "</office:styles>"),
        content,
        createDocument({ id: "aliases", suiteId: "writer", title: "Aliases" }),
      ),
  ).toThrow("Conflicting ODF list rule");
});
