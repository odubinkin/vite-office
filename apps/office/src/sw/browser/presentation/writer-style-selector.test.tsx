/** @fileoverview Checks live document-owned style population, dispatch and history through actual Sfx bindings. */
import { useSyncExternalStore } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
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

/** Builds actual Writer/frame owners. @param document - Current graph. @returns Attached controls and cleanup. */
function attach(document = new SwDoc()) {
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
        commandSource={source}
        paragraphStyleOptions={projection.paragraphStyleOptions}
        resolveArguments={
          /** No presentation-owned command arguments. @returns Undefined. */ () => undefined
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
  it("shows custom names, dispatches their native identity, and updates history without a no-op entry", /** Checks actual StyleApply command and model history. @returns Nothing. */ () => {
    const document = new SwDoc();
    document.MakeTextFormatColl("Owned: & <字>", document.GetDfltTextFormatColl(), "custom-id");
    const owner = attach(document),
      execute = vi.spyOn(owner.source, "Execute");
    const untouched = document.GetNodes().MakeTextNode("Untouched");
    render(<owner.Toolbar />);
    const select = screen.getByRole("combobox", { name: "Paragraph style" });
    expect(select.querySelectorAll("optgroup")).toHaveLength(0);
    fireEvent.change(select, { target: { value: "custom-id" } });
    expect(execute).toHaveBeenLastCalledWith(".uno:StyleApply", {
      Style: "Owned: & <字>",
      FamilyName: "ParagraphStyles",
    });
    expect(select).toHaveValue("custom-id");
    expect(required(document.paragraphs[0]).GetTextFormatColl().GetName()).toBe("Owned: & <字>");
    const history = document.GetUndoManager().GetUndoActionCount();
    fireEvent.change(select, { target: { value: "custom-id" } });
    expect(document.GetUndoManager().GetUndoActionCount()).toBe(history);
    act(
      /** Undoes the applied style. @returns Nothing. */ () => {
        owner.source.Execute(WRITER_COMMAND_IDS.undo);
      },
    );
    expect(select).toHaveValue("default");
    act(
      /** Redoes the applied style. @returns Nothing. */ () => {
        owner.source.Execute(WRITER_COMMAND_IDS.redo);
      },
    );
    expect(select).toHaveValue("custom-id");
    expect(untouched.GetParagraphStyle()).toBe("default");
    act(
      /** Renames the actual active owner. @returns Nothing. */ () => {
        required(document.FindTextFormatColl("custom-id")).SetFormatName("Renamed: & 字");
      },
    );
    expect(select).toHaveValue("custom-id");
    expect(screen.getByRole("option", { name: "Renamed: & 字" })).toHaveValue("custom-id");
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
    expect(select).toHaveValue("default");
    expect(screen.queryByRole("option", { name: "Renamed: & 字" })).toBeNull();
    expect(screen.getByRole("option", { name: "New document style" })).toHaveValue("second");
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
    expect(screen.getByRole("option", { name: "Заголовок 1" })).toHaveValue("heading-1");
    fireEvent.change(select, { target: { value: "heading-1" } });
    expect(required(owner.document.paragraphs[0]).GetParagraphStyle()).toBe("heading-1");
    act(
      /** Renames a builtin and registers a live custom style. @returns Nothing. */ () => {
        owner.document.GetTextFormatColl("heading-1").SetFormatName("Owned heading");
        owner.document.MakeTextFormatColl("Unused:新", undefined, "new");
      },
    );
    expect(screen.queryByRole("option", { name: "Заголовок 1" })).toBeNull();
    expect(screen.getByRole("option", { name: "Owned heading" })).toHaveValue("heading-1");
    expect(screen.getByRole("option", { name: "Unused:新" })).toHaveValue("new");
    fireEvent.change(select, { target: { value: "new" } });
    fireEvent.change(select, { target: { value: "heading-1" } });
    expect(required(owner.document.paragraphs[0]).GetTextFormatColl().GetName()).toBe(
      "Owned heading",
    );
    owner.close();
  });
});
