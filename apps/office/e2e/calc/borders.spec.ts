/** @fileoverview Production Calc border toolbox at desktop/mobile widths and actual native frame/history/ODS operations in a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import type { ScPatternAttr } from "../../src/sc/inc/patattr";
import type { SvxBoxItem } from "../../src/editeng/source/items/frmitems";
import { installKernelFixture } from "../shared/kernel-fixture";
for (const width of [1280, 390])
  test(`uses shared Writer border controls and viewport-safe popups at ${width}px`, /** Verifies actual production DOM and events. @param fixtures - Real page. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 850 });
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Records actual crashes. @param error - Browser error. @returns Nothing. */ (error) => {
        errors.push(error.message);
      },
    );
    await page.goto("/calc");
    const cell = page.getByRole("gridcell", { name: "A1", exact: true }),
      input = page.getByRole("textbox", { name: "Input line", exact: true });
    await input.fill("Native borders");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    const button = page.getByRole("button", { name: "Borders (Shift to overwrite)", exact: true }),
      summary = page.locator('summary[aria-label="Borders (Shift to overwrite) presets"]'),
      popup = page.getByRole("group", {
        name: "Borders (Shift to overwrite) presets",
        exact: true,
      });
    await expect(popup).toHaveCount(0);
    await button.click();
    await expect(popup.getByRole("button")).toHaveCount(12);
    const bounds = await popup.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds?.x).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? width) + (bounds?.width ?? width)).toBeLessThanOrEqual(width);
    await popup.getByRole("button", { name: "Outer Border", exact: true }).click();
    await expect(cell).toHaveCSS("border-top-width", "1px");
    await expect(popup).toHaveCount(0);
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(cell).toHaveCSS("border-top-width", "0px");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(cell).toHaveCSS("border-top-width", "1px");
    await summary.click();
    await popup.getByRole("button", { name: "No Borders", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(popup.getByRole("button", { name: "Outer Border", exact: true })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(popup).toHaveCount(0);
    await expect(button).toBeFocused();
    await page.locator('summary[aria-label="Border Style"]').click();
    await page.getByRole("button", { name: "Dashed", exact: true }).click();
    await expect(cell).toHaveCSS("border-top-style", "dashed");
    await page.getByRole("button", { name: "Border Color", exact: true }).click();
    await expect(cell).toHaveCSS("border-top-color", "rgb(42, 96, 153)");
    await summary.click();
    await popup.getByRole("button", { name: "Criss-Cross Border", exact: true }).click();
    await expect(page.locator("[data-calc-diagonal]")).toHaveCount(2);
    await summary.click();
    await page.screenshot({ path: test.info().outputPath(`borders-${width}.png`) });
    await input.click();
    await expect(popup).toHaveCount(0);
    expect(errors).toEqual([]);
  });
const nativeExports = [
  { module: "src/sc/inc/patattr.ts", names: ["ScPatternAttr"] },
  { module: "src/sc/source/ui/docshell/docsh.ts", names: ["ScDocShell"] },
  { module: "src/sc/source/ui/view/viewdata.ts", names: ["ScViewData"] },
  { module: "src/sc/source/ui/view/viewfunc.ts", names: ["ScViewFunc"] },
  { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
  { module: "src/editeng/source/items/frmitems.ts", names: ["SvxBoxItem", "SvxBoxInfoItem"] },
  { module: "src/editeng/source/items/borderline.ts", names: ["SvxBorderLine"] },
  { module: "src/sc/source/filter/xml/xmlwrap.ts", names: ["readOdsDocument", "writeOdsDocument"] },
] as const;
/** Actual source exports used identically in main and Worker realms. */
type Runtime = typeof import("../../src/sc/inc/patattr") &
  typeof import("../../src/sc/source/ui/docshell/docsh") &
  typeof import("../../src/sc/source/ui/view/viewdata") &
  typeof import("../../src/sc/source/ui/view/viewfunc") &
  typeof import("../../src/sc/inc/address") &
  typeof import("../../src/editeng/source/items/frmitems") &
  typeof import("../../src/editeng/source/items/borderline") &
  typeof import("../../src/sc/source/filter/xml/xmlwrap");
test("runs actual native border history and ODS reopens in a DOM-free Worker", /** Uses real compiled owners in both realms. @param fixtures - Browser. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcBorderFixture", nativeExports);
  const result = await page.evaluate(
    /** Executes actual source kernel. @returns Observations. */ async () => {
      /** Runs the real view/document/history/filter sequence. @returns Native data. */
      async function run() {
        const n = (globalThis as unknown as { CalcBorderFixture: Runtime }).CalcBorderFixture,
          shell = new n.ScDocShell(),
          doc = shell.GetDocument(),
          data = new n.ScViewData(doc),
          view = new n.ScViewFunc(data, shell),
          pos = new n.ScAddress(),
          outer = new n.SvxBoxItem(150),
          inner = new n.SvxBoxInfoItem(151);
        /** Reads original actual native top border width. @param source - Document. @returns Width or absence. */
        function top(source: typeof doc) {
          return (
            ((source.GetPattern(pos) as ScPatternAttr).GetItem(150) as SvxBoxItem)
              .GetTop()
              ?.GetWidth() ?? 0
          );
        }
        try {
          doc.SetValue(pos, 42);
          for (const edge of [0, 1, 2, 3]) outer.SetLine(new n.SvxBorderLine(null, 15), edge);
          view.ApplyPatternLines(new n.ScPatternAttr(doc.getCellAttributeHelper()), outer, inner);
          const applied = top(doc);
          shell.GetUndoManager().Undo(shell);
          const undone = top(doc);
          shell.GetUndoManager().Redo(shell);
          const redone = top(doc),
            reopened = await n.readOdsDocument(n.writeOdsDocument(doc));
          try {
            return { applied, undone, redone, saved: top(reopened), value: reopened.GetValue(pos) };
          } finally {
            reopened.DisposeAttributes();
            reopened.GetSharedStringPool().dispose();
          }
        } finally {
          shell.Dispose();
        }
      }
      const script = Array.from(document.scripts).find(
        /** Locates actual test-only compiled bundle. @param node - Script. @returns Match. */ (
          node,
        ) => node.textContent?.includes(';globalThis["CalcBorderFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing native border bundle");
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
          /** Receives genuine Worker result. @param resolve - Success. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Publishes data. @param event - Worker result. @returns Nothing. */ (event) =>
                resolve(event.data);
            worker.onerror =
              /** Propagates actual error. @param event - Worker error. @returns Nothing. */ (
                event,
              ) => reject(Error(event.message));
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
  expect(result.main).toEqual({ applied: 15, undone: 0, redone: 15, saved: 15, value: 42 });
  expect(result.other).toEqual({ value: result.main, dom: "undefined" });
});
