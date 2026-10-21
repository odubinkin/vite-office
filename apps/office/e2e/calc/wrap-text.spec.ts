/** @fileoverview Actual shared Wrap Text toolbar, native/manual geometry, primary ODS and DOM-free Worker contracts. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
const nativeExports = [
  { module: "src/sc/browser/workflows/calc-ods-io.ts", names: ["createCalcDocumentStore"] },
  { module: "src/sc/source/filter/xml/xmlwrap.ts", names: ["readOdsDocument", "writeOdsDocument"] },
  { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
  { module: "src/sc/source/ui/docshell/docsh.ts", names: ["ScDocShell"] },
  { module: "src/sc/source/ui/view/formatsh.ts", names: ["ScFormatShell"] },
  { module: "src/sc/source/ui/view/viewdata.ts", names: ["ScViewData"] },
  { module: "src/sc/inc/attrib.ts", names: ["ScLineBreakCell"] },
  { module: "src/sfx2/source/control/request.ts", names: ["SfxRequest"] },
] as const;
/** Actual bundled source owners. */
type Runtime = typeof import("../../src/sc/browser/workflows/calc-ods-io") &
  typeof import("../../src/sc/source/filter/xml/xmlwrap") &
  typeof import("../../src/sc/inc/address") &
  typeof import("../../src/sc/source/ui/docshell/docsh") &
  typeof import("../../src/sc/source/ui/view/formatsh") &
  typeof import("../../src/sc/source/ui/view/viewdata") &
  typeof import("../../src/sc/inc/attrib") &
  typeof import("../../src/sfx2/source/control/request");
for (const width of [1280, 390]) {
  test(`wraps real text in native manual row geometry and reopens primary ODS at ${width}px`, /** Exercises production controls without test state. @param fixtures - Browser page. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Captures actual app crashes. @param error - Browser error. @returns Nothing. */ (
        error,
      ) => {
        errors.push(error.message);
      },
    );
    await page.goto("/calc");
    await installKernelFixture(page, "CalcWrapFixture", nativeExports);
    const input = page.getByRole("textbox", { name: "Input line", exact: true }),
      cell = page.getByRole("gridcell", { name: "A1", exact: true }),
      button = page.getByRole("button", { name: "Wrap Text", exact: true });
    await input.fill("Native wrapping text across multiple lines");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    await page.getByRole("menuitem", { name: "Format", exact: true }).click();
    await page.getByRole("menuitem", { name: "Rows", exact: true }).click();
    await page.getByRole("menuitem", { name: "Row Height…", exact: true }).click();
    await page.getByRole("spinbutton", { name: "Height", exact: true }).fill("1in");
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await expect(cell).toHaveCSS("height", "96px");
    await expect(cell).toHaveCSS("white-space", "nowrap");
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(cell).toHaveCSS("white-space", "pre-wrap");
    expect((await cell.locator("div.shrink-0").boundingBox())?.height).toBeGreaterThan(25);
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(cell).toHaveCSS("white-space", "nowrap");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(cell).toHaveCSS("white-space", "pre-wrap");
    await expect
      .poll(
        /** Reads genuine committed primary ODS through original package owners. @returns Persisted wrap and height. */ () =>
          page.evaluate(
            /** Loads actual storage bytes. @returns Native saved fields or absence. */ async () => {
              const n = (globalThis as unknown as { CalcWrapFixture: Runtime }).CalcWrapFixture,
                store = n.createCalcDocumentStore(),
                records = await store.list(),
                record = records.find(
                  /** Resolves the genuine document identity. @param record - Primary metadata. @returns Matching title. */ (
                    record,
                  ) => record.title === "Native wrapping",
                );
              if (!record) return null;
              const saved = await store.load(record.id);
              if (!saved) return null;
              const doc = await n.readOdsDocument(saved.bytes);
              try {
                return [
                  (
                    doc.GetPattern(new n.ScAddress())?.GetItem(139) as InstanceType<
                      typeof n.ScLineBreakCell
                    >
                  ).GetValue(),
                  doc.GetRowHeight(0, 0, false),
                ];
              } finally {
                doc.DisposeAttributes();
              }
            },
          ),
        { timeout: 20_000 },
      )
      .toEqual([true, 1440]);
    await page.reload();
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("button", { name: "Native wrapping", exact: true }).click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(cell).toHaveCSS("white-space", "pre-wrap");
    await expect(cell).toHaveCSS("height", "96px");
    expect((await cell.locator("div.shrink-0").boundingBox())?.height).toBeGreaterThan(25);
    await page.screenshot({ path: test.info().outputPath(`wrap-reopened-${width}.png`) });
    expect(errors).toEqual([]);
  });
}
test("retains native wrap request,history and ODS behavior in a DOM-free Worker", /** Uses actual bundled owners in both realms. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcWrapFixture", nativeExports);
  const result = await page.evaluate(
    /** Runs actual native classes without a UI document substitute. @returns Realm observations. */ async () => {
      /** Executes a genuine native wrap operation and original undo/redo. @returns Native fields. */ async function run() {
        const n = (globalThis as unknown as { CalcWrapFixture: Runtime }).CalcWrapFixture,
          shell = new n.ScDocShell(),
          doc = shell.GetDocument(),
          view = new n.ScViewData(doc),
          format = new n.ScFormatShell(view, shell),
          pos = new n.ScAddress(),
          request = new n.SfxRequest(10230);
        try {
          format.ExecuteWrapText(request);
          const on = format.GetWrapTextState();
          shell.GetUndoManager().Undo(shell);
          const undo = format.GetWrapTextState();
          shell.GetUndoManager().Redo(shell);
          const redo = format.GetWrapTextState();
          const reopened = await n.readOdsDocument(n.writeOdsDocument(doc));
          try {
            return {
              on,
              undo,
              redo,
              done: request.IsDone(),
              which: request.GetArgs()[0]?.Which(),
              saved: (
                reopened.GetPattern(pos)?.GetItem(139) as InstanceType<typeof n.ScLineBreakCell>
              ).GetValue(),
            };
          } finally {
            reopened.DisposeAttributes();
          }
        } finally {
          shell.Close();
        }
      }
      const script = Array.from(document.scripts).find(
        /** Finds the genuine installed kernel bundle. @param node - Script. @returns Bundle identity. */ (
          node,
        ) => node.textContent?.includes(';globalThis["CalcWrapFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing native bundle");
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
          /** Observes actual Worker success or error. @param resolve - Success. @param reject - Error. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Publishes genuine result. @param event - Worker event. @returns Nothing. */ (
                event,
              ) => {
                resolve(event.data);
              };
            worker.onerror =
              /** Publishes genuine failure. @param event - Worker error. @returns Nothing. */ (
                event,
              ) => {
                reject(Error(event.message));
              };
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
  const expected = { on: true, undo: false, redo: true, done: true, which: 139, saved: true };
  expect(result).toEqual({ main: expected, other: { value: expected, dom: "undefined" } });
});
