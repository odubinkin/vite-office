/** @fileoverview Exercises Writer text-shell commands through generated slots. */
/* eslint-disable @typescript-eslint/no-non-null-assertion -- Local test fixtures keep setup and assertions concise. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createRequestArguments, SfxRequest } from "../../../../sfx2/source/control/request";
import { createWriterDocument } from "../../core/doc/doc";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { SwDocShell } from "../app/docsh";
import { WriterDialogController } from "../dialog/writer-dialog-controller";
import { SwWrtShell } from "../wrtsh/wrtsh1";
import type { WriterParagraphFormatValue } from "./textsh1";

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
  it("validates page flow values through the paragraph shell", /** Checks accepted page breaks and rejected page references. @returns Nothing. */ () => {
    const { shell } = createFixture();
    const slot = shell
      .GetCommandShell()
      .GetInterface()
      .GetSlot(WRITER_COMMAND_IDS.paragraphDialog)!;
    const base = shell.GetCommandShell().ResolveSlot(slot.slotId)!.getState()
      .value as WriterParagraphFormatValue;
    expect(shell.ApplyParagraphFormat({ ...base, breakBefore: "page", breakAfter: "auto" })).toBe(
      true,
    );
    expect(shell.ApplyParagraphFormat({ ...base, breakBefore: "auto", breakAfter: "page" })).toBe(
      true,
    );
    expect(
      shell.ApplyParagraphFormat({
        ...base,
        breakBefore: "auto",
        breakAfter: "auto",
        pageStyleName: "Standard",
        pageNumber: "auto",
      }),
    ).toBe(true);
    expect(shell.ApplyParagraphFormat({ ...base, pageStyleName: "Missing" })).toBe(false);
    expect(shell.ApplyParagraphFormat({ ...base, pageNumber: 0 })).toBe(false);
    expect(shell.ApplyParagraphFormat({ ...base, pageNumber: 65536 })).toBe(false);
    const { firstLineIndentPt, pageStyleName, ...withoutOptionalMetrics } = base;
    void firstLineIndentPt;
    void pageStyleName;
    expect(
      shell.ApplyParagraphFormat({
        ...withoutOptionalMetrics,
        autoTextIndent: true,
        pageNumber: 8,
      }),
    ).toBe(true);
    shell.GetDocShell().Close();
  });
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

  it("routes color, spacing, and paragraph dialog through generated slot state", /** Verifies the pinned text toolbar slots and one dialog owner. @returns Test callback result. */ async () => {
    const { dialogs, runValue, shell } = createFixture();
    const state =
      /** Reads one generated slot state. @param commandUrl - Command URL. @returns Bound slot state. */ (
        commandUrl: string,
      ) => {
        const slot = shell.GetCommandShell().GetInterface().GetSlot(commandUrl)!;
        return shell.GetCommandShell().ResolveSlot(slot.slotId)!.getState();
      };
    expect(runValue(WRITER_COMMAND_IDS.color, { color: "#ff0000" })).toBe(false);
    expect(state(WRITER_COMMAND_IDS.color).value).toBe("#ff0000");
    expect(runValue(WRITER_COMMAND_IDS.charBackColor, { color: "#00ff00" })).toBe(false);
    expect(state(WRITER_COMMAND_IDS.charBackColor).value).toBe("#00ff00");
    expect(runValue(WRITER_COMMAND_IDS.color)).toBe(false);
    expect(runValue(WRITER_COMMAND_IDS.lineSpacing, { percent: 150 })).toBe(true);
    expect(state(WRITER_COMMAND_IDS.lineSpacing).value).toBe(150);
    expect(runValue(WRITER_COMMAND_IDS.lineSpacing)).toBe(false);
    expect(runValue(WRITER_COMMAND_IDS.lineSpacing, { percent: -1 })).toBe(false);

    const cancelled = runValue(WRITER_COMMAND_IDS.paragraphDialog) as Promise<boolean>;
    const request = dialogs.GetSnapshot()!;
    expect(request.request.kind).toBe("paragraph");
    if (request.request.kind !== "paragraph") throw new Error("Expected paragraph request");
    expect(request.request.initialValue.lineValue).toBe(150);
    expect(state(WRITER_COMMAND_IDS.paragraphDialog).value).toMatchObject({ lineValue: 150 });
    expect(dialogs.Cancel(request.id)).toBe(true);
    expect(await cancelled).toBe(false);

    const accepted = runValue(WRITER_COMMAND_IDS.paragraphDialog) as Promise<boolean>;
    const next = dialogs.GetSnapshot()!;
    if (next.request.kind !== "paragraph") throw new Error("Expected paragraph request");
    expect(
      dialogs.Complete(next.id, {
        paragraphFormat: { ...next.request.initialValue, upperPt: 6 },
        paintLineNumbers: true,
      }),
    ).toBe(true);
    expect(await accepted).toBe(true);
    expect(state(WRITER_COMMAND_IDS.paragraphDialog).value).toMatchObject({ upperPt: 6 });
    expect(shell.GetLineNumberInfo().IsPaintLineNumbers()).toBe(true);
    const visibilityOnly = runValue(WRITER_COMMAND_IDS.paragraphDialog) as Promise<boolean>;
    const visibilityRequest = dialogs.GetSnapshot()!;
    if (visibilityRequest.request.kind !== "paragraph")
      throw new Error("Expected paragraph request");
    dialogs.Complete(visibilityRequest.id, {
      paragraphFormat: visibilityRequest.request.initialValue,
      paintLineNumbers: false,
    });
    expect(await visibilityOnly).toBe(true);
    const unchanged = runValue(WRITER_COMMAND_IDS.paragraphDialog) as Promise<boolean>;
    const unchangedRequest = dialogs.GetSnapshot()!;
    if (unchangedRequest.request.kind !== "paragraph")
      throw new Error("Expected paragraph request");
    dialogs.Complete(unchangedRequest.id, {
      paragraphFormat: unchangedRequest.request.initialValue,
      paintLineNumbers: false,
    });
    expect(await unchanged).toBe(false);
    expect(
      shell.ApplyParagraphFormat({
        ...unchangedRequest.request.initialValue,
        lineMode: "fixed",
        lineValue: 240,
      }),
    ).toBe(true);
    expect(state(WRITER_COMMAND_IDS.lineSpacing).value).toBe("custom");
    shell.GetDocShell().Close();
  });
});
