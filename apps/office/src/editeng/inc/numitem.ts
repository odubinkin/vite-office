/** @fileoverview Original numitem.hxx rule value declarations;stream,graphic unlinking,number-string provider and UNO rule wrapper responsibilities remain unported. */
/** Original unsigned16 feature bits. */
export enum SvxNumRuleFlags {
  NONE = 0x0000,
  CONTINUOUS = 0x0001,
  CHAR_STYLE = 0x0004,
  BULLET_REL_SIZE = 0x0008,
  BULLET_COLOR = 0x0010,
  NO_NUMBERS = 0x0080,
  ENABLE_LINKED_BMP = 0x0100,
  ENABLE_EMBEDDED_BMP = 0x0200,
}
/** Original unsigned8 numbering-rule kind. */
export enum SvxNumRuleType {
  NUMBERING,
  OUTLINE_NUMBERING,
  PRESENTATION_NUMBERING,
}
/** Original marker for no numbering. */
export const SVX_NO_NUM = 200;
/** Original disabled-level bit. */
export const SVX_NO_NUMLEVEL = 0x20;
/** Original minimum relative numbering-symbol size. */
export const SVX_NUM_REL_SIZE_MIN = 25;
export {
  SvxNumberFormat,
  SvxNumberType,
  type ConstSvxNumberFormat,
  type SvxNumPositionAndSpaceMode,
} from "../source/items/numitem";
export {
  SvxNumRule,
  SvxNumBulletItem,
  SvxNodeNum,
  SvxConvertNumRule,
} from "../source/items/numitem.rule";
