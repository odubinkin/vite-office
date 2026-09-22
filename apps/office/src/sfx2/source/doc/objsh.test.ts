/** @fileoverview Verifies SfxObjectShell-owned lifecycle and medium state. */

import { describe, expect, it } from "vitest";

import { SfxMedium } from "./docfile";
import { createDocument, SfxObjectShell } from "./objsh";

/** Test surface exposing protected upstream-style lifecycle hooks. */
class TestObjectShell extends SfxObjectShell {
  /** Marks content modified. @returns Whether state changed. */
  public ContentChanged(): boolean {
    return this.SetModified(true, true);
  }

  /** Acknowledges recovery persistence. @param generation - Saved generation. @returns Whether state changed. */
  public CompleteRecovery(generation?: number): boolean {
    return this.RecoverySaveCompleted(generation);
  }

  /** Acknowledges primary persistence. @param generation - Saved generation. @returns Whether state changed. */
  public CompleteSave(generation?: number): boolean {
    return this.SaveCompleted(generation);
  }

  /** Applies an undo-history save position. @param atSavePosition - Whether history is at the save mark. @returns Whether state changed. */
  public HistoryAtSavePosition(atSavePosition: boolean): boolean {
    return this.SetHistorySavePosition(atSavePosition);
  }

  /** Closes the shell. @returns Whether state changed. */
  public Close(): boolean {
    return this.CloseObjectShell();
  }

  /** Reinstalls state over a retained medium. @param medium - Medium identity. @returns Nothing. */
  public RetainMedium(medium: SfxMedium): void {
    this.ReplaceObjectState(this.GetDocumentState(), medium);
  }

  /** Attempts a complete state replacement. @param state - Candidate state. @param medium - Candidate medium. @returns Nothing. */
  public ReplaceState(
    state: ReturnType<TestObjectShell["GetDocumentState"]>,
    medium: SfxMedium,
  ): void {
    this.ReplaceObjectState(state, medium);
  }

  /** Exposes raw title validation. @param title - Candidate title. @returns Whether changed. */
  public RenameRaw(title: string): boolean {
    return this.SetTitle(title);
  }
}

/** Creates one shell over a stable untitled medium. @returns Shell fixture. */
function createFixture(): TestObjectShell {
  return new TestObjectShell(
    createDocument({ id: "doc-1", suiteId: "writer", title: "Untitled Writer Document" }),
    new SfxMedium({ kind: "untitled", name: "Untitled Writer Document" }),
  );
}

describe("SfxObjectShell lifecycle", /** Registers object-shell tests. @returns Nothing. */ function defineObjectShellTests(): void {
  it("owns modified and persistence generations without a parallel transition model", /** Verifies shell lifecycle ownership. @returns Nothing. */ function ownsLifecycle(): void {
    const shell = createFixture();
    const medium = shell.GetMedium();
    expect(shell.GetDocumentState()).toEqual({
      contentGeneration: 0,
      id: "doc-1",
      isModified: false,
      lifecycle: "new",
      recoveryGeneration: null,
      suiteId: "writer",
      title: "Untitled Writer Document",
    });
    expect(shell.ContentChanged()).toBe(true);
    expect(shell.ContentChanged()).toBe(true);
    expect(shell.CompleteRecovery()).toBe(true);
    expect(shell.CompleteSave(1)).toBe(true);
    expect(shell.GetDocumentState()).toMatchObject({
      contentGeneration: 2,
      isModified: true,
      lifecycle: "dirty",
      recoveryGeneration: 2,
    });
    expect(shell.CompleteSave()).toBe(true);
    expect(shell.GetDocumentState()).toMatchObject({ isModified: false, lifecycle: "saved" });
    expect(shell.HistoryAtSavePosition(false)).toBe(true);
    expect(shell.HistoryAtSavePosition(true)).toBe(true);
    expect(shell.GetMedium()).toBe(medium);
  });

  it("closes the retained medium and rejects later lifecycle operations", /** Verifies terminal shell state. @returns Nothing. */ function closesShell(): void {
    const shell = createFixture();
    const medium = shell.GetMedium();
    expect(shell.Close()).toBe(true);
    expect(shell.Close()).toBe(false);
    expect(medium.IsOpen()).toBe(false);
    expect(shell.GetDocumentState().lifecycle).toBe("closed");
    expect(
      /** Mutates a closed shell. @returns Nothing; throws. */ () => shell.ContentChanged(),
    ).toThrow("Closed document shells");
    expect(
      /** Saves a closed shell. @returns Nothing; throws. */ () => shell.CompleteSave(),
    ).toThrow("Closed document shells");
  });

  it("validates construction metadata and acknowledgement generations", /** Verifies lifecycle validation. @returns Nothing. */ function validatesState(): void {
    expect(
      /** Creates blank identity metadata. @returns Invalid state; throws. */ () =>
        createDocument({ id: " ", suiteId: "writer", title: "Untitled Writer Document" }),
    ).toThrow("blank");
    expect(
      /** Creates blank title metadata. @returns Invalid state; throws. */ () =>
        createDocument({ id: "doc", suiteId: "writer", title: " " }),
    ).toThrow("blank");
    expect(
      /** Creates blank module metadata. @returns Invalid state; throws. */ () =>
        createDocument({ id: "doc", suiteId: " ", title: "Document" }),
    ).toThrow("blank");
    const valid = createDocument({ id: "doc", suiteId: "writer", title: "Document" });
    const validationMedium = new SfxMedium({ kind: "untitled", name: "Document" });
    expect(
      /** Creates a shell with an invalid content generation. @returns Invalid shell; throws. */ () =>
        new TestObjectShell({ ...valid, contentGeneration: -1 }, validationMedium),
    ).toThrow("non-negative integer");
    expect(
      /** Creates a shell with an invalid recovery generation. @returns Invalid shell; throws. */ () =>
        new TestObjectShell({ ...valid, recoveryGeneration: 1 }, validationMedium),
    ).toThrow("existing document content");
    for (const recoveryGeneration of [-1, 0.5])
      expect(
        /** Creates a shell with a malformed recovery generation. @returns Invalid shell; throws. */ () =>
          new TestObjectShell({ ...valid, recoveryGeneration }, validationMedium),
      ).toThrow("existing document content");
    expect(
      /** Creates a contradictory dirty projection. @returns Invalid shell; throws. */ () =>
        new TestObjectShell({ ...valid, lifecycle: "dirty" }, validationMedium),
    ).toThrow("Dirty lifecycle");
    expect(
      /** Creates a contradictory modified projection. @returns Invalid shell; throws. */ () =>
        new TestObjectShell({ ...valid, isModified: true }, validationMedium),
    ).toThrow("Modified state");
    expect(
      /** Creates an already closed shell. @returns Invalid shell; throws. */ () =>
        new TestObjectShell({ ...valid, lifecycle: "closed" }, validationMedium),
    ).toThrow("construct a closed");
    const shell = createFixture();
    const medium = shell.GetMedium();
    shell.RetainMedium(medium);
    expect(medium.IsOpen()).toBe(true);
    shell.ContentChanged();
    expect(shell.RenameRaw("Renamed")).toBe(true);
    expect(shell.RenameRaw("Renamed")).toBe(false);
    expect(
      /** Applies an invalid raw title. @returns Invalid title; throws. */ () =>
        shell.RenameRaw(" "),
    ).toThrow("blank");
    expect(
      /** Installs a closed replacement projection. @returns Invalid replacement; throws. */ () =>
        shell.ReplaceState(
          { ...shell.GetDocumentState(), isModified: false, lifecycle: "closed" },
          shell.GetMedium(),
        ),
    ).toThrow("install a closed");
    for (const generation of [-1, 0.5, 2])
      expect(
        /** Acknowledges an invalid generation. @returns Nothing; throws. */ () =>
          shell.CompleteSave(generation),
      ).toThrow("Saved generation must identify existing document content.");
  });
});
