/** @fileoverview Pinned Calc edit-field regressions through actual ODS and Worker transfer. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  SvxDateField,
  SvxFileField,
  SvxTableField,
  SvxURLField,
} from "../../../../editeng/inc/flditem";
import * as FieldType from "../../../../offapi/com/sun/star/text/textfield/Type";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { GetString } from "../../core/tool/editutil";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";
import { processOdsWorkerRequest } from "../../../browser/filter/xml/ods-worker-runtime";
import type { CalcDocumentRecord } from "../../../browser/filter/xml/calc-document-codec";
import type { EECharAttrib } from "../../../../editeng/inc/editdata";
import type { Section } from "../../../../editeng/inc/section";
import { ATTR_FONT_WEIGHT } from "../../../inc/scitems";
import {
  EE_CHAR_EMPHASISMARK,
  EE_CHAR_ESCAPEMENT,
  EE_CHAR_FONTWIDTH,
  EE_CHAR_FONTHEIGHT,
  EE_CHAR_ITALIC,
  EE_CHAR_KERNING,
  EE_CHAR_LANGUAGE,
  EE_CHAR_LANGUAGE_CJK,
  EE_CHAR_LANGUAGE_CTL,
  EE_CHAR_PAIRKERNING,
  EE_CHAR_WEIGHT,
  EE_CHAR_WLM,
} from "../../../../editeng/inc/eeitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxEmphasisMarkItem } from "../../../../editeng/inc/emphasismarkitem";
import { SvxEscapementItem } from "../../../../editeng/source/items/textitem.escapement";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { SvxPostureItem } from "../../../../editeng/inc/postitem";
import { FontEmphasisMark, FontItalic, FontWeight } from "../../../../tools/inc/fontenum";
import {
  LANGUAGE_GERMAN,
  LANGUAGE_HINDI,
  LANGUAGE_JAPANESE,
} from "../../../../i18nlangtag/inc/lang";

const fixtureRoot = "../../vendor/libreoffice-reference/sc/qa/unit/data/ods";

it("ports the pinned rich-text cell distinction and character ranges", /** Replays the cell types, text ranges and field identities in testRichTextContentODS. @returns Completion. */ async () => {
  const source = await readOdsDocument(
    new Uint8Array(readFileSync(`${fixtureRoot}/rich-text-cells.ods`)),
  );
  let reopened: ScDocument | undefined;
  try {
    reopened = await readOdsDocument(await writeOdsDocument(source));
    for (const document of [source, reopened]) {
      const normal = document.GetRefCellValue(new ScAddress(0, 1, 0));
      const normalString = normal.getSharedString();
      assert(normalString);
      expect(text(normalString.getString())).toBe("Normal");
      const styled = document.GetRefCellValue(new ScAddress(0, 2, 0));
      const styledString = styled.getSharedString();
      assert(styledString);
      expect(text(styledString.getString())).toBe("All bold");
      const weight = document.GetPattern(new ScAddress(0, 2, 0))?.GetItem(ATTR_FONT_WEIGHT);
      assert(weight instanceof SvxWeightItem);
      expect(weight.GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
      const lines = document.GetRefCellValue(new ScAddress(0, 3, 0)).getEditText();
      assert(lines);
      expect(lines.GetParagraphCount()).toBe(3);
      for (const [index, expected] of ["one", "two", "three"].entries()) {
        const line = lines.GetText(index);
        try {
          expect(text(line)).toBe(expected);
        } finally {
          line.dispose();
        }
      }
      for (const [row, field] of [
        [4, FieldType.TABLE],
        [5, FieldType.URL],
        [6, FieldType.DATE],
        [7, FieldType.DOCINFO_TITLE],
      ] as const)
        expect(
          document
            .GetRefCellValue(new ScAddress(0, row, 0))
            .getEditText()
            ?.HasField(field),
        ).toBe(true);
      const sentence = document.GetRefCellValue(new ScAddress(0, 8, 0)).getEditText();
      assert(sentence);
      const value = sentence.GetText(0);
      try {
        const line = text(value);
        expect(line).toBe("Sentence with bold and italic.");
        const attrs: EECharAttrib[] = [];
        sentence.GetCharAttribs(0, attrs);
        const bold = attrs.find(
          /** Locates the typed bold range. @param attribute - EditEngine attribute. @returns Whether matched. */
          ({ pAttr, nStart, nEnd }) =>
            pAttr?.Which() === EE_CHAR_WEIGHT && line.slice(nStart, nEnd) === "bold",
        )?.pAttr;
        const italic = attrs.find(
          /** Locates the typed italic range. @param attribute - EditEngine attribute. @returns Whether matched. */
          ({ pAttr, nStart, nEnd }) =>
            pAttr?.Which() === EE_CHAR_ITALIC && line.slice(nStart, nEnd) === "italic",
        )?.pAttr;
        assert(bold instanceof SvxWeightItem);
        assert(italic instanceof SvxPostureItem);
        expect(bold.GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
        expect(italic.GetPosture()).toBe(FontItalic.ITALIC_NORMAL);
      } finally {
        value.dispose();
      }
    }
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("preserves native word mode, kerning, width, emphasis and script locales on cell spans", /** Checks the original pool values, XML, explicit resets and Worker transfer. @returns Completion. */ async () => {
  const source = new ScDocument();
  let worker: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    const importer = new ScXMLImport(source);
    importer.importStyles(`
      <office:document-styles xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}">
        <office:styles><style:style style:name="NamedText" style:family="text"><style:text-properties style:text-scale="200%"/></style:style></office:styles>
      </office:document-styles>`);
    importer.importContent(`
      <office:document-content xmlns:office="${ODF_NAMESPACES.office}" xmlns:table="${ODF_NAMESPACES.table}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:fo="${ODF_NAMESPACES.fo}">
        <office:automatic-styles>
          <style:style style:name="Effects" style:family="text"><style:text-properties style:text-underline-mode="skip-white-space" fo:letter-spacing="-0.12cm" style:letter-kerning="true" style:text-scale="140%" style:text-emphasize="accent below" fo:language="de" fo:country="DE" style:language-asian="ja" style:country-asian="JP" style:language-complex="hi" style:country-complex="IN"/></style:style>
          <style:style style:name="Clear" style:family="text"><style:text-properties style:text-line-through-mode="continuous" fo:letter-spacing="normal" style:letter-kerning="false" style:text-scale="100%" style:text-emphasize="none"/></style:style>
          <style:style style:name="Super" style:family="text"><style:text-properties style:text-position="32% 64%"/></style:style>
          <style:style style:name="Sub" style:family="text"><style:text-properties style:text-position="-32% 66%"/></style:style>
        </office:automatic-styles>
        <office:body><office:spreadsheet><table:table table:name="Effects"><table:table-row><table:table-cell>
          <text:p><text:span text:style-name="Effects">ab</text:span><text:span text:style-name="Clear">cd</text:span></text:p>
        </table:table-cell><table:table-cell>
          <text:p><text:span text:style-name="Super">Sub</text:span><text:span text:style-name="NamedText"> and </text:span><text:span text:style-name="Sub">Super</text:span></text:p>
        </table:table-cell></table:table-row></table:table></office:spreadsheet></office:body>
      </office:document-content>`);
    worker = decodeCalcDocument(encodeCalcDocument(source));
    const bytes = await writeOdsDocument(worker);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(xml).not.toContain("style:text-underline-mode=");
    expect(xml).not.toContain('style:text-scale="200%"');
    for (const expected of [
      'style:text-line-through-mode="skip-white-space"',
      'style:text-line-through-mode="continuous"',
      'fo:letter-spacing="-0.12cm"',
      'fo:letter-spacing="normal"',
      'style:letter-kerning="true"',
      'style:letter-kerning="false"',
      'style:text-scale="140%"',
      'style:text-scale="100%"',
      'style:text-emphasize="accent below"',
      'style:text-emphasize="none"',
      'fo:language="de"',
      'style:language-asian="ja"',
      'style:language-complex="hi"',
    ])
      expect(xml).toContain(expected);
    reopened = await readOdsDocument(bytes);
    for (const document of [source, worker, reopened]) {
      const edit = document.GetRefCellValue(new ScAddress()).getEditText();
      assert(edit);
      const attrs: EECharAttrib[] = [];
      edit.GetCharAttribs(0, attrs);
      const values = new Map(
        attrs.map(
          /** Projects a native inline emphasis attribute for fixture comparison. @param entry - Native character span. @returns Character span identity and emphasis value. */ ({
            nStart,
            nEnd,
            pAttr,
          }) => [
            `${nStart},${nEnd},${pAttr?.Which()}`,
            pAttr instanceof SvxEmphasisMarkItem ? pAttr.GetEmphasisMark() : pAttr?.QueryValue(),
          ],
        ),
      );
      for (const [which, first, second] of [
        [EE_CHAR_WLM, true, false],
        [EE_CHAR_KERNING, -120, 0],
        [EE_CHAR_PAIRKERNING, true, false],
        [EE_CHAR_FONTWIDTH, 140, 100],
        [
          EE_CHAR_EMPHASISMARK,
          FontEmphasisMark.Accent | FontEmphasisMark.PosBelow,
          FontEmphasisMark.NONE,
        ],
        [EE_CHAR_LANGUAGE, LANGUAGE_GERMAN, undefined],
        [EE_CHAR_LANGUAGE_CJK, LANGUAGE_JAPANESE, undefined],
        [EE_CHAR_LANGUAGE_CTL, LANGUAGE_HINDI, undefined],
      ] as const) {
        expect(values.get(`0,2,${which}`)).toBe(first);
        expect(values.get(`2,4,${which}`)).toBe(second);
      }
      const positioned = document.GetRefCellValue(new ScAddress(1, 0, 0)).getEditText();
      assert(positioned);
      const sections: Section[] = [];
      positioned.GetAllSections(sections);
      expect(
        sections.map(
          /** Projects imported spans and their edit items for fixture comparison. @param entry - Native imported text range. @returns Paragraph, character offsets and item identities. */ ({
            mnParagraph,
            mnStart,
            mnEnd,
            maAttributes,
          }) => [
            mnParagraph,
            mnStart,
            mnEnd,
            maAttributes.map(
              /** Reads the native item ID from an imported character attribute. @param item - Character format item. @returns Native Which ID. */ (
                item,
              ) => item.Which(),
            ),
          ],
        ),
      ).toEqual([
        [0, 0, 3, [EE_CHAR_ESCAPEMENT]],
        [0, 3, 8, []],
        [0, 8, 13, [EE_CHAR_ESCAPEMENT]],
      ]);
      const superscript = sections[0]?.maAttributes[0];
      const subscript = sections[2]?.maAttributes[0];
      assert(superscript instanceof SvxEscapementItem);
      assert(subscript instanceof SvxEscapementItem);
      expect([superscript.GetEsc(), superscript.GetProportionalHeight()]).toEqual([32, 64]);
      expect([subscript.GetEsc(), subscript.GetProportionalHeight()]).toEqual([-32, 66]);
    }
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});

/** Reads the original URL feature from the native cell editor. @param document - Workbook. @param address - Source cell. @returns Borrowed field. */
function urlField(document: ScDocument, address: ScAddress): SvxURLField {
  const field = document.GetRefCellValue(address).getEditText()?.GetFieldData(0, 0, FieldType.URL);
  assert(field instanceof SvxURLField);
  return field;
}

it("ports testHyperlinkTargetFrameODS with the pinned hyperlink_frame package", /** Checks the native target property and exported XML. @returns Completion. */ async () => {
  const source = await readOdsDocument(
    new Uint8Array(readFileSync(`${fixtureRoot}/hyperlink_frame.ods`)),
  );
  const address = new ScAddress(2, 5, 0);
  let reopened: ScDocument | undefined;
  try {
    expect(text(urlField(source, address).GetTargetFrame())).toBe("_blank");
    const bytes = await writeOdsDocument(source);
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    const dom = new DOMParser().parseFromString(content, "application/xml");
    const anchor = dom.getElementsByTagNameNS(ODF_NAMESPACES.text, "a")[0];
    expect(anchor?.getAttributeNS(ODF_NAMESPACES.office, "target-frame-name")).toBe("_blank");
    expect(anchor?.getAttributeNS(ODF_NAMESPACES.xlink, "href")).toBe(
      "http://www.libreoffice.org/",
    );
    reopened = await readOdsDocument(bytes);
    expect(text(urlField(reopened, address).GetTargetFrame())).toBe("_blank");
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("keeps an encoded hash path segment separate from the sheet fragment", /** Replays external_hyperlink.ods through the document URI and ODS paths. @returns Completion. */ async () => {
  const input = new Uint8Array(readFileSync(`${fixtureRoot}/external_hyperlink.ods`));
  const record = await processOdsWorkerRequest({
    id: 1,
    operation: "import",
    input: input.buffer,
    options: { baseUrl: "file:///home/test/documents/external_hyperlink.ods" },
  });
  const source = decodeCalcDocument(record as CalcDocumentRecord);
  let reopened: ScDocument | undefined;
  try {
    const url = text(urlField(source, new ScAddress()).GetURL());
    expect(url).toMatch(/\/%23folder\/test\.ods#Sheet2\.B10$/u);
    reopened = await readOdsDocument(await writeOdsDocument(source));
    expect(text(urlField(reopened, new ScAddress()).GetURL())).toBe(url);
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("preserves styled URL and dynamic EditEngine fields through Worker and ODS", /** Checks independently authored field markup and native field identity. @returns Completion. */ async () => {
  const source = new ScDocument();
  let worker: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    new ScXMLImport(source).importContent(`
      <office:document-content xmlns:office="${ODF_NAMESPACES.office}" xmlns:table="${ODF_NAMESPACES.table}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:fo="${ODF_NAMESPACES.fo}" xmlns:xlink="${ODF_NAMESPACES.xlink}">
        <office:automatic-styles><style:style style:name="Bold" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style></office:automatic-styles>
        <office:body><office:spreadsheet><table:table table:name="Fields"><table:table-row>
          <table:table-cell><text:p><text:bookmark text:name="ignored"/>before<text:span text:style-name="Bold"><text:a xlink:href="https://example.test/" office:target-frame-name="_blank">link</text:a></text:span><text:s/><text:sheet-name>stale</text:sheet-name><text:s/><text:title>stale</text:title><text:s/><text:date text:date-value="2000-01-01">stale</text:date></text:p></table:table-cell>
          <table:table-cell office:value-type="string" office:string-value="override"><text:p><text:a xlink:href="#Fields.A1">ignored</text:a></text:p></table:table-cell>
        </table:table-row></table:table></office:spreadsheet></office:body>
      </office:document-content>`);
    worker = decodeCalcDocument(encodeCalcDocument(source));
    const bytes = await writeOdsDocument(worker);
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(content).toMatch(
      /<text:span text:style-name="T\d+"><text:a [^>]*>link<\/text:a><\/text:span>/u,
    );
    expect(content).toContain("<text:sheet-name>Fields</text:sheet-name>");
    expect(content).toMatch(
      /<text:date style:data-style-name="N2" text:date-value="\d{4}-\d{2}-\d{2}">/u,
    );
    reopened = await readOdsDocument(bytes);
    for (const document of [source, worker, reopened]) {
      const address = new ScAddress();
      const edit = document.GetRefCellValue(address).getEditText();
      expect(text(urlField(document, address).GetRepresentation())).toBe("link");
      expect(edit?.GetFieldData(0, 0, FieldType.TABLE)).toBeInstanceOf(SvxTableField);
      expect(edit?.GetFieldData(0, 0, FieldType.DOCINFO_TITLE)).toBeInstanceOf(SvxFileField);
      expect(edit?.GetFieldData(0, 0, FieldType.DATE)).toBeInstanceOf(SvxDateField);
      expect(document.GetRefCellValue(new ScAddress(1, 0, 0)).getEditText()).toBeFalsy();
    }
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});

it("writes multiline formula results as separate cached text paragraphs", /** Checks source paragraph terminators and the string-value attribute on reopen. @returns Completion. */ async () => {
  const source = new ScDocument();
  let reopened: ScDocument | undefined;
  try {
    new ScXMLImport(source).importContent(`
      <office:document-content xmlns:office="${ODF_NAMESPACES.office}" xmlns:table="${ODF_NAMESPACES.table}" xmlns:of="${ODF_NAMESPACES.of}">
        <office:body><office:spreadsheet><table:table table:name="Lines"><table:table-row>
          <table:table-cell office:value-type="string" office:string-value="a&#10;&#10;b"/>
          <table:table-cell table:formula="of:=[.A1]"/>
        </table:table-row></table:table></office:spreadsheet></office:body>
      </office:document-content>`);
    const bytes = await writeOdsDocument(source);
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    const dom = new DOMParser().parseFromString(content, "application/xml");
    const cell = dom.getElementsByTagNameNS(ODF_NAMESPACES.table, "table-cell")[1];
    const paragraphs = [...(cell?.getElementsByTagNameNS(ODF_NAMESPACES.text, "p") ?? [])];
    expect(
      paragraphs.map(
        /** Reads a cached formula paragraph. @param paragraph - Exported element. @returns Text. */
        (paragraph) => paragraph.textContent,
      ),
    ).toEqual(["a", "", "b"]);
    expect(cell?.getAttributeNS(ODF_NAMESPACES.office, "string-value")).toBe("a\n\nb");
    reopened = await readOdsDocument(bytes);
    const formula = reopened.GetRefCellValue(new ScAddress(1, 0, 0)).getFormula();
    assert(formula);
    expect(text(formula.GetString().getString())).toBe("a\n\nb");
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("ports the ruby base import from the pinned tdf129940.ods", /** Verifies three original cell strings and independent base span sizes across Calc Worker and ODS. @returns Completion. */ async () => {
  const input = new Uint8Array(readFileSync(`${fixtureRoot}/tdf129940.ods`));
  const record = await processOdsWorkerRequest({
    id: 1,
    operation: "import",
    input: input.buffer,
    options: {},
  });
  const source = decodeCalcDocument(record as CalcDocumentRecord);
  let reopened: ScDocument | undefined;
  try {
    const output = await writeOdsDocument(source);
    reopened = await readOdsDocument(output);
    for (const document of [source, reopened]) {
      for (const [column, expected] of ["小笠原", "徳彦", "注音符號"].entries()) {
        const cell = document.GetRefCellValue(new ScAddress(column, 0, 0));
        const edit = cell.getEditText();
        if (edit) {
          const value = GetString(edit, document);
          try {
            expect(text(value)).toBe(expected);
          } finally {
            value.dispose();
          }
        } else {
          const value = cell.getSharedString();
          assert(value);
          expect(text(value.getString())).toBe(expected);
        }
      }
      const rich = document.GetRefCellValue(new ScAddress(2, 0, 0)).getEditText();
      assert(rich);
      const sections: Section[] = [];
      rich.GetAllSections(sections);
      const sizes: number[][] = [];
      for (const section of sections) {
        const size = section.maAttributes.find(
          /** Finds the Latin font height stored by the original base span. @param item - Native character item. @returns Whether this is the font height. */ (
            item,
          ) => item.Which() === EE_CHAR_FONTHEIGHT,
        );
        if (size instanceof SvxFontHeightItem)
          sizes.push([section.mnStart, section.mnEnd, size.GetHeight()]);
      }
      expect(sizes).toEqual([
        [1, 2, 706],
        [2, 3, 318],
      ]);
    }
    const xml = await (await DocumentArchive.open(output)).readTextEntry("content.xml");
    expect(xml).not.toContain("<text:ruby");
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});
