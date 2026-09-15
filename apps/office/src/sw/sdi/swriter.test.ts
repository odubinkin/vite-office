/** @fileoverview Guards generated Writer SDI slot identities and upstream resource order. */

import { describe, expect, it } from "vitest";

import generated from "../uiconfig/swriter/writer-ui.generated.json" with { type: "json" };
import { getWriterSlotId, WRITER_UPSTREAM_SLOT_IDS } from "./swriter";

describe("generated Writer slots", /** Exercises generated SDI identities and order. @returns Nothing. */ () => {
  it("uses pinned HRC values for parameterized UNO and browser-owned commands" /** Verifies slot lookup and browser reservations. @returns Nothing. */, () => {
    expect(getWriterSlotId(".uno:Bold")).toBe(10_009);
    expect(
      getWriterSlotId(".uno:StyleApply?Style:string=Heading%201&FamilyName:string=ParagraphStyles"),
    ).toBe(5_552);
    expect(getWriterSlotId("vnd.vite-office.browser:OpenLocal")).toBe(65_001);
    expect(WRITER_UPSTREAM_SLOT_IDS[".uno:DefaultNumbering"]).toBe(20_144);
    expect(
      /** Resolves an unsupported URL. @returns Missing slot. */ () =>
        getWriterSlotId(".uno:Unsupported"),
    ).toThrow("Unsupported Writer command URL");
  });

  it("records the supported toolbar subsequence in exact upstream order" /** Verifies generated resource ordering. @returns Nothing. */, () => {
    expect(
      generated.surfaces.standardbar.flatMap(
        /** Collects one command node. @param item - Generated node. @returns Command URL if present. */ (
          item,
        ) => (item.kind === "command" ? [item.commandUrl] : []),
      ),
    ).toEqual([
      ".uno:AddDirect",
      ".uno:Open",
      ".uno:SaveAs",
      ".uno:Cut",
      ".uno:Copy",
      ".uno:Paste",
      ".uno:Undo",
      ".uno:Redo",
      ".uno:HyperlinkDialog",
    ]);
  });
});
