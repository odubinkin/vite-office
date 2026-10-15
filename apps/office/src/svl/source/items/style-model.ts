/** @fileoverview Actual native style base/pool core owners and hints from style.cxx. Presentation/XML/UNO and derived SfxStyleSheet remain unimplemented; JS GC replaces physical native ownership, without a weak/refcount framework. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { SfxStyleFamily, SfxStyleSearchBits } from "../../inc/style";
import { SfxHint, SfxHintId } from "../../inc/hint";
import { SfxBroadcaster } from "../notify/SfxBroadcaster";
import { IndexedStyleSheets } from "./IndexedStyleSheets";
import { SfxStyleSheetIterator } from "./style";
import { SfxItemSet } from "./itemset";
import type { SfxItemPool } from "./itempool";

/** Original identity-bearing style notification. */
export class SfxStyleSheetHint extends SfxHint {
  /** Borrows the original caller-owned style. @param action - Hint ID. @param pStyleSh - Actual style. @returns Hint. */
  public constructor(
    action: SfxHintId,
    private readonly pStyleSh: SfxStyleSheetBase,
  ) {
    super(action);
  }
  /** Original style pointer. @returns Actual style. */
  public GetStyleSheet(): SfxStyleSheetBase {
    return this.pStyleSh;
  }
}
/** Original extended rename notification. */
export class SfxStyleSheetModifiedHint extends SfxStyleSheetHint {
  private readonly aName: OUString;
  /** Retains the old logical value. @param old - Previous name. @param style - Actual style. @returns Hint. */
  public constructor(old: OUStringConstReference, style: SfxStyleSheetBase) {
    super(SfxHintId.StyleSheetModifiedExtended, style);
    this.aName = new OUString(old);
  }
  /** Original old-name member. @returns Borrowed value. */
  public GetOldName(): OUStringConstReference {
    return this.aName;
  }
}
/** Original pool notification ID. */
export class SfxStyleSheetPoolHint extends SfxHint {
  /** Constructs native pool hint. @returns Hint. */
  public constructor() {
    super(SfxHintId.SfxStyleSheetPool);
  }
}

/** Native core style owner; original WeakImplHelper lifetime/UNO facets are not recreated as a JS memory manager. */
export class SfxStyleSheetBase {
  protected m_pPool: SfxStyleSheetBasePool;
  protected nFamily: SfxStyleFamily;
  protected readonly aName: OUString;
  protected readonly aParent: OUString;
  protected readonly aFollow: OUString;
  protected readonly aHelpFile: OUString;
  protected pSet: SfxItemSet | null;
  protected nMask: SfxStyleSearchBits;
  protected nHelpId: number;
  protected bMySet: boolean;
  protected bHidden: boolean;
  /** Native protected/friend constructors, public for host cross-class construction. @param args - Name/pool/family/mask/parent or copy. @returns Style. */
  public constructor(
    ...args:
      | [
          name: OUStringConstReference,
          pool: SfxStyleSheetBasePool,
          family: SfxStyleFamily,
          mask: SfxStyleSearchBits,
          parent?: OUStringConstReference | undefined,
        ]
      | [source: SfxStyleSheetBase]
  ) {
    const source = args[0];
    if (source instanceof SfxStyleSheetBase) {
      this.m_pPool = source.m_pPool;
      this.nFamily = source.nFamily;
      this.aName = new OUString(source.aName);
      this.aParent = new OUString(source.aParent);
      this.aFollow = new OUString(source.aFollow);
      this.aHelpFile = new OUString(source.aHelpFile);
      this.nMask = source.nMask;
      this.nHelpId = source.nHelpId;
      this.bMySet = source.bMySet;
      this.bHidden = source.bHidden;
      this.pSet = source.pSet ? (this.bMySet ? new SfxItemSet(source.pSet) : source.pSet) : null;
    } else {
      this.m_pPool = args[1] as SfxStyleSheetBasePool;
      this.nFamily = args[2] as SfxStyleFamily;
      this.aName = new OUString(source);
      this.aParent = args[4] === undefined ? new OUString() : new OUString(args[4]);
      this.aFollow = new OUString(source);
      this.aHelpFile = new OUString();
      this.pSet = null;
      this.nMask = args[3] as SfxStyleSearchBits;
      this.nHelpId = 0;
      this.bMySet = false;
      this.bHidden = false;
    }
  }
  /** Original stable name member. @returns Name. */
  public GetName(): OUStringConstReference {
    return this.aName;
  }
  /** Original name validation, child reparenting and optional index update. @param name - New name. @param reindex - Whether update immediately. @returns Whether accepted. */
  public SetName(name: OUStringConstReference, reindex = true): boolean {
    if (name.isEmpty()) return false;
    if (this.aName.equals(name)) return true;
    const old = new OUString(this.aName);
    try {
      const other = this.m_pPool.Find(name, this.nFamily);
      if (other && other !== this) return false;
      if (!this.aName.isEmpty()) this.m_pPool.ChangeParent(this.aName, name, this.nFamily, false);
      if (this.aFollow.equals(this.aName)) this.aFollow.assign(name);
      this.aName.assign(name);
      if (reindex) this.m_pPool.ReindexOnNameChange(this, old, name);
      this.m_pPool.Broadcast(new SfxStyleSheetModifiedHint(old, this));
      return true;
    } finally {
      old.dispose();
    }
  }
  /** Original stable parent member. @returns Parent. */
  public GetParent(): OUStringConstReference {
    return this.aParent;
  }
  /** Original parent validation and cycle walk; successful unchanged requests still broadcast. @param name - Parent name. @returns Whether accepted. */
  public SetParent(name: OUStringConstReference): boolean {
    if (name.equals(this.aName)) return false;
    if (!this.aParent.equals(name)) {
      let style = this.m_pPool.Find(name, this.nFamily);
      if (!name.isEmpty() && !style) return false;
      if (!this.aName.isEmpty())
        while (style) {
          if (style.GetName().equals(this.aName)) return false;
          style = this.m_pPool.Find(style.GetParent(), this.nFamily);
        }
      this.aParent.assign(name);
    }
    this.m_pPool.Broadcast(new SfxStyleSheetHint(SfxHintId.StyleSheetModified, this));
    return true;
  }
  /** Original stable follow member. @returns Follow. */
  public GetFollow(): OUStringConstReference {
    return this.aFollow;
  }
  /** Original follow validation and notification. @param name - Follow name. @returns Whether accepted. */
  public SetFollow(name: OUStringConstReference): boolean {
    if (!this.aFollow.equals(name)) {
      if (!this.m_pPool.Find(name, this.nFamily)) return false;
      this.aFollow.assign(name);
    }
    this.m_pPool.Broadcast(new SfxStyleSheetHint(SfxHintId.StyleSheetModified, this));
    return true;
  }
  /** Original parent pool. @returns Pool. */ public GetPool(): SfxStyleSheetBasePool {
    return this.m_pPool;
  }
  /** Original family. @returns Family. */ public GetFamily(): SfxStyleFamily {
    return this.nFamily;
  }
  /** Original mask. @returns Mask. */ public GetMask(): SfxStyleSearchBits {
    return this.nMask;
  }
  /** Original silent mask assignment. @param mask - Mask. @returns Nothing. */ public SetMask(
    mask: SfxStyleSearchBits,
  ): void {
    this.nMask = mask;
  }
  /** Original user-defined bit. @returns Flag. */ public IsUserDefined(): boolean {
    return Boolean(this.nMask & SfxStyleSearchBits.UserDefined);
  }
  /** Original visibility state. @returns Hidden. */ public IsHidden(): boolean {
    return this.bHidden;
  }
  /** Original visibility assignment broadcasts even when unchanged. @param value - Hidden state. @returns Nothing. */ public SetHidden(
    value: boolean,
  ): void {
    this.bHidden = value;
    this.m_pPool.Broadcast(new SfxStyleSheetHint(SfxHintId.StyleSheetModified, this));
  }
  /** Original default capability. @returns True. */ public HasFollowSupport(): boolean {
    return true;
  }
  /** Original default capability. @returns True. */ public HasParentSupport(): boolean {
    return true;
  }
  /** Original default capability. @returns False. */ public HasClearParentSupport(): boolean {
    return false;
  }
  /** Original default usage. @returns True. */ public IsUsed(): boolean {
    return true;
  }
  /** Original default used-by value. @returns Empty string. */ public GetUsedBy(): OUString {
    return new OUString();
  }
  /** Original dynamic type query. @returns False. */ public isScStyleSheet(): boolean {
    return false;
  }
  /** Original spotlight sentinel. @returns Minus one. */ public GetSpotlightId(): number {
    return -1;
  }
  /** Original help output assignment and ID. @param file - Caller output. @returns Help ID. */ public GetHelpId(
    file: OUString,
  ): number {
    file.assign(this.aHelpFile);
    return this.nHelpId;
  }
  /** Original silent help fields assignment. @param file - Help file. @param id - Native uint32 ID. @returns Nothing. */ public SetHelpId(
    file: OUStringConstReference,
    id: number,
  ): void {
    this.aHelpFile.assign(file);
    this.nHelpId = id >>> 0;
  }
  /** Original lazy owned item set from the real pool. @returns Actual set. */
  public GetItemSet(): SfxItemSet {
    if (!this.pSet) {
      this.pSet = new SfxItemSet(this.m_pPool.GetPool());
      this.bMySet = true;
    }
    return this.pSet;
  }
  /** Original by-value preview copy. @returns Independent value. */ public GetItemSetForPreview(): SfxItemSet {
    return new SfxItemSet(this.GetItemSet());
  }
  /** Explicit native base destructor boundary; GC owns physical set lifetime. Call once after the last logical use. @returns Nothing. */
  public Dispose(): void {
    if (this.bMySet) this.pSet = null;
    this.aName.dispose();
    this.aParent.dispose();
    this.aFollow.dispose();
    this.aHelpFile.dispose();
  }
}
/** Original private pool state; JS object references replace physical shared_ptr/unique_ptr storage. */
class SfxStyleSheetBasePool_Impl {
  public pIter: SfxStyleSheetIterator | null = null;
  public readonly mxIndexedStyleSheets = new IndexedStyleSheets();
}
/** Original cleanup notification for the core style classes, which do not implement XComponent. UNO component cleanup remains an unimplemented extension. */
class StyleSheetDisposerFunctor {
  /** Borrows actual pool. @param mPool - Pool. @param broadcast - Original destructor suppression flag. @returns Callback. */
  public constructor(
    private readonly mPool: SfxStyleSheetBasePool,
    private readonly broadcast = true,
  ) {}
  /** Original erase notification before collection slot clearing. @param style - Actual core style. @returns Nothing. */
  public Dispose(style: import("../../inc/style").SfxStyleSheetNameReference): void {
    if (this.broadcast)
      this.mPool.Broadcast(
        new SfxStyleSheetHint(SfxHintId.StyleSheetErased, style as SfxStyleSheetBase),
      );
  }
}
/** Actual native core indexed pool; full UNO, presentation/XML and derived SfxStyleSheet factories remain absent. */
export class SfxStyleSheetBasePool extends SfxBroadcaster {
  private readonly pImpl = new SfxStyleSheetBasePool_Impl();
  protected rPool: SfxItemPool;
  /** Original item-pool and pool-copy forms. @param source - Actual pool or copied style pool. @returns Pool. */
  public constructor(source: SfxItemPool | SfxStyleSheetBasePool) {
    super(source instanceof SfxStyleSheetBasePool ? source : undefined);
    this.rPool = source instanceof SfxStyleSheetBasePool ? source.rPool : source;
    if (source instanceof SfxStyleSheetBasePool) this.addPool(source);
  }
  /** Original owned item pool. @returns Pool. */ public GetPool(): SfxItemPool {
    return this.rPool;
  }
  /** Native protected friend view, public for host cross-class access. @returns Actual index. */ public GetIndexedStyleSheets(): IndexedStyleSheets {
    return this.pImpl.mxIndexedStyleSheets;
  }
  /** Original checked positional lookup. @param position - Index. @returns Style or null. */ protected GetStyleSheetByPositionInIndex(
    position: number,
  ): SfxStyleSheetBase | null {
    return this.GetIndexedStyleSheets().GetStyleSheetByPosition(
      position,
    ) as SfxStyleSheetBase | null;
  }
  /** Original cached iterator view. @returns Iterator or null. */ protected GetCachedIterator(): SfxStyleSheetIterator | null {
    return this.pImpl.pIter;
  }
  /** Original family/mask cache replacement. @param family - Family. @param mask - Mask. @returns Iterator. */
  private GetIterator_Impl(
    family: SfxStyleFamily,
    mask: SfxStyleSearchBits,
  ): SfxStyleSheetIterator {
    if (
      !this.pImpl.pIter ||
      this.pImpl.pIter.GetSearchMask() !== mask ||
      this.pImpl.pIter.GetSearchFamily() !== family
    )
      this.pImpl.pIter = this.CreateIterator(family, mask);
    return this.pImpl.pIter;
  }
  /** Original virtual iterator factory. @param family - Family. @param mask - Mask. @returns Actual iterator. */ public CreateIterator(
    family: SfxStyleFamily,
    mask = SfxStyleSearchBits.All,
  ): SfxStyleSheetIterator {
    return new SfxStyleSheetIterator(this, family, mask);
  }
  /** Original virtual style factories. @param args - Copy or native field constructor. @returns Actual style. */
  protected Create(
    ...args:
      | [source: SfxStyleSheetBase]
      | [
          name: OUStringConstReference,
          family: SfxStyleFamily,
          mask: SfxStyleSearchBits,
          parent: OUStringConstReference | undefined,
        ]
  ): SfxStyleSheetBase {
    return args[0] instanceof SfxStyleSheetBase
      ? new SfxStyleSheetBase(args[0])
      : new SfxStyleSheetBase(
          args[0],
          this,
          args[1] as SfxStyleFamily,
          args[2] as SfxStyleSearchBits,
          args[3],
        );
  }
  /** Original native storage operation, without invented creation notifications. @param style - Actual style. @returns Nothing. */ protected StoreStyleSheet(
    style: SfxStyleSheetBase,
  ): void {
    this.GetIndexedStyleSheets().AddStyleSheet(style);
  }
  /** Original mask-sensitive find-or-create. @param name - Name. @param family - Family. @param mask - Flags. @param parent - Parent. @returns Actual style. */
  public Make(
    name: OUStringConstReference,
    family: SfxStyleFamily,
    mask = SfxStyleSearchBits.All,
    parent?: OUStringConstReference | undefined,
  ): SfxStyleSheetBase {
    let style = new SfxStyleSheetIterator(this, family, mask).Find(
      name,
    ) as SfxStyleSheetBase | null;
    if (!style) {
      style = this.Create(name, family, mask, parent);
      this.StoreStyleSheet(style);
    }
    return style;
  }
  /** Original replacement copy, retaining the native copy constructor's pool reference. @param style - Source. @returns Nothing. */
  public Add(style: SfxStyleSheetBase): void {
    const old = new SfxStyleSheetIterator(this, style.GetFamily(), SfxStyleSearchBits.All).Find(
      style.GetName(),
    ) as SfxStyleSheetBase | null;
    if (old) this.Remove(old);
    const value = this.Create(style);
    this.GetIndexedStyleSheets().AddStyleSheet(value);
    this.Broadcast(new SfxStyleSheetHint(SfxHintId.StyleSheetChanged, value));
  }
  /** Original pointer insertion; native debug-only duplicate diagnostics do not change storage behavior. @param style - Actual style. @returns Nothing. */ public Insert(
    style: SfxStyleSheetBase,
  ): void {
    this.StoreStyleSheet(style);
  }
  /** Original erase/reparent/notification order, retaining caller-owned styles. @param style - Actual style or null. @returns Nothing. */
  public Remove(style: SfxStyleSheetBase | null): void {
    if (!style || !this.GetIndexedStyleSheets().RemoveStyleSheet(style)) return;
    this.ChangeParent(style.GetName(), style.GetParent(), style.GetFamily());
    this.Broadcast(new SfxStyleSheetHint(SfxHintId.StyleSheetErased, style));
  }
  /** Original per-slot erase notifications then index clear. @returns Nothing. */ public Clear(): void {
    this.GetIndexedStyleSheets().Clear(new StyleSheetDisposerFunctor(this));
  }
  /** Original native copy assignment. @param source - Source. @returns This pool. */ public assign(
    source: SfxStyleSheetBasePool,
  ): this {
    if (source !== this) {
      this.Clear();
      this.addPool(source);
    }
    return this;
  }
  /** Original operator+= binding, deliberately traversing the destination (CALC150). Nonempty-destination mutation has no promised native iterator outcome. @param source - Source. @returns This pool. */
  public addPool(source: SfxStyleSheetBasePool): this {
    if (source !== this)
      this.GetIndexedStyleSheets().ApplyToAllStyleSheets({
        /** Original callback. @param style - Style. @returns Nothing. */ DoIt: (style) =>
          this.Add(style as SfxStyleSheetBase),
      });
    return this;
  }
  /** Original cached first operation. @param family - Family. @param mask - Flags. @returns First style or null. */ public First(
    family: SfxStyleFamily,
    mask = SfxStyleSearchBits.All,
  ): SfxStyleSheetBase | null {
    return this.GetIterator_Impl(family, mask).First() as SfxStyleSheetBase | null;
  }
  /** Original cached next assertion. @returns Next style or null. */ public Next(): SfxStyleSheetBase | null {
    if (!this.pImpl.pIter) throw new Error("Next called without a previous First");
    return this.pImpl.pIter.Next() as SfxStyleSheetBase | null;
  }
  /** Original local iterator search leaves the cached traversal unchanged. @param name - Name. @param family - Family. @param mask - Flags. @returns Style or null. */ public Find(
    name: OUStringConstReference,
    family: SfxStyleFamily,
    mask = SfxStyleSearchBits.All,
  ): SfxStyleSheetBase | null {
    return new SfxStyleSheetIterator(this, family, mask).Find(name) as SfxStyleSheetBase | null;
  }
  /** Native protected/friend child-parent update; nonvirtual rename path assigns the actual field. @param old - Previous parent. @param name - New parent. @param family - Family. @param virtual - Whether call virtual SetParent. @returns Nothing. */
  public ChangeParent(
    old: OUStringConstReference,
    name: OUStringConstReference,
    family: SfxStyleFamily,
    virtual = true,
  ): void {
    for (let style = this.First(family); style; style = this.Next())
      if (style.GetParent().equals(old)) {
        if (virtual) style.SetParent(name);
        else (style as unknown as { aParent: OUString }).aParent.assign(name);
      }
  }
  /** Original full index rebuild. @returns Nothing. */ public Reindex(): void {
    this.GetIndexedStyleSheets().Reindex();
  }
  /** Original incremental rename update. @param style - Style. @param old - Old name. @param name - New name. @returns Nothing. */ public ReindexOnNameChange(
    style: SfxStyleSheetBase,
    old: OUStringConstReference,
    name: OUStringConstReference,
  ): void {
    this.GetIndexedStyleSheets().ReindexOnNameChange(style, old, name);
  }
  /** Original derived Dying, quiet Clear, then broadcaster-base Dying and detach. @returns Nothing. */ public override Dispose(): void {
    this.Broadcast(new SfxHint(SfxHintId.Dying));
    this.GetIndexedStyleSheets().Clear(new StyleSheetDisposerFunctor(this, false));
    super.Dispose();
  }
}
