/** @fileoverview Checks native document indent admission and copied ruler tracking lifetime. */
import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SvxTabAdjust } from "../../../editeng/source/items/paraitem";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterViewStore } from "./writer-view-projection";
import { WriterRulers, type WriterRulerDocumentDrag } from "./WriterRulers";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases DOM tracking before native owners. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Creates owned model geometry and actual document-origin mouse entry. @param options - Optional native state. @returns Mounted ruler, mouse host and acceptance. */
function mount(
  options: {
    left?: number;
    first?: number;
    tabs?: readonly { index: number; positionPt: number; adjustment: SvxTabAdjust }[];
    visible?: boolean;
    callback?: boolean;
    owner?: object;
    relative?: boolean;
    legacy?: boolean;
  } = {},
) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const store = new WriterViewStore(session.view),
    snapshot = store.GetSnapshot();
  store.Close();
  const ref = createRef<WriterRulerDocumentDrag>(),
    apply = vi.fn(),
    admitted: boolean[] = [];
  const paragraph = {
    ...snapshot.activeParagraph,
    rulerTabStops: options.tabs ?? [],
    computedStyle: {
      ...snapshot.activeParagraph.computedStyle,
      firstLineIndentPt: (options.first ?? 0) / 20,
    },
  };
  const page = { ...snapshot.pageDescriptor, width: 12000, leftMargin: 1200, rightMargin: 1200 };
  const props = {
    page,
    paragraph: options.legacy
      ? (
          /** Supplies the older optional settings domain. @param value - Actual paragraph projection. @returns Projection without optional ruler metadata. */ (
            value,
          ) => {
            const { rulerTabSettings, rulerTabStops, ...rest } = value;
            void rulerTabSettings;
            void rulerTabStops;
            return rest;
          }
        )(paragraph)
      : options.relative === undefined
        ? paragraph
        : {
            ...paragraph,
            rulerTabSettings: {
              defaultDistance: 1134,
              ...paragraph.rulerTabSettings,
              relativeToIndent: options.relative,
            },
          },
    horizontalVisible: options.visible ?? true,
    documentDragRef: ref,
    ...(options.owner === undefined ? {} : { documentOwner: options.owner }),
    onPageChange: vi.fn(),
    onParagraphIndentChange: vi.fn(),
    ...(options.callback === false ? {} : { onDocumentIndentChange: apply }),
  };
  /** Renders ruler and document within their actual shared workspace. @param replacement - Ruler props. @returns DOM projection. */
  function surface(replacement = props) {
    return (
      <div aria-label="Writer workspace">
        <WriterRulers {...replacement} />
        <div aria-label="Writer document canvas">
          <article
            data-testid="host"
            onMouseDown={
              /** Starts native document admission from real input. @param event - Document mouse. @returns Nothing. */ (
                event,
              ) => {
                admitted.push(ref.current?.StartDocDrag(event, options.left ?? 600) ?? false);
              }
            }
          >
            <div data-writer-page="0">
              <span data-testid="label">1.</span>
            </div>
          </article>
        </div>
      </div>
    );
  }
  const rendered = render(surface()),
    label = screen.getByTestId("label");
  vi.spyOn(label.parentElement as HTMLElement, "getBoundingClientRect").mockReturnValue({
    left: 100,
    top: 0,
    right: 900,
    bottom: 900,
    width: 800,
    height: 900,
    x: 100,
    y: 0,
    toJSON: /** Returns no external data. @returns Empty value. */ () => ({}),
  });
  vi.spyOn(
    screen.getByLabelText("Writer document canvas"),
    "getBoundingClientRect",
  ).mockReturnValue({
    left: 0,
    top: 0,
    right: 1000,
    bottom: 1000,
    width: 1000,
    height: 1000,
    x: 0,
    y: 0,
    toJSON: /** Returns no external data. @returns Empty value. */ () => ({}),
  });
  return { ref, apply, admitted, label, rendered, props, surface };
}
/** Sends native single left mouse input at document page coordinates. @param label - Actual label. @param x - Page-relative horizontal position. @param extra - Native input overrides. @returns Nothing. */
function down(label: HTMLElement, x = 120, extra: Record<string, number> = {}) {
  fireEvent.mouseDown(label, { button: 0, detail: 1, clientX: 100 + x, clientY: 500, ...extra });
}
describe("native document ruler indent drag", /** Groups admission and termination contracts. @returns Nothing. */ () => {
  it("rejects document points outside both native horizontal ruler extents", /** Checks actual outside-first hit testing. @returns Nothing. */ function rejectsOutside() {
    const f = mount();
    down(f.label, -100);
    down(f.label, 900);
    expect(f.admitted).toEqual([false, false]);
    expect(f.apply).not.toHaveBeenCalled();
  });
  it("honors frame-relative explicit tab priority", /** Checks native frame origin independent of borrowed indent. @returns Nothing. */ function usesFrameOrigin() {
    const f = mount({
      relative: false,
      tabs: [{ index: 0, positionPt: 30, adjustment: SvxTabAdjust.Left }],
    });
    down(f.label);
    expect(f.admitted).toEqual([false]);
  });
  it("accepts older omitted ruler settings using the existing relative default", /** Checks optional presentation values without changing native model state. @returns Nothing. */ function usesMissingSettings() {
    const f = mount({ legacy: true });
    down(f.label);
    expect(f.admitted).toEqual([true]);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(f.apply).not.toHaveBeenCalled();
  });
  it("copies bottom-left geometry and applies changed acceptance once without first-line projection", /** Checks literal snapping and retained tuple. @returns Nothing. */ function acceptsDocIndent() {
    const f = mount({ first: -120 });
    down(f.label);
    expect(f.admitted).toEqual([true]);
    expect(screen.getByRole("button", { name: "Paragraph left indent" })).toHaveStyle({
      left: "120px",
    });
    fireEvent.pointerMove(window, { pointerType: "pen", clientX: 900 });
    expect(f.apply).not.toHaveBeenCalled();
    fireEvent.pointerMove(window, { pointerType: "mouse", clientX: 240 });
    expect(document.querySelector('[data-ruler-guide="x"]')).not.toBeNull();
    expect(f.apply).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });
    expect(f.apply).toHaveBeenCalledExactlyOnceWith({ left: 907, firstLine: -120, right: 0 });
    fireEvent.pointerUp(window, { pointerType: "mouse", clientX: 900 });
    expect(f.apply).toHaveBeenCalledOnce();
    expect(document.querySelector('[data-ruler-guide="x"]')).toBeNull();
  });
  it("requires actual page ownership and native single-left input and ignores top-only positions", /** Checks missing page and hit miss admission. @returns Nothing. */ function rejectsDocInput() {
    const f = mount({ first: 600 });
    down(f.label, 120, { button: 2 });
    down(f.label, 120, { detail: 2 });
    down(f.label, 160);
    expect(f.admitted).toEqual([false, false, false]);
    fireEvent.mouseDown(screen.getByTestId("host"), { button: 0, detail: 1, clientX: 220 });
    expect(f.admitted.at(-1)).toBe(false);
    expect(f.apply).not.toHaveBeenCalled();
  });
  for (const callback of [false, true])
    it(`rejects unavailable document ruler callback=${callback}`, /** Checks hidden and absent application ownership. @returns Nothing. */ function rejectsUnavailable() {
      const f = mount({ visible: !callback, callback });
      down(f.label);
      expect(f.admitted).toEqual([false]);
      expect(f.apply).not.toHaveBeenCalled();
    });
  for (const adjustment of [
    SvxTabAdjust.Left,
    SvxTabAdjust.Right,
    SvxTabAdjust.Center,
    SvxTabAdjust.Decimal,
  ])
    it(`gives explicit tab adjustment=${adjustment} native priority`, /** Checks tabs precede bottom indent hit tests. @returns Nothing. */ function prioritizesTab() {
      const f = mount({ tabs: [{ index: 0, positionPt: 0, adjustment }] });
      down(f.label);
      expect(f.admitted).toEqual([false]);
      expect(f.apply).not.toHaveBeenCalled();
    });
  it("does not duplicate a ruler tracking owner and accepts only changed positions", /** Checks unmoved document release and a later gesture. @returns Nothing. */ function keepsOwner() {
    const f = mount();
    down(f.label);
    down(f.label);
    expect(f.admitted).toEqual([true, false]);
    fireEvent.pointerUp(window, { pointerType: "mouse", clientX: 220 });
    expect(f.apply).not.toHaveBeenCalled();
    down(f.label);
    fireEvent.pointerUp(window, { pointerType: "mouse", clientX: 240 });
    expect(f.apply).toHaveBeenCalledExactlyOnceWith({ left: 907, firstLine: 0, right: 0 });
  });
  it("uses right-before-left ownership when bottom handles overlap", /** Checks source descending indent order and right tuple. @returns Nothing. */ function acceptsRight() {
    const f = mount({ left: 10800 });
    down(f.label, 800 - 80);
    fireEvent.pointerUp(window, { pointerType: "mouse", clientX: 840 });
    expect(f.apply).toHaveBeenCalledExactlyOnceWith({ left: 10800, firstLine: 0, right: -321 });
  });
  for (const ending of ["Escape", "pointercancel", "blur", "hide", "owner", "unmount"] as const)
    it(`cancels copied document state on ${ending}`, /** Checks no late release after native cancellation or owner loss. @returns Nothing. */ function cancelsDoc() {
      const f = mount();
      down(f.label);
      fireEvent.pointerMove(window, { pointerType: "mouse", clientX: 240 });
      if (ending === "Escape") fireEvent.keyDown(window, { key: "Escape", altKey: true });
      else if (ending === "pointercancel") {
        fireEvent.pointerCancel(window, { pointerType: "pen" });
        expect(document.querySelector('[data-ruler-guide="x"]')).not.toBeNull();
        fireEvent.pointerCancel(window, { pointerType: "mouse" });
      } else if (ending === "blur") fireEvent(window, new Event("blur"));
      else if (ending === "hide")
        f.rendered.rerender(f.surface({ ...f.props, horizontalVisible: false }));
      else if (ending === "owner")
        f.rendered.rerender(f.surface({ ...f.props, documentOwner: {} }));
      else f.rendered.unmount();
      fireEvent.pointerUp(window, { pointerType: "mouse", clientX: 900 });
      expect(f.apply).not.toHaveBeenCalled();
      expect(document.querySelector('[data-ruler-guide="x"]')).toBeNull();
    });
});
