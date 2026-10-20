/** @fileoverview Shared office icon extraction preserves actual Writer toolbar visuals and resource order. */
import { cleanup, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { WriterCommandToolbar } from "./WriterCommandToolbar";
import { writerStandardBarItems } from "../../uiconfig/swriter/toolbar/standardbar";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
it("preserves Writer standard toolbar source order and original Lucide symbols", /** Uses actual Writer Sfx bindings with the shared icon vocabulary. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  try {
    render(
      <WriterCommandToolbar
        commandSource={createBrowserCommandSource(session.view.GetViewFrame())}
        resolveArguments={/** No parameterized commands. @returns Undefined. */ () => undefined}
        onInsertTable={/** Not exercised here. @returns Nothing. */ () => undefined}
        onTableMoreOptions={/** Not exercised here. @returns Nothing. */ () => undefined}
      />,
    );
    const items = writerStandardBarItems.filter(
      /** Selects command placements. @param item - Placement. @returns Whether command. */ (
        item,
      ) => item.kind === "command",
    );
    expect(
      screen
        .getAllByRole("button")
        .map(
          /** Reads actual accessible labels. @param button - Shared control. @returns Label. */ (
            button,
          ) => button.getAttribute("aria-label"),
        ),
    ).toEqual(
      items.map(
        /** Reads native Writer labels including table controller. @param item - Source placement. @returns Label. */ (
          item,
        ) =>
          item.commandId === ".uno:InsertTable"
            ? "Insert Table"
            : getWriterCommandResource(item.commandId).label,
      ),
    );
    for (const [url, icon] of [
      [".uno:AddDirect", "file-plus"],
      [".uno:Open", "folder-open"],
      [".uno:Print", "printer"],
      [".uno:Cut", "scissors"],
      [".uno:Copy", "copy"],
      [".uno:Paste", "clipboard-paste"],
      [".uno:Undo", "undo-2"],
      [".uno:Redo", "redo-2"],
      [".uno:HyperlinkDialog", "link"],
      [".uno:InsertBookmark", "bookmark"],
      [".uno:InsertPagebreak", "separator-horizontal"],
    ] as const) {
      expect(
        screen
          .getByRole("button", { name: getWriterCommandResource(url).label })
          .querySelector(`svg.lucide-${icon}`),
      ).not.toBeNull();
    }
  } finally {
    cleanup();
    session.Close();
  }
});
