/** @fileoverview Verifies pure Writer workbench paragraph identity generation and focus fallback behavior. */

import { describe, expect, it } from "vitest";

import {
  appendWriterParagraph,
  createWriterDocument,
  type WriterDocument,
} from "../../core/doc/writer";
import { createDocument } from "../../../../sfx2/source/doc/document";
import { createTransactionHistory } from "../../../../sfx2/source/doc/history";
import {
  applyWriterAlignmentTransaction,
  applyWriterListKindTransaction,
  applyWriterListLevelTransaction,
  applyWriterStyleTransaction,
  getActiveWriterParagraph,
  getNextWriterParagraphId,
} from "./viewfunc";

/** Creates a two-paragraph Writer fixture whose identities expose a generated-ID collision. @returns Immutable Writer fixture. */
function createWriterFixture(): WriterDocument {
  return appendWriterParagraph(
    createWriterDocument(
      createDocument({ id: "writer-workbench", suiteId: "writer", title: "Writer" }),
      "writer-paragraph-1",
    ),
    "writer-paragraph-3",
  );
}

describe("Writer workbench helpers" /** Groups pure focus and generated-ID helper tests. @returns Nothing; Vitest registers cases. */, function defineWriterWorkbenchHelperTests(): void {
  it("generates a non-colliding identity after the current body-length suffix" /** Verifies an occupied generated suffix is skipped deterministically. @returns Nothing; assertions validate identity generation. */, function generatesParagraphId(): void {
    expect(getNextWriterParagraphId(createWriterFixture())).toBe("writer-paragraph-4");
  });

  it("uses the focused paragraph when it exists and the first paragraph after history makes it stale" /** Verifies formatting has a stable deterministic target across current and stale focus identities. @returns Nothing; assertions validate reference selection. */, function resolvesFocusedParagraph(): void {
    const writerDocument = createWriterFixture();

    expect(getActiveWriterParagraph(writerDocument, "writer-paragraph-3")).toBe(
      writerDocument.paragraphs[1],
    );
    expect(getActiveWriterParagraph(writerDocument, "removed-paragraph")).toBe(
      writerDocument.paragraphs[0],
    );
  });

  it("records changed active-list commands exactly once and preserves disabled command no-ops" /** Verifies workbench command helpers keep history and selection ownership outside the React view. @returns Nothing; immutable list-kind and list-level histories are asserted. */, function appliesListCommandTransactions(): void {
    const writer = createWriterFixture();
    const initialHistory = createTransactionHistory(writer, { position: 0 });
    const listed = applyWriterListKindTransaction(initialHistory, "writer-paragraph-3", "numbered");
    const levelChanged = applyWriterListLevelTransaction(listed, "writer-paragraph-3", "demote");
    const rootHistory = applyWriterListKindTransaction(
      initialHistory,
      "writer-paragraph-1",
      "numbered",
    );

    expect(listed.entries).toHaveLength(2);
    expect(listed.entries[1]?.paragraphs[1]?.list.kind).toBe("numbered");
    expect(levelChanged.entries).toHaveLength(3);
    expect(levelChanged.entries[2]?.paragraphs[1]?.list.level).toBe(1);
    expect(applyWriterListLevelTransaction(rootHistory, "writer-paragraph-1", "promote")).toBe(
      rootHistory,
    );
    expect(applyWriterListKindTransaction(rootHistory, "writer-paragraph-1", "numbered")).toBe(
      rootHistory,
    );
  });

  it("records changed active alignment and style commands exactly once" /** Verifies the React view delegates the other formatting transitions to the same Writer workbench helper boundary. @returns Nothing; changed and no-op transaction results are asserted. */, function appliesFormattingTransactions(): void {
    const initialHistory = createTransactionHistory(createWriterFixture(), { position: 0 });
    const aligned = applyWriterAlignmentTransaction(initialHistory, "writer-paragraph-1", "center");
    const styled = applyWriterStyleTransaction(aligned, "writer-paragraph-1", "heading-1");

    expect(aligned.entries).toHaveLength(2);
    expect(aligned.entries[1]?.paragraphs[0]?.alignment).toBe("center");
    expect(styled.entries).toHaveLength(3);
    expect(styled.entries[2]?.paragraphs[0]?.style).toBe("heading-1");
    expect(applyWriterAlignmentTransaction(initialHistory, "writer-paragraph-1", "left")).toBe(
      initialHistory,
    );
    expect(applyWriterStyleTransaction(initialHistory, "writer-paragraph-1", "default")).toBe(
      initialHistory,
    );
  });
});
