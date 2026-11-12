/** @fileoverview Source-derived core style/pool contracts use actual owners, index, iterator, Sfx notifications and native metadata item sets; no fake style/pool provider. */
import { afterEach, expect, it } from "vitest";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { SfxStyleFamily as Family, SfxStyleSearchBits as Bits } from "../../inc/style";
import { SfxHintId, type SfxHint } from "../../inc/hint";
import { SfxListener } from "../notify/lstner";
import type { SfxBroadcaster } from "../notify/SfxBroadcaster";
import {
  SfxStyleSheetBase,
  SfxStyleSheetBasePool,
  SfxStyleSheetHint,
  SfxStyleSheetModifiedHint,
  SfxStyleSheetPoolHint,
} from "./style-model";
import { SfxItemPool, ItemInfoPackage, ItemInfoStatic } from "./itempool";
import { SfxItemSet } from "./itemset";
import { SfxBoolItem } from "./cenumitm";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
const references = new Map<SfxStyleSheetBase, Reference<SfxStyleSheetBase>>();
/** Owns the source caller's rtl::Reference local. @param style - Actual owner. @returns Borrowed pointer. */
function own<T extends SfxStyleSheetBase | null>(style: T): T {
  if (style !== null && !references.has(style)) references.set(style, new Reference(style));
  return style;
}
/** Ends a source caller's strong-reference scope. @param style - Actual owner. @returns Nothing. */
function release(style: SfxStyleSheetBase): void {
  const reference = references.get(style) as Reference<SfxStyleSheetBase>;
  references.delete(style);
  reference.dispose();
}
const strings: OUString[] = [];
/** Creates genuine shared UTF16. @param text - Name. @returns String. */
function unicode(text: string): OUString {
  const units = Uint16Array.from(
    text.split(""),
    /** Reads unit. @param c - Unit. @returns Unit code. */ (c) => c.charCodeAt(0),
  );
  const value = new OUString(units, units.length);
  strings.push(value);
  return value;
}
/** Reads actual const Unicode member. @param value - Native value. @returns Text. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); i++)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Actual one-entry native metadata package. */
class Package extends ItemInfoPackage {
  private readonly entry = new ItemInfoStatic(1, new SfxBoolItem(1, false), 0, 0);
  /** Original static metadata. @returns Entry. */ protected override getItemInfoStatic(): ItemInfoStatic {
    return this.entry;
  }
  /** Original count. @returns One. */ public override size(): number {
    return 1;
  }
  /** Original registration metadata. @returns Entry. */ public override getItemInfo(): ItemInfoStatic {
    return this.entry;
  }
}
/** Exposes original protected pool views only for source-derived fixtures. */
class Pool extends SfxStyleSheetBasePool {
  /** Borrows cached iterator. @returns Current iterator. */ public cached() {
    return this.GetCachedIterator();
  }
  /** Borrows indexed pointer. @param position - Position. @returns Style. */ public position(
    position: number,
  ) {
    return this.GetStyleSheetByPositionInIndex(position);
  }
}
/** Constructs a real registered item pool and actual core style pool. @returns Owners. */
function pool() {
  const items = new SfxItemPool();
  items.registerItemInfoPackage(new Package());
  return new Pool(items);
}
/** Captures hints during their original synchronous lifetime. */
class Listener extends SfxListener {
  public readonly ids: SfxHintId[] = [];
  public readonly names: string[] = [];
  public readonly oldNames: string[] = [];
  public action?: (hint: SfxHint) => void;
  /** Reads original hint objects while live. @param _source - Source. @param hint - Hint. @returns Nothing. */
  public override Notify(_source: SfxBroadcaster, hint: SfxHint): void {
    void _source;
    this.ids.push(hint.GetId());
    if (hint instanceof SfxStyleSheetHint) this.names.push(text(hint.GetStyleSheet().GetName()));
    if (hint instanceof SfxStyleSheetModifiedHint) this.oldNames.push(text(hint.GetOldName()));
    this.action?.(hint);
  }
}
afterEach(
  /** Ends caller-owned string scopes. @returns Nothing. */ () => {
    for (const reference of [...references.values()].reverse()) reference.dispose();
    references.clear();
    for (const s of strings) s.dispose();
    strings.length = 0;
  },
);

it("constructs actual native styles with original defaults and silent creation", /** Checks actual pool/iterator/value integration. @returns Nothing. */ () => {
  const p = pool(),
    listener = new Listener();
  listener.StartListening(p);
  const a = own(p.Make(unicode("a"), Family.Char)),
    b = own(p.Make(unicode("b"), Family.Para, Bits.UserDefined, unicode("parent")));
  expect(a).toBeInstanceOf(SfxStyleSheetBase);
  expect(p.GetPool()).toBe(a.GetItemSet().GetPool());
  expect(a.GetPool()).toBe(p);
  expect([a.GetFamily(), a.GetMask(), a.IsHidden(), a.IsUserDefined()]).toEqual([
    Family.Char,
    Bits.All,
    false,
    true,
  ]);
  expect([text(a.GetName()), text(a.GetParent()), text(a.GetFollow())]).toEqual(["a", "", "a"]);
  expect(text(b.GetParent())).toBe("parent");
  expect(p.Make(unicode("a"), Family.Char)).toBe(a);
  expect(listener.ids).toEqual([]);
  expect([
    a.HasFollowSupport(),
    a.HasParentSupport(),
    a.HasClearParentSupport(),
    a.IsUsed(),
    a.isScStyleSheet(),
    a.GetSpotlightId(),
  ]).toEqual([true, true, false, true, false, -1]);
  const used = a.GetUsedBy();
  expect(used.isEmpty()).toBe(true);
  used.dispose();
  expect(new SfxStyleSheetPoolHint().GetId()).toBe(SfxHintId.SfxStyleSheetPool);
  const hint = new SfxStyleSheetHint(SfxHintId.StyleSheetModified, a);
  expect(hint.GetStyleSheet()).toBe(a);
  a.SetMask(Bits.Auto);
  expect(a.IsUserDefined()).toBe(false);
  expect(a.GetMask()).toBe(Bits.Auto);
  expect(listener.ids).toEqual([]);
  listener.Dispose();
  p.Dispose();
  release(a);
  release(b);
});
it("preserves parent validation, cycle rejection, unchanged notifications and follow validation", /** Uses actual model graph. @returns Nothing. */ () => {
  const p = pool(),
    a = own(p.Make(unicode("a"), Family.Char)),
    b = own(p.Make(unicode("b"), Family.Char)),
    c = own(p.Make(unicode("c"), Family.Char)),
    listener = new Listener();
  listener.StartListening(p);
  expect(a.SetParent(unicode("a"))).toBe(false);
  expect(a.SetParent(unicode("missing"))).toBe(false);
  expect(a.SetParent(unicode("b"))).toBe(true);
  expect(c.SetParent(unicode("a"))).toBe(true);
  expect(a.SetParent(unicode("c"))).toBe(false);
  expect(b.SetParent(unicode("a"))).toBe(false);
  expect(a.SetParent(unicode("b"))).toBe(true);
  expect(a.SetParent(unicode(""))).toBe(true);
  expect(a.SetParent(unicode(""))).toBe(true);
  expect(a.SetFollow(unicode("missing"))).toBe(false);
  expect(a.SetFollow(unicode("b"))).toBe(true);
  expect(a.SetFollow(unicode("b"))).toBe(true);
  expect(text(a.GetFollow())).toBe("b");
  a.SetHidden(true);
  a.SetHidden(true);
  a.SetHidden(false);
  expect(a.IsHidden()).toBe(false);
  expect(listener.ids).toHaveLength(10);
  expect(
    listener.ids.every(
      /** Checks notification ID. @param id - ID. @returns Match. */ (id) =>
        id === SfxHintId.StyleSheetModified,
    ),
  ).toBe(true);
  listener.Dispose();
  p.Dispose();
  release(a);
  release(b);
  release(c);
});
it("renames actual children nonvirtually and preserves deferred-index/self collision behavior", /** Checks exact extended hint and name index state. @returns Nothing. */ () => {
  const p = pool(),
    a = own(p.Make(unicode("a"), Family.Char)),
    b = own(p.Make(unicode("b"), Family.Char)),
    child = own(p.Make(unicode("child"), Family.Char, Bits.All, unicode("a"))),
    listener = new Listener();
  listener.StartListening(p);
  expect(a.SetName(unicode(""))).toBe(false);
  expect(a.SetName(unicode("a"))).toBe(true);
  expect(a.SetName(unicode("b"))).toBe(false);
  expect(listener.ids).toEqual([]);
  expect(a.SetName(unicode("new"))).toBe(true);
  expect(text(child.GetParent())).toBe("new");
  expect(text(a.GetFollow())).toBe("new");
  expect(listener.ids).toEqual([SfxHintId.StyleSheetModifiedExtended]);
  expect(listener.oldNames).toEqual(["a"]);
  expect(p.Find(unicode("new"), Family.Char)).toBe(a);
  expect(p.Find(unicode("a"), Family.Char)).toBeNull();
  a.SetFollow(unicode("b"));
  a.SetName(unicode("deferred"), false);
  expect(p.Find(unicode("new"), Family.Char)).toBe(a);
  expect(p.Find(unicode("deferred"), Family.Char)).toBeNull();
  expect(a.SetName(unicode("new"))).toBe(true);
  expect(text(a.GetFollow())).toBe("b");
  a.SetName(unicode("final"), false);
  p.Reindex();
  expect(p.Find(unicode("final"), Family.Char)).toBe(a);
  listener.Dispose();
  p.Dispose();
  release(a);
  release(b);
  release(child);
});
it("supports the original empty-name construction branches without inventing SetName acceptance", /** Checks native constructor versus setter distinction. @returns Nothing. */ () => {
  const p = pool(),
    empty = own(p.Make(unicode(""), Family.Char)),
    parent = own(p.Make(unicode("parent"), Family.Char));
  expect(empty.SetParent(unicode("parent"))).toBe(true);
  expect(empty.SetName(unicode("named"))).toBe(true);
  expect(text(empty.GetFollow())).toBe("named");
  p.Dispose();
  release(empty);
  release(parent);
});
it("copies owned item sets as native values and borrowed item sets by identity", /** Verifies real lazy, preview, help and copy contracts. @returns Nothing. */ () => {
  const p = pool(),
    a = own(p.Make(unicode("a"), Family.Char)),
    lazy = own(new SfxStyleSheetBase(a)),
    output = unicode("output");
  expect(a.GetHelpId(output)).toBe(0);
  expect(output.isEmpty()).toBe(true);
  a.SetHelpId(unicode("help"), -1);
  expect(a.GetHelpId(output)).toBe(0xffffffff);
  expect(text(output)).toBe("help");
  a.SetHidden(true);
  const set = a.GetItemSet();
  expect(a.GetItemSet()).toBe(set);
  set.Put(new SfxBoolItem(1, true));
  const copy = own(new SfxStyleSheetBase(a)),
    preview = a.GetItemSetForPreview();
  expect(copy.GetItemSet()).not.toBe(set);
  expect(copy.GetItemSet().Get(1).QueryValue()).toBe(true);
  expect(copy.IsHidden()).toBe(true);
  expect(copy.GetHelpId(output)).toBe(0xffffffff);
  expect(copy.GetPool()).toBe(p);
  preview.Put(new SfxBoolItem(1, false));
  expect(set.Get(1).QueryValue()).toBe(true);
  expect(lazy.GetItemSet().Get(1).QueryValue()).toBe(false);
  /** Native subclass with an externally owned item set. */
  class Borrowed extends SfxStyleSheetBase {
    /** Supplies the original protected borrowed-set state. @param owner - Pool. @param value - Actual set. @returns Style. */ constructor(
      owner: SfxStyleSheetBasePool,
      value: SfxItemSet,
    ) {
      super(unicode("borrowed"), owner, Family.Char, Bits.All);
      this.pSet = value;
      this.bMySet = false;
    }
  }
  const borrowed = own(new Borrowed(p, set)),
    shared = own(new SfxStyleSheetBase(borrowed));
  expect(shared.GetItemSet()).toBe(set);
  p.Dispose();
  release(a);
  release(copy);
  release(lazy);
  release(borrowed);
  release(shared);
});
it("preserves native cached traversal and independent Find operations", /** Checks actual iterator ownership and cache replacement. @returns Nothing. */ () => {
  const p = pool();
  expect(p.cached()).toBeNull();
  expect(/** Violates native ordering assertion. @returns Pointer. */ () => p.Next()).toThrow(
    "previous First",
  );
  const a = own(p.Make(unicode("a"), Family.Char)),
    b = own(p.Make(unicode("b"), Family.Char)),
    c = own(p.Make(unicode("c"), Family.Para));
  expect(p.CreateIterator(Family.All).Count()).toBe(3);
  expect(p.Find(unicode("a"), Family.Char, Bits.UserDefined)).toBe(a);
  expect(p.position(0)).toBe(a);
  expect(p.position(99)).toBeNull();
  expect(p.First(Family.Char)).toBe(a);
  const cache = p.cached();
  expect(p.Find(unicode("c"), Family.Para)).toBe(c);
  expect(p.Next()).toBe(b);
  expect(p.Next()).toBeNull();
  expect(p.First(Family.Char)).toBe(a);
  expect(p.cached()).toBe(cache);
  p.First(Family.Para);
  expect(p.cached()).not.toBe(cache);
  const changed = p.cached();
  p.First(Family.Para, Bits.UserDefined);
  expect(p.cached()).not.toBe(changed);
  p.Dispose();
  release(a);
  release(b);
  release(c);
});
it("removes and reparents actual styles before erase notifications without disposing retained styles", /** Checks native removal and pointer membership. @returns Nothing. */ () => {
  const p = pool(),
    parent = own(p.Make(unicode("parent"), Family.Char)),
    child = own(p.Make(unicode("child"), Family.Char, Bits.All, unicode("parent"))),
    foreign = pool(),
    absent = own(foreign.Make(unicode("parent"), Family.Char)),
    listener = new Listener();
  listener.StartListening(p);
  p.Remove(null);
  p.Remove(absent);
  expect(listener.ids).toEqual([]);
  p.Remove(parent);
  expect(text(child.GetParent())).toBe("");
  expect(p.Find(unicode("parent"), Family.Char)).toBeNull();
  expect(text(parent.GetName())).toBe("parent");
  expect(listener.ids).toEqual([SfxHintId.StyleSheetModified, SfxHintId.StyleSheetErased]);
  listener.Dispose();
  p.Dispose();
  foreign.Dispose();
  release(parent);
  release(child);
  release(absent);
});
it("retains original copy-pool pointer and replacement/reparent order (CALC152)", /** Preserves source copy ownership rather than rebinding it. @returns Nothing. */ () => {
  const source = pool(),
    target = pool(),
    original = own(source.Make(unicode("style"), Family.Char)),
    old = own(target.Make(unicode("style"), Family.Char)),
    child = own(target.Make(unicode("child"), Family.Char, Bits.All, unicode("style"))),
    listener = new Listener();
  listener.StartListening(target);
  target.Add(original);
  const copy = own(target.Find(unicode("style"), Family.Char) as SfxStyleSheetBase);
  expect(copy).not.toBe(original);
  expect(copy.GetPool()).toBe(source);
  expect(text(child.GetParent())).toBe("");
  expect(listener.ids).toEqual([
    SfxHintId.StyleSheetModified,
    SfxHintId.StyleSheetErased,
    SfxHintId.StyleSheetChanged,
  ]);
  listener.ids.length = 0;
  target.Add(source.Make(unicode("other"), Family.Para));
  expect(listener.ids).toEqual([SfxHintId.StyleSheetChanged]);
  listener.Dispose();
  source.Dispose();
  target.Dispose();
  release(original);
  release(old);
  release(child);
  release(copy);
});
it("preserves per-slot Clear visibility, retained family views and double destructor Dying", /** Checks native cleanup order for core classes without UNO components. @returns Nothing. */ () => {
  const p = pool(),
    a = own(p.Make(unicode("a"), Family.Char)),
    b = own(p.Make(unicode("b"), Family.Char)),
    listener = new Listener(),
    states: (SfxStyleSheetBase | null)[][] = [];
  listener.StartListening(p);
  listener.action = /** Observes slots before each clear. @param hint - Hint. @returns Nothing. */ (
    hint,
  ) => {
    if (hint.GetId() === SfxHintId.StyleSheetErased) states.push([p.position(0), p.position(1)]);
  };
  p.Clear();
  expect(states).toEqual([
    [a, b],
    [null, b],
  ]);
  expect(p.GetIndexedStyleSheets().GetNumberOfStyleSheets()).toBe(0);
  expect(p.GetIndexedStyleSheets().GetStyleSheetsByFamily(Family.Char)).toEqual([a, b]);
  p.Reindex();
  expect(p.GetIndexedStyleSheets().GetStyleSheetsByFamily(Family.Char)).toEqual([]);
  const c = own(p.Make(unicode("c"), Family.Char)),
    dying: number[] = [];
  listener.action = /** Records derived/base dying order. @param hint - Hint. @returns Nothing. */ (
    hint,
  ) => {
    if (hint.GetId() === SfxHintId.Dying)
      dying.push(p.GetIndexedStyleSheets().GetNumberOfStyleSheets());
  };
  p.Dispose();
  expect(dying).toEqual([1, 0]);
  expect(listener.IsListening(p)).toBe(false);
  release(a);
  release(b);
  release(c);
});
it("preserves silent duplicate-pointer Insert and source empty copy/assignment behavior (CALC150)", /** Does not invent a repaired source traversal. @returns Nothing. */ () => {
  const source = pool(),
    a = own(source.Make(unicode("a"), Family.Char)),
    listener = new Listener();
  listener.StartListening(source);
  source.Insert(a);
  expect(source.GetIndexedStyleSheets().GetNumberOfStyleSheets()).toBe(1);
  const copy = new SfxStyleSheetBasePool(source);
  expect(copy.GetPool()).toBe(source.GetPool());
  expect(listener.IsListening(copy)).toBe(true);
  expect(copy.GetIndexedStyleSheets().GetNumberOfStyleSheets()).toBe(0);
  expect(copy.addPool(source)).toBe(copy);
  expect(copy.assign(copy)).toBe(copy);
  expect(source.addPool(source)).toBe(source);
  expect(source.assign(source)).toBe(source);
  const target = pool(),
    old = own(target.Make(unicode("old"), Family.Char));
  expect(target.assign(source)).toBe(target);
  expect(target.GetIndexedStyleSheets().GetNumberOfStyleSheets()).toBe(0);
  listener.Dispose();
  source.Dispose();
  copy.Dispose();
  target.Dispose();
  release(a);
  release(old);
});
it("propagates copy-factory failure before invalidated native traversal advances", /** A real protected factory exception exits before the source CALC150 iterator can be reused. @returns Nothing. */ () => {
  /** Original factory extension with deterministic copy failure. */
  class FailingPool extends SfxStyleSheetBasePool {
    /** Throws on copy while preserving original field factory. @param args - Native overload. @returns Style. */ protected override Create(
      ...args:
        | [source: SfxStyleSheetBase]
        | [
            name: OUStringConstReference,
            family: Family,
            mask: Bits,
            parent: OUStringConstReference | undefined,
          ]
    ): SfxStyleSheetBase {
      if (args[0] instanceof SfxStyleSheetBase) throw new Error("copy factory failure");
      return super.Create(...args);
    }
  }
  const base = pool(),
    p = new FailingPool(base.GetPool()),
    a = own(p.Make(unicode("a"), Family.Char));
  expect(
    /** Executes original callback until factory failure. @returns Pool. */ () => p.addPool(base),
  ).toThrow("copy factory failure");
  expect(p.GetIndexedStyleSheets().GetNumberOfStyleSheets()).toBe(0);
  p.Dispose();
  base.Dispose();
  release(a);
});

it("keeps a pool-only style alive through Remove reparenting and erase broadcast", /** Ports the explicit upstream xP ownership guard using the actual weak adapter. @returns Nothing. */ () => {
  const p = pool(),
    style = p.Make(unicode("removed"), Family.Char),
    adapter = style.queryAdapter(),
    listener = new Listener(),
    observations: string[] = [];
  listener.StartListening(p);
  listener.action =
    /** Reads the style while Remove still owns xP. @param hint - Live hint. @returns Nothing. */ (
      hint,
    ) => {
      if (hint.GetId() === SfxHintId.StyleSheetErased) {
        const live = (
          adapter.get() as import("../../../cppu/inc/com/sun/star/uno/XAdapter").XAdapter
        ).queryAdapted();
        observations.push(text((live.get() as SfxStyleSheetBase).GetName()));
        live.dispose();
      }
    };
  p.Remove(style);
  expect(observations).toEqual(["removed"]);
  const dead = (
    adapter.get() as import("../../../cppu/inc/com/sun/star/uno/XAdapter").XAdapter
  ).queryAdapted();
  expect(dead.is()).toBe(false);
  dead.dispose();
  adapter.dispose();
  listener.Dispose();
  p.Dispose();
});
it("releases actual style-owned item sets at the last strong reference and gives copies independent weak lifetimes", /** Checks real pooled item references and native copy-base default construction. @returns Nothing. */ () => {
  const p = pool(),
    source = p.Make(unicode("source"), Family.Char);
  source.GetItemSet().Put(new SfxBoolItem(1, true));
  const item = source.GetItemSet().Get(1),
    copy = new SfxStyleSheetBase(source),
    copyReference = new Reference(copy),
    adapter = copy.queryAdapter(),
    copiedItem = copy.GetItemSet().Get(1);
  expect(copiedItem).not.toBe(item);
  expect(item.GetRefCount()).toBe(1);
  expect(copiedItem.GetRefCount()).toBe(1);
  copyReference.clear();
  expect(copiedItem.GetRefCount()).toBe(0);
  expect(item.GetRefCount()).toBe(1);
  const dead = (
    adapter.get() as import("../../../cppu/inc/com/sun/star/uno/XAdapter").XAdapter
  ).queryAdapted();
  expect(dead.is()).toBe(false);
  dead.dispose();
  adapter.dispose();
  expect(source.GetItemSet().Get(1)).toBe(item);
  p.Dispose();
  expect(item.GetRefCount()).toBe(0);
});

it("owns the native pool through its weak base and clears styles before broadcaster-base destruction", /** Verifies both native base roles keep one object identity. @returns Nothing. */ () => {
  const p = pool(),
    held = new Reference(p),
    adapter = p.queryAdapter(),
    style = p.Make(unicode("owned"), Family.Char),
    styleAdapter = style.queryAdapter(),
    listener = new Listener(),
    counts: number[] = [];
  listener.StartListening(p);
  listener.action =
    /** Observes the actual derived/base destruction sequence. @param hint - Native hint. @returns Nothing. */ (
      hint,
    ) => {
      if (hint.GetId() === SfxHintId.Dying)
        counts.push(p.GetIndexedStyleSheets().GetNumberOfStyleSheets());
    };
  const alive = (
    adapter.get() as import("../../../cppu/inc/com/sun/star/uno/XAdapter").XAdapter
  ).queryAdapted();
  expect(alive.get()).toBe(p);
  alive.dispose();
  held.clear();
  expect(counts).toEqual([1, 0]);
  expect(listener.GetBroadcasterCount()).toBe(0);
  for (const point of [adapter, styleAdapter]) {
    const dead = (
      point.get() as import("../../../cppu/inc/com/sun/star/uno/XAdapter").XAdapter
    ).queryAdapted();
    expect(dead.is()).toBe(false);
    dead.dispose();
    point.dispose();
  }
});
it("gives a copied pool a fresh weak lifetime while preserving source broadcaster subscriptions", /** Exercises the native independent weak base in the pool copy constructor. @returns Nothing. */ () => {
  const source = pool(),
    sourceReference = new Reference(source),
    listener = new Listener();
  listener.StartListening(source);
  const copy = new SfxStyleSheetBasePool(source),
    copyReference = new Reference(copy),
    point = copy.queryAdapter();
  expect(listener.IsListening(copy)).toBe(true);
  copyReference.clear();
  expect(listener.IsListening(source)).toBe(true);
  expect(listener.IsListening(copy)).toBe(false);
  const dead = (
    point.get() as import("../../../cppu/inc/com/sun/star/uno/XAdapter").XAdapter
  ).queryAdapted();
  expect(dead.is()).toBe(false);
  dead.dispose();
  point.dispose();
  listener.Dispose();
  sourceReference.dispose();
});
