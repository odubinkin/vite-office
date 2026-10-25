/** @fileoverview Actual browser mouse formula entry and DOM-free native-owner dispatch. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
for (const width of [1280, 390])
  test(`points formula references and cell/header blocks at ${width}px`, /** Real browser caret and captured mouse gestures operate on the production document. @param fixtures - Browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/calc");
    const grid = page.getByRole("grid"),
      line = page.getByRole("textbox", { name: "Input line" });
    await grid.getByRole("gridcell", { name: "A1", exact: true }).click();
    await page.keyboard.type("4");
    await page.keyboard.press("Enter");
    await page.keyboard.type("6");
    await page.keyboard.press("Enter");
    const name = page.getByRole("textbox", { name: "Name Box" });
    await name.fill("D5");
    await name.press("Enter");
    await page.getByRole("button", { name: "Formula", exact: true }).click();
    await line.fill("=SUM(");
    const first = await grid.getByRole("gridcell", { name: "A1", exact: true }).boundingBox(),
      last = await grid.getByRole("gridcell", { name: "A2", exact: true }).boundingBox();
    if (!first || !last) throw Error("Missing actual grid geometry");
    await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2);
    await page.mouse.down();
    await page.mouse.move(last.x + last.width / 2, last.y + last.height / 2, { steps: 4 });
    await page.mouse.up();
    await expect(line).toHaveValue("=SUM(A1:A2");
    await expect(line).toBeFocused();
    expect(
      await line.evaluate(
        /** Reads actual browser UTF16 selection. @param element - Input. @returns Endpoints. */ (
          element,
        ) => [
          (element as HTMLInputElement).selectionStart,
          (element as HTMLInputElement).selectionEnd,
        ],
      ),
    ).toEqual([5, 10]);
    await page.keyboard.type(")");
    await expect(line).toHaveValue("=SUM(A1:A2)");
    await line.press("Enter");
    await expect(grid.getByRole("gridcell", { name: "D5", exact: true })).toHaveText("10");
    await grid.getByRole("gridcell", { name: "B2", exact: true }).click();
    await grid.getByRole("gridcell", { name: "C4", exact: true }).click({ modifiers: ["Shift"] });
    await expect(grid.getByRole("gridcell", { name: "B4", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(grid).toHaveAttribute("aria-activedescendant", /-0-1-1$/);
    await grid.getByRole("gridcell", { name: "C3", exact: true }).click({ modifiers: ["Control"] });
    await expect(grid.getByRole("gridcell", { name: "C3", exact: true })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    await page.getByRole("button", { name: "Column B", exact: true }).click();
    await page
      .getByRole("button", { name: "Column C", exact: true })
      .click({ modifiers: ["Shift"] });
    await expect(grid.getByRole("gridcell", { name: "B5", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(grid.getByRole("gridcell", { name: "C5", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await name.fill("A1");
    await name.press("Enter");
    await page.keyboard.type("=");
    const inline = page.getByRole("textbox", { name: "Edit cell A1" }),
      original = await inline.elementHandle(),
      start = await grid.getByRole("gridcell", { name: "B2", exact: true }).boundingBox(),
      viewport = await grid.boundingBox();
    if (!original || !start || !viewport) throw Error("Missing actual inline reference window");
    const mouseX = start.x + start.width / 2,
      mouseY = Math.min(799, viewport.y + viewport.height + 5);
    await page.mouse.move(mouseX, start.y + start.height / 2);
    await page.mouse.down();
    await page.mouse.move(mouseX, mouseY, { steps: 6 });
    await page.mouse.up();
    await expect(grid.getByRole("gridcell", { name: "A1", exact: true })).toHaveCount(0);
    await expect(inline).toBeFocused();
    expect(
      await inline.evaluate(
        /** Verifies actual DOM edit-view identity across virtual painting. @param node - Current editor. @param previous - Original editor. @returns Same view. */ (
          node,
          previous,
        ) => node === previous,
        original,
      ),
    ).toBe(true);
    const pointed = await inline.inputValue();
    await page.keyboard.type("+1");
    await expect(inline).toHaveValue(pointed + "+1");
    await page.keyboard.press("Escape");
    await expect(inline).toHaveCount(0);
    await expect(grid.getByRole("gridcell", { name: "A1", exact: true })).toHaveText("4");
    await page.keyboard.type("=SUM(B2)");
    const caretEditor = page.getByRole("textbox", { name: "Edit cell A1" });
    await caretEditor.click({ position: { x: 15, y: 5 } });
    await page.keyboard.press("ArrowRight");
    await expect(caretEditor).toHaveValue("=SUM(B2)");
    await page.keyboard.press("Escape");
    await page.keyboard.type("=");
    await grid.getByRole("gridcell", { name: "B2", exact: true }).click();
    const wordEditor = page.getByRole("textbox", { name: "Edit cell A1" });
    await wordEditor.dblclick({ position: { x: 15, y: 5 } });
    await page.keyboard.type("7");
    await expect(wordEditor).toHaveValue("=7");
    await page.keyboard.press("Escape");
    await page.screenshot({ path: `output/playwright/task77-pointing-${width}.png` });
  });
test("dispatches pointing-created formulas through actual owners in Chromium and a DOM-free Worker", /** Real model input,calculation and history need no DOM implementation. @param fixtures - Browser. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "CalcPointingFixture", [
    { module: "src/sc/browser/controller/calc-view-controller.ts", names: ["CalcViewController"] },
    { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
    { module: "src/sc/inc/global.ts", names: ["ScInputMode"] },
  ]);
  const result = await page.evaluate(
    /** Runs identical actual owner dispatch in both runtimes. @returns Observations. */ async () => {
      /** Uses the production controller and original input/module/view/document owners. @returns Actual formula/history observations. */ function run() {
        const n = (
          globalThis as unknown as {
            CalcPointingFixture: typeof import("../../src/sc/browser/controller/calc-view-controller") &
              typeof import("../../src/sc/inc/address") &
              typeof import("../../src/sc/inc/global");
          }
        ).CalcPointingFixture;
        const c = new n.CalcViewController(),
          doc = c.shell.GetDocument();
        doc.SetValue(new n.ScAddress(), 4);
        doc.SetValue(new n.ScAddress(0, 1, 0), 6);
        c.Select(3, 4);
        c.StartInput(n.ScInputMode.SC_INPUT_TYPE, "=SUM(");
        c.StartPointer(new n.ScAddress(), false, false);
        c.MovePointer(new n.ScAddress(0, 1, 0));
        c.EndPointer();
        const draft = c.Input(),
          origin = c.Position().GetVars();
        c.inputHandler.PrepareReferenceInput();
        c.ChangeInput(c.Input() + ")");
        const accepted = c.Commit(),
          value = doc.GetValue(new n.ScAddress(3, 4, 0)),
          undo = c.shell.Undo(),
          redo = c.shell.Redo();
        c.Close();
        return { draft, origin, accepted, value, undo, redo };
      }
      const script = Array.from(document.scripts).find(
        /** Locates the bundled actual production owners. @param item - Script. @returns Match. */ (
          item,
        ) => item.textContent?.includes(';globalThis["CalcPointingFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing actual owner bundle");
      const url = URL.createObjectURL(
          new Blob(
            [script, "\npostMessage({value:(", run.toString(), ")(),dom:typeof document});"],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = await new Promise(
          /** Observes actual Worker dispatch completion. @param resolve - Result. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Receives the actual Worker result. @param event - Message. @returns Nothing. */ (
                event,
              ) => resolve(event.data);
            worker.onerror =
              /** Forwards actual Worker errors. @param event - Error. @returns Nothing. */ (
                event,
              ) => reject(Error(event.message));
          },
        );
        return { main: run(), other };
      } finally {
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    },
  );
  const expected = {
    draft: "=SUM(A1:A2",
    origin: [3, 4, 0],
    accepted: true,
    value: 10,
    undo: true,
    redo: true,
  };
  expect(result).toEqual({ main: expected, other: { value: expected, dom: "undefined" } });
});
