/** @fileoverview Verifies ODF list geometry defaults during XML serialization. */

import { describe, expect, it } from "vitest";

import { exportListLevelLayout } from "./txtparae";

describe("ODF list label alignment export", /** Groups ODF list label alignment export. @returns Test callback result. */ () => {
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
