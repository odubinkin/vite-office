/** @fileoverview Original public search command/application/cell values from include/svl/srchitem.hxx. Search item/configuration owners are separate pending responsibilities. */
/** Native four search operations. */
export enum SvxSearchCmd {
  FIND = 0,
  FIND_ALL = 1,
  REPLACE = 2,
  REPLACE_ALL = 3,
}
/** Native searched cell value family. */
export enum SvxSearchCellType {
  FORMULA = 0,
  VALUE = 1,
  NOTE = 2,
}
/** Native application identity carried by search items. */
export enum SvxSearchApp {
  WRITER = 0,
  CALC = 1,
  DRAW = 2,
}
