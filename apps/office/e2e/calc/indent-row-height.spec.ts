/** @fileoverview Calc shared Writer toolbar/menu/dialog acceptance for indentation and native row height/visibility at desktop and mobile widths. */
import type { ScPatternAttr } from "../../src/sc/inc/patattr";
import type { ScIndentItem } from "../../src/sc/inc/attrib";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { installKernelFixture } from "../shared/kernel-fixture";
const nativeExports = [
  { module: "src/sc/source/ui/docshell/docsh.ts", names: ["ScDocShell"] },
  { module: "src/sc/source/ui/view/viewdata.ts", names: ["ScViewData"] },
  { module: "src/sc/source/ui/view/viewfunc.ts", names: ["ScViewFunc"] },
  { module: "src/sc/source/ui/view/cellsh3.ts", names: ["ScCellShell"] },
  { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
  { module: "src/sc/source/filter/xml/xmlwrap.ts", names: ["readOdsDocument", "writeOdsDocument"] },
] as const;
/** Actual source fixture contracts. */
type Runtime = typeof import("../../src/sc/source/ui/docshell/docsh") &
  typeof import("../../src/sc/source/ui/view/viewdata") &
  typeof import("../../src/sc/source/ui/view/viewfunc") &
  typeof import("../../src/sc/source/ui/view/cellsh3") &
  typeof import("../../src/sc/inc/address") &
  typeof import("../../src/sc/source/filter/xml/xmlwrap");
for (const width of [1280, 390])
  test(`keeps Writer controls,native indentation and row geometry at ${width}px`, /** Actual static browser. @param fixtures - Browser page. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 850 });
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Collects app crashes. @param error - Error. @returns Nothing. */ (error) => {
        errors.push(error.message);
      },
    );
    await page.goto("/calc");
    const input = page.getByRole("textbox", { name: "Input line", exact: true }),
      cell = page.getByRole("gridcell", { name: "A1", exact: true });
    await input.fill("Native layout");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    await page.getByRole("button", { name: "Increase", exact: true }).click();
    await expect(cell).toHaveCSS("padding-left", "14px");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(cell).toHaveCSS("padding-left", "1px");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(cell).toHaveCSS("padding-left", "14px");
    /** Opens the actual native rows submenu. @param command - Resource label. @returns Completion. */
    async function rows(command: string): Promise<void> {
      await page.getByRole("menuitem", { name: "Format", exact: true }).click();
      await page.getByRole("menuitem", { name: "Rows", exact: true }).click();
      await page.getByRole("menuitem", { name: command, exact: true }).click();
    }
    await rows("Row Height…");
    const entry = page.getByRole("spinbutton", { name: "Height", exact: true });
    await expect(entry).toBeFocused();
    expect(
      (await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations,
    ).toEqual([]);
    await entry.fill("1in");
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await expect(cell).toHaveCSS("height", "96px");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(cell).not.toHaveCSS("height", "96px");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(cell).toHaveCSS("height", "96px");
    await rows("Hide Rows");
    await expect(cell).toHaveCount(0);
    const address = page.getByRole("textbox", { name: "Name Box", exact: true });
    await expect(address).toHaveValue("A2");
    await address.fill("A1");
    await address.press("Enter");
    await rows("Show Rows");
    await expect(cell).toHaveCSS("height", "96px");
    await rows("Row Height…");
    await entry.fill("2in");
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(cell).toHaveCSS("height", "96px");
    await page.screenshot({ path: test.info().outputPath(`indent-rows-${width}.png`) });
    expect(errors).toEqual([]);
  });
test("preserves indentation,row history,visibility and ODS in a genuine DOM-free Worker", /** Actual compiled native owners. @param fixtures - Page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcRowsFixture", nativeExports);
  const result = await page.evaluate(
    /** Executes source owners in both realms. @returns Observations. */ async () => {
      /** Native source operation sequence. @returns Actual native results. */
      async function run() {
        const n = (globalThis as unknown as { CalcRowsFixture: Runtime }).CalcRowsFixture,
          shell = new n.ScDocShell(),
          doc = shell.GetDocument(),
          view = new n.ScViewData(doc),
          functions = new n.ScViewFunc(view, shell),
          cell = new n.ScCellShell(functions),
          pos = new n.ScAddress();
        try {
          doc.SetValue(pos, 17);
          cell.ChangeIndent(true);
          const indent = (
            (doc.GetPattern(pos) as ScPatternAttr).GetItem(131) as ScIndentItem
          ).GetValue();
          cell.CompleteRowHeight(1440);
          shell.GetUndoManager().Undo(shell);
          const undo = doc.GetRowHeight(0, 0, false);
          shell.GetUndoManager().Redo(shell);
          const redo = doc.GetRowHeight(0, 0, false);
          cell.ShowRows(false);
          const saved = await n.readOdsDocument(n.writeOdsDocument(doc));
          try {
            return {
              indent,
              undo,
              redo,
              hidden: saved.RowHidden(0, 0),
              retained: saved.GetRowHeight(0, 0, false),
              reopenedIndent: (
                (saved.GetPattern(pos) as ScPatternAttr).GetItem(131) as ScIndentItem
              ).GetValue(),
              value: saved.GetValue(pos),
            };
          } finally {
            saved.DisposeAttributes();
            saved.GetSharedStringPool().dispose();
          }
        } finally {
          shell.Close();
        }
      }
      const script = Array.from(document.scripts).find(
        /** Locates source bundle. @param node - Script. @returns Match. */ (node) =>
          node.textContent?.includes(';globalThis["CalcRowsFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing native row bundle");
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
          /** Receives native worker results. @param resolve - Success. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage = /** Publishes message. @param event - Message. @returns Nothing. */ (
              event,
            ) => resolve(event.data);
            worker.onerror =
              /** Propagates worker failures. @param event - Error. @returns Nothing. */ (event) =>
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
  expect(result.main).toMatchObject({
    indent: 200,
    redo: 1440,
    hidden: true,
    retained: 1440,
    reopenedIndent: 200,
    value: 17,
  });
  expect(result.other).toEqual({ value: result.main, dom: "undefined" });
  expect(result.main.undo).toBeGreaterThan(0);
  expect(result.main.undo).not.toBe(1440);
});
