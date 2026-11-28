/** @fileoverview ODS database range ownership and filtered geometry from the pinned Calc fixture. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { COL_AUTO } from "../../../../tools/inc/color";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress } from "../../../inc/address";
import type { ScMergeFlagAttr } from "../../../inc/attrib";
import { ScQueryOp } from "../../../inc/global";
import { STR_DB_LOCAL_NONAME } from "../../../inc/globalnames";
import { ATTR_MERGE_FLAG } from "../../../inc/scitems";
import { isQueryColorItem } from "../../core/tool/queryparam";
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

it("testAutofilterColorsODF preserves RGB criteria and both automatic colors", /** TestAutofilterColorsODF preserves RGB criteria and both automatic colors. @returns Completion. */ async () => {
  const source = await readOdsDocument(
    new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/autofilter-colors.ods"),
    ),
  );
  const transferred = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
  try {
    const expected = [
      [
        ["background-color", "#e8f2a1", 0xe8f2a1],
        ["text-color", "#3465a4", 0x3465a4],
      ],
      [["background-color", "transparent", COL_AUTO.toUInt32()]],
      [["text-color", "window-font-color", COL_AUTO.toUInt32()]],
    ] as const;
    const bytes = await writeOdsDocument(transferred);
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    const ranges = [
      ...(content ?? "").matchAll(/<table:database-range [^>]+>(.*?)<\/table:database-range>/gs),
    ];
    expect(ranges).toHaveLength(expected.length);
    for (const [sheet, criteria] of expected.entries()) {
      for (const document of [source, transferred]) {
        const database = document.GetAnonymousDBData(sheet);
        assert(database);
        const items = database
          .GetQueryParam()
          .entries.flatMap(
            /** Projects the `items` of each entry. @param entry - Source entry. @returns The field value. */ (
              entry,
            ) => entry.items,
          );
        expect(
          items
            .filter(isQueryColorItem)
            .map(
              /** Extracts the imported value separator type and packed value for comparison. @param item - Native imported filter item. @returns Type and unsigned value pair. */ (
                item,
              ) => [item.type, item.value.toUInt32()],
            ),
        ).toEqual(
          criteria.map(
            /** Projects the two relevant expected fields from the native capture. @param entry - Expected native tuple. @returns Reference type and packed value. */ ([
              type,
              ,
              packed,
            ]) => [type, packed],
          ),
        );
      }
      const filter = ranges[sheet]?.[1]?.match(/<table:filter-and>(.*?)<\/table:filter-and>/s)?.[1];
      assert(filter);
      expect(
        [...filter.matchAll(/<table:filter-condition [^>]+\/>/g)].map(
          /** Reads the extension data type and serialized ODF value from a condition. @param entry - Filter condition match. @returns Serialized data type and value. */ ([
            condition,
          ]) => [
            condition.match(/loext:data-type="([^"]+)"/)?.[1],
            condition.match(/table:value="([^"]+)"/)?.[1],
          ],
        ),
      ).toEqual(
        criteria.map(
          /** Builds an expected condition pair for the exported value comparison. @param entry - Reference condition pair. @returns Expected data type and value. */ ([
            type,
            value,
          ]) => [type, value],
        ),
      );
    }
  } finally {
    source.Dispose();
    transferred.Dispose();
  }
});

it("testDateAutofilterODS preserves the original lexical filter values", /** TestDateAutofilterODS preserves the original lexical filter values. @returns Completion. */ async () => {
  const document = await readOdsDocument(
    new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/tdf142231.ods"),
    ),
  );
  try {
    const archive = await DocumentArchive.open(await writeOdsDocument(document));
    const content = await archive.readTextEntry("content.xml");
    const filter = content?.match(/<table:filter-and>(.*?)<\/table:filter-and>/s)?.[1];
    assert(filter);
    expect(
      [...filter.matchAll(/<table:filter-condition [^>]*table:value="([^"]+)"/g)].map(
        /** Extracts the captured color from each expected result. @param entry - Expected type and color tuple. @returns Expected filter color. */ ([
          ,
          value,
        ]) => value,
      ),
    ).toEqual(["Calc", "2021-05-04"]);
  } finally {
    document.Dispose();
  }
});
