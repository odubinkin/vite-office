/** @fileoverview Verifies the pinned built-in Writer paragraph-style pool. */
import { describe, expect, it } from "vitest";
import { WRITER_PARAGRAPH_STYLE_POOL } from "./poolfmt";
import { createWriterDocument } from "../source/core/doc/writer";

describe("Writer paragraph-style pool", /** Registers pool tests. @returns Nothing. */ () => {
  it("preserves all pool ranges, identities, parents, and follow links", /** Verifies the complete graph. @returns Nothing. */ () => {
    expect(WRITER_PARAGRAPH_STYLE_POOL).toHaveLength(126);
    expect(
      new Set(
        WRITER_PARAGRAPH_STYLE_POOL.map(
          /** Projects an identity. @param style - Pool style. @returns ID. */ (style) => style.id,
        ),
      ).size,
    ).toBe(126);
    expect(WRITER_PARAGRAPH_STYLE_POOL[0]).toMatchObject({ id: "default", poolId: 2048 });
    expect(WRITER_PARAGRAPH_STYLE_POOL.at(-1)).toMatchObject({ id: "list-heading", poolId: 12292 });
    const document = createWriterDocument("p-1");
    expect(document.GetTextFormatColls()).toHaveLength(1);
    for (const style of WRITER_PARAGRAPH_STYLE_POOL) {
      const collection = document.GetTextFormatColl(style.id);
      expect(collection.poolId).toBe(style.poolId);
      expect(
        collection.DerivedFrom() instanceof Object
          ? collection.DerivedFrom()?.GetName()
          : undefined,
      ).toBe(
        style.parentId === undefined
          ? undefined
          : document.GetTextFormatColl(style.parentId).GetName(),
      );
      expect(collection.GetNextTextFormatColl().id).toBe(style.followId);
    }
    expect(document.GetTextFormatColls()).toHaveLength(126);
  });
});
