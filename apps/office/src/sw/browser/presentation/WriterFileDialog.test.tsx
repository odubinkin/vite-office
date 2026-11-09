/** @fileoverview Verifies accessible Writer Open and Export dialog states. */

import { readFileSync } from "node:fs";
import {
  ICULanguageBreakFactory,
  type WordDictionaryName,
} from "../../../external/icu/source/common/brkeng";
import { DICTIONARY_WORD } from "../../../offapi/com/sun/star/i18n/WordType";
import { g_pBreakIt } from "../../source/core/bastyp/breakit";
import { prepareWriterWordDictionaries } from "../filter/word-dictionaries";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { assert, describe, expect, it, vi } from "vitest";

import { createDocument } from "../../../sfx2/source/doc/objsh";
import { createWriterDocument, SwDoc } from "../../source/core/doc/doc";
import type { SvxBrushItem } from "../../../editeng/source/items/frmitems.brush";
import { SvxFrameDirection } from "../../../editeng/inc/frmdir";
import { RES_BACKGROUND } from "../../inc/hintids";
import { SwTableNode } from "../../source/core/docnode/node";
import { SwDocShell } from "../../source/uibase/app/docsh";
import { IndexedDbWriterOdtStore, type WriterOdtStore } from "../storage/writer-odt-store";
import type { WriterSessionServices } from "../workflows/writer-workflows";
import { openBrowserWriterDocument } from "../workflows/writer-odt-io";
import { WriterFileDialog } from "./WriterFileDialog";

/** Creates a Writer shell for dialog behavior. @param measure - Supplies the device used by native HTML tables. @returns Active shell. */
function shell(measure = false): SwDocShell {
  return new SwDocShell(
    measure
      ? new SwDoc({
          defaultFontDevice: {
            /** Uses the existing default. @returns No override. */
            getDefaultFont: () => undefined,
            /** Supplies deterministic measurements through the output-device interface. @param _font - Selected font. @param _text - Original input. @param _start - UTF16 range start. @param length - UTF16 range length. @returns Twip width. */
            measureTextWidth: (_font, _text, _start, length) => length * 30,
          },
        })
      : createWriterDocument(),
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
    expect(screen.getByText("ODT, TXT, RTF and Markdown files are supported")).toBeVisible();
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
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Choose an ODT, TXT, RTF or Markdown file.",
        ),
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

  it.each([
    { text: "Plain body", bytes: [80, 108, 97, 105, 110, 32, 98, 111, 100, 121, 10] },
    { text: "A😀\ud800BC", bytes: [65, 0xf0, 0x9f, 0x98, 0x80, 63, 67, 10] },
  ])(
    "exports TXT through a format card with native byte conversion: $text",
    /** Checks visible format labels and native download bytes. @param input - Text and source-contract byte expectation. @returns Completion. */ async ({
      text,
      bytes,
    }) => {
      const documentShell = shell();
      documentShell.GetDoc().paragraphs[0]?.SetText(text);
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
            data: Uint8Array.from(bytes),
            mediaType: "text/plain;charset=utf-8",
            name: "Draft.txt",
          }),
      );
      expect(close).toHaveBeenCalledTimes(1);
      documentShell.Close();
    },
  );

  it("exports native RTF bytes through the existing format dialog", /** Checks the shell-owned RTF output reaches the browser port. @returns Completion. */ async () => {
    const documentShell = shell();
    documentShell.GetDoc().paragraphs[0]?.SetText("RTF body");
    const exported = vi.fn();
    render(
      <WriterFileDialog
        docShell={documentShell}
        kind="export"
        onClose={vi.fn()}
        services={services(undefined, exported)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Download RTF" }));
    await waitFor(
      /** Waits for native RTF output. @returns Nothing. */ () =>
        expect(exported).toHaveBeenCalledOnce(),
    );
    const payload = exported.mock.calls[0]?.[0] as {
      data: Uint8Array;
      mediaType: string;
      name: string;
    };
    expect(ArrayBuffer.isView(payload.data)).toBe(true);
    expect([payload.mediaType, payload.name]).toEqual(["application/rtf", "Draft.rtf"]);
    expect(new TextDecoder().decode(payload.data)).toContain("RTF body");
    documentShell.Close();
  });

  it("imports RTF through the native shell and persists the browser identity", /** Checks the existing Open flow with RTF content. @returns Completion. */ async () => {
    const documentShell = shell();
    const store = new IndexedDbWriterOdtStore("dialog-rtf-import", new IDBFactory());
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
    fireEvent.change(screen.getByLabelText("Browse"), {
      target: { files: [new File(["{\\rtf1\\ansi Imported}"], "Imported.rtf")] },
    });
    await waitFor(
      /** Waits for completed import. @returns Nothing. */ () =>
        expect(close).toHaveBeenCalledOnce(),
    );
    expect(documentShell.GetDoc().paragraphs[0]?.GetText()).toBe("Imported");
    expect(
      (await store.list()).map(
        /** Checks imports RTF through the native shell and persists the browser identity. @param record - Record. @returns Test completion or assertion result. */ (
          record,
        ) => record.title,
      ),
    ).toEqual(["Imported"]);
    documentShell.Close();
  });

  it.each([
    [
      "nested RTF",
      "rtf",
      String.raw`{\rtf1{\colortbl;\red200\green100\blue40;}Lead\par\trowd\rtlrow\cellx3000\pard\intbl before\par\pard\itap2 nested\nestcell{\*\nesttableprops\trowd\clcbpat1\cltxbtlr\cellx1200\nestrow}\pard\intbl after\cell\row}`,
    ],
    [
      "nested Markdown",
      "md",
      "Lead\n\n<table><tr><td>before<table><tr><td>nested</td></tr></table>after</td></tr></table>\n",
    ],
    [
      "anchored Markdown",
      "md",
      'Lead\n\n<table align="left"><tr><td>before<table><tr><td>nested</td></tr></table>after</td></tr></table>\n',
    ],
  ] as const)(
    "preserves %s tables when the imported document is reopened from browser storage",
    /** Opens the selected source, then opens the saved ODF package through the normal browser workflow. @param scenario - Source case. @param extension - Imported format. @param source - Actual input. @returns Completion. */ async (
      scenario,
      extension,
      source,
    ) => {
      const documentShell = shell(extension === "md");
      const store = new IndexedDbWriterOdtStore(`dialog-nested-${extension}`, new IDBFactory());
      const close = vi.fn();
      const read =
        /** Reads one pinned dictionary asset. @param name - Native dictionary. @returns Bytes. */ (
          name: WordDictionaryName,
        ) => readFileSync(`src/external/icu/source/data/brkitr/${name}.dict`);
      try {
        render(
          <WriterFileDialog
            docShell={documentShell}
            kind="open"
            onClose={close}
            services={{
              ...services(store),
              prepareWordDictionaries:
                /** Provides the shipped ICU assets to the real Markdown import. @returns Prepared native factory. */ async () =>
                  new ICULanguageBreakFactory({
                    thaidict: read("thaidict"),
                    laodict: read("laodict"),
                    burmesedict: read("burmesedict"),
                    khmerdict: read("khmerdict"),
                    cjdict: read("cjdict"),
                  }),
            }}
          />,
        );
        fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
        fireEvent.change(screen.getByLabelText("Browse"), {
          target: { files: [new File([source], `Nested.${extension}`)] },
        });
        await waitFor(
          /** Waits for the primary browser copy before reopening. @returns Nothing. */ () =>
            expect(close).toHaveBeenCalledOnce(),
        );
        const [record] = await store.list();
        assert(record);
        expect(await openBrowserWriterDocument(documentShell, store, record.id)).toBe(true);
        const doc = documentShell.GetDoc();
        let outer = doc.GetTables()[0];
        if (scenario === "anchored Markdown") {
          expect(outer).toBeUndefined();
          const fly = doc.GetSpzFrameFormats().GetFormat(0);
          const content = fly.GetContent().GetContentIdx()?.GetNode();
          assert(content?.IsStartNode());
          const table = doc.nodes.GetSectionContent(content)[0];
          assert(table instanceof SwTableNode);
          expect(table.GetFlyFormat()).toBe(fly);
          expect(fly.GetAnchor().GetAnchorNode()?.GetTextNode()).toBeDefined();
          outer = table.GetTable();
        }
        const cell = outer?.GetTabLines()[0]?.GetTabBoxes()[0];
        const nested = cell
          ?.GetContentNodes()
          .find(
            /** Locates the actual nested table inside the outer cell. @param node - Direct content node. @returns Whether the node is the nested table. */ (
              node,
            ) => node instanceof SwTableNode,
          );
        assert(cell && nested instanceof SwTableNode);
        expect(nested.StartOfSectionNode()).toBe(cell.GetStartNode());
        const inner = nested.GetTable().GetTabLines()[0]?.GetTabBoxes()[0];
        expect(inner?.GetParagraphs()[0]?.GetText()).toBe("nested");
        if (extension === "rtf") {
          assert(inner);
          const frame = inner.GetFrameFormat();
          const brush = frame.GetAttrSet().GetItemIfSet(RES_BACKGROUND, false) as SvxBrushItem;
          expect(brush.GetColor().toUInt32()).toBe(0xc86428);
          expect(frame.GetFrameDir().GetValue()).toBe(SvxFrameDirection.Vertical_LR_BT);
          expect(
            documentShell.GetDoc().GetTables()[0]?.GetFrameFormat().GetFrameDir().GetValue(),
          ).toBe(SvxFrameDirection.Horizontal_RL_TB);
        }
      } finally {
        documentShell.Close();
      }
    },
  );

  it("exports Markdown from the native Writer model", /** Checks shell-owned Markdown output reaches the browser port. @returns Completion. */ async () => {
    const documentShell = shell();
    const paragraph = documentShell.GetDoc().paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing paragraph.");
    paragraph.SetText("Native heading");
    paragraph.ChgFormatColl(documentShell.GetDoc().GetTextFormatColl("heading-2"));
    const exported = vi.fn();
    render(
      <WriterFileDialog
        docShell={documentShell}
        kind="export"
        onClose={vi.fn()}
        services={services(undefined, exported)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Download Markdown" }));
    await waitFor(
      /** Waits for native Markdown output. @returns Nothing. */ () =>
        expect(exported).toHaveBeenCalledOnce(),
    );
    const payload = exported.mock.calls[0]?.[0] as {
      data: Uint8Array;
      mediaType: string;
      name: string;
    };
    expect(new TextDecoder().decode(payload.data)).toBe("## Native heading\n");
    expect([payload.mediaType, payload.name]).toEqual(["text/markdown;charset=utf-8", "Draft.md"]);
    documentShell.Close();
  });

  it("imports Markdown through the native shell and persists browser identity", /** Checks existing Open flow with Markdown content. @returns Completion. */ async () => {
    const documentShell = shell(true);
    const store = new IndexedDbWriterOdtStore("dialog-markdown-import", new IDBFactory());
    const close = vi.fn();
    let rejectOnce = true;
    const fetchDictionary = vi.fn(
      /** Serves the actual built-in binary assets. @param url - Browser asset URL. @returns Response. */ async (
        url: URL,
      ) => {
        if (rejectOnce) {
          rejectOnce = false;
          return new Response(null, { status: 503 });
        }
        const name = url.pathname.split("/").at(-1);
        return new Response(
          new Uint8Array(readFileSync(`src/external/icu/source/data/brkitr/${name}`)),
        );
      },
    );
    vi.stubGlobal("fetch", fetchDictionary);
    try {
      await expect(prepareWriterWordDictionaries()).rejects.toThrow("could not be loaded");
      render(
        <WriterFileDialog
          docShell={documentShell}
          kind="open"
          onClose={close}
          services={{ ...services(store), prepareWordDictionaries: prepareWriterWordDictionaries }}
        />,
      );
      fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
      fireEvent.change(screen.getByLabelText("Browse"), {
        target: {
          files: [
            new File(
              ["# Imported\n\n<table><tr><td>ภาษาไทย</td><td>Cell</td></tr></table>\n"],
              "Imported.md",
            ),
          ],
        },
      });
      await waitFor(
        /** Waits for completed import. @returns Nothing. */ () =>
          expect(close).toHaveBeenCalledOnce(),
      );
      expect(documentShell.GetDoc().paragraphs[0]?.GetParagraphStyle()).toBe("heading-1");
      const table = documentShell
        .GetDoc()
        .GetNodes()
        .entries()
        .find(
          /** Locates the actual native table node from the same open action. @param node - Actual document node. @returns Whether this is the table node. */ (
            node,
          ): node is SwTableNode => node instanceof SwTableNode,
        );
      expect(
        table?.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText(),
      ).toBe("ภาษาไทย");
      expect(table?.GetTable().GetHTMLTableLayout()?.GetMax()).toBeGreaterThan(0);
      expect(
        (await store.list()).map(
          /** Checks imports Markdown through the native shell and persists browser identity. @param record - Record. @returns Test completion or assertion result. */ (
            record,
          ) => record.title,
        ),
      ).toEqual(["Imported"]);
      expect(fetchDictionary).toHaveBeenCalledTimes(10);
      expect(
        g_pBreakIt
          .GetBreakIter()
          .getWordBoundary("ภาษาไทย", 0, g_pBreakIt.GetLocale(0x041e), DICTIONARY_WORD, true),
      ).toEqual({ startPos: 0, endPos: 4 });
    } finally {
      vi.unstubAllGlobals();
      documentShell.Close();
    }
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

  it("prefills an indexed name and keeps both documents after an import collision", /** Checks the save-new collision choice. @returns Completion. */ async () => {
    const documentShell = shell();
    const store = new IndexedDbWriterOdtStore("dialog-import-copy", new IDBFactory());
    await store.save({
      content: { format: "xml", files: {} },
      id: "plan",
      title: "Plan",
      version: 1,
    });
    await store.save({
      content: { format: "xml", files: {} },
      id: "plan-1",
      title: "Plan (1)",
      version: 1,
    });
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
    fireEvent.change(screen.getByLabelText("Browse"), {
      target: { files: [new File(["New plan body"], "Plan.txt")] },
    });
    const name = await screen.findByRole("textbox", { name: "New document name" });
    expect(name).toHaveValue("Plan (2)");
    expect(screen.getByText(/Replace “Plan” or keep both documents/)).toBeVisible();
    fireEvent.change(name, { target: { value: "Plan (1)" } });
    fireEvent.click(screen.getByRole("button", { name: "Save as new" }));
    await waitFor(
      /** Waits for repeated collision resolution. @returns Nothing. */ () => {
        expect(close).not.toHaveBeenCalled();
        expect(screen.getByRole("textbox", { name: "New document name" })).toHaveValue("Plan (2)");
        expect(screen.getByText(/Replace “Plan \(1\)” or keep both documents/)).toBeVisible();
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Save as new" }));
    await waitFor(
      /** Waits for the new browser copy. @returns Nothing. */ () =>
        expect(close).toHaveBeenCalledTimes(1),
    );
    expect(
      (await store.list())
        .map(
          /** Selects the stored title. @param document - Stored record. @returns Title. */ (
            document,
          ) => document.title,
        )
        .sort(),
    ).toEqual(["Plan", "Plan (1)", "Plan (2)"]);
    expect(documentShell.GetTitle()).toBe("Plan (2)");
    documentShell.Close();
  });

  it("overwrites the colliding browser identity only after explicit confirmation", /** Checks the replace-existing collision choice. @returns Completion. */ async () => {
    const documentShell = shell();
    const store = new IndexedDbWriterOdtStore("dialog-import-overwrite", new IDBFactory());
    await store.save({
      content: { format: "xml", files: {} },
      id: "plan",
      title: "Plan",
      version: 1,
    });
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
    fireEvent.change(screen.getByLabelText("Browse"), {
      target: { files: [new File(["Replacement body"], "Plan.txt")] },
    });
    await screen.findByText("A document with this name exists");
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Replace existing" }));
    await waitFor(
      /** Waits for the confirmed overwrite. @returns Nothing. */ () =>
        expect(close).toHaveBeenCalledTimes(1),
    );
    expect(await store.list()).toHaveLength(1);
    expect((await store.load("plan"))?.title).toBe("Plan");
    expect(documentShell.GetDocumentId()).toBe("plan");
    expect(documentShell.GetDoc().paragraphs[0]?.GetText()).toBe("Replacement body");
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
        { content: { format: "xml", files: {} }, id: "old", title: "Old", version: 1 },
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
