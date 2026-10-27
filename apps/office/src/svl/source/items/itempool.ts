/**
 * @fileoverview Reimplements the bounded default-item registry and item restoration responsibilities from pinned `svl/source/items/itempool.cxx`.
 */

import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { MapUnit } from "../../../tools/inc/mapunit";
import { SfxBroadcaster } from "../notify/SfxBroadcaster";
import { SfxHint, SfxHintId } from "../../inc/hint";
import { MergeRange } from "./itemset";
import { implCreateItemEntry, implCleanupItemEntry } from "./globalpool";
import type { WhichRangesContainer } from "../../inc/whichranges";

import { SfxPoolItem, type SfxPoolItemSnapshot, type SfxPoolItemValue } from "./poolitem";

/** Restores a concrete pooled item from its persisted primitive value. */
export type SfxPoolItemFactory = (value: SfxPoolItemValue) => SfxPoolItem;

/** Owns defaults and factories for the bounded WhichId space. */
export class SfxItemPool {
  private readonly aBC = new SfxBroadcaster();
  private readonly aName: OUString;
  private eDefMetric = MapUnit.MapCM;
  private mbShutdownHintSent = false;
  /** Original named/copy constructors; omitted name preserves the existing browser empty-name boundary. Native runtime registries are physical bookkeeping erased under GC. @param source - Native name or actual pool copy. @returns Pool. */
  public constructor(source?: OUStringConstReference | SfxItemPool) {
    if (source instanceof SfxItemPool) {
      this.aName = new OUString(source.aName);
      this.mnStart = source.mnStart;
      this.mnEnd = source.mnEnd;
      this.mpSlotIDToWhichIDMap = source.mpSlotIDToWhichIDMap;
      this.maItemInfos.push(...source.maItemInfos);
      for (const [which, info] of source.maUserItemInfos) this.maUserItemInfos.set(which, info);
      for (let index = 0; index < this.maItemInfos.length; ++index)
        this.maItemInfos[index] = this.impCheckItemInfoForClone(
          this.maItemInfos[index] as ItemInfo,
        );
      for (const [which, info] of this.maUserItemInfos)
        this.maUserItemInfos.set(which, this.impCheckItemInfoForClone(info));
      for (const [which, info] of source.registeredItemInfos)
        this.registeredItemInfos.set(which, this.impCheckItemInfoForClone(info));
      for (const [which, factory] of source.factories) this.factories.set(which, factory);
      this.eDefMetric = source.eDefMetric;
      if (source.mpSecondary) this.SetSecondaryPool(source.mpSecondary.Clone());
    } else {
      this.aName = source === undefined ? new OUString() : new OUString(source);
      this.eDefMetric = MapUnit.MapTwip;
    }
  }
  /** Original metadata-copy category dispatch; static defaults remain shared, dynamic defaults target the new owner. @param info - Actual source metadata. @returns Destination metadata. */
  protected impCheckItemInfoForClone(info: ItemInfo): ItemInfo {
    const item = info.getItem() as SfxPoolItem;
    if (item.isStaticDefault()) return info;
    if (item.isDynamicDefault()) return new ItemInfoDynamic(info, item.Clone(this));
    return new ItemInfoUser(info, this, item);
  }
  /** Original pool-copy factory; derived native factories may deliberately slice. @returns Independent pool. */
  public Clone(): SfxItemPool {
    return new SfxItemPool(this);
  }
  /** Original borrowed identifying name. @returns Stable name. */
  public GetName(): OUStringConstReference {
    return this.aName;
  }
  /** Original metric ignores WhichId. @param which - Native item identity. @returns Pool metric. */
  public GetMetric(which: number): MapUnit {
    void which;
    return this.eDefMetric;
  }
  /** Original mutable default metric. @param metric - New metric. @returns Nothing. */
  public SetDefaultMetric(metric: MapUnit): void {
    this.eDefMetric = metric;
  }
  /** Original notification owner, independently initialized on pool copy. @returns Actual broadcaster. */
  public BC(): SfxBroadcaster {
    return this.aBC;
  }
  /** Original once gate is set before synchronous delivery; merged ranges reset after delivery. GC controls physical reclamation. @returns Nothing. */
  public sendShutdownHint(): void {
    if (this.mbShutdownHintSent) return;
    this.mbShutdownHintSent = true;
    this.aBC.Broadcast(new SfxHint(SfxHintId.Dying));
    this.maPoolRanges = [];
  }
  private mpMaster: SfxItemPool = this;
  private mpSecondary: SfxItemPool | null = null;
  private maPoolRanges: WhichRangesContainer = [];
  /** Original master query. @returns Master pool. */
  public GetMasterPool(): SfxItemPool {
    return this.mpMaster;
  }
  /** Original secondary query. @returns Secondary or null. */
  public GetSecondaryPool(): SfxItemPool | null {
    return this.mpSecondary;
  }
  /** Original chain reassignment; cache invalidation is deliberately absent in upstream. Cyclic/two-master graphs violate native preconditions. @param pool - New secondary or null. @returns Nothing. */
  public SetSecondaryPool(pool: SfxItemPool | null): void {
    if (this.mpSecondary) {
      this.mpSecondary.mpMaster = this.mpSecondary;
      for (let p = this.mpSecondary.mpSecondary; p; p = p.mpSecondary)
        p.mpMaster = this.mpSecondary;
    }
    if (pool && pool.mpMaster !== pool) throw new Error("Secondary is present in two Pools");
    const master = this.GetMasterPool();
    for (let p = pool; p; p = p.mpSecondary) p.mpMaster = master;
    this.mpSecondary = pool;
  }
  /** Original terminal pool traversal. @returns Last pool. */
  public GetLastPoolInChain(): SfxItemPool {
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- Original mutable pool-chain traversal cursor, not a captured callback context.
    let last: SfxItemPool = this;
    while (last.GetSecondaryPool()) last = last.GetSecondaryPool() as SfxItemPool;
    return last;
  }
  /** Original lazy range union across actual registered pool metadata. Browser snapshot defaults do not invent native range metadata. @returns Cached logical value. */
  public GetMergedIdRanges(): WhichRangesContainer {
    if (this.maPoolRanges.length === 0)
      // eslint-disable-next-line @typescript-eslint/no-this-alias -- Original chain traversal starts at this pool and advances to each secondary.
      for (let p: SfxItemPool | null = this; p; p = p.mpSecondary)
        this.maPoolRanges = MergeRange(this.maPoolRanges, p.mnStart, p.mnEnd);
    return this.maPoolRanges;
  }
  /** Original local-first WhichId owner lookup. @param which - Native identity. @returns Owner or null. */
  private getTargetPool(which: number): SfxItemPool | null {
    if (
      this.IsInRange(which) ||
      (this.maItemInfos.length === 0 && this.registeredItemInfos.has(which))
    )
      return this;
    return this.mpSecondary?.getTargetPool(which) ?? null;
  }
  private readonly registeredItemInfos = new Map<number, ItemInfo>();
  private readonly factories = new Map<number, SfxPoolItemFactory>();
  private readonly maItemInfos: ItemInfo[] = [];
  private readonly maUserItemInfos = new Map<number, ItemInfo>();
  private mnStart = 0;
  private mnEnd = 0;
  private mpSlotIDToWhichIDMap: ReadonlyMap<number, number> | undefined;

  /** Original single-pool package registration; the default callable is empty until a missing item requires it. Original debug preconditions receive host errors. @param rPackage - Actual attribute metadata package. @param callback - Optional missing-default constructor. @returns Nothing. */
  public registerItemInfoPackage(
    rPackage: ItemInfoPackage,
    callback?: (which: number) => SfxPoolItem | null,
  ): void {
    if (this.maItemInfos.length !== 0)
      throw new Error("Only one ItemInfoPackage may be registered per pool.");
    if (rPackage.size() === 0) throw new Error("An ItemInfoPackage must not be empty.");
    for (let index = 0; index < rPackage.size(); ++index) {
      const info = rPackage.getItemInfo(index, this);
      if (info.getItem() !== null) this.maItemInfos.push(info);
      else {
        if (callback === undefined) throw new Error("Missing dynamic-default callback.");
        const item = callback(info.getWhich());
        if (item === null) throw new Error("Missing dynamic-default item.");
        this.maItemInfos.push(new ItemInfoDynamic(info, item));
      }
    }
    this.mnStart = (this.maItemInfos[0] as ItemInfo).getWhich();
    this.mnEnd = (this.maItemInfos[this.maItemInfos.length - 1] as ItemInfo).getWhich();
    this.mpSlotIDToWhichIDMap = rPackage.getSlotIDToWhichIDMap();
    for (let index = 1; index < this.maItemInfos.length; ++index)
      if (
        (this.maItemInfos[index - 1] as ItemInfo).getWhich() + 1 !==
        (this.maItemInfos[index] as ItemInfo).getWhich()
      )
        throw new Error("ItemInfoPackage entries must have contiguous ordered WhichIds.");
  }
  /** Original first registered WhichId, initially zero. @returns First identity. */
  public GetFirstWhich(): number {
    return this.mnStart;
  }
  /** Original last registered WhichId, initially zero. @returns Last identity. */
  public GetLastWhich(): number {
    return this.mnEnd;
  }
  /** Original inclusive range test. @param which - Candidate native unsigned16 identity. @returns Whether in the local range. */
  public IsInRange(which: number): boolean {
    return which >= this.mnStart && which <= this.mnEnd;
  }
  /** Original slot-category predicate. @param id - Native unsigned16 identity. @returns Whether nonzero and above SFX_WHICH_MAX. */
  public static IsSlot(id: number): boolean {
    return id !== 0 && id > 4999;
  }
  /** Original slot-map lookup and identity fallback through the original secondary chain. @param slot - Candidate slot. @param deep - Native secondary-chain search flag. @returns Which or the unchanged input. */
  public GetWhichIDFromSlotID(slot: number, deep = true): number {
    if (!SfxItemPool.IsSlot(slot)) return slot;
    const which = this.mpSlotIDToWhichIDMap?.get(slot);
    if (which !== undefined) return which;
    if (this.mpSecondary && deep) return this.mpSecondary.GetWhichIDFromSlotID(slot);
    return slot;
  }
  /** Original chain-aware Which-to-slot conversion and identity fallback. @param which - Native identity. @returns Registered nonzero slot or unchanged identity. */
  public GetSlotId(which: number): number {
    if (!SfxItemPool.IsWhich(which)) return which;
    const target = this.getTargetPool(which),
      info = target?.getItemInfo(which);
    if (info === undefined) throw new Error("Unknown WhichId for slot lookup.");
    const slot = info.getSlotID();
    return slot !== 0 ? slot : which;
  }

  /** Registers a consumed native default and its original ItemInfo slot field independently of optional browser snapshot restoration. Complete native packages retain their own original registration path. @param item - Default item. @param factory - Optional concrete restore function. @param slot - Original ItemInfo slot, zero when unmapped. @param flags - Original ItemInfo flags. @returns Nothing. */
  public RegisterDefaultItem(
    item: SfxPoolItem,
    factory?: SfxPoolItemFactory,
    slot = 0,
    flags = 0,
  ): void {
    if (this.registeredItemInfos.has(item.Which()))
      throw new Error(`Duplicate pool default: ${item.Which()}`);
    if (slot !== 0 && this.mpSlotIDToWhichIDMap?.has(slot))
      throw new Error(`Duplicate pool slot: ${slot}`);
    this.registeredItemInfos.set(
      item.Which(),
      new ItemInfoStatic(item.Which(), item.Clone(), slot, flags),
    );
    if (factory !== undefined) this.factories.set(item.Which(), factory);
    if (slot !== 0) {
      const mapping = new Map(this.mpSlotIDToWhichIDMap);
      mapping.set(slot, item.Which());
      this.mpSlotIDToWhichIDMap = mapping;
    }
  }

  /** Binds either original contiguous package entries or consumed per-entry registrations to the same actual ItemInfo objects. @param which - Native identity. @returns Entry or absent. */
  private getItemInfo(which: number): ItemInfo | undefined {
    return this.maItemInfos.length === 0
      ? this.registeredItemInfos.get(which)
      : this.maItemInfos[which - this.mnStart];
  }
  /** Replaces metadata at its existing registration owner without constructing another user-default state machine. @param which - Identity. @param info - Native metadata. @returns Nothing. */
  private replaceItemInfo(which: number, info: ItemInfo): void {
    if (this.maItemInfos.length === 0) this.registeredItemInfos.set(which, info);
    else this.maItemInfos[which - this.mnStart] = info;
  }
  /** Original pool default ignores any current user override and returns the saved static/dynamic metadata value. @param which - Known identity. @returns Original pool item. */
  public GetPoolDefaultItem(which: number): SfxPoolItem {
    const saved = this.maUserItemInfos.get(which);
    if (saved !== undefined) return saved.getItem() as SfxPoolItem;
    const item = this.getItemInfo(which)?.getItem() ?? undefined;
    if (item === undefined && this.mpSecondary) return this.mpSecondary.GetPoolDefaultItem(which);
    if (item === undefined) throw new Error(`Unknown pool default: ${which}`);
    return item;
  }
  /** Original first override retains the actual previous metadata before constructing the new user entry. @param item - New default. @returns Nothing. */
  private impCreateUserDefault(item: SfxPoolItem): void {
    const which = item.Which(),
      info = this.getItemInfo(which);
    if (info === undefined) throw new Error("Missing original ItemInfo for user default");
    this.maUserItemInfos.set(which, info);
    this.replaceItemInfo(which, new ItemInfoUser(info, this, item));
  }
  /** Original restore operation; native end-iterator/no-default is an ordinary absent Map entry. GC owns replaced entries. @param which - Original identity. @returns Nothing. */
  private impClearUserDefault(which: number): void {
    const saved = this.maUserItemInfos.get(which);
    if (saved === undefined) return;
    const current = this.getItemInfo(which);
    this.replaceItemInfo(which, saved);
    if (current instanceof ItemInfoUser) current.Dispose();
  }
  /** Original native user-default create/equal-noop/replace behavior in the target pool. @param item - Actual caller value. @returns Nothing. */
  public SetUserDefaultItem(item: SfxPoolItem): void {
    const target = this.getTargetPool(item.Which());
    if (target === null) throw new Error("Unknown WhichId for user default");
    const which = item.Which();
    if (!target.maUserItemInfos.has(which)) {
      target.impCreateUserDefault(item);
      return;
    }
    const info = target.getItemInfo(which) as ItemInfo;
    if (SfxPoolItem.areSame(info.getItem(), item)) return;
    target.replaceItemInfo(which, new ItemInfoUser(info, target, item));
    if (info instanceof ItemInfoUser) info.Dispose();
  }
  /** Original optional current override lookup, independent of the saved original pool item. @param which - Known native identity. @returns Override or null. */
  public GetUserDefaultItem(which: number): SfxPoolItem | null {
    const target = this.getTargetPool(which);
    if (target === null) throw new Error("Unknown WhichId for user default");
    if (!target.maUserItemInfos.has(which)) return null;
    return (target.getItemInfo(which) as ItemInfo).getItem();
  }
  /** Original restore/remove semantics; repeated reset is a no-op. Native redundant iterator guards fold into one Map lookup. @param which - Known identity. @returns Nothing. */
  public ResetUserDefaultItem(which: number): void {
    const target = this.getTargetPool(which);
    if (target === null) throw new Error("Unknown WhichId for user default");
    target.impClearUserDefault(which);
    target.maUserItemInfos.delete(which);
  }

  /** Returns the effective current user or pool default for one WhichId. @param which - Registered item identity. @returns Pool default item. */
  public GetUserOrPoolDefaultItem(which: number): SfxPoolItem {
    const item = this.getItemInfo(which)?.getItem() ?? undefined;
    if (item === undefined && this.mpSecondary)
      return this.mpSecondary.GetUserOrPoolDefaultItem(which);
    if (item === undefined) throw new Error(`Unknown pool default: ${which}`);
    return item;
  }

  /** Restores a concrete item through the factory registered for its WhichId. @param snapshot - Persisted item record. @returns Restored item. */
  public CreateItem(snapshot: SfxPoolItemSnapshot): SfxPoolItem {
    const factory = this.factories.get(snapshot.which);
    if (factory === undefined) throw new Error(`Unknown pooled item snapshot: ${snapshot.which}`);
    const item = factory(snapshot.value);
    if (item.Which() !== snapshot.which)
      throw new Error("Pooled item factory changed the WhichId.");
    return item;
  }

  /** Classifies the native WhichId category independently of registered defaults. @param which - Candidate item identity. @returns True for nonzero IDs through SFX_WHICH_MAX. */
  public static IsWhich(which: number): boolean {
    return which !== 0 && which <= 4999;
  }
}

/** Original zero item-info flags. */
export const SFX_ITEMINFOFLAG_NONE = 0x0000;
/** Original flag requesting surrogate support; registration of surrogates is separately unported. */
export const SFX_ITEMINFOFLAG_SUPPORT_SURROGATE = 0x0001;
/** Compiler-only access for the two native ItemInfo friends of SfxPoolItem. This creates no runtime adapter or public setter. */
interface DefaultItemFriend {
  /** Native protected static-default setter. @returns Nothing. */
  setStaticDefault(): void;
  /** Native protected dynamic-default setter. @returns Nothing. */
  setDynamicDefault(): void;
}
/** Original abstract item metadata, whose three fields have unsigned16 value semantics. */
export abstract class ItemInfo {
  private readonly m_nWhich: number;
  private readonly m_nSlotID: number;
  private readonly m_nItemInfoFlags: number;
  /** Original field and implicit-copy constructors. @param args - Which/slot/flags or const metadata source. @returns Metadata. */
  constructor(
    ...args: [which: number, slot: number, flags: number] | [source: Readonly<ItemInfo>]
  ) {
    const source = args[0];
    this.m_nWhich = (typeof source === "number" ? source : source.getWhich()) & 0xffff;
    this.m_nSlotID =
      (typeof source === "number" ? (args[1] as number) : source.getSlotID()) & 0xffff;
    this.m_nItemInfoFlags =
      (typeof source === "number" ? (args[2] as number) : source.getItemInfoFlags()) & 0xffff;
  }
  /** Original metadata identity. @returns Unsigned WhichId. */
  public getWhich(): number {
    return this.m_nWhich;
  }
  /** Original default-item pointer query. @returns Borrowed default or null. */
  public abstract getItem(): SfxPoolItem | null;
  /** Original slot identity. @returns Unsigned slot. */
  public getSlotID(): number {
    return this.m_nSlotID;
  }
  /** Original metadata flags. @returns Unsigned flag bits. */
  public getItemInfoFlags(): number {
    return this.m_nItemInfoFlags;
  }
}
/** Original static metadata/default entry. JS references replace unique_ptr storage without recreating deletion. */
export class ItemInfoStatic extends ItemInfo {
  private m_pItem: SfxPoolItem | null;
  /** Original Which/item/slot/flags constructor retaining actual default identity. @param which - Native WhichId. @param item - Actual nullable default. @param slot - Native slot. @param flags - Native metadata flags. @returns Entry. */
  constructor(which: number, item: SfxPoolItem | null, slot: number, flags: number) {
    super(which, slot, flags);
    this.m_pItem = item;
    if (item !== null) (item as unknown as DefaultItemFriend).setStaticDefault();
  }
  /** Original private replacement, accessible only through the native ItemInfoPackage friendship binding. @param item - New nullable default. @returns Nothing. */
  private setItem(item: SfxPoolItem | null): void {
    if (item !== null) (item as unknown as DefaultItemFriend).setStaticDefault();
    this.m_pItem = item;
  }
  /** Original borrowed default identity. @returns Actual item or null. */
  public override getItem(): SfxPoolItem | null {
    return this.m_pItem;
  }
}
/** Original pool-dependent metadata/default entry; no reference count or lifetime engine. */
export class ItemInfoDynamic extends ItemInfo {
  private readonly m_pItem: SfxPoolItem | null;
  /** Original metadata-copy/item constructor. @param info - Original metadata. @param item - Actual nullable pool-dependent default. @returns Entry. */
  constructor(info: Readonly<ItemInfo>, item: SfxPoolItem | null) {
    super(info);
    this.m_pItem = item;
    if (item !== null) (item as unknown as DefaultItemFriend).setDynamicDefault();
  }
  /** Original borrowed pool-dependent default. @returns Actual item or null. */
  public override getItem(): SfxPoolItem | null {
    return this.m_pItem;
  }
}
/** Original user metadata binds an ordinary logical item through the same shared entry operation as native holders. No ownership counter or deletion engine is introduced. */
export class ItemInfoUser extends ItemInfo {
  private readonly m_pItem: SfxPoolItem | null;
  /** Original metadata/pool/item/adoption constructor. @param info - Original metadata. @param pool - Actual target. @param item - Borrowed value. @param passingOwnership - Native adoption argument. @returns Entry. */
  constructor(
    info: Readonly<ItemInfo>,
    pool: SfxItemPool,
    item: SfxPoolItem,
    passingOwnership = false,
  ) {
    super(info);
    this.m_pItem = implCreateItemEntry(pool, item, passingOwnership);
  }
  /** Native user-entry destructor releases its held item. @returns Nothing. */
  Dispose(): void {
    implCleanupItemEntry(this.m_pItem);
  }
  /** Original borrowed user-default value. @returns Item or null. */
  public override getItem(): SfxPoolItem | null {
    return this.m_pItem;
  }
}
/** Original package abstraction and native slot-map cache; ordinary JS Map stores the same logical lookup. */
export abstract class ItemInfoPackage {
  private readonly maSlotIDToWhichIDMap = new Map<number, number>();
  private static empty: ItemInfoStatic | undefined;
  /** Original friend operation replacing a static default. Constant-member access erases C++ friendship without widening private visibility. @param item - New nullable default. @param info - Actual static metadata. @returns Nothing. */
  protected static setItemAtItemInfoStatic(item: SfxPoolItem | null, info: ItemInfoStatic): void {
    info["setItem"](item);
  }
  /** Original package-local static metadata access. @param index - Native index. @returns Static entry. */
  protected abstract getItemInfoStatic(index: number): ItemInfoStatic;
  /** Original metadata count. @returns Number of entries. */
  public abstract size(): number;
  /** Original pool-dependent default resolver. @param index - Native index. @param pool - Actual requesting pool. @returns Metadata/default entry. */
  public abstract getItemInfo(index: number, pool: SfxItemPool): ItemInfo;
  /** Original fallback shares one zero/null static entry across all packages. @param index - Ignored native index. @returns Shared EMPTY metadata. */
  public getExistingItemInfo(index: number): ItemInfo {
    void index;
    ItemInfoPackage.empty ??= new ItemInfoStatic(0, null, 0, 0);
    return ItemInfoPackage.empty;
  }
  /** Original empty-map initialization condition, including rescans for all-zero slots. Duplicate nonzero slots violate the source debug precondition. @returns Borrowed constant logical slot map. */
  public getSlotIDToWhichIDMap(): ReadonlyMap<number, number> {
    if (this.maSlotIDToWhichIDMap.size === 0)
      for (let index = 0; index < this.size(); ++index) {
        const info = this.getItemInfoStatic(index),
          slot = info.getSlotID();
        if (slot !== 0) {
          if (this.maSlotIDToWhichIDMap.has(slot))
            throw new Error("Duplicate SlotID in ItemInfoPackage.");
          this.maSlotIDToWhichIDMap.set(slot, info.getWhich());
        }
      }
    return this.maSlotIDToWhichIDMap;
  }
}
