/** @fileoverview Native header tracking arithmetic over actual DOM input and the shared VCL tracking lifetime. */
import { expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ScHeaderResizeHandle, type ScHeaderSizing } from "./ScHeaderResizeHandle";

/** Mounts a real header/window boundary with deterministic measured platform geometry. @param width - Axis. @param index - Entry index. @param disabled - Active edit view. @returns Actual boundary and observed source operations. */
function mount(width = true, index = 2, disabled = false) {
  const sizing: ScHeaderSizing = {
      GetEntrySize: vi.fn(
        /** Reads genuine prior visible extents,including one hidden entry. @param _width - Axis. @param entry - Index. @returns Pixels. */ (
          _width,
          entry,
        ) => (entry === 1 ? 0 : 85),
      ),
      SetEntrySize: vi.fn(),
      HideEntries: vi.fn(),
    },
    owner = {},
    click = vi.fn();
  const rendered = render(
      <div role="grid" tabIndex={0}>
        <div role="columnheader" onClick={click}>
          <ScHeaderResizeHandle
            width={width}
            index={index}
            label="entry"
            owner={owner}
            disabled={disabled}
            sizing={sizing}
          />
        </div>
      </div>,
    ),
    grid = screen.getByRole("grid"),
    header = screen.getByRole("columnheader"),
    button = screen.getByRole("button", { name: "Resize entry" });
  vi.spyOn(header, "getBoundingClientRect").mockReturnValue(new DOMRect(100, 200, 85, 17));
  vi.spyOn(grid, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 50, 500, 400));
  return { sizing, rendered, button, click, grid };
}

for (const width of [true, false]) {
  it(`tracks ${width ? "column" : "row"} preview without changing the model and commits native release coordinates`, /** Accepted release uses the final event and source +2 pixel arithmetic. @returns Nothing. */ () => {
    const { sizing, button, grid, click } = mount(width),
      start = { pointerId: 7, button: 0, clientX: 180, clientY: 215 };
    expect(button).toHaveStyle({ cursor: width ? "col-resize" : "row-resize" });
    fireEvent.pointerDown(button, start);
    expect(document.querySelector("[data-calc-resize-guide]")).toBeInTheDocument();
    fireEvent.pointerMove(window, start);
    fireEvent.pointerMove(window, { ...start, clientX: 181, clientY: 216 });
    fireEvent.pointerMove(window, { ...start, clientX: 190, clientY: 225 });
    expect(sizing.SetEntrySize).not.toHaveBeenCalled();
    fireEvent.pointerUp(window, { ...start, clientX: 195, clientY: 230 });
    expect(sizing.SetEntrySize).toHaveBeenCalledExactlyOnceWith(width, 2, width ? 97 : 32);
    expect(document.querySelector("[data-calc-resize-guide]")).not.toBeInTheDocument();
    expect(grid).toHaveFocus();
    fireEvent.click(button);
    expect(click).not.toHaveBeenCalled();
  });
}

it("keeps sub-threshold clicks inert and accepts Enter at the last tracked coordinate", /** Shared VCL keyboard priority supplies native keyboard termination without a pointer event. @returns Nothing. */ () => {
  const { sizing, button } = mount();
  fireEvent.pointerDown(button, { pointerId: 1, button: 0, clientX: 180 });
  fireEvent.pointerMove(window, { pointerId: 1, clientX: 181 });
  fireEvent.pointerUp(window, { pointerId: 1, clientX: 181 });
  expect(sizing.SetEntrySize).not.toHaveBeenCalled();
  fireEvent.pointerDown(button, { pointerId: 1, button: 0, clientX: 180 });
  fireEvent.pointerMove(window, { pointerId: 1, clientX: 177 });
  fireEvent.pointerMove(window, { pointerId: 1, clientX: 180 });
  fireEvent.keyDown(window, { key: "Enter" });
  expect(sizing.SetEntrySize).toHaveBeenCalledExactlyOnceWith(true, 2, 82);
});

it("walks backward across hidden entries for a negative-size hide and terminates at entry zero", /** Original negative-width path retains the complete dragged range. @returns Nothing. */ () => {
  const first = mount();
  fireEvent.pointerDown(first.button, { pointerId: 1, button: 0, clientX: 180 });
  fireEvent.pointerMove(window, { pointerId: 1, clientX: 80 });
  fireEvent.pointerUp(window, { pointerId: 1, clientX: 80 });
  expect(first.sizing.GetEntrySize).toHaveBeenNthCalledWith(1, true, 1);
  expect(first.sizing.GetEntrySize).toHaveBeenNthCalledWith(2, true, 0);
  expect(first.sizing.HideEntries).toHaveBeenCalledExactlyOnceWith(true, 1, 2);
  first.rendered.unmount();
  const second = mount(false, 0);
  fireEvent.pointerDown(second.button, { pointerId: 2, button: 0, clientY: 215 });
  fireEvent.pointerMove(window, { pointerId: 2, clientY: 180 });
  fireEvent.pointerUp(window, { pointerId: 2, clientY: 180 });
  expect(second.sizing.HideEntries).toHaveBeenCalledExactlyOnceWith(false, 0, 0);
  expect(second.sizing.GetEntrySize).not.toHaveBeenCalled();
});

for (const cancellation of ["Escape", "pointercancel", "blur", "unmount"]) {
  it(`discards header tracking on ${cancellation}`, /** Every cancellation leaves the actual geometry operations untouched. @returns Nothing. */ () => {
    const { sizing, button, rendered } = mount();
    fireEvent.pointerDown(button, { pointerId: 3, button: 0, clientX: 180 });
    fireEvent.pointerMove(window, { pointerId: 3, clientX: 190 });
    if (cancellation === "Escape") fireEvent.keyDown(window, { key: "Escape" });
    else if (cancellation === "pointercancel") fireEvent.pointerCancel(window, { pointerId: 3 });
    else if (cancellation === "blur") fireEvent.blur(window);
    else rendered.unmount();
    fireEvent.pointerUp(window, { pointerId: 3, clientX: 190 });
    expect(sizing.SetEntrySize).not.toHaveBeenCalled();
    expect(sizing.HideEntries).not.toHaveBeenCalled();
    expect(document.querySelector("[data-calc-resize-guide]")).not.toBeInTheDocument();
  });
}

it("rejects inactive edit-view boundaries and non-left presses without taking tracking", /** Disabled and original single-button admission remain separate. @returns Nothing. */ () => {
  const inactive = mount(true, 0, true);
  fireEvent.pointerDown(inactive.button, { pointerId: 4, button: 0 });
  expect(document.querySelector("[data-calc-resize-guide]")).not.toBeInTheDocument();
  inactive.rendered.unmount();
  const active = mount();
  fireEvent.pointerDown(active.button, { pointerId: 4, button: 2 });
  expect(document.querySelector("[data-calc-resize-guide]")).not.toBeInTheDocument();
});
