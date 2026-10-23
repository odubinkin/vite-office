/** @fileoverview Original context cursor ownership,old-position subscriptions and explicit broadcaster purge. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScFormulaCell } from "../../../inc/formulacell";
import { ColumnBlockPosition, ColumnBlockPositionSet } from "../../../inc/mtvelements";
import { StartListeningContext, EndListeningContext } from "../../../inc/listenercontext";
import { ScRecalcMode } from "../../../../formula/inc/tokenarray";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it("shares actual cached store cursors and defers empty broadcaster deletion until explicit purge", /** Context removal retains empty native broadcaster objects and updates real hints. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const positions = new ColumnBlockPositionSet(doc),
    start = new StartListeningContext(doc, positions),
    end = new EndListeningContext(doc, positions),
    target = new ScAddress(0, 2, 0),
    cell = new ScFormulaCell(doc, new ScAddress(1, 2, 0), unicode("=A3+A4"), doc.GetGrammar());
  cell.SetNeedsListening(true);
  expect(cell.NeedsListening()).toBe(true);
  expect(start.getDoc()).toBe(doc);
  expect(end.getDoc()).toBe(doc);
  expect(end.getOldCode()).toBeNull();
  expect(start.getBlockPosition(0, 0)).toBe(end.getBlockPosition(0, 0));
  expect(doc.IsDetectiveDirty()).toBe(false);
  cell.StartListeningTo(start);
  expect(cell.NeedsListening()).toBe(false);
  expect(doc.IsDetectiveDirty()).toBe(true);
  const column = doc.FetchTable(0)?.FetchColumn(0);
  assert(column);
  const broadcaster = column.GetBroadcaster(2);
  assert(broadcaster);
  expect(broadcaster.HasListeners()).toBe(true);
  cell.EndListeningTo(end);
  expect(cell.HasBroadcaster()).toBe(false);
  expect(column.GetBroadcaster(2)).toBe(broadcaster);
  expect(column.GetBroadcaster(3)?.HasListeners()).toBe(false);
  end.purgeEmptyBroadcasters();
  expect(column.GetBroadcaster(2)).toBeNull();
  expect(column.GetBroadcaster(3)).toBeNull();
  cell.StartListeningTo(start);
  expect(column.GetBroadcaster(target.Row())?.HasListeners()).toBe(true);
  cell.EndListeningTo(end);
  end.purgeEmptyBroadcasters();
  const cursor = new ColumnBlockPosition();
  expect(doc.InitColumnBlockPosition(cursor, 0, 0)).toBe(true);
  expect(cursor.miCellPos?.get().size).toBe(doc.GetMaxRowCount());
  positions.clear();
  expect(positions.getBlockPosition(0, 0)).not.toBe(start.getBlockPosition(0, 1));
  cell.Dispose();
  doc.Dispose();
});
it("ends the previous code at its actual displaced position rather than the current reference", /** Actual public address/code changes exercise both native end overloads. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const cell = new ScFormulaCell(doc, new ScAddress(1, 2, 0), unicode("=A3"), doc.GetGrammar()),
    oldCode = cell.GetCode().Clone();
  cell.StartListeningTo(new StartListeningContext(doc));
  const column = doc.FetchTable(0)?.FetchColumn(0);
  assert(column);
  cell.aPos.IncRow(1);
  const end = new EndListeningContext(doc, oldCode),
    delta = new ScAddress(0, -1, 0);
  end.setPositionDelta(delta);
  delta.SetRow(5);
  expect(end.getOldPosition(cell.aPos).Row()).toBe(2);
  cell.EndListeningTo(end);
  expect(column.GetBroadcaster(2)?.HasListeners()).toBe(false);
  end.purgeEmptyBroadcasters();
  expect(column.GetBroadcaster(2)).toBeNull();
  cell.StartListeningTo(doc);
  cell.aPos.IncRow(1);
  cell.EndListeningTo(doc, oldCode, new ScAddress(1, 3, 0));
  expect(column.GetBroadcaster(3)).toBeNull();
  doc.SetDetectiveDirty(false);
  cell.EndListeningTo(doc);
  expect(doc.IsDetectiveDirty()).toBe(false);
  cell.Dispose();
  doc.Dispose();
});
it("uses the always area and preserves old-code selection in the context overload", /** Native always mode registers no individual reference subscription. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const cell = new ScFormulaCell(doc, new ScAddress(1, 1, 0), unicode("=A2"), doc.GetGrammar());
  cell.GetCode().AddRecalcMode(ScRecalcMode.ALWAYS);
  cell.SetNeedsListening(true);
  cell.StartListeningTo(doc);
  expect(cell.HasBroadcaster()).toBe(true);
  expect(cell.NeedsListening()).toBe(false);
  expect(doc.FetchTable(0)?.FetchColumn(0)?.GetBroadcaster(1)).toBeNull();
  const old = cell.GetCode().Clone();
  cell.GetCode().SetExclusiveRecalcModeNormal();
  cell.EndListeningTo(new EndListeningContext(doc, old));
  expect(cell.HasBroadcaster()).toBe(false);
  cell.GetCode().AddRecalcMode(ScRecalcMode.ALWAYS);
  cell.StartListeningTo(new StartListeningContext(doc));
  cell.EndListeningTo(doc);
  expect(cell.HasBroadcaster()).toBe(false);
  cell.Dispose();
  doc.Dispose();
});
it("keeps original missing-owner cursor behavior and validates native forwarding boundaries", /** Failed initial insertion stays cached as in mtvelements.cxx;no bogus iterator is consumed. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    positions = new ColumnBlockPositionSet(doc),
    cursor = new ColumnBlockPosition();
  expect(positions.getBlockPosition(2, 0)).toBeNull();
  const retained = positions.getBlockPosition(2, 0);
  assert(retained);
  expect(retained.miBroadcasterPos).toBeUndefined();
  expect(doc.InitColumnBlockPosition(cursor, 0, 0)).toBe(false);
  doc.DeleteBroadcasters(cursor, new ScAddress(0, 0, 0), 1);
  doc.InsertTab(0, unicode("Data"));
  expect(doc.InitColumnBlockPosition(cursor, 0, -1)).toBe(false);
  expect(doc.InitColumnBlockPosition(cursor, 0, 0)).toBe(true);
  doc.DeleteBroadcasters(cursor, new ScAddress(0, 0, 0), 0);
  doc.DeleteBroadcasters(cursor, new ScAddress(doc.MaxCol() + 1, 0, 0), 1);
  doc.DeleteBroadcasters(cursor, new ScAddress(4, 0, 0), 1);
  const cell = new ScFormulaCell(doc, new ScAddress(1, 0, 0), unicode("=2"), doc.GetGrammar()),
    start = new StartListeningContext(doc),
    end = new EndListeningContext(doc);
  doc.StartListeningCell(start, new ScAddress(0, -1, 0), cell);
  doc.StartListeningCell(start, new ScAddress(0, 0, 2), cell);
  doc.StartListeningCell(start, new ScAddress(-1, 0, 0), cell);
  doc.EndListeningCell(end, new ScAddress(4, 0, 0), cell);
  doc.EndListeningCell(end, new ScAddress(0, 0, 0), cell);
  doc.EndListeningCell(end, new ScAddress(0, 0, 2), cell);
  expect(cell.HasBroadcaster()).toBe(false);
  positions.clear();
  expect(positions.getBlockPosition(0, 0)).not.toBe(retained);
  cell.Dispose();
  doc.Dispose();
});
it("retains nonempty broadcasters and skips missing sparse owners during deferred purge", /** Actual listeners share a row;only the final removal tags its broadcaster. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const a = new ScFormulaCell(doc, new ScAddress(1, 2, 0), unicode("=A3"), doc.GetGrammar()),
    b = new ScFormulaCell(doc, new ScAddress(2, 2, 0), unicode("=A3"), doc.GetGrammar()),
    start = new StartListeningContext(doc),
    end = new EndListeningContext(doc);
  a.StartListeningTo(start);
  b.StartListeningTo(start);
  const column = doc.FetchTable(0)?.FetchColumn(0);
  assert(column);
  const broadcaster = column.GetBroadcaster(2);
  assert(broadcaster);
  a.EndListeningTo(end);
  end.purgeEmptyBroadcasters();
  expect(broadcaster.HasListeners()).toBe(true);
  b.EndListeningTo(end);
  end.addEmptyBroadcasterPosition(3, 0, 0);
  end.addEmptyBroadcasterPosition(0, 4, 0);
  end.purgeEmptyBroadcasters();
  expect(column.GetBroadcaster(2)).toBeNull();
  const missingStart = new StartListeningContext(doc),
    missingEnd = new EndListeningContext(doc),
    address = new ScAddress(0, 0, 5);
  column.StartListening(missingStart, address, a);
  column.EndListening(missingEnd, address, a);
  expect(a.HasBroadcaster()).toBe(false);
  a.Dispose();
  b.Dispose();
  doc.Dispose();
});
