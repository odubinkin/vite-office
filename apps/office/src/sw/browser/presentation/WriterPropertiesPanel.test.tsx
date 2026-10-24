/** @fileoverview Checks source-shaped Writer sidebar panel composition through the actual workbench. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createCentimetreWriterDocumentSession as createWriterDocumentSession } from "../../../test/writer-measurement-fixtures";
import { SwPosition } from "../../source/core/crsr/pam";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { RES_MARGIN_TEXTLEFT, RES_UL_SPACE } from "../../inc/hintids";
import { SvxTextLeftMarginItem } from "../../../editeng/inc/lrspitem";
import { SvxLRSpaceItem } from "../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../editeng/inc/ulspitem";
import { WriterPropertiesPanel } from "./WriterPropertiesPanel";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { BrowserSfxDispatcher } from "../../../framework/browser/dispatch/browser-dispatcher";
import { SfxViewFrame } from "../../../sfx2/source/view/viewfrm";
import { WriterWorkbench } from "./writer-view";
let session: ReturnType<typeof createWriterDocumentSession>;
afterEach(
  /** Releases the actual frame. @returns Nothing. */ () => {
    cleanup();
    session.Close();
  },
);
it("orders actual Style,Character,Paragraph controls without status cards", /** Checks the consumed Sidebar.xcu contracts. @returns Nothing. */ () => {
  session = createWriterDocumentSession();
  render(
    <WriterWorkbench
      fileDialogs={session.fileDialogs}
      isActive
      services={session.services}
      view={session.view}
    />,
  );
  const sidebar = screen.getByRole("complementary", { name: "Writer properties sidebar" }),
    sections = sidebar.querySelectorAll("section");
  expect(
    [...sections].map(
      /** Reads actual source panel titles. @param section - Native panel projection. @returns Accessible title. */
      (section) => section.getAttribute("aria-label"),
    ),
  ).toEqual(["Style", "Character", "Paragraph"]);
  const controls = within(sidebar);
  expect(controls.getByRole("combobox", { name: "Paragraph style" })).toBeVisible();
  expect(controls.getByRole("combobox", { name: "Font name" })).toBeVisible();
  expect(controls.getByRole("spinbutton", { name: "Before Text Indent" })).toBeVisible();
  expect(controls.queryByText(/is active/)).not.toBeInTheDocument();
});

/** Mounts the production frame with explicit physical CM preferences. @returns Scoped sidebar and real owners. */
function mount() {
  session = createWriterDocumentSession();
  render(
    <WriterWorkbench
      fileDialogs={session.fileDialogs}
      isActive
      services={session.services}
      view={session.view}
    />,
  );
  return {
    sidebar: within(screen.getByRole("complementary", { name: "Writer properties sidebar" })),
    shell: session.view.GetWrtShell(),
  };
}
it("applies all five native metric fields,keeps command bindings synchronized and restores original history", /** Checks actual UI to typed slot to attribute ownership. @returns Nothing. */ () => {
  const { sidebar, shell } = mount();
  const labels = [
    "Before Text Indent",
    "After Text Indent",
    "First Line Indent",
    "Above Paragraph Spacing",
    "Below Paragraph Spacing",
  ];
  for (const [index, label] of labels.entries())
    fireEvent.change(sidebar.getByRole("spinbutton", { name: label }), {
      target: { value: ["1 cm", "0.5 cm", "-0.5 cm", "0.2 cm", "0.3 cm"][index] },
    });
  const view = session.view;
  let lr = view.QueryState(".uno:LeftRightParaMargin").value as SvxLRSpaceItem,
    ul = view.QueryState(".uno:ULSpacing").value as SvxULSpaceItem;
  expect([
    lr.ResolveTextLeft(),
    lr.ResolveRight(),
    lr.ResolveTextFirstLineOffset(),
    ul.GetUpper(),
    ul.GetLower(),
    ul.GetContext(),
  ]).toEqual([567, 283, -283, 113, 170, false]);
  act(
    /** Restores all five actual formatting actions. @returns Nothing. */ () => {
      for (let n = 0; n < 5; n++) expect(shell.Undo()).toBe(true);
    },
  );
  lr = view.QueryState(".uno:LeftRightParaMargin").value as SvxLRSpaceItem;
  ul = view.QueryState(".uno:ULSpacing").value as SvxULSpaceItem;
  expect([
    lr.ResolveTextLeft(),
    lr.ResolveRight(),
    lr.ResolveTextFirstLineOffset(),
    ul.GetUpper(),
    ul.GetLower(),
  ]).toEqual([0, 0, 0, 0, 0]);
  act(
    /** Reapplies every original transaction. @returns Nothing. */ () => {
      for (let n = 0; n < 5; n++) expect(shell.Redo()).toBe(true);
    },
  );
  expect(sidebar.getByRole("spinbutton", { name: "Before Text Indent" })).toHaveAttribute(
    "aria-valuenow",
    "1",
  );
  act(
    /** Propagates the actual module unit across the registered view. @returns Nothing. */ () =>
      session.view.GetModule().ApplyUserMetric(FieldUnit.INCH, false),
  );
  expect(sidebar.getByRole("spinbutton", { name: "Before Text Indent" })).toHaveValue("0.39″");
  expect(
    (view.QueryState(".uno:LeftRightParaMargin").value as SvxLRSpaceItem).ResolveTextLeft(),
  ).toBe(567);
});
it("shares actual style,font,size,effect and color state with the formatting toolbar", /** Checks sidebar controls dispatch instead of maintaining separate formatting. @returns Nothing. */ () => {
  const { sidebar, shell } = mount(),
    toolbar = within(screen.getByRole("toolbar", { name: "Writer formatting toolbar" }));
  fireEvent.change(sidebar.getByRole("combobox", { name: "Paragraph style" }), {
    target: { value: "Heading 1" },
  });
  fireEvent.keyDown(sidebar.getByRole("combobox", { name: "Paragraph style" }), { key: "Enter" });
  expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("heading-1");
  expect(toolbar.getByRole("combobox", { name: "Paragraph style" })).toHaveValue("Heading 1");
  fireEvent.change(sidebar.getByRole("combobox", { name: "Font name" }), {
    target: { value: "Liberation Sans" },
  });
  fireEvent.keyDown(sidebar.getByRole("combobox", { name: "Font name" }), { key: "Enter" });
  expect(toolbar.getByRole("combobox", { name: "Font name" })).toHaveValue("Liberation Sans");
  fireEvent.change(sidebar.getByRole("combobox", { name: "Font size" }), {
    target: { value: "14" },
  });
  fireEvent.keyDown(sidebar.getByRole("combobox", { name: "Font size" }), { key: "Tab" });
  expect(toolbar.getByRole("combobox", { name: "Font size" })).toHaveValue("14 pt");
  for (const name of ["Bold", "Italic", "Underline"]) {
    const button = sidebar.getByRole("button", { name }),
      checked = button.getAttribute("aria-pressed") === "true";
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", String(!checked));
  }
  fireEvent.click(sidebar.getByRole("button", { name: "Font Color" }));
  fireEvent.click(sidebar.getByRole("button", { name: "Character Highlighting Color" }));
  expect(shell.GetTextShell().GetPendingCharacterAttributes()).toMatchObject({
    fontFamily: "Liberation Sans",
    fontSizeTwips: 280,
    color: "#000000",
    highlight: "#ffff00",
  });
  for (const name of ["Style", "Character"]) {
    const title = sidebar.getByRole("button", { name });
    title.focus();
    fireEvent.keyDown(title, { key: "Enter" });
    expect(
      sidebar.getByRole("combobox", { name: name === "Style" ? "Paragraph style" : "Font name" }),
    ).toHaveFocus();
  }
});

it("shows invalid mixed state and uses fresh source defaults when one mixed metric is edited", /** Checks native blank-field and fresh-item contracts. @returns Nothing. */ () => {
  const { sidebar, shell } = mount();
  act(
    /** Creates different actual selected paragraph attributes. @returns Nothing. */ () => {
      shell.Insert("one");
      shell.SplitNode();
      shell.Insert("two");
      const lr = new SvxLRSpaceItem(10043);
      lr.SetAutoFirst(true);
      session.view.Execute(".uno:LeftRightParaMargin", [lr]);
      session.view.Execute(".uno:ULSpacing", [new SvxULSpaceItem(100, 200, 10042, true)]);
      const [one, two] = shell.GetDoc().paragraphs;
      if (one === undefined || two === undefined) throw new Error("Expected selected text nodes");
      shell.SetPaM(new SwPosition(two, 3), new SwPosition(one, 0));
    },
  );
  expect(sidebar.getByRole("spinbutton", { name: "Before Text Indent" })).toHaveValue("");
  expect(sidebar.getByRole("spinbutton", { name: "Above Paragraph Spacing" })).toHaveValue("");
  fireEvent.change(sidebar.getByRole("spinbutton", { name: "Before Text Indent" }), {
    target: { value: "1 cm" },
  });
  fireEvent.change(sidebar.getByRole("spinbutton", { name: "Above Paragraph Spacing" }), {
    target: { value: "1 cm" },
  });
  const lr = session.view.QueryState(".uno:LeftRightParaMargin").value as SvxLRSpaceItem,
    ul = session.view.QueryState(".uno:ULSpacing").value as SvxULSpaceItem;
  expect([
    lr.ResolveTextLeft(),
    lr.ResolveRight(),
    lr.ResolveTextFirstLineOffset(),
    lr.IsAutoFirst(),
    ul.GetUpper(),
    ul.GetLower(),
    ul.GetContext(),
  ]).toEqual([567, 0, 0, false, 567, 0, false]);
  act(
    /** Restores original mixed spacing and invalidates the actual widgets. @returns Nothing. */ () => {
      shell.Undo();
    },
  );
  expect(sidebar.getByRole("spinbutton", { name: "Above Paragraph Spacing" })).toHaveValue("");
  fireEvent.change(sidebar.getByRole("spinbutton", { name: "Below Paragraph Spacing" }), {
    target: { value: "0.5 cm" },
  });
  const lowerEdit = session.view.QueryState(".uno:ULSpacing").value as SvxULSpaceItem;
  expect([lowerEdit.GetUpper(), lowerEdit.GetLower(), lowerEdit.GetContext()]).toEqual([
    0,
    283,
    false,
  ]);
});

it("mounts the native Table context after Paragraph and dispatches its insertion,selection and properties slots", /** Checks actual table ownership and source toolbar composition. @returns Nothing. */ () => {
  const { sidebar } = mount();
  act(
    /** Opens the actual native insert-table command. @returns Nothing. */ () => {
      session.view.Execute(".uno:InsertTable");
    },
  );
  fireEvent.click(
    within(screen.getByRole("dialog", { name: "Insert Table" })).getByRole("button", {
      name: "Insert",
    }),
  );
  const panel = within(sidebar.getByRole("region", { name: "Table" })),
    table = session.docShell.GetDoc().GetTables()[0];
  if (table === undefined) throw new Error("Missing actual inserted table");
  const rows = table.GetTabLines().length,
    columns = table.GetTabLines()[0]?.GetTabBoxes().length;
  if (columns === undefined) throw new Error("Missing inserted columns");
  const execute = vi.spyOn(session.view.GetViewFrame().GetDispatcher(), "Execute");
  for (const command of [
    ".uno:InsertRowsBefore",
    ".uno:InsertRowsAfter",
    ".uno:InsertColumnsBefore",
    ".uno:InsertColumnsAfter",
    ".uno:EntireCell",
    ".uno:EntireRow",
    ".uno:EntireColumn",
    ".uno:SelectTable",
  ]) {
    fireEvent.click(panel.getByRole("button", { name: getWriterCommandResource(command).label }));
    expect(execute).toHaveBeenLastCalledWith(command, undefined);
  }
  expect(table.GetTabLines()).toHaveLength(rows + 2);
  expect(table.GetTabLines()[0]?.GetTabBoxes()).toHaveLength(columns + 2);
  fireEvent.change(sidebar.getByRole("spinbutton", { name: "Before Text Indent" }), {
    target: { value: "1 cm" },
  });
  const spacing = sidebar.getByRole("spinbutton", { name: "Above Paragraph Spacing" });
  expect(spacing).toBeEnabled();
  fireEvent.change(spacing, { target: { value: "0.2 cm" } });

  for (const line of table.GetTabLines())
    for (const box of line.GetTabBoxes())
      for (const paragraph of box.GetParagraphs())
        expect(
          (paragraph.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft(),
        ).toBe(567);

  for (const line of table.GetTabLines())
    for (const box of line.GetTabBoxes())
      for (const paragraph of box.GetParagraphs())
        expect((paragraph.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(113);
  const title = sidebar.getByRole("button", { name: "Table" });
  title.focus();
  fireEvent.keyDown(title, { key: "Enter" });
  expect(
    panel.getByRole("button", { name: getWriterCommandResource(".uno:InsertRowsBefore").label }),
  ).toHaveFocus();
  fireEvent.click(
    panel.getByRole("button", { name: getWriterCommandResource(".uno:TableDialog").label }),
  );
  expect(screen.getByRole("dialog", { name: "Table Properties" })).toBeVisible();
  fireEvent.click(
    within(screen.getByRole("dialog", { name: "Table Properties" })).getByRole("button", {
      name: "Cancel",
    }),
  );
});

it("disables controls without an active shell and keeps actual custom style names", /** Checks genuine unavailable-frame binding state rather than fabricated enabled controls. @returns Nothing. */ () => {
  session = createWriterDocumentSession();
  session.docShell
    .GetDoc()
    .MakeTextFormatColl(
      "Owned custom style",
      session.docShell.GetDoc().GetDfltTextFormatColl(),
      "owned-custom",
    );
  const frame = new SfxViewFrame(new BrowserSfxDispatcher()),
    source = createBrowserCommandSource(frame);
  render(
    <WriterPropertiesPanel
      commandSource={source}
      resolveArguments={/** Supplies no browser arguments. @returns Undefined. */ () => undefined}
      unit={FieldUnit.CM}
      paragraphStyleOptions={session.viewStore.GetSnapshot().paragraphStyleOptions}
      embeddedFontFamilies={[]}
      fontAvailability={{}}
      isTable={false}
    />,
  );
  expect(screen.getByRole("combobox", { name: "Paragraph style" })).toBeDisabled();
  expect(screen.getByRole("combobox", { name: "Paragraph style" })).toHaveValue("");
  expect(session.viewStore.GetSnapshot().paragraphStyleOptions).toContainEqual({
    id: "owned-custom",
    name: "Owned custom style",
  });
  expect(screen.getByRole("combobox", { name: "Font name" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
});

it("creates from editable sidebar names, updates the real owner and opens native naming from its toolbar", /** Checks actual UI/core/dialog wiring and once-only dispatch. @returns Completion. */ async () => {
  const { sidebar, shell } = mount();
  const input = sidebar.getByRole("combobox", { name: "Paragraph style" });
  fireEvent.change(sidebar.getByRole("spinbutton", { name: "Before Text Indent" }), {
    target: { value: "1 cm" },
  });
  const execute = vi.spyOn(session.frame.GetDispatcher(), "Execute");
  fireEvent.change(input, { target: { value: "UI: & 字" } });
  expect(session.docShell.GetDoc().FindTextFormatCollByName("UI: & 字")).toBeUndefined();
  fireEvent.keyDown(input, { key: "Enter" });
  const collection = shell.GetActiveParagraph().GetTextFormatColl();
  expect(collection.GetName()).toBe("UI: & 字");
  expect(execute).toHaveBeenCalledWith(".uno:StyleNewByExample", { Param: "UI: & 字", Family: 2 });
  fireEvent.change(sidebar.getByRole("spinbutton", { name: "Before Text Indent" }), {
    target: { value: "2 cm" },
  });
  fireEvent.click(sidebar.getByRole("button", { name: "Update" }));
  expect(
    (collection.GetAttrSet().Get(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft(),
  ).toBe(1134);
  fireEvent.click(sidebar.getByRole("button", { name: "New Style from Selection" }));
  const dialog = screen.getByRole("dialog", { name: "New Style from Selection" });
  fireEvent.change(within(dialog).getByRole("textbox", { name: "Style name" }), {
    target: { value: "Named through dialog" },
  });
  await act(
    /** Completes the original asynchronous request. @returns Nothing. */
    async () => {
      fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    },
  );
  expect(shell.GetActiveParagraph().GetTextFormatColl().GetName()).toBe("Named through dialog");
  expect(sidebar.getByRole("button", { name: "Clone Formatting" })).toBeDisabled();
});

it("applies unseen builtin names from the complete pool and keeps source naming cancellation independent", /** Checks native full-pool lookup and original presenter cancel/header routes. @returns Completion. */ async () => {
  const { sidebar, shell } = mount();
  const toolbar = within(screen.getByRole("toolbar", { name: "Writer formatting toolbar" }));
  const input = toolbar.getByRole("combobox", { name: "Paragraph style" });
  fireEvent.change(input, { target: { value: "Heading 5" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("heading-5");
  const sidebarInput = sidebar.getByRole("combobox", { name: "Paragraph style" });
  fireEvent.change(sidebarInput, { target: { value: "Heading 6" } });
  fireEvent.keyDown(sidebarInput, { key: "Enter" });
  expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("heading-6");
  for (const action of ["Cancel", "Close"]) {
    fireEvent.click(sidebar.getByRole("button", { name: "New Style from Selection" }));
    await act(
      /** Cancels the actual native asynchronous request. @returns Nothing. */
      async () => {
        fireEvent.click(
          within(screen.getByRole("dialog", { name: "New Style from Selection" })).getByRole(
            "button",
            { name: action },
          ),
        );
      },
    );
  }
  expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("heading-6");
  fireEvent.change(input, { target: { value: "Toolbar native name" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(shell.GetActiveParagraph().GetTextFormatColl().GetName()).toBe("Toolbar native name");
});

it("returns Style title cancellation to its actual document client", /** Checks the native panel header focus port after editable-box cancellation. @returns Nothing. */ () => {
  const { sidebar } = mount();
  const title = sidebar.getByRole("button", { name: "Style", expanded: true });
  title.focus();
  fireEvent.keyDown(title, { key: "Escape" });
  expect(screen.getByLabelText("Writer document body")).toHaveFocus();
});
