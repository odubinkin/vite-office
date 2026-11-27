/** @fileoverview ODS database range ownership and filtered geometry from the pinned Calc fixture. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress } from "../../../inc/address";
import type { ScMergeFlagAttr } from "../../../inc/attrib";
import { ScQueryOp } from "../../../inc/global";
import { STR_DB_LOCAL_NONAME } from "../../../inc/globalnames";
import { ATTR_MERGE_FLAG } from "../../../inc/scitems";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

it("testDatabaseRangesODS preserves database ranges and filtered row runs", /** Ports the native range ownership and filtered geometry assertions. @returns Completion. */ async () => {
  const source = await readOdsDocument(
    new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/database.ods"),
    ),
  );
  const transferred = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
  const bytes = await writeOdsDocument(transferred);
  const reopened = await readOdsDocument(bytes);
  try {
    for (const document of [source, transferred, reopened]) {
      document.CalcAll();
      for (const [column, value] of [
        [0, 4],
        [1, 2],
        [3, 4],
        [4, 2],
      ] as const)
        expect(document.GetValue(new ScAddress(column, 10, 1))).toBe(value);
      const database = document.GetDBCollection().getNamedDBs().findByUpperName("DATABASE1");
      assert(database);
      expect(database.GetArea().GetVars()).toEqual([0, 0, 1, 2, 6, 1]);
      expect(database.GetQueryParam().bHasHeader).toBe(true);
      const local = document.GetAnonymousDBData(0);
      assert(local);
      expect(local.GetName()).toBe(STR_DB_LOCAL_NONAME);
      expect(local.GetArea().GetVars()).toEqual([0, 0, 0, 3, 5, 0]);
      expect(local.HasAutoFilter()).toBe(true);
      expect(local.GetQueryParam().entries).toMatchObject([
        { nField: 1, eOp: ScQueryOp.SC_EQUAL, items: [{ type: "number", value: 10 }] },
      ]);

      for (const [row, hidden, first, last] of [
        [0, false, 0, 0],
        [1, true, 1, 2],
        [3, false, 3, 3],
        [4, true, 4, 5],
        [6, false, 6, document.MaxRow()],
      ] as const) {
        const firstRow: [number] = [-1],
          lastRow: [number] = [-1];
        expect(document.RowHidden(row, 0, firstRow, lastRow)).toBe(hidden);
        expect([firstRow[0], lastRow[0]]).toEqual([first, last]);
        expect(document.RowFiltered(row, 0)).toBe(hidden);
      }
      const flags = document.GetPattern(new ScAddress(1, 0, 0))?.GetItem(ATTR_MERGE_FLAG) as
        ScMergeFlagAttr | undefined;
      expect(flags?.HasAutoFilter()).toBe(true);
    }
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(content).toContain(
      '<table:database-ranges><table:database-range table:name="database1"',
    );
    expect(content).toContain('table:name="__Anonymous_Sheet_DB__0"');
    expect(content).toContain('table:formula="of:=DCOUNT(database1;');
  } finally {
    source.Dispose();
    transferred.Dispose();
    reopened.Dispose();
  }
});
