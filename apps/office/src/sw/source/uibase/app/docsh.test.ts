/** @fileoverview Verifies Writer document-shell lifecycle and persistence failures. */

import { describe, expect, it, vi } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument, SwDoc } from "../../core/doc/doc";
import type { DefaultFontDevice } from "../../core/doc/default-font";
import { RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT } from "../../../inc/hintids";
import { SvxFontItem } from "../../../../editeng/source/items/textitem";
import {
  createOdtFilterDocument,
  type OdtFilterService,
} from "../../filter/xml/odt-filter-service";
import { SwDocShell } from "./docsh";

/** Runs the makeShell test helper. @returns Test callback result. */ function makeShell() {
  return new SwDocShell(
    createWriterDocument(),
    createDocument({ id: "doc", suiteId: "writer", title: "Draft" }),
  );
}

describe("SwDocShell", /** Groups SwDocShell. @returns Test callback result. */ () => {
  it("retains session locale and device defaults through New after an imported document", /** Verifies shell construction context. @returns Nothing. */ () => {
    const device: DefaultFontDevice = {
      getDefaultFont: /** Resolves the test family. @returns Family. */ () => "Source Han Sans",
    };
    const shell = new SwDocShell(
      new SwDoc({ defaultFontDevice: device, locale: "ja-JP" }),
      createDocument({ id: "doc", suiteId: "writer", title: "Draft" }),
    );
    shell.ReplaceDocument(
      new SwDoc({ locale: "en-US" }),
      createDocument({ id: "imported", suiteId: "writer", title: "Imported" }),
      { kind: "untitled", name: "Imported" },
    );
    const fresh = shell.InitNew(createDocument({ id: "new", suiteId: "writer", title: "New" }));
    expect(fresh.GetLocale()).toBe("ja-JP");
    expect(fresh.GetDefaultFontDevice()).toBe(device);
    expect(fresh.GetPageDesc().GetValue().paperFormat).toBe("A4");
    expect(
      (
        fresh.GetAttrPool().GetUserOrPoolDefaultItem(RES_CHRATR_CJK_FONT) as SvxFontItem
      ).GetResolvedFamilyName(),
    ).toBe("Source Han Sans");
    shell.Close();
  });

  it.each([
    ["en-US", "Letter", RES_CHRATR_CJK_FONT],
    ["ar-SA", "A4", RES_CHRATR_CTL_FONT],
  ] as const)(
    "uses %s session defaults after New",
    /** Checks regional and script defaults. @param locale - Session locale. @param paper - Expected format. @param fontWhich - Script font item. @returns Nothing. */ (
      locale,
      paper,
      fontWhich,
    ) => {
      const device: DefaultFontDevice = {
        getDefaultFont: /** Resolves the test family. @returns Family. */ () => "Device family",
      };
      const shell = new SwDocShell(
        new SwDoc({ defaultFontDevice: device, locale }),
        createDocument({ id: "doc", suiteId: "writer", title: "Draft" }),
      );
      const fresh = shell.InitNew(createDocument({ id: "new", suiteId: "writer", title: "New" }));
      expect(fresh.GetLocale()).toBe(locale);
      expect(fresh.GetPageDesc().GetValue().paperFormat).toBe(paper);
      expect(
        (
          fresh.GetAttrPool().GetUserOrPoolDefaultItem(fontWhich) as SvxFontItem
        ).GetResolvedFamilyName(),
      ).toBe("Device family");
      shell.Close();
    },
  );

  it("renames, publishes state, and rejects replacement with the active graph", /** Checks renames, publishes state, and rejects replacement with the active graph. @returns Test callback result. */ () => {
    const shell = makeShell();
    const hints: string[] = [];
    const unsubscribe = shell.Subscribe(
      /** Runs the test callback. @param hint - Test input. @returns Test callback result. */ (
        hint,
      ) => hints.push(hint.kind),
    );
    expect(shell.RenameDocument(" ")).toBe(false);
    expect(shell.RenameDocument("Draft")).toBe(false);
    expect(shell.RenameDocument(" Final ")).toBe(true);
    expect(shell.RenameDocument("Final again")).toBe(true);
    expect(shell.GetTitle()).toBe("Final again");
    expect(hints).toContain("document-modified");
    expect(hints).toContain("document-state-changed");
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        shell.ReplaceDocument(shell.GetDoc(), shell.GetDocumentState(), shell.GetMedium()),
    ).toThrow(/new Writer graph/);
    unsubscribe();
    shell.Close();
    shell.Close();
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        shell.RenameDocument("After close"),
    ).toThrow(/Closed document shells/);
  });

  it("keeps the current medium when Save As is rejected or its write fails", /** Checks keeps the current medium when Save As is rejected or its write fails. @returns Test callback result. */ async () => {
    const shell = makeShell();
    const original = shell.GetMedium();
    await expect(
      shell.Save(
        /** Runs the test callback. @returns Test callback result. */ async () => ({
          generation: 0,
        }),
      ),
    ).rejects.toThrow(/Save As/);
    await expect(
      shell.SaveAs(
        { kind: "export", name: "Invalid" },
        /** Runs the test callback. @returns Test callback result. */ async () => ({
          generation: 0,
        }),
      ),
    ).rejects.toThrow(/confirmed writable/);
    await expect(
      shell.SaveAs(
        { kind: "primary", name: "Draft", storageKey: "doc" },
        /** Runs the test callback. @returns Test callback result. */ async () => {
          throw new Error("disk failed");
        },
      ),
    ).rejects.toThrow("disk failed");
    expect(shell.GetMedium()).toBe(original);
    expect(original.GetLastOperation()).toMatchObject({ operation: "save-as", state: "failed" });
    await expect(
      shell.SaveAs(
        { kind: "primary", name: "Draft", storageKey: "doc" },
        /** Runs the test callback. @returns Test callback result. */ async () => ({
          generation: 1,
        }),
      ),
    ).rejects.toThrow(/does not match/);
    await shell.SaveAs(
      { kind: "primary", name: "Draft", storageKey: "doc" },
      /** Runs the test callback. @returns Test callback result. */ async () => ({
        generation: 0,
      }),
    );
    expect(original.IsOpen()).toBe(false);
    expect(shell.GetMedium().GetLastOperation()).toMatchObject({
      operation: "save-as",
      state: "succeeded",
    });
    await shell.Save(
      /** Runs the test callback. @returns Test callback result. */ async () => ({ generation: 0 }),
    );
    await expect(
      shell.Save(
        /** Runs the test callback. @returns Test callback result. */ async () => {
          throw new Error("retry failed");
        },
      ),
    ).rejects.toThrow("retry failed");
    shell.Close();
  });

  it("records export outcomes without changing the primary medium", /** Checks records export outcomes without changing the primary medium. @returns Test callback result. */ async () => {
    const shell = makeShell();
    const medium = shell.GetMedium();
    const exported = vi.fn();
    await shell.Export({ kind: "export", name: "document.odt" }, exported);
    expect(exported).toHaveBeenCalledOnce();
    await expect(
      shell.Export(
        { kind: "export", name: "document.odt" },
        /** Runs the test callback. @returns Test callback result. */ () => {
          throw "export failed";
        },
      ),
    ).rejects.toBe("export failed");
    expect(shell.GetMedium()).toBe(medium);
    shell.Close();
  });

  it("rejects stale ODT imports after another document replaces the graph", /** Checks rejects stale ODT imports after another document replaces the graph. @returns Test callback result. */ async () => {
    let resolveImport!: (value: ReturnType<typeof createOdtFilterDocument>) => void;
    const filter: OdtFilterService = {
      Cancel: vi.fn(),
      Close: vi.fn(),
      Export: /** Runs the test callback. @returns Test callback result. */ async () =>
        new Uint8Array(),
      Import: /** Runs the test callback. @returns Test callback result. */ () =>
        new Promise(
          /** Runs the test callback. @param resolve - Test input. @returns Test callback result. */ (
            resolve,
          ) => (resolveImport = resolve),
        ),
    };
    const docShell = new SwDocShell(
      createWriterDocument(),
      createDocument({ id: "doc", suiteId: "writer", title: "Draft" }),
      { kind: "untitled", name: "Draft" },
      filter,
    );
    const pending = docShell.Open(new Uint8Array(), docShell.GetDocumentState());
    docShell.InitNew(createDocument({ id: "other", suiteId: "writer", title: "Other" }));
    resolveImport(createOdtFilterDocument(createWriterDocument(), "Imported"));
    await expect(pending).rejects.toThrow(/stale/);
    docShell.Close();
  });

  it("does not confirm an obsolete save after document replacement", /** Checks does not confirm an obsolete save after document replacement. @returns Test callback result. */ async () => {
    const docShell = makeShell();
    await expect(
      docShell.SaveAs(
        { kind: "primary", name: "Draft", storageKey: "doc" },
        /** Runs the test callback. @returns Test callback result. */ async () => {
          docShell.InitNew(createDocument({ id: "other", suiteId: "writer", title: "Other" }));
          return { generation: 0 };
        },
      ),
    ).rejects.toThrow(/no longer active/);
    expect(docShell.GetDocumentState().id).toBe("other");
    docShell.Close();
  });

  it("restores dirty history and accepts both default and explicit ODT open media", /** Checks restores dirty history and accepts both default and explicit ODT open media. @returns Test callback result. */ async () => {
    const initial = createDocument({ id: "doc", suiteId: "writer", title: "Draft" });
    const filter: OdtFilterService = {
      Cancel: vi.fn(),
      Close: vi.fn(),
      Export: /** Runs the test callback. @returns Test callback result. */ async () =>
        new Uint8Array(),
      Import: /** Runs the test callback. @returns Test callback result. */ async () =>
        createOdtFilterDocument(createWriterDocument(), "Imported"),
    };
    const docShell = new SwDocShell(
      createWriterDocument(),
      { ...initial, isModified: true, lifecycle: "dirty" },
      { kind: "untitled", name: "Draft" },
      filter,
    );
    docShell.ReplaceDocument(
      createWriterDocument(),
      { ...initial, isModified: true, lifecycle: "dirty" },
      { kind: "untitled", name: "Draft" },
    );
    await docShell.Open(new Uint8Array(), initial);
    expect(docShell.GetMedium().kind).toBe("input");
    await docShell.Load(new Uint8Array(), initial, {
      kind: "input",
      name: "Explicit.odt",
      source: { kind: "external", reference: {} },
    });
    expect(docShell.GetMedium().name).toBe("Explicit.odt");
    await docShell.Load(new Uint8Array(), initial);
    expect(docShell.GetMedium().name).toBe("Draft");
    docShell.Close();
  });
});
