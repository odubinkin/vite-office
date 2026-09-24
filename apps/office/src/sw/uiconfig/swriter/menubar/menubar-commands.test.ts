/** @fileoverview Verifies Writer placement resources independently from React rendering. */
import { describe, expect, it } from "vitest";

import {
  WRITER_COMMAND_IDS,
  getWriterParagraphStyleCommandId,
  writerMenuCommandIds,
  writerMenuPlacements,
} from "./menubar-commands";
import { writerNumObjectBarItems } from "../toolbar/numobjectbar";
import { writerStandardBarItems } from "../toolbar/standardbar";
import { writerTextObjectBarItems } from "../toolbar/textobjectbar";
import { getWriterCommandResource } from "../writer-command-resources";
import { normalizeWriterToolbarItems } from "../ui-resource";
import generated from "../writer-ui.generated.json" with { type: "json" };

describe("Writer uiconfig resources" /** Groups pure Writer resource tests. @returns Nothing. */, function defineWriterUiResourceTests(): void {
  it("preserves supported pinned menu and toolbar ordering without React" /** Verifies menu and toolbar resource ordering. @returns Nothing. */, function validatesPlacementOrder(): void {
    expect(
      writerMenuPlacements.map(
        /** Projects a menu resource identity. @param menu - Top-level menu. @returns Resource identity. */ (
          menu,
        ) => menu.id,
      ),
    ).toEqual(["picklist", "editmenu", "viewmenu", "insertmenu", "formatmenu", "formatstylesmenu"]);
    expect(writerMenuCommandIds).toContain(WRITER_COMMAND_IDS.bold);
    expect(writerMenuCommandIds).toContain(WRITER_COMMAND_IDS.toggleHorizontalRuler);
    expect(writerMenuCommandIds).not.toContain(WRITER_COMMAND_IDS.alignLeft);
    expect(writerMenuCommandIds).not.toContain(WRITER_COMMAND_IDS.underline);
    expect(
      writerStandardBarItems
        .filter(
          /** Retains command placements. @param item - Toolbar resource item. @returns Whether the item is a command. */ (
            item,
          ) => item.kind === "command",
        )
        .map(
          /** Projects a toolbar command identity. @param item - Command placement. @returns Command identity. */ (
            item,
          ) => item.commandId,
        ),
    ).toEqual([
      WRITER_COMMAND_IDS.newDocument,
      WRITER_COMMAND_IDS.openOdt,
      WRITER_COMMAND_IDS.cut,
      WRITER_COMMAND_IDS.copy,
      WRITER_COMMAND_IDS.paste,
      WRITER_COMMAND_IDS.undo,
      WRITER_COMMAND_IDS.redo,
      WRITER_COMMAND_IDS.hyperlinkDialog,
    ]);
    expect(
      writerTextObjectBarItems.some(
        /** Finds the command-backed paragraph style selector. @param item - Toolbar resource item. @returns Whether it is a command select. */ (
          item,
        ) => item.kind === "command-select",
      ),
    ).toBe(true);
    expect(writerTextObjectBarItems).toContainEqual({
      commandId: WRITER_COMMAND_IDS.fontHeight,
      kind: "font-size-select",
      label: "Font size",
    });
    expect(writerTextObjectBarItems).toContainEqual({
      commandId: WRITER_COMMAND_IDS.increaseIndent,
      kind: "command",
    });
    expect(writerTextObjectBarItems).toContainEqual({
      commandId: WRITER_COMMAND_IDS.decreaseIndent,
      kind: "command",
    });
    expect(writerNumObjectBarItems).toEqual([
      { commandId: WRITER_COMMAND_IDS.demote, kind: "command" },
      { commandId: WRITER_COMMAND_IDS.promote, kind: "command" },
      { kind: "separator" },
      { commandId: WRITER_COMMAND_IDS.continueNumbering, kind: "command" },
    ]);
    expect(
      normalizeWriterToolbarItems([
        { kind: "separator" },
        { commandId: WRITER_COMMAND_IDS.bold, kind: "command" },
        { kind: "separator" },
        { kind: "separator" },
      ]),
    ).toEqual([{ commandId: WRITER_COMMAND_IDS.bold, kind: "command" }]);
    expect(generated.locale).toBe("en-US");
    expect(
      generated.unsupported["sw/uiconfig/swriter/menubar/menubar.xml"].every(
        /** Requires every filtered resource to retain an auditable X record. @param entry - Filtered resource. @returns Whether classification is complete. */ (
          entry,
        ) => entry.classification === "X" && entry.sourceUrl.length > 0,
      ),
    ).toBe(true);
    expect(
      /** Resolves a missing style. @returns Missing command URL. */ () =>
        getWriterParagraphStyleCommandId("missing-style"),
    ).toThrow("Unknown Writer paragraph style");
    expect(
      /** Resolves a missing command resource. @returns Missing resource. */ () =>
        getWriterCommandResource(".uno:Missing"),
    ).toThrow("Missing generated Writer command resource");
    expect(
      /** Resolves an unsupported parameterized style. @returns Missing resource. */ () =>
        getWriterCommandResource(
          ".uno:StyleApply?Style:string=Missing&FamilyName:string=ParagraphStyles",
        ),
    ).toThrow("Missing generated Writer command resource");
  });
});
