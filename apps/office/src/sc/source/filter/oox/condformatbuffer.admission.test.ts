/** @fileoverview Original worksheet conditional rule admission and optional SpreadsheetML fields. */
import { assert, expect, it } from "vitest";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { ScAddress } from "../../../inc/address";
import { ScConditionMode, ScCondFormatEntry, ScFormatEntryType } from "../../../inc/conditio";
import { ScColorScaleEntryType, ScColorScaleFormat } from "../../../inc/colorscale";
import { ScDocument } from "../../../inc/document";
import { readOdsDocument, writeOdsDocument } from "../xml/xmlwrap";
import { exportXlsx } from "../excel/xetable";
import { x14Namespace, xmNamespace } from "./extlstcontext";
import { ExcelFilter } from "./excelfilter";

/** Applies worksheet conditional XML to a regular generated workbook. @param rules - Worksheet conditional XML. @returns Reopened workbook. */
async function importWithRules(rules: string): Promise<ScDocument> {
  const document = new ScDocument();
  const name = unicode("Rules");
  try {
    assert(document.InsertTab(0, name));
    document.SetValue(new ScAddress(), 4);
    const pkg = await DocumentArchive.open(await exportXlsx(document));
    const writer = new DocumentArchiveWriter();
    const sheet = "xl/worksheets/sheet1.xml";
    for (const entry of pkg.getEntryNames()) {
      if (entry !== sheet) writer.putNextEntry(entry, await pkg.readEntry(entry));
      else {
        const xml = await pkg.readTextEntry(entry);
        writer.putNextEntry(
          entry,
          new TextEncoder().encode(xml.replace("</worksheet>", rules + "</worksheet>")),
        );
      }
    }
    return ExcelFilter.importDocument(await writer.finish());
  } finally {
    name.dispose();
    document.Dispose();
  }
}

it("keeps optional scale stops, gte flags and formula text at their original boundaries", /** Tests incomplete pair records and ignored foreign subtree content. @returns Completion. */ async () => {
  const document = await importWithRules(`
    <conditionalFormatting sqref="A2" xmlns:f="urn:other">
      <f:cfRule type="colorScale" priority="1"/>
      <cfRule type="colorScale" priority="2">
        <f:formula>100</f:formula>
        <colorScale>
          <cfvo type="min" gte="false"/>
          <f:cfvo type="num" val="50"/>
          <color rgb="FF000000"/><color rgb="FF112233"/>
        </colorScale>
      </cfRule>
    </conditionalFormatting>
    <conditionalFormatting sqref="B2">
      <cfRule type="colorScale" priority="3">
        <colorScale>
          <unknown/>
          <cfvo type="num" val="1" gte="true"/><cfvo type="max"/>
          <color rgb="FFFFFFFF"/>
        </colorScale>
      </cfRule>
    </conditionalFormatting>
    <conditionalFormatting sqref="A1">
      <cfRule type="cellIs" operator="equal" priority="4"> <formula>2<![CDATA[+2]]></formula> </cfRule>
    </conditionalFormatting>`);
  try {
    const formats = [...(document.FetchTable(0)?.GetCondFormList() ?? [])];
    const [first, second, expression] = formats;
    const scale1 = first?.GetEntry(0);
    const scale2 = second?.GetEntry(0);
    assert(scale1 instanceof ScColorScaleFormat);
    assert(scale2 instanceof ScColorScaleFormat);
    expect([...scale1]).toHaveLength(2);
    expect([...scale2]).toHaveLength(2);
    expect(scale1.GetEntry(0)?.GetMode()).toBe(ScConditionMode.Greater);
    expect(scale1.GetEntry(1)?.GetType()).toBe(ScColorScaleEntryType.VALUE);
    expect(scale1.GetEntry(1)?.GetValue()).toBe(0);
    expect(scale1.GetEntry(1)?.GetColor().toUInt32()).toBe(0x112233);
    expect(scale2.GetEntry(0)?.GetMode()).toBe(ScConditionMode.EqGreater);
    expect(scale2.GetEntry(1)?.GetType()).toBe(ScColorScaleEntryType.MAX);
    expect(expression?.GetEntry(0)).toBeInstanceOf(ScCondFormatEntry);
    expect(document.GetCondResult(new ScAddress())).toBeDefined();
    expect(document.GetCondColor(new ScAddress())).toBeUndefined();
  } finally {
    document.Dispose();
  }
});

it("appends unprioritized extension rules and merges repeated extension-only ranges", /** Checks original priority defaults and same-range attachment. @returns Completion. */ async () => {
  const document = await importWithRules(`
    <conditionalFormatting sqref="C1">
      <cfRule type="cellIs" operator="equal" priority="1"><formula>0</formula></cfRule>
    </conditionalFormatting>
    <conditionalFormatting sqref="C1">
      <cfRule type="cellIs" operator="equal" priority="2"><formula>1</formula></cfRule>
    </conditionalFormatting>
    <extLst>
      <ext xmlns:x14="${x14Namespace}" xmlns:xm="${xmNamespace}">
        <x14:conditionalFormattings>
          <x14:conditionalFormatting>
            <x14:cfRule type="expression"><xm:f>2</xm:f></x14:cfRule>
            <x14:cfRule type="expression" priority="0"><xm:f>3</xm:f></x14:cfRule>
            <xm:sqref>C1</xm:sqref>
          </x14:conditionalFormatting>
          <x14:conditionalFormatting>
            <x14:cfRule type="expression" priority="5"><xm:f>4</xm:f></x14:cfRule>
            <xm:sqref>B1</xm:sqref>
          </x14:conditionalFormatting>
          <x14:conditionalFormatting>
            <x14:cfRule type="expression" priority="6"><xm:f>5</xm:f></x14:cfRule>
            <xm:sqref>B1</xm:sqref>
          </x14:conditionalFormatting>
        </x14:conditionalFormattings>
      </ext>
    </extLst>`);
  try {
    const formats = [...(document.FetchTable(0)?.GetCondFormList() ?? [])];
    expect(formats).toHaveLength(3);
    const [first, second, extension] = formats;
    expect(first?.size()).toBe(2);
    expect(first?.GetEntry(0)?.GetType()).toBe(ScFormatEntryType.Condition);
    expect(first?.GetEntry(1)?.GetType()).toBe(ScFormatEntryType.ExtCondition);
    expect(second?.size()).toBe(1);
    expect(extension?.size()).toBe(2);
    expect(extension?.GetRange().GetTopLeftCorner().equals(new ScAddress(1, 0))).toBe(true);
    expect(document.GetCondResult(new ScAddress(1, 0))).toBeDefined();
  } finally {
    document.Dispose();
  }
});

/** Evaluates the same native formula-error condition in the file graphs. @param document - Source or reopened workbook. @returns Nothing. */
function checkErrors(document: ScDocument): void {
  for (const [col, cases] of [
    [0, [true, false, false, false]],
    [1, [false, true, true, true]],
  ] as const) {
    for (const [row, expected] of cases.entries())
      expect(Boolean(document.GetCondResult(new ScAddress(col, row))), `cell ${col},${row}`).toBe(
        expected,
      );
  }
}

it("evaluates formula-error rules without importing compatibility formulas as operands", /** Covers both native modes, actual formula errors, blank and text results with both file formats. @returns Completion. */ async () => {
  const document = await importWithRules(`
    <conditionalFormatting sqref="A1:A4">
      <cfRule type="containsErrors" priority="1"><formula>0</formula></cfRule>
    </conditionalFormatting>
    <conditionalFormatting sqref="B1:B4">
      <cfRule type="notContainsErrors" priority="2" />
    </conditionalFormatting>`);
  const error = unicode("=1/0");
  const label = unicode("ordinary text");
  try {
    for (const col of [0, 1]) {
      document.SetString(new ScAddress(col, 0), error);
      document.SetValue(new ScAddress(col, 1), 1);
      document.SetTextCell(new ScAddress(col, 2), label);
    }
    checkErrors(document);
    const odsBytes = await writeOdsDocument(document);
    const odsXml = await (await DocumentArchive.open(odsBytes)).readTextEntry("content.xml");
    expect(odsXml).toContain('calcext:value="is-error"');
    expect(odsXml).toContain('calcext:value="is-no-error"');
    const excelBytes = await exportXlsx(document);
    const excelXml = await (
      await DocumentArchive.open(excelBytes)
    ).readTextEntry("xl/worksheets/sheet1.xml");
    expect(excelXml).toContain('type="containsErrors"');
    expect(excelXml).toContain("<formula>ISERROR(A1)</formula>");
    expect(excelXml).toContain('type="notContainsErrors"');
    expect(excelXml).toContain("<formula>NOT(ISERROR(B1))</formula>");
    const ods = await readOdsDocument(odsBytes);
    try {
      checkErrors(ods);
    } finally {
      ods.Dispose();
    }
    const xlsx = await ExcelFilter.importDocument(excelBytes);
    try {
      checkErrors(xlsx);
    } finally {
      xlsx.Dispose();
    }
  } finally {
    label.dispose();
    error.dispose();
    document.Dispose();
  }
});
