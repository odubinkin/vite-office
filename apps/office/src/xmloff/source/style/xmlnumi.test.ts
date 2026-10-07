/** @fileoverview Verifies native MM100 list-alignment leaf defaults, bounds and failure retention. */
import { expect, it, vi } from "vitest";
import { FastAttributeList, parseOdfXmlStream } from "../core/xmlimp";
import { XMLToken, ODF_NAMESPACES } from "../core/xmltoken";
import type { XMLListLevelImportProperties } from "../text/txtparai";
import {
  SvxXMLListLevelStyleLabelAlignmentAttrContext_Impl,
  SvxXMLListLevelStyleContext_Impl,
  SvxXMLListStyleContext,
} from "./xmlnumi";

/** Parses one literal modern alignment leaf through the source-owned context. @param attributes - Literal XML attributes. @returns Imported native properties. */
function parse(attributes: string): XMLListLevelImportProperties | undefined {
  let result: XMLListLevelImportProperties | undefined = {
    measureUnit: "mm100",
    values: { firstLineIndent: 0, indentAt: 0, labelFollowedBy: "listtab", listTabPosition: 0 },
  };
  parseOdfXmlStream(
    `<style:list-level-label-alignment xmlns:style="${ODF_NAMESPACES.style}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:fo="${ODF_NAMESPACES.fo}" ${attributes}/>`,
    {
      /** Constructs the modern leaf. @param token - Root token. @param values - Resolved source attributes. @returns Leaf or null. */
      createFastContext(token, values) {
        return token === XMLToken.STYLE_LIST_LEVEL_LABEL_ALIGNMENT
          ? new SvxXMLListLevelStyleLabelAlignmentAttrContext_Impl(
              values,
              /** Captures source-native properties. @param value - Parsed properties. @returns Nothing. */
              (value) => {
                result = { measureUnit: "mm100", values: { ...result?.values, ...value.values } };
              },
            )
          : null;
      },
      /** Rejects unknown roots. @returns Null. */
      createUnknownContext: () => null,
    },
  );
  return result;
}

it("retains zero defaults and native listtab fallback for absent or unknown follow values", /** Checks the source constructor rather than list-command geometry. @returns Nothing. */ () => {
  for (const attributes of ["", 'text:label-followed-by=""', 'text:label-followed-by="custom"'])
    expect(parse(attributes)).toEqual({
      measureUnit: "mm100",
      values: { firstLineIndent: 0, indentAt: 0, labelFollowedBy: "listtab", listTabPosition: 0 },
    });
  for (const follow of ["space", "nothing", "listtab"])
    expect(parse(`text:label-followed-by="${follow}"`)?.values.labelFollowedBy).toBe(follow);
});

it("uses native MM100 grammar, failed-value retention and SHRT field bounds", /** Asserts literal source-stage values independent of the Writer bridge. @returns Nothing. */ () => {
  for (const [value, signed, tab] of [
    ["0.007mm", 1, 1],
    ["-0.007mm", -1, 0],
    ["  .25CM ", 250, 250],
    ["1px", 26, 26],
    ["1pc", 423, 423],
    [".025pt", 1, 1],
    ["1cm extra", 1000, 1000],
    ["3", 3, 3],
    ["+1cm", 0, 0],
    ["invalid", 0, 0],
    ["1em", 0, 0],
    ["999999999cm", 32767, 32767],
    ["-999999999cm", -32768, 0],
  ] as const) {
    const result = parse(
      `fo:text-indent="${value}" fo:margin-left="${value}" text:list-tab-stop-position="${value}"`,
    );
    expect(result, value).toEqual({
      measureUnit: "mm100",
      values: {
        firstLineIndent: signed,
        indentAt: signed,
        labelFollowedBy: "listtab",
        listTabPosition: tab,
      },
    });
  }
});

it("retains declared-level numeric values across missing or failed child updates", /** Asserts native parent defaults, successful-only setters, ignored children and unsigned-to-short property narrowing. @returns Nothing. */ () => {
  for (const [distance, expected] of [
    ["32767", 32767],
    ["32768", -32768],
    ["65535", -1],
    ["999999cm", -1],
  ]) {
    let context: SvxXMLListLevelStyleContext_Impl | undefined;
    parseOdfXmlStream(
      `<text:list-level-style-number xmlns:style="${ODF_NAMESPACES.style}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:fo="${ODF_NAMESPACES.fo}"><text:p>ignored</text:p><style:list-level-properties text:space-before="1mm" text:min-label-width="2mm" text:min-label-distance="${distance}" text:list-level-position-and-space-mode="label-alignment"><text:p>ignored</text:p><style:list-level-label-alignment text:label-followed-by="space" fo:text-indent="-1mm" fo:margin-left="2mm" text:list-tab-stop-position="3mm"/></style:list-level-properties><style:list-level-properties text:space-before="invalid"><style:list-level-label-alignment fo:text-indent="invalid" fo:margin-left=".007mm"/></style:list-level-properties></text:list-level-style-number>`,
      {
        /** Creates the owning level context and retains its native identity. @param token - Root family. @param attributes - Declaration. @returns Context. */
        createFastContext: (token, attributes) => {
          context = new SvxXMLListLevelStyleContext_Impl(token, attributes);
          return context;
        },
        /** Rejects unknown roots. @returns Null. */
        createUnknownContext: () => null,
      },
    );
    expect(context?.GetProperties().position).toEqual({
      measureUnit: "mm100",
      values: {
        absLSpace: 300,
        firstLineOffset: -200,
        charTextDistance: expected,
        positionAndSpaceMode: "label-alignment",
        firstLineIndent: -100,
        indentAt: 1,
        labelFollowedBy: "listtab",
        listTabPosition: 300,
      },
    });
  }
});

it("retains native optional declaration defaults and byte-string integer indices", /** Asserts independent source-derived level/default contracts including overflow, prefix parsing and Unicode whitespace. @returns Nothing. */ () => {
  for (const [raw, level] of [
    [undefined, -1],
    ["", 0],
    [" \t", 0],
    ["invalid", 0],
    ["0", 0],
    ["-7", 0],
    ["1.5", 0],
    ["2junk", 1],
    ["+2", 1],
    [" 2", 1],
    ["\t3tail", 2],
    ["10", 9],
    ["11", 10],
    ["2147483647", 2147483646],
    ["2147483648", 0],
    ["-2147483648", 0],
    ["-2147483649", 0],
    ["9223372036854775807", 0],
    ["9223372036854775808", 0],
    ["\u20032", 0],
    ["\u00002", 0],
    ["0002", 1],
    ["1e2", 0],
  ] as const) {
    const attributes = new FastAttributeList(
      raw === undefined
        ? []
        : [{ name: "level", local: "level", prefix: "text", uri: ODF_NAMESPACES.text, value: raw }],
    );
    for (const token of [
      XMLToken.TEXT_LIST_LEVEL_STYLE_NUMBER,
      XMLToken.TEXT_LIST_LEVEL_STYLE_BULLET,
    ]) {
      const context = new SvxXMLListLevelStyleContext_Impl(token, attributes);
      expect(context.GetLevel(), String(raw)).toBe(level);
      expect(context.GetProperties().kind).toBe(
        token === XMLToken.TEXT_LIST_LEVEL_STYLE_NUMBER ? "numbered" : "bullet",
      );
      expect(context.GetProperties().suffix).toBe("");
      expect(context.GetProperties().bulletChar).toBe(
        token === XMLToken.TEXT_LIST_LEVEL_STYLE_NUMBER ? undefined : "\0",
      );
    }
  }
});

it("owns source-created leaf references and reads them only at list publication", /** Verifies class/source ownership, deferred GetProperties and stable declaration creation order. @returns Nothing. */ () => {
  const consumer = { registerListStyle: vi.fn() };
  const list = new SvxXMLListStyleContext(
    consumer,
    new FastAttributeList([
      { name: "name", prefix: "style", uri: ODF_NAMESPACES.style, local: "name", value: "Owned" },
      {
        name: "display-name",
        prefix: "style",
        uri: ODF_NAMESPACES.style,
        local: "display-name",
        value: "Display",
      },
    ]),
  );
  const fields = new FastAttributeList([
    { name: "level", prefix: "text", uri: ODF_NAMESPACES.text, local: "level", value: "1" },
  ]);
  const first = list.createFastChildContext(XMLToken.TEXT_LIST_LEVEL_STYLE_NUMBER, fields);
  const second = list.createFastChildContext(XMLToken.TEXT_LIST_LEVEL_STYLE_BULLET, fields);
  expect(first).toBeInstanceOf(SvxXMLListLevelStyleContext_Impl);
  expect(second).toBeInstanceOf(SvxXMLListLevelStyleContext_Impl);
  first?.createFastChildContext(
    XMLToken.STYLE_TEXT_PROPERTIES,
    new FastAttributeList([
      {
        name: "space-before",
        prefix: "text",
        uri: ODF_NAMESPACES.text,
        local: "space-before",
        value: "1mm",
      },
    ]),
  );
  second?.endFastElement(XMLToken.TEXT_LIST_LEVEL_STYLE_BULLET);
  first?.endFastElement(XMLToken.TEXT_LIST_LEVEL_STYLE_NUMBER);
  expect(consumer.registerListStyle).not.toHaveBeenCalled();
  list.endFastElement();
  expect(consumer.registerListStyle).toHaveBeenCalledWith("Owned", {
    name: "Display",
    levelCount: 10,
    levels: [
      {
        level: 0,
        kind: "numbered",
        numberingType: 4,
        prefix: "",
        suffix: "",
        startWith: 1,
        parentNumbering: 1,
        listFormat: "%1%",
        position: {
          measureUnit: "mm100",
          values: {
            positionAndSpaceMode: "label-width-and-position",
            firstLineIndent: 0,
            indentAt: 0,
            labelFollowedBy: "listtab",
            listTabPosition: 0,
            absLSpace: 100,
            firstLineOffset: 0,
            charTextDistance: 0,
          },
        },
      },
      {
        level: 0,
        kind: "bullet",
        numberingType: 6,
        bulletChar: "\0",
        bulletFont: { name: "" },
        prefix: "",
        suffix: "",
        listFormat: "%1%",
        position: {
          measureUnit: "mm100",
          values: {
            positionAndSpaceMode: "label-width-and-position",
            firstLineIndent: 0,
            indentAt: 0,
            labelFollowedBy: "listtab",
            listTabPosition: 0,
            absLSpace: 0,
            firstLineOffset: 0,
            charTextDistance: 0,
          },
        },
      },
    ],
  });
});
