/** @fileoverview Integration checks for pinned Writer table, line spacing, and Tools entries. */
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { SvxLineSpacingItem } from "../../../editeng/source/items/paraitem";
import { RES_PARATR_LINESPACING } from "../../inc/hintids";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

describe("Writer upstream entry points", /** Groups command placement checks. @returns Nothing. */ () => {
  it("uses the upstream table grid and exposes supported Table and Tools dialogs", /** Checks menu and quick-control actions. @returns Nothing. */ () => {
    const session = createWriterDocumentSession();
    const rendered = render(<WriterWorkbench isActive view={session.view} />);
    fireEvent.click(screen.getByRole("button", { name: "Insert Table" }));
    expect(screen.queryByRole("dialog", { name: "Insert Table" })).toBeNull();
    expect(screen.getByRole("button", { name: "More Options" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "3 columns, 2 rows" }));
    const table = session.docShell.GetDoc().GetTables()[0];
    expect(table?.GetTabLines()).toHaveLength(2);
    expect(table?.GetTabLines()[0]?.GetTabBoxes()).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "Table" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Table Properties…" }));
    expect(screen.getByRole("dialog", { name: "Table Properties" })).toBeInTheDocument();
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Table Properties" })).getByRole("button", {
        name: "Cancel",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Table" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Table…" }));
    expect(screen.getByRole("dialog", { name: "Insert Table" })).toBeInTheDocument();
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Insert Table" })).getByRole("button", {
        name: "Cancel",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Tools" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Line Numbering…" }));
    const dialog = screen.getByRole("dialog", { name: "Line Numbering" });
    fireEvent.click(within(dialog).getByRole("checkbox", { name: "Show numbering" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    expect(session.docShell.GetDoc().GetLineNumberInfo().IsPaintLineNumbers()).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Tools" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Line Numbering…" }));
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Line Numbering" })).getByRole("button", {
        name: "Cancel",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Line Spacing" }));
    fireEvent.pointerDown(screen.getByRole("button", { name: "Spacing: 1.15" }));
    expect(screen.getByRole("button", { name: "Spacing: 1.15" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Spacing: 1.15" }));
    expect(
      (
        session.view
          .GetWrtShell()
          .GetActiveParagraph()
          .GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem
      ).GetValue(),
    ).toBe(115);
    fireEvent.click(screen.getByRole("button", { name: "Line Spacing" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Custom line spacing" }), {
      target: { value: "175" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(
      (
        session.view
          .GetWrtShell()
          .GetActiveParagraph()
          .GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem
      ).GetValue(),
    ).toBe(175);
    fireEvent.click(screen.getByRole("button", { name: "Line Spacing" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Custom line spacing" }), {
      target: { value: "0" },
    });
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("button", { name: "Apply" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Line Spacing" }));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("button", { name: "Apply" })).toBeNull();
    rendered.unmount();
    session.Close();
  });
});
