/** @fileoverview Checks the nonfatal restart getter against unchanged native owner bodies and OSL/SAL warning macros. */
import { expect, it, vi } from "vitest";
import native from "../../../../test/writer-native-restart-getter.json";
import { SwDoc } from "../doc/doc";
import type { SwTextNode } from "./ndtxt";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";

it("matches unchanged native absent/direct getter values and nonfatal diagnostics without mutation", /** Compares24 real states with native warning-enabled and disabled return traces. @returns Nothing. */ () => {
  const enabled = native.profiles[1] as (typeof native.profiles)[number];
  const disabled = native.profiles[0] as (typeof native.profiles)[number];
  expect(enabled.warnings).toBe(true);
  expect(disabled.warnings).toBe(false);
  let states = 0;
  const warning = vi
    .spyOn(console, "warn")
    .mockImplementation(
      /** Captures the platform diagnostic without failing the read. @returns Nothing. */ () => {},
    );
  for (const reading of [false, true]) {
    const doc = new SwDoc();
    doc.SetInReading(reading);
    const node = doc.paragraphs[0] as SwTextNode;
    const notification = vi.spyOn(doc, "NotifyModelChange");
    /** Reads the getter and checks literal native state and diagnostics. @param step - Native trace index. @returns Nothing. */
    function check(step: number): void {
      const expected = enabled.states[step] as (typeof enabled.states)[number];
      const withoutWarnings = disabled.states[step] as (typeof disabled.states)[number];
      const direct = node.GetpSwAttrSet();
      const items = direct?.entries().map(
        /** Captures one direct item before read. @param item - Owned item. @returns Scalar identity and value. */
        (item) => [item.Which(), item.QueryValue()],
      );
      notification.mockClear();
      warning.mockClear();
      const read = vi.spyOn(node, "GetAttr");
      const value = node.GetAttrListRestartValue();
      expect(value).toBe(expected.value);
      expect(value).toBe(withoutWarnings.value);
      expect(withoutWarnings.diagnostics).toEqual([]);
      expect(warning.mock.calls).toEqual(
        expected.diagnostics.map(
          /** Maps the native SAL diagnostic to the existing console sink. @param diagnostic - Native message and area. @returns Console message arguments. */
          (diagnostic) => [diagnostic.message],
        ),
      );
      for (const diagnostic of expected.diagnostics) expect(diagnostic.area).toBe("legacy.osl");
      expect(node.HasAttrListRestartValue()).toBe(expected.direct);
      expect(node.HasSwAttrSet()).toBe(expected.allocated);
      expect(direct?.Count() ?? 0).toBe(expected.count);
      expect(node.GetpSwAttrSet()).toBe(direct);
      expect(
        direct?.entries().map(
          /** Captures the same direct item after read. @param item - Owned item. @returns Scalar identity and value. */
          (item) => [item.Which(), item.QueryValue()],
        ),
      ).toEqual(items);
      expect(expected.inParent).toBe(true);
      expect(read).toHaveBeenCalledExactlyOnceWith(86);
      expect(notification).not.toHaveBeenCalled();
      read.mockRestore();
      states += 1;
    }
    check(0);
    for (const [step, operation] of native.operations.entries()) {
      const [kind, which, value] = operation as [string, number, number];
      if (kind === "clear") node.ResetAttr(which);
      else if (which === 85) node.SetAttr(new SfxBoolItem(which, value !== 0));
      else node.SetAttr(new SfxInt16Item(which, value));
      check(step + 1);
    }
    notification.mockRestore();
  }
  warning.mockRestore();
  expect(states).toBe(24);
});

it("keeps pool getter1 distinct from rule start9 across independent flag and value changes", /** Checks the getter does not synthesize direct state or depend on the restart flag. @returns Nothing. */ () => {
  const warning = vi
    .spyOn(console, "warn")
    .mockImplementation(
      /** Captures only absent-direct precondition diagnostics. @returns Nothing. */ () => {},
    );
  for (const reading of [false, true]) {
    const doc = new SwDoc();
    doc.SetInReading(reading);
    const node = doc.paragraphs[0] as SwTextNode;
    doc.EnsureNumRule("Getter rule", "numbered").GetNumFormat(0).SetStart(9);
    node.SetNumRule("Getter rule");
    for (const restart of [false, true]) {
      node.SetListRestart(restart);
      expect(node.HasAttrListRestartValue()).toBe(false);
      warning.mockClear();
      expect(node.GetAttrListRestartValue()).toBe(1);
      expect(warning).toHaveBeenCalledOnce();
      expect(node.GetActualListStartValue()).toBe(9);
      expect(node.HasAttrListRestartValue()).toBe(false);
    }
    for (const value of [0, 7, -32768, -1, 32767]) {
      node.SetAttrListRestartValue(value);
      for (const restart of [false, true]) {
        node.SetListRestart(restart);
        warning.mockClear();
        expect(node.GetAttrListRestartValue()).toBe(value);
        expect(warning).not.toHaveBeenCalled();
        expect(node.GetActualListStartValue()).toBe(restart ? value : 9);
        expect(node.HasAttrListRestartValue()).toBe(true);
      }
    }
    node.SetAttrListRestartValue(65_535);
    warning.mockClear();
    expect(node.GetAttrListRestartValue()).toBe(1);
    expect(warning).toHaveBeenCalledOnce();
    expect(node.HasAttrListRestartValue()).toBe(false);
    expect(node.IsListRestart()).toBe(true);
    expect(node.GetActualListStartValue()).toBe(9);
  }
  warning.mockRestore();
});
