/** @fileoverview Verifies ODF list geometry defaults during XML serialization. */

import { describe, expect, it } from "vitest";

import { exportListLevelLayout, exportTextParagraphs } from "./txtparae";

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
  it("omits standard geometry and fills omitted values on partial custom layouts", /** Checks omits standard geometry and fills omitted values on partial custom layouts. @returns Test callback result. */ () => {
    expect(exportListLevelLayout(undefined, 0)).toBe("");
    expect(exportListLevelLayout({}, 0)).toBe("");
    const xml = exportListLevelLayout({ labelFollowedBy: "space" }, 0);
    expect(xml).toContain('text:label-followed-by="space"');
    expect(xml).toContain('fo:text-indent="-0.635cm"');
    expect(xml).toContain('fo:margin-left="1.27cm"');
    expect(xml).toContain('text:list-tab-stop-position="1.27cm"');
    expect(exportListLevelLayout({ listTabPosition: 900 }, 1)).toContain(
      'text:label-followed-by="listtab"',
    );
  });
});
