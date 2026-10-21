/** @fileoverview Original large2small rows and concrete module,including source table direction and exceptional entries. */
import { oneToOneMapping } from "../../../i18nutil/inc/oneToOneMapping";
import { transliteration_OneToOne } from "./transliteration_OneToOne";
const large2small = [
  { first: 0x3041, second: 0x3042 },
  { first: 0x3043, second: 0x3044 },
  { first: 0x3045, second: 0x3046 },
  { first: 0x3047, second: 0x3048 },
  { first: 0x3049, second: 0x304a },
  { first: 0x3063, second: 0x3064 },
  { first: 0x3083, second: 0x3084 },
  { first: 0x3085, second: 0x3086 },
  { first: 0x3087, second: 0x3088 },
  { first: 0x308e, second: 0x308f },
  { first: 0x30a1, second: 0x30a2 },
  { first: 0x30a3, second: 0x30a4 },
  { first: 0x30a5, second: 0x30a6 },
  { first: 0x30a7, second: 0x30a8 },
  { first: 0x30a9, second: 0x30aa },
  { first: 0x30c3, second: 0x30c4 },
  { first: 0x30e3, second: 0x30e4 },
  { first: 0x30e5, second: 0x30e6 },
  { first: 0x30e7, second: 0x30e8 },
  { first: 0x30ee, second: 0x30ef },
  { first: 0x30f5, second: 0x30ab },
  { first: 0x30f6, second: 0x30b1 },
  { first: 0xff67, second: 0xff71 },
  { first: 0xff68, second: 0xff72 },
  { first: 0xff69, second: 0xff73 },
  { first: 0xff6a, second: 0xff74 },
  { first: 0xff6b, second: 0xff75 },
  { first: 0xff6c, second: 0xff94 },
  { first: 0xff6d, second: 0xff95 },
  { first: 0xff6e, second: 0xff96 },
  { first: 0xff6f, second: 0xff82 },
];
let _table: oneToOneMapping | undefined;
/** Original initialized table-only module. */
export class largeToSmall_ja_JP extends transliteration_OneToOne {
  /** Original function-local static table and constructor names. @returns Module. */
  constructor() {
    super();
    _table ??= new oneToOneMapping(large2small, large2small.length * 4);
    this.func = null;
    this.table = _table;
    this.transliterationName = "largeToSmall_ja_JP";
    this.implementationName = "com.sun.star.i18n.Transliteration.largeToSmall_ja_JP";
  }
}
