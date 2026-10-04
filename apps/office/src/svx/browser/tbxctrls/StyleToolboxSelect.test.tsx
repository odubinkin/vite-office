/** @fileoverview Checks independent style-box travel, acceptance, cancellation and focus ordering. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StyleToolboxSelect } from "./StyleToolboxSelect";
import type { StyleToolboxEntry } from "./style-toolbox-control";

afterEach(/** Releases browser fixtures. @returns Nothing. */ () => cleanup());
const options: readonly StyleToolboxEntry[] = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Owned: & 字" },
  { id: "c", name: "Zulu" },
];

/** Builds a standalone family-neutral browser style control. @param value - Binding value. @returns Widget and observed ports. */
function mount(value = "b") {
  const trace: string[] = [];
  /** Renders a new binding snapshot. @param current - Current value. @param entries - Current option snapshot. @param enabled - Binding eligibility. @returns Fixture. */
  function tree(current: string, entries = options, enabled = true) {
    return (
      <>
        <input aria-label="Document client" />
        <StyleToolboxSelect
          options={entries}
          value={current}
          enabled={enabled}
          label="Style"
          getLabel={
            /** Retains actual names. @param style - Entry. @returns Label. */ (style) => style.name
          }
          applyStyle={
            /** Observes actual accepted names. @param style - Accepted entry. @returns Nothing. */ (
              style,
            ) => {
              trace.push(`apply:${style.name}`);
            }
          }
          focusDocument={
            /** Observes focus before dispatch. @returns Nothing. */ () => {
              trace.push("focus");
              screen.getByLabelText("Document client").focus();
            }
          }
        />
      </>
    );
  }
  const rendered = render(tree(value));
  const box = screen.getByRole("combobox", { name: "Style" });
  box.focus();
  return {
    box,
    trace,
    client: screen.getByLabelText("Document client"),
    update:
      /** Supplies an external binding snapshot. @param current - New value. @param entries - New entries. @param enabled - Eligibility. @returns Nothing. */ (
        current: string,
        entries = options,
        enabled = true,
      ) => rendered.rerender(tree(current, entries, enabled)),
  };
}

/** Delivers a cancelable key to inspect native event ownership. @param box - Control. @param key - Native key. @param overrides - Modifiers. @returns Event. */
function press(box: HTMLElement, key: string, overrides: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    ...overrides,
  });
  act(
    /** Dispatches a native key. @returns Nothing. */ () => {
      box.dispatchEvent(event);
    },
  );
  return event;
}

describe("native style-box acceptance", /** Defines widget contracts. @returns Nothing. */ () => {
  it("releases client focus before direct acceptance with actual punctuation", /** Checks native dispatch ordering. @returns Nothing. */ () => {
    const fixture = mount("a");
    fireEvent.change(fixture.box, { target: { value: "b" } });
    expect(fixture.trace).toEqual(["focus", "apply:Owned: & 字"]);
    expect(fixture.client).toHaveFocus();
  });
  it("travels without applying and stops at literal first/last entries", /** Checks supported native closed-widget traversal. @returns Nothing. */ () => {
    const fixture = mount();
    for (const [key, value] of [
      ["ArrowDown", "c"],
      ["ArrowDown", "c"],
      ["ArrowUp", "b"],
      ["ArrowUp", "a"],
      ["ArrowUp", "a"],
      ["PageDown", "c"],
      ["PageUp", "a"],
    ]) {
      expect(press(fixture.box, key as string).defaultPrevented).toBe(true);
      expect(fixture.box).toHaveValue(value);
      expect(fixture.box).toHaveFocus();
    }
    expect(fixture.trace).toEqual([]);
    expect(press(fixture.box, "Enter").defaultPrevented).toBe(true);
    expect(fixture.trace).toEqual(["focus", "apply:Alpha"]);
    expect(fixture.client).toHaveFocus();
  });
  for (const shiftKey of [false, true])
    it(`accepts Tab shift=${shiftKey} without consuming normal focus navigation`, /** Checks native one-shot focus suppression. @returns Nothing. */ () => {
      const fixture = mount();
      press(fixture.box, "ArrowDown");
      expect(press(fixture.box, "Tab", { shiftKey }).defaultPrevented).toBe(false);
      expect(fixture.trace).toEqual(["apply:Zulu"]);
      expect(fixture.box).toHaveFocus();
      fixture.update("c");
      press(fixture.box, "Enter");
      expect(fixture.trace).toEqual(["apply:Zulu", "focus", "apply:Zulu"]);
      expect(fixture.client).toHaveFocus();
    });
  it("restores the binding on Escape or blur without accepting travel", /** Checks native saved-value cancellation. @returns Nothing. */ () => {
    const fixture = mount();
    press(fixture.box, "ArrowUp");
    expect(press(fixture.box, "Escape").defaultPrevented).toBe(true);
    expect(fixture.box).toHaveValue("b");
    expect(fixture.client).toHaveFocus();
    expect(fixture.trace).toEqual(["focus"]);
    fixture.box.focus();
    press(fixture.box, "ArrowDown");
    act(
      /** Leaves the widget without acceptance. @returns Nothing. */ () => fixture.client.focus(),
    );
    expect(fixture.box).toHaveValue("b");
    expect(fixture.trace).toEqual(["focus"]);
  });
  it("rejects drafts after a binding or option owner changes", /** Checks live family invalidation. @returns Nothing. */ () => {
    const fixture = mount();
    press(fixture.box, "ArrowUp");
    fixture.update("c");
    expect(fixture.box).toHaveValue("c");
    press(fixture.box, "ArrowUp");
    fixture.update("c", options.slice());
    expect(fixture.box).toHaveValue("c");
    expect(fixture.trace).toEqual([]);
  });
  it("leaves unrelated and modified keys to their owner", /** Checks native modifier admission. @returns Nothing. */ () => {
    const fixture = mount();
    for (const overrides of [
      { altKey: true },
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
    ])
      expect(press(fixture.box, "ArrowDown", overrides).defaultPrevented).toBe(false);
    expect(press(fixture.box, "F10").defaultPrevented).toBe(false);
    expect(fixture.box).toHaveValue("b");
    expect(fixture.trace).toEqual([]);
  });
  it("ignores disabled and absent selections without focus or model calls", /** Checks inactive binding safety. @returns Nothing. */ () => {
    const fixture = mount();
    fixture.update("b", options, false);
    expect(fixture.box).toBeDisabled();
    expect(press(fixture.box, "Enter").defaultPrevented).toBe(false);
    fireEvent.change(fixture.box, { target: { value: "c" } });
    expect(fixture.trace).toEqual([]);
    fixture.update("", []);
    expect(fixture.box).toHaveValue("");
    press(fixture.box, "PageUp");
    press(fixture.box, "PageDown");
    press(fixture.box, "Enter");
    expect(fixture.trace).toEqual([]);
  });
  it("retains standalone presentation without a focus port", /** Checks explicit optional browser ownership. @returns Nothing. */ () => {
    const trace: string[] = [];
    render(
      <StyleToolboxSelect
        options={options}
        value="a"
        enabled
        label="Standalone"
        getLabel={
          /** Reads a native name. @param style - Entry. @returns Name. */ (style) => style.name
        }
        applyStyle={
          /** Observes accepted identity. @param style - Entry. @returns Nothing. */ (style) => {
            trace.push(style.id);
          }
        }
      />,
    );
    const box = screen.getByRole("combobox", { name: "Standalone" });
    press(box, "Escape");
    press(box, "Enter");
    expect(trace).toEqual(["a"]);
  });
});
