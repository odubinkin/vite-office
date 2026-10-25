/** @fileoverview Checks live document-owned style population, dispatch and history through actual Sfx bindings. */
import type { StylePreviewSource } from "../../../svx/browser/tbxctrls/style-preview-state";
import { useWriterStylePreviews } from "./use-writer-style-previews";
import { MapUnit } from "../../../tools/inc/mapunit";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { SvxFontItem } from "../../../editeng/inc/fontitem";
import { isValidElement, useSyncExternalStore } from "react";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BrowserSfxDispatcher } from "../../../framework/browser/dispatch/browser-dispatcher";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { BrowserLocalizationProvider } from "../../../framework/browser/localization/BrowserLocalizationProvider";
import { BrowserLocalizationService } from "../../../framework/browser/localization/browser-localization";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { SfxViewFrame } from "../../../sfx2/source/view/viewfrm";
import { SwDoc } from "../../source/core/doc/doc";
import { SwTextNode } from "../../source/core/txtnode/ndtxt";
import { SwDocShell } from "../../source/uibase/app/docsh";
import { SwView } from "../../source/uibase/uiview/view";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { WriterFormattingToolbar } from "./WriterFormattingToolbar";
import { WriterViewStore } from "./writer-view-projection";

/** Requires fixture ownership. @param value - Fixture. @returns Defined value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing fixture");
  return value;
}

afterEach(/** Releases browser presentation trees. @returns Nothing. */ () => cleanup());

/** Builds actual Writer/frame owners. @param document - Current graph. @param argumentsValue - Optional formatting arguments. @returns Attached controls and cleanup. */
function attach(document = new SwDoc(), argumentsValue?: unknown) {
  const metadata = createDocument({ id: "selector", suiteId: "writer", title: "Selector" });
  const shell = new SwDocShell(document, metadata),
    view = new SwView(shell);
  const frame = new SfxViewFrame<SwView>(new BrowserSfxDispatcher());
  view.AttachFrame(frame);
  frame.SetActiveView(view, [
    shell.GetCommandShell(),
    view.GetCommandShell(),
    view.GetWrtShell().GetCommandShell(),
  ]);
  const store = new WriterViewStore(view),
    source = createBrowserCommandSource(frame);
  /** Reads snapshots through the actual store subscription. @returns Toolbar. */
  function Toolbar() {
    const projection = useSyncExternalStore(store.Subscribe, store.GetSnapshot);
    return (
      <WriterFormattingToolbar
        unit={FieldUnit.CM}
        commandSource={source}
        paragraphStyleOptions={projection.paragraphStyleOptions}
        paragraphStyleNames={projection.paragraphStyleNames}
        resolveArguments={
          /** Supplies the requested presentation-owned arguments. @returns Arguments. */ () =>
            argumentsValue
        }
      />
    );
  }
  return {
    document,
    metadata,
    shell,
    view,
    frame,
    store,
    source,
    Toolbar,
    close: /** Releases attached owners. @returns Nothing. */ () => {
      cleanup();
      store.Close();
      view.Close();
      shell.Close();
    },
  };
}

describe("Writer live style selector", /** Defines actual document contracts. @returns Nothing. */ () => {
  it.each([undefined, null, { fontFamily: "Overridden", fontSizePt: 10 }])(
    "merges font selections with optional formatting arguments (%s)",
    /** Checks toolbar fallback and override payloads reach actual shell commands. @param value - Base arguments. @returns Nothing. */ (
      value,
    ) => {
      const owner = attach(new SwDoc(), value);
      const execute = vi.spyOn(owner.source, "Execute");
      try {
        render(<owner.Toolbar />);
        const font = screen.getByRole("combobox", { name: "Font name" });
        const size = screen.getByRole("combobox", { name: "Font size" });
        fireEvent.change(font, { target: { value: "Liberation Serif" } });
        fireEvent.keyDown(font, { key: "Enter" });
        fireEvent.change(size, { target: { value: "14" } });
        fireEvent.keyDown(size, { key: "Enter" });
        expect(execute).toHaveBeenCalledWith(".uno:CharFontName", {
          ...(value ?? {}),
          fontFamily: new SvxFontItem(0, "Liberation Serif", "", 0, 0, 10007),
        });
        expect(execute).toHaveBeenCalledWith(".uno:FontHeight", {
          ...(value ?? {}),
          fontSizePt: 14,
        });
      } finally {
        execute.mockRestore();
        owner.close();
      }
    },
  );
  it("projects ten native defaults and actual used/custom owners without materializing styles", /** Checks independent literal population and regular-node usage. @returns Nothing. */ () => {
    const document = new SwDoc();
    const parent = document.MakeTextFormatColl(
      "Used ancestor",
      document.GetDfltTextFormatColl(),
      "ancestor",
    );
    const child = document.MakeTextFormatColl("Used child", parent, "child");
    const unused = document.MakeTextFormatColl("Unused custom", undefined, "unused");
    required(document.paragraphs[0]).ChgFormatColl(child);
    const owner = attach(document),
      before = document.GetTextFormatColls().slice();
    const snapshot = owner.store.GetSnapshot();
    expect(
      snapshot.paragraphStyleOptions.map(
        /** Reads stable names. @param entry - Entry. @returns Name. */ (entry) => entry.name,
      ),
    ).toEqual([
      "Default Paragraph Style",
      "Text body",
      "Title",
      "Subtitle",
      "Heading 1",
      "Heading 2",
      "Heading 3",
      "Heading 4",
      "Quotations",
      "Preformatted Text",
      "Used ancestor",
      "Used child",
      "Unused custom",
    ]);
    expect(document.GetTextFormatColls()).toEqual(before);
    expect(document.IsUsed(parent)).toBe(true);
    expect(document.IsUsed(child)).toBe(true);
    expect(document.IsUsed(unused)).toBe(false);
    expect(document.IsUsed(new SwDoc().GetDfltTextFormatColl())).toBe(false);
    const detached = new SwTextNode(
      document.GetNodes(),
      required(document.paragraphs[0]).StartOfSectionNode(),
      unused,
    );
    document.GetUndoManager().GetUndoNodes().RetainNode(detached);
    expect(document.IsUsed(unused)).toBe(false);
    const table = document.GetNodes().MakeTableNode("Table");
    const row = document.GetNodes().AppendTableRow(table, 1);
    required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]).ChgFormatColl(
      document.GetTextFormatColl("table-contents"),
    );
    expect(document.IsUsed(document.GetTextFormatColl("table-contents"))).toBe(true);
    expect(owner.store.GetSnapshot().paragraphStyleOptions).toContainEqual({
      id: "table-contents",
      name: "Table Contents",
    });
    expect(snapshot.paragraphStyleOptions).not.toBe(
      owner.store.GetSnapshot().paragraphStyleOptions,
    );
    owner.close();
  });
  it("shows custom names, dispatches their native identity, and records native repeat history", /** Checks actual StyleApply command and model history. @returns Nothing. */ () => {
    const document = new SwDoc();
    document.MakeTextFormatColl("Owned: & <字>", document.GetDfltTextFormatColl(), "custom-id");
    const owner = attach(document),
      execute = vi.spyOn(owner.source, "Execute");
    const untouched = document.GetNodes().MakeTextNode("Untouched");
    render(<owner.Toolbar />);
    const select = screen.getByRole("combobox", { name: "Paragraph style" });
    expect(select.querySelectorAll("optgroup")).toHaveLength(0);
    fireEvent.change(select, { target: { value: "Owned: & <字>" } });
    fireEvent.keyDown(select, { key: "Enter" });
    expect(execute).toHaveBeenLastCalledWith(".uno:StyleApply", {
      Style: "Owned: & <字>",
      FamilyName: "ParagraphStyles",
    });
    expect(select).toHaveValue("Owned: & <字>");
    expect(required(document.paragraphs[0]).GetTextFormatColl().GetName()).toBe("Owned: & <字>");
    const history = document.GetUndoManager().GetUndoActionCount();
    fireEvent.change(select, { target: { value: "Owned: & <字>" } });
    fireEvent.keyDown(select, { key: "Enter" });
    expect(document.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
    act(
      /** Undoes the repeated request and then the applied style. @returns Nothing. */ () => {
        owner.source.Execute(WRITER_COMMAND_IDS.undo);
        expect(select).toHaveValue("Owned: & <字>");
        owner.source.Execute(WRITER_COMMAND_IDS.undo);
      },
    );
    expect(select).toHaveValue("Default Paragraph Style");
    act(
      /** Redoes the applied style. @returns Nothing. */ () => {
        owner.source.Execute(WRITER_COMMAND_IDS.redo);
      },
    );
    expect(select).toHaveValue("Owned: & <字>");
    expect(untouched.GetParagraphStyle()).toBe("default");
    act(
      /** Renames the actual active owner. @returns Nothing. */ () => {
        required(document.FindTextFormatColl("custom-id")).SetFormatName("Renamed: & 字", true);
      },
    );
    expect(select).toHaveValue("Renamed: & 字");
    fireEvent.click(screen.getByRole("button", { name: "Show Paragraph style" }));
    expect(screen.getByRole("option", { name: "Renamed: & 字" })).toBeVisible();
    const second = new SwDoc();
    second.MakeTextFormatColl("New document style", undefined, "second");
    act(
      /** Replaces the actual graph. @returns Nothing. */ () => {
        owner.shell.ReplaceDocument(second, owner.metadata, {
          kind: "untitled",
          name: "replacement.odt",
        });
      },
    );
    expect(select).toHaveValue("Default Paragraph Style");
    expect(screen.queryByRole("option", { name: "Renamed: & 字" })).toBeNull();
    if (screen.queryByRole("option", { name: "New document style" }) === null)
      fireEvent.click(screen.getByRole("button", { name: "Show Paragraph style" }));
    expect(screen.getByRole("option", { name: "New document style" })).toBeVisible();
    act(/** Removes active command shells. @returns Nothing. */ () => owner.frame.CloseView());
    expect(select).toBeDisabled();
    expect(select).toHaveValue("");
    owner.close();
  });
  it("localizes unchanged builtins while keeping actual renamed and newly registered names", /** Checks localized display independently from native dispatch. @returns Nothing. */ () => {
    const owner = attach();
    const resource = ".uno:StyleApply?Style:string=Heading%201&FamilyName:string=ParagraphStyles";
    render(
      <BrowserLocalizationProvider
        service={
          new BrowserLocalizationService("ru-RU", {
            "ru-RU": { [`writer.command.${resource}.label`]: "Заголовок 1" },
          })
        }
      >
        <owner.Toolbar />
      </BrowserLocalizationProvider>,
    );
    const select = screen.getByRole("combobox", { name: "Paragraph style" });
    fireEvent.click(screen.getByRole("button", { name: "Show Paragraph style" }));
    expect(screen.getByRole("option", { name: "Заголовок 1" })).toBeVisible();
    fireEvent.change(select, { target: { value: "Заголовок 1" } });
    fireEvent.keyDown(select, { key: "Enter" });
    expect(required(owner.document.paragraphs[0]).GetParagraphStyle()).toBe("heading-1");
    act(
      /** Renames a builtin and registers a live custom style. @returns Nothing. */ () => {
        owner.document.GetTextFormatColl("heading-1").SetFormatName("Owned heading");
        owner.document.MakeTextFormatColl("Unused:新", undefined, "new");
      },
    );
    expect(screen.queryByRole("option", { name: "Заголовок 1" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show Paragraph style" }));
    expect(screen.getByRole("option", { name: "Owned heading" })).toBeVisible();
    expect(screen.getByRole("option", { name: "Unused:新" })).toBeVisible();
    fireEvent.change(select, { target: { value: "Unused:新" } });
    fireEvent.keyDown(select, { key: "Enter" });
    fireEvent.change(select, { target: { value: "Owned heading" } });
    fireEvent.keyDown(select, { key: "Enter" });
    expect(required(owner.document.paragraphs[0]).GetTextFormatColl().GetName()).toBe(
      "Owned heading",
    );
    owner.close();
  });
});

it("retains an editable style draft across unrelated native binding invalidation", /** Actual pool rows and owner identity are unchanged by a caret/state refresh. @returns Nothing. */ () => {
  const f = attach();
  try {
    render(<f.Toolbar />);
    const input = screen.getByRole("combobox", { name: "Paragraph style" });
    const before = f.store.GetSnapshot().paragraphStyleOptions;
    fireEvent.change(input, { target: { value: "Draft custom name" } });
    act(
      /** Publishes an unrelated native state refresh. @returns Nothing. */ () => {
        f.frame.GetBindings().Invalidate("selection");
      },
    );
    expect(f.store.GetSnapshot().paragraphStyleOptions).toBe(before);
    expect(input).toHaveValue("Draft custom name");
  } finally {
    f.close();
  }
});

it("reads actual shell style items for localized,custom,missing and closed preview owners", /** Checks the actual shared toolbar/sidebar preview contract without mounting an invented style pool. @returns Nothing. */ () => {
  const f = attach();
  try {
    const entries = f.store.GetSnapshot().paragraphStyleOptions;
    const hook = renderHook(
      /** Binds the real owning shell. @returns Preview ports. */ () =>
        useWriterStylePreviews(
          f.shell,
          entries,
          /** Localizes only resource-backed entries. @param id - Actual resource identity. @returns Label. */ (
            id,
          ) => ({ label: id }),
        ),
    );
    const builtin = entries[0];
    if (builtin === undefined) throw new Error("Style fixture is missing.");
    const renderItem = hook.result.current.renderItem;
    if (renderItem === undefined) throw new Error("Style preview renderer is missing.");
    const builtinRow = renderItem(builtin, false),
      customRow = renderItem({ id: "unknown-style", name: "Custom name" }, true);
    if (
      !isValidElement<{ source: StylePreviewSource; name: string }>(builtinRow) ||
      !isValidElement<{ source: StylePreviewSource; name: string }>(customRow)
    )
      throw new Error("Preview row is missing.");
    expect(builtinRow.props.source.mapUnit).toBe(MapUnit.MapTwip);
    expect(builtinRow.props.source.getItemSet()).toBeDefined();
    expect(customRow.props.name).toBe("Custom name");
    expect(customRow.props.source.getItemSet()).toBeDefined();
    act(
      /** Publishes actual measured host extents. @returns Nothing. */ () =>
        builtinRow.props.source.controller.ReportWidth(builtin.id, 321),
    );
    expect(hook.result.current.popupWidth).toBe(321);
    f.shell.Close();
    expect(builtinRow.props.source.getItemSet()).toBeUndefined();
    hook.unmount();
  } finally {
    f.close();
  }
});
