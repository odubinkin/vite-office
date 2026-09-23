/** @fileoverview Verifies Writer view attachment and command routing contracts. */

import { describe, expect, it } from "vitest";

import { BrowserSfxDispatcher } from "../../../../framework/browser/dispatch/browser-dispatcher";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SfxViewFrame } from "../../../../sfx2/source/view/viewfrm";
import { createWriterDocument } from "../../core/doc/doc";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { SwDocShell } from "../app/docsh";
import { SwView } from "./view";

describe("SwView frame ownership", /** Groups SwView frame ownership. @returns Test callback result. */ () => {
  it("requires one attached frame for dispatch and exposes its command state", /** Checks requires one attached frame for dispatch and exposes its command state. @returns Test callback result. */ () => {
    const shell = new SwDocShell(
      createWriterDocument(),
      createDocument({ id: "view", suiteId: "writer", title: "View" }),
    );
    const view = new SwView(shell);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () => view.GetViewFrame(),
    ).toThrow(/not attached/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        view.Execute(WRITER_COMMAND_IDS.bold),
    ).toThrow(/not attached/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        view.QueryState(WRITER_COMMAND_IDS.bold),
    ).toThrow(/not attached/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        view.ToggleHorizontalRuler(),
    ).not.toThrow();
    const frame = new SfxViewFrame<SwView>(new BrowserSfxDispatcher());
    view.AttachFrame(frame);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () => view.AttachFrame(frame),
    ).toThrow(/already attached/);
    frame.SetActiveView(view, [view.GetCommandShell(), view.GetWrtShell().GetCommandShell()]);
    expect(view.QueryCommand(WRITER_COMMAND_IDS.bold)?.id).toBe(WRITER_COMMAND_IDS.bold);
    expect(view.QueryState(WRITER_COMMAND_IDS.bold).enabled).toBe(true);
    expect(view.Execute(WRITER_COMMAND_IDS.bold).status).toBe("executed");
    view.Close();
    expect(
      /** Runs the test callback. @returns Test callback result. */ () => view.GetViewFrame(),
    ).toThrow(/not attached/);
  });
});
