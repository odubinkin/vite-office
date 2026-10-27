/** @fileoverview Replays unchanged native map-name bodies over all shipped font names and ordered heuristic triggers. */
import { expect, it } from "vitest";
import native from "./font-map-name.native.json";
import { FontSubstConfiguration, ImplFontAttrs } from "../../inc/fontcfg";
import { FontWeight, FontWidth } from "../../../tools/inc/fontenum";

it("matches native ordered stripping, exceptions, inout enums and unsigned type bits", /** Verifies matches native ordered stripping, exceptions, inout enums and unsigned type bits. @returns Nothing. */ () => {
  for (const entry of native.cases) {
    const shortName: [string] = ["previous"],
      familyName: [string] = ["previous"],
      weight: [FontWeight] = [entry.weight],
      width: [FontWidth] = [entry.width],
      type: [ImplFontAttrs] = [ImplFontAttrs.OtherStyle];
    FontSubstConfiguration.getMapName(
      native.names[entry.name] as string,
      shortName,
      familyName,
      weight,
      width,
      type,
    );
    expect(
      {
        shortName: Array.from(
          { length: shortName[0].length },
          /** Verifies matches native ordered stripping, exceptions, inout enums and unsigned type bits. @param _ - _ value. @param i - i value. @returns Callback result. */ (
            _,
            i,
          ) => shortName[0].charCodeAt(i),
        ),
        familyName: Array.from(
          { length: familyName[0].length },
          /** Verifies matches native ordered stripping, exceptions, inout enums and unsigned type bits. @param _ - _ value. @param i - i value. @returns Callback result. */ (
            _,
            i,
          ) => familyName[0].charCodeAt(i),
        ),
        resultWeight: weight[0],
        resultWidth: width[0],
        type: type[0],
      },
      `case ${entry.name}/${entry.weight}/${entry.width}`,
    ).toEqual({
      shortName: entry.shortName,
      familyName: entry.familyName,
      resultWeight: entry.resultWeight,
      resultWidth: entry.resultWidth,
      type: entry.type,
    });
  }
});
it("loads all original configured attribute fields without applying them as font-name heuristics", /** Verifies loads all original configured attribute fields without applying them as font-name heuristics. @returns Nothing. */ () => {
  const record = FontSubstConfiguration.get().getSubstInfo("LIBERATIONSANS");
  expect(record).toMatchObject({
    Name: "liberationsans",
    MSSubstitutions: ["Arial"],
    Weight: FontWeight.WEIGHT_NORMAL,
    Width: FontWidth.WIDTH_NORMAL,
    Type:
      ImplFontAttrs.Default |
      ImplFontAttrs.Standard |
      ImplFontAttrs.Normal |
      ImplFontAttrs.SansSerif,
  });
  expect(record?.Substitutions.slice(0, 3)).toEqual(["albanyamt", "albany", "arial"]);
});
