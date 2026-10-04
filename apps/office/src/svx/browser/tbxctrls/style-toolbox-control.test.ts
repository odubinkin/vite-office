/** @fileoverview Checks independent native style population switches, ordering and name identity. */
import { describe, expect, it } from "vitest";
import { DEFAULT_STYLE_TOOLBOX_SETTINGS, populateStyleToolbox } from "./style-toolbox-control";

describe("native style toolbox population", /** Defines population contracts. @returns Nothing. */ () => {
  it("defaults all four configuration switches to true and preserves pool order", /** Checks literal native defaults and precedence. @returns Nothing. */ () => {
    expect(DEFAULT_STYLE_TOOLBOX_SETTINGS).toEqual({
      ShowDefaultStyles: true,
      ShowUsedStyles: true,
      ShowFavouriteStyles: true,
      ShowUserDefinedStyles: true,
    });
    const output = populateStyleToolbox({
      defaults: [{ id: "default", name: "Standard" }],
      used: [
        { id: "z", name: "Zulu" },
        { id: "alias", name: "Standard" },
      ],
      favourites: [
        { id: "a", name: "Alpha" },
        { id: "same", name: "Zulu" },
      ],
      userDefined: [
        { id: "custom", name: "Owned: & <字>" },
        { id: "case", name: "alpha" },
      ],
    });
    expect(output).toEqual([
      { id: "default", name: "Standard" },
      { id: "z", name: "Zulu" },
      { id: "a", name: "Alpha" },
      { id: "custom", name: "Owned: & <字>" },
      { id: "case", name: "alpha" },
    ]);
  });
  for (let mask = 0; mask < 16; mask++) {
    it(`honours independently disabled configuration mask ${mask}`, /** Checks the sixteen native switch combinations. @returns Nothing. */ () => {
      const output = populateStyleToolbox(
        {
          defaults: [{ id: "d", name: "Default" }],
          used: [{ id: "u", name: "Used" }],
          favourites: [{ id: "f", name: "Favourite" }],
          userDefined: [{ id: "c", name: "Custom" }],
        },
        {
          ShowDefaultStyles: Boolean(mask & 1),
          ShowUsedStyles: Boolean(mask & 2),
          ShowFavouriteStyles: Boolean(mask & 4),
          ShowUserDefinedStyles: Boolean(mask & 8),
        },
      );
      expect(
        output.map(
          /** Reads output names. @param entry - Entry. @returns Name. */ (entry) => entry.name,
        ),
      ).toEqual([
        ...(mask & 1 ? ["Default"] : []),
        ...(mask & 2 ? ["Used"] : []),
        ...(mask & 4 ? ["Favourite"] : []),
        ...(mask & 8 ? ["Custom"] : []),
      ]);
    });
  }
  it("detaches and freezes source entries without changing their order", /** Checks mutable caller ownership. @returns Nothing. */ () => {
    const input = { id: "a", name: "Owned", resourceId: "resource" };
    const output = populateStyleToolbox({
      defaults: [],
      used: [input],
      favourites: [],
      userDefined: [],
    });
    input.name = "Renamed";
    expect(output).toEqual([{ id: "a", name: "Owned", resourceId: "resource" }]);
    expect(output[0]).not.toBe(input);
    expect(Object.isFrozen(output)).toBe(true);
    expect(Object.isFrozen(output[0])).toBe(true);
  });
});
