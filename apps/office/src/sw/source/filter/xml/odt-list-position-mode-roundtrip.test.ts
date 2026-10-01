/** @fileoverview Verifies pinned independent numbering position modes through real ODT, Writer copy and browser snapshots. */
import { expect, it } from "vitest";
import { SvxNumberFormat } from "../../../../editeng/source/items/numitem";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../core/doc/doc";
import { createWriterNumRule } from "../../core/doc/DocumentListsManager";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { projectSwTextPrintBounds } from "../../core/layout/newfrm";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { WriterViewProjection } from "../../../browser/presentation/writer-view-projection";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const metadata = createDocument({
  id: "position-mode",
  suiteId: "writer",
  title: "Position modes",
});
const legacy =
  'text:space-before="0.3in" text:min-label-width="0.2in" text:min-label-distance="0.1in"';
const modern =
  '<style:list-level-label-alignment text:label-followed-by="space" fo:text-indent="-0.25in" fo:margin-left="0.8in" text:list-tab-stop-position="0.9in"/>';

/** Inserts literal ten-level definitions in a real common or automatic package. @param base - Package. @param properties - Literal properties element or empty string. @param common - Common styles selection. @returns Package bytes. */
async function input(base: Uint8Array, properties: string, common: boolean): Promise<Uint8Array> {
  const levels = Array.from(
    { length: 10 },
    /** Declares each level to avoid assumptions about omitted-level rule construction. @param _unused - Placeholder. @param level - Level. @returns Definition. */
    (_unused, level) =>
      `<text:list-level-style-number text:level="${level + 1}" style:num-format="1" style:num-suffix=".">${properties}</text:list-level-style-number>`,
  ).join("");
  const definition = `<text:list-style style:name="Position">${levels}</text:list-style>`;
  const zip = new ZipFile(base),
    output = new ZipOutputStream();
  for (const entry of zip.getEntryNames()) {
    if (entry === "styles.xml" && common) {
      const xml = (await zip.readTextEntry(entry)).replace(
        "</office:styles>",
        `${definition}</office:styles>`,
      );
      output.putNextEntry(entry, new TextEncoder().encode(xml));
    } else if (entry === "content.xml") {
      let xml = await zip.readTextEntry(entry);
      if (!common)
        xml = xml.replace("</office:automatic-styles>", `${definition}</office:automatic-styles>`);
      xml = xml.replace(
        /<office:text>[\s\S]*?<\/office:text>/u,
        '<office:text><text:list text:style-name="Position"><text:list-item><text:p text:style-name="Standard">x</text:p></text:list-item></text:list></office:text>',
      );
      output.putNextEntry(entry, new TextEncoder().encode(xml));
    } else output.putNextEntry(entry, await zip.readEntry(entry));
  }
  return output.finish();
}

it("selects native mode independently of child geometry through common and automatic ODT cycles", /** Verifies source-derived manual state, exact selected XML, copy/snapshot and effective projections. @returns Completion. */ async () => {
  const base = writeOdtDocument(createWriterDocument(), metadata);
  const cases = [
    ...[
      undefined,
      "",
      "unknown",
      "label-width-and-position",
      "Label-alignment",
      " label-alignment ",
      "label-alignment",
    ].map(
      /** Builds literal identity cases; only exact alignment selects modern mode. @param mode - Attribute spelling. @returns Case. */
      (mode) => ({
        properties: `<style:list-level-properties ${legacy}${mode === undefined ? "" : ` text:list-level-position-and-space-mode="${mode}"`}>${modern}</style:list-level-properties>`,
        alignment: mode === "label-alignment",
        core: [720, -288, 144, -360, 1152, "space", 1296] as const,
        legacyXml:
          '<style:list-level-properties text:space-before="0.762cm" text:min-label-width="0.508cm" text:min-label-distance="0.254cm"></style:list-level-properties>',
      }),
    ),
    {
      properties: "",
      alignment: false,
      core: [0, 0, 0, 0, 0, "listtab", 0] as const,
      legacyXml: "<style:list-level-properties></style:list-level-properties>",
    },
    {
      properties:
        '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment"/>',
      alignment: true,
      core: [0, 0, 0, 0, 0, "listtab", 0] as const,
      legacyXml: "",
    },
    {
      properties:
        '<style:list-level-properties text:space-before=".007mm" text:min-label-width=".007mm" text:min-label-distance=".007mm"/>',
      alignment: false,
      core: [1, -1, 1, 0, 0, "listtab", 0] as const,
      legacyXml:
        '<style:list-level-properties text:min-label-width="0.002cm" text:min-label-distance="0.002cm"></style:list-level-properties>',
    },
    {
      properties:
        '<style:list-level-properties text:space-before="-1mm" text:min-label-width=".5mm" text:min-label-distance="1mm"/>',
      alignment: false,
      core: [-28, -28, 57, 0, 0, "listtab", 0] as const,
      legacyXml:
        '<style:list-level-properties text:space-before="-0.098cm" text:min-label-width="0.049cm" text:min-label-distance="0.101cm"></style:list-level-properties>',
    },
    {
      properties:
        '<style:list-level-properties text:space-before="invalid" text:min-label-width="+1cm" text:min-label-distance="-1cm"/>',
      alignment: false,
      core: [0, 0, 0, 0, 0, "listtab", 0] as const,
      legacyXml: "<style:list-level-properties></style:list-level-properties>",
    },
    {
      properties:
        '<style:list-level-properties text:space-before="-999999cm" text:min-label-width="999999cm"/>',
      alignment: false,
      core: [-1, -18577, 0, 0, 0, "listtab", 0] as const,
      legacyXml:
        '<style:list-level-properties text:space-before="-32.77cm" text:min-label-width="32.768cm"></style:list-level-properties>',
    },
  ];
  for (const common of [false, true])
    for (const testCase of cases) {
      const document = (
        await readOdtDocument(await input(base, testCase.properties, common), metadata)
      ).document;
      const paragraph = document.paragraphs[0];
      if (paragraph === undefined) throw new Error("Position fixture has no paragraph");
      expect(paragraph.GetText()).toBe("x");
      const format = paragraph.GetNumRule()?.Get(0);
      if (format === undefined) throw new Error("Position fixture has no numbering format");
      expect(format).toBeInstanceOf(SvxNumberFormat);
      const [
        absLSpace,
        firstLineOffset,
        charTextDistance,
        firstLineIndent,
        indentAt,
        labelFollowedBy,
        listTabPosition,
      ] = testCase.core;
      const mode = testCase.alignment ? "label-alignment" : "label-width-and-position";
      const raw = {
        absLSpace,
        firstLineOffset,
        charTextDistance,
        firstLineIndent,
        indentAt,
        labelFollowedBy,
        listTabPosition,
        positionAndSpaceMode: mode,
      };
      expect(format.GetPositionProperties(), testCase.properties).toEqual(raw);
      expect(format.clone().GetPositionProperties()).toEqual(raw);
      const switched = format.clone();
      switched.SetPositionAndSpaceMode(
        testCase.alignment ? "label-width-and-position" : "label-alignment",
      );
      expect(format.GetPositionAndSpaceMode()).toBe(mode);
      expect(switched.GetAbsLSpace()).toBe(
        testCase.alignment ? absLSpace : firstLineIndent + indentAt,
      );
      const snapshot = encodeWriterDocument(document);
      const copied = decodeWriterDocument(snapshot);
      expect(copied.paragraphs[0]?.GetNumRule()?.Get(0).GetPositionProperties()).toEqual(raw);
      expect(encodeWriterDocument(copied)).toEqual(snapshot);
      const left = testCase.alignment ? indentAt + firstLineIndent : absLSpace + firstLineOffset;
      expect(projectSwTextPrintBounds(paragraph, document.GetPageDesc().GetValue()).left).toBe(
        left,
      );
      const projection = new WriterViewProjection().Project(
        document,
        paragraph,
        new SwPaM(new SwPosition(paragraph, 0)),
        metadata,
      );
      expect(projection.paragraphs[0]?.listLayout).toEqual({
        firstLineIndentPt: (testCase.alignment ? firstLineIndent : firstLineOffset) / 20,
        indentAtPt: (testCase.alignment ? indentAt : absLSpace) / 20,
        labelFollowedBy: testCase.alignment ? labelFollowedBy : "listtab",
        listTabPositionPt:
          (testCase.alignment ? listTabPosition : absLSpace + charTextDistance) / 20,
      });
      const exported = writeOdtDocument(document, metadata);
      const xml = await new ZipFile(exported).readTextEntry("content.xml");
      const actual = xml.match(
        /<text:list-level-style-number text:level="1"[^>]*>([\s\S]*?)<\/text:list-level-style-number>/u,
      )?.[1];
      const modernXml =
        firstLineIndent === 0
          ? '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment"><style:list-level-label-alignment text:label-followed-by="listtab"/></style:list-level-properties>'
          : '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment"><style:list-level-label-alignment text:label-followed-by="space" fo:text-indent="-0.635cm" fo:margin-left="2.032cm"/></style:list-level-properties>';
      expect(actual, testCase.properties).toBe(testCase.alignment ? modernXml : testCase.legacyXml);
      const reopened = (await readOdtDocument(exported, metadata)).document.paragraphs[0]
        ?.GetNumRule()
        ?.Get(0);
      expect(reopened?.GetPositionProperties()).toEqual(
        testCase.alignment
          ? { ...raw, absLSpace: 0, firstLineOffset: 0, charTextDistance: 0, listTabPosition: 0 }
          : {
              ...raw,
              firstLineIndent: 0,
              indentAt: 0,
              labelFollowedBy: "listtab",
              listTabPosition: 0,
            },
      );
    }
});

it("retains pre-existing browser snapshots with absent inactive legacy fields", /** Verifies v15 decoding compatibility without changing native command defaults. @returns Nothing. */ () => {
  const document = createWriterDocument();
  document.AddNumRule(createWriterNumRule("Default", "numbered"));
  document.paragraphs[0]?.SetNumRule("Default");
  const current = encodeWriterDocument(document);
  const older = {
    ...current,
    numRules: current.numRules.map(
      /** Removes fields absent in earlier browser records. @param rule - Rule record. @returns Compatible record. */
      (rule) => ({
        ...rule,
        formats: rule.formats.map(
          /** Copies the earlier format schema. @param format - Format record. @returns Earlier fields. */
          (format) => {
            const rest = { ...format };
            delete rest.absLSpace;
            delete rest.firstLineOffset;
            delete rest.charTextDistance;
            return rest;
          },
        ),
      }),
    ),
  };
  const restored = decodeWriterDocument(older).paragraphs[0]?.GetNumRule()?.Get(0);
  expect(restored?.GetPositionProperties()).toEqual({
    absLSpace: 0,
    firstLineOffset: 0,
    charTextDistance: 0,
    firstLineIndent: -360,
    indentAt: 720,
    labelFollowedBy: "listtab",
    listTabPosition: 720,
    positionAndSpaceMode: "label-alignment",
  });
});

it("retains source-owned fields across repeated position properties and failed measures", /** Verifies successful-only updates and mode retention in real packages. @returns Completion. */ async () => {
  const base = writeOdtDocument(createWriterDocument(), metadata);
  const properties = `<style:list-level-properties ${legacy} text:list-level-position-and-space-mode="label-alignment">${modern}</style:list-level-properties><style:list-level-properties text:space-before="invalid" text:min-label-distance=".007mm"><style:list-level-label-alignment fo:text-indent="invalid" fo:margin-left=".007mm"/></style:list-level-properties>`;
  for (const common of [false, true]) {
    const document = (await readOdtDocument(await input(base, properties, common), metadata))
      .document;
    expect(document.paragraphs[0]?.GetNumRule()?.Get(0).GetPositionProperties()).toEqual({
      absLSpace: 720,
      firstLineOffset: -288,
      charTextDistance: 1,
      positionAndSpaceMode: "label-alignment",
      firstLineIndent: -360,
      indentAt: 1,
      labelFollowedBy: "listtab",
      listTabPosition: 1296,
    });
    const exported = writeOdtDocument(document, metadata);
    const xml = await new ZipFile(exported).readTextEntry("content.xml");
    expect(xml).toContain(
      '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment"><style:list-level-label-alignment text:label-followed-by="listtab" text:list-tab-stop-position="2.286cm" fo:text-indent="-0.635cm" fo:margin-left="0.002cm"/></style:list-level-properties>',
    );
    const reopened = (await readOdtDocument(exported, metadata)).document;
    expect(reopened.paragraphs[0]?.GetNumRule()?.Get(0).GetPositionProperties()).toEqual({
      absLSpace: 0,
      firstLineOffset: 0,
      charTextDistance: 0,
      positionAndSpaceMode: "label-alignment",
      firstLineIndent: -360,
      indentAt: 1,
      labelFollowedBy: "listtab",
      listTabPosition: 1296,
    });
  }
});
