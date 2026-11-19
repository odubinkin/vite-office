/** @fileoverview Original consumed UNO service-name constants from unonames.hxx in native static RTL storage. Other property-name declarations remain unported. */
import { OUString, OUStringLiteral, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
/** Materializes an original compiler-known ASCII Unicode literal with static RTL storage. @param value - Original source literal. @returns Borrowed constant view. */
function literal(value: string): OUStringConstReference {
  return new OUString(
    new OUStringLiteral(
      Uint16Array.from(
        value + "\0",
        /** Original literal unit. @param unit - Source character. @returns Code unit. */ (unit) =>
          unit.charCodeAt(0),
      ),
    ),
  );
}
/** Original service-name constant. */
export const SC_SERVICENAME_VALBIND = literal("com.sun.star.table.CellValueBinding");
/** Original service-name constant. */
export const SC_SERVICENAME_LISTCELLBIND = literal("com.sun.star.table.ListPositionCellBinding");
/** Original service-name constant. */
export const SC_SERVICENAME_LISTSOURCE = literal("com.sun.star.table.CellRangeListSource");
/** Original service-name constant. */
export const SC_SERVICENAME_CELLADDRESS = literal("com.sun.star.table.CellAddressConversion");
/** Original service-name constant. */
export const SC_SERVICENAME_RANGEADDRESS = literal("com.sun.star.table.CellRangeAddressConversion");
/** Original service-name constant. */
export const SC_SERVICENAME_CHDATAPROV = literal("com.sun.star.chart2.data.DataProvider");
/** Original service-name constant. */
export const SC_SERVICENAME_CHART_PIVOTTABLE_DATAPROVIDER = literal(
  "com.sun.star.chart2.data.PivotTableDataProvider",
);
/** Original service-name constant. */
export const SC_SERVICENAME_FORMULAPARS = literal("com.sun.star.sheet.FormulaParser");
/** Original service-name constant. */
export const SC_SERVICENAME_OPCODEMAPPER = literal("com.sun.star.sheet.FormulaOpCodeMapper");
