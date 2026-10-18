/** @fileoverview Actual native derived style/pool roles, identity, parent notification/copy/destructor order and inherited copy slicing; source-derived cases over real shared owners. */
import { afterEach, expect, it } from "vitest";
import { OUString } from "../../../sal/inc/rtl/ustring";
import {
  SfxStyleSheet,
  SfxStyleSheetPool,
  SfxStyleSheetBase,
  SfxStyleFamily as Family,
  SfxStyleSearchBits as Bits,
} from "../../inc/style";
import { SfxListener } from "../notify/lstner";
import { SfxBroadcaster } from "../notify/SfxBroadcaster";
import { SfxHint, SfxHintId } from "../../inc/hint";
import type { StyleSheetUser } from "../../inc/stylesheetuser";
import { ItemInfoPackage, ItemInfoStatic, SfxItemPool } from "./itempool";
import { SfxBoolItem } from "./cenumitm";
const strings: OUString[] = [];
/** Creates actual UTF16. @param text - Text. @returns Value. */ function unicode(
  text: string,
): OUString {
  const units = Uint16Array.from(
      text.split(""),
      /** Reads unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
    ),
    s = new OUString(units, units.length);
  strings.push(s);
  return s;
}
/** Original one-item metadata package. */ class Package extends ItemInfoPackage {
  private readonly entry = new ItemInfoStatic(1, new SfxBoolItem(1, false), 0, 0);
  /** Original static metadata. @returns Entry. */ protected override getItemInfoStatic() {
    return this.entry;
  }
  /** Original count. @returns One. */ public override size() {
    return 1;
  }
  /** Original registration metadata. @returns Entry. */ public override getItemInfo() {
    return this.entry;
  }
}
/** Creates actual original item and shared style pools. @returns Style pool. */ function pool() {
  const p = new SfxItemPool();
  p.registerItemInfoPackage(new Package());
  return new SfxStyleSheetPool(p);
}
/** Original virtual field factory result, without substitute objects. @param p - Actual pool. @param name - Name. @returns Actual derived style. */ function make(
  p: SfxStyleSheetPool,
  name: string,
): SfxStyleSheet {
  return p.Make(unicode(name), Family.Char) as SfxStyleSheet;
}
/** Original listener override records source/hint identity without applying the base registration assertion to forwarded sources. */ class Observer extends SfxListener {
  public readonly values: [SfxBroadcaster, SfxHint][] = [];
  public action?: (source: SfxBroadcaster, hint: SfxHint) => void;
  /** Captures actual dispatch. @param source - Original source. @param hint - Hint. @returns Nothing. */ public override Notify(
    source: SfxBroadcaster,
    hint: SfxHint,
  ): void {
    this.values.push([source, hint]);
    this.action?.(source, hint);
  }
}
afterEach(
  /** Ends original caller string scopes. @returns Nothing. */ () => {
    for (const s of strings) s.dispose();
    strings.length = 0;
  },
);
it("constructs the actual shared factory with one style identity in both native roles", /** Checks native public protocol assignments and original flags. @returns Nothing. */ () => {
  const p = pool(),
    a = make(p, "a"),
    b = make(p, "b"),
    asListener: SfxListener = a,
    asBroadcaster: SfxBroadcaster = a,
    user: StyleSheetUser = a;
  expect(a).toBeInstanceOf(SfxStyleSheet);
  expect(a.GetPool()).toBe(p);
  expect(asListener).toBe(a);
  expect(asBroadcaster).toBe(a);
  expect([a.IsSfxStyleSheet(), a.IsSdrView(), a.IsSwXStyle(), user.isUsedByModel()]).toEqual([
    true,
    false,
    false,
    true,
  ]);
  const observer = new Observer();
  observer.StartListening(a);
  expect(observer.GetBroadcasterJOE(0)).toBe(a);
  expect(a.SetParent(unicode("b"))).toBe(true);
  expect(a.GetBroadcasterJOE(0)).toBe(b);
  expect(b.GetListenerCount()).toBe(1);
  const hint = new SfxHint(SfxHintId.DataChanged);
  a.Broadcast(hint);
  expect(observer.values).toEqual([[a, hint]]);
  /** Original virtual IsUsed extension. */ class Unused extends SfxStyleSheet {
    /** Returns original subclass usage. @returns False. */ public override IsUsed(): boolean {
      return false;
    }
  }
  const unused = new Unused(unicode("unused"), p, Family.Char, Bits.All);
  expect(unused.isUsedByModel()).toBe(false);
  observer.Dispose();
  p.Dispose();
  a.Dispose();
  b.Dispose();
  unused.Dispose();
});
it("forwards original ancestor source and hint identity across actual style levels", /** Checks native Notify calls existing live-bound Forward. @returns Nothing. */ () => {
  const p = pool(),
    grand = make(p, "grand"),
    parent = make(p, "parent"),
    child = make(p, "child"),
    observer = new Observer();
  parent.SetParent(grand.GetName());
  child.SetParent(parent.GetName());
  observer.StartListening(child);
  const hint = new SfxHint(SfxHintId.DocChanged);
  grand.Broadcast(hint);
  expect(observer.values).toEqual([[grand, hint]]);
  expect(observer.IsListening(grand)).toBe(false);
  expect(observer.IsListening(child)).toBe(true);
  child.SetParent(unicode(""));
  grand.Broadcast(hint);
  expect(observer.values).toHaveLength(1);
  expect(child.GetBroadcasterCount()).toBe(0);
  observer.Dispose();
  p.Dispose();
  grand.Dispose();
  parent.Dispose();
  child.Dispose();
});
it("preserves unchanged early return, validation failure and pool notification before subscription rebind", /** Observes the original base-to-derived order. @returns Nothing. */ () => {
  const p = pool(),
    a = make(p, "a"),
    b = make(p, "b"),
    child = make(p, "child"),
    observer = new Observer(),
    during: boolean[][] = [];
  observer.StartListening(p);
  expect(child.SetParent(unicode(""))).toBe(true);
  expect(observer.values).toEqual([]);
  expect(child.SetParent(unicode("missing"))).toBe(false);
  expect(child.SetParent(child.GetName())).toBe(false);
  child.SetParent(a.GetName());
  observer.action =
    /** Observes old/new membership during native base broadcast. @param _source - Source. @param hint - Hint. @returns Nothing. */ (
      _source,
      hint,
    ) => {
      void _source;
      if (hint.GetId() === SfxHintId.StyleSheetModified)
        during.push([child.IsListening(a), child.IsListening(b)]);
    };
  child.SetParent(b.GetName());
  expect(during).toEqual([[true, false]]);
  expect([child.IsListening(a), child.IsListening(b)]).toEqual([false, true]);
  const count = observer.values.length;
  child.SetParent(b.GetName());
  expect(observer.values).toHaveLength(count);
  child.SetParent(unicode(""));
  expect(child.GetBroadcasterCount()).toBe(0);
  observer.Dispose();
  p.Dispose();
  a.Dispose();
  b.Dispose();
  child.Dispose();
});
it("copies listener then broadcaster subobjects without proxy source identities", /** Exercises original three-base copy order. @returns Nothing. */ () => {
  const p = pool(),
    parent = make(p, "parent"),
    source = make(p, "source"),
    observer = new Observer();
  source.SetParent(parent.GetName());
  source.GetItemSet().Put(new SfxBoolItem(1, true));
  observer.StartListening(source);
  const copy = new SfxStyleSheet(source);
  expect(copy.GetPool()).toBe(p);
  expect(copy.IsListening(parent)).toBe(true);
  expect(copy.GetBroadcasterJOE(0)).toBe(parent);
  expect(parent.GetListenerCount()).toBe(2);
  expect(observer.IsListening(copy)).toBe(true);
  expect(observer.GetBroadcasterJOE(1)).toBe(copy);
  expect(copy.GetItemSet()).not.toBe(source.GetItemSet());
  expect(copy.GetItemSet().Get(1).QueryValue()).toBe(true);
  const hint = new SfxHint(SfxHintId.ColorsChanged);
  parent.Broadcast(hint);
  expect(observer.values).toEqual([
    [parent, hint],
    [parent, hint],
  ]);
  observer.Dispose();
  p.Dispose();
  parent.Dispose();
  source.Dispose();
  copy.Dispose();
});
it("preserves derived InDestruction then broadcaster Dying, listener detach and base destruction", /** Observes original destructor order while the parent still exists. @returns Nothing. */ () => {
  const p = pool(),
    parent = make(p, "parent"),
    child = make(p, "child"),
    observer = new Observer(),
    membership: boolean[] = [];
  child.SetParent(parent.GetName());
  observer.StartListening(child);
  observer.action =
    /** Checks listener base remains connected during both notifications. @returns Nothing. */ () => {
      membership.push(child.IsListening(parent));
    };
  p.Remove(child);
  child.Dispose();
  expect(
    observer.values.map(
      /** Reads hint ID. @param entry - Record. @returns ID. */ (entry) => entry[1].GetId(),
    ),
  ).toEqual([SfxHintId.StyleSheetInDestruction, SfxHintId.Dying]);
  expect(
    observer.values.every(
      /** Checks source identity. @param entry - Record. @returns Match. */ (entry) =>
        entry[0] === child,
    ),
  ).toBe(true);
  expect(membership).toEqual([true, true]);
  expect(parent.GetListenerCount()).toBe(0);
  expect(observer.GetBroadcasterCount()).toBe(0);
  p.Dispose();
  parent.Dispose();
});
it("preserves constructor parent storage without a notification subscription (CALC158)", /** Does not repair native constructor behavior. @returns Nothing. */ () => {
  const p = pool(),
    parent = make(p, "parent"),
    child = p.Make(unicode("child"), Family.Char, Bits.All, parent.GetName()) as SfxStyleSheet;
  expect(child.GetParent().equals(parent.GetName())).toBe(true);
  expect(child.IsListening(parent)).toBe(false);
  expect(child.SetParent(parent.GetName())).toBe(true);
  expect(child.IsListening(parent)).toBe(false);
  child.SetParent(unicode(""));
  child.SetParent(parent.GetName());
  expect(child.IsListening(parent)).toBe(true);
  p.Dispose();
  parent.Dispose();
  child.Dispose();
});
it("preserves retained subscriptions when a removed old parent is no longer found (CALC157)", /** Holds both actual styles alive after removal. @returns Nothing. */ () => {
  const p = pool(),
    parent = make(p, "parent"),
    child = make(p, "child"),
    observer = new Observer();
  child.SetParent(parent.GetName());
  observer.StartListening(child);
  p.Remove(parent);
  expect(child.GetParent().isEmpty()).toBe(true);
  expect(child.IsListening(parent)).toBe(true);
  const hint = new SfxHint(SfxHintId.DataChanged);
  parent.Broadcast(hint);
  expect(observer.values).toEqual([[parent, hint]]);
  observer.Dispose();
  p.Dispose();
  parent.Dispose();
  child.Dispose();
});
it("preserves subscription lookup after reentrant pool clearing (CALC159)", /** Base notification can clear the index before the derived lookups. @returns Nothing. */ () => {
  const p = pool(),
    a = make(p, "a"),
    b = make(p, "b"),
    child = make(p, "child"),
    observer = new Observer();
  child.SetParent(a.GetName());
  observer.StartListening(p);
  let cleared = false;
  observer.action =
    /** Clears only during the original Modified callback. @param _source - Source. @param hint - Hint. @returns Nothing. */ (
      _source,
      hint,
    ) => {
      void _source;
      if (!cleared && hint.GetId() === SfxHintId.StyleSheetModified) {
        cleared = true;
        p.Clear();
      }
    };
  expect(child.SetParent(b.GetName())).toBe(true);
  expect(child.GetParent().equals(b.GetName())).toBe(true);
  expect(child.IsListening(a)).toBe(true);
  expect(child.IsListening(b)).toBe(false);
  observer.Dispose();
  p.Dispose();
  a.Dispose();
  b.Dispose();
  child.Dispose();
});
it("preserves inherited base-copy factory slicing in the derived pool (CALC156)", /** Distinguishes native field and copy factory overloads. @returns Nothing. */ () => {
  const source = pool(),
    target = pool(),
    style = make(source, "style");
  target.Add(style);
  const copy = target.Find(style.GetName(), Family.Char) as SfxStyleSheetBase;
  expect(copy).toBeInstanceOf(SfxStyleSheetBase);
  expect(copy).not.toBeInstanceOf(SfxStyleSheet);
  expect(copy.GetPool()).toBe(source);
  expect("Broadcast" in copy).toBe(false);
  const poolCopy = new SfxStyleSheetPool(source);
  expect(poolCopy.GetIndexedStyleSheets().GetNumberOfStyleSheets()).toBe(0);
  expect(poolCopy.GetPool()).toBe(source.GetPool());
  source.Dispose();
  target.Dispose();
  poolCopy.Dispose();
  style.Dispose();
  copy.Dispose();
});
