/** @fileoverview Exercises real Writer box items and LibreOffice's ODT table value regressions. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  RES_BOXATR_FORMAT,
  RES_BOXATR_FORMULA,
  RES_BOXATR_VALUE,
  RES_PROTECT,
} from "../../../inc/hintids";
import type { SwDoc } from "../../core/doc/doc";
import { SwTableBoxFormula, SwTableBoxNumFormat, SwTableBoxValue } from "../../core/attr/cellatr";
import { SvxProtectItem } from "../../../../editeng/source/items/frmitems";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { importWriterXml } from "./xmlimp";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";

const metadata = { title: "Writer values" };

/** Opens the original LibreOffice regression document. @param suite - Test suite. @param name - Fixture file name. @returns Native document. */
async function open(suite: string, name: string): Promise<SwDoc> {
  const bytes = readFileSync(
    `../../vendor/libreoffice-reference/sw/qa/extras/${suite}/data/${name}`,
  );
  return (await readOdtDocument(new Uint8Array(bytes), metadata)).document;
}

it("uses the original fdo60842 string attribute instead of the child text", /** Replays Writer's original first-row assertions. @returns Completion. */ async () => {
  const doc = await open("odfimport", "fdo60842.odt");
  try {
    const row = doc.GetTables()[0]?.GetTabLines()[0];
    expect(
      row
        ?.GetTabBoxes()
        .slice(0, 5)
        .map(
          /** Reads the canonical cell text. @param box - Original box. @returns Value text. */ (
            box,
          ) => box.GetParagraphs()[0]?.GetText(),
        ),
    ).toEqual(["", "18/02/2012", "USD", "", "01/04/2012"]);
  } finally {
    doc.Dispose();
  }
});

it("preserves tdf139126 formula text, numeric display and error sentinel through ODT and Worker", /** Replays the original Writer regression without evaluating a different formula language. @returns Completion. */ async () => {
  const original = await open("odfexport", "tdf139126.odt");
  const worker = decodeWriterDocument(encodeWriterDocument(original));
  let reopened: SwDoc | undefined;
  try {
    const output = await writeOdtDocument(worker, metadata);
    const xml = await (await DocumentArchive.open(output)).readTextEntry("content.xml");
    expect(xml).toContain(
      'table:formula="ooow:&lt;B2&gt;*&lt;C2&gt;" office:value-type="float" office:value="4"',
    );
    expect(xml).toContain('table:formula="ooow:&lt;?&gt;+&lt;D2&gt;"');
    reopened = (await readOdtDocument(output, metadata)).document;
    for (const doc of [original, worker, reopened]) {
      const row = doc.GetTables()[0]?.GetTabLines()[1];
      const numeric = row?.GetTabBoxes()[3];
      const error = row?.GetTabBoxes()[4];
      expect(numeric?.GetParagraphs()[0]?.GetText()).toBe("4.0");
      expect(error?.GetParagraphs()[0]?.GetText()).toBe("** Expression is faulty **");
      const formula = numeric
        ?.GetFrameFormat()
        .GetAttrSet()
        .GetItemIfSet(RES_BOXATR_FORMULA, false);
      expect(formula).toBeInstanceOf(SwTableBoxFormula);
      expect((formula as SwTableBoxFormula).GetFormula()).toBe("<B2>*<C2>");
      expect((formula as SwTableBoxFormula).GetDefinedIn() === numeric?.GetFrameFormat()).toBe(
        true,
      );
      expect(
        numeric?.GetFrameFormat().GetAttrSet().GetItemIfSet(RES_BOXATR_FORMAT, false),
      ).toBeInstanceOf(SwTableBoxNumFormat);
      expect(
        (
          numeric
            ?.GetFrameFormat()
            .GetAttrSet()
            .GetItemIfSet(RES_BOXATR_VALUE, false) as SwTableBoxValue
        ).GetValue(),
      ).toBe(4);
      const errorValue = error?.GetFrameFormat().GetAttrSet().GetItemIfSet(RES_BOXATR_VALUE, false);
      expect((errorValue as SwTableBoxValue).GetValue()).toBe(Number.MAX_VALUE);
    }
  } finally {
    reopened?.Dispose();
    worker.Dispose();
    original.Dispose();
  }
});

it("uses native typed values and content protection on repeated cells", /** Checks value selection in XML order and native box transport. @returns Completion. */ async () => {
  const { office, table, text, number, style, ooow } = ODF_NAMESPACES;
  const content = `<office:document-content xmlns:office="${office}" xmlns:table="${table}" xmlns:text="${text}" xmlns:number="${number}" xmlns:style="${style}" xmlns:w="${ooow}">
    <office:automatic-styles>
      <number:boolean-style style:name="Bool"><number:boolean/></number:boolean-style>
      <style:style style:family="table-cell" style:name="B" style:data-style-name="Bool"/>
    </office:automatic-styles>
    <office:body><office:text><table:table table:name="Values">
      <table:table-column table:number-columns-repeated="3"/>
      <table:table-row>
        <table:table-cell table:style-name="B" table:formula="w:1" table:protect="true" office:value-type="float" office:value="22" office:boolean-value="true" table:number-columns-repeated="2"><text:p>1</text:p></table:table-cell>
        <table:table-cell office:value-type="string" office:string-value=""> <text:p>ignored</text:p></table:table-cell>
      </table:table-row>
    </table:table></office:text></office:body>
  </office:document-content>`;
  const original = importWriterXml(undefined, content, metadata).document;
  const worker = decodeWriterDocument(encodeWriterDocument(original));
  let reopened: SwDoc | undefined;
  try {
    const output = await writeOdtDocument(worker, metadata);
    const xml = await (await DocumentArchive.open(output)).readTextEntry("content.xml");
    expect(
      xml.match(
        /table:formula="ooow:1" office:value-type="boolean" office:boolean-value="true" table:protected="true"/gu,
      ),
    ).toHaveLength(2);
    reopened = (await readOdtDocument(output, metadata)).document;
    for (const doc of [original, worker, reopened]) {
      const boxes = doc.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes();
      expect(boxes?.[2]?.GetParagraphs()[0]?.GetText()).toBe("");
      for (const box of boxes?.slice(0, 2) ?? []) {
        const frame = box.GetFrameFormat();
        expect(
          (
            frame.GetAttrSet().GetItemIfSet(RES_PROTECT, false) as SvxProtectItem
          ).IsContentProtected(),
        ).toBe(true);
        expect(
          (frame.GetAttrSet().GetItemIfSet(RES_BOXATR_VALUE, false) as SwTableBoxValue).GetValue(),
        ).toBe(1);
        expect(
          (
            frame.GetAttrSet().GetItemIfSet(RES_BOXATR_FORMULA, false) as SwTableBoxFormula
          ).GetFormula(),
        ).toBe("1");
      }
    }
  } finally {
    reopened?.Dispose();
    worker.Dispose();
    original.Dispose();
  }
});
