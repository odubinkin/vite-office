/** @fileoverview Verifies ODT primary storage and the empty-document exclusion. */

import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it } from "vitest";

import { createDocument } from "../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../source/core/doc/doc";
import { SwDocShell } from "../../source/uibase/app/docsh";
import { SwWrtShell } from "../../source/uibase/wrtsh/wrtsh1";
import { ZipFile } from "../../../package/source/zipapi/ZipFile";
import { IndexedDbWriterOdtStore } from "../storage/writer-odt-store";
import {
  autosaveWriter,
  openBrowserWriterDocument,
  openWriterText,
  saveWriterAsBrowserCopy,
} from "./writer-odt-io";

/** Creates a test Writer shell. @returns Empty active document shell. */
function makeShell(): SwDocShell {
  return new SwDocShell(
    createWriterDocument(),
    createDocument({ id: "writer-odt-test", suiteId: "writer", title: "Draft" }),
  );
}

describe("Writer browser ODT saving", /** Registers ODT persistence assertions. @returns Nothing. */ () => {
  it("never writes an empty document", /** Checks autosave and Save As exclusion. @returns Completion. */ async () => {
    const store = new IndexedDbWriterOdtStore("empty-writer-test", new IDBFactory());
    const shell = makeShell();
    expect(await autosaveWriter(shell, store)).toBe(false);
    await expect(saveWriterAsBrowserCopy(shell, store, "Empty copy")).rejects.toThrow(
      "Empty documents cannot be saved.",
    );
    expect(await store.list()).toEqual([]);
    shell.Close();
  });

  it("stores a complete ODT package in IndexedDB", /** Checks primary byte format. @returns Completion. */ async () => {
    const store = new IndexedDbWriterOdtStore("odt-writer-test", new IDBFactory());
    const shell = makeShell();
    new SwWrtShell(shell).Insert("Stored ODT body");
    expect(await autosaveWriter(shell, store)).toBe(true);
    const records = await store.list();
    expect(records).toHaveLength(1);
    const record = records[0];
    if (record === undefined) throw new Error("Expected one ODT record.");
    const archive = new ZipFile(record.bytes);
    expect(await archive.readTextEntry("mimetype")).toBe("application/vnd.oasis.opendocument.text");
    expect(await archive.readTextEntry("content.xml")).toContain("Stored<text:s/>ODT<text:s/>body");
    shell.Close();
  });

  it("keeps the primary identity on later saves and atomically renames it", /** Checks primary save and title changes. @returns Completion. */ async () => {
    const store = new IndexedDbWriterOdtStore("odt-primary-rename", new IDBFactory());
    const shell = makeShell();
    const writer = new SwWrtShell(shell);
    writer.Insert("First");
    expect(await autosaveWriter(shell, store)).toBe(true);
    expect(await autosaveWriter(shell, store)).toBe(false);
    writer.Insert(" second");
    expect(await autosaveWriter(shell, store)).toBe(true);
    shell.RenameDocument("Renamed");
    expect(await autosaveWriter(shell, store)).toBe(true);
    expect(
      (await store.list()).map(
        /** Runs the focused test callback. @param item - Input for this operation. @returns Operation result. */ (
          item,
        ) => item.title,
      ),
    ).toEqual(["Renamed"]);
    expect(shell.GetMedium().destination).toMatchObject({ kind: "storage" });
    shell.Close();
  });

  it("creates a separate Save As copy and can open it", /** Checks copy and browser-open round trip. @returns Completion. */ async () => {
    const store = new IndexedDbWriterOdtStore("odt-copy-open", new IDBFactory());
    const shell = makeShell();
    new SwWrtShell(shell).Insert("Retained body");
    await autosaveWriter(shell, store);
    const copyId = await saveWriterAsBrowserCopy(shell, store, " Copy ");
    expect(
      (await store.list())
        .map(
          /** Runs the focused test callback. @param item - Input for this operation. @returns Operation result. */ (
            item,
          ) => item.title,
        )
        .sort(),
    ).toEqual(["Copy", "Draft"]);
    new SwWrtShell(shell).Insert(" changed");
    expect(await openBrowserWriterDocument(shell, store, "absent")).toBe(false);
    expect(await openBrowserWriterDocument(shell, store, copyId)).toBe(true);
    expect(shell.GetTitle()).toBe("Copy");
    expect(shell.GetDoc().paragraphs[0]?.GetText()).toBe("Retained body");
    shell.Close();
  });

  it("imports UTF-8 text and immediately persists only nonempty content", /** Checks computer import behavior. @returns Completion. */ async () => {
    const store = new IndexedDbWriterOdtStore("text-import-save", new IDBFactory());
    const shell = makeShell();
    openWriterText(shell, new TextEncoder().encode("First\r\nSecond"), "notes.TXT");
    expect(
      shell
        .GetDoc()
        .paragraphs.map(
          /** Runs the focused test callback. @param paragraph - Input for this operation. @returns Operation result. */ (
            paragraph,
          ) => paragraph.GetText(),
        ),
    ).toEqual(["First", "Second"]);
    expect(await autosaveWriter(shell, store, true)).toBe(true);
    expect(
      (await store.list()).map(
        /** Runs the focused test callback. @param item - Input for this operation. @returns Operation result. */ (
          item,
        ) => item.title,
      ),
    ).toEqual(["notes"]);
    openWriterText(shell, new TextEncoder().encode(" \n  "), ".txt");
    expect(await autosaveWriter(shell, store, true)).toBe(false);
    expect(await store.list()).toHaveLength(1);
    await expect(saveWriterAsBrowserCopy(shell, store, " ")).rejects.toThrow(
      "Document name is required.",
    );
    shell.Close();
  });
});
