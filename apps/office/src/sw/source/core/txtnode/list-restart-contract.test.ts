/** @fileoverview Compares Writer restart flag/value setters to six complete unchanged pinned native definitions. */
import { expect, it, vi } from "vitest";
import native from "../../../../test/writer-native-list-restart.json";
import { SwDoc } from "../doc/doc";
import type { SwTextNode } from "./ndtxt";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { WRITER_TEXT_NODE_WHICH_RANGES } from "../../../inc/hintids";
import { SwUndoInsNum } from "../undo/unnum";
import { createWriterCollapsedCursorState } from "../undo/undobj";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

it("matches literal native flag/value states and mutation attempts in normal and reading documents", /** Checks84 states including equal inputs, signed narrowing, sentinel and rule-format/default separation. @returns Nothing. */ () => {
  let states = 0;
  for (const reading of [false, true]) {
    for (const test of native.cases) {
      const doc = new SwDoc();
      doc.SetInReading(reading);
      const node = doc.paragraphs[0] as SwTextNode;
      if (test.rule) {
        doc.EnsureNumRule("Restart format", "numbered").GetNumFormat(0).SetStart(9);
        node.SetNumRule("Restart format");
      }
      const put = vi.spyOn(node, "SetAttr");
      const clear = vi.spyOn(node, "ResetAttr");
      /** Compares a real paragraph with one literal native state. @param step - Source trace index. @returns Nothing. */
      function check(step: number): void {
        const calls: unknown[] = [];
        for (const [item] of put.mock.calls) {
          const value = item as SfxPoolItem;
          calls.push(["set", value.Which(), value.QueryValue()]);
        }
        for (const [which] of clear.mock.calls) calls.push(["reset", which]);
        expect(
          {
            restart: node.IsListRestart(),
            direct: node.HasAttrListRestartValue() ? node.GetAttrListRestartValue() : null,
            effective: node.GetAttr(86).QueryValue(),
            start: node.GetActualListStartValue(),
            calls,
          },
          `${test.name}; reading=${reading}; step=${step}`,
        ).toEqual(test.states[step]);
        states += 1;
        put.mockClear();
        clear.mockClear();
      }
      check(0);
      for (const [step, operation] of test.operations.entries()) {
        const [kind, value] = operation;
        if (kind === "flag") node.SetListRestart(value as boolean);
        else node.SetAttrListRestartValue(value as number);
        check(step + 1);
      }
      put.mockRestore();
      clear.mockRestore();
    }
  }
  expect(states).toBe(84);
});

it("retains inactive values through real list counters, undo and Worker16 before reactivation", /** Exercises independent flag transitions without losing zero or seven. @returns Nothing. */ () => {
  for (const value of [0, 7]) {
    const doc = new SwDoc();
    const first = doc.paragraphs[0] as SwTextNode;
    const second = doc.GetNodes().MakeTextNode();
    const rule = doc.EnsureNumRule("Counter restart", "numbered");
    rule.GetNumFormat(0).SetStart(9);
    first.SetNumRule(rule.GetName());
    second.SetNumRule(rule.GetName());
    first.SetAttrListRestartValue(value);
    expect(first.IsListRestart()).toBe(false);
    expect(first.GetAttrListRestartValue()).toBe(value);
    expect([first.GetListItemNumber(), second.GetListItemNumber()]).toEqual([9, 10]);
    first.SetListRestart(true);
    expect([first.GetListItemNumber(), second.GetListItemNumber()]).toEqual([value, value + 1]);
    const before = first.CaptureListItems();
    const cursor = createWriterCollapsedCursorState(
      first,
      0,
      new SfxItemSet(doc.GetAttrPool(), WRITER_TEXT_NODE_WHICH_RANGES),
    );
    first.SetListRestart(false);
    expect(first.HasAttrListRestartValue()).toBe(true);
    expect(first.GetAttrListRestartValue()).toBe(value);
    expect([first.GetListItemNumber(), second.GetListItemNumber()]).toEqual([9, 10]);
    const undo = new SwUndoInsNum(first, before, first.CaptureListItems(), cursor, cursor);
    const restored: unknown[] = [];
    const context = {
      /** Returns the undo-owned document. @returns Document. */
      GetDoc: () => doc,
      /** Records cursor restoration. @param state - Retained cursor. @returns Nothing. */
      RestoreCursor: (state: unknown) => {
        restored.push(state);
      },
    };
    undo.UndoWithContext(context);
    expect(first.IsListRestart()).toBe(true);
    expect(first.GetAttrListRestartValue()).toBe(value);
    expect(first.GetListItemNumber()).toBe(value);
    undo.RedoWithContext(context);
    expect(first.IsListRestart()).toBe(false);
    expect(first.GetAttrListRestartValue()).toBe(value);
    expect(first.GetListItemNumber()).toBe(9);
    expect(restored).toHaveLength(2);
    const transferred = decodeWriterDocument(encodeWriterDocument(doc));
    const reopened = transferred.paragraphs[0] as SwTextNode;
    expect(reopened.IsListRestart()).toBe(false);
    expect(reopened.GetAttrListRestartValue()).toBe(value);
    expect(reopened.GetListItemNumber()).toBe(9);
    reopened.SetListRestart(true);
    expect(reopened.GetListItemNumber()).toBe(value);
    expect((transferred.paragraphs[1] as SwTextNode).GetListItemNumber()).toBe(value + 1);
    reopened.SetAttrListRestartValue(65_535);
    expect(reopened.IsListRestart()).toBe(true);
    expect(reopened.HasAttrListRestartValue()).toBe(false);
    expect(reopened.GetAttr(86).QueryValue()).toBe(1);
    expect(reopened.GetListItemNumber()).toBe(9);
  }
});
