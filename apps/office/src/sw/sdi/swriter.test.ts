/** @fileoverview Guards generated Writer SDI slot identities and upstream resource order. */

import { describe, expect, it } from "vitest";

import { SfxRequest } from "../../sfx2/source/control/request";
import { SfxStringItem } from "../../svl/source/items/stritem";
import { SfxUnoAnyItem } from "../../sfx2/source/view/frame";
import generated from "../uiconfig/swriter/writer-ui.generated.json" with { type: "json" };
import {
  createWriterInterface,
  getWriterCommandArguments,
  getWriterSlotId,
  WRITER_UPSTREAM_SLOT_IDS,
} from "./swriter";

describe("generated Writer slots", /** Exercises generated SDI identities and order. @returns Nothing. */ () => {
  it("uses pinned HRC values for parameterized UNO commands" /** Verifies parameterized slot lookup. @returns Nothing. */, () => {
    expect(getWriterSlotId(".uno:Bold")).toBe(10_009);
    expect(getWriterSlotId(".uno:Bold?unused=1")).toBe(10_009);
    expect(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        getWriterSlotId("Bold"),
    ).toThrow("Unsupported Writer command URL");
    expect(
      getWriterSlotId(".uno:StyleApply?Style:string=Heading%201&FamilyName:string=ParagraphStyles"),
    ).toBe(5_552);
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
      ".uno:Print",
      ".uno:Cut",
      ".uno:Copy",
      ".uno:Paste",
      ".uno:Undo",
      ".uno:Redo",
      ".uno:InsertTable",
      ".uno:InsertPagebreak",
      ".uno:HyperlinkDialog",
      ".uno:InsertBookmark",
    ]);
  });

  it("attaches generated interface metadata while retaining shell-owned state", /** Verifies generated interfaces. @returns Nothing. */ () => {
    const sfxInterface = createWriterInterface([
      {
        execute: /** Returns a result. @returns Result. */ () => "executed",
        getStateValue: /** Returns state value. @returns Value. */ () => "value",
        id: ".uno:Bold",
        isChecked: /** Returns checked state. @returns True. */ () => true,
        isEnabled: /** Returns enabled state. @returns False. */ () => false,
        isMixed: /** Returns mixed state. @returns True. */ () => true,
      },
      {
        capabilityId: "CAP-0109",
        execute: /** Returns nothing. @returns Undefined. */ () => undefined,
        id: ".uno:Italic",
      },
    ]);
    const bold = sfxInterface.GetSlot(".uno:Bold");
    expect(bold?.GetState({})).toEqual({
      checked: true,
      enabled: false,
      mixed: true,
      value: "value",
    });
    expect(bold?.Execute({}, new SfxRequest(10_009))).toBe("executed");
    expect(sfxInterface.GetSlot(".uno:Italic")?.GetState({})).toEqual({ enabled: true });
  });

  it("reads only structured Any request arguments", /** Verifies Any extraction. @returns Nothing. */ () => {
    const value = { fontFamily: "Noto Serif" };
    expect(getWriterCommandArguments(undefined)).toBeUndefined();
    expect(getWriterCommandArguments([new SfxStringItem(1, "text")])).toBeUndefined();
    expect(getWriterCommandArguments([new SfxUnoAnyItem(1, value)])).toBe(value);
  });
});
