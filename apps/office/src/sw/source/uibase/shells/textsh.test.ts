/** @fileoverview Exercises Writer text-shell commands through generated slots. */
/* eslint-disable @typescript-eslint/no-non-null-assertion -- Local test fixtures keep setup and assertions concise. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createRequestArguments, SfxRequest } from "../../../../sfx2/source/control/request";
import { createWriterDocument } from "../../core/doc/doc";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { SwDocShell } from "../app/docsh";
import { WriterDialogController } from "../dialog/writer-dialog-controller";
import { SwWrtShell } from "../wrtsh/wrtsh";

/** Runs the createFixture test helper. @returns Test callback result. */ function createFixture() {
  const dialogs = new WriterDialogController();
  const shell = new SwWrtShell(
    new SwDocShell(
      createWriterDocument(),
      createDocument({ id: "text-shell", suiteId: "writer", title: "Text shell" }),
    ),
    dialogs,
  );
  /** Runs the run test helper. @param commandUrl - Test input. @param value - Test input. @returns Test callback result. */ function run(
    commandUrl: string,
    value?: unknown,
  ) {
    const slot = shell.GetCommandShell().GetInterface().GetSlot(commandUrl)!;
    const resolved = shell.GetCommandShell().ResolveSlot(slot.slotId)!;
    return resolved.execute(
      new SfxRequest(slot.slotId, createRequestArguments(slot.slotId, value)),
    );
  }
  /** Runs the runValue test helper. @param commandUrl - Test input. @param value - Test input. @returns Test callback result. */ function runValue(
    commandUrl: string,
    value?: unknown,
  ) {
    const result = run(commandUrl, value);
    if (result.status !== "executed") throw new Error(`${commandUrl} was not executable`);
    return result.value;
  }
  return { dialogs, run, runValue, shell };
}

describe("Writer text-shell commands", /** Groups Writer text-shell commands. @returns Test callback result. */ () => {
  it("inserts and edits links through accepted and cancelled dialog requests", /** Checks inserts and edits links through accepted and cancelled dialog requests. @returns Test callback result. */ async () => {
    const { dialogs, run, runValue, shell } = createFixture();
    shell.Insert("Example");
    const insert = runValue(WRITER_COMMAND_IDS.hyperlinkDialog) as Promise<boolean>;
    const request = dialogs.GetSnapshot()!;
    expect(request.request.kind).toBe("hyperlink");
    expect(
      dialogs.Complete(request.id, { hyperlink: { url: "https://example.com" }, text: "Link" }),
    ).toBe(true);
    expect(await insert).toBe(true);

    const edit = runValue(WRITER_COMMAND_IDS.editHyperlink) as Promise<boolean>;
    expect(dialogs.Cancel(dialogs.GetSnapshot()!.id)).toBe(true);
    expect(await edit).toBe(false);
    const acceptedEdit = runValue(WRITER_COMMAND_IDS.editHyperlink) as Promise<boolean>;
    expect(
      dialogs.Complete(dialogs.GetSnapshot()!.id, {
        hyperlink: { url: "https://updated.example" },
        text: "",
      }),
    ).toBe(true);
    expect(await acceptedEdit).toBe(true);
    expect(run(WRITER_COMMAND_IDS.removeHyperlink).status).toBe("executed");
    shell.GetDocShell().Close();
  });

  it("rejects unsupported paragraph styles at the generated command boundary", /** Checks rejects unsupported paragraph styles at the generated command boundary. @returns Test callback result. */ () => {
    const { run, runValue, shell } = createFixture();
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        run(WRITER_COMMAND_IDS.styleApply, { Style: "Unknown" }),
    ).toThrow(/Unsupported Writer paragraph style/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        run(WRITER_COMMAND_IDS.styleApply),
    ).toThrow(/Unsupported Writer paragraph style/);
    expect(runValue(WRITER_COMMAND_IDS.fontName, {})).toBe(false);
    expect(runValue(WRITER_COMMAND_IDS.fontHeight, {})).toBe(false);
    shell.GetDocShell().Close();
  });

  it("accepts direct hyperlink command arguments and leaves cancelled insert unchanged", /** Checks accepts direct hyperlink command arguments and leaves cancelled insert unchanged. @returns Test callback result. */ async () => {
    const { dialogs, runValue, shell } = createFixture();
    shell.Insert("Body");
    const cancelled = runValue(WRITER_COMMAND_IDS.hyperlinkDialog) as Promise<boolean>;
    dialogs.Cancel(dialogs.GetSnapshot()!.id);
    expect(await cancelled).toBe(false);
    expect(
      runValue(WRITER_COMMAND_IDS.hyperlinkDialog, {
        hyperlink: { url: "https://example.com" },
        text: "Link",
      }),
    ).toBe(true);
    expect(
      runValue(WRITER_COMMAND_IDS.editHyperlink, {
        hyperlink: { url: "https://edited.example" },
      }),
    ).toBe(true);
    shell.GetDocShell().Close();
  });
});
