/** @fileoverview Actual React font-row controller with explicit Canvas/ResizeObserver protocol fixtures;real raster evidence belongs to production Chromium scenarios. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { FontNameSelect } from "../../svx/browser/tbxctrls/FontSelects";
import { FontNamePreview } from "./FontNamePreview";
import { FontList } from "./font-list";
import { BrowserFontPreviewResources, type BrowserFontNamePreview } from "./font-preview-resources";
import { Font } from "../../vcl/source/font/font";
import { FontCharMap } from "../../vcl/source/font/fontcharmap";

/** Builds native metric/map values for an explicit logical family. @param family - Logical family. @returns Actual value packet. */
function preview(family = "ABC"): BrowserFontNamePreview {
  const metric = new Font();
  metric.SetFamilyName(family);
  return {
    metric,
    face: {
      characterMap: new FontCharMap([32, 127]),
      renderingFamily: "Private actual face",
      style: "normal",
      weight: "400",
    },
  };
}
/** Installs only the consumed Canvas/observer host ports. @returns Observable paint protocol. */
function device() {
  const context = {
    font: "",
    fillStyle: "",
    textBaseline: "",
    textAlign: "",
    setTransform: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(
      /** Supplies explicit ink and digit metrics. @returns Canvas-shaped metrics. */ () => ({
        width: 8,
        actualBoundingBoxLeft: 0,
        actualBoundingBoxRight: 24,
        actualBoundingBoxAscent: 10,
        actualBoundingBoxDescent: 2,
      }),
    ),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  const changes: (() => void)[] = [],
    observe = vi.fn(),
    disconnect = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    /** Native observer callback protocol with explicit delivery. */ class {
      /** Retains the actual callback port. @param callback - Source repaint. @returns Observer fixture. */ constructor(
        callback: () => void,
      ) {
        changes.push(callback);
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
  return { context, changes, observe, disconnect };
}
/** Renders the real row inside its actual native combo role-shaped button. @param resources - Actual source port owner. @param list - Actual inventory. @param family - Logical family. @param selected - Actual selection. @returns Row tree. */
function tree(
  resources: BrowserFontPreviewResources,
  list: FontList,
  family = "ABC",
  selected = false,
) {
  return (
    <button
      type="button"
      style={{
        fontSize: "14px",
        fontFamily: "system-ui",
        fontWeight: "400",
        fontStyle: "normal",
        color: "black",
      }}
    >
      <FontNamePreview family={family} selected={selected} source={{ list, resources }} />
    </button>
  );
}
/** Settles source publication and callback-ref context binding. @returns Completion. */
async function settle() {
  await act(
    /** Flushes actual promise publication. @returns Completion. */ async () => {
      await Promise.resolve();
    },
  );
}

afterEach(
  /** Unmounts real rows and restores host protocol ports. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  },
);

it("paints native rows with physical aliases and repaints for selection,hover and real resize callbacks", /** Verifies actual source draw composition,not fabricated DOM font-family screenshots. @returns Completion. */ async () => {
  const d = device(),
    resources = new BrowserFontPreviewResources(),
    list = new FontList(["ABC"]);
  vi.spyOn(resources, "Get").mockResolvedValue(preview());
  const view = render(tree(resources, list));
  const host = screen.getByRole("button");
  Object.defineProperty(host, "clientWidth", { value: 432 });
  await settle();
  const canvas = host.querySelector("canvas") as HTMLCanvasElement;
  expect(canvas).not.toBeNull();
  expect(canvas.hidden).toBe(false);
  expect(canvas.width).toBe(416);
  expect(canvas.height).toBe(22);
  expect(d.context.fillText).toHaveBeenCalledWith("ABC", 5, 15);
  expect(d.observe).toHaveBeenCalledWith(host);
  const first = d.context.fillText.mock.calls.length;
  fireEvent.pointerEnter(host);
  fireEvent.pointerLeave(host);
  fireEvent(window, new Event("resize"));
  d.changes[0]?.();
  expect(d.context.fillText.mock.calls.length).toBeGreaterThan(first);
  view.rerender(tree(resources, list, "ABC", true));
  expect(d.disconnect).toHaveBeenCalled();
  expect(host.textContent).toBe("ABC");
  view.unmount();
  const afterUnmount = d.context.fillText.mock.calls.length;
  fireEvent(window, new Event("resize"));
  expect(d.context.fillText.mock.calls.length).toBe(afterUnmount);
  expect(d.disconnect).toHaveBeenCalled();
});

it("leaves an ordinary readable label when source data or Canvas are unavailable", /** Unknown data is never presented as an installed physical font. @returns Completion. */ async () => {
  device();
  const resources = new BrowserFontPreviewResources(),
    list = new FontList(["ABC"]);
  const get = vi.spyOn(resources, "Get").mockResolvedValue(undefined);
  const view = render(tree(resources, list));
  await settle();
  expect(screen.getByRole("button").querySelector("canvas")).toBeNull();
  get.mockResolvedValue(preview());
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
  view.rerender(tree(resources, new FontList(["ABC"])));
  await settle();
  const host = screen.getByRole("button"),
    canvas = host.querySelector("canvas") as HTMLCanvasElement;
  expect(canvas.hidden).toBe(true);
  expect(host.querySelector(".sr-only")).toBeNull();
  expect(host.textContent).toBe("ABC");
});

it("invalidates acquired values when family,inventory or resource owner changes", /** Does not paint a previous identity while a new actual source is pending. @returns Completion. */ async () => {
  device();
  const first = new BrowserFontPreviewResources(),
    list = new FontList(["ABC"]);
  const get = vi.spyOn(first, "Get").mockResolvedValue(preview());
  const view = render(tree(first, list));
  await settle();
  expect(screen.getByRole("button").querySelector("canvas")).not.toBeNull();
  get.mockResolvedValue(undefined);
  view.rerender(tree(first, list, "DEF"));
  expect(screen.getByRole("button").querySelector("canvas")).toBeNull();
  await settle();
  get.mockResolvedValue(preview("DEF"));
  view.rerender(tree(first, new FontList(["DEF"]), "DEF"));
  await settle();
  expect(screen.getByRole("button").querySelector("canvas")).not.toBeNull();
  const next = new BrowserFontPreviewResources();
  vi.spyOn(next, "Get").mockRejectedValue(new Error("load failed"));
  view.rerender(tree(next, new FontList(["DEF"]), "DEF"));
  await settle();
  expect(screen.getByRole("button").querySelector("canvas")).toBeNull();
  expect(screen.getByRole("button").textContent).toBe("DEF");
});

it("ignores late resolution and late rejection after a row is removed", /** Both source completion paths remain inert after cleanup. @returns Completion. */ async () => {
  device();
  const list = new FontList(["ABC"]),
    resources = new BrowserFontPreviewResources();
  let resolve: (
    value: BrowserFontNamePreview,
  ) => void = /** Initial unused resolver. @returns Nothing. */ () => undefined;
  const promise = new Promise<BrowserFontNamePreview>(
    /** Holds source completion. @param done - Completion callback. @returns Nothing. */ (done) => {
      resolve = done;
    },
  );
  vi.spyOn(resources, "Get").mockReturnValue(promise);
  const view = render(tree(resources, list));
  view.unmount();
  await act(
    /** Completes after actual removal. @returns Completion. */ async () => {
      resolve(preview());
      await promise;
    },
  );
  let reject: (
    reason: Error,
  ) => void = /** Initial unused rejection callback. @returns Nothing. */ () => undefined;
  const failed = new Promise<BrowserFontNamePreview>(
    /** Holds a real rejection boundary. @param _done - Unused resolver. @param fail - Rejection callback. @returns Nothing. */ (
      _done,
      fail,
    ) => {
      reject = fail;
    },
  );
  vi.mocked(resources.Get).mockReturnValue(failed);
  const removed = render(tree(resources, list));
  removed.unmount();
  await act(
    /** Rejects after actual removal without an unhandled promise. @returns Completion. */ async () => {
      reject(new Error("late"));
      await Promise.resolve();
    },
  );
  expect(screen.queryByRole("button")).toBeNull();
});

it("refreshes actual embedded-font revisions and never reuses disposed previews after disable/enable", /** Equivalent prop arrays keep the current source;real package/enable transitions invalidate stale rendering immediately. @returns Completion. */ async () => {
  device();
  const list = new FontList(["ABC"]);
  const inventory = vi.spyOn(FontList, "FromBrowser").mockResolvedValue(list);
  vi.spyOn(BrowserFontPreviewResources.prototype, "Get").mockImplementation(
    /** Supplies explicit acquired row values for the actual controller port. @param _list - Actual inventory. @param family - Actual logical family. @returns Acquired value. */ async (
      _list,
      family,
    ) => preview(family),
  );
  const props = { value: "ABC", enabled: true, label: "Revision", onSelect: vi.fn() };
  const availability = { Embedded: true };
  const view = render(<FontNameSelect {...props} />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "Show Revision" }));
  await settle();
  expect(screen.getByRole("option", { name: "ABC" }).querySelector("canvas")).not.toBeNull();
  let complete: (
    value: FontList,
  ) => void = /** Initial unused revision callback. @returns Nothing. */ () => undefined;
  const pending = new Promise<FontList>(
    /** Holds actual changed inventory. @param resolve - Completion callback. @returns Nothing. */ (
      resolve,
    ) => {
      complete = resolve;
    },
  );
  inventory.mockReturnValue(pending);
  view.rerender(
    <FontNameSelect
      {...props}
      embeddedFontFamilies={["Embedded"]}
      fontAvailability={availability}
    />,
  );
  expect(screen.getByRole("option", { name: "ABC" }).querySelector("canvas")).toBeNull();
  await act(
    /** Publishes actual refreshed names. @returns Completion. */ async () => {
      complete(new FontList(["ABC", "Embedded"]));
      await pending;
    },
  );
  await settle();
  expect(screen.getByRole("option", { name: "Embedded" }).querySelector("canvas")).not.toBeNull();
  expect(inventory).toHaveBeenCalledTimes(2);
  view.rerender(
    <FontNameSelect
      {...props}
      embeddedFontFamilies={["Embedded"]}
      fontAvailability={availability}
    />,
  );
  await settle();
  expect(inventory).toHaveBeenCalledTimes(2);
  view.rerender(
    <FontNameSelect
      {...props}
      enabled={false}
      embeddedFontFamilies={["Embedded"]}
      fontAvailability={availability}
    />,
  );
  view.rerender(
    <FontNameSelect
      {...props}
      embeddedFontFamilies={["Embedded"]}
      fontAvailability={availability}
    />,
  );
  await settle();
  expect(inventory).toHaveBeenCalledTimes(3);
  view.rerender(
    <FontNameSelect
      {...props}
      embeddedFontFamilies={["Embedded"]}
      fontAvailability={{ Embedded: true }}
    />,
  );
  await settle();
  expect(inventory).toHaveBeenCalledTimes(4);
});
