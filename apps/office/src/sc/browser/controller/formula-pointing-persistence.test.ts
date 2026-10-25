/** @fileoverview Pointing-created formula ODS persistence and real shell/worker snapshot guards. */
import { afterEach, expect, it, vi } from "vitest";
import { CalcViewController } from "./calc-view-controller";
import { ScAddress } from "../../inc/address";
import { ScInputMode } from "../../inc/global";
import { ScDocument } from "../../inc/document";
import { ScDocShell } from "../../source/ui/docshell/docsh";
import { OdsWorkerClient } from "../filter/xml/ods-worker-client";
import { readOdsDocument } from "../../source/filter/xml/xmlwrap";
import { createDocument } from "../../../sfx2/source/doc/objsh";
afterEach(/** Restores the browser clock boundary. @returns Nothing. */ () => vi.restoreAllMocks());
it("reopens a pointer-created formula as an actual native formula cell", /** ODS package serialization retains the original edit origin and formula dependency. @returns Completion. */ async () => {
  const c = new CalcViewController(),
    doc = c.shell.GetDocument();
  doc.SetValue(new ScAddress(), 4);
  doc.SetValue(new ScAddress(0, 1, 0), 6);
  c.Select(3, 4);
  c.StartInput(ScInputMode.SC_INPUT_TYPE, "=SUM(");
  c.StartPointer(new ScAddress());
  c.MovePointer(new ScAddress(0, 1, 0));
  c.EndPointer();
  c.inputHandler.PrepareReferenceInput();
  c.ChangeInput(c.Input() + ")");
  expect(c.Commit()).toBe(true);
  const reopened = new ScDocShell(await readOdsDocument(c.shell.SerializeOds()));
  expect(reopened.GetDocument().GetValue(new ScAddress(3, 4, 0))).toBe(10);
  reopened.GetDocument().SetValue(new ScAddress(), 9);
  expect(reopened.GetDocument().GetValue(new ScAddress(3, 4, 0))).toBe(15);
  reopened.Close();
  c.Close();
});
for (const xml of [true, false])
  for (const replacement of [true, false])
    it(`rejects stale shell graph capture for ${xml ? "XML" : "ODS"} and ${replacement ? "replacement" : "generation"}`, /** Real cooperative graph capture observes both shell guard identities before any worker transfer. @returns Completion. */ async () => {
      let now = 0;
      vi.spyOn(performance, "now").mockImplementation(
        /** Advances the actual platform time boundary to force one graph slice. @returns Elapsed milliseconds. */ () =>
          (now += 6),
      );
      const shell = new ScDocShell(new ScDocument(), new OdsWorkerClient());
      const pending = xml ? shell.SerializeXml() : shell.SerializeOdsAsync();
      if (replacement)
        shell.ReplaceDocument(
          new ScDocument(),
          createDocument({ id: crypto.randomUUID(), suiteId: "calc", title: "Replacement" }),
          { kind: "untitled", name: "Replacement" },
        );
      else shell.SetDocumentModified();
      await expect(pending).rejects.toThrow(/cancelled|stale/);
      shell.Close();
    });
