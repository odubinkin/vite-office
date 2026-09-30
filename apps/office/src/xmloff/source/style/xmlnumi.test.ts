/** @fileoverview Verifies native MM100 list-alignment leaf defaults, bounds and failure retention. */
import { expect, it } from "vitest";
import { parseOdfXmlStream } from "../core/xmlimp";
import { XMLToken, ODF_NAMESPACES } from "../core/xmltoken";
import type { XMLListLevelImportProperties } from "../text/txtparai";
import { SvxXMLListLevelStyleLabelAlignmentAttrContext_Impl } from "./xmlnumi";

/** Parses one literal modern alignment leaf through the source-owned context. @param attributes - Literal XML attributes. @returns Imported native properties. */
function parse(attributes: string): XMLListLevelImportProperties | undefined {
  let result: XMLListLevelImportProperties | undefined;
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
                result = value;
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
