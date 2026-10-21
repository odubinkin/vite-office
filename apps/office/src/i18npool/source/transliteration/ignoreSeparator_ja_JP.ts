/** @fileoverview Original separator deletion table and concrete ignore module. */
import { oneToOneMapping } from "../../../i18nutil/inc/oneToOneMapping";
import { transliteration_Ignore } from "./transliteration_Ignore";
const ignoreSeparatorTable = [
  { first: 0x0021, second: 0xffff },
  { first: 0x0023, second: 0xffff },
  { first: 0x0024, second: 0xffff },
  { first: 0x0025, second: 0xffff },
  { first: 0x0026, second: 0xffff },
  { first: 0x002a, second: 0xffff },
  { first: 0x002b, second: 0xffff },
  { first: 0x002c, second: 0xffff },
  { first: 0x002d, second: 0xffff },
  { first: 0x002e, second: 0xffff },
  { first: 0x002f, second: 0xffff },
  { first: 0x003a, second: 0xffff },
  { first: 0x003b, second: 0xffff },
  { first: 0x003c, second: 0xffff },
  { first: 0x003d, second: 0xffff },
  { first: 0x003e, second: 0xffff },
  { first: 0x005c, second: 0xffff },
  { first: 0x005f, second: 0xffff },
  { first: 0x007b, second: 0xffff },
  { first: 0x007c, second: 0xffff },
  { first: 0x007d, second: 0xffff },
  { first: 0x007e, second: 0xffff },
  { first: 0x00a5, second: 0xffff },
  { first: 0x3001, second: 0xffff },
  { first: 0x3002, second: 0xffff },
  { first: 0x3008, second: 0xffff },
  { first: 0x3009, second: 0xffff },
  { first: 0x300a, second: 0xffff },
  { first: 0x300b, second: 0xffff },
  { first: 0x300c, second: 0xffff },
  { first: 0x300d, second: 0xffff },
  { first: 0x300e, second: 0xffff },
  { first: 0x300f, second: 0xffff },
  { first: 0x3010, second: 0xffff },
  { first: 0x3011, second: 0xffff },
  { first: 0x3014, second: 0xffff },
  { first: 0x3015, second: 0xffff },
  { first: 0x3016, second: 0xffff },
  { first: 0x3017, second: 0xffff },
  { first: 0x3018, second: 0xffff },
  { first: 0x3019, second: 0xffff },
  { first: 0x301a, second: 0xffff },
  { first: 0x301b, second: 0xffff },
  { first: 0x301c, second: 0xffff },
  { first: 0x301d, second: 0xffff },
  { first: 0x301e, second: 0xffff },
  { first: 0x301f, second: 0xffff },
  { first: 0x3030, second: 0xffff },
  { first: 0x30fb, second: 0xffff },
  { first: 0x30fc, second: 0xffff },
  { first: 0xff01, second: 0xffff },
  { first: 0xff03, second: 0xffff },
  { first: 0xff04, second: 0xffff },
  { first: 0xff05, second: 0xffff },
  { first: 0xff06, second: 0xffff },
  { first: 0xff0a, second: 0xffff },
  { first: 0xff0b, second: 0xffff },
  { first: 0xff0c, second: 0xffff },
  { first: 0xff0d, second: 0xffff },
  { first: 0xff0e, second: 0xffff },
  { first: 0xff0f, second: 0xffff },
  { first: 0xff1a, second: 0xffff },
  { first: 0xff1b, second: 0xffff },
  { first: 0xff1c, second: 0xffff },
  { first: 0xff1d, second: 0xffff },
  { first: 0xff1e, second: 0xffff },
  { first: 0xff3c, second: 0xffff },
  { first: 0xff3f, second: 0xffff },
  { first: 0xff5b, second: 0xffff },
  { first: 0xff5c, second: 0xffff },
  { first: 0xff5d, second: 0xffff },
  { first: 0xff5e, second: 0xffff },
  { first: 0xffe5, second: 0xffff },
];
const _table = new oneToOneMapping(ignoreSeparatorTable, ignoreSeparatorTable.length * 4);
/** Original initialized table-only module. */
export class ignoreSeparator_ja_JP extends transliteration_Ignore {
  /** Original pointer fields and service names. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = _table;
    this.map = null;
    this.transliterationName = "ignoreSeparator_ja_JP";
    this.implementationName = "com.sun.star.i18n.Transliteration.ignoreSeparator_ja_JP";
  }
}
