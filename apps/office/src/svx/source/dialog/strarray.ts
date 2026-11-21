/** @fileoverview SvxAttrNameTable maps native slot ids to the pinned RID_ATTR_NAMES resources. */

/** Slot names from include/svx/svxitems.hrc in native declaration order. */
export const AttributeNames: ReadonlyMap<number, string> = new Map([
  [10000, "Scale"], // SID_ATTR_ZOOM
  [10001, "Brush"], // SID_ATTR_BRUSH
  [10002, "Tab stops"], // SID_ATTR_TABSTOP
  [10006, "Character"], // SID_ATTR_CHAR
  [10007, "Font"], // SID_ATTR_CHAR_FONT
  [10008, "Font posture"], // SID_ATTR_CHAR_POSTURE
  [10009, "Font weight"], // SID_ATTR_CHAR_WEIGHT
  [10010, "Shadowed"], // SID_ATTR_CHAR_SHADOWED
  [10011, "Individual words"], // SID_ATTR_CHAR_WORDLINEMODE
  [10012, "Outline"], // SID_ATTR_CHAR_CONTOUR
  [10013, "Strikethrough"], // SID_ATTR_CHAR_STRIKEOUT
  [10014, "Underline"], // SID_ATTR_CHAR_UNDERLINE
  [10015, "Font size"], // SID_ATTR_CHAR_FONTHEIGHT
  [10017, "Font color"], // SID_ATTR_CHAR_COLOR
  [10018, "Kerning"], // SID_ATTR_CHAR_KERNING
  [10019, "Effects"], // SID_ATTR_CHAR_CASEMAP
  [10020, "Language"], // SID_ATTR_CHAR_LANGUAGE
  [10021, "Position"], // SID_ATTR_CHAR_ESCAPEMENT
  [10067, "Character blinking"], // SID_ATTR_CHAR_AUTOKERN
  [10877, "Character set color"], // SID_ATTR_CHAR_CHARSETCOLOR
  [11568, "Overline"], // SID_ATTR_CHAR_OVERLINE
  [10027, "Alignment"], // SID_ATTR_PARA_ADJUST
  [10033, "Line spacing"], // SID_ATTR_PARA_LINESPACE
  [10037, "Page Break"], // SID_ATTR_PARA_PAGEBREAK
  [10038, "Hyphenation"], // SID_ATTR_PARA_HYPHENZONE
  [10039, "Don’t split paragraph"], // SID_ATTR_PARA_SPLIT
  [10040, "Don’t split at beginning of paragraph"], // SID_ATTR_PARA_ORPHANS
  [10041, "Don’t split at end of paragraph"], // SID_ATTR_PARA_WIDOWS
  [10042, "Paragraph spacing"], // SID_ATTR_PARA_ULSPACE
  [10043, "Paragraph indent"], // SID_ATTR_PARA_LRSPACE
  [10048, "Indent"], // SID_ATTR_LRSPACE
  [10049, "Spacing"], // SID_ATTR_ULSPACE
  [10050, "Page"], // SID_ATTR_PAGE
  [10065, "Page Style"], // SID_ATTR_PARA_MODEL
  [10066, "Keep with next paragraph"], // SID_ATTR_PARA_KEEP
  [10406, "Blinking"], // SID_ATTR_FLASH
  [10413, "Page line-spacing"], // SID_ATTR_PARA_REGISTER
  [10591, "Character highlighting color"], // SID_ATTR_BRUSH_CHAR
  [10887, "Asian font"], // SID_ATTR_CHAR_CJK_FONT
  [10888, "Size of Asian font"], // SID_ATTR_CHAR_CJK_FONTHEIGHT
  [10889, "Language of Asian font"], // SID_ATTR_CHAR_CJK_LANGUAGE
  [10890, "Posture of Asian font"], // SID_ATTR_CHAR_CJK_POSTURE
  [10891, "Weight of Asian font"], // SID_ATTR_CHAR_CJK_WEIGHT
  [10892, "CTL"], // SID_ATTR_CHAR_CTL_FONT
  [10893, "Size of complex scripts"], // SID_ATTR_CHAR_CTL_FONTHEIGHT
  [10894, "Language of complex scripts"], // SID_ATTR_CHAR_CTL_LANGUAGE
  [10895, "Posture of complex scripts"], // SID_ATTR_CHAR_CTL_POSTURE
  [10896, "Weight of complex scripts"], // SID_ATTR_CHAR_CTL_WEIGHT
  [10897, "Double-lined"], // SID_ATTR_CHAR_TWO_LINES
  [10899, "Emphasis mark"], // SID_ATTR_CHAR_EMPHASISMARK
  [10901, "Text spacing"], // SID_ATTR_PARA_SCRIPTSPACE
  [10902, "Hanging punctuation"], // SID_ATTR_PARA_HANGPUNCTUATION
  [10903, "Forbidden characters"], // SID_ATTR_PARA_FORBIDDEN_RULES
  [10910, "Rotation"], // SID_ATTR_CHAR_ROTATED
  [10911, "Character scaling"], // SID_ATTR_CHAR_SCALEWIDTH
  [10920, "Relief"], // SID_ATTR_CHAR_RELIEF
  [10925, "Vertical text alignment"], // SID_PARA_VERTALIGN
]);

/** Resolves the native attribute resource for a slot. @param slot - Native slot id. @returns Source resource text, if registered. */
export function GetAttributeName(slot: number): string | undefined {
  return AttributeNames.get(slot);
}
