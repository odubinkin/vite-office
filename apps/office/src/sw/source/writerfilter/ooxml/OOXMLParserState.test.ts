/** @fileoverview Exercises native shared parser-state transitions with actual property references and ordered Stream delivery, including nested floating tables and break control bytes. */
import { expect, it } from "vitest";
import type { Stream, Reference, Properties } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { OOXMLParserState } from "./OOXMLParserState";
import { OOXMLBreakHandler } from "./Handler";
import {
  OOXMLPropertySet as Set,
  OOXMLPropertyType as Type,
  OOXMLValue as V,
} from "./OOXMLPropertySet";

/** Constructs actual native ordered properties. @param entries - ID/value pairs. @returns Set. */
function properties(...entries: [number, number][]): Set {
  const result = new Set();
  for (const [id, value] of entries) result.add(id, V.createInteger(value), Type.ATTRIBUTE);
  return result;
}
/** Captures actual resource delivery without changing or mocking parser decisions. */
class Receiver implements Pick<Stream, "props" | "text"> {
  readonly refs: Reference<Properties>[] = [];
  readonly events: unknown[] = [];
  /** Records delivered property identities and values. @param ref - Native resource. @returns Nothing. */
  props(ref: Reference<Properties>): void {
    this.refs.push(ref);
    const values: [number, number][] = [];
    ref.resolve({
      /** Reads native attributes. @param id - ID. @param value - Value. @returns Nothing. */
      attribute(id, value) {
        values.push([id, value.getInt()]);
      },
      /** Reads native nested modifier identities. @param value - Modifier. @returns Nothing. */
      sprm(value) {
        const nested = value.getValue();
        if (!nested) throw new Error("Expected nonempty test property.");
        values.push([value.getId(), nested.getInt()]);
      },
    });
    this.events.push(values);
  }
  /** Records precisely the consumed byte range. @param data - Bytes. @param length - Logical size. @returns Nothing. */
  text(data: Uint8Array, length: number): void {
    this.events.push([...data.slice(0, length)]);
  }
}

it("retains native initial flags, mutable alternate states, context handles and borrowed document delegation", /** Checks public source-state transitions and required document precondition. @returns Nothing. */ () => {
  const state = new OOXMLParserState();
  expect([
    state.isInSectionGroup(),
    state.isInParagraphGroup(),
    state.isInCharacterGroup(),
    state.isLastParagraphInSection(),
    state.isStartFootnote(),
    state.GetFloatingTableEnded(),
  ]).toEqual([false, false, false, false, false, false]);
  expect(state.isForwardEvents()).toBe(true);
  state.setForwardEvents(false);
  expect(state.isForwardEvents()).toBe(false);
  state.setInSectionGroup(true);
  state.setInParagraphGroup(true);
  state.setInCharacterGroup(true);
  state.setLastParagraphInSection(true);
  state.setStartFootnote(true);
  state.SetFloatingTableEnded(true);
  expect([
    state.isInSectionGroup(),
    state.isInParagraphGroup(),
    state.isInCharacterGroup(),
    state.isLastParagraphInSection(),
    state.isStartFootnote(),
    state.GetFloatingTableEnded(),
  ]).toEqual([true, true, true, true, true, true]);
  state.getSavedAlternateStates().push({ m_bDiscardChildren: true, m_bTookChoice: false });
  expect(state.getSavedAlternateStates()).toEqual([
    { m_bDiscardChildren: true, m_bTookChoice: false },
  ]);
  expect(state.getHandle()).toBe("0");
  state.incContextCount();
  state.incContextCount();
  state.setHandle();
  state.incContextCount();
  expect(state.getHandle()).toBe("2");
  state.setHandle();
  expect(state.getHandle()).toBe("3");
  expect(state.getDocument()).toBeNull();
  expect(
    /** Exposes the native null pointer precondition. @returns Never. */ () => state.getTarget(),
  ).toThrow("document pointer is null");
  let id = -1;
  const document = {
    /** Original setter target. @param value - ID. @returns Nothing. */ setXNoteId(value: number) {
      id = value;
    },
    /** Original getter target. @returns ID. */ getXNoteId() {
      return id;
    },
    /** Records the document progress callback outside this state-only test. @returns Nothing. */ incrementProgress() {},
    /** Original lexical target. @returns Target. */ getTarget() {
      return "word/footnotes.xml";
    },
  };
  state.setDocument(document);
  expect(state.getDocument()).toBe(document);
  state.setXNoteId(-2);
  expect(state.getXNoteId()).toBe(-2);
  expect(state.getTarget()).toBe("word/footnotes.xml");
  state.setDocument(null);
  expect(state.getDocument()).toBeNull();
});

it("preserves single textbox saved-state behavior even for nested and unmatched content", /** Native nesting warns but overwrites its single saved state; section state is never reset. @returns Nothing. */ () => {
  const state = new OOXMLParserState();
  state.endTxbxContent();
  state.setInSectionGroup(true);
  state.setInParagraphGroup(true);
  state.setInCharacterGroup(true);
  state.setLastParagraphInSection(true);
  state.startTxbxContent();
  expect([
    state.isInSectionGroup(),
    state.isInParagraphGroup(),
    state.isInCharacterGroup(),
    state.isLastParagraphInSection(),
  ]).toEqual([true, false, false, false]);
  state.endTxbxContent();
  expect([
    state.isInParagraphGroup(),
    state.isInCharacterGroup(),
    state.isLastParagraphInSection(),
  ]).toEqual([true, true, true]);
  state.startTxbxContent();
  state.startTxbxContent();
  state.endTxbxContent();
  state.endTxbxContent();
  expect([
    state.isInSectionGroup(),
    state.isInParagraphGroup(),
    state.isInCharacterGroup(),
    state.isLastParagraphInSection(),
  ]).toEqual([true, false, false, false]);
});

it("merges character references and resets only after ordered delivery", /** Retains shared native identity and duplicate attributes. @returns Nothing. */ () => {
  const state = new OOXMLParserState(),
    stream = new Receiver();
  state.resolveCharacterProperties(stream);
  state.setCharacterProperties(null);
  const first = properties([1, 10]);
  state.setCharacterProperties(first);
  state.setCharacterProperties(null);
  state.setCharacterProperties(properties([1, 20]));
  state.resolveCharacterProperties(stream);
  state.resolveCharacterProperties(stream);
  expect(stream.refs).toEqual([first]);
  expect(stream.events).toEqual([
    [
      [1, 10],
      [1, 20],
    ],
  ]);
  state.setCharacterProperties(properties([2, 30]));
  state.resolveCharacterProperties(stream);
  expect(stream.events.at(-1)).toEqual([[2, 30]]);
});

it("scopes cell and row references to nested tables and emits allocated empty sets on repeat resolution", /** Covers ignored outside-table updates and native post-delivery allocation. @returns Nothing. */ () => {
  const state = new OOXMLParserState(),
    stream = new Receiver();
  state.setCellProperties(properties([1, 1]));
  state.setRowProperties(properties([2, 2]));
  state.resolveCellProperties(stream);
  state.resolveRowProperties(stream);
  expect(stream.events).toEqual([]);
  state.startTable();
  state.setCellProperties(null);
  state.setRowProperties(null);
  state.resolveCellProperties(stream);
  state.resolveRowProperties(stream);
  const cell = properties([1, 3]),
    row = properties([2, 4]);
  state.setCellProperties(cell);
  state.setCellProperties(properties([1, 5]));
  state.setRowProperties(row);
  state.setRowProperties(properties([2, 6]));
  state.startTable();
  state.setCellProperties(properties([7, 7]));
  state.setRowProperties(properties([8, 8]));
  state.resolveCellProperties(stream);
  state.resolveRowProperties(stream);
  state.endTable();
  state.resolveCellProperties(stream);
  state.resolveRowProperties(stream);
  state.resolveCellProperties(stream);
  state.resolveRowProperties(stream);
  expect(stream.events).toEqual([
    [[7, 7]],
    [[8, 8]],
    [
      [1, 3],
      [1, 5],
    ],
    [
      [2, 4],
      [2, 6],
    ],
    [],
    [],
  ]);
  expect(stream.refs[2]).toBe(cell);
  expect(stream.refs[3]).toBe(row);
  expect(stream.refs[4]).not.toBe(cell);
  state.setCellProperties(properties([9, 9]));
  state.setRowProperties(properties([10, 10]));
  state.resolveCellProperties(stream);
  state.resolveRowProperties(stream);
  expect(stream.events.slice(-2)).toEqual([[[9, 9]], [[10, 10]]]);
  state.endTable();
  expect(
    /** Exposes the native nonempty-stack precondition. @returns Never. */ () => state.endTable(),
  ).toThrow("stack underflow");
});

it("retains table properties across rows and filters positioning only at three floating ancestors", /** Resolves actual property copies while preserving the original table set and floating nesting counter. @returns Nothing. */ () => {
  const state = new OOXMLParserState(),
    stream = new Receiver(),
    positioning = N.LN_CT_TblPrBase_tblpPr;
  state.setTableProperties(properties([positioning, 1]));
  state.resolveTableProperties(stream);
  state.setCurrentTableFloating();
  expect(state.GetTableProperties()).toBeNull();
  state.startTable();
  state.setTableProperties(null);
  state.resolveTableProperties(stream);
  const outer = properties([positioning, 1]);
  state.setTableProperties(outer);
  state.setTableProperties(null);
  state.setTableProperties(properties([3, 3]));
  state.setCurrentTableFloating();
  state.resolveTableProperties(stream);
  state.resolveTableProperties(stream);
  expect(stream.refs).toEqual([outer, outer]);
  state.startTable();
  state.setTableProperties(properties([positioning, 2]));
  state.resolveTableProperties(stream);
  state.startTable();
  const inner = properties([positioning, 3], [4, 4]);
  state.setTableProperties(inner);
  state.resolveTableProperties(stream);
  state.resolveTableProperties(stream);
  expect(stream.events.slice(-2)).toEqual([[[4, 4]], [[4, 4]]]);
  expect(state.GetTableProperties()).toBe(inner);
  expect(stream.refs.at(-1)).not.toBe(inner);
  state.startTable();
  const inline = properties([5, 5]);
  state.setTableProperties(inline);
  state.resolveTableProperties(stream);
  expect(stream.refs.at(-1)).toBe(inline);
  state.endTable();
  state.endTable();
  state.resolveTableProperties(stream);
  expect(stream.events.at(-1)).toEqual([[positioning, 2]]);
  state.endTable();
  state.resolveTableProperties(stream);
  expect(stream.refs.at(-1)).toBe(outer);
  state.endTable();
  expect(state.GetTableProperties()).toBeNull();
});

it("delivers break context properties before clear and native byte marker, including default textWrapping", /** Uses actual property resolution and native ignored clear/modifier behavior. @returns Nothing. */ () => {
  for (const [type, expected] of [
    [undefined, 10],
    [N.LN_Value_ST_BrType_textWrapping, 10],
    [N.LN_Value_ST_BrType_page, 12],
    [N.LN_Value_ST_BrType_column, 14],
    [-1, 10],
  ]) {
    const stream = new Receiver(),
      source = properties([9, 9]);
    const handler = new OOXMLBreakHandler(
      {
        /** Borrows actual context properties. @returns Set. */ getPropertySet() {
          return source;
        },
        /** Records original ordering. @returns Nothing. */ clearProps() {
          stream.events.push("clear");
        },
      },
      stream,
    );
    const attrs = type === undefined ? new Set() : properties([N.LN_CT_Br_type, type]);
    attrs.add(N.LN_CT_Br_clear, V.createInteger(1), Type.ATTRIBUTE);
    attrs.add(999, V.createInteger(0), Type.SPRM);
    attrs.add(998, V.createInteger(0), Type.ATTRIBUTE);
    try {
      attrs.resolve(handler);
    } finally {
      handler.dispose();
    }
    expect(stream.events).toEqual([[[9, 9]], "clear", [expected]]);
  }
});

it("retains postponed break references until ordered consumption and clears the queue after delivery", /** Mutating a retained set before delivery remains visible, as with native shared pointers. @returns Nothing. */ () => {
  const state = new OOXMLParserState(),
    stream = new Receiver(),
    page = properties([N.LN_CT_Br_type, N.LN_Value_ST_BrType_page]);
  state.resolvePostponedBreak(stream);
  state.setPostponedBreak(new Set());
  state.setPostponedBreak(page);
  page.add(N.LN_CT_Br_type, V.createInteger(N.LN_Value_ST_BrType_column), Type.ATTRIBUTE);
  state.resolvePostponedBreak(stream);
  state.resolvePostponedBreak(stream);
  expect(stream.events).toEqual([[10], [14]]);
});
