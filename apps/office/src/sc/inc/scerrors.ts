/** @fileoverview Original Calc error codes consumed by the ASCII filter. */
import { ErrCode, ErrCodeArea, ErrCodeClass, WarningFlag } from "../../comphelper/inc/errcode";

/** The original text importer returned failure. */
export const SCERR_IMPORT_CONNECT = new ErrCode(ErrCodeArea.Sc, ErrCodeClass.Read, 1);

/** The requested numbered CSV sheet is invalid. */
export const SCERR_EXPORT_DATA = new ErrCode(ErrCodeArea.Sc, ErrCodeClass.Write, 2);

/** Successful import encountered more records than the sheet can hold. */
export const SCWARN_IMPORT_ROW_OVERFLOW = new ErrCode(
  WarningFlag.Yes,
  ErrCodeArea.Sc,
  ErrCodeClass.Import,
  2,
);

/** Successful import encountered more fields than the sheet can hold. */
export const SCWARN_IMPORT_COLUMN_OVERFLOW = new ErrCode(
  WarningFlag.Yes,
  ErrCodeArea.Sc,
  ErrCodeClass.Import,
  3,
);

/** Successful import truncated text at the original cell limit. */
export const SCWARN_IMPORT_CELL_OVERFLOW = new ErrCode(
  WarningFlag.Yes,
  ErrCodeArea.Sc,
  ErrCodeClass.Import,
  5,
);
