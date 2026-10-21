/** @fileoverview Exercises native section-search rejection using real structural node arrays and cursor ownership. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwNodes } from "../docnode/nodes";
import { SwPosition } from "./pam";
import { SwCursor, type SwFindParas } from "./swcrsr";
import { FindRanges, SwDocPositions } from "../../../inc/cshtyp";

for (const backward of [false, true])
  for (const context of ["empty-body", "structural-body", "extras-end", "empty-extras"] as const)
    it(`rejects ${context} without invoking search,backward=${backward}`, /** Checks actual native admission and saved-ring cleanup without substituting movement functions. @returns Nothing. */ () => {
      const doc = new SwDoc(),
        nodes = context === "extras-end" ? doc.nodes : new SwNodes(doc);
      if (context === "structural-body") nodes.MakeTableNode("StructuralOnly");
      const point = new SwPosition(
          context === "extras-end"
            ? nodes.GetEndOfExtras()
            : context === "empty-extras"
              ? nodes.at(0)
              : nodes.GetEndOfContent().StartOfSectionNode(),
        ),
        cursor = new SwCursor(point);
      point.Dispose();
      let calls = 0;
      const strategy: SwFindParas = {
        /** Detects incorrectly admitted content-free regions. @returns No match. */
        DoFind() {
          calls++;
          return 0;
        },
        /** Keeps the document unchanged. @returns Query mode. */
        IsReplaceMode() {
          return false;
        },
      };
      const before = cursor.GetPoint().GetNode();
      try {
        expect(
          cursor.FindAll(
            strategy,
            backward ? SwDocPositions.End : SwDocPositions.Start,
            backward ? SwDocPositions.Start : SwDocPositions.End,
            context === "extras-end" || context === "empty-extras"
              ? FindRanges.InOther
              : FindRanges.InSelAll | FindRanges.InBodyOnly,
            [false],
          ),
        ).toBe(0);
        expect(calls).toBe(0);
        expect(cursor.GetPoint().GetNode()).toBe(before);
        expect(cursor.GetRingContainer().size()).toBe(2);
      } finally {
        while (cursor.GetNext() !== cursor) cursor.GetNext().Dispose();
        cursor.Dispose();
      }
    });
