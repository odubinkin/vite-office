/** @fileoverview Checks existing ruler coordinates, handles and gesture cleanup together. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterViewStore } from "./writer-view-projection";
import { WriterRulers, WriterVerticalRuler } from "./WriterRulers";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Closes DOM gesture owners before their sessions. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Builds immutable geometry from an owned Writer model. @returns Ruler props and callback spies. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  session.view.GetWrtShell().SetTabStopPositions([600, 1200]);
  const store = new WriterViewStore(session.view);
  const snapshot = store.GetSnapshot();
  store.Close();
  const paragraph = snapshot.paragraphs[0];
  if (paragraph === undefined) throw new Error("Writer fixture has no paragraph");
  return {
    page: snapshot.pageDescriptor,
    paragraph,
    onPageChange: vi.fn(),
    onParagraphIndentChange: vi.fn(),
    onTabStopMove: vi.fn(),
  };
}

describe("ruler handle tracking", /** Groups coordinate preservation and transient ownership. @returns Nothing. */ () => {
  for (const axis of ["x", "y"] as const) {
    it(`accepts the last ${axis} preview on Enter and ignores later release`, /** Checks keyboard termination uses the painted coordinate. @returns Nothing. */ function acceptsPreview() {
      const data = fixture();
      render(
        axis === "x" ? (
          <WriterRulers {...data} horizontalVisible />
        ) : (
          <WriterVerticalRuler page={data.page} onPageChange={data.onPageChange} />
        ),
      );
      const handle = screen.getByRole("button", {
        name: axis === "x" ? "Left page margin" : "Top page margin",
      });
      const initial = axis === "x" ? handle.style.left : handle.style.top;
      fireEvent.pointerDown(handle, { button: 0, pointerId: 7, clientX: 100, clientY: 100 });
      fireEvent.pointerMove(window, {
        pointerId: 7,
        clientX: axis === "x" ? 120 : 999,
        clientY: axis === "y" ? 120 : 999,
      });
      expect(axis === "x" ? handle.style.left : handle.style.top).not.toBe(initial);
      expect(fireEvent.keyDown(handle, { key: "Enter" })).toBe(false);
      expect(data.onPageChange).toHaveBeenCalledExactlyOnceWith(axis === "x" ? "left" : "top", 283);
      expect(axis === "x" ? handle.style.left : handle.style.top).toBe(initial);
      fireEvent.pointerUp(window, { pointerId: 7, clientX: 900, clientY: 900 });
      expect(data.onPageChange).toHaveBeenCalledOnce();
    });
  }

  it("ignores another handle while its ruler is tracking and admits it after cancellation", /** Checks native IsTracking applies to the entire ruler. @returns Nothing. */ function retainsRulerOwner() {
    const data = fixture();
    render(<WriterRulers {...data} horizontalVisible />);
    const left = screen.getByRole("button", { name: "Left page margin" });
    const right = screen.getByRole("button", { name: "Right page margin" });
    const initialRight = right.style.left;
    fireEvent.pointerDown(left, { button: 0, pointerId: 1, clientX: 100 });
    fireEvent.pointerDown(right, { button: 0, pointerId: 2, clientX: 100 });
    fireEvent.pointerMove(window, { pointerId: 2, clientX: 120 });
    expect(right.style.left).toBe(initialRight);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(data.onPageChange).not.toHaveBeenCalled();
    fireEvent.pointerDown(right, { button: 0, pointerId: 2, clientX: 100 });
    fireEvent.pointerUp(window, { pointerId: 2, clientX: 120 });
    expect(data.onPageChange.mock.calls[0]?.[0]).toBe("right");
    expect(data.onPageChange).toHaveBeenCalledOnce();
  });

  it("drops only a removed tab handle's gesture and permits the surviving ruler", /** Checks child removal cleanup while its owner remains mounted. @returns Nothing. */ function removesTabHandle() {
    const data = fixture();
    const rendered = render(<WriterRulers {...data} horizontalVisible />);
    fireEvent.pointerDown(screen.getByRole("button", { name: "Tab stop 2" }), {
      button: 0,
      pointerId: 1,
      clientX: 100,
    });
    rendered.rerender(
      <WriterRulers
        {...data}
        paragraph={{
          ...data.paragraph,
          rulerTabStops: [{ index: 0, positionPt: 30 }],
          computedStyle: { ...data.paragraph.computedStyle, tabStopsPt: [30] },
        }}
        horizontalVisible
      />,
    );
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 120 });
    expect(data.onTabStopMove).not.toHaveBeenCalled();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Left page margin" }), {
      button: 0,
      pointerId: 2,
      clientX: 100,
    });
    fireEvent.pointerUp(window, { pointerId: 2, clientX: 120 });
    expect(data.onPageChange).toHaveBeenCalledOnce();
  });

  it("ends a vertical gesture at the released position and cancels window blur", /** Checks vertical release and later cancelled preview. @returns Nothing. */ function releasesVertical() {
    const data = fixture();
    render(<WriterVerticalRuler page={data.page} onPageChange={data.onPageChange} />);
    const handle = screen.getByRole("button", { name: "Top page margin" });
    fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientY: 100 });
    fireEvent.pointerUp(window, { pointerId: 1, clientY: 120 });
    expect(data.onPageChange).toHaveBeenCalledExactlyOnceWith("top", 283);
    fireEvent.pointerDown(handle, { button: 0, pointerId: 2, clientY: 100 });
    fireEvent.pointerMove(window, { pointerId: 2, clientY: 120 });
    fireEvent(window, new Event("blur"));
    fireEvent.pointerUp(window, { pointerId: 2, clientY: 120 });
    expect(data.onPageChange).toHaveBeenCalledOnce();
  });

  it("adds tabs on an initial free-surface press and ignores trailing gesture clicks", /** Checks native MouseButtonDown admission without a second history effect. @returns Nothing. */ function admitsTabPress() {
    const data = fixture(),
      onTabStopAdd = vi.fn();
    const rendered = render(
      <WriterRulers {...data} horizontalVisible onTabStopAdd={onTabStopAdd} />,
    );
    const surface = rendered.container.querySelector(
      '[aria-label="Writer horizontal ruler"] > div',
    ) as HTMLElement;
    fireEvent.pointerDown(surface.firstElementChild as HTMLElement, { button: 0, clientX: 240 });
    fireEvent.pointerDown(surface, { button: 2, clientX: 240 });
    fireEvent.pointerDown(surface, { button: 0, detail: 2, clientX: 240 });
    expect(onTabStopAdd).not.toHaveBeenCalled();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Left page margin" }), {
      button: 0,
      pointerId: 7,
      clientX: 100,
    });
    fireEvent.pointerDown(surface, { button: 0, pointerId: 8, clientX: 240 });
    expect(onTabStopAdd).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 120 });
    fireEvent.click(surface, { clientX: 120 });
    expect(onTabStopAdd).not.toHaveBeenCalled();
    fireEvent.pointerDown(surface, { button: 0, pointerId: 3, clientX: 240 });
    expect(onTabStopAdd).not.toHaveBeenCalled();
    expect(document.querySelector("[data-ruler-new-tab]")).not.toBeNull();
    fireEvent.keyDown(window, { key: "Enter" });
    expect(document.querySelector("[data-ruler-new-tab]")).toBeNull();
    fireEvent.pointerUp(window, { pointerId: 3, clientX: 240 });
    expect(onTabStopAdd).toHaveBeenCalledExactlyOnceWith(1800);
  });

  for (const ending of ["Escape", "pointercancel", "blur", "hide", "unmount"] as const) {
    it(`discards a new tab on ${ending} without applying it`, /** Checks temporary insertion belongs to the tracking lifetime. @returns Nothing. */ function cancelsNewTab() {
      const data = fixture(),
        onTabStopAdd = vi.fn();
      const rendered = render(
        <WriterRulers {...data} horizontalVisible onTabStopAdd={onTabStopAdd} />,
      );
      const surface = rendered.container.querySelector(
        '[aria-label="Writer horizontal ruler"] > div',
      ) as HTMLElement;
      fireEvent.pointerDown(surface, { button: 0, pointerId: 7, clientX: 240 });
      fireEvent.pointerMove(window, { pointerId: 7, clientX: 260 });
      expect(document.querySelector("[data-ruler-new-tab]")).not.toBeNull();
      expect(onTabStopAdd).not.toHaveBeenCalled();
      if (ending === "Escape") fireEvent.keyDown(window, { key: "Escape" });
      else if (ending === "pointercancel") fireEvent.pointerCancel(window, { pointerId: 7 });
      else if (ending === "blur") fireEvent(window, new Event("blur"));
      else if (ending === "hide")
        rendered.rerender(
          <WriterRulers {...data} horizontalVisible={false} onTabStopAdd={onTabStopAdd} />,
        );
      else rendered.unmount();
      fireEvent.pointerUp(window, { pointerId: 7, clientX: 280 });
      expect(onTabStopAdd).not.toHaveBeenCalled();
      expect(document.querySelector("[data-ruler-new-tab]")).toBeNull();
    });
  }

  it("accepts a moved temporary tab at its final snapped position exactly once", /** Checks pointer acceptance of a newly painted marker. @returns Nothing. */ function acceptsNewTab() {
    const data = fixture(),
      onTabStopAdd = vi.fn();
    const rendered = render(
      <WriterRulers {...data} horizontalVisible onTabStopAdd={onTabStopAdd} />,
    );
    const surface = rendered.container.querySelector(
      '[aria-label="Writer horizontal ruler"] > div',
    ) as HTMLElement;
    fireEvent.pointerDown(surface, { button: 0, pointerId: 7, clientX: 240 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 255 });
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 260 });
    expect(onTabStopAdd).toHaveBeenCalledExactlyOnceWith(2098);
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 280 });
    expect(onTabStopAdd).toHaveBeenCalledOnce();
  });
});
