/** @fileoverview Verifies browser-visible Writer list marker calculation at the `number.cxx`-derived document boundary. */

import { describe, expect, it } from "vitest";

import {
  getWriterParagraphListMarker,
  SwNumFormat,
  SwNumRule,
  type WriterNumberingParagraph,
} from "./number";
import { createWriterDocument } from "./doc";
import { applyWriterParagraphList, projectWriterParagraphList } from "./list";

/** Numbering fixture with a label that remains outside the production model. */
type NumberingFixture = WriterNumberingParagraph & { testId: string };

/** Provides a compact immutable list paragraph fixture for marker calculations. @param id - Stable paragraph identity. @param kind - List presentation. @param level - Zero-based list level. @param listId - Optional canonical list identity. @param listMarker - Precalculated projection marker. @returns Serializable numbering paragraph. */
function createParagraph(
  id: string,
  kind: NonNullable<WriterNumberingParagraph["list"]>["kind"],
  level = 0,
  listId?: string,
  listMarker?: string,
): NumberingFixture {
  return {
    ...(listId === undefined
      ? {}
      : {
          /** Returns the canonical list identity. @returns List identity. */
          GetListId: () => listId,
        }),
    testId: id,
    list: { kind, level },
    ...(listMarker === undefined ? {} : { listMarker }),
  };
}

/** Resolves a test fixture by its local label before invoking the object-identity API. @param paragraphs - Fixture sequence. @param id - Test-only label. @returns Projected marker. */
function getFixtureMarker(paragraphs: readonly NumberingFixture[], id: string): string | undefined {
  const paragraph = paragraphs.find(
    /** Matches a fixture label. @param candidate - Candidate paragraph. @returns Whether it matches. */
    (candidate) => candidate.testId === id,
  );
  return paragraph === undefined ? undefined : getWriterParagraphListMarker(paragraphs, paragraph);
}

describe("Writer numbering markers" /** Groups deterministic list marker calculations. @returns Nothing; Vitest registers enclosed cases. */, function defineWriterNumberTests(): void {
  it("renders bullets and contiguous ordered markers while resetting at nonmatching boundaries" /** Verifies marker semantics do not edit paragraph text. @returns Nothing; assertions cover every current list kind and sequence boundary. */, function calculatesMarkers(): void {
    const paragraphs = [
      createParagraph("none", "none"),
      createParagraph("bullet", "bullet"),
      createParagraph("first", "numbered", 0, undefined, "1."),
      createParagraph("second", "numbered", 0, undefined, "2."),
      createParagraph("nested", "numbered", 1, undefined, "1."),
      createParagraph("restart", "numbered", 0, "separate-list", "1."),
    ];
    expect(getFixtureMarker(paragraphs, "missing")).toBeUndefined();
    expect(getFixtureMarker(paragraphs, "none")).toBeUndefined();
    expect(getFixtureMarker(paragraphs, "bullet")).toBe("•");
    const circle = {
      /** Returns the circle-bullet numbering rule. @returns Canonical rule. */
      GetNumRule: () =>
        new SwNumRule(
          "circle",
          Array.from(
            { length: 10 },
            /** Creates one circle-bullet level. @returns Bullet format. */ () =>
              new SwNumFormat("bullet", "●"),
          ),
        ),
      testId: "circle",
      list: { kind: "bullet", level: 0 } as const,
    } satisfies NumberingFixture;
    expect(getWriterParagraphListMarker([circle], circle)).toBe("●");
    expect(getFixtureMarker(paragraphs, "first")).toBe("1.");
    expect(getFixtureMarker(paragraphs, "second")).toBe("2.");
    expect(getFixtureMarker(paragraphs, "nested")).toBe("1.");
    expect(getFixtureMarker(paragraphs, "restart")).toBe("1.");
    expect(getFixtureMarker([createParagraph("pending", "numbered")], "pending")).toBeUndefined();
    const canonical = {
      /** Returns the canonical list kind. @returns Numbered list kind. */
      GetListKind: () => "numbered" as const,
      /** Returns the canonical list level. @returns Root list level. */
      GetAttrListLevel: () => 0,
      /** Returns the document-owned list item number. @returns Current item number. */
      GetListItemNumber: () => 7,
    } satisfies WriterNumberingParagraph;
    expect(getWriterParagraphListMarker([canonical], canonical)).toBe("7.");
    const ordinary = {} satisfies WriterNumberingParagraph;
    expect(getWriterParagraphListMarker([ordinary], ordinary)).toBeUndefined();
  });

  it("continues a root number across nested items within the same canonical list" /** Verifies Writer list identity and level traversal. @returns Nothing. */, function continuesAcrossNestedItems(): void {
    const paragraphs = [
      createParagraph("root-1", "numbered", 0, "list-a", "1."),
      createParagraph("nested-bullet", "bullet", 1, "list-a"),
      createParagraph("nested-number", "numbered", 1, "list-a", "1."),
      createParagraph("root-2", "numbered", 0, "list-a", "2."),
      createParagraph("other-root", "numbered", 0, "list-b", "1."),
    ];
    expect(getFixtureMarker(paragraphs, "nested-number")).toBe("1.");
    expect(getFixtureMarker(paragraphs, "root-2")).toBe("2.");
    expect(getFixtureMarker(paragraphs, "other-root")).toBe("1.");
    const interrupted = [
      createParagraph("before", "numbered", 0, "same", "1."),
      createParagraph("ordinary", "none"),
      createParagraph("after", "numbered", 0, "same", "1."),
    ];
    expect(getFixtureMarker(interrupted, "after")).toBe("1.");
  });

  it("validates complete per-level rule snapshots" /** Covers current-schema invariants without compatibility fallbacks. @returns Nothing. */, function validatesRules(): void {
    expect(
      /** Rejects a runtime-invalid numbering kind. @returns Invalid format. */ () =>
        new SwNumFormat("none" as never),
    ).toThrow("must be bullet or numbered");
    expect(
      /** Constructs an incomplete rule. @returns Invalid rule. */ () =>
        new SwNumRule("short", [new SwNumFormat("bullet")]),
    ).toThrow("define every supported list level");
    const rule = new SwNumRule("levels", "numbered");
    for (const level of [-1, 0.5, 10])
      expect(
        /** Reads an invalid numbering level. @returns Invalid format. */ () =>
          rule.GetNumFormat(level),
      ).toThrow("outside 0-9");
    expect(
      /** Creates a multi-character bullet marker. @returns Invalid format. */ () =>
        new SwNumFormat("bullet", "ab"),
    ).toThrow("at most one Unicode code point");
    const bullet = new SwNumFormat("bullet", "●");
    expect(bullet.GetBulletChar()).toBe("●");
    expect(bullet.GetBulletFont()).toBe("OpenSymbol");
    expect(bullet.GetFirstLineIndent()).toBe(-360);
    expect(bullet.GetIndentAt()).toBe(720);
    expect(bullet.GetIncludeUpperLevels()).toBe(1);
    expect(bullet.GetLabelFollowedBy()).toBe("listtab");
    expect(bullet.GetListtabPos()).toBe(720);
    expect(bullet.GetNumberingType()).toBe("char-special");
    expect(bullet.GetPositionAndSpaceMode()).toBe("label-alignment");
    expect(bullet.GetPrefix()).toBe("");
    expect(bullet.GetStart()).toBe(1);
    expect(bullet.GetSuffix()).toBe("");
    expect(
      /** Creates an invalid negative list start. @returns Invalid format. */ () =>
        new SwNumFormat("numbered", "", { start: -1 }),
    ).toThrow("start value");
    const dots = new SwNumRule("dots", [
      bullet,
      ...Array.from(
        { length: 9 },
        /** Creates one default bullet level. @returns Bullet format. */ () =>
          new SwNumFormat("bullet"),
      ),
    ]);
    expect(dots.clone().GetNumFormat(0).GetBulletChar()).toBe("●");
    expect(dots.MakeNumString([], 0)).toBe("●");
    const multilevel = new SwNumRule(
      "multilevel",
      Array.from(
        { length: 10 },
        /** Creates one numbered level with its complete ancestor range. @param _unused - Array placeholder. @param level - Zero-based level. @returns Number format. */
        (_unused, level) =>
          new SwNumFormat("numbered", "", {
            includeUpperLevels: level + 1,
            prefix: "(",
            suffix: ")",
          }),
      ),
    );
    expect(multilevel.GetNumFormat(1).GetNumberingType()).toBe("arabic");
    expect(multilevel.MakeNumString([2, 3], 1)).toBe("(2.3)");
    expect(
      /** Formats a missing level. @returns Invalid marker. */ () =>
        multilevel.MakeNumString([2], 1),
    ).toThrow("does not contain");
    expect(
      /** Rejects an impossible upper-level count. @returns Invalid format. */ () =>
        new SwNumFormat("numbered", "", { includeUpperLevels: 11 }),
    ).toThrow("upper-level count");
  });

  it("uses the document-owned SwList counter tree for canonical text nodes", /** Verifies automatic-rule continuation and counter validation. @returns Nothing. */ () => {
    const document = createWriterDocument();
    const first = document.paragraphs[0];
    const nested = document.nodes.MakeTextNode();
    const second = document.nodes.MakeTextNode();
    if (first !== undefined) applyWriterParagraphList(first, { kind: "numbered", level: 0 });
    applyWriterParagraphList(nested, { kind: "numbered", level: 1 });
    applyWriterParagraphList(second, { kind: "numbered", level: 0 });
    expect(first?.GetNumRuleName()).toBe(nested.GetNumRuleName());
    expect(nested.GetNumRuleName()).toBe(second.GetNumRuleName());
    expect(first?.GetListId()).toBe(second.GetListId());
    expect(document.GetNumRuleTable()).toHaveLength(1);
    const manager = document.GetDocumentListsManager();
    const ruleName = first?.GetNumRuleName() as string;
    expect(manager.GetListForListStyle(ruleName).GetListId()).toBe(first?.GetListId());
    const additionalList = manager.CreateList(ruleName);
    expect(manager.CreateList(ruleName, additionalList.GetListId())).toBe(additionalList);
    manager.InvalidateAllLists();
    expect(
      /** Creates a list without a rule. @returns Nothing. */ () => manager.CreateList("missing"),
    ).toThrow("Unknown SwNumRule");
    expect(
      /** Resolves a style list without a rule. @returns Nothing. */ () =>
        manager.GetListForListStyle("missing"),
    ).toThrow("Unknown SwNumRule");
    expect(
      getWriterParagraphListMarker(document.paragraphs, first as WriterNumberingParagraph),
    ).toBe("1.");
    expect(getWriterParagraphListMarker(document.paragraphs, nested)).toBe("1.");
    expect(first?.GetListLabel()).toBe("1.");
    expect(nested.GetListLabel()).toBe("1.");
    expect(manager.GetListForListStyle(ruleName).GetListItemNumberVector(nested)).toEqual([1, 1]);
    const plain = document.nodes.MakeTextNode();
    expect(plain.GetListLabel()).toBeUndefined();
    applyWriterParagraphList(plain, { kind: "bullet", level: 0 });
    expect(plain.GetListLabel()).toBe("•");
    const unregistered = document.nodes.MakeTextNode();
    unregistered.SetNumRule(ruleName);
    unregistered.SetListId(first?.GetListId() as string);
    expect(unregistered.GetListLabel()).toBeUndefined();
    unregistered.SetListId("missing-list");
    expect(unregistered.GetListLabel()).toBeUndefined();
    expect(getWriterParagraphListMarker(document.paragraphs, second)).toBe("2.");
    expect(nested.GetActualListStartValue()).toBe(1);
    applyWriterParagraphList(nested, { kind: "numbered", level: 0 });
    expect(getWriterParagraphListMarker(document.paragraphs, second)).toBe("3.");
    applyWriterParagraphList(second, { kind: "numbered", level: 0, restart: true, startValue: 5 });
    expect(second.IsListRestart()).toBe(true);
    expect(second.HasAttrListRestartValue()).toBe(true);
    expect(second.GetAttrListRestartValue()).toBe(5);
    expect(second.GetActualListStartValue()).toBe(5);
    expect(second.GetListItemNumber()).toBe(5);
    expect(projectWriterParagraphList(second)).toMatchObject({ restart: true, startValue: 5 });
    second.SetListRestart(true);
    expect(second.HasAttrListRestartValue()).toBe(false);
    expect(
      /** Reads a missing explicit restart value. @returns Missing value. */ () =>
        second.GetAttrListRestartValue(),
    ).toThrow("is not set");
    expect(
      /** Installs an out-of-range restart value. @returns Nothing. */ () =>
        second.SetListRestart(true, 40_000),
    ).toThrow("outside the supported range");
    applyWriterParagraphList(second, { kind: "none", level: 0 });
    expect(second.IsListRestart()).toBe(false);
    expect(second.GetActualListStartValue()).toBe(1);
  });
});
