/** @fileoverview Verifies deterministic Writer UI generation and strict resource closure. */

import { describe, expect, it } from "vitest";
import {
  assertGeneratedResourceFresh,
  buildResourceGraph,
  collectResourceCommands,
  validateGeneratedClosure,
  validateRegisteredCommandClosure,
} from "./writer-ui-resource-model";

const resource = `<menu:menubar menu:id="menubar">
  <menu:menu menu:id=".uno:FileMenu"><menu:menupopup>
    <menu:menuitem menu:id=".uno:Open"/>
    <menu:menuseparator/>
    <menu:menu menu:id=".uno:Nested"><menu:menupopup>
      <menu:menuitem menu:id=".uno:Missing"/>
      <menu:menuitem menu:id=".uno:Save"/>
    </menu:menupopup></menu:menu>
  </menu:menupopup></menu:menu>
</menu:menubar>`;

describe("Writer UI resource model", /** Defines generator contract tests. @returns Nothing. */ () => {
  it("preserves nested supported order and classifies every filtered entry as X", /** Verifies graph projection and exclusions. @returns Nothing. */ () => {
    const graph = buildResourceGraph(
      resource,
      new Map([
        [".uno:Open", ".uno:Open"],
        [".uno:Save", ".uno:SaveAs"],
      ]),
      /** Resolves fixture labels. @param url - Resource URL. @returns Label. */ (url) =>
        url.slice(5),
    );
    expect(collectResourceCommands(graph.nodes)).toEqual([".uno:Open", ".uno:SaveAs"]);
    expect(graph.exclusions).toContainEqual({
      classification: "X",
      context: [".uno:FileMenu", ".uno:Nested"],
      entryKind: "command",
      sourceUrl: ".uno:Missing",
    });
    expect(
      buildResourceGraph(
        resource,
        new Map(),
        /** Resolves passthrough labels. @param url - Resource URL. @returns Label. */ (url) => url,
      ).exclusions.every(
        /** Checks explicit classification. @param entry - Filtered entry. @returns Whether it is X. */ (
          entry,
        ) => entry.classification === "X",
      ),
    ).toBe(true);
  });

  it("rejects stale output, manifest mismatches, and incomplete displayed metadata", /** Verifies all failure gates. @returns Nothing. */ () => {
    expect(
      /** Checks the stale-output gate. @returns Nothing. */ () =>
        assertGeneratedResourceFresh("old", "new"),
    ).toThrow("run npm run generate:writer-resources");
    expect(
      /** Checks registered/generated closure. @returns Nothing. */ () =>
        validateRegisteredCommandClosure([".uno:Known"], [".uno:NewCommand"]),
    ).toThrow("Registered command is missing");
    expect(
      /** Checks displayed/generated closure. @returns Nothing. */ () =>
        validateGeneratedClosure({}, [".uno:Shown"]),
    ).toThrow("Displayed command is missing");
    expect(
      /** Checks required label metadata. @returns Nothing. */ () =>
        validateGeneratedClosure(
          { ".uno:Shown": { label: "", placements: ["menu"], shortcuts: [], slotId: 1 } },
          [".uno:Shown"],
        ),
    ).toThrow("label is missing");
  });
});
