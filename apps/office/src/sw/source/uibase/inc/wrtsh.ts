/** @fileoverview Defines native SelectionType flag identities from pinned wrtsh.hxx. */
/** Native selection context bitset; unsupported families retain native identities. */
export enum SelectionType {
  NONE = 0x000000,
  Text = 0x000001,
  Graphic = 0x000002,
  Ole = 0x000010,
  Frame = 0x000020,
  NumberList = 0x000040,
  Table = 0x000080,
  TableCell = 0x000100,
  DrawObject = 0x000200,
  DrawObjectEditMode = 0x000400,
  Ornament = 0x000800,
  DbForm = 0x001000,
  FormControl = 0x002000,
  Media = 0x004000,
  ExtrudedCustomShape = 0x008000,
  FontWork = 0x010000,
  PostIt = 0x020000,
  TableRow = 0x040000,
  TableCol = 0x080000,
  All = 0x0ffff3,
}
