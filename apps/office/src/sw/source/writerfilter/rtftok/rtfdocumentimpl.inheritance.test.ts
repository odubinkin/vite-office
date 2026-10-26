/** @fileoverview RTF run inheritance distinguishes absent controls, explicit resets and inherited native values. */
import { expect, it } from "vitest";
import { FontLineStyle, FontStrikeout } from "../../../../tools/inc/fontenum";
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";
import { DEFAULT_CHARACTER, resolveRtfRunAttributes } from "./rtfdocumentimpl.context";

it("inherits every optional run attribute when no direct RTF control overrides it", /** Checks complete style transport without retaining unrelated run-local values. @returns Nothing. */ () => {
  const inherited: WriterCharacterAttributes = {
    bold: true,
    italic: true,
    underline: true,
    underlineStyle: FontLineStyle.LINESTYLE_DOUBLE,
    underlineColor: "#112233",
    underlineWordMode: true,
    fontFamily: "Inherited Font",
    fontSizeTwips: 480,
    color: "#abcdef",
    highlight: "#ffff00",
    strikeout: FontStrikeout.STRIKEOUT_DOUBLE,
    escapement: { offset: 33, height: 58 },
  };
  expect(
    resolveRtfRunAttributes(
      { text: "Text", attributes: DEFAULT_CHARACTER, controls: new Set() },
      inherited,
    ),
  ).toEqual(inherited);
});

it("uses native reset values when explicit controls have no optional payload", /** Checks automatic colors, transparent highlight, normal strike and baseline against an empty inherited run. @returns Nothing. */ () => {
  expect(
    resolveRtfRunAttributes(
      {
        text: "Reset",
        attributes: DEFAULT_CHARACTER,
        controls: new Set([
          "b",
          "i",
          "ul",
          "ulc",
          "f",
          "fs",
          "cf",
          "highlight",
          "strike",
          "nosupersub",
        ]),
      },
      DEFAULT_CHARACTER,
    ),
  ).toEqual({
    ...DEFAULT_CHARACTER,
    underlineStyle: undefined,
    underlineColor: "auto",
    color: "auto",
    highlight: "transparent",
    strikeout: FontStrikeout.STRIKEOUT_NONE,
    escapement: { offset: 0, height: 100 },
  });
});

it("gives explicit word underline mode priority over the inherited mode", /** Checks false as a real direct value rather than treating it as absence. @returns Nothing. */ () => {
  const resolved = resolveRtfRunAttributes(
    {
      text: "Word",
      attributes: { ...DEFAULT_CHARACTER, underlineWordMode: false },
      controls: new Set(),
    },
    { ...DEFAULT_CHARACTER, underlineWordMode: true },
  );
  expect(resolved.underlineWordMode).toBe(false);
});
