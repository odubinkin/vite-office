/** @fileoverview Source style painting over an explicit browser-device fixture;real raster behavior is separately checked in Chromium. */
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StylePreviewRow } from "./StylePreviewRow";
import { BrowserStylePreviewState } from "./style-preview-state";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { SvxUnderlineItem } from "../../../editeng/inc/udlnitem";
import { SvxCrossedOutItem } from "../../../editeng/inc/crossedoutitem";
import { SvxFontItem } from "../../../editeng/inc/fontitem";
import { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
import { SvxColorItem } from "../../../editeng/inc/colritem";
import { Color } from "../../../tools/inc/color";
import * as slots from "../../../editeng/inc/editids";
import { RTL_TEXTENCODING_DONTKNOW } from "../../../sal/inc/rtl/textenc";
import { FontFamily, FontPitch, FontLineStyle, FontStrikeout } from "../../../tools/inc/fontenum";
import { MapUnit } from "../../../tools/inc/mapunit";
afterEach(
  /** Releases mounted observers and explicit host fixtures. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(document, "fonts");
  },
);
/** Creates a genuine shared native item pool with only consumed preview slots;Writer inheritance is exercised separately in its own integration tests. @returns Actual set. */
function previewItems(): SfxItemSet {
  const pool = new SfxItemPool();
  pool.RegisterDefaultItem(
    new SvxFontItem(
      FontFamily.FAMILY_ROMAN,
      "Fixture Sans",
      "",
      FontPitch.PITCH_VARIABLE,
      RTL_TEXTENCODING_DONTKNOW,
      1,
    ),
    undefined,
    slots.SID_ATTR_CHAR_FONT,
  );
  pool.RegisterDefaultItem(
    new SvxFontHeightItem(240, 100, 2),
    undefined,
    slots.SID_ATTR_CHAR_FONTHEIGHT,
  );
  pool.RegisterDefaultItem(
    new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, 3),
    undefined,
    slots.SID_ATTR_CHAR_UNDERLINE,
  );
  pool.RegisterDefaultItem(
    new SvxCrossedOutItem(FontStrikeout.STRIKEOUT_SINGLE, 4),
    undefined,
    slots.SID_ATTR_CHAR_STRIKEOUT,
  );
  pool.RegisterDefaultItem(
    new SvxColorItem(new Color(0x123456), 5),
    undefined,
    slots.SID_ATTR_CHAR_COLOR,
  );
  return new SfxItemSet(pool, [[1, 5]]);
}

/** Supplies explicit device metrics instead of claiming native raster equivalence. @returns Fixture controls. */
function fixture() {
  const context = {
    font: "",
    fillStyle: "",
    textBaseline: "",
    textAlign: "",
    setTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    measureText: vi.fn(
      /** Supplies explicit host font metrics. @returns Fixture metrics. */ () => ({
        width: 100,
        actualBoundingBoxLeft: 0,
        actualBoundingBoxRight: 100,
        actualBoundingBoxAscent: 30,
        actualBoundingBoxDescent: 5,
        fontBoundingBoxAscent: 30,
        fontBoundingBoxDescent: 5,
      }),
    ),
  };
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(context as unknown as CanvasRenderingContext2D);
  const disconnect = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    /** Explicit ResizeObserver host fixture. */
    class {
      /** Explicit browser observer fixture callback. @returns Nothing. */
      observe = vi.fn();
      disconnect = disconnect;
    },
  );
  const fonts = new EventTarget();
  Object.defineProperty(fonts, "ready", { value: Promise.resolve(fonts) });
  Object.defineProperty(document, "fonts", { configurable: true, value: fonts });
  const controller = new BrowserStylePreviewState([{ id: "style" }]),
    set = previewItems(),
    getItemSet = vi.fn(
      /** Returns actual native pooled preview items. @returns Actual preview set. */ () =>
        set as typeof set | undefined,
    );
  const source = { controller, mapUnit: MapUnit.MapTwip, getItemSet };
  /** Places the real row in its actual button/background role. @param selected - Actual selection. @returns Host element. */
  function row(selected = false) {
    return (
      <div style={{ backgroundColor: "white" }}>
        <button
          style={{
            backgroundColor: "transparent",
            fontSize: "14px",
            fontFamily: "sans-serif",
            color: "rgb(10, 20, 30)",
            paddingLeft: 8,
            paddingRight: 8,
          }}
        >
          <StylePreviewRow id="style" name="Heading" selected={selected} source={source} />
        </button>
      </div>
    );
  }
  return { context, getContext, disconnect, controller, source, row };
}
it("paints inherited native items,decorations and actual selection suppression,then releases observers", /** Exercises real script/font/bounds code and detached SVG output. @returns Completion. */ async () => {
  const f = fixture(),
    view = render(f.row());
  await act(
    /** Flushes actual font readiness. @returns Completion. */ async () => {
      await document.fonts.ready;
    },
  );
  const host = screen.getByRole("button"),
    row = host.querySelector("[data-office-style-preview]");
  expect(row).toHaveAttribute("data-preview-ready", "true");
  const text = host.querySelector("svg text");
  expect(text).toHaveAttribute("fill", "#123456");
  expect(text).toHaveStyle({ textDecorationLine: "underline line-through" });
  expect(host.querySelector("svg")).toHaveClass("pointer-events-none");
  expect(f.controller.GetWidth()).toBeGreaterThan(0);
  view.rerender(f.row(true));
  expect(host.querySelector("svg text")).toHaveAttribute("fill", "rgb(10, 20, 30)");
  view.unmount();
  expect(f.disconnect).toHaveBeenCalled();
});
it("retains the ordinary label without a Canvas device", /** Actual missing context must not be replaced with synthetic font metrics. @returns Nothing. */ () => {
  const f = fixture();
  f.getContext.mockReturnValue(null);
  render(f.row());
  expect(screen.getByText("Heading")).toBeVisible();
  expect(document.querySelector("[data-office-style-preview]")).toHaveAttribute(
    "data-preview-ready",
    "false",
  );
});
it("retains the ordinary label when actual font metrics are unavailable", /** Explicit unknown host metrics are not a document-model error. @returns Nothing. */ () => {
  const f = fixture();
  f.context.measureText.mockReturnValue({
    width: 100,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 100,
    actualBoundingBoxAscent: 30,
    actualBoundingBoxDescent: 5,
    fontBoundingBoxAscent: NaN,
    fontBoundingBoxDescent: NaN,
  });
  render(f.row());
  expect(document.querySelector("[data-office-style-preview]")).toHaveAttribute(
    "data-preview-ready",
    "false",
  );
});

it("retains ordinary UI font state for absent style lookup and paints RTL without decorations", /** Missing source items do not manufacture pool attributes. @returns Nothing. */ () => {
  const f = fixture();
  f.source.getItemSet.mockReturnValue(undefined);
  render(f.row());
  const host = screen.getByRole("button");
  host.style.direction = "rtl";
  fireEvent.pointerEnter(host);
  const text = host.querySelector("svg text");
  expect(text).toHaveAttribute("text-anchor", "end");
  expect(text).toHaveStyle({ textDecorationLine: "none" });
});
it("keeps the ordinary label for unknown actual background or nonpositive UI font metrics", /** These actual host values cannot supply native paint channels or a positive default font. @returns Nothing. */ () => {
  const f = fixture();
  render(f.row());
  const host = screen.getByRole("button");
  host.style.backgroundColor = "oklch(50% 0.1 40)";
  fireEvent.pointerEnter(host);
  expect(document.querySelector("[data-office-style-preview]")).toHaveAttribute(
    "data-preview-ready",
    "false",
  );
  host.style.backgroundColor = "white";
  host.style.fontSize = "0px";
  fireEvent.pointerEnter(host);
  expect(document.querySelector("[data-office-style-preview]")).toHaveAttribute(
    "data-preview-ready",
    "false",
  );
});
it("does not swallow a real style-pool failure", /** Only unavailable host-device metrics have a readable-label fallback. @returns Nothing. */ () => {
  const f = fixture();
  f.source.getItemSet.mockImplementation(
    /** Simulates a failed actual owner lookup. @returns Never. */ () => {
      throw new Error("Actual style pool failure");
    },
  );
  expect(
    /** Mounts the genuine row with the failed owner port. @returns Mounted row or model failure. */ () =>
      render(f.row()),
  ).toThrow("Actual style pool failure");
});

it("retains host text paint when a real pool has no foreground slot", /** Source optional color lookup can be absent for a genuine non-Writer preview set. @returns Nothing. */ () => {
  const f = fixture();
  f.source.getItemSet.mockReturnValue(new SfxItemSet(new SfxItemPool(), []));
  render(f.row());
  expect(screen.getByRole("button").querySelector("svg text")).toHaveAttribute(
    "fill",
    "rgb(10, 20, 30)",
  );
});

it("keeps original optional fonts when no style set exists and publishes actual changed extents", /** Exercises genuine native pooled attributes and browser subscribers without an alternate style pool. @returns Nothing. */ () => {
  const owner = new BrowserStylePreviewState([{ id: "a" }, { id: "b" }]);
  expect(owner.Prepare(undefined, undefined)).toEqual({});
  const set = previewItems();
  const prepared = owner.Prepare(set, MapUnit.MapTwip);
  expect(prepared).not.toEqual({});
  expect(owner.Prepare(undefined, undefined)).toBe(prepared);
  const listener = vi.fn(),
    unsubscribe = owner.Subscribe(listener);
  expect(owner.GetWidth()).toBe(0);
  owner.ReportWidth("a", 42);
  owner.ReportWidth("a", 42);
  owner.ReportWidth("b", 55);
  expect(owner.GetWidth()).toBe(55);
  expect(listener).toHaveBeenCalledTimes(2);
  owner.ReportWidth("b", 12);
  expect(owner.GetWidth()).toBe(42);
  unsubscribe();
  owner.ReportWidth("a", 11);
  expect(listener).toHaveBeenCalledTimes(3);
});
