/** @fileoverview Pins native interval parsing/narrowing/property admission and real source default projection. */
import { expect, it } from "vitest";
import { FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import {
  XMLLineNumberingImportContext,
  type OdfLineNumberingConfiguration,
} from "./XMLLineNumberingImportContext";
it("retains source signed16 narrowing and distinct main/separator zero admission", /** Native invalid strings are ignored rather than rejecting the document. @returns Nothing. */ () => {
  for (const [raw, count, divider] of [
    ["0", 5, 0],
    ["32767", 32767, 32767],
    ["32768", 5, 3],
    ["65535", 5, 3],
    ["65536", 5, 0],
    ["65537", 1, 1],
    ["2147483648", 5, 3],
    ["-1", 5, 0],
    ["", 5, 0],
    [" 7", 7, 7],
    ["7 ", 5, 3],
    ["+7", 5, 3],
    ["7.5", 5, 3],
    ["invalid", 5, 3],
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
    expect(result).toMatchObject({ countBy: count, dividerCountBy: divider, divider: "*" });
  }
});
