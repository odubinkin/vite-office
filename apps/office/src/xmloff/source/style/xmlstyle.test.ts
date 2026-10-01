/** @fileoverview Verifies native per-container ownership of style leaf contexts and default publication. */

import { expect, it, vi } from "vitest";
import { FastAttributeList } from "../core/xmlimp";
import { ODF_NAMESPACES, XMLToken } from "../core/xmltoken";
import { XMLStylesContext, type XMLStyleImportTarget } from "./xmlstyle";

it("preserves native bounded outline attributes and leaves invalid or empty values unset", /** Verifies XMLTextStyleContext SetAttribute outline conversion and explicit empty list-style presence. @returns Nothing. */ () => {
  for (const [raw, level] of [
    ["0", 0],
    ["3", 3],
    [" +10 ", 10],
    ["", undefined],
    ["-1", undefined],
    ["11", undefined],
    ["2.5", undefined],
    ["bad", undefined],
  ] as const) {
    const named = new XMLStylesContext(target());
    named.createFastChildContext(
      XMLToken.STYLE_STYLE,
      attributes({
        name: "Heading",
        family: "paragraph",
        "default-outline-level": raw,
        "list-style-name": "",
      }),
    );
    expect(named.GetStyleDefinitions("paragraph").get("Heading")).toEqual({
      family: "paragraph",
      listStyleName: "",
      ...(level === undefined ? {} : { outlineLevel: level }),
    });
  }
});

/** Builds namespace-resolved source attributes. @param values - Local style attributes. @param namespace - Attribute namespace. @returns Tokenized attributes. */
function attributes(
  values: Record<string, string>,
  namespace: string = ODF_NAMESPACES.style,
): FastAttributeList {
  return new FastAttributeList(
    Object.entries(values).map(
      /** Constructs one SAX attribute. @param entry - Name/value pair. @returns Resolved attribute. */
      ([local, value]) => ({ local, value, uri: namespace, name: local, prefix: "" }),
    ),
  );
}

/** Creates only the model-facing consumers; style definitions remain in their context. @returns Writer consumer spies. */
function target(): XMLStyleImportTarget {
  return {
    registerTableStyle: vi.fn(),
    registerLineNumbering: vi.fn(),
    getFontFace: vi.fn(),
    registerListStyle: vi.fn(),
    registerDefaultStyle: vi.fn(),
    registerPageLayout: vi.fn(),
  };
}

it("retains the created leaf reference in its own family and container", /** Checks ownership before and after property parsing and independent containers. @returns Nothing. */ () => {
  const consumer = target();
  const named = new XMLStylesContext(consumer);
  const automatic = new XMLStylesContext(consumer, true);
  expect(named.IsAutoStyle()).toBe(false);
  expect(automatic.IsAutoStyle()).toBe(true);
  const leaf = named.createFastChildContext(
    XMLToken.STYLE_STYLE,
    attributes({ name: "Shared", family: "text" }),
  );
  expect(named.FindStyleChildContext("text", "Shared")).toBe(leaf);
  expect(named.FindStyleChildContext("paragraph", "Shared")).toBeUndefined();
  expect(automatic.FindStyleChildContext("text", "Shared")).toBeUndefined();
  leaf?.createFastChildContext(
    XMLToken.STYLE_TEXT_PROPERTIES,
    attributes({ "font-weight": "bold" }, ODF_NAMESPACES.fo),
  );
  leaf?.endFastElement(XMLToken.STYLE_STYLE);
  expect(named.FindStyleChildContext("text", "Shared")?.GetDefinition()).toEqual({
    family: "text",
    properties: { bold: true },
  });
  const paragraph = named.createFastChildContext(
    XMLToken.STYLE_STYLE,
    attributes({ name: "Shared", family: "paragraph" }),
  );
  expect(named.FindStyleChildContext("paragraph", "Shared")).toBe(paragraph);
  expect([...named.GetStyleDefinitions("paragraph")]).toEqual([
    ["Shared", { family: "paragraph" }],
  ]);
  const other = automatic.createFastChildContext(
    XMLToken.STYLE_STYLE,
    attributes({ name: "Shared", family: "text" }),
  );
  expect(automatic.FindStyleChildContext("text", "Shared")).toBe(other);
  expect(other).not.toBe(leaf);
  expect(new XMLStylesContext(consumer, true).GetStyleDefinitions("text").size).toBe(0);
  named.createFastChildContext(
    XMLToken.STYLE_STYLE,
    attributes({ name: "Ignored", family: "graphic" }),
  );
  expect(named.GetStyleDefinitions("text").size).toBe(1);
});

it("publishes paragraph defaults only from a common style container", /** Checks native common-versus-automatic default application. @returns Nothing. */ () => {
  const consumer = target();
  for (const automatic of [true, false]) {
    const context = new XMLStylesContext(consumer, automatic);
    const leaf = context.createFastChildContext(
      XMLToken.STYLE_DEFAULT_STYLE,
      attributes({ family: "paragraph" }),
    );
    leaf?.createFastChildContext(
      XMLToken.STYLE_TEXT_PROPERTIES,
      attributes({ "font-style": "italic" }, ODF_NAMESPACES.fo),
    );
    leaf?.endFastElement(XMLToken.STYLE_DEFAULT_STYLE);
    expect(context.GetStyleDefinitions("paragraph").size).toBe(0);
    expect(consumer.registerDefaultStyle).toHaveBeenCalledTimes(automatic ? 0 : 1);
  }
  expect(consumer.registerDefaultStyle).toHaveBeenCalledWith({
    family: "paragraph",
    properties: { italic: true },
  });
});
