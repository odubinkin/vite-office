/** @fileoverview Native style measurement/drawing order with explicit device metrics; these fixtures do not claim actual browser raster parity or EditEngine script analysis. */
import { expect, it, vi } from "vitest";
import { Font, type ConstFont } from "../../../vcl/source/font/font";
import { Point, Rectangle, Size } from "../../../tools/inc/gen";
import { SvtScriptType as Script } from "../../../svl/inc/languageoptions";
import {
  calcStylePreviewBounds,
  drawStylePreviewEntry,
  type StylePreviewFonts,
  type StylePreviewScriptInfo,
  type StylePreviewTextDevice,
} from "./tbcontrl.stylerender";
/** Creates an actual font value. @param name - Family. @param width - Stored width. @param height - Stored height. @returns Independent font. */
function font(name: string, width = 10, height = 20): Font {
  const value = new Font();
  value.SetFamilyName(name);
  value.SetFontSize(new Size(width, height));
  return value;
}
/** Creates mutable native ScriptInfo data with explicit source-analysis inputs. @param scriptType - Source script. @param changePos - UTF16 endpoint. @param textWidth - Measured advance. @returns Native data. */
function run(scriptType: Script, changePos: number, textWidth = 0): StylePreviewScriptInfo {
  return { scriptType, changePos, textWidth };
}
/** Supplies a concrete device protocol over real font values with explicit measurement fixtures. @returns Observable device and font state. */
function fixture() {
  let current = font("UI");
  const measure = vi.fn<StylePreviewTextDevice["GetTextBoundRect"]>(
    /** Explicit ink rectangle. @returns Fixture rectangle. */ () => new Rectangle(-2, 3, 15, 18),
  );
  const width = vi.fn<StylePreviewTextDevice["GetTextWidth"]>(
    /** Explicit advance. @returns Device advance. */ () => 21,
  );
  const draws: { position: Point; name: string; start: number; length: number; font: Font }[] = [];
  const device: StylePreviewTextDevice = {
    GetFont: /** Reads actual value state. @returns Current font. */ () => current,
    SetFont:
      /** Copies font state as a real device does. @param value - Actual selected font. @returns Nothing. */ (
        value: ConstFont,
      ) => {
        current = new Font(value);
      },
    GetTextBoundRect: measure,
    GetTextWidth: width,
    DrawText:
      /** Captures by-value native position/font and original text offsets. @param position - Actual pen. @param name - Entire text. @param start - UTF16 start. @param length - UTF16 length. @returns Nothing. */ (
        position,
        name,
        start,
        length,
      ) => {
        draws.push({ position: new Point(position), name, start, length, font: new Font(current) });
      },
  };
  const fonts: StylePreviewFonts = {
    latin: font("Western"),
    asian: font("CJK", 12, 30),
    complex: font("CTL", 14, 40),
  };
  return { device, measure, width, draws, fonts };
}
it("unions unshifted run ink while measuring and drawing each advance separately", /** Source ink union is not translated by accumulated advance. @returns Nothing. */ () => {
  const f = fixture(),
    changes = [run(Script.LATIN, 1), run(Script.ASIAN, 2), run(Script.COMPLEX, 3)];
  f.measure
    .mockReturnValueOnce(new Rectangle(0, 2, 10, 10))
    .mockReturnValueOnce(new Rectangle(-2, 1, 20, 18))
    .mockReturnValueOnce(new Rectangle(0, 3, 15, 17));
  f.width.mockReturnValueOnce(21).mockReturnValueOnce(31).mockReturnValueOnce(41);
  const bounds = calcStylePreviewBounds(f.device, "A字ش", changes, f.fonts);
  expect([bounds.Left(), bounds.Top(), bounds.Right(), bounds.Bottom()]).toEqual([-2, 1, 20, 18]);
  expect(
    changes.map(
      /** Reads written native advances. @param entry - Actual run. @returns Width. */ (entry) =>
        entry.textWidth,
    ),
  ).toEqual([21, 31, 41]);
  expect(f.measure.mock.calls).toEqual([
    ["A字ش", 0, 1],
    ["A字ش", 1, 1],
    ["A字ش", 2, 1],
  ]);
  drawStylePreviewEntry(f.device, new Rectangle(10, 20, 109, 49), bounds, "A字ش", changes, f.fonts);
  expect(
    f.draws.map(
      /** Projects actual drawing state. @param draw - Captured operation. @returns Values. */ (
        draw,
      ) => [
        draw.position.X(),
        draw.position.Y(),
        draw.font.GetFamilyName(),
        draw.start,
        draw.length,
      ],
    ),
  ).toEqual([
    [18, 26, "Western", 0, 1],
    [39, 26, "CJK", 1, 1],
    [70, 26, "CTL", 2, 1],
  ]);
  expect(f.device.GetFont().GetFamilyName()).toBe("UI");
});
it("uses exact script flag comparisons and restores the original font between runs", /** Unknown/mixed flags select the western member and absent members use the saved device font. @returns Nothing. */ () => {
  const f = fixture(),
    changes = [run(Script.ASIAN, 1), run(Script.UNKNOWN, 2), run(Script.LATIN | Script.ASIAN, 3)];
  const seen: string[] = [];
  f.width.mockImplementation(
    /** Inspects current actual font. @returns Explicit advance. */ () => {
      seen.push(f.device.GetFont().GetFamilyName());
      return 7;
    },
  );
  calcStylePreviewBounds(f.device, "XYZ", changes, { latin: f.fonts.latin as ConstFont });
  expect(seen).toEqual(["UI", "Western", "Western"]);
  drawStylePreviewEntry(
    f.device,
    new Rectangle(0, 0, 99, 29),
    new Rectangle(0, 0, 9, 20),
    "XYZ",
    changes,
    {},
  );
  expect(
    f.draws.every(
      /** Each absent member retains UI font. @param draw - Actual draw. @returns Match. */ (
        draw,
      ) => draw.font.GetFamilyName() === "UI",
    ),
  ).toBe(true);
});
it("scales integer font sizes and each drawing advance using Bottom rather than ink height", /** Native casts truncate width,height and each pen adjustment separately. @returns Nothing. */ () => {
  const f = fixture(),
    changes = [run(Script.LATIN, 1, 7), run(Script.ASIAN, 2, 9)];
  const observed: number[][] = [];
  f.width.mockImplementation(
    /** Captures scaled device state. @returns Advance. */ () => {
      const value = f.device.GetFont();
      observed.push([value.GetFontSize().Width(), value.GetFontHeight()]);
      return 7;
    },
  );
  calcStylePreviewBounds(f.device, "AB", changes, f.fonts, 0.5);
  expect(observed).toEqual([
    [5, 10],
    [6, 15],
  ]);
  changes.forEach(
    /** Restores explicit drawing advance fixtures after measurement. @param entry - Run. @param index - Position. @returns Nothing. */ (
      entry,
      index,
    ) => {
      entry.textWidth = index === 0 ? 7 : 9;
    },
  );
  drawStylePreviewEntry(
    f.device,
    new Rectangle(0, 0, 99, 29),
    new Rectangle(0, 20, 10, 40),
    "AB",
    changes,
    f.fonts,
  );
  expect(
    f.draws.map(
      /** Captures fitted font and independent pen rounding. @param draw - Actual draw. @returns Values. */ (
        draw,
      ) => [
        draw.position.X(),
        draw.position.Y(),
        draw.font.GetFontSize().Width(),
        draw.font.GetFontHeight(),
      ],
    ),
  ).toEqual([
    [8, 0, 7, 15],
    [13, 0, 9, 22],
  ]);
  expect(f.device.GetFont().GetFontHeight()).toBe(20);
});
it("measures an empty analysis with western fallback and retains an empty rectangle on failed ink", /** The native calculation has an empty-vector branch while drawing has an unchecked nonempty precondition. @returns Nothing. */ () => {
  const f = fixture();
  f.measure.mockReturnValue(undefined);
  const bounds = calcStylePreviewBounds(f.device, "Label", [], {});
  expect(bounds.IsEmpty()).toBe(true);
  expect(f.width).toHaveBeenCalledWith("Label", 0, 5);
  expect(
    /** Invalid drawing domain. @returns Nothing. */ () =>
      drawStylePreviewEntry(f.device, new Rectangle(), bounds, "Label", [], {}),
  ).toThrow("nonempty CheckScript");
  expect(f.draws).toHaveLength(0);
});
it("stops at the available run count even when its final endpoint precedes the label end", /** Mirrors the two native termination guards without synthesizing missing runs. @returns Nothing. */ () => {
  const f = fixture(),
    changes = [run(Script.COMPLEX, 1)];
  calcStylePreviewBounds(f.device, "Long", changes, f.fonts);
  drawStylePreviewEntry(
    f.device,
    new Rectangle(0, 0, 99, 29),
    new Rectangle(),
    "Long",
    changes,
    f.fonts,
  );
  expect(f.draws).toHaveLength(1);
  expect(f.draws[0]?.length).toBe(1);
});
it("restores font state after actual device exceptions", /** Both measurement and drawing scoped-font guards unwind failures. @returns Nothing. */ () => {
  const f = fixture(),
    changes = [run(Script.COMPLEX, 1)];
  f.measure.mockImplementationOnce(
    /** Actual device failure. @returns Never. */ () => {
      throw new Error("measurement");
    },
  );
  expect(
    /** Failed measurement. @returns Rectangle. */ () =>
      calcStylePreviewBounds(f.device, "X", changes, f.fonts),
  ).toThrow("measurement");
  expect(f.device.GetFont().GetFamilyName()).toBe("UI");
  vi.spyOn(f.device, "DrawText").mockImplementationOnce(
    /** Actual drawing failure. @returns Never. */ () => {
      throw new Error("paint");
    },
  );
  expect(
    /** Failed paint. @returns Nothing. */ () =>
      drawStylePreviewEntry(f.device, new Rectangle(), new Rectangle(), "X", changes, f.fonts),
  ).toThrow("paint");
  expect(f.device.GetFont().GetFamilyName()).toBe("UI");
});
