/** @fileoverview Canvas style device protocol over actual native font and geometry values;explicit metrics are fixtures,not native raster evidence. */
import { expect, it, vi } from "vitest";
import { BrowserStylePreviewDevice } from "./style-preview-device";
import { Font } from "../source/font/font";
import { Point, Rectangle } from "../../tools/inc/gen";
import { FontItalic, FontWeight, TextAlign } from "../../tools/inc/fontenum";
import { SvtScriptType } from "../../svl/inc/languageoptions";
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
  };
  const ui = font("ui-serif, serif"),
    device = new BrowserStylePreviewDevice(
      context as unknown as CanvasRenderingContext2D,
      ui,
      "#123456",
    );
  return { context, metrics, ui, device };
}
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
