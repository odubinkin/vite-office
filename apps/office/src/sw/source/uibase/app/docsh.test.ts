/** @fileoverview Verifies Writer document-shell lifecycle and persistence failures. */
import { describe, expect, it, vi } from "vitest";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument, SwDoc } from "../../core/doc/doc";
import { applyWriterParagraphList } from "../../core/doc/list";
import type { DefaultFontDevice } from "../../core/doc/default-font";
import { RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT } from "../../../inc/hintids";
import { SvxFontItem } from "../../../../editeng/source/items/textitem";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import {
  createOdtFilterDocument,
  createInlineOdtFilterService,
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
  it("opens Markdown atomically through the native reader", /** Checks invalid UTF-8 does not replace the current model. @returns Nothing. */ () => {
    const shell = makeShell();
    const original = shell.GetDoc();
    const metadata = createDocument({ id: "markdown", suiteId: "writer", title: "Markdown" });
    const medium = {
      kind: "input" as const,
      name: "file.md",
      filterId: "Markdown",
      mediaType: "text/markdown;charset=utf-8",
      source: { kind: "external" as const, reference: {} },
    };
    try {
      expect(() => shell.OpenMarkdown(new Uint8Array([0xff]), metadata, medium)).toThrow();
      expect(() => shell.OpenMarkdown(new Uint8Array(), metadata, medium)).toThrow();
      expect(shell.GetDoc()).toBe(original);
      const loaded = shell.OpenMarkdown(new TextEncoder().encode("# Imported"), metadata, medium);
      expect(loaded.paragraphs[0]?.GetParagraphStyle()).toBe("heading-1");
      expect(shell.GetMedium().GetLastOperation()).toMatchObject({
        operation: "open",
        state: "succeeded",
      });
    } finally {
      shell.Close();
    }
  });
  it("passes a URL-backed Markdown medium to native hyperlink resolution", () => {
    const shell = makeShell();
    try {
      const document = shell.OpenMarkdown(
        new TextEncoder().encode("[Chart](assets/chart.png)"),
        createDocument({ id: "linked-markdown", suiteId: "writer", title: "Linked Markdown" }),
        {
          kind: "input",
          name: "https://example.test/docs/report.md",
          filterId: "Markdown",
          source: { kind: "external", reference: {} },
        },
      );
      expect(projectWriterTextRuns(document.paragraphs[0])[0]?.hyperlink?.url).toBe(
        "https://example.test/docs/assets/chart.png",
      );
    } finally {
      shell.Close();
    }
  });
  it("opens valid RTF atomically and preserves the old graph on malformed input", /** Checks native filter and shell lifecycle boundary. @returns Nothing. */ () => {
    const shell = makeShell();
    const original = shell.GetDoc();
    const metadata = createDocument({ id: "rtf", suiteId: "writer", title: "RTF" });
    const medium = {
      kind: "input" as const,
      name: "file.rtf",
      filterId: "Rich Text Format",
      mediaType: "application/rtf",
      source: { kind: "external" as const, reference: {} },
    };
    try {
      expect(() =>
        shell.OpenRtf(new TextEncoder().encode("{\\rtf1 broken"), metadata, medium),
      ).toThrow();
      expect(shell.GetDoc()).toBe(original);
      const loaded = shell.OpenRtf(
        new TextEncoder().encode("{\\rtf1\\ansi Imported}"),
        metadata,
        medium,
      );
      expect(loaded.paragraphs[0]?.GetText()).toBe("Imported");
      expect(shell.GetMedium().GetLastOperation()).toMatchObject({
        operation: "open",
        state: "succeeded",
      });
    } finally {
      shell.Close();
    }
  });
  it("retains upstream single-paragraph ASCII numbering suppression", /** Checks the original endpoint condition for full-document export. @returns Nothing. */ () => {
    const shell = makeShell();
    try {
      const paragraph = shell.GetDoc().paragraphs[0];
      if (paragraph === undefined) throw new Error("Missing first paragraph.");
      paragraph.SetText("Only");
      applyWriterParagraphList(paragraph, { kind: "numbered", level: 0 });
      expect(shell.SerializeText()).toBe("Only\n");
    } finally {
      shell.Close();
    }
  });
  it("serializes complete text through native ASCII numbering and final line rules", /** Checks the shell filter output on connected body nodes. @returns Nothing. */ () => {
    const shell = makeShell();
    try {
      const document = shell.GetDoc();
      const first = document.paragraphs[0];
      if (first === undefined) throw new Error("Missing first paragraph.");
      const second = document.nodes.MakeTextNode("Second");
      first.SetText("First");
      applyWriterParagraphList(first, { kind: "numbered", level: 0 });
      applyWriterParagraphList(second, { kind: "numbered", level: 0 });
      expect(shell.SerializeText()).toBe("    1. First\n    2. Second\n");
    } finally {
      shell.Close();
    }
  });
  it("writes table rows with native ASCII tabs and cell paragraph breaks", /** Checks the full-body table writer path. @returns Nothing. */ () => {
    const shell = makeShell();
    try {
      const document = shell.GetDoc();
      const first = document.paragraphs[0];
      if (first === undefined) throw new Error("Missing first paragraph.");
      first.SetText("Before");
      const table = document.nodes.MakeTableNode("Grid", {}, first);
      const row = document.nodes.AppendTableRow(table, 2);
      row.GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText("A");
      row.GetTabBoxes()[1]?.GetParagraphs()[0]?.SetText("B");
      document.nodes.MakeTextNode("After");
      expect(shell.SerializeText()).toBe("Before\nA\tB\nAfter\n");
    } finally {
      shell.Close();
    }
  });
  it("forwards the retained default-font device through a real ODT open", /** Observes the real filter boundary while actual package serialization/import executes. @returns Completion. */ async () => {
    const device: DefaultFontDevice = {
        getDefaultFont: /** Supplies the platform device family. @returns Family. */ () =>
          "Device Face",
      },
      filter = createInlineOdtFilterService(),
      imported = vi.spyOn(filter, "Import"),
      metadata = createDocument({ id: "device-open", suiteId: "writer", title: "Device Open" }),
      shell = new SwDocShell(
        new SwDoc({ defaultFontDevice: device, locale: "ja-JP" }),
        metadata,
        { kind: "untitled", name: "Device Open" },
        filter,
      );
    try {
      const bytes = await shell.SerializeOdt();
      await shell.Open(bytes, metadata);
      expect(imported.mock.calls[0]?.[2]?.defaultFontDevice).toBe(device);
      expect(shell.GetDefaultFontDevice()).toBe(device);
      expect(
        (
          shell.GetDoc().GetAttrPool().GetUserOrPoolDefaultItem(RES_CHRATR_CJK_FONT) as SvxFontItem
        ).GetFamilyName(),
      ).toBe("Device Face");
    } finally {
      shell.Close();
      imported.mockRestore();
    }
  });
  it("uses default modified and save acknowledgements for the current generation", /** Checks the Writer overrides without explicit parameters. @returns Nothing. */ () => {
    /** Exposes existing protected lifecycle operations for their default contract. */
    class DefaultShell extends SwDocShell {
      /** Applies the default modified transition. @returns Whether changed. */
      public modifyDefaults(): boolean {
        return this.SetModified();
      }
      /** Acknowledges the current generation by default. @returns Whether changed. */
      public saveDefaults(): boolean {
        return this.SaveCompleted();
      }
    }
    const shell = new DefaultShell(
      new SwDoc(),
      createDocument({ id: "default-lifecycle", suiteId: "writer", title: "Defaults" }),
    );
    try {
      expect(shell.modifyDefaults()).toBe(true);
      expect(shell.IsModified()).toBe(true);
      expect(shell.GetContentGeneration()).toBe(0);
      expect(shell.saveDefaults()).toBe(true);
      expect(shell.IsModified()).toBe(false);
    } finally {
      shell.Close();
    }
  });
  it("reports a browser save failure and preserves a newer dirty generation", /** Checks save feedback and concurrent edits. @returns Nothing. */ () => {
    const shell = makeShell();
    shell.GetDoc().paragraphs[0]?.InsertText("Edited", 0);
    const generation = shell.GetDocumentState().contentGeneration;
    shell.SetMediumOperation("save", "failed", generation, "Storage unavailable");
    expect(shell.GetMedium().GetLastOperation()).toMatchObject({
      operation: "save",
      state: "failed",
      message: "Storage unavailable",
    });
    shell.AdoptSavedBrowserCopy("copy-id", "Copy", generation - 1);
    expect(shell.GetDoc().paragraphs[0]?.GetText()).toBe("Edited");
    shell.Close();
  });
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
    expect(fresh.GetPageDesc().GetValue()).toMatchObject({ width: 11906, height: 16838 });
    expect(
      (
        fresh.GetAttrPool().GetUserOrPoolDefaultItem(RES_CHRATR_CJK_FONT) as SvxFontItem
      ).GetFamilyName(),
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
      expect(fresh.GetPageDesc().GetValue()).toMatchObject(
        paper === "Letter" ? { width: 12240, height: 15840 } : { width: 11906, height: 16838 },
      );
      expect(
        (fresh.GetAttrPool().GetUserOrPoolDefaultItem(fontWhich) as SvxFontItem).GetFamilyName(),
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
    expect(shell.GetWrtShell()).toBeUndefined();
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
      ExportXml:
        /** Returns a deterministic browser XML result for shell lifecycle tests.  @returns Operation result. */ async () => ({
          format: "xml",
          files: {},
        }),
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
      ExportXml:
        /** Returns a deterministic browser XML result for shell lifecycle tests.  @returns Operation result. */ async () => ({
          format: "xml",
          files: {},
        }),
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
