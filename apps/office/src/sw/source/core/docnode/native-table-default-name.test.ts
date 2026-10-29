/** @fileoverview Native table insertion with the exported default-name argument and real document ownership. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import { InsertTable } from "./ndtbl";

it("allocates successive unique native names when the name argument is omitted", /** Checks actual insertion, geometry and automatic name allocation. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw new Error("Missing initial body paragraph.");
  const position = new SwPosition(node);
  try {
    const options = { mnInsMode: 0, mnRowsToRepeat: 0 },
      first = InsertTable(doc, options, position, 1, 2),
      second = InsertTable(doc, options, position, 2, 1);
    expect(first.GetName()).toBe("Table1");
    expect(second.GetName()).toBe("Table2");
    expect(first.GetTabLines()).toHaveLength(1);
    expect(first.GetTabLines()[0]?.GetTabBoxes()).toHaveLength(2);
    expect(second.GetTabLines()).toHaveLength(2);
    expect(doc.GetTables()).toEqual([first, second]);
  } finally {
    position.Dispose();
    doc.Dispose();
  }
});
