/** @fileoverview Native lexical font-list and style-member property cases. */
import { expect, it } from "vitest";
import { FastAttributeList } from "../core/xmlimp";
import { ODF_NAMESPACES as NS } from "../core/xmltoken";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_SYMBOL,
  RTL_TEXTENCODING_UTF8,
} from "../../../sal/inc/rtl/textenc";
import { FontFamily, FontPitch } from "../../../tools/inc/fontenum";
import { exportFamilyName, importFamilyName } from "../style/fonthdl";
import { importTextFont, textFontProperties } from "./txtimppr";

/** Builds the relevant original XML attributes in source order. @param entries - Lexical entries. @returns SAX attributes. */
function attrs(entries: readonly (readonly ["fo" | "style", string, string])[]): FastAttributeList {
  return new FastAttributeList(
    entries.map(
      /** Resolves one XML property. @param entry - Prefix, local name and value. @returns SAX-bound attribute. */
      ([prefix, local, value]) => ({
        prefix,
        local,
        value,
        uri: NS[prefix],
        name: `${prefix}:${local}`,
      }),
    ),
  );
}

it("ports the original quote-aware comma scan and ASCII-space trimming", /** Exercises quoted commas, empty entries and tabs. @returns Nothing. */ () => {
  expect(importFamilyName(`'A, One', "B, Two", , Three , ""`)).toBe("A, One;B, Two;Three");
  expect(importFamilyName("A'unclosed, B")).toBe("A'unclosed, B");
  expect(importFamilyName("\tTabbed\t;Family")).toBe("\tTabbed\t;Family");
  expect(exportFamilyName(" A, One ; Two ;\tTabbed\t")).toBe("'A, One', Two, \tTabbed\t");
});

it("finishes full font members in SAX order with the source defaults", /** Checks declaration and inline precedence and invalid charset handling. @returns Nothing. */ () => {
  const declared = {
    familyName: "Declared",
    styleName: "Book",
    family: FontFamily.FAMILY_ROMAN,
    pitch: FontPitch.PITCH_FIXED,
    charSet: RTL_TEXTENCODING_SYMBOL,
  };
  const resolve =
    /** Supplies the declared font. @param name - Face name. @returns Declared members. */ (
      name: string,
    ) => (name === "Known" ? declared : undefined);
  expect(
    importTextFont(
      attrs([
        ["style", "font-name", "Known"],
        ["fo", "font-family", "Inline"],
        ["style", "font-pitch", "variable"],
      ]),
      textFontProperties[0],
      resolve,
      RTL_TEXTENCODING_UTF8,
    ),
  ).toEqual({
    ...declared,
    familyName: "Inline",
    pitch: FontPitch.PITCH_VARIABLE,
  });
  expect(
    importTextFont(
      attrs([
        ["fo", "font-family", "Inline"],
        ["style", "font-name", "Known"],
      ]),
      textFontProperties[0],
      resolve,
      RTL_TEXTENCODING_UTF8,
    ),
  ).toEqual(declared);
  expect(
    importTextFont(
      attrs([
        ["style", "font-name", "Missing"],
        ["fo", "font-family", "Inline"],
        ["style", "font-charset", "unsupported"],
      ]),
      textFontProperties[0],
      resolve,
      RTL_TEXTENCODING_UTF8,
    ),
  ).toEqual({
    familyName: "Inline",
    styleName: "",
    family: FontFamily.FAMILY_DONTKNOW,
    pitch: FontPitch.PITCH_DONTKNOW,
    charSet: RTL_TEXTENCODING_DONTKNOW,
  });
  expect(
    importTextFont(
      attrs([["style", "font-pitch", "fixed"]]),
      textFontProperties[0],
      resolve,
      RTL_TEXTENCODING_UTF8,
    ),
  ).toBeUndefined();
});
