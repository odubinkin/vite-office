/** @fileoverview Verifies native Markdown table cursor ownership; grammar belongs to md4c. */
import { assert, expect, it } from "vitest";
import { SwMarkdownParser } from "./swmd";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwDoc } from "../../core/doc/doc";
import { MDTable } from "./mdtab";
it("advances rows and restarts each row before column zero", /** Pins source -1 counters and row transition. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = doc.paragraphs[0];
  assert(first);
  const point = new SwPosition(first),
    pam = new SwPaM(point),
    parser = new SwMarkdownParser(doc, pam),
    state = new MDTable(parser);
  point.Dispose();
  expect(state.GetCurRow()).toBe(-1);
  expect(state.GetCurCol()).toBe(-1);
  state.IncCurRow();
  state.IncCurCol();
  expect([state.GetCurRow(), state.GetCurCol()]).toEqual([0, 0]);
  state.IncCurCol();
  state.IncCurRow();
  expect([state.GetCurRow(), state.GetCurCol()]).toEqual([1, -1]);
  state.SourceDispose();
  parser.SourceDispose();
  pam.Dispose();
  doc.Dispose();
});

it("retains the original nullable borrowed table pointer", /** The source getter returns null before installation and after an explicit null assignment. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = doc.paragraphs[0];
  assert(first);
  const table = doc.nodes.MakeTableNode("MD"),
    point = new SwPosition(first),
    pam = new SwPaM(point),
    parser = new SwMarkdownParser(doc, pam),
    state = new MDTable(parser);
  point.Dispose();
  expect(state.GetTable()).toBeNull();
  state.SetTable(table);
  expect(state.GetTable()).toBe(table);
  state.SetTable(null);
  expect(state.GetTable()).toBeNull();
  state.SourceDispose();
  parser.SourceDispose();
  pam.Dispose();
  doc.Dispose();
});
