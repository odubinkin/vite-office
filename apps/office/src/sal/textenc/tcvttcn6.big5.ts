/** @fileoverview Pinned Big5 pointer and EUDC aggregate from tcvttcn6.tab. */
import data from "./tcvttcn6.big5.tables.json" with { type: "json" };
import { aImplDoubleByteIdentifierTab } from "./tables.data";
import { aImplMS950DBCSEUDCTab } from "./tcvttcn6.ms950";
import type { ImplDBCSConvertData, ImplDBCSToUniLeadTab, ImplUniToDBCSHighTab } from "./tenchelp";

const tables: Readonly<Record<string, readonly number[]>> = data.tables;

/** Source forward table, including the original double-byte identifier pointer. */
const aBIG5UniLeadTab: readonly ImplDBCSToUniLeadTab[] = data.lead.map(
  /** Binds one original lead-table row. @param entry - Pinned source row. @returns Actual lead record. */ ({
    table,
    mnUniChar,
    mnTrailStart,
    mnTrailEnd,
  }) => ({
    mnUniChar,
    mnTrailStart,
    mnTrailEnd,
    mpToUniTrailTab:
      table === null
        ? null
        : table === "aImplDoubleByteIdentifierTab"
          ? aImplDoubleByteIdentifierTab
          : (tables[table] as readonly number[]),
  }),
);

/** Source reverse table with original null entries and low-byte ranges. */
const aBIG5DBCSHighTab: readonly ImplUniToDBCSHighTab[] = data.high.map(
  /** Binds one original high-byte row. @param entry - Pinned source row. @returns Actual reverse record. */ ({
    table,
    mnLowStart,
    mnLowEnd,
  }) => ({
    mnLowStart,
    mnLowEnd,
    mpToUniTrailTab: table === null ? null : (tables[table] as readonly number[]),
  }),
);

/** Original Big5 descriptor points to its own tables and the source shared MS950 EUDC ranges. */
export const aImplBIG5DBCSCvtData: ImplDBCSConvertData = {
  mpToUniLeadTab: aBIG5UniLeadTab,
  mpToDBCSHighTab: aBIG5DBCSHighTab,
  mpEUDCTab: aImplMS950DBCSEUDCTab,
  mnEUDCCount: 5,
  mnLeadStart: 0,
  mnLeadEnd: 0xff,
  mnTrailStart: 0x40,
  mnTrailEnd: 0xfe,
};
