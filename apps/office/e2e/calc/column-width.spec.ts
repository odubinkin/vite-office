/** @fileoverview Actual native column width menu/shortcut,history,primary ODS and DOM-free Worker acceptance. */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
const nativeExports = [
  { module: "src/sc/source/ui/docshell/docsh.ts", names: ["ScDocShell"] },
  { module: "src/sc/source/ui/view/viewdata.ts", names: ["ScViewData"] },
  { module: "src/sc/source/ui/view/viewfunc.ts", names: ["ScViewFunc"] },
  { module: "src/sc/source/ui/view/cellsh3.ts", names: ["ScCellShell"] },
  { module: "src/sc/source/ui/view/formatsh.ts", names: ["ScFormatShell"] },
  { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
  { module: "src/editeng/inc/contouritem.ts", names: ["SvxContourItem"] },
  { module: "src/sc/browser/workflows/calc-ods-io.ts", names: ["createCalcDocumentStore"] },
  { module: "src/sc/source/filter/xml/xmlwrap.ts", names: ["readOdsDocument", "writeOdsDocument"] },
  { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode"] },
] as const;
/** Actual compiled native owners shared by isolated page/Worker acceptance. */
type Runtime = typeof import("../../src/sc/source/ui/docshell/docsh") &
  typeof import("../../src/sc/source/ui/view/viewdata") &
  typeof import("../../src/sc/source/ui/view/viewfunc") &
  typeof import("../../src/sc/source/ui/view/cellsh3") &
  typeof import("../../src/sc/source/ui/view/formatsh") &
  typeof import("../../src/sc/inc/address") &
  typeof import("../../src/editeng/inc/contouritem") &
  typeof import("../../src/sc/browser/workflows/calc-ods-io") &
  typeof import("../../src/sc/source/filter/xml/xmlwrap") &
  typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
/** Opens the actual source Format/Columns placement. @param page - Actual browser page. @param command - Native command label. @returns Completion. */
async function columnCommand(
  page: import("@playwright/test").Page,
  command: string,
): Promise<void> {
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Columns", exact: true }).click();
  await page.getByRole("menuitem", { name: command, exact: true }).click();
}
for (const width of [1280, 390]) {
  test(`native column width,visibility and primary ODS reopen at ${width}px`, /** Uses actual shared menus and genuine saved package bytes. @param fixtures - Browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Captures uncaught application errors. @param error - Browser error. @returns Count. */ (
        error,
      ) => errors.push(error.message),
    );
    await page.goto("/calc");
    await installKernelFixture(page, "CalcColumnFixture", nativeExports);
    const input = page.getByRole("textbox", { name: "Input line", exact: true }),
      cell = page.getByRole("gridcell", { name: "A1", exact: true });
    await input.fill("Column geometry");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    await expect(cell).toHaveCSS("width", "85px");
    await columnCommand(page, "Column Width…");
    const entry = page.getByRole("spinbutton", { name: "Width", exact: true });
    await expect(entry).toBeFocused();
    const originalValue = Number(await entry.getAttribute("aria-valuenow"));
    await page.getByRole("button", { name: "Increase width", exact: true }).click();
    await expect(entry).toHaveAttribute(
      "aria-valuenow",
      String(Math.round((originalValue + 0.1) * 100) / 100),
    );
    await expect(entry).toBeFocused();
    await page.getByRole("button", { name: "Decrease width", exact: true }).click();
    await expect(entry).toHaveAttribute("aria-valuenow", String(originalValue));

    expect(
      (await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations,
    ).toEqual([]);
    await entry.fill("1in");
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await expect(cell).toHaveCSS("width", "96px");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(cell).toHaveCSS("width", "85px");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(cell).toHaveCSS("width", "96px");
    await columnCommand(page, "Hide Columns");
    await expect(cell).toHaveCount(0);
    await expect(page.getByRole("textbox", { name: "Name Box", exact: true })).toHaveValue("B1");
    const address = page.getByRole("textbox", { name: "Name Box", exact: true });
    await address.fill("A1");
    await address.press("Enter");
    await columnCommand(page, "Show Columns");
    await expect(cell).toHaveCSS("width", "96px");
    await columnCommand(page, "Column Width…");
    await entry.fill("2in");
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(cell).toHaveCSS("width", "96px");
    await expect
      .poll(
        /** Reads genuine primary-medium ODS geometry. @returns Stored width or missing sentinel. */ () =>
          page.evaluate(
            /** Opens actual saved bytes. @returns Native width. */ async () => {
              const n = (globalThis as unknown as { CalcColumnFixture: Runtime }).CalcColumnFixture,
                store = n.createCalcDocumentStore(),
                records = await store.list(),
                record = records.find(
                  /** Finds actual automatic title. @param record - Metadata. @returns Match. */ (
                    record,
                  ) => record.title === "Column geometry",
                );
              if (!record) return -1;
              const stored = await store.load(record.id);
              if (!stored) return -1;
              const doc = await n.readOdsDocument(stored.content);
              try {
                return doc.GetColWidth(0, 0);
              } finally {
                doc.DisposeAttributes();
              }
            },
          ),
        { timeout: 20000 },
      )
      .toBe(1440);
    await page.reload();
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("button", { name: "Column geometry", exact: true }).click();
    await expect(cell).toHaveText("Column geometry");
    await expect(cell).toHaveCSS("width", "96px");
    await page.screenshot({ path: test.info().outputPath(`column-reopened-${width}.png`) });
    expect(errors).toEqual([]);
  });
}
test("keeps native column width/visibility/history and actual ODS in a DOM-free Worker", /** Bundles actual owners without surrogate document services. @param fixtures - Browser. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcColumnFixture", nativeExports);
  const result = await page.evaluate(
    /** Runs actual owners in both browser realms. @returns Observations. */ async () => {
      /** Performs original typed formatting,clear,history and ODS. @returns Native observations. */ async function run() {
        const n = (globalThis as unknown as { CalcColumnFixture: Runtime }).CalcColumnFixture,
          shell = new n.ScDocShell(),
          doc = shell.GetDocument(),
          view = new n.ScViewData(doc),
          pos = new n.ScAddress(),
          str = n.unicode("Clear formatting");
        doc.SetTextCell(pos, str);
        str.dispose();
        try {
          const cell = new n.ScCellShell(new n.ScViewFunc(view, shell));
          const recording = cell.CompleteColumnWidth(1440);
          const width = doc.GetColWidth(0, 0);
          shell.GetUndoManager().Undo(shell);
          const undo = doc.GetColWidth(0, 0);
          shell.GetUndoManager().Redo(shell);
          const redo = doc.GetColWidth(0, 0);
          cell.ShowColumns(false);
          const hidden = doc.ColHidden(0, 0),
            retained = doc.GetColWidth(0, 0, false);
          const saved = await n.readOdsDocument(n.writeOdsDocument(doc));
          try {
            return {
              width,
              undo,
              redo,
              hidden,
              retained,
              reopened: saved.GetColWidth(0, 0, false),
              reopenedHidden: saved.ColHidden(0, 0),
              recorded: recording.IsDone(),
            };
          } finally {
            saved.DisposeAttributes();
          }
        } finally {
          shell.Close();
        }
      }

      const script = Array.from(document.scripts).find(
        /** Locates the actual installed source bundle. @param node - Script. @returns Whether matching. */ (
          node,
        ) => node.textContent?.includes(';globalThis["CalcColumnFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing column source bundle");
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
    width: 1440,
    undo: 1280,
    redo: 1440,
    hidden: true,
    retained: 1440,
    reopened: 1440,
    reopenedHidden: true,
    recorded: true,
  };
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});
