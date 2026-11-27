/** @fileoverview Native change-tracking type identifiers from svx/ctredlin.hxx. */

/** Original Writer redline type values. */
export enum RedlineType {
  Insert = 0,
  Delete = 1,
  Format = 2,
  Table = 3,
  FmtColl = 4,
  ParagraphFormat = 5,
  TableRowInsert = 6,
  TableRowDelete = 7,
  TableCellInsert = 8,
  TableCellDelete = 9,
  None = 65534,
  Any = 65535,
}
