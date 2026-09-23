/** @fileoverview Verifies accessible Writer Open and Export dialog states. */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it, vi } from "vitest";

import { createDocument } from "../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../source/core/doc/doc";
import { SwDocShell } from "../../source/uibase/app/docsh";
import { IndexedDbWriterOdtStore, type WriterOdtStore } from "../storage/writer-odt-store";
import type { WriterSessionServices } from "../workflows/writer-workflows";
import { WriterFileDialog } from "./WriterFileDialog";

/** Creates a Writer shell for dialog behavior. @returns Active shell. */
function shell(): SwDocShell {
  return new SwDocShell(
    createWriterDocument(),
    createDocument({ id: "dialog-document", suiteId: "writer", title: "Draft" }),
  );
}

/** Creates browser ports with an optional ODT store. @param store - Browser ODT store. @param exported - Export spy. @returns Browser services. */
function services(store?: WriterOdtStore, exported = vi.fn()): WriterSessionServices {
  return {
    copyRichText: /** Unused clipboard port. @returns Completion. */ async () => undefined,
    createDownloadFilename:
      /** Adds the requested extension. @param title - Base title. @param extension - File extension. @returns Download name. */ (
        title,
        extension,
      ) => `${title}${extension}`,
    documentExport: { export: exported },
    documentOpen: { open: /** Unused file port. @returns No file. */ async () => undefined },
    readRichClipboard: /** Unused clipboard read. @returns Clipboard payload. */ async () => ({
      html: "",
      plainText: "",
    }),
    ...(store === undefined ? {} : { odtStore: store }),
  };
}

describe("WriterFileDialog", /** Registers file dialog interaction tests. @returns Nothing. */ () => {
  it("shows keyboard-accessible source tabs and the computer drop zone", /** Checks visual and semantic source selection. @returns Nothing. */ async () => {
    const documentShell = shell();
    const store = {
      list: /** Returns an empty browser list. @returns Empty list. */ async () => [],
    } as unknown as WriterOdtStore;
    const close = vi.fn();
    render(
      <WriterFileDialog
        docShell={documentShell}
        kind="open"
        onClose={close}
        services={services(store)}
      />,
    );
    const browserTab = screen.getByRole("tab", { name: "In browser" });
    const computerTab = screen.getByRole("tab", { name: "On computer" });
    expect(browserTab).toHaveAttribute("aria-selected", "true");
    expect(browserTab).toHaveClass("border-indigo-600");
    await waitFor(
      /** Waits for the browser empty state. @returns Nothing. */ () =>
        expect(screen.getByText("No saved documents yet")).toBeVisible(),
    );
    fireEvent.keyDown(browserTab, { key: "ArrowRight" });
    expect(computerTab).toHaveAttribute("aria-selected", "true");
    expect(computerTab).toHaveFocus();
    const panel = screen.getByRole("tabpanel", { name: "On computer" });
    expect(screen.getByText("ODT and TXT files are supported")).toBeVisible();
    fireEvent.dragEnter(panel);
    expect(panel).toHaveClass("border-indigo-500");
    fireEvent.dragLeave(panel);
    expect(panel).toHaveClass("border-slate-300");
    fireEvent.drop(panel, { dataTransfer: { files: [] } });
    fireEvent.change(screen.getByLabelText("Browse"), { target: { files: [] } });
    fireEvent.keyDown(computerTab, { key: "Home" });
    expect(browserTab).toHaveFocus();
    fireEvent.keyDown(browserTab, { key: "Tab" });
    expect(browserTab).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Open" }), { key: "Escape" });
    expect(close).toHaveBeenCalledTimes(1);
    documentShell.Close();
  });

  it("shows storage and unsupported file errors without closing", /** Checks recoverable Open errors. @returns Completion. */ async () => {
    const documentShell = shell();
    const close = vi.fn();
    render(
      <WriterFileDialog
        docShell={documentShell}
        kind="open"
        onClose={close}
        services={services()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Browser storage is unavailable.");
    fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
    fireEvent.change(screen.getByLabelText("Browse"), {
      target: { files: [new File(["bad"], "unsupported.docx")] },
    });
    await waitFor(
      /** Waits for the file validation error. @returns Nothing. */ () =>
        expect(screen.getByRole("alert")).toHaveTextContent("Choose an ODT or TXT file."),
    );
    expect(close).not.toHaveBeenCalled();
    documentShell.Close();
  });

  it("refuses Save As for an empty document", /** Checks empty-document rule through the dialog. @returns Completion. */ async () => {
    const documentShell = shell();
    const store = {
      saveAs: vi.fn(),
    } as unknown as WriterOdtStore;
    const close = vi.fn();
    render(
      <WriterFileDialog
        docShell={documentShell}
        kind="save-as"
        onClose={close}
        services={services(store)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save copy" }));
    await waitFor(
      /** Waits for the refusal message. @returns Nothing. */ () =>
        expect(screen.getByRole("alert")).toHaveTextContent("Empty documents cannot be saved."),
    );
    expect(store.saveAs).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
    documentShell.Close();
  });

  it("exports TXT through a format card", /** Checks visible format labels and download payload. @returns Completion. */ async () => {
    const documentShell = shell();
    documentShell.GetDoc().paragraphs[0]?.SetText("Plain body");
    const exported = vi.fn();
    const close = vi.fn();
    render(
      <WriterFileDialog
        docShell={documentShell}
        kind="export"
        onClose={close}
        services={services(undefined, exported)}
      />,
    );
    expect(screen.getByRole("button", { name: "Download ODT" })).toHaveTextContent("ODT");
    expect(screen.getByRole("button", { name: "Download TXT" })).toHaveTextContent("TXT");
    fireEvent.click(screen.getByRole("button", { name: "Download TXT" }));
    await waitFor(
      /** Waits for the browser export. @returns Nothing. */ () =>
        expect(exported).toHaveBeenCalledWith({
          data: "Plain body",
          mediaType: "text/plain;charset=utf-8",
          name: "Draft.txt",
        }),
    );
    expect(close).toHaveBeenCalledTimes(1);
    documentShell.Close();
  });

  it("reports list failures and allows switching between source tabs", /** Checks recoverable browser-list errors. @returns Completion. */ async () => {
    const documentShell = shell();
    const store = {
      list: /** Simulates unavailable browser storage. @returns Rejection. */ async () => {
        throw "IndexedDB denied";
      },
    } as unknown as WriterOdtStore;
    render(
      <WriterFileDialog
        docShell={documentShell}
        kind="open"
        onClose={vi.fn()}
        services={services(store)}
      />,
    );
    await waitFor(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        expect(screen.getByRole("alert")).toHaveTextContent("IndexedDB denied"),
    );
    fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
    fireEvent.click(screen.getByRole("tab", { name: "In browser" }));
    expect(screen.getByRole("tab", { name: "In browser" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    documentShell.Close();
  });

  it("imports a dropped TXT file into browser storage before closing", /** Checks drag import and immediate persistence. @returns Completion. */ async () => {
    const documentShell = shell();
    const store = new IndexedDbWriterOdtStore("dialog-drop-import", new IDBFactory());
    const close = vi.fn();
    render(
      <WriterFileDialog
        docShell={documentShell}
        kind="open"
        onClose={close}
        services={services(store)}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
    const panel = screen.getByRole("tabpanel", { name: "On computer" });
    fireEvent.dragOver(panel);
    fireEvent.drop(panel, {
      dataTransfer: { files: [new File(["Dropped text"], "Dropped.txt")] },
    });
    await waitFor(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        expect(close).toHaveBeenCalledTimes(1),
    );
    expect(
      (await store.list()).map(
        /** Runs the focused test callback. @param item - Input for this operation. @returns Operation result. */ (
          item,
        ) => item.title,
      ),
    ).toEqual(["Dropped"]);
    documentShell.Close();
  });

  it("reports missing storage from Save As", /** Checks a failed copy leaves the dialog open. @returns Completion. */ async () => {
    const documentShell = shell();
    const close = vi.fn();
    render(
      <WriterFileDialog
        docShell={documentShell}
        kind="save-as"
        onClose={close}
        services={services()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save copy" }));
    await waitFor(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        expect(screen.getByRole("alert")).toHaveTextContent("Browser storage is unavailable."),
    );
    expect(close).not.toHaveBeenCalled();
    documentShell.Close();
  });

  it("reports missing storage before importing a supported file", /** Checks failed imports do not replace the live document. @returns Completion. */ async () => {
    const documentShell = shell();
    render(
      <WriterFileDialog
        docShell={documentShell}
        kind="open"
        onClose={vi.fn()}
        services={services()}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
    fireEvent.change(screen.getByLabelText("Browse"), {
      target: { files: [new File(["Body"], "notes.txt")] },
    });
    await waitFor(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        expect(screen.getByRole("alert")).toHaveTextContent("Browser storage is unavailable."),
    );
    expect(documentShell.GetTitle()).toBe("Draft");
    documentShell.Close();
  });

  it("handles an Open dialog whose storage disappears after listing", /** Checks stale list failures. @returns Completion. */ async () => {
    const documentShell = shell();
    const store = {
      list: /** Runs the focused test callback. @returns Operation result. */ async () => [
        { bytes: new Uint8Array([1]), id: "old", title: "Old", version: 1 },
      ],
    } as unknown as WriterOdtStore;
    const close = vi.fn();
    const opened = render(
      <WriterFileDialog
        docShell={documentShell}
        kind="open"
        onClose={close}
        services={services(store)}
      />,
    );
    await waitFor(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        expect(screen.getByRole("button", { name: "Old" })).toBeVisible(),
    );
    opened.rerender(
      <WriterFileDialog
        docShell={documentShell}
        kind="open"
        onClose={close}
        services={services()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Old" }));
    await waitFor(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        expect(screen.getByRole("alert")).toHaveTextContent("Browser storage is unavailable."),
    );
    expect(close).not.toHaveBeenCalled();
    documentShell.Close();
  });
});
