/** @fileoverview Native Calc cell-pattern itemset and canonical holder ownership;style/VCL/font/number caches and hash prefilters remain unported. */
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
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
/** Original lcl_populateresult conditional/table/direct precedence. Native final Get returns a reference,so its pointer result cannot be null under the item-pool precondition. @param which - Source color or brush identity. @param source - Actual base set. @param conditional - Optional conditional set. @param table - Optional table style. @returns Effective native item. */
function populateColorResult(
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
/** Original fixed cell-pattern schema,independent of the source set or pool ranges. */
export const aScPatternAttrSchema: WhichRangesContainer = [[ATTR_PATTERN_START, ATTR_PATTERN_END]];
/** Original C++ friendship over logical pattern registration fields;no public mutation API is invented. */
interface PatternFriend {
  mnRefCount: number;
}
/** Converts an optional native UTF16 style name to a value-key for the native name-group map. @param pattern - Actual pattern. @returns Name key or null. */
function styleKey(pattern: ScPatternAttr): string | null {
  const name = pattern.GetStyleName();
  if (name === null) return null;
  let key = "";
  const units = name.getStr();
  for (let i = 0; i < name.getLength(); i++) key += String.fromCharCode(units[i] as number);
  return key;
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
/** Original cell-pattern data owner over actual shared itemsets;style-sheet and rendering services are intentionally absent. */
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
    const item = populateColorResult(109, itemSet, conditional, table) as SvxColorItem,
      color = new Color(item.GetValue()),
      complex = new ComplexColor();
    complex.assign(item.getComplexColor());
    if (complex.getType() === ColorType.Unused) complex.setColor(color);
    if (
      (color.equals(COL_AUTO) && mode !== ScAutoFontColorMode.Raw) ||
      mode === ScAutoFontColorMode.IgnoreFont ||
      mode === ScAutoFontColorMode.IgnoreAll
    ) {
      const brush = populateColorResult(148, itemSet, conditional, table) as SvxBrushItem,
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
  private mnPAKey = 0n;
  private mnRefCount = 0;
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
  /** Original writable itemset borrow;render/font/number/hash caches are not represented in this data slice. @returns Actual set. */
  GetItemSetWritable(): SfxItemSet {
    return this.maLocalSfxItemSet;
  }
  /** Original unbound style-name borrow;ScStyleSheet resolution remains unported. @returns Name or null. */
  GetStyleName(): OUStringConstReference | null {
    return this.moName;
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
    this.maLocalSfxItemSet.Put(item);
  }
  /** Original direct item clearing. @param which - Item identity. @returns Nothing. */
  ItemSetClearItem(which: number): void {
    this.maLocalSfxItemSet.ClearItem(which);
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
        if (SfxPoolItem.areSame(item, oldSet.GetItemIfSet(which, true)))
          this.maLocalSfxItemSet.ClearItem(which);
      } else if (
        oldState !== SfxItemState.INVALID &&
        item.equals(this.maLocalSfxItemSet.GetPool().GetUserOrPoolDefaultItem(which))
      )
        this.maLocalSfxItemSet.ClearItem(which);
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
