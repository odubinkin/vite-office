/** @fileoverview Native ODF diagonal shadows in their original UNO units. */
import { expect, it } from "vitest";
import { ShadowFormat } from "../../../offapi/com/sun/star/table/ShadowFormat";
import { ShadowLocation as Location } from "../../../offapi/com/sun/star/table/ShadowLocation";
import { XMLShadowPropHdl } from "./shadwhdl";

const handler = new XMLShadowPropHdl();

it.each([
  [Location.TOP_LEFT, "-0.2cm -0.2cm"],
  [Location.TOP_RIGHT, "0.2cm -0.2cm"],
  [Location.BOTTOM_LEFT, "-0.2cm 0.2cm"],
  [Location.BOTTOM_RIGHT, "0.2cm 0.2cm"],
] as const)(
  "round-trips the UNO shadow at location %s",
  /** Checks signed ODF offsets for each original direction. @param location - Native direction. @param offsets - Expected XML offsets. @returns Nothing. */ (
    location,
    offsets,
  ) => {
    const source = new ShadowFormat(location, 200, false, 0x123456);
    const xml = handler.exportXML(source);
    expect(xml).toBe(`#123456 ${offsets}`);
    expect(handler.importXML(xml)?.equals(source)).toBe(true);
  },
);

it("keeps the native offset average and optional color handling", /** Checks unsupported fields, original width defaults, and explicit none. @returns Nothing. */ () => {
  expect(handler.importXML("-2mm 4mm #123456")?.ShadowWidth).toBe(300);
  expect(handler.importXML("-2mm")?.ShadowWidth).toBe(100);
  expect(handler.importXML("1mm 1mm 2mm 2mm")?.ShadowWidth).toBe(200);
  expect(handler.importXML("#123456")?.Color).toBe(0x123456);
  expect(handler.importXML("2mm 1mm")?.Color).toBe(0);
  expect(handler.importXML("none")?.Location).toBe(Location.NONE);
  expect(handler.importXML("2mm nope")).toBeUndefined();
  expect(handler.importXML("#not-a-color 2mm 2mm")).toBeUndefined();
  expect(handler.importXML("100000000cm 100000000cm")).toBeUndefined();
  expect(handler.exportXML(new ShadowFormat())).toBe("none");
});
