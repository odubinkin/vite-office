/** @fileoverview Native style preview color decisions over actual Color values; explicit device traces are protocol evidence, not native raster evidence. */
import { expect, it, vi } from "vitest";
import { Color, COL_AUTO, COL_BLACK, COL_WHITE } from "../../../tools/inc/color";
import { Rectangle } from "../../../tools/inc/gen";
import { FillStyle } from "../../../offapi/com/sun/star/drawing/FillStyle";
import {
  applyStylePreviewColors,
  initializeStylePreviewTextColor,
  testStylePreviewColorsVisible,
} from "./tbcontrl.stylecolor";

/** Explicit source device protocol trace. @returns Device and source row. */
function fixture() {
  const device = {
    SetTextColor: vi.fn(),
    SetFillColor: vi.fn(),
    DrawRect: vi.fn(),
    GetBackgroundColor: vi.fn(
      /** Supplies an explicit real device background value. @returns Color. */ () => COL_WHITE,
    ),
  };
  return { device, row: new Rectangle(2, 4, 80, 30) };
}

it.each([
  [0, 30],
  [120, 122],
  [121, 91],
  [128, 98],
  [139, 109],
  [140, 137],
  [255, 225],
])(
  "preserves the source luminance interval and contrast for gray %s",
  /** Checks strict open interval120..140 and original contrast arithmetic. @param channel - Actual gray. @param expected - Source result. @returns Nothing. */ (
    channel,
    expected,
  ) => {
    const value = new Color(channel, channel, channel);
    const result = testStylePreviewColorsVisible(value, value);
    expect([result.GetRed(), result.GetGreen(), result.GetBlue()]).toEqual([
      expected,
      expected,
      expected,
    ]);
    expect(value.GetRed()).toBe(channel);
    expect(result).not.toBe(value);
  },
);

it("keeps contrasting colors and preserves original automatic alpha while adjusting similar backgrounds", /** Does not invent an opaque fallback for COL_AUTO. @returns Nothing. */ () => {
  expect(testStylePreviewColorsVisible(COL_BLACK, COL_WHITE).equals(COL_BLACK)).toBe(true);
  expect(testStylePreviewColorsVisible(COL_WHITE, COL_BLACK).equals(COL_WHITE)).toBe(true);
  expect(testStylePreviewColorsVisible(COL_AUTO, COL_WHITE).toUInt32()).toBe(0xffe1e1e1);
  expect(COL_AUTO.toUInt32()).toBe(0xffffffff);
});

it("retains the redundant IsBright guard as unreachable defensive source code", /** Real Color.IsBright is exactly !IsDark, so this branch cannot occur with native values; test-only instrumentation preserves coverage without altering production logic. @returns Nothing. */ () => {
  const background = new Color(COL_WHITE);
  vi.spyOn(background, "IsBright").mockReturnValue(false);
  expect(testStylePreviewColorsVisible(COL_WHITE, background).equals(COL_WHITE)).toBe(true);
});

it("initializes actual UI text colors before any style lookup", /** Early shell/pool/style exits retain this color. @returns Nothing. */ () => {
  const f = fixture();
  initializeStylePreviewTextColor(f.device, false, COL_BLACK, COL_WHITE);
  initializeStylePreviewTextColor(f.device, true, COL_BLACK, COL_WHITE);
  expect(f.device.SetTextColor.mock.calls).toEqual([[COL_BLACK], [COL_WHITE]]);
});

it("suppresses all style colors on selected rows", /** The highlight text is retained and the existing selected background is not repainted. @returns Nothing. */ () => {
  const f = fixture();
  initializeStylePreviewTextColor(f.device, true, COL_BLACK, COL_WHITE);
  applyStylePreviewColors(f.device, f.row, true, {
    foreground: COL_BLACK,
    fillStyle: FillStyle.SOLID,
    fillColor: COL_WHITE,
  });
  expect(f.device.SetTextColor.mock.calls).toEqual([[COL_WHITE]]);
  expect(f.device.DrawRect).not.toHaveBeenCalled();
  expect(f.device.SetFillColor).not.toHaveBeenCalled();
  expect(f.device.GetBackgroundColor).not.toHaveBeenCalled();
});

it.each([undefined, FillStyle.NONE, FillStyle.GRADIENT, FillStyle.HATCH, FillStyle.BITMAP])(
  "retains source missing/unsupported fill behavior for %s",
  /** Other background kinds remain the original SetupEntry TODO. @param style - Actual optional item value. @returns Nothing. */ (
    style,
  ) => {
    const f = fixture();
    applyStylePreviewColors(f.device, f.row, false, {
      fillColor: COL_BLACK,
      ...(style === undefined ? {} : { fillStyle: style }),
    });
    expect(f.device.DrawRect).not.toHaveBeenCalled();
    expect(f.device.SetTextColor).not.toHaveBeenCalled();
    expect(f.device.GetBackgroundColor).not.toHaveBeenCalled();
  },
);

it.each([{}, { fillColor: COL_AUTO }])(
  "retains automatic or absent solid fill %s",
  /** No native color assignment or rectangle paint is invented. @param fields - Actual optional fill item. @returns Nothing. */ (
    fields,
  ) => {
    const f = fixture();
    applyStylePreviewColors(f.device, f.row, false, { fillStyle: FillStyle.SOLID, ...fields });
    expect(f.device.DrawRect).not.toHaveBeenCalled();
    expect(f.device.SetTextColor).not.toHaveBeenCalled();
  },
);

it("paints actual solid background before choosing the adjusted foreground", /** Real color values and exact row are passed without mutation. @returns Nothing. */ () => {
  const f = fixture();
  applyStylePreviewColors(f.device, f.row, false, {
    foreground: COL_BLACK,
    fillStyle: FillStyle.SOLID,
    fillColor: COL_BLACK,
  });
  expect(f.device.SetFillColor).toHaveBeenCalledWith(COL_BLACK);
  expect(f.device.DrawRect).toHaveBeenCalledWith(f.row);
  expect(f.device.SetTextColor.mock.calls[0]?.[0].toUInt32()).toBe(0x1e1e1e);
  expect(f.device.DrawRect.mock.invocationCallOrder[0]).toBeLessThan(
    f.device.SetTextColor.mock.invocationCallOrder[0] as number,
  );
  expect(f.device.GetBackgroundColor).not.toHaveBeenCalled();
});

it("uses actual device background for explicit text without a solid style background", /** Tests lazy background lookup and automatic text on contrasting solid fill. @returns Nothing. */ () => {
  const f = fixture();
  applyStylePreviewColors(f.device, f.row, false, { foreground: COL_WHITE });
  expect(f.device.GetBackgroundColor).toHaveBeenCalledOnce();
  expect(f.device.SetTextColor.mock.calls[0]?.[0].toUInt32()).toBe(0xe1e1e1);
  f.device.SetTextColor.mockClear();
  applyStylePreviewColors(f.device, f.row, false, {
    foreground: COL_AUTO,
    fillStyle: FillStyle.SOLID,
    fillColor: COL_BLACK,
  });
  expect(f.device.SetTextColor).not.toHaveBeenCalled();
  applyStylePreviewColors(f.device, f.row, false, {
    fillStyle: FillStyle.SOLID,
    fillColor: COL_WHITE,
  });
  expect(f.device.SetTextColor.mock.calls[0]?.[0].toUInt32()).toBe(0xffe1e1e1);
});
