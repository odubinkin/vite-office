/** @fileoverview Checks the fixed Writer sidebar command icon contract. */

import { describe, expect, it } from "vitest";

import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { getSidebarIcon } from "./WriterPropertiesPanel";

describe("Writer properties sidebar icons", /** Groups Writer properties sidebar icons. @returns Test callback result. */ () => {
  it("rejects commands absent from the fixed properties sidebar", /** Checks rejects commands absent from the fixed properties sidebar. @returns Test callback result. */ () => {
    expect(getSidebarIcon(WRITER_COMMAND_IDS.alignLeft)).toBeDefined();
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        getSidebarIcon(".uno:UnknownSidebarCommand"),
    ).toThrow(/icon is missing/);
  });
});
