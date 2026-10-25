/** @fileoverview Source FontNameBox paint decisions over actual font/charmap values and explicit deterministic device-rectangle fixtures; browser raster parity is tested separately. */
import { describe, expect, it } from "vitest";
import { Font } from "../../../vcl/source/font/font";
import { FontCharMap } from "../../../vcl/source/font/fontcharmap";
import { hasGlyphsInFontCharMap } from "../../../vcl/source/outdev/font";
import { Size } from "../../../tools/inc/gen";
import { UnicodeCoverage as U, type FontCapabilities } from "../../../vcl/inc/fontcapabilities";
import {
  drawFontNamePreview,
  getFontNamePreviewSize,
  type FontNamePreviewDevice,
  type FontPreviewBounds,
} from "./ctrlbox.fontname";

/** Paint trace with immutable font and color values. */
interface Paint {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly family: string;
  readonly height: number;
  readonly color: string;
}

/** Returns explicit six-pixel advances and current font-height ink. @param font - Current font. @param text - Text. @returns Fixture rectangle, never installed-font evidence. */
function fixtureBounds(font: Font, text: string): FontPreviewBounds | undefined {
  return text.length === 0
    ? undefined
    : {
        left: 0,
        top: -Math.trunc(font.GetFontHeight() * 0.75),
        width: text.length * 6,
        height: font.GetFontHeight(),
      };
}

/** Explicit rectangle fixture device; glyph coverage and sample selection use actual native owners. */
class PaintDevice implements FontNamePreviewDevice {
  private font = new Font();
  private color = "original";
  readonly painted: Paint[] = [];
  readonly sizes: number[] = [];
  /** Configures independent physical map and rectangle fixture. @param map - Actual native coverage. @param capabilities - Actual advertised bits. @param measure - Supplied device-rectangle fixture. @returns Device. */
  constructor(
    readonly map: FontCharMap | undefined,
    readonly capabilities?: FontCapabilities,
    readonly measure = fixtureBounds,
  ) {
    this.font.SetFamilyName("UI");
    this.font.SetFontHeight(12);
  }
  /** Reads current value. @returns Font. */
  GetFont(): Font {
    return this.font;
  }
  /** Copies source font state. @param font - New value. @returns Nothing. */
  SetFont(font: Font): void {
    this.font = new Font(font);
    this.sizes.push(font.GetFontHeight());
  }
  /** Reads actual glyph coverage. @param _font - Requested font. @param text - Text. @returns Native failure offset. */
  HasGlyphs(_font: Font, text: string): number {
    return hasGlyphsInFontCharMap(this.map, text);
  }
  /** Reads the actual map fixture. @returns Map. */
  GetFontCharMap(): FontCharMap | undefined {
    return this.map;
  }
  /** Reads advertised bits. @returns Capabilities. */
  GetFontCapabilities(): FontCapabilities | undefined {
    return this.capabilities;
  }
  /** Reads supplied device rectangles, without asserting installed font metrics. @param text - Measured text. @returns Rectangle. */
  GetTextBoundRect(text: string): FontPreviewBounds | undefined {
    return this.measure(this.font, text);
  }
  /** Reads current paint color. @returns Color. */
  GetTextColor(): string {
    return this.color;
  }
  /** Stores current paint color. @param color - New color. @returns Nothing. */
  SetTextColor(color: string): void {
    this.color = color;
  }
  /** Captures the actual draw call's values. @param x - Horizontal position. @param y - Baseline position. @param text - Actual source-selected text. @returns Nothing. */
  DrawText(x: number, y: number, text: string): void {
    this.painted.push({
      text,
      x,
      y,
      family: this.font.GetFamilyName(),
      height: this.font.GetFontHeight(),
      color: this.color,
    });
  }
}

/** Creates actual sparse map ranges for script-only glyph tests. @param text - Supported units. @returns Map. */
function map(text: string): FontCharMap {
  const chars = [
    ...new Set(
      text.split("").map(
        /** Converts a source UTF16 unit. @param char - Unit. @returns Code. */
        (char) => char.charCodeAt(0),
      ),
    ),
  ].sort(
    /** Sorts native endpoints. @param a - First. @param b - Second. @returns Order. */
    (a, b) => a - b,
  );
  return new FontCharMap(
    chars.flatMap(
      /** Creates actual half-open ranges. @param char - Unit. @returns Range. */
      (char) => [char, char + 1],
    ),
  );
}

/** Runs the native entry point and verifies device restoration on every path. @param name - Actual source family. @param device - Configured device. @param width - Item width. @param height - Item height. @param selected - Native selection. @param origin - Optional source position. @returns Paint trace. */
function draw(
  name: string,
  device: PaintDevice,
  width = 400,
  height = 24,
  selected = false,
  origin?: { x: number; y: number },
): Paint[] {
  const metric = new Font();
  metric.SetFamilyName(name);
  drawFontNamePreview(
    metric,
    device,
    new Size(width, height),
    selected,
    { text: "window", highlightText: "highlight" },
    origin,
  );
  expect(device.GetFont().GetFamilyName()).toBe("UI");
  expect(device.GetFont().GetFontHeight()).toBe(12);
  expect(device.GetTextColor()).toBe("original");
  expect(metric.GetFontHeight()).toBe(0);
  return device.painted;
}

describe("native FontNameBox paint", /** Defines source layout contracts. @returns Nothing. */ () => {
  it("uses original item sizing and own-font readable names", /** Checks integer device geometry and scoped colors. @returns Nothing. */ () => {
    const size = getFontNamePreviewSize(7.25, 13);
    expect([size.Width(), size.Height()]).toEqual([377, 20]);
    expect(draw("Alpha", new PaintDevice(map("Alpha")))).toEqual([
      { text: "Alpha", x: 5, y: 15, family: "Alpha", height: 17, color: "window" },
    ]);
    expect(draw("Alpha", new PaintDevice(map("Alpha")), 400, 24, true)[0]?.color).toBe("highlight");
    expect(
      draw("Шрифт", new PaintDevice(map("Шрифт")), 400, 24, false, { x: 3, y: 7 })[0],
    ).toMatchObject({ x: 8, y: 22, family: "Шрифт" });
  });

  it("shows a right-aligned advertised-script sample for Latin-named fonts", /** Checks real script metadata and full source sample text. @returns Nothing. */ () => {
    const device = new PaintDevice(map("Noto Arabicأبجدية عربية"), {
      oUnicodeRange: new Set([U.ARABIC]),
    });
    const painted = draw("Noto Arabic", device);
    expect(
      painted.map(
        /** Reads actual draw text. @param value - Paint. @returns Text. */
        (value) => value.text,
      ),
    ).toEqual(["Noto Arabic", "أبجدية عربية"]);
    expect(painted[1]?.x).toBe(400 - 5 - "أبجدية عربية".length * 6);
    expect(painted[1]?.family).toBe("Noto Arabic");
    const named = new PaintDevice(map("العربيةأبجدية عربية"), {
      oUnicodeRange: new Set([U.ARABIC]),
    });
    expect(draw("العربية", named)).toHaveLength(1);
  });

  it("uses the UI font for unsupported names and preserves the minimal-loop overwrite", /** Pins the source fallback order rather than inferring a script from the family name. @returns Nothing. */ () => {
    const advertised = new PaintDevice(map("أبجدية عربية"), { oUnicodeRange: new Set([U.ARABIC]) });
    expect(
      draw("Foreign", advertised).map(
        /** Reads name/sample fonts. @param paint - Actual call. @returns Family/text pair. */
        (paint) => [paint.family, paint.text],
      ),
    ).toEqual([
      ["UI", "Foreign"],
      ["Foreign", "أبجدية عربية"],
    ]);
    const both = new PaintDevice(map("أبجدية عربيةΑΒ"));
    expect(
      draw("Foreign", both).map(
        /** Reads actual native fallback results. @param paint - Call. @returns Text. */
        (paint) => paint.text,
      ),
    ).toEqual(["Foreign", "ΑΒ"]);
    expect(draw("Partial", new PaintDevice(map("אב")))[1]?.text).toBe("אב");
  });

  it("uses actual symbol coverage and retains readable UI names", /** Verifies original OpenSymbol and generic reverse-charmap samples. @returns Nothing. */ () => {
    const symbol = draw("OpenSymbol", new PaintDevice(map("✂✈✍\ue033∑⊈")));
    expect(
      symbol.map(
        /** Reads source-selected text. @param value - Call. @returns Text. */
        (value) => value.text,
      ),
    ).toEqual(["OpenSymbol", "✂✈✍\ue033∑⊈"]);
    expect(symbol[0]?.family).toBe("UI");
    expect(symbol[1]?.family).toBe("OpenSymbol");
    expect(draw("Pictograms", new PaintDevice(new FontCharMap([0x2600, 0x260b])))[1]?.text).toBe(
      "☊☉☈☇☆★☄",
    );
    expect(draw("Unknown", new PaintDevice(undefined))).toHaveLength(1);
  });

  it("shrinks in five-pixel steps and trims samples to the remaining width", /** Checks native fit operations instead of CSS ellipsis. @returns Nothing. */ () => {
    const small = new PaintDevice(map("Alpha"));
    expect(draw("Alpha", small, 400, 8)[0]?.height).toBe(7);
    expect(small.sizes).toEqual([17, 12, 7, 12]);
    const sample = new PaintDevice(map("Arabicأبجدية عربية"), {
      oUnicodeRange: new Set([U.ARABIC]),
    });
    expect(draw("Arabic", sample, 80)[1]?.text).toBe("أبجد");
    const noSpace = new PaintDevice(map("Arabicأبجدية عربية"), {
      oUnicodeRange: new Set([U.ARABIC]),
    });
    expect(draw("Arabic", noSpace, 45)).toHaveLength(1);
    const zeroSpace = new PaintDevice(map("Arabicأبجدية عربية"), {
      oUnicodeRange: new Set([U.ARABIC]),
    });
    expect(draw("Arabic", zeroSpace, 56)).toHaveLength(1);
  });

  it("retains native device-failure handling and the source offscreen-origin formula", /** Uses explicit rectangle failures and clipped device coordinates, without claiming normal dropdown reachability. @returns Nothing. */ () => {
    const unavailable = new PaintDevice(
      undefined,
      undefined,
      /** Represents an output device without text-bound support. @returns Failed measurement. */
      () => undefined,
    );
    expect(draw("Unknown", unavailable)[0]).toMatchObject({ family: "UI", x: 5, y: 12 });
    const failed = new PaintDevice(
      map("Broken"),
      undefined,
      /** Models an actual backend text-bound failure for the physical face only. @param font - Current face. @param text - Text. @returns Device rectangle or failure. */
      (font, text) =>
        font.GetFamilyName() === "UI"
          ? { left: 0, top: -9, width: text.length * 6, height: 12 }
          : undefined,
    );
    expect(draw("Broken", failed)[0]?.family).toBe("UI");
    const tall = new PaintDevice(
      map("Tall"),
      undefined,
      /** Supplies a fixed overflowing physical rectangle independent of font-height requests. @param font - Current font. @param text - Text. @returns Device rectangle. */
      (font, text) => ({
        left: 0,
        top: -9,
        width: text.length * 6,
        height: font.GetFamilyName() === "UI" ? 12 : 100,
      }),
    );
    expect(draw("Tall", tall, 100, 2)[0]?.family).toBe("UI");
    const clipped = new PaintDevice(map("Aأبجدية عربية"), { oUnicodeRange: new Set([U.ARABIC]) });
    expect(draw("A", clipped, 20, 24, false, { x: -100, y: 0 })[1]?.text).toBe("أبج");
  });
});
