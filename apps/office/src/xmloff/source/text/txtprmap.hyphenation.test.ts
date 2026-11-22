/** @fileoverview The original paragraph hyphenation attribute groups and numeric handlers. */
import { expect, it } from "vitest";
import { FastAttributeList } from "../core/xmlimp";
import { ODF_NAMESPACES as NS } from "../core/xmltoken";
import { exportHyphenationProperties, importHyphenationProperties } from "./txtprmap.hyphenation";

it("imports both original property groups and suppresses zero leading limits on export", /** Checks the pinned number-no-zero, number-none and keep value conversions. @returns Nothing. */ () => {
  const attrs = new FastAttributeList(
    (
      [
        ["fo", "hyphenate", "false"],
        ["fo", "hyphenation-remain-char-count", "0"],
        ["fo", "hyphenation-push-char-count", "40000"],
        ["fo", "hyphenation-ladder-count", "no-limit"],
        ["fo", "hyphenation-keep", "page"],
        ["loext", "hyphenation-zone", "-3"],
        ["loext", "hyphenation-keep-type", "spread"],
        ["loext", "hyphenation-keep-line", "no"],
      ] as const
    ).map(
      /** Resolves known attributes into their source namespaces. @param row - XML triple. @returns SAX attribute. */
      ([prefix, local, value]) => ({
        prefix,
        local,
        value,
        name: `${prefix}:${local}`,
        uri: NS[prefix],
      }),
    ),
  );
  const text = importHyphenationProperties(attrs, "text");
  const paragraph = importHyphenationProperties(attrs, "paragraph");
  expect(text).toEqual({
    ParaIsHyphenation: false,
    ParaHyphenationMaxLeadingChars: 0,
    ParaHyphenationMaxTrailingChars: 32767,
    ParaHyphenationZone: -3,
  });
  expect(paragraph).toEqual({
    ParaHyphenationMaxHyphens: 0,
    ParaHyphenationKeep: true,
    ParaHyphenationKeepType: 1,
  });
  expect(exportHyphenationProperties(text, "text")).toEqual([
    'fo:hyphenate="false"',
    'fo:hyphenation-push-char-count="32767"',
    'loext:hyphenation-zone="-3"',
  ]);
  expect(exportHyphenationProperties(paragraph, "paragraph")).toEqual([
    'fo:hyphenation-ladder-count="no-limit"',
    'fo:hyphenation-keep="page"',
    'loext:hyphenation-keep-type="spread"',
  ]);
});
