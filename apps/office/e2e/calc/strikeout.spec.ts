/** @fileoverview Actual Strikeout menu,glyph painting,history and primary ODS reopen in Chromium. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
const nativeExports = [
  { module: "src/cppu/inc/com/sun/star/uno/Any.ts", names: ["Any"] },
  { module: "src/xmloff/source/style/cdouthdl.ts", names: ["XMLCrossedOutTypePropHdl"] },
  { module: "src/xmloff/source/core/xmluconv.ts", names: ["SvXMLUnitConverter"] },
  { module: "src/udkapi/com/sun/star/uno/TypeClass.ts", names: ["TypeClass"] },
  { module: "src/sc/browser/workflows/calc-ods-io.ts", names: ["createCalcDocumentStore"] },
  { module: "src/sc/source/filter/xml/xmlwrap.ts", names: ["readOdsDocument", "writeOdsDocument"] },
  { module: "src/sc/inc/document.ts", names: ["ScDocument"] },
  { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
  { module: "src/sc/source/ui/docshell/docsh.ts", names: ["ScDocShell"] },
  { module: "src/sc/source/ui/view/formatsh.ts", names: ["ScFormatShell"] },
  { module: "src/sc/source/ui/view/viewdata.ts", names: ["ScViewData"] },
  { module: "src/editeng/inc/crossedoutitem.ts", names: ["SvxCrossedOutItem"] },
  { module: "src/tools/inc/fontenum.ts", names: ["FontStrikeout"] },
  { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode"] },
] as const;
/** Actual source exports used by isolated browser and Worker acceptance. */
type Runtime = typeof import("../../src/sc/browser/workflows/calc-ods-io") &
  typeof import("../../src/cppu/inc/com/sun/star/uno/Any") &
  typeof import("../../src/xmloff/source/style/cdouthdl") &
  typeof import("../../src/xmloff/source/core/xmluconv") &
  typeof import("../../src/udkapi/com/sun/star/uno/TypeClass") &
  typeof import("../../src/sc/source/filter/xml/xmlwrap") &
  typeof import("../../src/sc/inc/document") &
  typeof import("../../src/sc/inc/address") &
  typeof import("../../src/sc/source/ui/docshell/docsh") &
  typeof import("../../src/sc/source/ui/view/formatsh") &
  typeof import("../../src/sc/source/ui/view/viewdata") &
  typeof import("../../src/editeng/inc/crossedoutitem") &
  typeof import("../../src/tools/inc/fontenum") &
  typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
for (const width of [1280, 390]) {
  test(`native Strikeout menu and ODS reopen at ${width}px`, /** Uses production UI and actual native package storage. @param fixtures - Browser. @returns Completion. */ async ({
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
    await installKernelFixture(page, "CalcStrikeoutFixture", nativeExports);
    const input = page.getByRole("textbox", { name: "Input line", exact: true }),
      cell = page.getByRole("gridcell", { name: "A1", exact: true });
    await input.fill("Strikeout text");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    await page.getByRole("menuitem", { name: "Format", exact: true }).click();
    await page.getByRole("menuitem", { name: "Text", exact: true }).click();
    const command = page.getByRole("menuitemcheckbox", { name: "Strikethrough", exact: true });
    await expect(command).toHaveAttribute("aria-checked", "false");
    await command.click();
    const glyph = cell.getByText("Strikeout text", { exact: true }).locator("..");
    await expect(glyph).toHaveCSS("text-decoration-line", "line-through");
    await page.getByRole("button", { name: "Underline", exact: true }).click();
    await expect(cell).toHaveCSS("text-decoration-line", "underline");
    await expect(glyph).toHaveCSS("text-decoration-line", "line-through");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(glyph).toHaveCSS("text-decoration-line", "none");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(glyph).toHaveCSS("text-decoration-line", "line-through");
    await expect
      .poll(
        /** Reads the actual primary ODS after the shared autosave interval. @returns Saved native enum. */ () =>
          page.evaluate(
            /** Opens source-owned ODS bytes. @returns Saved line enum or sentinel. */ async () => {
              const n = (globalThis as unknown as { CalcStrikeoutFixture: Runtime })
                  .CalcStrikeoutFixture,
                store = n.createCalcDocumentStore(),
                records = await store.list(),
                record = records.find(
                  /** Selects the automatically named real document. @param record - Stored metadata. @returns Whether matching. */ (
                    record,
                  ) => record.title === "Strikeout text",
                );
              if (!record) return -1;
              const stored = await store.load(record.id);
              if (!stored) return -1;
              const doc = await n.readOdsDocument(stored.bytes);
              try {
                return (
                  doc.GetPattern(new n.ScAddress())?.GetItem(106) as InstanceType<
                    typeof n.SvxCrossedOutItem
                  >
                ).GetStrikeout();
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
    await page.getByRole("button", { name: "Strikeout text", exact: true }).click();
    await expect(glyph).toHaveCSS("text-decoration-line", "line-through");
    await page.getByRole("menuitem", { name: "Format", exact: true }).click();
    await page.getByRole("menuitem", { name: "Text", exact: true }).click();
    await expect(command).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await page.screenshot({ path: test.info().outputPath(`strikeout-reopened-${width}.png`) });
    expect(errors).toEqual([]);
  });
}
test("preserves native Strikeout item metadata,history and ODS in a DOM-free Worker", /** Bundles actual owners without test substitutes. @param fixtures - Browser. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcStrikeoutFixture", nativeExports);
  const result = await page.evaluate(
    /** Executes source classes in both browser realms. @returns Observations. */ async () => {
      /** Performs native typed formatting,toggle,history and ODS operations. @returns Item observations. */ async function run() {
        const n = (globalThis as unknown as { CalcStrikeoutFixture: Runtime }).CalcStrikeoutFixture,
          shell = new n.ScDocShell(),
          doc = shell.GetDocument(),
          view = new n.ScViewData(doc),
          format = new n.ScFormatShell(view, shell),
          pos = new n.ScAddress(),
          text = n.unicode("Strikeout text");
        doc.SetTextCell(pos, text);
        text.dispose();
        /** Reads genuine native line state. @returns Style and color. */ function values() {
          const item = doc.GetPattern(pos)?.GetItem(106) as InstanceType<
            typeof n.SvxCrossedOutItem
          >;
          return [item.GetStrikeout(), item.Which()];
        }
        try {
          const item = new n.SvxCrossedOutItem(n.FontStrikeout.STRIKEOUT_DOUBLE, 106);
          format.SetStrikeout(item);
          format.SetStrikeout();
          const off = values();
          shell.GetUndoManager().Undo(shell);
          const undo = values();
          shell.GetUndoManager().Redo(shell);
          const redo = values(),
            reopened = await n.readOdsDocument(n.writeOdsDocument(doc));
          try {
            const saved = reopened.GetPattern(pos)?.GetItem(106) as InstanceType<
              typeof n.SvxCrossedOutItem
            >;
            return {
              off,
              undo,
              redo,
              reopened: [saved.GetStrikeout(), saved.Which()],
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
        ) => node.textContent?.includes(';globalThis["CalcStrikeoutFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing strikeout source bundle");
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
    off: [0, 106],
    undo: [2, 106],
    redo: [0, 106],
    reopened: [0, 106],
  };
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});

test("preserves crossed-out signed short writeback in page and DOM-free Worker", /** Uses the genuine Any and source handler in both realms. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcStrikeoutFixture", nativeExports);
  const result = await page.evaluate(
    /** Runs the actual source conversion twice without a simulated Any. @returns Observations. */ async () => {
      /** Converts an unsigned short whose signed projection is negative. @returns Value and actual result-type identity. */ function run() {
        const n = (globalThis as unknown as { CalcStrikeoutFixture: Runtime }).CalcStrikeoutFixture,
          value = new n.Any();
        try {
          value.insert([65535], "sal_uInt16");
          const before = value.getValueTypeClass() === n.TypeClass.UNSIGNED_SHORT;
          const ok = new n.XMLCrossedOutTypePropHdl().importXML(
              "none",
              value,
              new n.SvXMLUnitConverter("twip"),
            ),
            out: [number] = [0];
          const extracted = value.extract(out, "sal_Int16");
          return [before, ok, extracted, out[0], value.getValueTypeClass() === n.TypeClass.SHORT];
        } finally {
          value.dispose();
        }
      }
      const script = Array.from(document.scripts).find(
        /** Locates the actual source fixture bundle. @param node - Script node. @returns Match. */ (
          node,
        ) => node.textContent?.includes(';globalThis["CalcStrikeoutFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing native fixture");
      const url = URL.createObjectURL(
          new Blob(
            [
              script,
              "\nonmessage=()=>postMessage({value:(",
              run.toString(),
              ")(),dom:typeof document});",
            ],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = new Promise(
          /** Receives actual worker observations. @param resolve - Success. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Accepts worker values. @param event - Message. @returns Completion. */ (event) =>
                resolve(event.data);
            worker.onerror =
              /** Propagates worker exceptions. @param event - Error. @returns Completion. */ (
                event,
              ) => reject(Error(event.message));
          },
        );
        worker.postMessage(null);
        return { main: run(), other: await other };
      } finally {
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    },
  );
  const expected = [true, true, true, -1, true];
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});
