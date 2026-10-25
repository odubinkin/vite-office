/** @fileoverview Canvas style device protocol over actual native font and geometry values;explicit metrics are fixtures,not native raster evidence. */
import { browserColor, browserComputedColor } from "./color";
import { expect, it, vi } from "vitest";
import { MapUnit } from "../../tools/inc/mapunit";
import { Size } from "../../tools/inc/gen";
import { stylePreviewLogicToCssPixel, BrowserStylePreviewDevice } from "./style-preview-device";
import { Font } from "../source/font/font";
import { Point, Rectangle } from "../../tools/inc/gen";
import { FontItalic, FontWeight, TextAlign } from "../../tools/inc/fontenum";
import { SvtScriptType } from "../../svl/inc/languageoptions";
import { Color, ColorAlpha, COL_WHITE } from "../../tools/inc/color";
import {
  calcStylePreviewBounds,
  drawStylePreviewEntry,
} from "../../svx/source/tbxctrls/tbcontrl.stylerender";

/** Creates an actual positive-height font with default native average width. @param name - Actual family or computed UI list. @returns Font. */
function font(name: string): Font {
  const f = new Font();
  f.SetFamilyName(name);
  f.SetFontHeight(20);
  return f;
}
/** Actual Canvas protocol fixture with explicit metrics. @returns Observable context and native device. */
function fixture() {
  const metrics = {
    width: 12.6,
    actualBoundingBoxLeft: 1.2,
    actualBoundingBoxRight: 8.5,
    actualBoundingBoxAscent: 7.2,
    actualBoundingBoxDescent: 2.5,
    fontBoundingBoxAscent: 20,
    fontBoundingBoxDescent: 5,
  };
  const context = {
    font: "",
    fillStyle: "",
    textBaseline: "",
    textAlign: "",
    measureText: vi.fn<(text: string) => typeof metrics>(
      /** Supplies explicit host metrics. @returns Fixture metrics. */ () => metrics,
    ),
    fillText: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    strokeStyle: "",
  };
  const ui = font("ui-serif, serif"),
    device = new BrowserStylePreviewDevice(
      context as unknown as CanvasRenderingContext2D,
      ui,
      "#123456",
      { background: COL_WHITE, fillColor: COL_WHITE, lineColor: undefined },
    );
  return { context, metrics, ui, device };
}
it("keeps text, fill and explicit host background/outline state separate", /** Observes actual adapter operations over native values without assuming raster equivalence. @returns Nothing. */ () => {
  const f = fixture(),
    background = new Color(0x123456),
    fill = new Color(0x456789),
    outline = new Color(0xabcdef);
  const device = new BrowserStylePreviewDevice(
    f.context as unknown as CanvasRenderingContext2D,
    f.ui,
    "#202020",
    { background, fillColor: fill, lineColor: outline },
  );
  background.SetRed(0);
  fill.SetRed(0);
  outline.SetRed(0);
  expect(device.GetBackgroundColor().toUInt32()).toBe(0x123456);
  device.DrawRect(new Rectangle(2, 3, 8, 9));
  expect(f.context.fillRect).toHaveBeenCalledWith(2, 3, 7, 7);
  expect(f.context.strokeRect).toHaveBeenCalledWith(2, 3, 6, 6);
  expect(f.context.strokeStyle).toBe("#abcdef");
  device.SetTextColor(new Color(0x987654));
  expect(f.context.fillStyle).toBe("#987654");
  const next = new Color(0x010203);
  device.SetFillColor(next);
  next.SetBlue(9);
  device.DrawRect(new Rectangle(0, 0, 4, 4));
  expect(f.context.fillStyle).toBe("#010203");
  expect(f.context.save).toHaveBeenCalledTimes(2);
  expect(f.context.restore).toHaveBeenCalledTimes(2);
});
it("normalizes reversed row edges and skips source-empty rectangles before host calls", /** Preserves native DrawRect geometry instead of treating negative inclusive widths as Canvas extents. @returns Nothing. */ () => {
  const f = fixture();
  f.device.DrawRect(new Rectangle());
  expect(f.context.save).not.toHaveBeenCalled();
  f.device.DrawRect(new Rectangle(8, 9, 2, 3));
  expect(f.context.fillRect).toHaveBeenCalledWith(2, 3, 7, 7);
});
it("omits disabled outlines and restores the host state after failed rectangle paint", /** Actual host errors are propagated after paint-state restoration. @returns Nothing. */ () => {
  const f = fixture();
  f.device.DrawRect(new Rectangle(0, 0, 1, 1));
  expect(f.context.strokeRect).not.toHaveBeenCalled();
  f.context.fillRect.mockImplementationOnce(
    /** Simulates an actual host paint failure. @returns Never. */ () => {
      throw new Error("paint failed");
    },
  );
  expect(
    /** Invokes real adapter failure path. @returns Nothing. */ () =>
      f.device.DrawRect(new Rectangle(0, 0, 1, 1)),
  ).toThrow("paint failed");
  expect(f.context.restore).toHaveBeenCalledTimes(2);
});
it.each([
  [FontWeight.WEIGHT_THIN, 100],
  [FontWeight.WEIGHT_ULTRALIGHT, 200],
  [FontWeight.WEIGHT_LIGHT, 300],
  [FontWeight.WEIGHT_SEMILIGHT, 400],
  [FontWeight.WEIGHT_NORMAL, 400],
  [FontWeight.WEIGHT_MEDIUM, 500],
  [FontWeight.WEIGHT_SEMIBOLD, 600],
  [FontWeight.WEIGHT_BOLD, 700],
  [FontWeight.WEIGHT_ULTRABOLD, 800],
  [FontWeight.WEIGHT_BLACK, 900],
  [FontWeight.WEIGHT_DONTKNOW, 400],
  [FontWeight.FontWeight_FORCE_EQUAL_SIZE, 400],
])(
  "projects native SVG weight %s to CSS %s",
  /** Verifies the source CSS mapping,not arbitrary face substitution. @param weight - Native weight. @param expected - SVG CSS scalar. @returns Nothing. */ (
    weight,
    expected,
  ) => {
    const f = fixture(),
      value = font("Physical, Serif");
    value.SetWeight(weight as FontWeight);
    f.device.SetFont(value);
    expect(f.context.font).toBe(`normal ${expected} 20px "Physical, Serif"`);
  },
);
it("copies native font state and projects normal,oblique and italic as native SVG export does", /** UI CSS lists remain serialized;physical names are quoted as one family. @returns Nothing. */ () => {
  const f = fixture(),
    value = font('Physical",Serif');
  expect([f.context.textBaseline, f.context.textAlign, f.context.fillStyle]).toEqual([
    "alphabetic",
    "left",
    "#123456",
  ]);
  expect(f.context.font).toBe("normal 400 20px ui-serif, serif");
  value.SetItalic(FontItalic.ITALIC_OBLIQUE);
  f.device.SetFont(value);
  expect(f.context.font).toBe('oblique 400 20px "Physical\\22 ,Serif"');
  value.SetItalic(FontItalic.ITALIC_NORMAL);
  f.device.SetFont(value);
  expect(f.context.font.startsWith("italic ")).toBe(true);
  value.SetItalic(FontItalic.ITALIC_DONTKNOW);
  f.device.SetFont(value);
  expect(f.context.font.startsWith("italic ")).toBe(true);
  value.SetFamilyName("Changed");
  expect(f.device.GetFont().GetFamilyName()).toBe('Physical",Serif');
  const before = new Font(f.device.GetFont());
  value.SetAverageFontWidth(1);
  expect(
    /** Unsupported arbitrary width matching must not fabricate a Canvas stretch. @returns Nothing. */ () =>
      f.device.SetFont(value),
  ).toThrow("default average width");
  value.SetAverageFontWidth(0);
  value.SetFontHeight(0);
  expect(
    /** Missing device height must not retain an unnoticed previous CSS font. @returns Nothing. */ () =>
      f.device.SetFont(value),
  ).toThrow("positive height");
  expect(f.device.GetFont().Equals(before)).toBe(true);
});
it.each([
  [TextAlign.ALIGN_TOP, 12, 23, 24],
  [TextAlign.ALIGN_BASELINE, -8, 3, 4],
  [TextAlign.ALIGN_BOTTOM, -13, -2, -1],
])(
  "applies native alignment %s using actual Canvas font metrics",
  /** Closed-edge geometry retains the actual ink offset. @param alignment - Source alignment. @param top - Expected top. @param bottom - Expected bottom. @param baseline - Expected painted baseline. @returns Nothing. */ (
    alignment,
    top,
    bottom,
    baseline,
  ) => {
    const f = fixture(),
      value = font("Physical");
    value.SetAlignment(alignment as TextAlign);
    f.device.SetFont(value);
    const bounds = f.device.GetTextBoundRect("prefixABCsuffix", 6, 3);
    expect([bounds?.Left(), bounds?.Top(), bounds?.Right(), bounds?.Bottom()]).toEqual([
      -2,
      top,
      9,
      bottom,
    ]);
    expect(f.device.GetTextWidth("prefixABCsuffix", 6, 3)).toBe(13);
    f.device.DrawText(new Point(3, 4), "prefixABCsuffix", 6, 3);
    expect(
      f.context.measureText.mock.calls.every(
        /** Entire source request slices the exact UTF16 fragment at the browser layout boundary. @param call - Captured host request. @returns Match. */ (
          call,
        ) => call[0] === "ABC",
      ),
    ).toBe(true);
    expect(f.context.fillText.mock.calls).toEqual([["ABC", 3, baseline]]);
  },
);
it("keeps empty ink distinct from absent metrics and rejects an invented baseline", /** Actual Canvas unsupported-metric paths remain explicit. @returns Nothing. */ () => {
  const f = fixture();
  expect(f.device.GetTextBoundRect("Label", 0, 0)?.IsEmpty()).toBe(true);
  expect(f.context.measureText).not.toHaveBeenCalled();
  Object.assign(f.metrics, {
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 0,
    actualBoundingBoxAscent: 0,
    actualBoundingBoxDescent: 0,
  });
  expect(f.device.GetTextBoundRect(" ", 0, 1)?.IsEmpty()).toBe(true);
  f.metrics.fontBoundingBoxAscent = NaN;
  expect(f.device.GetTextBoundRect("A", 0, 1)).toBeUndefined();
  expect(
    /** Unavailable actual font metrics. @returns Nothing. */ () =>
      f.device.DrawText(new Point(), "A", 0, 1),
  ).toThrow("metrics are unavailable");
  const value = font("Physical");
  value.SetAlignment(TextAlign.ALIGN_BASELINE);
  f.device.SetFont(value);
  f.metrics.actualBoundingBoxRight = NaN;
  expect(f.device.GetTextBoundRect("A", 0, 1)).toBeUndefined();
});
it("connects actual Canvas operations to source style measurement,drawing and font restoration", /** Full browser raster and document ownership are verified separately in Chromium. @returns Nothing. */ () => {
  const f = fixture(),
    value = font("Style");
  value.SetWeight(FontWeight.WEIGHT_BOLD);
  value.SetFontHeight(40);
  const changes = [{ scriptType: SvtScriptType.LATIN, changePos: 7, textWidth: 0 }];
  const bounds = calcStylePreviewBounds(f.device, "Heading", changes, { latin: value });
  expect(bounds).toBeInstanceOf(Rectangle);
  drawStylePreviewEntry(f.device, new Rectangle(0, 0, 99, 29), bounds, "Heading", changes, {
    latin: value,
  });
  expect(f.context.fillText).toHaveBeenCalledWith("Heading", 8, 23);
  expect(f.device.GetFont().Equals(f.ui)).toBe(true);
  expect(f.context.font).toBe("normal 400 20px ui-serif, serif");
});

it("converts actual absolute shell units with native signed rounding and rejects host-relative units", /** Covers physical-unit and pixel boundaries without depending on user ruler preference. @returns Nothing. */ () => {
  for (const [unit, value, expected] of [
    [MapUnit.Map100thMM, 2540, 96],
    [MapUnit.Map10thMM, 254, 96],
    [MapUnit.MapMM, 254, 960],
    [MapUnit.MapCM, 254, 9600],
    [MapUnit.Map1000thInch, 1000, 96],
    [MapUnit.Map100thInch, 100, 96],
    [MapUnit.Map10thInch, 10, 96],
    [MapUnit.MapInch, 1, 96],
    [MapUnit.MapPoint, 72, 96],
    [MapUnit.MapTwip, 1440, 96],
    [MapUnit.MapPixel, 96, 96],
  ] as const) {
    const actual = stylePreviewLogicToCssPixel(new Size(value, -value), unit);
    expect([actual.Width(), actual.Height()]).toEqual([expected, -expected]);
  }
  // Boundary witness only: real native Size stores integers,so fractional pixel inputs are not document-reachable.
  const half = stylePreviewLogicToCssPixel(
    {
      Width: /** Supplies the synthetic half-pixel boundary. @returns Half pixel. */ () => 0.5,
      Height: /** Supplies the signed synthetic boundary. @returns Negative half pixel. */ () =>
        -0.5,
    },
    MapUnit.MapPixel,
  );
  expect([half.Width(), half.Height()]).toEqual([1, -1]);
  for (const unit of [MapUnit.MapAppFont, MapUnit.MapSysFont, MapUnit.MapRelative])
    expect(
      /** Converts an unsupported host-relative unit. @returns No pixel size. */ () =>
        stylePreviewLogicToCssPixel(new Size(1, 1), unit),
    ).toThrow("absolute shell map unit");
});
it("passes detached source font,actual baseline and color to the SVG paint sink", /** The sink adapts only output and cannot change the native device font. @returns Nothing. */ () => {
  const f = fixture(),
    sink = vi.fn();
  const device = new BrowserStylePreviewDevice(
    f.context as unknown as CanvasRenderingContext2D,
    f.ui,
    "#123456",
    { background: COL_WHITE, fillColor: COL_WHITE, lineColor: undefined },
    sink,
  );
  device.DrawText(new Point(2, 3), "Heading", 1, 3);
  expect(sink).toHaveBeenCalledWith(
    expect.objectContaining({
      text: "ead",
      x: 2,
      y: 23,
      cssFont: f.context.font,
      color: "#123456",
    }),
  );
  expect(f.context.fillText).not.toHaveBeenCalled();
  const output = sink.mock.calls[0]?.[0];
  output.font.SetFontHeight(99);
  expect(device.GetFont().GetFontHeight()).toBe(20);
});

it("projects source channels and distinguishes unknown CSS color spaces", /** Tests the actual accepted computed-style grammar and channel limits. @returns Nothing. */ () => {
  expect(browserColor(new Color(0x123456))).toBe("#123456");
  expect(browserColor(new Color(ColorAlpha, 0, 1, 2, 3, "ColorAlphaTag"))).toBe("transparent");
  const alpha = new Color(ColorAlpha, 128, 1, 2, 3, "ColorAlphaTag");
  expect(browserColor(alpha)).toBe(`rgba(1, 2, 3, ${128 / 255})`);
  expect(browserComputedColor("rgb(18, 52, 86)")?.toUInt32()).toBe(0x123456);
  expect(browserComputedColor("rgba(1, 2, 3, 0.5)")?.equals(alpha)).toBe(true);
  for (const css of [
    "oklch(30% 0.2 30)",
    "transparent",
    "rgba(256, 0, 0, 1)",
    "rgb(0, 256, 0)",
    "rgb(0, 0, 256)",
    "rgba(0, 0, 0, 2)",
    "rgba(0, 0, 0, .)",
  ])
    expect(browserComputedColor(css)).toBeUndefined();
});
