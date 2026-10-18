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
    for (const s of strings) s.dispose();
    strings.length = 0;
  },
);

it("constructs actual native styles with original defaults and silent creation", /** Checks actual pool/iterator/value integration. @returns Nothing. */ () => {
  const p = pool(),
    listener = new Listener();
  listener.StartListening(p);
  const a = p.Make(unicode("a"), Family.Char),
    b = p.Make(unicode("b"), Family.Para, Bits.UserDefined, unicode("parent"));
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
  a.Dispose();
  b.Dispose();
});
it("preserves parent validation, cycle rejection, unchanged notifications and follow validation", /** Uses actual model graph. @returns Nothing. */ () => {
  const p = pool(),
    a = p.Make(unicode("a"), Family.Char),
    b = p.Make(unicode("b"), Family.Char),
    c = p.Make(unicode("c"), Family.Char),
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
  a.Dispose();
  b.Dispose();
  c.Dispose();
});
it("renames actual children nonvirtually and preserves deferred-index/self collision behavior", /** Checks exact extended hint and name index state. @returns Nothing. */ () => {
  const p = pool(),
    a = p.Make(unicode("a"), Family.Char),
    b = p.Make(unicode("b"), Family.Char),
    child = p.Make(unicode("child"), Family.Char, Bits.All, unicode("a")),
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
  a.Dispose();
  b.Dispose();
  child.Dispose();
});
it("supports the original empty-name construction branches without inventing SetName acceptance", /** Checks native constructor versus setter distinction. @returns Nothing. */ () => {
  const p = pool(),
    empty = p.Make(unicode(""), Family.Char),
    parent = p.Make(unicode("parent"), Family.Char);
  expect(empty.SetParent(unicode("parent"))).toBe(true);
  expect(empty.SetName(unicode("named"))).toBe(true);
  expect(text(empty.GetFollow())).toBe("named");
  p.Dispose();
  empty.Dispose();
  parent.Dispose();
});
it("copies owned item sets as native values and borrowed item sets by identity", /** Verifies real lazy, preview, help and copy contracts. @returns Nothing. */ () => {
  const p = pool(),
    a = p.Make(unicode("a"), Family.Char),
    lazy = new SfxStyleSheetBase(a),
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
  const copy = new SfxStyleSheetBase(a),
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
  const borrowed = new Borrowed(p, set),
    shared = new SfxStyleSheetBase(borrowed);
  expect(shared.GetItemSet()).toBe(set);
  p.Dispose();
  a.Dispose();
  copy.Dispose();
  lazy.Dispose();
  borrowed.Dispose();
  shared.Dispose();
});
it("preserves native cached traversal and independent Find operations", /** Checks actual iterator ownership and cache replacement. @returns Nothing. */ () => {
  const p = pool();
  expect(p.cached()).toBeNull();
  expect(/** Violates native ordering assertion. @returns Pointer. */ () => p.Next()).toThrow(
    "previous First",
  );
  const a = p.Make(unicode("a"), Family.Char),
    b = p.Make(unicode("b"), Family.Char),
    c = p.Make(unicode("c"), Family.Para);
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
  a.Dispose();
  b.Dispose();
  c.Dispose();
});
it("removes and reparents actual styles before erase notifications without disposing retained styles", /** Checks native removal and pointer membership. @returns Nothing. */ () => {
  const p = pool(),
    parent = p.Make(unicode("parent"), Family.Char),
    child = p.Make(unicode("child"), Family.Char, Bits.All, unicode("parent")),
    foreign = pool(),
    absent = foreign.Make(unicode("parent"), Family.Char),
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
  parent.Dispose();
  child.Dispose();
  absent.Dispose();
});
it("retains original copy-pool pointer and replacement/reparent order (CALC152)", /** Preserves source copy ownership rather than rebinding it. @returns Nothing. */ () => {
  const source = pool(),
    target = pool(),
    original = source.Make(unicode("style"), Family.Char),
    old = target.Make(unicode("style"), Family.Char),
    child = target.Make(unicode("child"), Family.Char, Bits.All, unicode("style")),
    listener = new Listener();
  listener.StartListening(target);
  target.Add(original);
  const copy = target.Find(unicode("style"), Family.Char) as SfxStyleSheetBase;
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
  original.Dispose();
  old.Dispose();
  child.Dispose();
  copy.Dispose();
});
it("preserves per-slot Clear visibility, retained family views and double destructor Dying", /** Checks native cleanup order for core classes without UNO components. @returns Nothing. */ () => {
  const p = pool(),
    a = p.Make(unicode("a"), Family.Char),
    b = p.Make(unicode("b"), Family.Char),
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
  const c = p.Make(unicode("c"), Family.Char),
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
  a.Dispose();
  b.Dispose();
  c.Dispose();
});
it("preserves silent duplicate-pointer Insert and source empty copy/assignment behavior (CALC150)", /** Does not invent a repaired source traversal. @returns Nothing. */ () => {
  const source = pool(),
    a = source.Make(unicode("a"), Family.Char),
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
    old = target.Make(unicode("old"), Family.Char);
  expect(target.assign(source)).toBe(target);
  expect(target.GetIndexedStyleSheets().GetNumberOfStyleSheets()).toBe(0);
  listener.Dispose();
  source.Dispose();
  copy.Dispose();
  target.Dispose();
  a.Dispose();
  old.Dispose();
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
    a = p.Make(unicode("a"), Family.Char);
  expect(
    /** Executes original callback until factory failure. @returns Pool. */ () => p.addPool(base),
  ).toThrow("copy factory failure");
  expect(p.GetIndexedStyleSheets().GetNumberOfStyleSheets()).toBe(0);
  p.Dispose();
  base.Dispose();
  a.Dispose();
});
