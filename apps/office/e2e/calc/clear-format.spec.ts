/** @fileoverview Actual native Clear menu/shortcut,history,primary ODS and DOM-free Worker acceptance. */
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
for (const width of [1280, 390]) {
  test(`native Clear menu and shortcut with primary ODS reopen at ${width}px`, /** Operates actual shared Writer controls and native package storage. @param fixtures - Browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Collects application errors. @param error - Error. @returns Count. */ (error) =>
        errors.push(error.message),
    );
    await page.goto("/calc");
    await installKernelFixture(page, "CalcClearFixture", nativeExports);
    const input = page.getByRole("textbox", { name: "Input line", exact: true }),
      cell = page.getByRole("gridcell", { name: "A1", exact: true }),
      bold = page.getByRole("button", { name: "Bold", exact: true });
    await input.fill("Clear formatting");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    await bold.click();
    await expect(cell).toHaveCSS("font-weight", "700");
    await page.getByRole("menuitem", { name: "Format", exact: true }).click();
    await page.getByRole("menuitem", { name: "Clear", exact: true }).click();
    await expect(cell).toHaveCSS("font-weight", "400");
    await expect(cell).toHaveText("Clear formatting");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(cell).toHaveCSS("font-weight", "700");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(cell).toHaveCSS("font-weight", "400");
    await bold.click();
    await page.keyboard.press("Control+m");
    await expect(cell).toHaveCSS("font-weight", "400");
    await expect
      .poll(
        /** Reads actual primary ODS after the shared save interval. @returns Saved direct item count. */ () =>
          page.evaluate(
            /** Opens genuine package bytes. @returns Count or missing sentinel. */ async () => {
              const n = (globalThis as unknown as { CalcClearFixture: Runtime }).CalcClearFixture,
                store = n.createCalcDocumentStore(),
                records = await store.list(),
                record = records.find(
                  /** Chooses the actual automatic title. @param record - Stored metadata. @returns Match. */ (
                    record,
                  ) => record.title === "Clear formatting",
                );
              if (!record) return -1;
              const stored = await store.load(record.id);
              if (!stored) return -1;
              const doc = await n.readOdsDocument(stored.bytes);
              try {
                return (
                  doc.GetPattern(new n.ScAddress()) as NonNullable<
                    ReturnType<typeof doc.GetPattern>
                  >
                )
                  .GetItemSet()
                  .Count();
              } finally {
                doc.DisposeAttributes();
              }
            },
          ),
        { timeout: 20000 },
      )
      .toBe(0);
    await page.reload();
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("button", { name: "Clear formatting", exact: true }).click();
    await expect(cell).toHaveText("Clear formatting");
    await expect(cell).toHaveCSS("font-weight", "400");
    await page.screenshot({ path: test.info().outputPath(`clear-reopened-${width}.png`) });
    expect(errors).toEqual([]);
  });
}
test("keeps native Clear deletion/history and actual ODS in a DOM-free Worker", /** Bundles actual owners without surrogate document services. @param fixtures - Browser. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcClearFixture", nativeExports);
  const result = await page.evaluate(
    /** Runs actual owners in both browser realms. @returns Observations. */ async () => {
      /** Performs original typed formatting,clear,history and ODS. @returns Native observations. */ async function run() {
        const n = (globalThis as unknown as { CalcClearFixture: Runtime }).CalcClearFixture,
          shell = new n.ScDocShell(),
          doc = shell.GetDocument(),
          view = new n.ScViewData(doc),
          pos = new n.ScAddress(),
          str = n.unicode("Clear formatting");
        doc.SetTextCell(pos, str);
        str.dispose();
        try {
          new n.ScFormatShell(view, shell).SetOutlineFont(new n.SvxContourItem(true, 107));
          new n.ScCellShell(new n.ScViewFunc(view, shell)).ResetAttributes();
          const clear = (doc.GetPattern(pos) as NonNullable<ReturnType<typeof doc.GetPattern>>)
            .GetItemSet()
            .Count();
          shell.GetUndoManager().Undo(shell);
          const undo = (
            (doc.GetPattern(pos) as NonNullable<ReturnType<typeof doc.GetPattern>>).GetItem(
              107,
            ) as InstanceType<typeof n.SvxContourItem>
          ).GetValue();
          shell.GetUndoManager().Redo(shell);
          const redo = (doc.GetPattern(pos) as NonNullable<ReturnType<typeof doc.GetPattern>>)
              .GetItemSet()
              .Count(),
            saved = await n.readOdsDocument(n.writeOdsDocument(doc));
          try {
            return {
              clear,
              undo,
              redo,
              reopened: (saved.GetPattern(pos) as NonNullable<ReturnType<typeof saved.GetPattern>>)
                .GetItemSet()
                .Count(),
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
        ) => node.textContent?.includes(';globalThis["CalcClearFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing clear source bundle");
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
  const expected = { clear: 0, undo: true, redo: 0, reopened: 0 };
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});
