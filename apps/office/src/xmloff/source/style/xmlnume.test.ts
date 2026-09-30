/** @fileoverview Verifies native ODF 1.3 mode and label-alignment attribute predicates. */
import { expect, it } from "vitest";
import { exportListLevelLayout } from "./xmlnume";

it("emits label-alignment mode even for zero or default command geometry", /** Verifies native mode/version ownership and absence of command-geometry suppression. @returns Nothing. */ () => {
  expect(exportListLevelLayout(undefined)).toBe("");
  expect(exportListLevelLayout({ positionAndSpaceMode: "label-alignment" })).toBe(
    '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment"><style:list-level-label-alignment text:label-followed-by="listtab"/></style:list-level-properties>',
  );
  expect(
    exportListLevelLayout({
      positionAndSpaceMode: "label-alignment",
      firstLineIndent: -635,
      indentAt: 1270,
      listTabPosition: 1270,
    }),
  ).toBe(
    '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment"><style:list-level-label-alignment text:label-followed-by="listtab" text:list-tab-stop-position="1.27cm" fo:text-indent="-0.635cm" fo:margin-left="1.27cm"/></style:list-level-properties>',
  );
});

it("omits zero indents and tab attributes unless the separator is listtab with a positive position", /** Verifies the source predicates on signed and unused native properties. @returns Nothing. */ () => {
  for (const follow of ["space", "nothing", "listtab"] as const) {
    for (const position of [-1, 0, 1]) {
      const xml = exportListLevelLayout({
        positionAndSpaceMode: "label-alignment",
        firstLineIndent: 0,
        indentAt: 0,
        labelFollowedBy: follow,
        listTabPosition: position,
      });
      expect(xml).toContain(`text:label-followed-by="${follow}"`);
      expect(xml.includes("text:list-tab-stop-position")).toBe(
        follow === "listtab" && position > 0,
      );
      expect(xml).not.toContain("fo:text-indent");
      expect(xml).not.toContain("fo:margin-left");
    }
  }
  const signed = exportListLevelLayout({
    positionAndSpaceMode: "label-alignment",
    firstLineIndent: 1,
    indentAt: -1008,
    listTabPosition: 0,
  });
  expect(signed).toContain('fo:text-indent="0.001cm"');
  expect(signed).toContain('fo:margin-left="-1.008cm"');
});

it("exports only the native legacy group with nonzero and positive attribute predicates", /** Asserts native absent mode and legacy signs independently from alignment fields. @returns Nothing. */ () => {
  expect(exportListLevelLayout({})).toBe(
    "<style:list-level-properties></style:list-level-properties>",
  );
  for (const distance of [-1, 0, 254]) {
    const xml = exportListLevelLayout({
      positionAndSpaceMode: "label-width-and-position",
      absLSpace: 1270,
      firstLineOffset: -508,
      charTextDistance: distance,
      firstLineIndent: -635,
      indentAt: 2032,
      labelFollowedBy: "space",
      listTabPosition: 2286,
    });
    expect(xml).toContain('text:space-before="0.762cm"');
    expect(xml).toContain('text:min-label-width="0.508cm"');
    expect(xml.includes("text:min-label-distance")).toBe(distance > 0);
    expect(xml).not.toContain("label-alignment");
    expect(xml).not.toContain("list-tab-stop-position");
  }
  expect(exportListLevelLayout({ absLSpace: -49, firstLineOffset: -49 })).toContain(
    'text:space-before="-0.098cm"',
  );
  expect(exportListLevelLayout({ absLSpace: 0 })).not.toContain("text:space-before");
  expect(exportListLevelLayout({ firstLineOffset: 0 })).not.toContain("text:min-label-width");
});
