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
  DFLT_ESC_SUPER,
  DFLT_ESC_SUB,
  MAX_ESC_POS,
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
import { WritingMode2 } from "../../../../offapi/com/sun/star/text/WritingMode2";
import { ParagraphPropertiesPropertyMap, PropertyMap, SectionPropertyMap } from "./PropertyMap";
import { DomainMapper_Impl, ContextType as C, PageMarElement as M } from "./DomainMapper_Impl";
import { convertTwipToMm100_Limited } from "./ConversionHelper";
import { LanguageTag } from "../../../../i18nlangtag/inc/languagetag";
import {
  Locale,
  cppu_detail_getUnoType_Locale as localeType,
} from "../../../../udkapi/com/sun/star/lang/Locale";
import { CellColorHandler } from "./CellColorHandler";
import { ApplyFrameAttribute } from "./DomainMapper.frame";
import { ThemeColorHandler } from "./ThemeColorHandler";
import { BorderHandler } from "./BorderHandler";
import { cppu_detail_getUnoType_BorderLine2 } from "../../../../offapi/com/sun/star/table/BorderLine2";

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
/** Represented paragraph border properties in the source dmapper. */
const paragraphBorderIds = new Map<number, readonly [P, P]>([
  [N.LN_CT_PBdr_top, [P.PROP_TOP_BORDER, P.PROP_TOP_BORDER_DISTANCE]],
  [N.LN_CT_PBdr_left, [P.PROP_LEFT_BORDER, P.PROP_LEFT_BORDER_DISTANCE]],
  [N.LN_CT_PBdr_bottom, [P.PROP_BOTTOM_BORDER, P.PROP_BOTTOM_BORDER_DISTANCE]],
  [N.LN_CT_PBdr_right, [P.PROP_RIGHT_BORDER, P.PROP_RIGHT_BORDER_DISTANCE]],
]);

/** Original highlight token order is contiguous in the generated resource model. */
const highlights = [
  0x000000, 0x0000ff, 0x00ffff, 0x00ff00, 0xff00ff, 0xff0000, 0xffff00, 0xffffff, 0x000080,
  0x008080, 0x008000, 0x800080, 0x800000, 0x808000, 0x808080, 0xc0c0c0, -1,
] as const;

/** Receives native property sets and paragraph/run groups; lifecycle state remains on the shell, outside this model mapper. */
export class DomainMapper implements Properties {
  readonly impl: DomainMapper_Impl;
  private readonly CT_PageSz = { w: 0, h: 0, orient: false };
  /** Borrows the destination's actual UNO-facing document. @param model - Canonical model supplier. @param documentType - Original explicit source format. @returns Mapper. */
  constructor(
    readonly model: SwXTextDocument,
    documentType: SourceDocumentType,
  ) {
    this.impl = new DomainMapper_Impl(this, model, documentType);
  }
  /** Original list context push forwards the actual level owner. @param properties - Native level map. @returns Nothing. */
  PushListProperties(properties: PropertyMap): void {
    this.impl.PushListProperties(properties);
  }
  /** Original list context pop does not destroy the borrowed level. @returns Nothing. */
  PopListProperties(): void {
    this.impl.PopProperties(C.CONTEXT_LIST);
  }
  /** Original source-format trait. @returns Whether RTF. */
  IsRTFImport(): boolean {
    return this.impl.IsRTFImport();
  }
  /** Original source-format trait. @returns Whether OOXML. */
  IsOOXMLImport(): boolean {
    return this.impl.IsOOXMLImport();
  }
  /** Original stylesheet phase query delegates to the actual mapper state. @returns Whether importing a style. */
  IsStyleSheetImport(): boolean {
    return this.impl.IsStyleSheetImport();
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
  /** Original numbering resource-table callback retains native import flags and manager ownership. Other table producers remain with their existing owners. @param id - Table identity. @param table - Native reference. @returns Nothing. */
  table(id: Id, table: Reference<import("../inc/dmapper/resourcemodel").Table>): void {
    this.impl.SetAnyTableImport(true);
    if (id === N.LN_settings_settings) table.resolve(this.impl.GetSettingsTable());
    else if (id === N.LN_NUMBERING) {
      this.impl.SetNumberingImport(true);
      table.resolve(this.impl.GetListTable());
      this.impl.GetListTable().CreateNumberingRules();
      this.impl.SetNumberingImport(false);
    }
    this.impl.SetAnyTableImport(false);
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
    if (
      context instanceof ParagraphPropertiesPropertyMap &&
      ApplyFrameAttribute(context.props(), id, n)
    )
      return;
    switch (id) {
      case N.LN_CT_LineNumber_countBy:
      case N.LN_CT_LineNumber_distance:
      case N.LN_CT_LineNumber_restart: {
        const section = this.impl.GetTopContextOfType(C.CONTEXT_SECTION);
        const settings = this.impl.GetLineNumberSettings();
        if (id === N.LN_CT_LineNumber_countBy) {
          this.impl.SetLineNumberSettings({ ...settings, nInterval: n });
          if (section instanceof SectionPropertyMap) section.SetLnnMod(n);
        } else if (id === N.LN_CT_LineNumber_distance) {
          this.impl.SetLineNumberSettings({
            ...settings,
            nDistance: convertTwipToMm100_Limited(n),
          });
          if (section instanceof SectionPropertyMap) section.SetdxaLnn(n);
        } else {
          this.impl.SetLineNumberSettings({
            ...settings,
            bRestartAtEachPage: n === N.LN_Value_ST_LineNumberRestart_newPage,
          });
          if (section instanceof SectionPropertyMap) section.SetLnc(n);
        }
        break;
      }
      case N.LN_CT_PageSz_w:
        this.CT_PageSz.w = PaperInfo.sloppyFitPageDimension(Number(convertTwipToMm100(BigInt(n))));
        break;
      case N.LN_CT_PageSz_h:
        this.CT_PageSz.h = PaperInfo.sloppyFitPageDimension(Number(convertTwipToMm100(BigInt(n))));
        break;
      case N.LN_CT_PageSz_orient:
        this.CT_PageSz.orient = n !== N.LN_Value_ST_PageOrientation_portrait;
        break;
      case N.LN_CT_PageMar_top:
        this.impl.SetPageMarginTwip(M.PAGE_MAR_TOP, n);
        break;
      case N.LN_CT_PageMar_right:
        this.impl.SetPageMarginTwip(M.PAGE_MAR_RIGHT, n);
        break;
      case N.LN_CT_PageMar_bottom:
        this.impl.SetPageMarginTwip(M.PAGE_MAR_BOTTOM, n);
        break;
      case N.LN_CT_PageMar_left:
        this.impl.SetPageMarginTwip(M.PAGE_MAR_LEFT, n);
        break;
      case N.LN_CT_PageMar_header:
        this.impl.SetPageMarginTwip(M.PAGE_MAR_HEADER, n);
        break;
      case N.LN_CT_PageMar_footer:
        this.impl.SetPageMarginTwip(M.PAGE_MAR_FOOTER, n);
        break;
      case N.LN_CT_PageMar_gutter:
        this.impl.SetPageMarginTwip(M.PAGE_MAR_GUTTER, n);
        break;
      case N.LN_CT_PageNumber_start: {
        const section = this.impl.GetTopContextOfType(C.CONTEXT_SECTION);
        if (section instanceof SectionPropertyMap) section.SetPageNumber(n);
        break;
      }
      case N.LN_CT_Language_val:
      case N.LN_CT_Language_eastAsia:
      case N.LN_CT_Language_bidi: {
        const string = value.getString();
        let locale: Locale;
        try {
          if (string.getLength() >= 1 && string.getLength() <= 3) {
            const tag = new LanguageTag(string).makeFallback();
            locale = tag.getLanguage().equals(string)
              ? new Locale(tag.getLocale())
              : LanguageTag.convertToLocale(string);
          } else locale = LanguageTag.convertToLocale(string);
          try {
            this.insert(
              context,
              id === N.LN_CT_Language_val
                ? P.PROP_CHAR_LOCALE
                : id === N.LN_CT_Language_eastAsia
                  ? P.PROP_CHAR_LOCALE_ASIAN
                  : P.PROP_CHAR_LOCALE_COMPLEX,
              new Any(locale, localeType),
            );
          } finally {
            locale.dispose();
          }
        } finally {
          string.dispose();
        }
        break;
      }
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
      case N.LN_CT_Ind_start: {
        const first = this.impl.getCurrentNumberingProperty("FirstLineIndent"),
          left = this.impl.getCurrentNumberingProperty("IndentAt"),
          amount = convertTwipToMm100_Limited(n);
        if (amount !== 0 && left === amount) break;
        if (first !== 0)
          this.insert(context, P.PROP_PARA_FIRST_LINE_INDENT, new Any([first], "sal_Int32"), false);
        this.insert(context, P.PROP_PARA_LEFT_MARGIN, new Any([amount], "sal_Int32"));
        break;
      }
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
        this.insert(
          context,
          P.PROP_PARA_LEFT_MARGIN,
          new Any([this.impl.getCurrentNumberingProperty("IndentAt")], "sal_Int32"),
          false,
        );
        break;
      case N.LN_CT_Ind_firstLine: {
        const first = this.impl.getCurrentNumberingProperty("FirstLineIndent"),
          amount = convertTwipToMm100_Limited(n);
        if (amount !== 0 && first === amount) break;
        this.insert(context, P.PROP_PARA_FIRST_LINE_INDENT, new Any([amount], "sal_Int32"));
        break;
      }
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
  /** Original deferred stylesheet boundary. @returns Nothing. */
  ProcessDeferredStyleCharacterProperties(): void {
    if (this.impl.GetTopContextType() !== C.CONTEXT_STYLESHEET)
      throw new Error("assert(CONTEXT_STYLESHEET)");
    this.impl.processDeferredCharacterProperties(false);
  }
  /** Original position calculation uses final native height, round-away-from-zero and source limits. @param properties - Current stream's deferred map. @param charContext - Whether the native caller requires a character context. @returns Nothing. */
  processDeferredCharacterProperties(
    properties: ReadonlyMap<number, Any>,
    charContext: boolean,
  ): void {
    if (charContext && this.impl.GetTopContextType() !== C.CONTEXT_CHARACTER)
      throw new Error("assert(CONTEXT_CHARACTER)");
    const context = this.impl.GetTopContext();
    if (!context) throw new Error("assert(context)");
    for (const [id, value] of [...properties].sort(
      /** Retains the native resource map order. @param a - First entry. @param b - Second entry. @returns Numeric comparison. */ (
        a,
        b,
      ) => a[0] - b[0],
    )) {
      if (id !== N.LN_EG_RPrBase_position) continue;
      const n: [number] = [0];
      value.extract(n, "sal_Int32");
      let position = 0;
      if (n[0]) {
        const height = this.impl.GetAnyProperty(P.PROP_CHAR_HEIGHT, context),
          size: [number] = [0];
        try {
          height.extract(size, "double");
        } finally {
          height.dispose();
        }
        position = size[0]
          ? Math.sign(n[0]) * Math.round(Math.abs((n[0] / 2 / size[0]) * 100))
          : n[0] > 0
            ? DFLT_ESC_SUPER
            : DFLT_ESC_SUB;
      }
      position = Math.max(-MAX_ESC_POS, Math.min(MAX_ESC_POS, position));
      this.insert(context, P.PROP_CHAR_ESCAPEMENT, new Any([position], "sal_Int16"));
      this.insert(context, P.PROP_CHAR_ESCAPEMENT_HEIGHT, new Any([n[0] ? 100 : 0], "sal_Int8"));
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
      case N.LN_CT_PrBase_pBdr:
        resolveReturnedReference(modifier.getProps(), this);
        break;
      case N.LN_CT_PBdr_top:
      case N.LN_CT_PBdr_left:
      case N.LN_CT_PBdr_bottom:
      case N.LN_CT_PBdr_right:
      case N.LN_CT_PBdr_between: {
        const properties = modifier.getProps();
        if (!properties) break;
        const handler = new BorderHandler(true);
        try {
          resolveReturnedReference(properties, handler);
          let edge = id;
          if (id === N.LN_CT_PBdr_between) {
            this.insert(context, P.PROP_PARA_CONNECT_BORDERS, new Any([false], "bool"));
            if (!this.impl.handlePreviousParagraphBorderInBetween()) break;
            edge = N.LN_CT_PBdr_top;
          }
          const ids = paragraphBorderIds.get(edge);
          if (!ids) break;
          this.insert(
            context,
            ids[0],
            new Any(handler.getBorderLine(), cppu_detail_getUnoType_BorderLine2),
          );
          this.insert(context, ids[1], new Any([handler.getLineDistance()], "sal_Int32"));
        } finally {
          handler.dispose();
        }
        break;
      }
      case N.LN_CT_PrBase_shd: {
        if (!context) break;
        const handler = new CellColorHandler();
        handler.setOutputFormat(CellColorHandler.Paragraph);
        try {
          resolveReturnedReference(modifier.getProps(), handler);
          const properties = handler.getProperties();
          try {
            // The represented RTF palette supplies resolved RGB and an automatic sentinel.
            for (const id of [P.PROP_FILL_STYLE, P.PROP_FILL_COLOR]) {
              const value = properties.getProperty(id)?.[1];
              if (!value) continue;
              try {
                context.Insert(id, value);
              } finally {
                value.dispose();
              }
            }
          } finally {
            properties.dispose();
          }
        } finally {
          handler.dispose();
        }
        break;
      }
      case N.LN_EG_SectPrContents_lnNumType: {
        resolveReturnedReference(modifier.getProps(), this);
        const section = this.impl.GetTopContextOfType(C.CONTEXT_SECTION);
        this.impl.ApplyLineNumberSettings(
          section instanceof SectionPropertyMap ? section : undefined,
        );
        break;
      }
      case N.LN_CT_PPrBase_framePr:
        if (context instanceof ParagraphPropertiesPropertyMap) context.props().SetFrameMode();
        resolveReturnedReference(modifier.getProps(), this);
        break;
      case N.LN_EG_SectPrContents_type: {
        const section = this.impl.GetTopContextOfType(C.CONTEXT_SECTION);
        if (
          section instanceof SectionPropertyMap &&
          (n !== N.LN_Value_ST_SectionMark_continuous ||
            this.impl.GetLastSectionContext() ||
            this.impl.GetParaSectpr())
        )
          section.SetBreakType(n);
        break;
      }
      case N.LN_CT_PPr_sectPr:
        this.impl.SetParaSectpr(true);
        resolveReturnedReference(modifier.getProps(), this);
        break;
      case N.LN_EG_SectPrContents_pgSz: {
        const letter = new PaperInfo(Paper.PAPER_LETTER);
        this.CT_PageSz.w = letter.getWidth();
        this.CT_PageSz.h = letter.getHeight();
        this.CT_PageSz.orient = false;
        resolveReturnedReference(modifier.getProps(), this);
        const section = this.impl.GetTopContextOfType(C.CONTEXT_SECTION);
        if (section instanceof SectionPropertyMap) {
          this.insert(section, P.PROP_HEIGHT, new Any([this.CT_PageSz.h], "sal_Int32"));
          this.insert(section, P.PROP_IS_LANDSCAPE, new Any([this.CT_PageSz.orient], "bool"));
          this.insert(section, P.PROP_WIDTH, new Any([this.CT_PageSz.w], "sal_Int32"));
        }
        break;
      }
      case N.LN_EG_SectPrContents_pgMar: {
        this.impl.InitPageMargins();
        resolveReturnedReference(modifier.getProps(), this);
        const section = this.impl.GetTopContextOfType(C.CONTEXT_SECTION);
        if (section instanceof SectionPropertyMap) {
          const margins = this.impl.GetPageMargins();
          section.SetTopMargin(margins.top);
          section.SetRightMargin(margins.right);
          section.SetBottomMargin(margins.bottom);
          section.SetLeftMargin(margins.left);
        }
        break;
      }
      case N.LN_EG_SectPrContents_textDirection: {
        let direction: number = WritingMode2.LR_TB;
        switch (n) {
          case N.LN_Value_ST_TextDirection_tbRl:
            direction = WritingMode2.TB_RL;
            break;
          case N.LN_Value_ST_TextDirection_btLr:
            direction = WritingMode2.BT_LR;
            break;
          case N.LN_Value_ST_TextDirection_tbRlV:
          case N.LN_Value_ST_TextDirection_tbLrV:
            direction = WritingMode2.TB_LR;
            break;
        }
        const section = this.impl.GetTopContextOfType(C.CONTEXT_SECTION);
        this.insert(section ?? context, P.PROP_WRITING_MODE, new Any([direction], "sal_Int16"));
        break;
      }
      case N.LN_EG_SectPrContents_pgNumType:
        resolveReturnedReference(modifier.getProps(), this);
        break;
      case N.LN_CT_PPrBase_bidi:
        // The original RTF path bypasses the OOXML/comment justification rewrite.
        // Those unrepresented source contexts are not simulated by this RTF handler.
        if (this.IsRTFImport()) {
          const parent = this.impl.GetPropertyFromParaStyleSheet(P.PROP_WRITING_MODE),
            parentBidi: [number] = [-1];
          try {
            parent.extract(parentBidi, "sal_Int16");
          } finally {
            parent.dispose();
          }
          this.insert(context, P.PROP_WRITING_MODE, new Any([n ? 1 : 0], "sal_Int16"));
        }
        break;
      case N.LN_CT_PPrBase_outlineLvl:
        if (n >= 0 && n <= 9) {
          if (this.IsStyleSheetImport() && context instanceof StyleSheetPropertyMap)
            context.SetOutlineLevel(n);
          else
            this.insert(context, P.PROP_OUTLINE_LEVEL, new Any([n === 9 ? 0 : n + 1], "sal_Int16"));
        }
        break;
      case N.LN_CT_NumPr_ilvl:
        if (n >= 0 && n < 10) {
          if (this.IsStyleSheetImport() && context instanceof StyleSheetPropertyMap)
            context.SetListLevel(n);
          if (!this.IsStyleSheetImport() || n !== 9)
            this.insert(context, P.PROP_NUMBERING_LEVEL, new Any([n], "sal_Int16"));
        }
        break;
      case N.LN_CT_NumPr_numId: {
        const list = this.impl.GetListTable().GetList(n);
        if (this.IsStyleSheetImport()) {
          if (context instanceof StyleSheetPropertyMap) context.props().SetListId(n);
        } else if (list) {
          this.insert(
            context,
            P.PROP_NUMBERING_RULES,
            new Any([list.GetNumberingRules() ?? null], ["Reference", indexReplaceType]),
          );
          context.Erase(P.PROP_NUMBERING_STYLE_NAME);
          const paragraph = this.impl.GetTopContextOfType(C.CONTEXT_PARAGRAPH);
          if (paragraph) {
            if (!(paragraph instanceof ParagraphPropertyMap))
              throw new Error("assert(ParagraphPropertyMap)");
            paragraph.props().SetListId(list.GetId());
          }
          context.Erase(P.PROP_PARA_FIRST_LINE_INDENT);
          context.Erase(P.PROP_PARA_LEFT_MARGIN);
          context.Erase(P.PROP_PARA_RIGHT_MARGIN);
        } else {
          this.insert(context, P.PROP_NUMBERING_STYLE_NAME, stringAny(""));
          this.insert(context, P.PROP_PARA_LEFT_MARGIN, new Any([0], "sal_Int32"), false);
          this.insert(context, P.PROP_PARA_FIRST_LINE_INDENT, new Any([0], "sal_Int32"), false);
        }
        break;
      }
      case N.LN_CT_PPrBase_numPr:
        resolveReturnedReference(modifier.getProps(), this);
        break;
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
      case N.LN_EG_RPrBase_kern:
        this.insert(context, P.PROP_CHAR_AUTO_KERNING, new Any([n !== 0], "bool"));
        break;
      case N.LN_EG_RPrBase_highlight: {
        if (
          this.impl.IsStyleSheetImport() &&
          this.impl.GetStyleSheetTable().GetCurrentEntry()?.m_nStyleTypeCode === StyleType.Character
        )
          break;
        if (this.IsRTFImport()) {
          this.insert(context, P.PROP_CHAR_HIGHLIGHT, new Any([n], "sal_Int32"));
          break;
        }
        const color = highlights[n - N.LN_Value_ST_HighlightColor_black];
        if (color !== undefined)
          this.insert(context, P.PROP_CHAR_HIGHLIGHT, new Any([color], "sal_Int32"));
        break;
      }
      case N.LN_EG_RPrBase_color: {
        const properties = modifier.getProps();
        if (properties) {
          const handler = new ThemeColorHandler();
          resolveReturnedReference(properties, handler);
          this.insert(context, P.PROP_CHAR_COLOR, new Any([handler.mnColor], "sal_Int32"));
        }
        break;
      }
      case N.LN_CT_PPrBase_pStyle: {
        const name = value?.getString();
        if (!name) break;
        try {
          const converted = this.impl.GetStyleSheetTable().ConvertStyleNameExt(text(name));
          this.impl.SetCurrentParaStyleName(converted);
          if (this.impl.GetTopContextType() !== C.CONTEXT_SECTION)
            this.insert(context, P.PROP_PARA_STYLE_NAME, stringAny(converted));
        } finally {
          name.dispose();
        }
        break;
      }
      case N.LN_EG_RPrBase_rStyle: {
        const name = value?.getString();
        if (!name) break;
        try {
          const table = this.impl.GetStyleSheetTable(),
            converted = table.ConvertStyleNameExt(text(name));
          if (
            table.FindStyleSheetByConvertedStyleName(converted)?.m_nStyleTypeCode ===
            StyleType.Character
          ) {
            this.insert(context, P.PROP_CHAR_STYLE_NAME, stringAny(converted));
          }
        } finally {
          name.dispose();
        }
        break;
      }
      case N.LN_EG_RPrBase_position:
        if (n) {
          if (!this.impl.IsStyleSheetImport() && this.impl.GetTopContextType() !== C.CONTEXT_LIST) {
            const position = new Any([n], "sal_Int32");
            try {
              this.impl.deferCharacterProperty(id, position);
            } finally {
              position.dispose();
            }
          } else if (!this.impl.IsDocDefaultsImport()) {
            const entry = this.impl.GetStyleSheetTable().GetCurrentEntry();
            if (entry?.m_nStyleTypeCode === StyleType.Paragraph && n < 0) {
              const position = new Any([n], "sal_Int32");
              try {
                this.impl.deferCharacterProperty(id, position);
              } finally {
                position.dispose();
              }
            } else {
              this.insert(
                context,
                P.PROP_CHAR_ESCAPEMENT,
                new Any([n > 0 ? DFLT_ESC_AUTO_SUPER : DFLT_ESC_AUTO_SUB], "sal_Int16"),
              );
              this.insert(
                context,
                P.PROP_CHAR_ESCAPEMENT_HEIGHT,
                new Any([DFLT_ESC_PROP], "sal_Int8"),
              );
            }
          }
        }
        break;
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
      case N.LN_EG_RPrBase_lang:
      case N.LN_EG_RPrBase_rFonts:
      case N.LN_EG_RPrBase_u:
      case N.LN_CT_PPrBase_ind:
      case N.LN_CT_PPrBase_spacing:
      case N.LN_CT_Style_rPr:
      case N.LN_CT_Style_pPr:
      case N.LN_CT_PPr_rPr: {
        resolveReturnedReference(modifier.getProps(), this);
        break;
      }
    }
  }
}

import { resolveReturnedReference } from "../inc/dmapper/resourcemodel";

import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";

import { StyleType } from "./StyleSheetTable";

import { StyleSheetPropertyMap } from "./PropertyMap";

import { cppu_detail_getUnoType as indexReplaceType } from "../../../../cppu/inc/com/sun/star/container/XIndexReplace";

import { ParagraphPropertyMap } from "./PropertyMap";

import { PaperInfo, Paper } from "../../../../i18nutil/inc/paper";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
