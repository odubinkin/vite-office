/** @fileoverview Canvas device protocol with explicit TextMetrics fixtures and actual native font/map values; no installed-font or browser-raster parity claim. */
import { expect, it, vi } from "vitest";
import { Font } from "../source/font/font";
import { FontCharMap } from "../source/font/fontcharmap";
import { drawFontNamePreview } from "../../svtools/source/control/ctrlbox.fontname";
import { Size } from "../../tools/inc/gen";
import {
  BrowserFontPreviewDevice,
  quoteFontFamily,
  type BrowserFontPreviewFace,
} from "./font-preview-device";

/** Creates an explicit Canvas protocol fixture; actual Chromium paint is verified by integrated UI tests. @returns Context and observable calls. */
function context() {
  const canvas = {
    font: "",
    fillStyle: "",
    textBaseline: "",
    textAlign: "",
    measureText: vi.fn(
      /** Returns an explicit fractional ink rectangle. @returns Native-shaped metrics. */
      () => ({
        actualBoundingBoxLeft: 2.3,
        actualBoundingBoxRight: 12.2,
        actualBoundingBoxAscent: 8.1,
        actualBoundingBoxDescent: 2.9,
      }),
    ),
    fillText: vi.fn(),
  };
  return { canvas, native: canvas as unknown as CanvasRenderingContext2D };
}

/** Creates an actual native family/size value. @param name - Family. @param height - Pixel height. @returns Independent font. */
function font(name: string, height = 13): Font {
  const value = new Font();
  value.SetFamilyName(name);
  value.SetFontHeight(height);
  return value;
}

it("connects the real Canvas adapter to native FontNameBox paint without a protocol facade", /** Verifies the production device and source renderer compose directly; Canvas metrics are still explicit fixtures. @returns Nothing. */ () => {
  const c = context();
  const device = new BrowserFontPreviewDevice(
    c.native,
    font("system-ui"),
    { style: "normal", weight: "400", color: "black" },
    /** Supplies actual physical map values for the requested family. @param family - Current font. @returns Face metadata. */
    (family) => (family === "ABC" ? { characterMap: new FontCharMap([65, 91]) } : undefined),
  );
  drawFontNamePreview(font("ABC", 0), device, new Size(400, 24), false, {
    text: "black",
    highlightText: "white",
  });
  expect(c.canvas.fillText.mock.calls).toEqual([["ABC", 5, 15]]);
  expect(c.canvas.font).toBe("normal 400 13px system-ui");
  expect(device.GetTextColor()).toBe("black");
});

it("quotes physical names without turning commas or controls into CSS fallback syntax", /** Pins the single-family CSS value. @returns Nothing. */ () => {
  expect(quoteFontFamily("Liberation Serif")).toBe('"Liberation Serif"');
  expect(quoteFontFamily('A",B\\\n\0\x7f')).toBe('"A\\22 ,B\\5c \\a \\0 \\7f "');
});

it("selects actual UI and face descriptors while keeping native font handles independent", /** Checks the Canvas protocol, not installed font availability. @returns Nothing. */ () => {
  const c = context();
  const ui = font("system-ui, sans-serif");
  const faces = new Map<string, BrowserFontPreviewFace>([
    ["Physical, Serif", { style: "oblique", weight: "700" }],
    ["Defaults", {}],
    ["Logical", { renderingFamily: "Actual private face" }],
  ]);
  const device = new BrowserFontPreviewDevice(
    c.native,
    ui,
    { style: "italic", weight: "600", color: "#123456" },
    /** Returns actual registered metadata or absence. @param name - Family. @returns Face. */
    (name) => faces.get(name),
  );
  expect(c.canvas.font).toBe("italic 600 13px system-ui, sans-serif");
  expect(c.canvas.textBaseline).toBe("alphabetic");
  expect(c.canvas.textAlign).toBe("left");
  expect(device.GetTextColor()).toBe("#123456");
  const physical = font("Physical, Serif", 18);
  device.SetFont(physical);
  physical.SetFamilyName("Changed");
  expect(device.GetFont().GetFamilyName()).toBe("Physical, Serif");
  expect(c.canvas.font).toBe('oblique 700 18px "Physical, Serif"');
  device.SetFont(font("Logical"));
  expect(c.canvas.font).toBe('normal 400 13px "Actual private face"');
  device.SetFont(font("Defaults"));
  expect(c.canvas.font).toBe('normal 400 13px "Defaults"');
  device.SetFont(font("Unknown"));
  expect(c.canvas.font).toBe('normal 400 13px "Unknown"');
  device.SetFont(ui);
  expect(c.canvas.font).toBe("italic 600 13px system-ui, sans-serif");
  device.SetTextColor("#abcdef");
  expect([device.GetTextColor(), c.canvas.fillStyle]).toEqual(["#abcdef", "#abcdef"]);
  device.DrawText(5, 14, "Actual text");
  expect(c.canvas.fillText.mock.calls).toEqual([["Actual text", 5, 14]]);
});

it("reads actual physical coverage independently of the currently selected paint font", /** Unknown and default maps never stand in for installed font support. @returns Nothing. */ () => {
  const c = context();
  const map = new FontCharMap([65, 68]);
  const capabilities = { oUnicodeRange: new Set([0]), oCodePageRange: new Set<number>() };
  const faces = new Map<string, BrowserFontPreviewFace>([
    ["Known", { characterMap: map, capabilities }],
    ["Default map", { characterMap: new FontCharMap() }],
    ["No map", {}],
  ]);
  const device = new BrowserFontPreviewDevice(
    c.native,
    font("UI"),
    { style: "normal", weight: "400", color: "black" },
    /** Reads exact acquired values. @param name - Family. @returns Face or absence. */
    (name) => faces.get(name),
  );
  expect(device.HasGlyphs(font("Known"), "ABC")).toBe(-1);
  expect(device.HasGlyphs(font("Known"), "AX")).toBe(1);
  expect(device.HasGlyphs(font("Unknown"), "A")).toBe(0);
  expect(device.HasGlyphs(font("Default map"), "A")).toBe(0);
  for (const family of ["Unknown", "Default map", "No map"]) {
    device.SetFont(font(family));
    expect(device.GetFontCharMap()).toBeUndefined();
    expect(device.GetFontCapabilities()).toBeUndefined();
  }
  device.SetFont(font("Known"));
  expect(device.GetFontCharMap()).toBe(map);
  expect(device.GetFontCapabilities()).toBe(capabilities);
});

it("measures actual Canvas ink extents and refuses missing metrics without invented widths", /** Checks integer geometry and genuine unsupported-device paths. @returns Nothing. */ () => {
  const c = context();
  const device = new BrowserFontPreviewDevice(
    c.native,
    font("UI"),
    { style: "normal", weight: "400", color: "black" },
    /** Represents absent physical metadata. @returns No face. */
    () => undefined,
  );
  expect(device.GetTextBoundRect("")).toBeUndefined();
  expect(c.canvas.measureText).not.toHaveBeenCalled();
  expect(device.GetTextBoundRect("Ink")).toEqual({ left: -3, top: -9, width: 16, height: 12 });
  c.canvas.measureText.mockReturnValue({
    actualBoundingBoxLeft: NaN,
    actualBoundingBoxRight: 12,
    actualBoundingBoxAscent: 8,
    actualBoundingBoxDescent: 2,
  });
  expect(device.GetTextBoundRect("Unavailable ink")).toBeUndefined();
});
