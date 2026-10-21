/** @fileoverview Checks original unit tables,map conversion,density and stroke admission. */
import { expect, it } from "vitest";
import {
  DEFAULT_RULER_UNIT,
  getRulerMaximumLabel,
  getRulerTickTwips,
  projectWriterRulerTicks,
} from "./writer-ruler-ticks";
import { RULER_UNIT_DATA } from "../../../svtools/source/control/ruler";
import { FieldUnit as F } from "../../../tools/inc/fldunit";

/** Borrows the actual native table row. @param unit - Native unit. @returns Row. */
function row(unit: F) {
  const result = RULER_UNIT_DATA.find(
    /** Matches original enum. @param entry - Table row. @returns Whether matched. */ (entry) =>
      entry[0] === unit,
  )?.[1];
  if (result === undefined) throw new Error("Missing native table fixture");
  return result;
}

it("keeps actual native map units and fine/coarse physical divisions", /** Checks physical conversions independently of the document. @returns Nothing. */ () => {
  expect(DEFAULT_RULER_UNIT).toBe(row(F.CM));
  expect(getRulerTickTwips(row(F.CM))).toBeCloseTo(1440 / 25.4);
  expect(getRulerTickTwips(row(F.CM), true)).toBeCloseTo((5 * 1440) / 25.4);
  expect(getRulerTickTwips(row(F.INCH))).toBe(90);
  expect(getRulerTickTwips(row(F.INCH), true)).toBe(180);
  expect(getRulerTickTwips(row(F.MM))).toBeCloseTo(1440 / 25.4 / 4);
  expect(getRulerTickTwips(row(F.POINT))).toBe(240);
  expect(getRulerMaximumLabel(row(F.INCH), -14400)).toBe("10");
  expect(getRulerMaximumLabel(row(F.CM), 14400)).toBe("25");
});

it("uses font measurement to thin millimetre labels without changing physical lengths", /** Checks original multiplier and interval selection. @returns Nothing. */ () => {
  const ticks = projectWriterRulerTicks(row(F.MM), 14400, 1440, 18);
  expect(
    ticks.every(
      /** Only sufficiently separated labels survive. @param tick - Tick projection. @returns Whether labelled. */ (
        tick,
      ) => tick.label !== "",
    ),
  ).toBe(true);
  const zero = ticks.find(
    /** Finds physical null point. @param tick - Tick projection. @returns Whether zero. */ (
      tick,
    ) => tick.index === 0,
  );
  expect(zero?.position).toBe(96);
  expect(zero?.label).toBe("0");
  expect(
    ticks.find(
      /** Finds the next major division. @param tick - Tick projection. @returns Whether one step. */ (
        tick,
      ) => tick.index === 1,
    )?.label,
  ).toBe("6");
});

it("honors greater-than-six pixel stroke admission for the inch table", /** Checks exact half/eighth/sixteenth divisions. @returns Nothing. */ () => {
  const ticks = projectWriterRulerTicks(row(F.INCH), 2880, 0, 6);
  expect(
    ticks.some(
      /** Zero at an origin on the page edge is hidden. @param tick - Tick projection. @returns Whether zero. */ (
        tick,
      ) => tick.index === 0,
    ),
  ).toBe(false);
  expect(
    ticks.find(
      /** Sixteenth inch has a six-pixel gap. @param tick - Tick projection. @returns Whether first minor. */ (
        tick,
      ) => tick.index === 1,
    ),
  ).toBeUndefined();
  expect(
    ticks.find(
      /** Eighth inch is admitted. @param tick - Tick projection. @returns Whether eighth. */ (
        tick,
      ) => tick.index === 2,
    )?.length,
  ).toBe(7);
  expect(
    ticks.find(
      /** Half inch is a larger stroke. @param tick - Tick projection. @returns Whether half. */ (
        tick,
      ) => tick.index === 8,
    )?.length,
  ).toBe(12);
  expect(
    ticks.find(
      /** Whole inch is labelled. @param tick - Tick projection. @returns Whether whole. */ (
        tick,
      ) => tick.index === 16,
    )?.label,
  ).toBe("1");
});

it("uses original character and line fallback widths without rewriting their table constants", /** Checks relative-unit display projection. @returns Nothing. */ () => {
  for (const [unit, width] of [
    [F.CHAR, 371],
    [F.LINE, 551],
  ] as const) {
    expect(getRulerMaximumLabel(row(unit), ((width * 1440) / 2540) * 10)).toBe("10");
    const ticks = projectWriterRulerTicks(row(unit), 14400, 1440, 8);
    expect(
      ticks.find(
        /** Locates a two-relative-unit label. @param tick - Tick projection. @returns Whether first major. */ (
          tick,
        ) => tick.index === 2,
      )?.label,
    ).toBe("2");
  }
  expect(row(F.CHAR).nTick4).toBe(743);
});

it("retains the original multiplier growth for wide actual labels", /** Exercises native density divisor ranges. @returns Nothing. */ () => {
  for (const width of [60, 500, 5000]) {
    const ticks = projectWriterRulerTicks(row(F.MM), 14400, 1440, width);
    expect(
      ticks.every(
        /** Labels use a selected major cadence. @param tick - Tick projection. @returns Whether a label. */ (
          tick,
        ) => tick.label !== "",
      ),
    ).toBe(true);
  }
});

it("projects source small strokes where their map-unit gap exceeds six pixels", /** Checks the metre table fine cadence. @returns Nothing. */ () => {
  const ticks = projectWriterRulerTicks(row(F.M), 60000, 1440, 8);
  expect(
    ticks.find(
      /** First metre fine division. @param tick - Tick projection. @returns Whether first. */ (
        tick,
      ) => tick.index === 1,
    )?.length,
  ).toBe(4);
  expect(
    ticks.find(
      /** Midpoint stroke. @param tick - Tick projection. @returns Whether middle. */ (tick) =>
        tick.index === 50,
    )?.length,
  ).toBe(12);
});
