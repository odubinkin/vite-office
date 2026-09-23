/** @fileoverview Verifies Writer browser persistence routing and failure feedback. */

import { describe, expect, it, vi } from "vitest";

import { createDocument } from "../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../source/core/doc/doc";
import { SwDocShell } from "../../source/uibase/app/docsh";
import { createWriterSnapshot, type WriterSnapshotState } from "../storage/writer-storage";
import { loadWriterFromPrimaryPort, saveWriterToPrimaryPort } from "./writer-document-io";

/** Runs the shell test helper. @returns Test callback result. */ function shell() {
  return new SwDocShell(
    createWriterDocument(),
    createDocument({ id: "local", suiteId: "writer", title: "Local" }),
  );
}

describe("Writer browser document IO", /** Groups Writer browser document IO. @returns Test callback result. */ () => {
  it("adopts the first confirmed local save and then reuses the same primary medium", /** Checks adopts the first confirmed local save and then reuses the same primary medium. @returns Test callback result. */ async () => {
    const docShell = shell();
    const save = vi.fn(
      /** Runs the test callback. @returns Test callback result. */ async () => undefined,
    );
    await saveWriterToPrimaryPort(docShell, { save });
    const adopted = docShell.GetMedium();
    expect(adopted.kind).toBe("primary");
    await saveWriterToPrimaryPort(docShell, { save });
    expect(docShell.GetMedium()).toBe(adopted);
    expect(save).toHaveBeenCalledTimes(2);
    docShell.Close();
  });

  it("retains a failed open operation when a browser snapshot cannot be restored", /** Checks retains a failed open operation when a browser snapshot cannot be restored. @returns Test callback result. */ async () => {
    const docShell = shell();
    const snapshot = createWriterSnapshot(docShell.GetDoc(), docShell.GetDocumentState());
    const malformed = {
      ...snapshot,
      state: { ...snapshot.state, codec: "obsolete" as WriterSnapshotState["codec"] },
    };
    await expect(
      loadWriterFromPrimaryPort(docShell, {
        load: /** Runs the test callback. @returns Test callback result. */ async () => malformed,
      }),
    ).rejects.toThrow(/schema is unsupported/);
    expect(docShell.GetMedium().GetLastOperation()).toMatchObject({
      operation: "open",
      state: "failed",
    });
    docShell.Close();
  });

  it("normalizes a non-Error storage rejection into medium feedback", /** Checks normalizes a non-Error storage rejection into medium feedback. @returns Test callback result. */ async () => {
    const docShell = shell();
    await expect(
      loadWriterFromPrimaryPort(docShell, {
        load: /** Runs the test callback. @returns Test callback result. */ async () => {
          throw "storage offline";
        },
      }),
    ).rejects.toBe("storage offline");
    expect(docShell.GetMedium().GetLastOperation().message).toBe("storage offline");
    docShell.Close();
  });
});
