/** @fileoverview Browser ComboBox custom drawing, portal geometry, focus boundaries and accessible travel. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ComboBox } from "./ComboBox";
const rows = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
];
it("travels through repeated recent/main rows by row identity and skips their separator", /** Native programmatic assignments target the main list while keyboard travel preserves the actual selected copy. @returns Nothing. */ () => {
  const accept = vi.fn();
  render(
    <ComboBox
      resetKey={rows}
      options={rows}
      mruOptions={[rows[1] as (typeof rows)[number], rows[0] as (typeof rows)[number]]}
      value="Alpha"
      enabled
      label="Recent"
      getId={/** Native identity. @param row - Actual entry. @returns Identity. */ (row) => row.id}
      getText={
        /** Native display text. @param row - Actual entry. @returns Text. */ (row) => row.name
      }
      onAccept={accept}
      onCancel={/** Consumes Escape. @returns True. */ () => true}
    />,
  );
  const box = screen.getByRole("combobox", { name: "Recent" });
  fireEvent.click(screen.getByRole("button", { name: "Show Recent" }));
  const options = screen.getAllByRole("option");
  expect(options).toHaveLength(4);
  expect(box).toHaveAttribute("aria-activedescendant", options[2]?.id);
  fireEvent.keyDown(box, { key: "PageUp" });
  expect(box).toHaveValue("Beta");
  expect(box).toHaveAttribute("aria-activedescendant", options[0]?.id);
  fireEvent.keyDown(box, { key: "ArrowDown" });
  expect(box).toHaveValue("Alpha");
  expect(box).toHaveAttribute("aria-activedescendant", options[1]?.id);
  fireEvent.keyDown(box, { key: "ArrowDown" });
  expect(box).toHaveValue("Alpha");
  expect(box).toHaveAttribute("aria-activedescendant", options[2]?.id);
  fireEvent.keyDown(box, { key: "ArrowDown" });
  expect(box).toHaveValue("Beta");
  expect(box).toHaveAttribute("aria-activedescendant", options[3]?.id);
  expect(
    options.filter(
      /** Exactly one native row is active. @param option - Actual option. @returns Whether selected. */ (
        option,
      ) => option.getAttribute("aria-selected") === "true",
    ),
  ).toHaveLength(1);
  fireEvent.keyDown(box, { key: "Enter" });
  expect(accept).toHaveBeenCalledWith("Beta", true);
});
afterEach(
  /** Releases real DOM fixtures and geometry instrumentation. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
  },
);

/** Renders actual custom rows inside a deliberately clipping toolbar. @returns Observable controller calls and widget. */
function mount() {
  const accept = vi.fn(),
    cancel = vi.fn().mockReturnValue(true);
  const tree = render(
    <div data-testid="toolbar" style={{ overflow: "hidden" }}>
      <ComboBox
        resetKey={rows}
        options={rows}
        value="Alpha"
        enabled
        label="Custom"
        getId={
          /** Reads row identity. @param row - Actual row. @returns Identity. */ (row) => row.id
        }
        getText={
          /** Reads accessible text. @param row - Actual row. @returns Name. */ (row) => row.name
        }
        onAccept={accept}
        onCancel={cancel}
        renderItem={
          /** Exposes custom rendering without replacing accessible names. @param row - Actual row. @param selected - Current travel. @returns Row content. */ (
            row,
            selected,
          ) => (
            <span aria-hidden="true" data-selected={selected}>
              {row.id} drawing
            </span>
          )
        }
      />
    </div>,
  );
  const box = screen.getByRole("combobox", { name: "Custom" });
  fireEvent.click(screen.getByRole("button", { name: "Show Custom" }));
  return { ...tree, box, accept, cancel, list: screen.getByRole("listbox", { name: "Custom" }) };
}

it("keeps custom rows outside clipping containers with actual accessible active descendants", /** Checks row rendering, pointer focus and native controller acceptance. @returns Nothing. */ () => {
  const f = mount();
  expect(screen.getByTestId("toolbar")).not.toContainElement(f.list);
  const alpha = screen.getByRole("option", { name: "Alpha" });
  expect(f.box).toHaveAttribute("aria-activedescendant", alpha.id);
  expect(alpha.style.backgroundColor).toBe("highlight");
  expect(alpha.style.color).toBe("highlighttext");
  expect(screen.getByText("a drawing")).toHaveAttribute("data-selected", "true");
  fireEvent.keyDown(f.box, { key: "ArrowDown" });
  const beta = screen.getByRole("option", { name: "Beta" });
  expect(f.box).toHaveAttribute("aria-activedescendant", beta.id);
  expect(screen.getByText("b drawing")).toHaveAttribute("data-selected", "true");
  expect(f.accept).not.toHaveBeenCalled();
  fireEvent.pointerDown(beta);
  expect(f.list).toBeInTheDocument();
  act(/** Moves within the actual portal focus boundary. @returns Nothing. */ () => beta.focus());
  expect(f.list).toBeInTheDocument();
  fireEvent.mouseDown(beta);
  fireEvent.click(beta);
  expect(f.accept).toHaveBeenCalledWith("Beta", true);
  expect(f.list).not.toBeInTheDocument();
});

it("discards travel on outside pointer dismissal and removes mounted popup listeners", /** Checks dismissal with no focusable outside target and cleanup across reopen. @returns Nothing. */ () => {
  const f = mount();
  fireEvent.keyDown(f.box, { key: "ArrowDown" });
  fireEvent.pointerDown(f.box);
  expect(f.list).toBeInTheDocument();
  fireEvent.pointerDown(document.body);
  expect(f.list).not.toBeInTheDocument();
  expect(f.box).toHaveValue("Alpha");
  expect(f.accept).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Show Custom" }));
  fireEvent.change(f.box, { target: { value: "Raw" } });
  expect(f.box).not.toHaveAttribute("aria-activedescendant");
  f.unmount();
  fireEvent.pointerDown(document.body);
  fireEvent.scroll(window);
  expect(f.accept).not.toHaveBeenCalled();
});

it("uses measured popup content and moves above the anchor when there is no room below", /** Covers viewport clamping using explicit actual-layout fixtures rather than font estimates. @returns Nothing. */ () => {
  const f = mount();
  const anchor = f.box.parentElement as HTMLElement;
  vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue({
    left: 900,
    top: 700,
    bottom: 732,
    width: 180,
  } as DOMRect);
  vi.spyOn(f.list, "scrollWidth", "get").mockReturnValue(300);
  vi.spyOn(f.list, "scrollHeight", "get").mockReturnValue(500);
  fireEvent.resize(window);
  expect(f.list.style.left).toBe(`${window.innerWidth - 300}px`);
  expect(f.list.style.width).toBe("300px");
  expect(f.list.style.top).toBe("460px");
  expect(f.list.style.maxHeight).toBe("240px");
  vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue({
    left: -20,
    top: 0,
    bottom: 32,
    width: 180,
  } as DOMRect);
  fireEvent.scroll(window);
  expect(f.list.style.left).toBe("0px");
  expect(f.list.style.top).toBe("32px");
});

it("scrolls real active rows into view while retaining keyboard focus", /** Pins the browser scroll operation separately from jsdom's missing layout method. @returns Nothing. */ () => {
  const f = mount(),
    scroll = vi.fn();
  const beta = screen.getByRole("option", { name: "Beta" });
  Object.defineProperty(beta, "scrollIntoView", { value: scroll });
  fireEvent.keyDown(f.box, { key: "ArrowDown" });
  expect(scroll).toHaveBeenCalledWith({ block: "nearest" });
  expect(f.box).toHaveFocus();
});
