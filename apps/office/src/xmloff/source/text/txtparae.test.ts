/** @fileoverview Verifies ODF list geometry defaults during XML serialization. */

import { describe, expect, it } from "vitest";

import { exportListLevelLayout } from "../style/xmlnume";
import { exportTextParagraphs } from "./txtparae";

describe("ODF list label alignment export", /** Groups ODF list label alignment export. @returns Test callback result. */ () => {
  it("rejects a partial numeric suffix table", /** Verifies export input validation. @returns Nothing. */ () => {
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
                  formats: Array(10).fill("numbered") as "numbered"[],
                  suffixes: [],
                },
              },
              runs: [
                { text: "item", properties: { bold: false, italic: false, underline: false } },
              ],
              style: "default" as const,
            };
          },
        }),
    ).toThrow("ODF list rule must define ten Writer suffixes.");
  });
  it("retains the alignment mode and omits zero or unused measures", /** Checks retains the alignment mode and omits zero or unused measures. @returns Test callback result. */ () => {
    expect(exportListLevelLayout(undefined)).toBe("");
    expect(exportListLevelLayout({})).toContain('text:label-followed-by="listtab"');
    const xml = exportListLevelLayout({ labelFollowedBy: "space" });
    expect(xml).toContain('text:label-followed-by="space"');
    expect(xml).not.toContain("fo:text-indent");
    expect(xml).not.toContain("fo:margin-left");
    expect(xml).not.toContain("text:list-tab-stop-position");
    expect(exportListLevelLayout({ listTabPosition: 900 })).toContain(
      'text:label-followed-by="listtab"',
    );
  });
});
