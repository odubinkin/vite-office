/** @fileoverview Pins native interval parsing/narrowing/property admission and real source default projection. */
import { expect, it } from "vitest";
import { FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import {
  XMLLineNumberingImportContext,
  type OdfLineNumberingConfiguration,
} from "./XMLLineNumberingImportContext";
it("retains source signed16 intervals until the Writer property admission", /** Keeps missing or invalid XML distinct from an explicitly parsed zero. @returns Nothing. */ () => {
  for (const [raw, count] of [
    ["0", 0],
    ["32767", 32767],
    ["32768", -32768],
    ["65535", -1],
    ["65536", 0],
    ["65537", 1],
    ["2147483648", -1],
    ["-1", 0],
    ["", 0],
    [" 7", 7],
    ["7 ", undefined],
    ["+7", undefined],
    ["7.5", undefined],
    ["invalid", undefined],
  ] as const) {
    let result: OdfLineNumberingConfiguration | undefined;
    const attributes = new FastAttributeList([
      {
        uri: "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
        prefix: "text",
        local: "increment",
        name: "text:increment",
        value: raw,
      },
    ]);
    const context = new XMLLineNumberingImportContext(
      attributes,
      /** Receives actual imported configuration. @param value - Configuration. @returns Nothing. */ (
        value,
      ) => {
        result = value;
      },
    );
    const separator = context.createFastChildContext(
      XMLToken.TEXT_LINENUMBERING_SEPARATOR,
      attributes,
    );
    if (separator === null) throw Error("Missing separator context");
    separator.characters("*");
    separator.endFastElement(XMLToken.TEXT_LINENUMBERING_SEPARATOR);
    context.endFastElement();
    expect(result?.countBy).toBe(count);
    expect(result?.dividerCountBy).toBe(count);
    expect(result?.divider).toBe("*");
  }
});
