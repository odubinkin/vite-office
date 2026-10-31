/** @fileoverview Native UNO cursor ownership and document notification contracts from pinned unocrsr.hxx/cxx and docnew.cxx. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPosition, SwPaM } from "../crsr/pam";
import { SwCursor, SwTableCursor } from "../crsr/swcrsr";
import {
  SwUnoCursor,
  SwUnoTableCursor,
  UnoCursorSharedPtr,
  UnoCursorPointer,
  UnoCursorHint,
} from "../../../inc/unocrsr";
import { SfxListener } from "../../../../svl/source/notify/lstner";
import { SfxBroadcaster } from "../../../../svl/source/notify/SfxBroadcaster";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";

/** Requires an actual native fixture owner. @param value - Actual optional owner. @returns Checked owner. */
function present<T>(value: T | undefined): T {
  assert(value !== undefined);
  return value;
}

it("creates actual ordinary and table owners with original defaults and separate table selection ring", /** Checks native factory and table construction. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    pos = new SwPosition(present(doc.paragraphs[0]));
  const ordinary = doc.CreateUnoCursor(pos),
    table = doc.CreateUnoCursor(pos, true);
  const cursor = ordinary.get(),
    tableCursor = table.get();
  assert(cursor instanceof SwUnoCursor);
  assert(tableCursor instanceof SwUnoTableCursor);
  expect(cursor).toBeInstanceOf(SwCursor);
  expect(cursor.IsRemainInSection()).toBe(true);
  expect(cursor.IsSkipOverHiddenSections()).toBe(false);
  expect(cursor.IsSkipOverProtectSections()).toBe(false);
  expect(cursor.IsReadOnlyAvailable()).toBe(true);
  cursor.SetSkipOverHiddenSections(true);
  cursor.SetSkipOverProtectSections(true);
  cursor.SetRemainInSection(false);
  expect(cursor.IsSkipOverHiddenSections()).toBe(true);
  expect(cursor.IsSkipOverProtectSections()).toBe(true);
  expect(cursor.IsRemainInSection()).toBe(false);
  expect(tableCursor).toBeInstanceOf(SwTableCursor);
  expect(tableCursor.IsRemainInSection()).toBe(false);
  expect(tableCursor.GetSelRing()).toBeInstanceOf(SwCursor);
  expect(tableCursor.GetSelRing()).not.toBe(tableCursor);
  expect(tableCursor.GetSelRing().GetPoint().compare(pos)).toBe(0);
  expect(doc.mvUnoCursorTable).toHaveLength(2);
  ordinary.reset();
  table.reset();
  pos.Dispose();
  doc.Dispose();
});

it("keeps only weak document entries and releases the actual cursor at the last strong value", /** Covers copy, assignment, temporary lock and expired cleanup. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    pos = new SwPosition(present(doc.paragraphs[0]));
  const first = doc.CreateUnoCursor(pos),
    weak = present(doc.mvUnoCursorTable[0]);
  const borrowed = first.get(),
    copy = new UnoCursorSharedPtr(first),
    assigned = new UnoCursorSharedPtr();
  expect(first.use_count()).toBe(2);
  assigned.assign(copy);
  assigned.assign(assigned);
  expect(first.use_count()).toBe(3);
  first.reset();
  copy.reset();
  expect(weak.expired()).toBe(false);
  const locked = weak.lock();
  expect(locked.get()).toBe(borrowed);
  expect(assigned.use_count()).toBe(2);
  assigned.reset();
  doc.cleanupUnoCursorTable();
  expect(doc.mvUnoCursorTable).toHaveLength(1);
  locked.reset();
  expect(weak.expired()).toBe(true);
  const empty = weak.lock();
  expect(empty.get()).toBeUndefined();
  expect(empty.use_count()).toBe(0);
  doc.cleanupUnoCursorTable();
  expect(doc.mvUnoCursorTable).toHaveLength(0);
  pos.Dispose();
  doc.Dispose();
});

it("destroys both native cursor rings rather than leaving selected positions registered", /** Uses actual registered indices to observe destruction without querying freed positions. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = present(doc.paragraphs[0]),
    pos = new SwPosition(node);
  const held = doc.CreateUnoCursor(pos, true),
    cursor = held.get();
  assert(cursor instanceof SwUnoTableCursor);
  const ordinaryPeer = new SwPaM(pos, undefined, cursor);
  const selection = cursor.GetSelRing();
  const selectionPeer = new SwPaM(pos, undefined, selection);
  const ordinaryDisposed = vi.spyOn(ordinaryPeer, "Dispose");
  const selectionDisposed = vi.spyOn(selection, "Dispose");
  const selectionPeerDisposed = vi.spyOn(selectionPeer, "Dispose");
  held.reset();
  expect(ordinaryDisposed).toHaveBeenCalledOnce();
  expect(selectionDisposed).toHaveBeenCalledOnce();
  expect(selectionPeerDisposed).toHaveBeenCalledOnce();
  vi.restoreAllMocks();
  pos.Dispose();
  doc.Dispose();
});

it("copies assigns and resets pointer ownership with reciprocal real listener registration", /** Exercises original owner operations on two live source cursors. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    pos = new SwPosition(present(doc.paragraphs[0]));
  const a = doc.CreateUnoCursor(pos),
    b = doc.CreateUnoCursor(pos);
  const pointer = new UnoCursorPointer(a),
    copied = new UnoCursorPointer(pointer);
  expect(present(a.get()).m_aNotifier.GetListenerCount()).toBe(2);
  const other = new UnoCursorPointer(b);
  copied.assign(other);
  expect(copied.get()).toBe(b.get());
  expect(present(a.get()).m_aNotifier.GetListenerCount()).toBe(1);
  expect(present(b.get()).m_aNotifier.GetListenerCount()).toBe(2);
  pointer.reset(b);
  expect(present(a.get()).m_aNotifier.GetListenerCount()).toBe(0);
  pointer.assign(pointer);
  expect(present(b.get()).m_aNotifier.GetListenerCount()).toBe(3);
  pointer.reset();
  copied.Dispose();
  other.Dispose();
  expect(present(b.get()).m_aNotifier.HasListeners()).toBe(false);
  a.reset();
  b.reset();
  pos.Dispose();
  doc.Dispose();
});

it("retains upstream duplicate-listener precondition for reset to the same cursor", /** Preserves the source Start-new-before-End-old ordering. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    pos = new SwPosition(present(doc.paragraphs[0]));
  const held = doc.CreateUnoCursor(pos),
    pointer = new UnoCursorPointer(held);
  expect(
    /** Exercises the native same-owner reset precondition. @returns Nothing. */ () =>
      pointer.reset(held),
  ).toThrow("Unexpected duplicate listener");
  expect(pointer.get()).toBe(held.get());
  expect(present(held.get()).m_aNotifier.GetListenerCount()).toBe(1);
  pointer.Dispose();
  held.reset();
  pos.Dispose();
  doc.Dispose();
});

it("drops pointer ownership only after its last actual broadcaster registration ends", /** Checks original hint and listener-count semantics. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    pos = new SwPosition(present(doc.paragraphs[0]));
  const held = doc.CreateUnoCursor(pos),
    pointer = new UnoCursorPointer(held),
    extra = new SfxBroadcaster();
  pointer.StartListening(extra);
  present(held.get()).m_aNotifier.Broadcast(new UnoCursorHint());
  expect(pointer.get()).toBe(held.get());
  expect(pointer.GetBroadcasterCount()).toBe(1);
  extra.Broadcast(new UnoCursorHint());
  expect(pointer.get()).toBeUndefined();
  pointer.Dispose();
  extra.Dispose();
  held.reset();
  pos.Dispose();
  doc.Dispose();
});

it("holds the document weak lock through all hint callbacks before the last-owner dying notification", /** Observes real broadcast order while pointer listeners relinquish the last permanent owners. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    pos = new SwPosition(present(doc.paragraphs[0]));
  const held = doc.CreateUnoCursor(pos),
    pointer = new UnoCursorPointer(held),
    events: SfxHintId[] = [];
  /** Real source observer sees the temporary document lock remain live through Hint. */
  class Observer extends SfxListener {
    /** Records native source hints. @param source - Actual broadcaster. @param hint - Actual hint. @returns Nothing. */
    override Notify(source: SfxBroadcaster, hint: SfxHint): void {
      events.push(hint.GetId());
      if (hint.GetId() === SfxHintId.SwUnoCursorHint) {
        expect(pointer.get()).toBeUndefined();
        expect(present(doc.mvUnoCursorTable[0]).expired()).toBe(false);
        expect(source.HasListeners()).toBe(true);
      }
    }
  }
  const observer = new Observer();
  observer.StartListening(present(held.get()).m_aNotifier);
  held.reset();
  pos.Dispose();
  doc.Dispose();
  expect(events).toEqual([SfxHintId.SwUnoCursorHint, SfxHintId.Dying]);
  expect(present(doc.mvUnoCursorTable[0]).expired()).toBe(true);
  expect(observer.GetBroadcasterCount()).toBe(0);
  observer.Dispose();
  pointer.Dispose();
});

it("wires the real native cursor into the text API and rejects access after document invalidation", /** Covers real API construction, expanded range and document ownership. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    model = new SwXTextDocument(doc),
    text = model.getText();
  present(doc.paragraphs[0]).SetText("abcd");
  const cursor = text.createTextCursor();
  expect(cursor.GetCursor()).toBeInstanceOf(SwUnoCursor);
  cursor.goRight(1, false);
  cursor.goRight(2, true);
  expect(cursor.GetCursor().Start().GetContentIndex()).toBe(1);
  expect(cursor.GetCursor().End().GetContentIndex()).toBe(3);
  expect((cursor.GetCursor() as SwUnoCursor).IsRemainInSection()).toBe(true);
  const weak = present(doc.mvUnoCursorTable[0]);
  doc.Dispose();
  expect(weak.expired()).toBe(true);
  let failure: unknown;
  try {
    cursor.GetCursor();
  } catch (error) {
    failure = error;
  }
  expect(failure).toBeDefined();
  cursor.dispose();
  model.dispose();
});

it("releases the API cursor without requiring document destruction", /** Covers the native component dispose path and weak cleanup. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    model = new SwXTextDocument(doc),
    cursor = model.getText().createTextCursor();
  const weak = present(doc.mvUnoCursorTable[0]);
  cursor.dispose();
  expect(weak.expired()).toBe(true);
  doc.cleanupUnoCursorTable();
  expect(doc.mvUnoCursorTable).toHaveLength(0);
  model.dispose();
  doc.Dispose();
});
