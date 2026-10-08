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
  getAutomaticWriterTitle,
  getUniqueWriterTitle,
  openBrowserWriterDocument,
  openWriterText,
  overwriteBrowserWriterDocument,
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
    expect(await autosaveWriter(shell, store)).toBe(false);
    writer.Insert(" second");
    expect(await autosaveWriter(shell, store)).toBe(true);
    expect(shell.GetTitle()).toBe("First second");
    expect(await autosaveWriter(shell, store)).toBe(false);
    writer.Insert(" third");
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
    ).toEqual(["Copy", "Retained body"]);
    new SwWrtShell(shell).Insert(" changed");
    expect(await openBrowserWriterDocument(shell, store, "absent")).toBe(false);
    expect(await openBrowserWriterDocument(shell, store, copyId)).toBe(true);
    expect(shell.GetTitle()).toBe("Copy");
    expect(shell.GetDoc().paragraphs[0]?.GetText()).toBe("Retained body");
    shell.Close();
  });

  it("waits for two trimmed words and allocates a collision-safe automatic title", /** Checks the new-document threshold, whitespace normalization, and indexed naming. @returns Completion. */ async () => {
    const store = new IndexedDbWriterOdtStore("automatic-title", new IDBFactory());
    await store.save({
      bytes: new Uint8Array([1]),
      id: "existing",
      title: "Plan work",
      version: 1,
    });
    await store.save({
      bytes: new Uint8Array([2]),
      id: "existing-copy",
      title: "Plan work (1)",
      version: 1,
    });
    const shell = makeShell();
    const writer = new SwWrtShell(shell);
    writer.Insert("  Plan\n\twork   continues");
    expect(getAutomaticWriterTitle(shell.GetDoc())).toBe("Plan work");
    expect(getUniqueWriterTitle(" Plan work ", await store.list())).toBe("Plan work (2)");
    expect(await autosaveWriter(shell, store)).toBe(true);
    expect(shell.GetTitle()).toBe("Plan work (2)");
    expect(
      (await store.list())
        .map(
          /** Selects one stored title. @param record - Stored record. @returns Record title. */ (
            record,
          ) => record.title,
        )
        .sort(),
    ).toEqual(["Plan work", "Plan work (1)", "Plan work (2)"]);
    shell.Close();
  });

  it("keeps a manual untitled-document name once the two-word threshold is met", /** Checks explicit user naming wins over automatic content naming. @returns Completion. */ async () => {
    const store = new IndexedDbWriterOdtStore("manual-first-title", new IDBFactory());
    const shell = makeShell();
    shell.RenameDocument("My chosen name");
    new SwWrtShell(shell).Insert("Two words");
    expect(await autosaveWriter(shell, store)).toBe(true);
    expect(shell.GetTitle()).toBe("My chosen name");
    shell.Close();
  });

  it("overwrites a rename conflict and adopts its identity without retaining the old record", /** Checks atomic overwrite workflow ownership. @returns Completion. */ async () => {
    const store = new IndexedDbWriterOdtStore("rename-overwrite", new IDBFactory());
    const shell = makeShell();
    new SwWrtShell(shell).Insert("Current body");
    expect(await autosaveWriter(shell, store)).toBe(true);
    const currentId = shell.GetDocumentId();
    await store.save({ bytes: new Uint8Array([1]), id: "target", title: "Target", version: 1 });
    const target = await store.load("target");
    if (target === undefined) throw new Error("Expected overwrite target.");
    await overwriteBrowserWriterDocument(shell, store, target);
    expect(shell.GetDocumentId()).toBe("target");
    expect(shell.GetTitle()).toBe("Target");
    expect(await store.load(currentId)).toBeUndefined();
    const replaced = await store.load("target");
    if (replaced === undefined) throw new Error("Expected replaced target.");
    const archive = new ZipFile(replaced.bytes);
    expect(await archive.readTextEntry("content.xml")).toContain("Current<text:s/>body");
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
