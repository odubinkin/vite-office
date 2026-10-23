/** @fileoverview Native Calc cell-pattern itemsets,borrowed style inheritance and canonical holder lifecycle;Calc style-pool resolution,VCL/font/number caches and hash prefilters remain unported. */
import type { SfxStyleSheet } from "../../../../svl/inc/style";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { RTL_TEXTENCODING_SYMBOL } from "../../../../sal/inc/rtl/textenc";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import * as ATTR from "../../../inc/scitems";
import * as EE from "../../../../editeng/inc/eeitem";
import { SvxCellOrientation, SvxCellHorJustify, SvxAdjust } from "../../../../editeng/inc/svxenum";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxHorJustifyItem } from "../../../../editeng/inc/justifyitem";
import { SvxScriptSpaceItem } from "../../../../editeng/inc/scriptspaceitem";
import { SfxBoolItem } from "../../../../svl/inc/eitem";
import type { ScRotateValueItem } from "../../../inc/attrib";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
import { ATTR_PATTERN_START, ATTR_PATTERN_END } from "../../../inc/scitems";
import type { WhichRangesContainer } from "../../../../svl/inc/whichranges";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import {
  Color,
  COL_AUTO,
  COL_TRANSPARENT,
  COL_WHITE,
  COL_BLACK,
} from "../../../../tools/inc/color";
import { ComplexColor, ColorType } from "../../../../docmodel/inc/color/ComplexColor";
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { LANGUAGE_SYSTEM, type LanguageType } from "../../../../i18nlangtag/inc/lang";
import { SV_COUNTRY_LANGUAGE_OFFSET } from "../../../../svl/inc/zforlist";
import type { ScInterpreterContext } from "../../../inc/interpretercontext";
import { ScGlobal } from "../../../inc/global";
/** Original automatic-font color modes from patattr.hxx,co-located with the represented native owner. */
export enum ScAutoFontColorMode {
  Raw,
  Print,
  Display,
  IgnoreFont,
  IgnoreBack,
  IgnoreAll,
}
/** Borrowed values/presence from the native ambient configuration/view read sites. No ScModule,LOKit or SfxViewShell service is emulated by this binding. */
export interface ScPatternColorEnvironment {
  readonly isKitActive: boolean;
  readonly hasCurrentView: boolean;
  readonly currentCalcViewDocumentColor: Readonly<Color> | undefined;
  readonly documentColor: Readonly<Color>;
  readonly systemTextColor: Readonly<Color>;
  readonly rawSystemTextColor: Readonly<Color>;
}
/** Original lcl_populateresult conditional/table/direct precedence. Native final Get returns a reference,so its pointer result cannot be null under the item-pool precondition. @param which - Source attribute identity. @param source - Actual base set. @param conditional - Optional conditional set. @param table - Optional table style. @returns Effective native item. */
function populateResult(
  which: number,
  source: SfxItemSet,
  conditional: SfxItemSet | undefined,
  table: SfxItemSet | undefined,
): SfxPoolItem {
  let item = conditional?.GetItemIfSet(which);
  if (item === undefined && table !== undefined) {
    const direct = source.GetItemIfSet(which, false);
    if (
      source.GetItemState(which, false) === SfxItemState.SET &&
      !(direct as SfxPoolItem).equals(source.GetPool().GetUserOrPoolDefaultItem(which))
    ) {
      if (which === 109 && (source.Get(109) as SvxColorItem).getColor().equals(COL_BLACK))
        item = table.GetItemIfSet(which);
      else item = source.Get(which);
    } else item = table.GetItemIfSet(which);
  }
  return item ?? source.Get(which);
}
/** Original copied attributes. Table style participates only in color,family,height and weight;posture/effects/language retain source/conditional ownership. */
const editCopyItems: readonly (readonly [number, number, boolean])[] = [
  [ATTR.ATTR_FONT_COLOR, EE.EE_CHAR_COLOR, true],
  [ATTR.ATTR_FONT, EE.EE_CHAR_FONTINFO, true],
  [ATTR.ATTR_CJK_FONT, EE.EE_CHAR_FONTINFO_CJK, true],
  [ATTR.ATTR_CTL_FONT, EE.EE_CHAR_FONTINFO_CTL, true],
  [ATTR.ATTR_FONT_HEIGHT, EE.EE_CHAR_FONTHEIGHT, true],
  [ATTR.ATTR_CJK_FONT_HEIGHT, EE.EE_CHAR_FONTHEIGHT_CJK, true],
  [ATTR.ATTR_CTL_FONT_HEIGHT, EE.EE_CHAR_FONTHEIGHT_CTL, true],
  [ATTR.ATTR_FONT_WEIGHT, EE.EE_CHAR_WEIGHT, true],
  [ATTR.ATTR_CJK_FONT_WEIGHT, EE.EE_CHAR_WEIGHT_CJK, true],
  [ATTR.ATTR_CTL_FONT_WEIGHT, EE.EE_CHAR_WEIGHT_CTL, true],
  [ATTR.ATTR_FONT_UNDERLINE, EE.EE_CHAR_UNDERLINE, false],
  [ATTR.ATTR_FONT_OVERLINE, EE.EE_CHAR_OVERLINE, false],
  [ATTR.ATTR_FONT_WORDLINE, EE.EE_CHAR_WLM, false],
  [ATTR.ATTR_FONT_CROSSEDOUT, EE.EE_CHAR_STRIKEOUT, false],
  [ATTR.ATTR_FONT_POSTURE, EE.EE_CHAR_ITALIC, false],
  [ATTR.ATTR_CJK_FONT_POSTURE, EE.EE_CHAR_ITALIC_CJK, false],
  [ATTR.ATTR_CTL_FONT_POSTURE, EE.EE_CHAR_ITALIC_CTL, false],
  [ATTR.ATTR_FONT_CONTOUR, EE.EE_CHAR_OUTLINE, false],
  [ATTR.ATTR_FONT_SHADOWED, EE.EE_CHAR_SHADOW, false],
  [ATTR.ATTR_FORBIDDEN_RULES, EE.EE_PARA_FORBIDDENRULES, false],
  [ATTR.ATTR_FONT_EMPHASISMARK, EE.EE_CHAR_EMPHASISMARK, false],
  [ATTR.ATTR_FONT_RELIEF, EE.EE_CHAR_RELIEF, false],
  [ATTR.ATTR_FONT_LANGUAGE, EE.EE_CHAR_LANGUAGE, false],
  [ATTR.ATTR_CJK_FONT_LANGUAGE, EE.EE_CHAR_LANGUAGE_CJK, false],
  [ATTR.ATTR_CTL_FONT_LANGUAGE, EE.EE_CHAR_LANGUAGE_CTL, false],
  [ATTR.ATTR_HYPHENATE, EE.EE_PARA_HYPHENATE, false],
  [ATTR.ATTR_WRITINGDIR, EE.EE_PARA_WRITINGDIR, false],
];
/** Original reverse transfer intentionally excludes paragraph-only hyphenation,direction and forbidden rules. */
const reverseEditItems = editCopyItems.filter(
  /** Selects native GetFromEditItemSet attributes. @param pair - Source/destination pair. @returns Native reverse membership. */
  ([which]) =>
    which !== ATTR.ATTR_FORBIDDEN_RULES &&
    which !== ATTR.ATTR_HYPHENATE &&
    which !== ATTR.ATTR_WRITINGDIR,
);
/** Source script-height identities require absolute integral unit conversion rather than copied payloads. */
const editHeightWhichs = new Set<number>([
  ATTR.ATTR_FONT_HEIGHT,
  ATTR.ATTR_CJK_FONT_HEIGHT,
  ATTR.ATTR_CTL_FONT_HEIGHT,
]);
/** Original fixed cell-pattern schema,independent of the source set or pool ranges. */
export const aScPatternAttrSchema: WhichRangesContainer = [[ATTR_PATTERN_START, ATTR_PATTERN_END]];
/** Original C++ friendship over logical pattern registration fields;no public mutation API is invented. */
interface PatternFriend {
  mnRefCount: number;
}
/** Erased borrowed native base operations consumed by pattern association and rename. This is not a ScStyleSheet implementation or a replacement style pool. Actual shared native style objects supply these operations until the Calc subclass owner is ported. */
export type ScPatternStyleReference = Pick<SfxStyleSheet, "GetName" | "GetItemSet" | "SetName">;
/** Converts the native optional UTF16 map key by value without changing its owner. @param name - Borrowed name or absent style. @returns Optional value key. */
function styleNameKey(name: OUStringConstReference | null): string | null {
  if (name === null) return null;
  let key = "";
  const units = name.getStr();
  for (let i = 0; i < name.getLength(); i++) key += String.fromCharCode(units[i] as number);
  return key;
}
/** Reads the original optional name-group key. @param pattern - Native pattern. @returns Value key. */
function styleKey(pattern: ScPatternAttr): string | null {
  return styleNameKey(pattern.GetStyleName());
}
/** Original pool owner and canonical registration map;GC replaces deletion,while holder counts retain source identity/lifecycle semantics. */
export class CellAttributeHelper {
  private mpDefaultCellAttribute: ScPatternAttr | null = null;
  private readonly maRegisteredCellAttributes = new Map<string | null, Set<ScPatternAttr>>();
  private mpLastHit: ScPatternAttr | null = null;
  private mnCurrentMaxKey = 0n;
  /** Borrows the actual existing pool. @param mrSfxItemPool - Native pool owner. @returns Helper. */
  constructor(private readonly mrSfxItemPool: SfxItemPool) {}
  /** Original borrowed pool. @returns Actual pool. */
  GetPool(): SfxItemPool {
    return this.mrSfxItemPool;
  }
  /** Original lazy unnamed default branch before ScGlobal resource initialization;initialized style resources/document pools remain unported. @returns Canonical default. */
  getDefaultCellAttribute(): ScPatternAttr {
    if (this.mpDefaultCellAttribute === null) this.mpDefaultCellAttribute = new ScPatternAttr(this);
    return this.mpDefaultCellAttribute;
  }
  /** Original deletion detaches only patterns borrowing this exact style;unbound names and same-named other style objects are retained. @param style - Actual native style reference. @returns Nothing. */
  CellStyleDeleted(style: Pick<ScPatternStyleReference, "GetName">): void {
    const group = this.maRegisteredCellAttributes.get(styleNameKey(style.GetName()));
    if (group !== undefined)
      for (const pattern of group) if (pattern.GetStyleSheet() === style) pattern.StyleToName();
  }
  /** Original remove/rename/reinsert ordering,including failed rename retaining the actual old name. @param style - Actual native style reference. @param name - Requested name. @returns Nothing. */
  RenameCellStyle(style: ScPatternStyleReference, name: OUStringConstReference): void {
    const changed: ScPatternAttr[] = [],
      key = styleNameKey(style.GetName()),
      group = this.maRegisteredCellAttributes.get(key);
    if (group !== undefined) {
      for (const pattern of group)
        if (pattern.GetStyleSheet() === style) {
          changed.push(pattern);
          group.delete(pattern);
        }
      if (group.size === 0) this.maRegisteredCellAttributes.delete(key);
    }
    style.SetName(name);
    for (const pattern of changed) {
      const nameKey = styleKey(pattern),
        target = this.maRegisteredCellAttributes.get(nameKey);
      if (target === undefined) this.maRegisteredCellAttributes.set(nameKey, new Set([pattern]));
      else target.add(pattern);
    }
  }
  /** Original pool teardown preparation preserves owned names and drops itemset parents,then forces the default-pattern path. @returns Nothing. */
  AllStylesToNames(): void {
    for (const group of this.maRegisteredCellAttributes.values())
      for (const pattern of group) pattern.StyleToName();
    this.getDefaultCellAttribute().StyleToName();
  }
  /** Original canonical registration;hash filtering is an unported search optimization,all candidates still use full native equality. @param candidate - Native candidate. @param passingOwnership - Whether adopted. @returns Canonical pattern. */
  private registerAndCheck(candidate: ScPatternAttr, passingOwnership: boolean): ScPatternAttr {
    if (candidate === this.getDefaultCellAttribute()) return candidate;
    if (candidate.getCellAttributeHelper() !== this) throw new Error("WRONG CellAttributeHelper");
    if (candidate.isRegistered()) {
      if (passingOwnership) throw new Error("Already registered CellAttribute ownership change");
      (candidate as unknown as PatternFriend).mnRefCount++;
      return candidate;
    }
    let match = ScPatternAttr.areSame(this.mpLastHit, candidate) ? this.mpLastHit : null;
    const key = styleKey(candidate);
    const group = this.maRegisteredCellAttributes.get(key);
    if (match === null && group !== undefined) {
      for (const check of group)
        if (check.equals(candidate)) {
          match = check;
          break;
        }
    }
    if (match !== null) {
      (match as unknown as PatternFriend).mnRefCount++;
      if (passingOwnership) candidate.Dispose();
      this.mpLastHit = match;
      return match;
    }
    const registered = passingOwnership ? candidate : new ScPatternAttr(candidate);
    (registered as unknown as PatternFriend).mnRefCount++;
    registered.SetPAKey(this.mnCurrentMaxKey);
    this.mnCurrentMaxKey = BigInt.asUintN(64, this.mnCurrentMaxKey + 1n);
    if (group === undefined) this.maRegisteredCellAttributes.set(key, new Set([registered]));
    else group.add(registered);
    this.mpLastHit = registered;
    return registered;
  }
  /** Original release removes the last holder's canonical value and invalidates the single-entry cache. @param candidate - Registered pattern. @returns Nothing. */
  private doUnregister(candidate: ScPatternAttr): void {
    if (candidate === this.mpDefaultCellAttribute) return;
    if (!candidate.isRegistered()) throw new Error("Unregistered CellAttribute");
    (candidate as unknown as PatternFriend).mnRefCount--;
    if (candidate.isRegistered()) return;
    if (this.mpLastHit === candidate) this.mpLastHit = null;
    const key = styleKey(candidate);
    const group = this.maRegisteredCellAttributes.get(key) as Set<ScPatternAttr>;
    group.delete(candidate);
    if (group.size === 0) this.maRegisteredCellAttributes.delete(key);
    candidate.Dispose();
  }
}
/** Original cell-pattern owner over actual shared itemsets and borrowed native style operations;Calc style resolution and rendering services remain unported. */
export class ScPatternAttr {
  /** Original fillColor value algorithm with explicit borrowed ambient read-site values. Conditional/table lookup and raw/print/display modes retain source ordering. @param result - Destination complex value. @param itemSet - Actual cell items. @param mode - Original color mode. @param conditional - Optional conditional items. @param table - Optional table-style items. @param backConfig - Optional cached document color. @param textConfig - Optional cached font color. @param environment - Borrowed native configuration/view values. @returns Nothing. */
  static fillColor(
    result: ComplexColor,
    itemSet: SfxItemSet,
    mode: ScAutoFontColorMode,
    conditional: SfxItemSet | undefined,
    table: SfxItemSet | undefined,
    backConfig: Readonly<Color> | undefined,
    textConfig: Readonly<Color> | undefined,
    environment: ScPatternColorEnvironment,
  ): void {
    const item = populateResult(109, itemSet, conditional, table) as SvxColorItem,
      color = new Color(item.GetValue()),
      complex = new ComplexColor();
    complex.assign(item.getComplexColor());
    if (complex.getType() === ColorType.Unused) complex.setColor(color);
    if (
      (color.equals(COL_AUTO) && mode !== ScAutoFontColorMode.Raw) ||
      mode === ScAutoFontColorMode.IgnoreFont ||
      mode === ScAutoFontColorMode.IgnoreAll
    ) {
      const brush = populateResult(148, itemSet, conditional, table) as SvxBrushItem,
        back = new Color(brush.GetColor());
      if (
        back.equals(COL_TRANSPARENT) ||
        mode === ScAutoFontColorMode.IgnoreBack ||
        mode === ScAutoFontColorMode.IgnoreAll
      ) {
        if (!environment.isKitActive) {
          if (mode === ScAutoFontColorMode.Print) back.assign(COL_WHITE);
          else if (backConfig !== undefined) back.assign(backConfig);
          else back.assign(environment.documentColor);
        } else if (environment.currentCalcViewDocumentColor !== undefined)
          back.assign(
            mode === ScAutoFontColorMode.Print
              ? COL_WHITE
              : environment.currentCalcViewDocumentColor,
          );
      }
      const systemText = new Color();
      if (mode === ScAutoFontColorMode.Print) systemText.assign(COL_BLACK);
      else if (textConfig !== undefined) {
        systemText.assign(textConfig);
        if (environment.rawSystemTextColor.equals(COL_AUTO)) {
          if (back.IsDark() && systemText.IsDark()) systemText.assign(COL_WHITE);
          else systemText.assign(COL_BLACK);
        }
      } else systemText.assign(environment.systemTextColor);
      if (environment.hasCurrentView) color.assign(back.IsDark() ? COL_WHITE : COL_BLACK);
      else color.assign(systemText);
    }
    complex.setFinalColor(color);
    result.assign(complex);
  }
  private readonly maLocalSfxItemSet: SfxItemSet;
  private readonly pCellAttributeHelper: CellAttributeHelper;
  private moName: OUString | null;
  private pStyle: ScPatternStyleReference | null = null;
  private mnPAKey = 0n;
  private mnRefCount = 0;
  private mxNumberFormatKey: number | undefined;
  private mxLanguageType: LanguageType | undefined;
  /** Original helper/itemset/name and implicit-copy forms. INVALID entries are preserved. @param source - Helper or pattern. @param itemSet - Source deltas. @param styleName - Optional unbound style name. @returns Pattern. */
  constructor(
    source: CellAttributeHelper | ScPatternAttr,
    itemSet?: SfxItemSet,
    styleName?: OUStringConstReference,
  ) {
    if (source instanceof ScPatternAttr) {
      this.pCellAttributeHelper = source.pCellAttributeHelper;
      this.maLocalSfxItemSet = new SfxItemSet(source.maLocalSfxItemSet);
      this.moName = source.moName === null ? null : new OUString(source.moName);
      this.mnPAKey = source.mnPAKey;
      this.pStyle = source.pStyle;
      this.mxNumberFormatKey = source.mxNumberFormatKey;
      this.mxLanguageType = source.mxLanguageType;
    } else {
      this.pCellAttributeHelper = source;
      this.maLocalSfxItemSet = new SfxItemSet(source.GetPool(), aScPatternAttrSchema);
      this.moName = styleName === undefined ? null : new OUString(styleName);
      if (itemSet !== undefined) this.maLocalSfxItemSet.PutSet(itemSet, false);
    }
  }
  /** Original destructor precondition and owned value release. @returns Nothing. */
  Dispose(): void {
    if (this.isRegistered()) throw new Error("Referenced CellAttribute destruction");
    this.moName?.dispose();
    this.moName = null;
    this.maLocalSfxItemSet.ClearItem();
  }
  /** Original logical registration predicate. @returns Whether held. */
  isRegistered(): boolean {
    return this.mnRefCount !== 0;
  }
  /** Original canonical default identity predicate. @returns Whether default. */
  isDefault(): boolean {
    return this === this.pCellAttributeHelper.getDefaultCellAttribute();
  }
  /** Original helper borrow. @returns Actual helper. */
  getCellAttributeHelper(): CellAttributeHelper {
    return this.pCellAttributeHelper;
  }
  /** Original itemset borrow. @returns Actual set. */
  GetItemSet(): SfxItemSet {
    return this.maLocalSfxItemSet;
  }
  /** Original writable itemset borrow invalidates represented derived caches. @returns Actual set. */
  GetItemSetWritable(): SfxItemSet {
    this.InvalidateCaches();
    return this.maLocalSfxItemSet;
  }
  /** Original stored name takes precedence over the borrowed style name. @returns Native borrowed name or null. */
  GetStyleName(): OUStringConstReference | null {
    return this.moName ?? this.pStyle?.GetName() ?? null;
  }
  /** Original const style pointer borrow;this pattern does not own style lifetime. @returns Native style reference or null. */
  GetStyleSheet(): Pick<ScPatternStyleReference, "GetName"> | null {
    return this.pStyle;
  }
  /** Original inherited SET clearing and style-parent association. Native null detaches the pointer and parent but deliberately keeps an existing stored name. Represented derived caches are invalidated. @param style - Borrowed style or null. @param clearDirectFormat - Clear only fields SET by the style,including its parent chain. @returns Nothing. */
  SetStyleSheet(style: ScPatternStyleReference | null, clearDirectFormat = true): void {
    if (style !== null) {
      const styleSet = style.GetItemSet();
      if (clearDirectFormat)
        for (let which = ATTR_PATTERN_START; which <= ATTR_PATTERN_END; which++)
          if (styleSet.GetItemState(which) === SfxItemState.SET)
            this.maLocalSfxItemSet.ClearItem(which);
      this.maLocalSfxItemSet.SetParent(style.GetItemSet());
      this.pStyle = style;
      this.moName?.dispose();
      this.moName = null;
    } else {
      this.maLocalSfxItemSet.SetParent(undefined);
      this.pStyle = null;
    }
    this.InvalidateCaches();
  }
  /** Original deleted-style transition copies the name before detaching the borrowed style and parent. @returns Nothing. */
  StyleToName(): void {
    if (this.pStyle !== null) {
      this.moName?.dispose();
      this.moName = new OUString(this.pStyle.GetName());
      this.pStyle = null;
      this.maLocalSfxItemSet.SetParent(undefined);
      this.InvalidateCaches();
    }
  }
  /** Original direct/inherited font SET query,not the pool default. @returns Whether the effective explicitly set font uses the symbol encoding. */
  IsSymbolFont(): boolean {
    const font = this.maLocalSfxItemSet.GetItemIfSet(ATTR.ATTR_FONT) as SvxFontItem | undefined;
    return font !== undefined ? font.GetCharSet() === RTL_TEXTENCODING_SYMBOL : false;
  }
  /** Original full itemset equality including pool and parent identity. @param other - Compared pattern. @returns Equality. */
  equals(other: ScPatternAttr): boolean {
    if (this === other) return true;
    const left = this.GetStyleName(),
      right = other.GetStyleName();
    if (left !== right && (left === null || right === null || !left.equals(right))) return false;
    return this.maLocalSfxItemSet.Equals(other.maLocalSfxItemSet, true);
  }
  /** Original null-safe identity/value comparison. @param left - First pointer. @param right - Second pointer. @returns Equality. */
  static areSame(left: ScPatternAttr | null, right: ScPatternAttr | null): boolean {
    if (left === right) return true;
    if (left === null || right === null) return false;
    return left.equals(right);
  }
  /** Original standard/stacked/right-angle orientation;arbitrary rotation stays Standard. @param set - Source attributes. @param conditional - Optional override. @returns Orientation. */
  static GetCellOrientation(
    set: SfxItemSet,
    conditional: SfxItemSet | null = null,
  ): SvxCellOrientation {
    if ((ScPatternAttr.GetItem(ATTR.ATTR_STACKED, set, conditional) as SfxBoolItem).GetValue())
      return SvxCellOrientation.Stacked;
    const angle = (
      ScPatternAttr.GetItem(ATTR.ATTR_ROTATE_VALUE, set, conditional) as ScRotateValueItem
    ).GetValue();
    if (angle === 9000) return SvxCellOrientation.BottomUp;
    if (angle === 27000) return SvxCellOrientation.TopBottom;
    return SvxCellOrientation.Standard;
  }
  /** Borrows this pattern's original orientation. @param conditional - Optional source override. @returns Orientation. */
  GetCellOrientation(conditional: SfxItemSet | null = null): SvxCellOrientation {
    return ScPatternAttr.GetCellOrientation(this.maLocalSfxItemSet, conditional);
  }
  /** Original complete cell-to-edit attribute transfer. Concrete item clones preserve complex color,font and line payloads. @param edit - Actual EditEngine item set. @param source - Cell attributes. @param conditional - Conditional attributes. @param table - Table style. @returns Nothing. */
  static FillToEditItemSet(
    edit: SfxItemSet,
    source: SfxItemSet,
    conditional: SfxItemSet | null = null,
    table: SfxItemSet | null = null,
  ): void {
    // Native code reads/copies every input before the first destination mutation.
    const inputs = editCopyItems.map(
      /** Snapshots original scalars/copy values before any target Changed hook. @param pair - Source field. @returns Independent native input. */
      ([which, target, tableAware]) => {
        const effective = tableAware
          ? populateResult(which, source, conditional ?? undefined, table ?? undefined)
          : ScPatternAttr.GetItem(which, source, conditional);
        return { which, target, item: effective.Clone(source.GetPool()) as SfxPoolItem };
      },
    );
    for (const { which, target, item } of inputs) {
      if (editHeightWhichs.has(which))
        edit.Put(
          new SvxFontHeightItem(
            Number(convertTwipToMm100(BigInt((item as SvxFontHeightItem).GetHeight()))),
            100,
            target,
          ),
        );
      else if (which === ATTR.ATTR_FONT_COLOR && (item as SvxColorItem).GetValue().equals(COL_AUTO))
        edit.ClearItem(target);
      else if (which === ATTR.ATTR_HYPHENATE)
        edit.Put(new SfxBoolItem(target, (item as SfxBoolItem).GetValue()));
      else edit.PutAsTargetWhich(item, target);
    }
    // Original intentionally ignores the cell ATTR_SCRIPTSPACE value.
    edit.Put(new SvxScriptSpaceItem(false, EE.EE_PARA_ASIANCJKSPACING));
  }
  /** Original null-tolerant instance entry. @param edit - EditEngine destination. @param conditional - Conditional attributes. @param table - Table style. @returns Nothing. */
  FillEditItemSet(
    edit: SfxItemSet | null,
    conditional: SfxItemSet | null = null,
    table: SfxItemSet | null = null,
  ): void {
    if (edit !== null)
      ScPatternAttr.FillToEditItemSet(edit, this.maLocalSfxItemSet, conditional, table);
  }
  /** Original direct-or-inherited SET reverse transfer;default and INVALID attributes do not become direct cell formatting. @param destination - Cell set. @param edit - EditEngine source. @returns Nothing. */
  static GetFromEditItemSet(destination: SfxItemSet, edit: SfxItemSet): void {
    for (const [which, target] of reverseEditItems) {
      const item = edit.GetItemIfSet(target);
      if (item !== undefined) {
        if (editHeightWhichs.has(which))
          destination.Put(
            new SvxFontHeightItem(
              Number(
                convert(BigInt((item as SvxFontHeightItem).GetHeight()), Length.mm100, Length.twip),
              ),
              100,
              which,
            ),
          );
        else destination.PutAsTargetWhich(item, which);
      }
    }
    const adjust = edit.GetItemIfSet(EE.EE_PARA_JUST) as SvxAdjustItem | undefined;
    if (adjust === undefined) return;
    let value = SvxCellHorJustify.Standard;
    switch (adjust.GetAdjust()) {
      case SvxAdjust.Right:
      case SvxAdjust.End:
        value = SvxCellHorJustify.Right;
        break;
      case SvxAdjust.Block:
      case SvxAdjust.BlockLine:
        value = SvxCellHorJustify.Block;
        break;
      case SvxAdjust.Center:
        value = SvxCellHorJustify.Center;
        break;
    }
    if (value !== SvxCellHorJustify.Standard)
      destination.Put(new SvxHorJustifyItem(value, ATTR.ATTR_HOR_JUSTIFY));
  }
  /** Original null guard and mutation of the real cell item set invalidate represented caches. @param edit - Source or native null. @returns Nothing. */
  GetFromEditItemSet(edit: SfxItemSet | null): void {
    if (edit === null) return;
    ScPatternAttr.GetFromEditItemSet(this.maLocalSfxItemSet, edit);
    this.InvalidateCaches();
  }
  /** Original paragraph alignment entry is deliberately separate from FillEditItemSet. @param edit - Actual paragraph destination. @returns Nothing. */
  FillEditParaItems(edit: SfxItemSet): void {
    const horizontal = (
      this.maLocalSfxItemSet.Get(ATTR.ATTR_HOR_JUSTIFY) as SvxHorJustifyItem
    ).GetValue();
    let adjust = SvxAdjust.Left;
    switch (horizontal) {
      case SvxCellHorJustify.Right:
        adjust = SvxAdjust.Right;
        break;
      case SvxCellHorJustify.Center:
        adjust = SvxAdjust.Center;
        break;
      case SvxCellHorJustify.Block:
        adjust = SvxAdjust.Block;
        break;
    }
    edit.Put(new SvxAdjustItem(adjust, EE.EE_PARA_JUST));
  }
  /** Original conditional SET precedence including parent lookup. @param which - Item identity. @param itemSet - Base set. @param conditional - Optional conditional set. @returns Effective item. */
  static GetItem(
    which: number,
    itemSet: SfxItemSet,
    conditional: SfxItemSet | null = null,
  ): SfxPoolItem {
    if (conditional !== null && conditional.GetItemState(which, true) === SfxItemState.SET)
      return conditional.GetItemIfSet(which, true) as SfxPoolItem;
    return itemSet.Get(which);
  }
  /** Original effective item lookup. @param which - Item identity. @param conditional - Optional conditional set. @returns Effective item. */
  GetItem(which: number, conditional: SfxItemSet | null = null): SfxPoolItem {
    return ScPatternAttr.GetItem(which, this.maLocalSfxItemSet, conditional);
  }
  /** Original direct item insertion. @param item - Native item. @returns Nothing. */
  ItemSetPut(item: SfxPoolItem): void {
    this.InvalidateCacheFor(item.Which());
    this.maLocalSfxItemSet.Put(item);
  }
  /** Original direct item clearing. @param which - Item identity. @returns Nothing. */
  ItemSetClearItem(which: number): void {
    this.InvalidateCacheFor(which);
    this.maLocalSfxItemSet.ClearItem(which);
  }
  /** Original validity check treats mixed selection items as invalid. @returns Both number-format fields are valid. */
  HasValidNumberFormat(): boolean {
    return (
      this.maLocalSfxItemSet.GetItemState(146) !== SfxItemState.INVALID &&
      this.maLocalSfxItemSet.GetItemState(147) !== SfxItemState.INVALID
    );
  }
  /** Original lazy key cache is bypassed during threaded group calculation. @returns Effective format key. */
  GetNumberFormatKey(): number {
    if (this.mxNumberFormatKey === undefined) {
      const key = (this.maLocalSfxItemSet.Get(146) as SfxUInt32Item).GetValue();
      if (ScGlobal.bThreadedGroupCalcInProgress) return key;
      this.mxNumberFormatKey = key;
    }
    return this.mxNumberFormatKey;
  }
  /** Original independent language cache has the same threaded bypass. @returns Effective format language. */
  GetLanguageType(): LanguageType {
    if (this.mxLanguageType === undefined) {
      const language = (this.maLocalSfxItemSet.Get(147) as SvxLanguageItem).GetLanguage();
      if (ScGlobal.bThreadedGroupCalcInProgress) return language;
      this.mxLanguageType = language;
    }
    return this.mxLanguageType;
  }
  /** Original null-formatter and context default-format branches. Language conversion requires the unported formatter owner. @param context - Actual interpreter context or native null formatter. @returns Effective format key. */
  GetNumberFormat(context: ScInterpreterContext | null): number {
    const key = this.GetNumberFormatKey(),
      language = this.GetLanguageType();
    if ((key < SV_COUNTRY_LANGUAGE_OFFSET && language === LANGUAGE_SYSTEM) || context === null)
      return key;
    throw new Error("Number-format language conversion is not implemented");
  }
  /** Invalidates actual represented derived values;visibility/hash services remain unported. @returns Nothing. */
  InvalidateCaches(): void {
    this.mxNumberFormatKey = undefined;
    this.mxLanguageType = undefined;
  }
  /** Original per-item invalidation leaves the other cache intact. @param which - Changed attribute identity. @returns Nothing. */
  InvalidateCacheFor(which: number): void {
    if (which === 147) this.mxLanguageType = undefined;
    else if (which === 146) this.mxNumberFormatKey = undefined;
  }
  /** Original registration key assignment. @param key - Native uint64. @returns Nothing. */
  SetPAKey(key: bigint): void {
    this.mnPAKey = BigInt.asUintN(64, key);
  }
  /** Original key borrow. @returns Native uint64. */
  GetPAKey(): bigint {
    return this.mnPAKey;
  }
  /** Original selection delta reduction,retaining old INVALID values and comparing absent old items to real pool defaults. @param old - Old pattern. @returns Nothing. */
  DeleteUnchanged(old: ScPatternAttr): void {
    const oldSet = old.GetItemSet();
    for (let which = ATTR_PATTERN_START; which <= ATTR_PATTERN_END; which++) {
      if (this.maLocalSfxItemSet.GetItemState(which, false) !== SfxItemState.SET) continue;
      const item = this.maLocalSfxItemSet.GetItemIfSet(which, false) as SfxPoolItem;
      const oldState = oldSet.GetItemState(which, true);
      if (oldState === SfxItemState.SET) {
        if (SfxPoolItem.areSame(item, oldSet.GetItemIfSet(which, true))) {
          this.maLocalSfxItemSet.ClearItem(which);
          this.InvalidateCaches();
        }
      } else if (
        oldState !== SfxItemState.INVALID &&
        item.equals(this.maLocalSfxItemSet.GetPool().GetUserOrPoolDefaultItem(which))
      ) {
        this.maLocalSfxItemSet.ClearItem(which);
        this.InvalidateCaches();
      }
    }
  }
  /** Original zero-terminated direct SET query. @param whichIds - Native IDs ending at zero. @returns Whether any direct value is set. */
  HasItemsSet(whichIds: readonly number[]): boolean {
    for (const which of whichIds) {
      if (which === 0) break;
      if (this.maLocalSfxItemSet.GetItemState(which, false) === SfxItemState.SET) return true;
    }
    return false;
  }
  /** Original zero-terminated clearing. @param whichIds - Native IDs ending at zero. @returns Nothing. */
  ClearItems(whichIds: readonly number[]): void {
    for (const which of whichIds) {
      if (which === 0) break;
      this.maLocalSfxItemSet.ClearItem(which);
    }
    this.InvalidateCaches();
  }
}
/** Original canonical pattern holder with copy/move/assignment/destruction semantics. */
export class CellAttributeHolder {
  private mpScPatternAttr: ScPatternAttr | null = null;
  /** Original empty,pointer and copy constructors. @param source - Pattern or holder. @param passingOwnership - Whether pattern is adopted. @returns Holder. */
  constructor(source: ScPatternAttr | CellAttributeHolder | null = null, passingOwnership = false) {
    const pattern = source instanceof CellAttributeHolder ? source.getScPatternAttr() : source;
    if (pattern !== null) {
      // Literal-key access binds native CellAttributeHolder friendship without exposing the private helper methods.
      const helper = pattern.getCellAttributeHelper();
      this.mpScPatternAttr = helper["registerAndCheck"](pattern, passingOwnership);
    }
  }
  /** Original destructor release. @returns Nothing. */
  Dispose(): void {
    this.setScPatternAttr(null);
  }
  /** Original borrowed canonical pointer. @returns Pattern or null. */
  getScPatternAttr(): ScPatternAttr | null {
    return this.mpScPatternAttr;
  }
  /** Original operator! binding. @returns Absence. */
  not(): boolean {
    return this.mpScPatternAttr === null;
  }
  /** Original explicit bool binding. @returns Presence. */
  is(): boolean {
    return this.mpScPatternAttr !== null;
  }
  /** Original pointer identity equality for registered entries. @param other - Other holder. @returns Equality. */
  equals(other: CellAttributeHolder): boolean {
    return this.mpScPatternAttr === other.mpScPatternAttr;
  }
  /** Original copy assignment order,including self-assignment clearing. @param source - Source holder. @returns This holder. */
  assign(source: CellAttributeHolder): this {
    this.setScPatternAttr(null);
    const pattern = source.getScPatternAttr();
    if (pattern !== null)
      this.mpScPatternAttr = pattern.getCellAttributeHelper()["registerAndCheck"](pattern, false);
    return this;
  }
  /** Original unregister-before-register setter. @param pattern - New pointer. @param passingOwnership - Whether adopted. @returns Nothing. */
  setScPatternAttr(pattern: ScPatternAttr | null, passingOwnership = false): void {
    if (this.mpScPatternAttr !== null)
      this.mpScPatternAttr.getCellAttributeHelper()["doUnregister"](this.mpScPatternAttr);
    this.mpScPatternAttr = null;
    if (pattern !== null) {
      // Literal-key access binds native CellAttributeHolder friendship without exposing the private helper methods.
      const helper = pattern.getCellAttributeHelper();
      this.mpScPatternAttr = helper["registerAndCheck"](pattern, passingOwnership);
    }
  }
  /** Original move constructor transfers without registering. @param source - Moved holder. @returns New holder. */
  static move(source: CellAttributeHolder): CellAttributeHolder {
    const result = new CellAttributeHolder();
    result.mpScPatternAttr = source.mpScPatternAttr;
    source.mpScPatternAttr = null;
    return result;
  }
  /** Original move assignment swaps both owned pointers. @param source - Other holder. @returns This holder. */
  moveAssign(source: CellAttributeHolder): this {
    [this.mpScPatternAttr, source.mpScPatternAttr] = [source.mpScPatternAttr, this.mpScPatternAttr];
    return this;
  }
  /** Original nullable holder comparison. @param left - First pointer. @param right - Second pointer. @returns Equality. */
  static areSame(left: CellAttributeHolder | null, right: CellAttributeHolder | null): boolean {
    if (left === right) return true;
    if (left === null || right === null) return false;
    return left.equals(right);
  }
}
