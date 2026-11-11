/** @fileoverview Native SettingsTable scalar/format state, recursive resources and defaults. Full protection/compatibility grab bags and application to document/view/style owners remain unported. */
import type { DomainMapper } from "./DomainMapper";
import type { Id, Properties, Reference, Sprm, Table, Value } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { SvxZoomType } from "../../../../sfx2/inc/zoomitem";
import { resolveSprmProps } from "./util";
import { convertTwipToMm100_Limited } from "./ConversionHelper";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { unicode } from "../../core/unocore/unocrsrhelper";
/** Original source zoom token conversion, with PERCENT for unknown identities. @param type - Native resource token. @returns Native zoom kind. */
function lcl_GetZoomType(type: Id): number {
  switch (type) {
    case N.LN_Value_doc_ST_Zoom_fullPage:
      return SvxZoomType.WHOLEPAGE;
    case N.LN_Value_doc_ST_Zoom_bestFit:
      return SvxZoomType.PAGEWIDTH;
    case N.LN_Value_doc_ST_Zoom_textFit:
      return SvxZoomType.OPTIMAL;
    default:
      return SvxZoomType.PERCENT;
  }
}
/** Native settings state for consumed scalar and nested-resource families; no complete settings service/application is advertised. */
export class SettingsTable implements Properties, Table {
  private m_nDefaultTabStop = 720;
  private m_nZoomFactor = 0;
  private m_nZoomType = 0;
  private m_nView = 0;
  private m_nHyphenationZone = 360;
  private m_nConsecutiveHyphenLimit = 0;
  private m_oLinkStyles: boolean | undefined;
  private readonly m_sDecimalSymbol = unicode(".");
  private readonly m_sListSeparator = unicode(",");
  private m_bEvenAndOddHeaders = false;
  private m_bUsePrinterMetrics = false;
  private embedTrueTypeFonts = false;
  private embedSystemFonts = false;
  private m_bDoNotUseHTMLParagraphAutoSpacing = false;
  private m_bNoColumnBalance = false;
  private m_bSplitPgBreakAndParaMark = false;
  private m_bMirrorMargin = false;
  private m_bDisplayBackgroundShape = false;
  private m_bDoNotExpandShiftReturn = false;
  private m_bBalanceSingleByteDoubleByteWidth = false;
  private m_bNoHyphenateCaps = false;
  private m_bMsWordUlTrailSpace = false;
  private m_bLongerSpaceSequence = false;
  private m_bNoLeading = false;
  private m_bGutterAtTop = false;
  private m_bRecordChanges = false;
  private m_bDoNotVertAlignCellWithSp = false;
  private m_bAdjustLineHeightInTable = false;
  /** Native RTF opts into HTML spacing suppression and longer-space handling; OOXML keeps both false. Other native constructor service owners remain unported. @param mapper - Actual fully initialized mapper. @returns Settings owner. */
  constructor(mapper: DomainMapper) {
    if (mapper.IsRTFImport()) {
      this.m_bDoNotUseHTMLParagraphAutoSpacing = true;
      this.m_bLongerSpaceSequence = true;
    }
  }
  /** Original native entry callback. @param position - Entry position. @param reference - Actual properties. @returns Nothing. */
  entry(position: number, reference: Reference<Properties>): void {
    void position;
    reference.resolve(this);
  }
  /** Original scalar attribute conversions occur before dispatch, including unknown attributes. @param id - Resource ID. @param value - Actual value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    const integer = value.getInt(),
      string = value.getString();
    try {
      switch (id) {
        case N.LN_CT_Zoom_percent:
          this.m_nZoomFactor = (integer << 16) >> 16;
          break;
        case N.LN_CT_Zoom_val:
          this.m_nZoomType = lcl_GetZoomType(integer);
          break;
        case N.LN_CT_View_val:
          this.m_nView = integer >>> 0;
          break;
      }
    } finally {
      string.dispose();
    }
  }
  /** Original scalar/recursive modifier dispatch preserves native optional-link and sticky-compat rules. Unported grab-bag/protection families are not advertised. @param modifier - Actual native modifier. @returns Nothing. */
  sprm(modifier: Sprm): void {
    const id = modifier.getId(),
      value = modifier.getValue();
    const integer = value ? value.getInt() : 0,
      string = value ? value.getString() : unicode("");
    try {
      switch (id) {
        case N.LN_CT_Settings_zoom:
        case N.LN_CT_Settings_proofState:
        case N.LN_CT_Settings_attachedTemplate:
        case N.LN_CT_Settings_hdrShapeDefaults:
        case N.LN_CT_Settings_footnotePr:
        case N.LN_CT_Settings_endnotePr:
        case N.LN_CT_Settings_compat:
        case N.LN_CT_Settings_themeFontLang:
        case N.LN_CT_Settings_shapeDefaults:
        case N.LN_CT_Settings_view:
        case N.LN_CT_Settings_stylePaneFormatFilter:
          resolveSprmProps(this, modifier);
          if (id === N.LN_CT_Settings_attachedTemplate) this.m_oLinkStyles = false;
          break;
        case N.LN_CT_Settings_linkStyles:
          if (this.m_oLinkStyles === undefined) this.m_oLinkStyles = integer !== 0;
          break;
        case N.LN_CT_Settings_defaultTabStop:
          this.m_nDefaultTabStop = integer;
          break;
        case N.LN_CT_Settings_hyphenationZone:
          this.m_nHyphenationZone = (integer << 16) >> 16;
          break;
        case N.LN_CT_Settings_consecutiveHyphenLimit:
          this.m_nConsecutiveHyphenLimit = (integer << 16) >> 16;
          break;
        case N.LN_CT_Settings_decimalSymbol:
          this.m_sDecimalSymbol.assign(string);
          break;
        case N.LN_CT_Settings_listSeparator:
          this.m_sListSeparator.assign(string);
          break;
        case N.LN_CT_Settings_evenAndOddHeaders:
          this.m_bEvenAndOddHeaders = integer !== 0;
          break;
        case N.LN_CT_Compat_usePrinterMetrics:
          this.m_bUsePrinterMetrics = integer !== 0;
          break;
        case N.LN_CT_Settings_embedTrueTypeFonts:
          this.embedTrueTypeFonts = integer !== 0;
          break;
        case N.LN_CT_Settings_embedSystemFonts:
          this.embedSystemFonts = integer !== 0;
          break;
        case N.LN_CT_Compat_doNotUseHTMLParagraphAutoSpacing:
          this.m_bDoNotUseHTMLParagraphAutoSpacing = integer !== 0;
          break;
        case N.LN_CT_Compat_noColumnBalance:
          this.m_bNoColumnBalance = integer !== 0;
          break;
        case N.LN_CT_Compat_splitPgBreakAndParaMark:
          this.m_bSplitPgBreakAndParaMark = integer !== 0;
          break;
        case N.LN_CT_Settings_mirrorMargins:
          this.m_bMirrorMargin = integer !== 0;
          break;
        case N.LN_CT_Settings_displayBackgroundShape:
          this.m_bDisplayBackgroundShape = integer !== 0;
          break;
        case N.LN_CT_Compat_doNotExpandShiftReturn:
          this.m_bDoNotExpandShiftReturn = true;
          break;
        case N.LN_CT_Compat_balanceSingleByteDoubleByteWidth:
          this.m_bBalanceSingleByteDoubleByteWidth = true;
          break;
        case N.LN_CT_Settings_doNotHyphenateCaps:
          this.m_bNoHyphenateCaps = integer !== 0;
          break;
        case N.LN_CT_Compat_ulTrailSpace:
          this.m_bMsWordUlTrailSpace = true;
          break;
        case N.LN_CT_Settings_longerSpaceSequence:
          this.m_bLongerSpaceSequence = integer !== 0;
          break;
        case N.LN_CT_Compat_noLeading:
          this.m_bNoLeading = integer !== 0;
          break;
        case N.LN_CT_Settings_gutterAtTop:
          this.m_bGutterAtTop = integer !== 0;
          break;
        case N.LN_CT_Settings_trackRevisions:
          this.m_bRecordChanges = integer !== 0;
          break;
        case N.LN_CT_Compat_doNotVertAlignCellWithSp:
          this.m_bDoNotVertAlignCellWithSp = integer !== 0;
          break;
        case N.LN_CT_Compat_adjustLineHeightInTable:
          this.m_bAdjustLineHeightInTable = integer !== 0;
          break;
      }
    } finally {
      string.dispose();
    }
  }
  /** Original default tab conversion to mm100, including the native legacy ceiling. @returns Distance. */
  GetDefaultTabStop(): number {
    return convertTwipToMm100_Limited(this.m_nDefaultTabStop);
  }
  /** Original unset/false optional-link query. @returns Whether linked styles are enabled. */
  GetLinkStyles(): boolean {
    return this.m_oLinkStyles !== undefined && this.m_oLinkStyles;
  }
  /** Original stored native scalar. @returns Scalar. */
  GetZoomFactor(): number {
    return this.m_nZoomFactor;
  }
  /** Original stored native scalar. @returns Scalar. */
  GetZoomType(): number {
    return this.m_nZoomType;
  }
  /** Original stored native scalar. @returns Scalar. */
  GetView(): number {
    return this.m_nView;
  }
  /** Original stored native scalar. @returns Scalar. */
  GetHyphenationZone(): number {
    return this.m_nHyphenationZone;
  }
  /** Original stored native scalar. @returns Scalar. */
  GetConsecutiveHyphenLimit(): number {
    return this.m_nConsecutiveHyphenLimit;
  }
  /** Original stored settings flag. @returns Flag. */
  GetEvenAndOddHeaders(): boolean {
    return this.m_bEvenAndOddHeaders;
  }
  /** Original stored settings flag. @returns Flag. */
  GetUsePrinterMetrics(): boolean {
    return this.m_bUsePrinterMetrics;
  }
  /** Original stored settings flag. @returns Flag. */
  GetEmbedTrueTypeFonts(): boolean {
    return this.embedTrueTypeFonts;
  }
  /** Original stored settings flag. @returns Flag. */
  GetEmbedSystemFonts(): boolean {
    return this.embedSystemFonts;
  }
  /** Original stored settings flag. @returns Flag. */
  GetDoNotUseHTMLParagraphAutoSpacing(): boolean {
    return this.m_bDoNotUseHTMLParagraphAutoSpacing;
  }
  /** Original stored settings flag. @returns Flag. */
  GetNoColumnBalance(): boolean {
    return this.m_bNoColumnBalance;
  }
  /** Original stored settings flag. @returns Flag. */
  GetSplitPgBreakAndParaMark(): boolean {
    return this.m_bSplitPgBreakAndParaMark;
  }
  /** Original stored settings flag. @returns Flag. */
  GetMirrorMarginSettings(): boolean {
    return this.m_bMirrorMargin;
  }
  /** Original stored settings flag. @returns Flag. */
  GetDisplayBackgroundShape(): boolean {
    return this.m_bDisplayBackgroundShape;
  }
  /** Original stored settings flag. @returns Flag. */
  GetDoNotExpandShiftReturn(): boolean {
    return this.m_bDoNotExpandShiftReturn;
  }
  /** Original stored settings flag. @returns Flag. */
  GetBalanceSingleByteDoubleByteWidth(): boolean {
    return this.m_bBalanceSingleByteDoubleByteWidth;
  }
  /** Original stored settings flag. @returns Flag. */
  GetNoHyphenateCaps(): boolean {
    return this.m_bNoHyphenateCaps;
  }
  /** Original stored settings flag. @returns Flag. */
  GetMsWordUlTrailSpace(): boolean {
    return this.m_bMsWordUlTrailSpace;
  }
  /** Original stored settings flag. @returns Flag. */
  GetLongerSpaceSequence(): boolean {
    return this.m_bLongerSpaceSequence;
  }
  /** Original stored settings flag. @returns Flag. */
  GetNoLeading(): boolean {
    return this.m_bNoLeading;
  }
  /** Original stored settings flag. @returns Flag. */
  GetGutterAtTop(): boolean {
    return this.m_bGutterAtTop;
  }
  /** Original stored settings flag. @returns Flag. */
  GetRecordChanges(): boolean {
    return this.m_bRecordChanges;
  }
  /** Original stored settings flag. @returns Flag. */
  GetDoNotVertAlignCellWithSp(): boolean {
    return this.m_bDoNotVertAlignCellWithSp;
  }
  /** Original stored settings flag. @returns Flag. */
  GetAdjustLineHeightInTable(): boolean {
    return this.m_bAdjustLineHeightInTable;
  }
  /** Original borrowed decimal symbol. @returns Native string reference. */
  GetDecimalSymbol(): OUStringConstReference {
    return this.m_sDecimalSymbol;
  }
  /** Original borrowed list separator. @returns Native string reference. */
  GetListSeparator(): OUStringConstReference {
    return this.m_sListSeparator;
  }
  /** Destroys native owned string members once; the mapper is borrowed. @returns Nothing. */
  dispose(): void {
    this.m_sListSeparator.dispose();
    this.m_sDecimalSymbol.dispose();
  }
}
