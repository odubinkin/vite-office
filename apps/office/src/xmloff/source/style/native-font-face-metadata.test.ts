/** @fileoverview Actual font-face context carries the caller-selected native default encoding and original adornment/pitch/symbol overrides through real SAX attribute ownership. */
import { expect, it } from "vitest";
import { XMLFontStylesContext, type OdfFontFaceMetadata } from "./XMLFontStylesContext";
import { FastAttributeList } from "../core/xmlimp";
import { ODF_NAMESPACES, XMLToken } from "../core/xmltoken";
import { FontPitch } from "../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_MS_1252, RTL_TEXTENCODING_SYMBOL } from "../../../sal/inc/rtl/textenc";
it("retains configured default charset unless the original x-symbol import overrides it", /** Actual consumer records callbacks; it supplies no alternate parser, font or type provider. @returns Nothing. */ () => {
  const records: {
      name: string;
      family: string;
      generic: string | undefined;
      metadata: OdfFontFaceMetadata | undefined;
    }[] = [],
    context = new XMLFontStylesContext(
      {
        /** Records actual imported fields. @param name - Face alias. @param family - Family name. @param generic - Generic family. @param metadata - Full font metadata. @returns Nothing. */
        registerFontFace(name, family, generic, metadata) {
          records.push({ name, family, generic, metadata });
        },
        /** No resource elements are present in this declaration test. @returns Nothing. */
        registerEmbeddedFont() {},
      },
      RTL_TEXTENCODING_MS_1252,
    );
  for (const extra of [
    [],
    [
      ["font-adornments", "Bold"],
      ["font-pitch", "variable"],
      ["font-charset", "unsupported"],
    ],
    [
      ["font-pitch", "fixed"],
      ["font-charset", "x-symbol"],
    ],
  ] as const) {
    const attributes = new FastAttributeList([
      {
        uri: ODF_NAMESPACES.style,
        local: "name",
        name: "style:name",
        prefix: "style",
        value: "Face",
      },
      ...extra.map(
        /** Uses real style namespace attributes. @param entry - Attribute pair. @returns SAX attribute record. */ ([
          local,
          value,
        ]) => ({
          uri: ODF_NAMESPACES.style,
          local,
          name: "style:" + local,
          prefix: "style",
          value,
        }),
      ),
    ]);
    context.createFastChildContext(XMLToken.STYLE_FONT_FACE, attributes);
  }
  expect(
    records.map(
      /** Reads the actual consumer handoff. @param record - Imported declaration. @returns Full font metadata. */ ({
        metadata,
      }) => metadata,
    ),
  ).toEqual([
    { styleName: "", pitch: FontPitch.PITCH_DONTKNOW, charSet: RTL_TEXTENCODING_MS_1252 },
    { styleName: "Bold", pitch: FontPitch.PITCH_VARIABLE, charSet: RTL_TEXTENCODING_MS_1252 },
    { styleName: "", pitch: FontPitch.PITCH_FIXED, charSet: RTL_TEXTENCODING_SYMBOL },
  ]);
});
