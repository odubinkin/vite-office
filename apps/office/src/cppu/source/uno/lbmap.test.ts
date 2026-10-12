/** @fileoverview Replays complete original cppu-private Mapping and MappingEntry lifetime/callback/value streams with actual shared owners and pure caller records. */
import { it } from "vitest";
import type { uno_Mapping } from "../../inc/uno/mapping";
import type { Mapping as Owner, MappingEntry as Entry } from "./lbmap";
import fixture from "./native-mapping-lifetime-cases.json";
import { createUnoNativeContext } from "../../../test/uno-native-values";
for (const mode of ["mapping", "entries"] as const) {
  it(`matches complete original private mapping ${mode} stream`, /** Replays every original initialized observation, including old-owner publication and actual string lifetimes. @returns Whole parity. */ async () => {
    const x = await createUnoNativeContext(fixture.captures[mode]),
      { Mapping, MappingEntry } = await import("./lbmap");
    /** Caller-owned declared mapping record with observation labels/counters; no mapping engine/provider. */
    type Input = uno_Mapping & { label: number; count: number };
    let watched: Owner | null = null;
    /** Original pure caller label. @param p - Actual borrowed record. @returns Pointer label. */
    function identity(p: uno_Mapping | null): number {
      return p === null ? -1 : (p as Input).label;
    }
    /** Original pure caller acquisition callback, observing current owner before publication. @param p - Actual record. @returns Nothing. */
    function acquire(p: uno_Mapping): void {
      const r = p as Input;
      x.emit(30, r.label, ++r.count, watched === null ? -2 : identity(watched.get()));
    }
    /** Original pure caller release callback, observing current owner before publication. @param p - Actual record. @returns Nothing. */
    function release(p: uno_Mapping): void {
      const r = p as Input;
      x.emit(31, r.label, --r.count, watched === null ? -2 : identity(watched.get()));
    }
    /** Caller free-function identity, not invoked by these value owners. @returns Nothing. */
    function freeA(): void {}
    /** Second borrowed caller free-function identity. @returns Nothing. */
    function freeB(): void {}
    /** Actual declared callback record, not a mapping/registry provider. @param label - Caller label. @returns Input record. */
    function input(label: number): Input {
      return { label, count: 100, acquire, release, mapInterface: null };
    }
    /** Complete original pointer/get/is observation. @param o - Live owner. @returns Nothing. */
    function snapshot(o: Owner): void {
      x.emit(70, identity(o.get()), o.is());
    }
    /** Complete initialized registry-entry value observation. @param e - Live entry. @returns Nothing. */
    function entry(e: Entry): void {
      x.emit(
        71,
        e.nRef,
        identity(e.pMapping),
        e.freeMapping === freeA ? 1 : e.freeMapping === freeB ? 2 : 0,
      );
      x.text(e.aMappingName.pData);
    }
    const a = input(0),
      b = input(1);
    if (mode === "mapping") {
      const d = new Mapping();
      snapshot(d);
      const emptyCopy = new Mapping(d);
      snapshot(emptyCopy);
      const emptyMove = Mapping.move(emptyCopy);
      snapshot(emptyCopy);
      snapshot(emptyMove);
      const aa = new Mapping(a);
      snapshot(aa);
      const copied = new Mapping(aa);
      snapshot(copied);
      const moved = Mapping.move(copied);
      snapshot(copied);
      snapshot(moved);
      watched = aa;
      x.emit(40, aa.assign(b) === aa);
      snapshot(aa);
      aa.assign(b);
      snapshot(aa);
      aa.assign(null);
      snapshot(aa);
      x.emit(41, aa.moveAssign(moved) === aa);
      snapshot(aa);
      snapshot(moved);
      aa.moveAssign(aa);
      snapshot(aa);
      watched = d;
      d.assign(a);
      snapshot(d);
      copied.assign(b);
      snapshot(copied);
      d.moveAssign(copied);
      snapshot(d);
      snapshot(copied);
      d.moveAssign(aa);
      snapshot(d);
      snapshot(aa);
      d.assign(null);
      snapshot(d);
      watched = null;
      const live = new Mapping(a);
      snapshot(live);
      copied.assign(b);
      snapshot(copied);
      live.dispose();
      moved.dispose();
      copied.dispose();
      aa.dispose();
      emptyMove.dispose();
      emptyCopy.dispose();
      d.dispose();
      x.emit(99, a.count, b.count);
    } else {
      const name = x.name("mapping"),
        e = new MappingEntry(a, freeA, name);
      entry(e);
      x.text(name.pData);
      e.nRef = -13;
      e.freeMapping = freeB;
      const c = new MappingEntry(e);
      entry(e);
      entry(c);
      const m = MappingEntry.move(c);
      entry(c);
      entry(m);
      const other = x.name("other"),
        d = MappingEntry.fromMovedString(null, null, other);
      other.dispose();
      entry(d);
      x.emit(42, d.assign(e) === d);
      entry(d);
      d.assign(d);
      entry(d);
      x.emit(43, d.moveAssign(m) === d);
      entry(d);
      entry(m);
      d.moveAssign(d);
      entry(d);
      d.dispose();
      m.dispose();
      c.dispose();
      e.dispose();
      x.text(name.pData);
      const value = x.name("rvalue"),
        r = MappingEntry.fromMovedString(b, null, value);
      entry(r);
      x.text(value.pData);
      r.dispose();
      x.text(value.pData);
      x.emit(99, a.count, b.count);
      value.dispose();
      name.dispose();
    }
    x.finish();
  });
}
