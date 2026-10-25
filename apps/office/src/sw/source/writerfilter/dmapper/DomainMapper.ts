/** @fileoverview Ports consumed native DomainMapper paragraph/run stream and typed property handlers into actual SwXText APIs; style/list/table/section managers are separate upstream owners. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { FontWeight } from "../../../../offapi/com/sun/star/awt/FontWeight";
import {
  FontSlant,
  cppu_detail_getUnoType_FontSlant as slantType,
} from "../../../../offapi/com/sun/star/awt/FontSlant";
import { FontStrikeout } from "../../../../offapi/com/sun/star/awt/FontStrikeout";
import { FontUnderline as U } from "../../../../offapi/com/sun/star/awt/FontUnderline";
import {
  ParagraphAdjust as A,
  cppu_detail_getUnoType_ParagraphAdjust as adjustType,
} from "../../../../offapi/com/sun/star/style/ParagraphAdjust";
import {
  BreakType,
  cppu_detail_getUnoType_BreakType as breakType,
} from "../../../../offapi/com/sun/star/style/BreakType";
import {
  DFLT_ESC_PROP,
  DFLT_ESC_AUTO_SUPER,
  DFLT_ESC_AUTO_SUB,
} from "../../../../editeng/inc/escapementitem";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { stringAny, text } from "../../core/unocore/unocrsrhelper";
import type { Id, Properties, Reference, Sprm, Value } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { PropertyIds as P } from "./PropertyIds";
import { TypeClass } from "../../../../udkapi/com/sun/star/uno/TypeClass";
import { getEnumAsINT32 } from "../../../../comphelper/source/misc/types";
import { PropertyMap } from "./PropertyMap";
import { DomainMapper_Impl, ContextType as C } from "./DomainMapper_Impl";
import { convertTwipToMm100_Limited } from "./ConversionHelper";
import { ThemeColorHandler } from "./ThemeColorHandler";

/** Original underline token mapping, with unknown tokens retaining NONE. */
const underline = new Map<number, number>([
  [N.LN_Value_ST_Underline_none, U.NONE],
  [N.LN_Value_ST_Underline_words, U.SINGLE],
  [N.LN_Value_ST_Underline_single, U.SINGLE],
  [N.LN_Value_ST_Underline_double, U.DOUBLE],
  [N.LN_Value_ST_Underline_dotted, U.DOTTED],
  [N.LN_Value_ST_Underline_dash, U.DASH],
  [N.LN_Value_ST_Underline_dotDash, U.DASHDOT],
  [N.LN_Value_ST_Underline_dotDotDash, U.DASHDOTDOT],
  [N.LN_Value_ST_Underline_thick, U.BOLD],
  [N.LN_Value_ST_Underline_wave, U.WAVE],
  [N.LN_Value_ST_Underline_dottedHeavy, U.BOLDDOTTED],
  [N.LN_Value_ST_Underline_dashedHeavy, U.BOLDDASH],
  [N.LN_Value_ST_Underline_dashLong, U.LONGDASH],
  [N.LN_Value_ST_Underline_dashLongHeavy, U.BOLDLONGDASH],
  [N.LN_Value_ST_Underline_dashDotHeavy, U.BOLDDASHDOT],
  [N.LN_Value_ST_Underline_dashDotDotHeavy, U.BOLDDASHDOTDOT],
  [N.LN_Value_ST_Underline_wavyHeavy, U.BOLDWAVE],
  [N.LN_Value_ST_Underline_wavyDouble, U.DOUBLEWAVE],
]);
/** Original highlight token order is contiguous in the generated resource model. */
const highlights = [
  0x000000, 0x0000ff, 0x00ffff, 0x00ff00, 0xff00ff, 0xff0000, 0xffff00, 0xffffff, 0x000080,
  0x008080, 0x008000, 0x800080, 0x800000, 0x808000, 0x808080, 0xc0c0c0, -1,
] as const;

/** Receives native property sets and paragraph/run groups; lifecycle state remains on the shell, outside this model mapper. */
export class DomainMapper implements Properties {
  readonly impl: DomainMapper_Impl;
  /** Borrows the destination's actual UNO-facing document. @param model - Canonical model supplier. @returns Mapper. */
  constructor(readonly model: SwXTextDocument) {
    this.impl = new DomainMapper_Impl(model);
  }
  /** Original paragraph context starts with its document's default paragraph style. @returns Nothing. */
  startParagraphGroup(): void {
    this.insert(
      this.impl.PushProperties(C.CONTEXT_PARAGRAPH),
      P.PROP_PARA_STYLE_NAME,
      stringAny(this.impl.GetDefaultParaStyleName()),
    );
  }
  /** Original end callback pops state; the parser's CR event owns paragraph creation. @returns Nothing. */
  endParagraphGroup(): void {
    this.impl.PopProperties(C.CONTEXT_PARAGRAPH);
  }
  /** Original run starts with a distinct direct-property context. @returns Nothing. */ startCharacterGroup(): void {
    this.impl.PushProperties(C.CONTEXT_CHARACTER);
  }
  /** Original run context pop. @returns Nothing. */ endCharacterGroup(): void {
    this.impl.PopProperties(C.CONTEXT_CHARACTER);
  }
  /** Original property-set callback resolves against this mapper. @param properties - Reference. @returns Nothing. */ props(
    properties: Reference<Properties>,
  ): void {
    properties.resolve(this);
  }
  /** Original CR/cell-end single-unit markers finish a paragraph; ordinary UTF16 goes through XTextAppend. @param data - UTF16 view. @param length - Native logical length. @returns Nothing. */
  utext(data: Uint16Array, length = data.length): void {
    const value = new OUString(data, length);
    try {
      if (length === 1 && (data[0] === 13 || data[0] === 7))
        this.impl.finishParagraph(this.impl.GetTopContextOfType(C.CONTEXT_PARAGRAPH));
      else this.impl.appendTextPortion(value, this.impl.GetTopContext());
    } finally {
      value.dispose();
    }
  }
  /** Releases original import temporaries and removes only the body paragraph appended by XParagraphAppend. @returns Nothing. */
  finishDocument(): void {
    this.impl.RemoveLastParagraph();
  }
  /** Explicit host binding for the native mapper destructor; the destination model is borrowed. @returns Nothing. */ dispose(): void {
    this.impl.dispose();
  }
  /** Copies a temporary native Any into the map and releases its local owner. @param context - Map. @param id - Property. @param value - Owned Any. @param overwrite - Native mode. @returns Nothing. */
  private insert(context: PropertyMap, id: P, value: Any, overwrite = true): void {
    try {
      context.Insert(id, value, overwrite);
    } finally {
      value.dispose();
    }
  }
  /** Native 129 toggle reads the paragraph stylesheet value rather than the previous direct run. @param id - Native property. @returns Inverted toggle. */
  private invertedStyleValue(id: P): number {
    const value = this.impl.GetPropertyFromParaStyleSheet(id);
    try {
      if (!value.hasValue()) return 1;
      const scalar: [number] = [0];
      if (value.getValueTypeClass() === TypeClass.FLOAT) {
        value.extract(scalar, "double");
        return scalar[0] > 100 ? 0 : 1;
      }
      if (
        value.extract(scalar, "sal_Int16") ||
        (scalar[0] = (getEnumAsINT32(value) << 16) >> 16) >= 0
      )
        return scalar[0] ? 0 : 1;
      return 129;
    } finally {
      value.dispose();
    }
  }
  /** Native consumed attribute handlers retain source ordering and positive legacy twip ceiling. @param id - Original resource ID. @param value - Attribute. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    const context = this.impl.GetTopContext();
    if (!context) return;
    const n = value.getInt();
    switch (id) {
      case N.LN_CT_Fonts_ascii:
      case N.LN_CT_Fonts_eastAsia:
      case N.LN_CT_Fonts_cs: {
        const name = value.getString();
        try {
          this.insert(
            context,
            id === N.LN_CT_Fonts_ascii
              ? P.PROP_CHAR_FONT_NAME
              : id === N.LN_CT_Fonts_eastAsia
                ? P.PROP_CHAR_FONT_NAME_ASIAN
                : P.PROP_CHAR_FONT_NAME_COMPLEX,
            new Any([name.pData], "OUString"),
          );
        } finally {
          name.dispose();
        }
        break;
      }
      // Original DomainMapper explicitly leaves hAnsi unsupported rather than falling back to it for ascii.
      case N.LN_CT_Fonts_hAnsi:
        break;
      case N.LN_CT_Underline_val:
        if (n === N.LN_Value_ST_Underline_words)
          this.insert(context, P.PROP_CHAR_WORD_MODE, new Any([true], "bool"));
        this.insert(
          context,
          P.PROP_CHAR_UNDERLINE,
          new Any([underline.get(n) ?? U.NONE], "sal_Int16"),
        );
        break;
      case N.LN_CT_Underline_color:
        this.insert(context, P.PROP_CHAR_UNDERLINE_HAS_COLOR, new Any([true], "bool"));
        this.insert(context, P.PROP_CHAR_UNDERLINE_COLOR, new Any([n], "sal_Int32"));
        break;
      case N.LN_CT_Ind_left:
      case N.LN_CT_Ind_start:
        this.insert(
          context,
          P.PROP_PARA_LEFT_MARGIN,
          new Any([convertTwipToMm100_Limited(n)], "sal_Int32"),
        );
        break;
      case N.LN_CT_Ind_right:
      case N.LN_CT_Ind_end:
        this.insert(
          context,
          P.PROP_PARA_RIGHT_MARGIN,
          new Any([convertTwipToMm100_Limited(n)], "sal_Int32"),
        );
        break;
      case N.LN_CT_Ind_hanging:
        this.insert(
          context,
          P.PROP_PARA_FIRST_LINE_INDENT,
          new Any([-convertTwipToMm100_Limited(n)], "sal_Int32"),
        );
        break;
      case N.LN_CT_Ind_firstLine:
        this.insert(
          context,
          P.PROP_PARA_FIRST_LINE_INDENT,
          new Any([convertTwipToMm100_Limited(n)], "sal_Int32"),
        );
        break;
      case N.LN_CT_Spacing_before:
      case N.LN_CT_Spacing_after:
        this.insert(
          context,
          id === N.LN_CT_Spacing_before ? P.PROP_PARA_TOP_MARGIN : P.PROP_PARA_BOTTOM_MARGIN,
          new Any([convertTwipToMm100_Limited(n)], "sal_Int32"),
          false,
        );
        break;
    }
  }
  /** Native consumed modifier handlers preserve script families and typed UNO values. @param modifier - Modifier. @returns Nothing. */
  sprm(modifier: Sprm): void {
    const context = this.impl.GetTopContext();
    if (!context) return;
    const id = modifier.getId(),
      value = modifier.getValue();
    let n = value?.getInt() ?? 0;
    if (n === 129) {
      const toggle =
        id === N.LN_EG_RPrBase_b
          ? P.PROP_CHAR_WEIGHT
          : id === N.LN_EG_RPrBase_bCs
            ? P.PROP_CHAR_WEIGHT_COMPLEX
            : id === N.LN_EG_RPrBase_i
              ? P.PROP_CHAR_POSTURE
              : id === N.LN_EG_RPrBase_iCs
                ? P.PROP_CHAR_POSTURE_COMPLEX
                : id === N.LN_EG_RPrBase_strike || id === N.LN_EG_RPrBase_dstrike
                  ? P.PROP_CHAR_STRIKEOUT
                  : undefined;
      if (toggle !== undefined) n = this.invertedStyleValue(toggle);
    }
    switch (id) {
      case N.LN_EG_RPrBase_b:
      case N.LN_EG_RPrBase_bCs:
        if (n === 128) break;
        this.insert(
          context,
          id === N.LN_EG_RPrBase_b ? P.PROP_CHAR_WEIGHT : P.PROP_CHAR_WEIGHT_COMPLEX,
          new Any([n ? FontWeight.BOLD : FontWeight.NORMAL], "float"),
        );
        if (id === N.LN_EG_RPrBase_b)
          this.insert(
            context,
            P.PROP_CHAR_WEIGHT_ASIAN,
            new Any([n ? FontWeight.BOLD : FontWeight.NORMAL], "float"),
          );
        break;
      case N.LN_EG_RPrBase_i:
      case N.LN_EG_RPrBase_iCs:
        if (n === 128) break;
        this.insert(
          context,
          id === N.LN_EG_RPrBase_i ? P.PROP_CHAR_POSTURE : P.PROP_CHAR_POSTURE_COMPLEX,
          new Any([n ? FontSlant.ITALIC : FontSlant.NONE], slantType),
        );
        if (id === N.LN_EG_RPrBase_i)
          this.insert(
            context,
            P.PROP_CHAR_POSTURE_ASIAN,
            new Any([n ? FontSlant.ITALIC : FontSlant.NONE], slantType),
          );
        break;
      case N.LN_EG_RPrBase_strike:
      case N.LN_EG_RPrBase_dstrike:
        if (n !== 128)
          this.insert(
            context,
            P.PROP_CHAR_STRIKEOUT,
            new Any(
              [
                n
                  ? id === N.LN_EG_RPrBase_strike
                    ? FontStrikeout.SINGLE
                    : FontStrikeout.DOUBLE
                  : FontStrikeout.NONE,
              ],
              "sal_Int16",
            ),
            n !== 0,
          );
        break;
      case N.LN_EG_RPrBase_sz:
      case N.LN_EG_RPrBase_szCs:
        this.insert(
          context,
          id === N.LN_EG_RPrBase_sz ? P.PROP_CHAR_HEIGHT : P.PROP_CHAR_HEIGHT_COMPLEX,
          new Any([n / 2], "double"),
        );
        if (id === N.LN_EG_RPrBase_sz)
          this.insert(context, P.PROP_CHAR_HEIGHT_ASIAN, new Any([n / 2], "double"));
        break;
      case N.LN_EG_RPrBase_highlight: {
        const color = highlights[n - N.LN_Value_ST_HighlightColor_black];
        if (color !== undefined)
          this.insert(context, P.PROP_CHAR_HIGHLIGHT, new Any([color], "sal_Int32"));
        break;
      }
      case N.LN_EG_RPrBase_color: {
        const properties = modifier.getProps();
        if (properties) {
          const handler = new ThemeColorHandler();
          properties.resolve(handler);
          this.insert(context, P.PROP_CHAR_COLOR, new Any([handler.mnColor], "sal_Int32"));
        }
        break;
      }
      case N.LN_EG_RPrBase_vertAlign: {
        const string = value?.getString();
        const alignment = string ? text(string) : "";
        string?.dispose();
        this.insert(
          context,
          P.PROP_CHAR_ESCAPEMENT,
          new Any(
            [
              alignment === "superscript"
                ? DFLT_ESC_AUTO_SUPER
                : alignment === "subscript"
                  ? DFLT_ESC_AUTO_SUB
                  : 0,
            ],
            "sal_Int16",
          ),
        );
        this.insert(
          context,
          P.PROP_CHAR_ESCAPEMENT_HEIGHT,
          new Any(
            [alignment === "superscript" || alignment === "subscript" ? DFLT_ESC_PROP : 100],
            "sal_Int8",
          ),
        );
        break;
      }
      case N.LN_CT_PPrBase_keepLines:
        this.insert(context, P.PROP_PARA_SPLIT, new Any([n === 0], "bool"));
        break;
      case N.LN_CT_PPrBase_keepNext:
        this.insert(context, P.PROP_PARA_KEEP_TOGETHER, new Any([n !== 0], "bool"));
        break;
      case N.LN_CT_PPrBase_pageBreakBefore:
        this.insert(
          context,
          P.PROP_BREAK_TYPE,
          new Any([n ? BreakType.PAGE_BEFORE : BreakType.NONE], breakType),
          n !== 0,
        );
        break;
      case N.LN_CT_PPrBase_widowControl:
        this.insert(context, P.PROP_PARA_WIDOWS, new Any([n ? 2 : 0], "sal_Int8"));
        this.insert(context, P.PROP_PARA_ORPHANS, new Any([n ? 2 : 0], "sal_Int8"));
        break;
      case N.LN_CT_PPrBase_contextualSpacing:
        this.insert(context, P.PROP_PARA_CONTEXT_MARGIN, new Any([n !== 0], "bool"));
        break;
      case N.LN_CT_PPrBase_jc: {
        const adjust =
          n === N.LN_Value_ST_Jc_center
            ? A.CENTER
            : n === N.LN_Value_ST_Jc_right || n === N.LN_Value_ST_Jc_end
              ? A.END
              : n === N.LN_Value_ST_Jc_both || n === N.LN_Value_ST_Jc_distribute
                ? A.BLOCK
                : A.START;
        this.insert(context, P.PROP_PARA_ADJUST, new Any([adjust], adjustType));
        this.insert(
          context,
          P.PROP_PARA_LAST_LINE_ADJUST,
          new Any([n === N.LN_Value_ST_Jc_distribute ? A.BLOCK : A.LEFT], adjustType),
        );
        break;
      }
      case N.LN_EG_RPrBase_rFonts:
      case N.LN_EG_RPrBase_u:
      case N.LN_CT_PPrBase_ind:
      case N.LN_CT_PPrBase_spacing:
      case N.LN_CT_Style_rPr:
      case N.LN_CT_Style_pPr:
      case N.LN_CT_PPr_rPr: {
        modifier.getProps()?.resolve(this);
        break;
      }
    }
  }
}
