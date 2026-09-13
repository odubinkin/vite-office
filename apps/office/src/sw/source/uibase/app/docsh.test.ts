/** @fileoverview Verifies Writer document-shell ownership around new, ODT load, and ODT save. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/docfac";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { createWriterDocument, insertWriterText } from "../../core/doc/writer";
import { undoWriterTransaction } from "../uiview/viewfunc";
import { SwDocShell } from "./docsh";

/** Creates deterministic Writer metadata. @param title - Visible title. @param id - Stable identity. @returns New document header. */
function metadata(title = "Shell document", id = "shell-document") {
  return createDocument({ id, suiteId: "writer", title });
}

describe("SwDocShell" /** Groups the bounded document-shell lifecycle. @returns Nothing. */, () => {
  it("initializes, saves, and atomically loads Writer documents" /** Verifies document ownership and ODT delegation. @returns A fulfilled assertion promise. */, async () => {
    const source = insertWriterText(createWriterDocument(metadata(), "p-1"), "p-1", 0, "ODT body");
    const shell = new SwDocShell(source);
    expect(shell.GetDoc()).toBe(source);
    expect(shell.GetMedium()).toEqual({ kind: "untitled", name: "Shell document" });
    const bytes = shell.SaveAs();
    expect(new ZipFile(bytes).getEntryNames()).toContain("content.xml");

    const empty = shell.InitNew(metadata("New document", "new-document"), "new-p-1");
    expect(empty.paragraphs).toHaveLength(1);
    expect(empty.paragraphs[0]?.text).toBe("");
    const loaded = await shell.Load(bytes, metadata("Fallback", "opened-document"));
    expect(shell.GetDoc()).toBe(loaded);
    expect(loaded.document).toMatchObject({
      id: "opened-document",
      lifecycle: "saved",
      title: "Shell document",
    });
    expect(loaded.paragraphs[0]?.text).toBe("ODT body");
    expect(shell.GetMedium()).toEqual({
      kind: "file",
      mediaType: SwDocShell.ODT_MEDIA_TYPE,
      name: "Fallback",
    });
  });

  it("retains the active document when ODT loading fails" /** Verifies candidate-first atomic replacement. @returns A fulfilled assertion promise. */, async () => {
    const active = createWriterDocument(metadata(), "p-1");
    const shell = new SwDocShell(active);
    await expect(shell.Load(new Uint8Array([1, 2, 3]), metadata("Broken"))).rejects.toThrow();
    expect(shell.GetDoc()).toBe(active);
  });

  it("coordinates history and document invalidation for one persistent shell" /** Verifies mutation ownership, no-op transitions, history replacement, subscription cleanup, and medium replacement. @returns Nothing. */, function coordinatesPersistentHistory(): void {
    const initial = createWriterDocument(metadata(), "p-1");
    const shell = new SwDocShell(initial, { kind: "browser-local", name: "shell-document" });
    let invalidations = 0;
    const unsubscribe = shell.Subscribe(
      /** Counts one document-shell invalidation. @returns Nothing. */ () => {
        invalidations += 1;
      },
    );
    expect(shell.ApplyDocument(initial, { position: 0 })).toBe(false);
    const changed = insertWriterText(initial, "p-1", 0, "A");
    expect(shell.ApplyDocument(changed, { position: 1 })).toBe(true);
    expect(shell.GetDoc()).toBe(changed);
    expect(shell.GetUndoManager()).toMatchObject({ index: 1, selection: { position: 1 } });
    const undone = undoWriterTransaction(shell.GetUndoManager());
    expect(shell.SetUndoManager(undone)).toBe(true);
    expect(shell.GetDoc().paragraphs[0]?.text).toBe("");
    expect(shell.SetUndoManager(undone)).toBe(false);
    expect(invalidations).toBe(2);
    unsubscribe();
    shell.InitNew(metadata("Replacement", "replacement"), "replacement-p-1");
    expect(invalidations).toBe(2);
    shell.Close();
  });
});
