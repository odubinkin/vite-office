/** @fileoverview Ports the original Calc tests for extended worksheet conditions. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { exportXlsx } from "../excel/xetable";
import { readOdsDocument, writeOdsDocument } from "../xml/xmlwrap";
import { x14Namespace, xmNamespace } from "./extlstcontext";
import { ScAddress } from "../../../inc/address";
import { ScCondFormatEntry, ScConditionMode, ScFormatEntryType } from "../../../inc/conditio";
import type { ScConditionalFormat } from "../../../inc/conditio";
import type { ScDocument } from "../../../inc/document";
import { ExcelFilter } from "./excelfilter";

/** Opens the original Calc test input. @param name - Pinned test workbook. @returns Native workbook. */
async function open(name: string): Promise<ScDocument> {
  const bytes = readFileSync(
    `../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/${name}.xlsx`,
  );
  return ExcelFilter.importDocument(new Uint8Array(bytes));
}

/** Finds the associated native conditional-format range. @param document - Workbook. @param address - Checked cell. @returns Its original format. */
function formatAt(document: ScDocument, address: ScAddress): ScConditionalFormat | undefined {
  for (const format of document.FetchTable(address.Tab())?.GetCondFormList() ?? [])
    if (format.GetRange().Find(address)) return format;
  return undefined;
}

it.each(["tdf120749", "tdf122102"])(
  "%s evaluates four extended rules with local and cross-sheet operands",
  /** Ports the four style assertions. @param name - Original test workbook. @returns Completion. */ async (
    name,
  ) => {
    const document = await open(name);
    try {
      for (let row = 0; row < 4; ++row) {
        const address = new ScAddress(0, row, 0);
        expect(formatAt(document, address)?.GetEntry(0)?.GetType()).toBe(
          ScFormatEntryType.ExtCondition,
        );
        expect(document.GetCondResult(address)).toBeDefined();
      }
    } finally {
      document.Dispose();
    }
  },
);

it("keeps the three extended operators in priority order over the same range", /** Ports tdf139928. @returns Completion. */ async () => {
  const document = await open("tdf139928");
  try {
    const format = formatAt(document, new ScAddress());
    expect(format?.size()).toBe(3);
    for (const [index, mode] of [
      ScConditionMode.ContainsText,
      ScConditionMode.BeginsWith,
      ScConditionMode.EndsWith,
    ].entries()) {
      const entry = format?.GetEntry(index) as ScCondFormatEntry;
      expect(entry.GetType()).toBe(ScFormatEntryType.ExtCondition);
      expect(entry.GetOperation()).toBe(mode);
    }
  } finally {
    document.Dispose();
  }
});

it("merges standard and extended rules by original priority", /** Ports the mixed-priority fixture. @returns Completion. */ async () => {
  const document = await open("conditional_fmt_checkpriority");
  try {
    const first = formatAt(document, new ScAddress());
    const second = formatAt(document, new ScAddress(0, 2, 0));
    expect(first?.size()).toBe(2);
    expect(second?.size()).toBe(2);
    expect(first?.GetEntry(0)?.GetType()).toBe(ScFormatEntryType.ExtCondition);
    expect(first?.GetEntry(1)?.GetType()).toBe(ScFormatEntryType.Condition);
    expect(second?.GetEntry(0)?.GetType()).toBe(ScFormatEntryType.Condition);
    expect(second?.GetEntry(1)?.GetType()).toBe(ScFormatEntryType.ExtCondition);
  } finally {
    document.Dispose();
  }
});

/** Verifies the original two cellIs operands. @param document - Native Calc workbook. @returns Nothing. */
function checkCellIs(document: ScDocument): void {
  const address = new ScAddress();
  const formats = [...(document.FetchTable(0)?.GetCondFormList() ?? [])];
  expect(formats).toHaveLength(1);
  const format = formats[0];
  expect(format?.size()).toBe(2);
  for (const [index, expected] of ["$Sheet2.$A$2", "$Sheet2.$A$1"].entries()) {
    const entry = format?.GetEntry(index) as ScCondFormatEntry;
    expect(entry.GetType()).toBe(ScFormatEntryType.ExtCondition);
    expect(entry.GetOperation()).toBe(ScConditionMode.Equal);
    expect(entry.GetExpression(address, 0, FormulaGrammar.Grammar.GRAM_NATIVE)).toBe(expected);
  }
}

/** Compares mixed priorities in the emitted standard and extended XML ranges. @param sheet - Serialized worksheet. @returns Nothing. */
function checkPriorities(sheet: Document): void {
  for (const range of ["A1", "A3"]) {
    const normal = sheet.querySelector(`conditionalFormatting[sqref="${range}"] > cfRule`);
    const ext = Array.from(
      sheet.getElementsByTagNameNS(x14Namespace, "conditionalFormatting"),
    ).find(
      /** Finds the matching extended target. @param group - XML group. @returns Whether the source ranges match. */
      (group) => group.getElementsByTagNameNS(xmNamespace, "sqref")[0]?.textContent === range,
    );
    const normalPriority = Number(normal?.getAttribute("priority"));
    const extPriority = Number(
      ext?.getElementsByTagNameNS(x14Namespace, "cfRule")[0]?.getAttribute("priority"),
    );
    expect(normalPriority).toBeGreaterThan(0);
    expect(extPriority).toBeGreaterThan(0);
    expect(extPriority < normalPriority).toBe(range === "A1");
  }
}

it.each(["tdf120749", "tdf122102", "condFormat_cellis", "conditional_fmt_checkpriority"])(
  "%s writes inline differential styles, original operands and reopenable range groups",
  /** Exercises native export and reopening. @param name - Original test workbook. @returns Completion. */ async (
    name,
  ) => {
    const document = await open(name);
    try {
      if (name === "condFormat_cellis") checkCellIs(document);
      const saved = await exportXlsx(document);
      const archive = await DocumentArchive.open(saved);
      const xml = await archive.readTextEntry("xl/worksheets/sheet1.xml");
      const sheet = new DOMParser().parseFromString(xml, "application/xml");
      if (name === "conditional_fmt_checkpriority") checkPriorities(sheet);
      const groups = sheet.getElementsByTagNameNS(x14Namespace, "conditionalFormatting");
      const expectedCount =
        name === "condFormat_cellis" ? 1 : name === "conditional_fmt_checkpriority" ? 2 : 4;
      expect(groups).toHaveLength(expectedCount);
      const rules = sheet.getElementsByTagNameNS(x14Namespace, "cfRule");
      expect(
        [...rules].every(
          /** Checks the original UUID and inline style. @param rule - Serialized rule. @returns Whether the record is complete. */
          (rule) =>
            /^\{[0-9A-F-]{36}\}$/u.test(rule.getAttribute("id") ?? "") &&
            rule.getElementsByTagNameNS(x14Namespace, "dxf").length === 1,
        ),
      ).toBe(true);
      if (name === "tdf120749") {
        const formulas = groups[0]?.getElementsByTagNameNS(xmNamespace, "f") ?? [];
        expect(
          [...formulas].map(
            /** Reads the actual extended formula. @param node - Formula element. @returns Formula expression. */
            (node) => node.textContent,
          ),
        ).toEqual(["LEFT(A1,LEN($B$1))=$B$1", "$B$1"]);
        expect(groups[0]?.getElementsByTagNameNS(xmNamespace, "sqref")[0]?.textContent).toBe("A1");
        expect(xml).toContain('rgb="FFFFFF00"');
      }
      const reopened = await ExcelFilter.importDocument(saved);
      try {
        if (name === "condFormat_cellis") checkCellIs(reopened);
        const address = new ScAddress();
        const source = formatAt(document, address);
        const destination = formatAt(reopened, address);
        expect(destination?.size()).toBe(source?.size());
        for (let i = 0; i < (source?.size() ?? 0); ++i) {
          const before = source?.GetEntry(i) as ScCondFormatEntry;
          const after = destination?.GetEntry(i) as ScCondFormatEntry;
          expect(after.GetType()).toBe(before.GetType());
          expect(after.GetOperation()).toBe(before.GetOperation());
          expect(after.GetExpression(address, 0, FormulaGrammar.Grammar.GRAM_OOXML)).toBe(
            before.GetExpression(address, 0, FormulaGrammar.Grammar.GRAM_OOXML),
          );
        }
        expect(!!reopened.GetCondResult(address)).toBe(!!document.GetCondResult(address));
      } finally {
        reopened.Dispose();
      }
    } finally {
      document.Dispose();
    }
  },
);

it("retains formula-backed evaluation in ODS under its original plain condition type", /** Checks primary Calc state and the source ODS-to-XLSX limitation. @returns Completion. */ async () => {
  const document = await open("tdf120749");
  try {
    const ods = await readOdsDocument(await writeOdsDocument(document));
    try {
      for (let row = 0; row < 4; ++row) {
        const address = new ScAddress(0, row);
        expect(formatAt(ods, address)?.GetEntry(0)?.GetType()).toBe(ScFormatEntryType.Condition);
        expect(ods.GetCondResult(address)).toBeDefined();
      }
      const archive = await DocumentArchive.open(await exportXlsx(ods));
      expect(await archive.readTextEntry("xl/worksheets/sheet1.xml")).toContain(
        'operator="beginsWith" text=""',
      );
    } finally {
      ods.Dispose();
    }
  } finally {
    document.Dispose();
  }
});

it("uses a lone text formula as a direct condition and rejects unowned extension elements", /** Exercises the extension parser boundaries. @returns Completion. */ async () => {
  const original = await DocumentArchive.open(
    new Uint8Array(
      readFileSync(
        "../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/universal-content.xlsx",
      ),
    ),
  );
  const writer = new DocumentArchiveWriter();
  const groups = `<extLst><ext xmlns:x14="${x14Namespace}" xmlns:xm="${xmNamespace}" xmlns:wrong="urn:other">
    <wrong:conditionalFormatting><x14:cfRule type="expression"><xm:f>1</xm:f></x14:cfRule><xm:sqref>C2</xm:sqref></wrong:conditionalFormatting>
    <x14:unknown/>
    <x14:conditionalFormattings>
      <x14:conditionalFormatting><x14:unknown/><x14:cfRule type="expression"/><x14:cfRule type="notSupported" priority="2"><xm:f>1</xm:f></x14:cfRule><xm:sqref>A2</xm:sqref></x14:conditionalFormatting>
      <x14:conditionalFormatting><x14:cfRule type="expression" priority="2"><xm:f>1</xm:f></x14:cfRule><xm:sqref>XFE1048577</xm:sqref></x14:conditionalFormatting>
      <x14:conditionalFormatting><x14:cfRule type="containsText" priority="2"><xm:f>1=<![CDATA[1]]></xm:f></x14:cfRule><xm:sqref>A1</xm:sqref></x14:conditionalFormatting>
    </x14:conditionalFormattings>
  </ext><wrong:ext xmlns:wrong="urn:other"/></extLst>`;
  for (const path of original.getEntryNames()) {
    if (path !== "xl/worksheets/sheet1.xml")
      writer.putNextEntry(path, await original.readEntry(path));
    else {
      const xml = await original.readTextEntry(path);
      writer.putNextEntry(
        path,
        new TextEncoder().encode(xml.replace("</worksheet>", groups + "</worksheet>")),
      );
    }
  }
  const document = await ExcelFilter.importDocument(await writer.finish());
  try {
    const table = document.FetchTable(0);
    expect(Array.from(table?.GetCondFormList() ?? [])).toHaveLength(1);
    const address = new ScAddress();
    const entry = formatAt(document, address)?.GetEntry(0) as ScCondFormatEntry;
    expect(entry.GetOperation()).toBe(ScConditionMode.Direct);
    expect(document.GetCondResult(address)).toBeDefined();
    const archive = await DocumentArchive.open(await exportXlsx(document));
    const xml = await archive.readTextEntry("xl/worksheets/sheet1.xml");
    expect(xml).toContain('x14:cfRule type="expression"');
    expect(xml).toContain("<xm:f>1=1</xm:f>");
  } finally {
    document.Dispose();
  }
});
