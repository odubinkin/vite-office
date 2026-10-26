/** @fileoverview Consumed character-format default switch from DocumentStylePoolManager.cxx. */
import type { SwCharFormat } from "../../../inc/charfmt";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import {
  SvxPostureItem,
  SvxWeightItem,
  SvxUnderlineItem,
  SvxFontItem,
  SvxFontHeightItem,
  FontLineStyle,
} from "../../../../editeng/source/items/textitem";
import {
  SvxEscapementItem,
  DFLT_ESC_AUTO_SUPER,
  DFLT_ESC_PROP,
} from "../../../../editeng/inc/escapementitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { COL_BLUE, COL_RED, COL_CYAN } from "../../../../tools/inc/color";
import { FontItalic, FontWeight } from "../../../../tools/inc/fontenum";
import * as H from "../../../inc/hintids";
import { applyScriptFonts } from "./poolfmt-defaults";
import { GetDefBulletFont } from "./number-bullet";
/** Materializes every source default whose item family exists in the current character kernel. Unsupported ruby-emphasis/case-map/rotation item families are not synthesized. @param format - Newly created native character style. @returns Nothing. */
export function applyWriterCharacterStyleDefaults(format: SwCharFormat): void {
  const id = format.GetPoolFormatId();
  switch (id) {
    case P.CHR_BULLET_LEVEL: {
      const font = GetDefBulletFont();
      for (const which of [H.RES_CHRATR_FONT, H.RES_CHRATR_CJK_FONT, H.RES_CHRATR_CTL_FONT])
        format.SetFormatAttr(
          new SvxFontItem(
            font.GetFamilyType(),
            font.GetFamilyName(),
            font.GetStyleName(),
            font.GetPitch(),
            font.GetCharSet(),
            which,
          ),
        );
      break;
    }
    case P.CHR_FOOTNOTE_ANCHOR:
    case P.CHR_ENDNOTE_ANCHOR:
      format.SetFormatAttr(
        new SvxEscapementItem(DFLT_ESC_AUTO_SUPER, DFLT_ESC_PROP, H.RES_CHRATR_ESCAPEMENT),
      );
      break;
    case P.CHR_INET_NORMAL:
    case P.CHR_INET_VISIT:
    case P.CHR_JUMPEDIT:
      format.SetFormatAttr(
        new SvxColorItem(
          id === P.CHR_INET_NORMAL ? COL_BLUE : id === P.CHR_INET_VISIT ? COL_RED : COL_CYAN,
          H.RES_CHRATR_COLOR,
        ),
      );
      format.SetFormatAttr(
        new SvxUnderlineItem(
          id === P.CHR_JUMPEDIT ? FontLineStyle.LINESTYLE_DOTTED : FontLineStyle.LINESTYLE_SINGLE,
          H.RES_CHRATR_UNDERLINE,
        ),
      );
      break;
    case P.CHR_RUBYTEXT: {
      const height = Math.trunc(
        (
          format
            .GetDoc()
            .GetAttrPool()
            .GetUserOrPoolDefaultItem(H.RES_CHRATR_CJK_FONTSIZE) as SvxFontHeightItem
        ).GetHeight() / 2,
      );
      for (const which of [
        H.RES_CHRATR_FONTSIZE,
        H.RES_CHRATR_CJK_FONTSIZE,
        H.RES_CHRATR_CTL_FONTSIZE,
      ])
        format.SetFormatAttr(new SvxFontHeightItem(height, 100, which));
      format.SetFormatAttr(
        new SvxUnderlineItem(FontLineStyle.LINESTYLE_NONE, H.RES_CHRATR_UNDERLINE),
      );
      break;
    }
    case P.CHR_HTML_EMPHASIS:
    case P.CHR_HTML_CITATION:
    case P.CHR_HTML_VARIABLE:
      for (const which of [
        H.RES_CHRATR_POSTURE,
        H.RES_CHRATR_CJK_POSTURE,
        H.RES_CHRATR_CTL_POSTURE,
      ])
        format.SetFormatAttr(new SvxPostureItem(FontItalic.ITALIC_NORMAL, which));
      break;
    case P.CHR_IDX_MAIN_ENTRY:
    case P.CHR_HTML_STRONG:
      for (const which of [H.RES_CHRATR_WEIGHT, H.RES_CHRATR_CJK_WEIGHT, H.RES_CHRATR_CTL_WEIGHT])
        format.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, which));
      break;
    case P.CHR_HTML_CODE:
    case P.CHR_HTML_SAMPLE:
    case P.CHR_HTML_KEYBOARD:
    case P.CHR_HTML_TELETYPE:
      applyScriptFonts(format, "fixed");
      break;
  }
}
