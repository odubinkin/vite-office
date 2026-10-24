/** @fileoverview Verifies actual Writer bookmark-at-cursor initialization across shell,controller,presenter and cancellation. */
import { expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createCentimetreWriterDocumentSession } from "../../../test/writer-measurement-fixtures";
import { WriterWorkbench } from "./writer-view";
it("initializes the real selected mark through the shell request and cancels back to the document", /** Both selectedName forwarding branches are reachable from an actual native mark at the cursor. @returns Completion. */ async () => {
  const session = createCentimetreWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing initial native text node");
  doc.GetIDocumentMarkAccess().MakeMark(node, 0, "Selected");
  const rendered = render(<WriterWorkbench isActive view={session.view} />);
  try {
    fireEvent.click(
      within(screen.getByRole("toolbar", { name: "Writer standard toolbar" })).getByRole("button", {
        name: "Bookmark",
      }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Bookmark" }),
      list = within(dialog).getByRole("listbox", { name: "Existing bookmarks" });
    expect(within(dialog).getByLabelText("Name")).toHaveValue("Selected");
    expect(list).toHaveValue(["Selected"]);
    expect(list).toHaveFocus();
    fireEvent.keyDown(list, { key: "Escape" });
    await waitFor(
      /** Waits for the original controller to release the request. @returns Nothing. */ () =>
        expect(screen.queryByRole("dialog", { name: "Bookmark" })).toBeNull(),
    );
    expect(
      doc
        .GetIDocumentMarkAccess()
        .GetBookmarks()
        .map(
          /** Reads actual native names after cancellation. @param mark - Native mark. @returns Name. */ (
            mark,
          ) => mark.GetName(),
        ),
    ).toEqual(["Selected"]);
    expect(screen.getByLabelText("Writer document body")).toHaveFocus();
  } finally {
    rendered.unmount();
    session.Close();
  }
});
