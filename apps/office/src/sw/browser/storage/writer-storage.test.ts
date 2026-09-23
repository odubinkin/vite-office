/** @fileoverview Validates Writer's browser snapshot envelope and recovery boundaries. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../sfx2/source/doc/objsh";
import { createWriterDocument, SwDoc } from "../../source/core/doc/doc";
import { RES_CHRATR_CJK_FONT } from "../../inc/hintids";
import { SvxFontItem } from "../../../editeng/source/items/textitem";
import {
  createWriterSnapshot,
  restoreWriterSnapshot,
  saveWriterDocument,
  WRITER_STORAGE_CODEC,
  type WriterSnapshotState,
} from "./writer-storage";

describe("Writer primary snapshot storage", /** Groups Writer primary snapshot storage. @returns Test callback result. */ () => {
  it("restores document locale with the current device", /** Verifies cache construction context. @returns Nothing. */ () => {
    const source = new SwDoc({ locale: "ja-JP" });
    const saved = createWriterSnapshot(
      source,
      createDocument({ id: "locale", suiteId: "writer", title: "Locale" }),
    );
    const device = {
      getDefaultFont: /** Resolves the test family. @returns Family. */ () => "Source Han Sans",
    };
    const restored = restoreWriterSnapshot(saved, device).document;
    expect(restored.GetLocale()).toBe("ja-JP");
    expect(restored.GetPageDesc().GetValue().paperFormat).toBe("A4");
    expect(
      (
        restored.GetAttrPool().GetUserOrPoolDefaultItem(RES_CHRATR_CJK_FONT) as SvxFontItem
      ).GetResolvedFamilyName(),
    ).toBe("Source Han Sans");
  });

  const document = createWriterDocument();
  const shell = createDocument({ id: "stored", suiteId: "writer", title: "Stored" });
  const snapshot = createWriterSnapshot(document, shell);

  /** Runs the withState test helper. @param state - Test input. @param id - Test input. @param version - Test input. @returns Test callback result. */ function withState(
    state: Partial<WriterSnapshotState>,
    id = snapshot.id,
    version = snapshot.version,
  ) {
    return {
      ...snapshot,
      id,
      version,
      state: { ...snapshot.state, ...state } as WriterSnapshotState,
    };
  }

  it("round trips a current snapshot as a saved document", /** Checks round trips a current snapshot as a saved document. @returns Test callback result. */ () => {
    expect(snapshot.state.codec).toBe(WRITER_STORAGE_CODEC);
    expect(restoreWriterSnapshot(snapshot).documentState).toMatchObject({
      id: "stored",
      isModified: false,
      lifecycle: "saved",
      recoveryGeneration: null,
    });
    expect(
      restoreWriterSnapshot(withState({ shell: { ...shell, lifecycle: "saved" } })).documentState
        .lifecycle,
    ).toBe("saved");
  });

  it("rejects incompatible schema, shell state, identity and generation", /** Checks rejects incompatible schema, shell state, identity and generation. @returns Test callback result. */ () => {
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        restoreWriterSnapshot(withState({ schemaVersion: 11 as 12 })),
    ).toThrow(/schema is unsupported/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        restoreWriterSnapshot(withState({ codec: "other" as typeof WRITER_STORAGE_CODEC })),
    ).toThrow(/schema is unsupported/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        restoreWriterSnapshot(withState({ shell: null })),
    ).toThrow(/state is invalid/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        restoreWriterSnapshot(withState({ shell: [] })),
    ).toThrow(/state is invalid/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        restoreWriterSnapshot(withState({ shell: { ...shell, title: 4 } })),
    ).toThrow(/state is invalid/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        restoreWriterSnapshot(withState({ shell: { ...shell, lifecycle: "closed" } })),
    ).toThrow(/Closed documents/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        restoreWriterSnapshot(withState({}, "other")),
    ).toThrow(/identity/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        restoreWriterSnapshot(withState({}, snapshot.id, 2)),
    ).toThrow(/generation/);
  });

  // does not acknowledge a failed primary save
  it("propagates a failed primary write without returning save evidence", /** Checks propagates a failed primary write without returning save evidence. @returns Test callback result. */ async () => {
    await expect(
      saveWriterDocument(
        {
          save: /** Runs the test callback. @returns Test callback result. */ async () => {
            throw new Error("write failed");
          },
        },
        document,
        shell,
      ),
    ).rejects.toThrow("write failed");
  });
});
