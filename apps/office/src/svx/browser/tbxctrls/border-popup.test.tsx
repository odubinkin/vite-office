/** @fileoverview Real border toolbox keyboard, modifier, focus, disabled and line-style selection contracts. */
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { BorderSelect, BorderLineStyleSelect } from "./BorderSelect";
import { useToolboxPopup } from "./use-toolbox-popup";
import { SvxLineItem } from "../../../editeng/inc/lineitem";
import { SvxBorderLine, SvxBorderLineStyle } from "../../../editeng/source/items/borderline";
afterEach(cleanup);
const common = { enabled: true, label: "Borders", className: "size-8", icon: <span>icon</span> };
it("navigates actual preset buttons and returns focus on Escape and selection", /** navigates actual preset buttons and returns focus on Escape and selection. @returns Observed test result. */ () => {
  const dispatch = vi.fn();
  const r = render(<BorderSelect {...common} dispatch={dispatch} />);
  const main = screen.getByRole("button", { name: "Borders" });
  fireEvent.click(main);
  const group = screen.getByRole("group", { name: /Borders/ }),
    buttons = group.querySelectorAll("button");
  fireEvent.keyDown(group, { key: "ArrowRight" });
  const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End", "x"];
  for (const key of keys) {
    required(buttons[0]).focus();
    fireEvent.keyDown(required(buttons[0]), { key });
    expect(group.contains(document.activeElement)).toBe(true);
  }
  fireEvent.keyDown(required(buttons[0]), { key: "Escape" });
  expect(main).toHaveFocus();
  expect(document.querySelector("[role=group]")).toBeNull();
  for (const modifiers of [
    { shiftKey: true },
    { shiftKey: true, ctrlKey: true },
    { altKey: true },
    { metaKey: true },
    {},
  ]) {
    fireEvent.click(screen.getByLabelText("Borders presets", { selector: "summary" }));
    fireEvent.click(screen.getByRole("button", { name: "Outer Border" }), modifiers);
    expect(dispatch.mock.lastCall?.[0]).toBe(".uno:SetBorderStyle");
    expect(main).toHaveFocus();
  }
  fireEvent.click(main);
  expect(document.querySelector("[role=group]")).toBeNull();
  r.rerender(<BorderSelect {...common} enabled={false} dispatch={dispatch} />);
  fireEvent.click(screen.getByLabelText("Borders presets", { selector: "summary" }));
  expect(document.querySelector("[role=group]")).toBeNull();
});
it("uses actual style items, native None, and external dismissal", /** uses actual style items, native None, and external dismissal. @returns Observed test result. */ () => {
  const onSelect = vi.fn(),
    value = new SvxLineItem(10201);
  value.SetLine(new SvxBorderLine(null, 20, SvxBorderLineStyle.DASHED));
  const r = render(<BorderLineStyleSelect {...common} value={value} onSelect={onSelect} />);
  const anchor = screen.getByLabelText("Borders", { selector: "summary" });
  fireEvent.click(anchor);
  expect(screen.getByRole("button", { name: "Dashed" })).toHaveAttribute("aria-pressed", "true");
  const dotted = screen.getByRole("button", { name: "Dotted" });
  fireEvent.pointerDown(dotted);
  expect(screen.getByRole("button", { name: "Dotted" })).toBeVisible();
  fireEvent.keyDown(dotted, { key: "ArrowDown" });
  fireEvent.click(dotted);
  expect((onSelect.mock.lastCall?.[0] as SvxLineItem).GetLine()?.GetWidth()).toBe(15);
  expect(anchor).toHaveFocus();
  fireEvent.click(anchor);
  fireEvent.click(screen.getByRole("button", { name: "None" }));
  expect((onSelect.mock.lastCall?.[0] as SvxLineItem).GetLine()).toBeNull();
  fireEvent.click(anchor);
  fireEvent.pointerDown(document.body);
  expect(document.querySelector("[role=group]")).toBeNull();
  fireEvent.click(anchor);
  anchor.focus();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(anchor).toHaveFocus();
  fireEvent.click(anchor);
  fireEvent.keyDown(document, { key: "a" });
  fireEvent.resize(window);
  fireEvent.scroll(document);
  expect(screen.getByRole("group", { name: /Borders/ })).toBeVisible();
  act(
    /** Checks the native boundary contract against actual owners. @returns Observed test result. */ () => {
      (anchor.parentElement as HTMLDetailsElement).open = false;
      fireEvent(required(anchor.parentElement), new Event("toggle"));
    },
  );
  expect(document.querySelector("[role=group]")).toBeNull();
  r.rerender(
    <BorderLineStyleSelect {...common} enabled={false} value={null} onSelect={onSelect} />,
  );
  fireEvent.click(anchor);
  expect(document.querySelector("[role=group]")).toBeNull();
});
/** Exercises real optional-ref lifecycle before host attachment and externally populated geometry. @param props - Attachment mode. @returns Mounted probe. */
function Probe({ mode }: { mode: string }) {
  const { ref, open, toggle, close } = useToolboxPopup();
  return (
    <>
      <button
        onClick={
          /** Checks the native boundary contract against actual owners. @returns Observed test result. */ () => {
            toggle();
            close(true);
          }
        }
      >
        toggle
      </button>
      {mode !== "none" && (
        <details ref={ref}>
          <summary
            onClick={
              /** Checks the native boundary contract against actual owners. @param e - Actual test input. @returns Observed test result. */ (
                e,
              ) => {
                e.preventDefault();
                toggle();
              }
            }
          >
            probe
          </summary>
          {mode === "full" && open && <div>content</div>}
        </details>
      )}
    </>
  );
}
it("handles unattached and single-child popups and bounded above/below geometry", /** handles unattached and single-child popups and bounded above/below geometry. @returns Observed test result. */ () => {
  const r = render(<Probe mode="none" />);
  fireEvent.click(screen.getByRole("button"));
  fireEvent.keyDown(document, { key: "Escape" });
  r.unmount();
  const attached = render(<Probe mode="empty" />);
  fireEvent.click(screen.getByText("probe"));
  fireEvent.resize(window);
  attached.rerender(<Probe mode="full" />);
  if (!(screen.getByText("probe").parentElement as HTMLDetailsElement).open)
    fireEvent.click(screen.getByText("probe"));
  const anchor = screen.getByText("probe"),
    details = required(anchor.parentElement);
  const panel = details.lastElementChild as HTMLElement;
  vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue({
    top: 700,
    bottom: 730,
    left: 900,
    right: 920,
    width: 20,
    height: 30,
    x: 900,
    y: 700,
    /** Checks the native boundary contract against actual owners. @returns Observed test result. */ toJSON() {},
  });
  Object.defineProperty(panel, "scrollHeight", { value: 500, configurable: true });
  fireEvent.resize(window);
  expect(panel.style.top).toBe("194px");
  document.body.focus();
  fireEvent.keyDown(document, { key: "Escape" });
  expect((details as HTMLDetailsElement).open).toBe(false);
});

/** Requires an actual test fixture owner and fails at its missing boundary. @param value - Actual fixture value. @returns Present fixture. */
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("Missing actual fixture owner");
  return value;
}
