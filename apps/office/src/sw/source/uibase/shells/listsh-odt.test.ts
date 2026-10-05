/** @fileoverview Exercises Writer list dispatch against a repository-owned LibreOffice ODT fixture. */

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SfxRequest } from "../../../../sfx2/source/control/request";
import { SwPosition } from "../../core/crsr/pam";
import { SwUndoInsNum } from "../../core/undo/unnum";
import type { SwUndoRedoContext } from "../../core/undo/undobj";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import { readOdtDocument } from "../../filter/xml/swxml";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "../wrtsh/wrtsh1";

describe("Writer Continue Numbering ODT regression", /** Groups real ODT command assertions. @returns Nothing. */ () => {
  it("joins the selected list and restores it with one Undo", /** Verifies atomic list adoption and export. @returns Completion after reopening. */ async () => {
    const warning = vi
      .spyOn(console, "warn")
      .mockImplementation(
        /** Suppresses diagnostics for out-of-scope ODF properties. @returns Nothing. */ () =>
          undefined,
      );
    try {
      const metadata = createDocument({ id: "tdf113213", suiteId: "writer", title: "List" });
      const bytes = new Uint8Array(
        fs.readFileSync(path.resolve("src/sw/qa/extras/uiwriter/data/tdf113213_addToList.odt")),
      );
      const imported = await readOdtDocument(bytes, metadata);
      const shell = new SwWrtShell(new SwDocShell(imported.document, metadata));
      const [first, , , , penultimate, last] = imported.document.paragraphs;
      if (first === undefined || penultimate === undefined || last === undefined)
        throw new Error("Continue Numbering fixture is incomplete");
      const originalListId = last.GetListId();
      expect(last.GetListLabel()).toBe("1.");
      shell.SetPaM(new SwPosition(last, last.Len()), new SwPosition(penultimate, 0));
      const history = new SfxListUndoAction<SwUndoRedoContext>("Continue Numbering");
      for (const node of [penultimate, last])
        history.AddAction(
          new SwUndoInsNum(
            node,
            node.CaptureListItems(),
            node.CaptureListItems(),
            shell.CaptureCursorState(),
            shell.CaptureCursorState(),
          ),
        );
      expect(history.GetActionCount()).toBe(2);
      expect(history.GetPayloadSize()).toBe(12);
      const slot = shell
        .GetListShell()
        .GetCommandShell()
        .GetInterface()
        .GetSlot(WRITER_COMMAND_IDS.continueNumbering);
      if (slot === undefined) throw new Error("Continue Numbering slot is missing");
      const command = shell.GetListShell().GetCommandShell().ResolveSlot(slot.slotId);
      expect(command?.execute(new SfxRequest(slot.slotId))).toMatchObject({
        status: "executed",
        value: true,
      });
      expect(last.GetListId()).toBe(first.GetListId());
      expect(last.GetListLabel()).toBe("3");
      expect(last.IsListRestart()).toBe(false);
      expect(shell.Undo()).toBe(true);
      expect(last.GetListId()).toBe(originalListId);
      expect(last.GetListLabel()).toBe("1.");
      expect(last.IsListRestart()).toBe(true);
      expect(shell.Redo()).toBe(true);
      expect(last.GetListLabel()).toBe("3");
      const separator = imported.document.paragraphs[3];
      if (separator === undefined) throw new Error("Continue Numbering fixture has no separator");
      shell.SetPaM(new SwPosition(last, last.Len()), new SwPosition(separator, 0));
      // Native FN_NUM_CONTINUE applies the found rule to every selected paragraph.
      expect(shell.ContinueNumbering()).toBe(true);
      expect(separator.GetNumRule()).toBe(first.GetNumRule());
      expect(separator.GetListId()).toBe(first.GetListId());
      expect(shell.Undo()).toBe(true);
      expect(separator.GetListKind()).toBe("none");
      const plain = imported.document.paragraphs[2];
      if (plain === undefined) throw new Error("Continue Numbering fixture has no plain paragraph");
      shell.FocusNode(plain);
      expect(shell.ContinueNumbering()).toBe(true);
      expect(plain.GetNumRule()).toBe(first.GetNumRule());
      expect(plain.GetListId()).toBe(first.GetListId());
      expect(shell.Undo()).toBe(true);
      expect(plain.GetListKind()).toBe("none");
      const reopened = await readOdtDocument(
        writeOdtDocument(imported.document, { title: imported.title }),
        metadata,
      );
      expect(reopened.document.paragraphs[5]?.GetListLabel()).toBe("3");
    } finally {
      warning.mockRestore();
    }
  });
});
