/** @fileoverview Original fixed Japanese space-ignore table and concrete table-only module. */
import { oneToOneMapping } from "../../../i18nutil/inc/oneToOneMapping";
import { transliteration_Ignore } from "./transliteration_Ignore";
const ignoreSpace_ja_JP_mappingTable = [
  0x0020, 0x00a0, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200a, 0x200b,
  0x202f, 0x3000, 0x303f,
].map(
  /** Original initialized two-ushort table row. @param first - Exact original key. @returns Original mapping row. */ (
    first,
  ) => ({ first, second: 0xffff }),
);
/** Original table module; no general Unicode whitespace policy is substituted. */
export class ignoreSpace_ja_JP extends transliteration_Ignore {
  /** Original allocated mapping table, sizeof(row)=4 and names. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = new oneToOneMapping(
      ignoreSpace_ja_JP_mappingTable,
      ignoreSpace_ja_JP_mappingTable.length * 4,
    );
    this.map = null;
    this.transliterationName = "ignoreSpace_ja_JP";
    this.implementationName = "com.sun.star.i18n.Transliteration.ignoreSpace_ja_JP";
  }
}
