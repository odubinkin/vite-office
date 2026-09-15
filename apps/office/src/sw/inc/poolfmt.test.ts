/** @fileoverview Verifies the pinned built-in Writer paragraph-style pool. */
import { describe, expect, it } from "vitest";
import {
  encodeWriterOdfStyleName,
  getWriterOdfStyleName,
  getWriterStyleIdFromOdfName,
  WRITER_PARAGRAPH_STYLE_POOL,
} from "./poolfmt";
import { createWriterDocument } from "../source/core/doc/doc";

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
    expect(document.GetTextFormatColl("heading-1").GetAssignedOutlineStyleLevel()).toBe(0);
    expect(document.GetTextFormatColl("heading-10").GetAssignedOutlineStyleLevel()).toBe(9);
    expect(
      /** Assigns an invalid outline level. @returns Nothing. */ () =>
        document.GetTextFormatColl("heading-1").AssignToListLevelOfOutlineStyle(10),
    ).toThrow("outside 0-9");
  });

  it("uses LibreOffice XML style-name encoding for the complete pool", /** Verifies SvXMLUnitConverter-compatible names and reverse lookup. @returns Nothing. */ () => {
    expect(encodeWriterOdfStyleName("Text body")).toBe("Text_20_body");
    expect(encodeWriterOdfStyleName("Numbering 1 Cont.")).toBe("Numbering_20_1_20_Cont.");
    expect(encodeWriterOdfStyleName("1 title")).toBe("_31__20_title");
    expect(encodeWriterOdfStyleName("ÀØøÿ")).toBe("ÀØøÿ");
    expect(encodeWriterOdfStyleName("Ж1\u0301ʽՙەۦ·")).toBe("Ж1\u0301ʽՙەۦ·");
    expect(encodeWriterOdfStyleName("\u0301\uf900\u20dd")).toBe("_301__f900__20dd_");
    expect(encodeWriterOdfStyleName(" ".repeat(9_000))).toBe(" ".repeat(9_000));
    const names = WRITER_PARAGRAPH_STYLE_POOL.map(
      /** Projects and checks one ODF identity. @param style - Pool entry. @returns ODF name. */ (
        style,
      ) => {
        const name = getWriterOdfStyleName(style.id);
        expect(getWriterStyleIdFromOdfName(name)).toBe(style.id);
        return name;
      },
    );
    expect(new Set(names).size).toBe(WRITER_PARAGRAPH_STYLE_POOL.length);
    expect(getWriterOdfStyleName("header-and-footer")).toBe("Header_20_and_20_Footer");
    expect(getWriterOdfStyleName("custom-style")).toBe("custom-style");
  });
});
