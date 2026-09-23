/** @fileoverview Exercises object-shell state validation and lifecycle transitions. */
import { describe, expect, it } from "vitest";

import { createDocument, SfxObjectShell, type SfxObjectShellState } from "./objsh";

/** Test fixture type. */ class TestShell extends SfxObjectShell {
  /** Runs the rename test helper. @param title - Test input. @returns Test callback result. */ public rename(
    title: string,
  ) {
    return this.SetTitle(title);
  }
  /** Runs the replace test helper. @param state - Test input. @returns Test callback result. */ public replace(
    state: SfxObjectShellState,
  ) {
    this.ReplaceObjectState(state, { kind: "untitled", name: state.title });
  }
  /** Runs the modify test helper. @param modified - Test input. @param changed - Test input. @returns Test callback result. */ public modify(
    modified = true,
    changed = false,
  ) {
    return this.SetModified(modified, changed);
  }
  /** Runs the save test helper. @param generation - Test input. @returns Test callback result. */ public save(
    generation?: number,
  ) {
    return this.SaveCompleted(generation);
  }
  /** Runs the history test helper. @param atSavePosition - Test input. @returns Test callback result. */ public history(
    atSavePosition: boolean,
  ) {
    return this.SetHistorySavePosition(atSavePosition);
  }
  /** Runs the close test helper. @returns Test callback result. */ public close() {
    return this.CloseObjectShell();
  }
}

const initial = createDocument({ id: "doc", suiteId: "writer", title: "Draft" });

describe("SfxObjectShell", /** Groups SfxObjectShell. @returns Test callback result. */ () => {
  // owns modified and persistence generations
  it("keeps identity and lifecycle in a shell with a replaceable medium", /** Checks keeps identity and lifecycle in a shell with a replaceable medium. @returns Test callback result. */ () => {
    const shell = new TestShell(initial, { kind: "untitled", name: "Draft" });
    expect(shell.GetDocumentId()).toBe("doc");
    expect(shell.GetDocumentState().lifecycle).toBe("new");
    expect(shell.rename("Draft")).toBe(false);
    expect(shell.rename("Final")).toBe(true);
    expect(shell.GetTitle()).toBe("Final");
    expect(shell.GetDocumentState().lifecycle).toBe("dirty");
    expect(shell.save()).toBe(true);
    expect(shell.GetDocumentState().lifecycle).toBe("saved");
    expect(shell.modify(true, true)).toBe(true);
    expect(shell.GetContentGeneration()).toBe(1);
    expect(shell.save(0)).toBe(false);
    expect(shell.GetDocumentState().lifecycle).toBe("dirty");
    expect(shell.history(true)).toBe(true);
    expect(shell.GetDocumentState().lifecycle).toBe("saved");
    const previous = shell.GetMedium();
    shell.replace({ ...initial, id: "replacement", title: "Replaced" });
    expect(previous.IsOpen()).toBe(false);
    expect(shell.GetDocumentId()).toBe("replacement");
    expect(shell.close()).toBe(true);
    expect(shell.GetDocumentState().lifecycle).toBe("closed");
    expect(shell.close()).toBe(false);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () => shell.EnsureOpen(),
    ).toThrow(/Closed document shells/);
  });

  it("rejects invalid document metadata and save acknowledgements", /** Checks rejects invalid document metadata and save acknowledgements. @returns Test callback result. */ () => {
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        new TestShell({ ...initial, lifecycle: "closed" }, { kind: "untitled", name: "Draft" }),
    ).toThrow(/construct a closed/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        createDocument({ id: " ", suiteId: "writer", title: "Draft" }),
    ).toThrow();
    for (const state of [
      { ...initial, contentGeneration: -1 },
      { ...initial, contentGeneration: 0.5 },
      { ...initial, lifecycle: "dirty" as const },
      { ...initial, isModified: true },
    ]) {
      expect(
        /** Runs the test callback. @returns Test callback result. */ () =>
          new TestShell(state, { kind: "untitled", name: "Draft" }),
      ).toThrow();
    }
    const shell = new TestShell(initial, { kind: "untitled", name: "Draft" });
    expect(
      /** Runs the test callback. @returns Test callback result. */ () => shell.save(1),
    ).toThrow(/Saved generation/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () => shell.save(-1),
    ).toThrow(/Saved generation/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () => shell.save(0.5),
    ).toThrow(/Saved generation/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        shell.replace({ ...initial, lifecycle: "closed" }),
    ).toThrow(/closed document state/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () => shell.rename(" "),
    ).toThrow(/Document title/);
  });

  it("keeps a retained medium open across state replacement", /** Checks keeps a retained medium open across state replacement. @returns Test callback result. */ () => {
    const shell = new TestShell(initial, { kind: "untitled", name: "Draft" });
    const medium = shell.GetMedium();
    /** Test fixture type. */ class RetainingShell extends TestShell {
      /** Runs the retain test helper. @param state - Test input. @returns Test callback result. */ public retain(
        state: SfxObjectShellState,
      ) {
        this.ReplaceObjectState(state, this.GetMedium());
      }
    }
    const retained = new RetainingShell(initial, medium);
    retained.retain({ ...initial, title: "Updated" });
    expect(medium.IsOpen()).toBe(true);
    expect(retained.GetTitle()).toBe("Updated");
  });
});
