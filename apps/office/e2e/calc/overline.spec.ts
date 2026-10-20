/** @fileoverview Actual Overline menu,glyph painting,history and primary ODS reopen in Chromium. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
const nativeExports = [
  { module: "src/sc/browser/workflows/calc-ods-io.ts", names: ["createCalcDocumentStore"] },
  { module: "src/sc/source/filter/xml/xmlwrap.ts", names: ["readOdsDocument", "writeOdsDocument"] },
  { module: "src/sc/inc/document.ts", names: ["ScDocument"] },
  { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
  { module: "src/sc/source/ui/docshell/docsh.ts", names: ["ScDocShell"] },
  { module: "src/sc/source/ui/view/formatsh.ts", names: ["ScFormatShell"] },
  { module: "src/sc/source/ui/view/viewdata.ts", names: ["ScViewData"] },
  { module: "src/editeng/source/items/textitem.ts", names: ["SvxOverlineItem"] },
  { module: "src/tools/inc/fontenum.ts", names: ["FontLineStyle"] },
  { module: "src/tools/inc/color.ts", names: ["Color"] },
  { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode"] },
] as const;
/** Actual source exports used by isolated browser and Worker acceptance. */
type Runtime = typeof import("../../src/sc/browser/workflows/calc-ods-io") &
  typeof import("../../src/sc/source/filter/xml/xmlwrap") &
  typeof import("../../src/sc/inc/document") &
  typeof import("../../src/sc/inc/address") &
  typeof import("../../src/sc/source/ui/docshell/docsh") &
  typeof import("../../src/sc/source/ui/view/formatsh") &
  typeof import("../../src/sc/source/ui/view/viewdata") &
  typeof import("../../src/editeng/source/items/textitem") &
  typeof import("../../src/tools/inc/fontenum") &
  typeof import("../../src/tools/inc/color") &
  typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
for (const width of [1280, 390]) {
  test(`native Overline menu and ODS reopen at ${width}px`, /** Uses production UI and actual native package storage. @param fixtures - Browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Captures uncaught application errors. @param error - Browser error. @returns Array length. */ (
        error,
      ) => errors.push(error.message),
    );
    await page.goto("/calc");
    await installKernelFixture(page, "CalcOverlineFixture", nativeExports);
    const input = page.getByRole("textbox", { name: "Input line", exact: true }),
      cell = page.getByRole("gridcell", { name: "A1", exact: true });
    await input.fill("Overline text");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    await page.getByRole("menuitem", { name: "Format", exact: true }).click();
    await page.getByRole("menuitem", { name: "Text", exact: true }).click();
    const command = page.getByRole("menuitemcheckbox", { name: "Overline", exact: true });
    await expect(command).toHaveAttribute("aria-checked", "false");
    await command.click();
    const glyph = cell.getByText("Overline text", { exact: true });
    await expect(glyph).toHaveCSS("text-decoration-line", "overline");
    await page.getByRole("button", { name: "Underline", exact: true }).click();
    await expect(cell).toHaveCSS("text-decoration-line", "underline");
    await expect(glyph).toHaveCSS("text-decoration-line", "overline");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(glyph).toHaveCSS("text-decoration-line", "none");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(glyph).toHaveCSS("text-decoration-line", "overline");
    await expect
      .poll(
        /** Reads the actual primary ODS after the shared autosave interval. @returns Saved native enum. */ () =>
          page.evaluate(
            /** Opens source-owned ODS bytes. @returns Saved line enum or sentinel. */ async () => {
              const n = (globalThis as unknown as { CalcOverlineFixture: Runtime })
                  .CalcOverlineFixture,
                store = n.createCalcDocumentStore(),
                records = await store.list(),
                record = records.find(
                  /** Selects the automatically named real document. @param record - Stored metadata. @returns Whether matching. */ (
                    record,
                  ) => record.title === "Overline text",
                );
              if (!record) return -1;
              const stored = await store.load(record.id);
              if (!stored) return -1;
              const doc = await n.readOdsDocument(stored.bytes);
              try {
                return (
                  doc.GetPattern(new n.ScAddress())?.GetItem(105) as InstanceType<
                    typeof n.SvxOverlineItem
                  >
                ).GetLineStyle();
              } finally {
                doc.DisposeAttributes();
              }
            },
          ),
        { timeout: 20_000 },
      )
      .toBe(1);
    await page.reload();
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("button", { name: "Overline text", exact: true }).click();
    await expect(glyph).toHaveCSS("text-decoration-line", "overline");
    await page.getByRole("menuitem", { name: "Format", exact: true }).click();
    await page.getByRole("menuitem", { name: "Text", exact: true }).click();
    await expect(command).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await page.screenshot({ path: test.info().outputPath(`overline-reopened-${width}.png`) });
    expect(errors).toEqual([]);
  });
}
test("preserves native Overline item metadata,history and ODS in a DOM-free Worker", /** Bundles actual owners without test substitutes. @param fixtures - Browser. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcOverlineFixture", nativeExports);
  const result = await page.evaluate(
    /** Executes source classes in both browser realms. @returns Observations. */ async () => {
      /** Performs native typed formatting,toggle,history and ODS operations. @returns Item observations. */ async function run() {
        const n = (globalThis as unknown as { CalcOverlineFixture: Runtime }).CalcOverlineFixture,
          shell = new n.ScDocShell(),
          doc = shell.GetDocument(),
          view = new n.ScViewData(doc),
          format = new n.ScFormatShell(view, shell),
          pos = new n.ScAddress(),
          text = n.unicode("Overline text");
        doc.SetTextCell(pos, text);
        text.dispose();
        /** Reads genuine native line state. @returns Style and color. */ function values() {
          const item = doc.GetPattern(pos)?.GetItem(105) as InstanceType<typeof n.SvxOverlineItem>;
          return [item.GetLineStyle(), item.GetColor().toUInt32()];
        }
        try {
          const item = new n.SvxOverlineItem(n.FontLineStyle.LINESTYLE_DOUBLE, 105);
          item.SetColor(new n.Color(0x123456));
          format.SetOverline(item);
          format.SetOverline();
          const off = values();
          shell.GetUndoManager().Undo(shell);
          const undo = values();
          shell.GetUndoManager().Redo(shell);
          const redo = values(),
            reopened = await n.readOdsDocument(n.writeOdsDocument(doc));
          try {
            const saved = reopened.GetPattern(pos)?.GetItem(105) as InstanceType<
              typeof n.SvxOverlineItem
            >;
            return {
              off,
              undo,
              redo,
              reopened: [saved.GetLineStyle(), saved.GetColor().toUInt32()],
            };
          } finally {
            reopened.DisposeAttributes();
          }
        } finally {
          shell.Close();
        }
      }
      const script = Array.from(document.scripts).find(
        /** Locates the actual installed source bundle. @param node - Script. @returns Whether matching. */ (
          node,
        ) => node.textContent?.includes(';globalThis["CalcOverlineFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing overline source bundle");
      const url = URL.createObjectURL(
          new Blob(
            [
              script,
              "\nonmessage=async()=>postMessage({value:await(",
              run.toString(),
              ")(),dom:typeof document});",
            ],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = new Promise(
          /** Receives the real worker result. @param resolve - Success. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Publishes worker observations. @param event - Message. @returns Completion. */ (
                event,
              ) => resolve(event.data);
            worker.onerror =
              /** Propagates worker errors. @param event - Error. @returns Completion. */ (event) =>
                reject(Error(event.message));
          },
        );
        worker.postMessage(null);
        return { main: await run(), other: await other };
      } finally {
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    },
  );
  const expected = {
    off: [0, 0x123456],
    undo: [2, 0x123456],
    redo: [0, 0x123456],
    reopened: [0, 0x123456],
  };
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});
