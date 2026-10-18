/** @fileoverview Verifies actual Chromium mixed native hyperlink reset and grouped undo. */
import { resolve } from "node:path";
import { build } from "vite";
import { expect, test, type Locator } from "@playwright/test";
/** Places actual DOM selection by native node text offsets. @param editor - Original editable paragraph. @param start - Mark offset. @param end - Point offset. @returns Completion. */
async function select(editor: Locator, start: number, end = start) {
  await editor.focus();
  await editor.evaluate(
    /** Maps literal source offsets through real rendered text nodes. @param element - Actual paragraph. @param offsets - Original mark/point. @returns Nothing. */ (
      element,
      offsets,
    ) => {
      const nodes: Text[] = [];
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n !== null; n = walker.nextNode()) nodes.push(n as Text);
      /** Resolves one actual text endpoint. @param offset - Source offset. @returns DOM owner/index. */ function at(
        offset: number,
      ): [Text, number] {
        for (const node of nodes) {
          if (offset <= node.length) return [node, offset];
          offset -= node.length;
        }
        throw Error("Missing source position");
      }
      const [mark, mi] = at(offsets.start),
        [point, pi] = at(offsets.end);
      window.getSelection()?.setBaseAndExtent(mark, mi, point, pi);
      document.dispatchEvent(new Event("selectionchange"));
    },
    { start, end },
  );
}
/** Applies a hyperlink through the real toolbar dialog. @param editor - Original paragraph. @param start - Selection start. @param end - Selection end. @param url - Original target URL. @returns Completion. */
async function add(editor: Locator, start: number, end: number, url: string) {
  const page = editor.page();
  await select(editor, start, end);
  await page.getByRole("button", { name: "Hyperlink", exact: true }).click();
  await page.getByLabel("URL").fill(url);
  await page.getByRole("button", { name: "Apply", exact: true }).click();
}
test("Chromium preserves mixed native dispatch and one undo with pending popup presentation", /** Checks actual mixed native UI state and grouped history. @param fixtures - Browser fixture. @param fixtures.page - Actual browser. @returns Completion. */ async ({
  page,
}) => {
  const errors: string[] = [];
  page.on(
    "pageerror",
    /** Captures real runtime errors. @param error - Actual error. @returns Nothing. */ (error) => {
      errors.push(error.message);
    },
  );
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await editor.fill("abcdefgh");
  await add(editor, 0, 3, "https://example.test/a");
  await add(editor, 5, 8, "https://example.test/b");
  await select(editor, 0, 8);
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await expect(page.getByRole("menuitem", { name: "Hyperlink…" })).toBeDisabled();
  const fixtureId = "writer-native-mixed-fixture",
    result = await build({
      configFile: false,
      define: { "process.env.NODE_ENV": JSON.stringify("production") },
      root: resolve(import.meta.dirname, ".."),
      logLevel: "silent",
      plugins: [
        {
          name: fixtureId,
          /** Resolves the browser-only test entry. @param id - Actual entry. @returns Virtual source identity. */ resolveId(
            id,
          ) {
            return id === fixtureId || id === resolve(import.meta.dirname, "..", fixtureId)
              ? "\0" + fixtureId
              : undefined;
          },
          /** Bundles only this repository's native runtime exports. @param id - Actual source. @returns Original export declarations. */ load(
            id,
          ) {
            return id === "\0" + fixtureId
              ? 'export {createWriterDocumentSession} from "' +
                  resolve(import.meta.dirname, "../src/sw/browser/composition/writer-module.tsx") +
                  '";export {SwPosition} from "' +
                  resolve(import.meta.dirname, "../src/sw/source/core/crsr/pam.ts") +
                  '";'
              : undefined;
          },
        },
      ],
      build: {
        write: false,
        minify: false,
        lib: { entry: fixtureId, name: "WriterNativeMixedFixture", formats: ["iife"] },
      },
    });
  const output = Array.isArray(result) ? result[0] : result;
  if (output === undefined || !("output" in output)) throw Error("Missing browser native fixture");
  const chunk = output.output.find(
    /** Selects the actual executable browser bundle. @param file - Generated output. @returns Whether code. */ (
      file,
    ) => file.type === "chunk",
  );
  if (chunk === undefined || chunk.type !== "chunk") throw Error("Missing native browser code");
  await page.addScriptTag({
    content: chunk.code + "\n;globalThis.WriterNativeMixedFixture = WriterNativeMixedFixture;",
  });
  expect(errors).toEqual([]);
  const native = await page.evaluate(
    /** Runs original native view dispatch in the browser runtime; popup presentation is a separate pending correction. @returns Actual owner results. */ () => {
      const { createWriterDocumentSession, SwPosition } = Reflect.get(
        window,
        "WriterNativeMixedFixture",
      );
      const session = createWriterDocumentSession(),
        doc = session.docShell.GetDoc(),
        node = doc.paragraphs[0];
      try {
        node.SetText("abcdefgh");
        node.SetHyperlink(0, 3, { url: "https://example.test/a" });
        node.SetHyperlink(5, 8, { url: "https://example.test/b" });
        doc.GetUndoManager().Clear();
        const p = new SwPosition(node, 8),
          m = new SwPosition(node, 0);
        try {
          session.view.GetWrtShell().SetPaM(p, m);
        } finally {
          p.Dispose();
          m.Dispose();
        }
        const enabled = session.view.QueryState(".uno:RemoveHyperlink").enabled,
          status = session.view.Execute(".uno:RemoveHyperlink").status,
          count = doc.GetUndoManager().GetUndoActionCount(),
          removed =
            node.GetTextAttrAt(1, 54) === undefined && node.GetTextAttrAt(6, 54) === undefined,
          text = node.GetText();
        session.view.GetWrtShell().Undo();
        const restored =
          node.GetTextAttrAt(1, 54) !== undefined && node.GetTextAttrAt(6, 54) !== undefined;
        session.view.GetWrtShell().Redo();
        return {
          enabled,
          status,
          count,
          removed,
          text,
          restored,
          redone:
            node.GetTextAttrAt(1, 54) === undefined && node.GetTextAttrAt(6, 54) === undefined,
        };
      } finally {
        session.Close();
      }
    },
  );
  expect(native).toEqual({
    enabled: true,
    status: "executed",
    count: 1,
    removed: true,
    text: "abcdefgh",
    restored: true,
    redone: true,
  });
  expect(errors).toEqual([]);
});
