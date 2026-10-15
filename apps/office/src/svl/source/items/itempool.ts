/**
 * @fileoverview Reimplements the bounded default-item registry and item restoration responsibilities from pinned `svl/source/items/itempool.cxx`.
 */

import type { SfxPoolItem, SfxPoolItemSnapshot, SfxPoolItemValue } from "./poolitem";

/** Restores a concrete pooled item from its persisted primitive value. */
export type SfxPoolItemFactory = (value: SfxPoolItemValue) => SfxPoolItem;

/** Owns defaults and factories for the bounded WhichId space. */
export class SfxItemPool {
  private readonly defaults = new Map<number, SfxPoolItem>();
  private readonly factories = new Map<number, SfxPoolItemFactory>();
  private readonly maItemInfos: ItemInfo[] = [];
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
  /** Original slot-map lookup and identity fallback for the currently represented single pool. No secondary pool is fabricated. @param slot - Candidate slot. @param deep - Native chain-search flag, without a chain in this binding. @returns Which or the unchanged input. */
  public GetWhichIDFromSlotID(slot: number, deep = true): number {
    void deep;
    if (!SfxItemPool.IsSlot(slot)) return slot;
    return this.mpSlotIDToWhichIDMap?.get(slot) ?? slot;
  }
  /** Original local Which-to-slot conversion and identity fallback. @param which - Native identity. @returns Registered nonzero slot or unchanged identity. */
  public GetSlotId(which: number): number {
    if (!SfxItemPool.IsWhich(which)) return which;
    const info = this.maItemInfos[which - this.mnStart];
    if (info === undefined) throw new Error("Unknown WhichId for slot lookup.");
    const slot = info.getSlotID();
    return slot !== 0 ? slot : which;
  }

  /** Registers a pool default independently of optional browser snapshot restoration. @param item - Default item. @param factory - Optional concrete restore function. @returns Nothing. */
  public RegisterDefaultItem(item: SfxPoolItem, factory?: SfxPoolItemFactory): void {
    if (this.defaults.has(item.Which())) throw new Error(`Duplicate pool default: ${item.Which()}`);
    this.defaults.set(item.Which(), item.Clone() as SfxPoolItem);
    if (factory !== undefined) this.factories.set(item.Which(), factory);
  }

  /** Original pool-default lookup on the current single-pool owner, where user overrides are not yet represented. @param which - Known declared identity. @returns Actual static/dynamic default. */
  public GetPoolDefaultItem(which: number): SfxPoolItem {
    return this.GetUserOrPoolDefaultItem(which);
  }

  /** Returns the immutable default for one WhichId. @param which - Registered item identity. @returns Pool default item. */
  public GetUserOrPoolDefaultItem(which: number): SfxPoolItem {
    const item =
      this.maItemInfos.length === 0
        ? this.defaults.get(which)
        : (this.maItemInfos[which - this.mnStart]?.getItem() ?? undefined);
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
