/** @fileoverview Native normal bookmark unique-name/cache behavior including source exhaustion boundaries. */
import { expect, it } from "vitest";
import { getUniqueBookmarkName } from "./bookmark-name";
import { SwDoc } from "./doc";
import { readOdtDocument } from "../../filter/xml/swxml";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
it("uses actual ownership and retains the next-offset cache after deletion", /** Source caches the next candidate instead of filling old holes. @returns Nothing. */ () => {
  const names = new Set(["A", "A Copy 1"]),
    cache = new Map<string, number>(),
    unique =
      /** Queries original occupied names. @param n - Candidate. @returns Whether absent. */ (
        n: string,
      ) => !names.has(n);
  expect(getUniqueBookmarkName("Free", unique, cache, "%1 Copy ")).toBe("Free");
  expect(cache.size).toBe(0);
  expect(getUniqueBookmarkName("A", unique, cache, "%1 Copy ")).toBe("A Copy 2");
  expect(cache.get("A")).toBe(3);
  expect(getUniqueBookmarkName("A", unique, cache, "%1 Copy ")).toBe("A Copy 3");
  expect(getUniqueBookmarkName("A", unique, new Map(), "Copie de %1 ")).toBe("Copie de A 1");
});
it("preserves original exhausted-counter results at the direct helper boundary", /** These artificial cache values need billions of names in real use;they cannot be reached in a practical document and are tested to retain source coverage without ignores. @returns Nothing. */ () => {
  const occupied = /** Represents a colliding native name. @returns False. */ () => false;
  expect(getUniqueBookmarkName("A", occupied, new Map([["A", 2147483647]]), "%1 Copy ")).toBe("");
  expect(getUniqueBookmarkName("A", occupied, new Map([["A", 2147483646]]), "%1 Copy ")).toBe(
    "A Copy 2147483646",
  );
});
it("keeps raw whitespace and duplicate-created names through the actual mark owner and ODT", /** Uses real positions and native item serialization. @returns Completion. */ async () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing node");
  node.SetText("body");
  const marks = doc.GetIDocumentMarkAccess();
  expect(marks.MakeMark(node, 1, " A ").GetName()).toBe(" A ");
  expect(marks.MakeMark(node, 2, " A ").GetName()).toBe(" A  Copy 1");
  expect(marks.MakeMark(node, 3, " ").GetName()).toBe(" ");
  expect(marks.RenameMark(" ", "  ")).toBe(true);
  const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "Raw names" }), {
    title: "Raw names",
  });
  expect(
    reopened.document.GetIDocumentMarkAccess().FindMark(" A ")?.GetMarkPos().GetContentIndex(),
  ).toBe(1);
  expect(
    reopened.document
      .GetIDocumentMarkAccess()
      .FindMark(" A  Copy 1")
      ?.GetMarkPos()
      .GetContentIndex(),
  ).toBe(2);
  expect(
    reopened.document.GetIDocumentMarkAccess().FindMark("  ")?.GetMarkPos().GetContentIndex(),
  ).toBe(3);
});
