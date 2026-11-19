/** @fileoverview Original ScDxfFont optional properties from fonthelper.hxx; the font-item pointer is borrowed and optional Color is owned by value. */
import type { SvxFontItem } from "../../editeng/inc/fontitem";
import type {
  FontWeight,
  FontItalic,
  FontLineStyle,
  FontStrikeout,
  FontEmphasisMark,
} from "../../tools/inc/fontenum";
import type { FontRelief } from "../../vcl/inc/fntstyle";
import { Color } from "../../tools/inc/color";
import type { LanguageType } from "../../i18nlangtag/inc/lang";
/** Original default/implicit-copy aggregate: unset differs from explicit zero or false. */
export class ScDxfFont {
  pFontAttr: Readonly<SvxFontItem> | null | undefined;
  nFontHeight: number | undefined;
  eWeight: FontWeight | undefined;
  eItalic: FontItalic | undefined;
  eUnder: FontLineStyle | undefined;
  eOver: FontLineStyle | undefined;
  bWordLine: boolean | undefined;
  eStrike: FontStrikeout | undefined;
  bOutline: boolean | undefined;
  bShadow: boolean | undefined;
  eEmphasis: FontEmphasisMark | undefined;
  eRelief: FontRelief | undefined;
  aColor: Color | undefined;
  eLang: LanguageType | undefined;
  /** Original memberwise copy preserves the borrowed font pointer and copies Color. @param source - Optional actual source. @returns Independent aggregate. */
  constructor(source?: ScDxfFont) {
    if (source !== undefined) {
      this.pFontAttr = source.pFontAttr;
      this.nFontHeight = source.nFontHeight;
      this.eWeight = source.eWeight;
      this.eItalic = source.eItalic;
      this.eUnder = source.eUnder;
      this.eOver = source.eOver;
      this.bWordLine = source.bWordLine;
      this.eStrike = source.eStrike;
      this.bOutline = source.bOutline;
      this.bShadow = source.bShadow;
      this.eEmphasis = source.eEmphasis;
      this.eRelief = source.eRelief;
      this.aColor = source.aColor === undefined ? undefined : new Color(source.aColor);
      this.eLang = source.eLang;
    }
  }
  /** Original presence-only test, including engaged false, zero and null pointer. @returns Whether every optional is disengaged. */
  isEmpty(): boolean {
    return !(
      this.pFontAttr !== undefined ||
      this.nFontHeight !== undefined ||
      this.eWeight !== undefined ||
      this.eItalic !== undefined ||
      this.eUnder !== undefined ||
      this.eOver !== undefined ||
      this.bWordLine !== undefined ||
      this.eStrike !== undefined ||
      this.bOutline !== undefined ||
      this.bShadow !== undefined ||
      this.eEmphasis !== undefined ||
      this.eRelief !== undefined ||
      this.aColor !== undefined ||
      this.eLang !== undefined
    );
  }
}
