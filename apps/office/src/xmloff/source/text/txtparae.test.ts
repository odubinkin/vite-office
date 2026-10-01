/** @fileoverview Verifies ODF list geometry defaults during XML serialization. */

import { describe, expect, it } from "vitest";

import { exportListLevelLayout, SvxXMLNumRuleExport } from "../style/xmlnume";
import { exportTextParagraphs, escapeXml } from "./txtparae";

describe("ODF list label alignment export", /** Groups ODF list label alignment export. @returns Test callback result. */ () => {
  it("uses native empty suffix for an absent per-level property", /** Verifies native missing-property defaults without parallel-array fallbacks. @returns Nothing. */ () => {
    expect(
      /** Exports invalid list metadata. @returns Serialized ODF or error. */ () =>
        exportTextParagraphs({
          /** Produces a malformed list for contract validation. @returns One paragraph. */
          *paragraphs() {
            yield {
              list: {
                level: 0,
                listId: "list",
                rule: {
                  name: "Numbers",
                  levels: Array.from(
                    { length: 10 },
                    /** Supplies a native level with absent affixes. @returns Level properties. */ () => ({
                      kind: "numbered" as const,
                    }),
                  ),
                },
              },
              runs: [
                { text: "item", properties: { bold: false, italic: false, underline: false } },
              ],
              style: "default" as const,
            };
          },
        }),
    ).not.toThrow();
    const empty = new SvxXMLNumRuleExport(escapeXml).exportLevelStyle(0, { kind: "numbered" });
    expect(empty).toContain('style:num-format="1"');
    expect(empty).not.toContain("num-suffix");
    expect(empty).not.toContain("start-value");
  });
  it("retains the alignment mode and omits zero or unused measures", /** Checks retains the alignment mode and omits zero or unused measures. @returns Test callback result. */ () => {
    expect(exportListLevelLayout(undefined)).toBe("");
    expect(exportListLevelLayout({ positionAndSpaceMode: "label-alignment" })).toContain(
      'text:label-followed-by="listtab"',
    );
    const xml = exportListLevelLayout({
      positionAndSpaceMode: "label-alignment",
      labelFollowedBy: "space",
    });
    expect(xml).toContain('text:label-followed-by="space"');
    expect(xml).not.toContain("fo:text-indent");
    expect(xml).not.toContain("fo:margin-left");
    expect(xml).not.toContain("text:list-tab-stop-position");
    expect(
      exportListLevelLayout({ positionAndSpaceMode: "label-alignment", listTabPosition: 900 }),
    ).toContain('text:label-followed-by="listtab"');
  });
});
