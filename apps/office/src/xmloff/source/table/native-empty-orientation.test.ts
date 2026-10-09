/** @fileoverview Verifies XML style contexts distinguish absent vertical orientation, authored NONE and mapped tokens. */
import { expect, it, vi } from "vitest";
import { FastAttributeList } from "../core/xmlimp";
import { ODF_NAMESPACES, XMLToken } from "../core/xmltoken";
import { XMLTableStyleContext } from "./XMLTableImport";
/** Creates resolved style attributes for a native property context. @param values - Local attributes. @param uri - Native namespace. @returns Tokenized attributes. */
function attributes(
  values: Record<string, string>,
  uri: string = ODF_NAMESPACES.style,
): FastAttributeList {
  return new FastAttributeList(
    Object.entries(values).map(
      /** Resolves a SAX attribute. @param entry - Native name/value. @returns Resolved attribute. */ ([
        local,
        value,
      ]) => ({ local, value, uri, name: local, prefix: "" }),
    ),
  );
}
it.each([undefined, "", "top", "middle", "bottom"])(
  "native cell style publishes distinct orientation%s",
  /** Verifies ordinary context publication retains authored empty state. @param value - XML token or absent. @returns Nothing. */ (
    value,
  ) => {
    const registerTableStyle = vi.fn(),
      context = new XMLTableStyleContext(
        { registerTableStyle },
        attributes({ name: "NativeCell", family: "table-cell" }),
      );
    context.createFastChildContext(
      XMLToken.STYLE_TABLE_CELL_PROPERTIES,
      attributes(value === undefined ? {} : { "vertical-align": value }),
    );
    context.endFastElement();
    expect(registerTableStyle).toHaveBeenCalledTimes(1);
    expect(registerTableStyle.mock.calls[0]?.[0]).toBe("NativeCell");
    expect(registerTableStyle.mock.calls[0]?.[1].verticalAlign).toBe(value);
  },
);
it.each([undefined, ""])(
  "empty table enum has no parsed authored alignment%s",
  /** Checks failed native enum admission remains unset at the style boundary. @param value - Empty or absent. @returns Nothing. */ (
    value,
  ) => {
    const registerTableStyle = vi.fn(),
      context = new XMLTableStyleContext(
        { registerTableStyle },
        attributes({ name: "NativeTable", family: "table" }),
      );
    context.createFastChildContext(
      XMLToken.STYLE_TABLE_PROPERTIES,
      attributes(value === undefined ? {} : { align: value }, ODF_NAMESPACES.table),
    );
    context.endFastElement();
    expect(registerTableStyle.mock.calls[0]?.[1].align).toBeUndefined();
  },
);
