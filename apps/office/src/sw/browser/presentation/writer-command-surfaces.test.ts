/** @fileoverview Verifies honest command surfaces and active-context object bars. */

import { describe, expect, it } from "vitest";

import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { writerBrowserMenuPlacements } from "./writer-command-surfaces";

/** Collects every nested command URL. @param items - Generated placement nodes. @returns Flattened command URLs. */
function collectCommands(items: readonly unknown[]): string[] {
  return items.flatMap(
    /** Collects one placement recursively. @param item - Placement node. @returns Nested command URLs. */ (
      item,
    ) => {
      const node = item as {
        readonly commandId?: string;
        readonly items?: readonly unknown[];
        readonly kind?: string;
      };
      if (node.kind === "command" && node.commandId !== undefined) return [node.commandId];
      return node.items === undefined ? [] : collectCommands(node.items);
    },
  );
}

describe("writer browser command surfaces", /** Groups browser capability filtering. @returns Nothing. */ function defineWriterCommandSurfaceTests(): void {
  it("hides the ruler command until measured layout state exists", /** Verifies decorative layout commands stay absent. @returns Nothing. */ function hidesUnsupportedRuler(): void {
    expect(collectCommands(writerBrowserMenuPlacements)).not.toContain(
      WRITER_COMMAND_IDS.toggleHorizontalRuler,
    );
  });
});
