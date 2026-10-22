/** @fileoverview Actual Shadow menu,glyph painting,history and primary ODS reopen in Chromium. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
const nativeExports = [
  { module: "src/sc/source/filter/xml/xmlimprt.ts", names: ["ScXMLImport"] },
  { module: "src/cppu/inc/com/sun/star/uno/Any.ts", names: ["Any"] },
  { module: "src/xmloff/source/style/cdouthdl.ts", names: ["XMLCrossedOutTypePropHdl"] },
  { module: "src/xmloff/source/core/xmluconv.ts", names: ["SvXMLUnitConverter"] },
  { module: "src/udkapi/com/sun/star/uno/TypeClass.ts", names: ["TypeClass"] },
  { module: "src/sc/browser/workflows/calc-ods-io.ts", names: ["createCalcDocumentStore"] },
  {
    module: "src/sc/source/filter/xml/xmlwrap.ts",
    names: ["readOdsDocument", "writeOdsDocument", "writeOdsXml"],
  },
  { module: "src/sc/inc/document.ts", names: ["ScDocument"] },
  { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
  { module: "src/sc/source/ui/docshell/docsh.ts", names: ["ScDocShell"] },
  { module: "src/sc/source/ui/view/formatsh.ts", names: ["ScFormatShell"] },
  { module: "src/sc/source/ui/view/viewdata.ts", names: ["ScViewData"] },
  {
    module: "src/editeng/source/items/textitem.ts",
    names: ["SvxShadowedItem", "SvxCharReliefItem"],
  },

  { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode"] },
] as const;
/** Actual source exports used by isolated browser and Worker acceptance. */
type Runtime = typeof import("../../src/sc/source/filter/xml/xmlimprt") &
  typeof import("../../src/sc/browser/workflows/calc-ods-io") &
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
  typeof import("../../src/editeng/source/items/textitem") &
  typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
for (const width of [1280, 390]) {
  test(`native Shadow menu and ODS reopen at ${width}px`, /** Uses production UI and actual native package storage. @param fixtures - Browser. @returns Completion. */ async ({
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
    await installKernelFixture(page, "CalcShadowFixture", nativeExports);
    const input = page.getByRole("textbox", { name: "Input line", exact: true }),
      cell = page.getByRole("gridcell", { name: "A1", exact: true });
    await input.fill("Shadow text");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    await page.getByRole("menuitem", { name: "Format", exact: true }).click();
    await page.getByRole("menuitem", { name: "Text", exact: true }).click();
    const command = page.getByRole("menuitemcheckbox", {
      name: "Shadow",
      exact: true,
    });
    await expect(command).toHaveAttribute("aria-checked", "false");
    await command.click();
    const filter = cell.locator("filter");
    await expect(filter).toHaveCount(1);
    await expect(filter.locator("feOffset")).toHaveCount(1);
    await expect(cell.getByText("Shadow text", { exact: true })).toHaveCount(1);
    await page.getByRole("button", { name: "Underline", exact: true }).click();
    await expect(cell).toHaveCSS("text-decoration-line", "none");
    await expect(cell.locator('div[style*="filter"]')).toHaveCSS(
      "text-decoration-line",
      "underline",
    );
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(filter).toHaveCount(0);
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(filter).toHaveCount(1);
    await expect
      .poll(
        /** Reads the actual primary ODS after the shared autosave interval. @returns Saved native enum. */ () =>
          page.evaluate(
            /** Opens source-owned ODS bytes. @returns Saved line enum or sentinel. */ async () => {
              const n = (globalThis as unknown as { CalcShadowFixture: Runtime }).CalcShadowFixture,
                store = n.createCalcDocumentStore(),
                records = await store.list(),
                record = records.find(
                  /** Selects the automatically named real document. @param record - Stored metadata. @returns Whether matching. */ (
                    record,
                  ) => record.title === "Shadow text",
                );
              if (!record) return -1;
              const stored = await store.load(record.id);
              if (!stored) return -1;
              const doc = await n.readOdsDocument(stored.content);
              try {
                return (
                  doc.GetPattern(new n.ScAddress())?.GetItem(108) as InstanceType<
                    typeof n.SvxShadowedItem
                  >
                ).GetValue();
              } finally {
                doc.DisposeAttributes();
              }
            },
          ),
        { timeout: 20_000 },
      )
      .toBe(true);
    await page.reload();
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("button", { name: "Shadow text", exact: true }).click();
    await expect(filter).toHaveCount(1);
    await page.getByRole("menuitem", { name: "Format", exact: true }).click();
    await page.getByRole("menuitem", { name: "Text", exact: true }).click();
    await expect(command).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await page.getByRole("menuitem", { name: "Format", exact: true }).click();
    await page.getByRole("menuitem", { name: "Text", exact: true }).click();
    await page.getByRole("menuitemcheckbox", { name: "Outline Font Effect", exact: true }).click();
    await expect(filter.locator("feOffset")).toHaveCount(9);
    await page.screenshot({ path: test.info().outputPath(`shadow-reopened-${width}.png`) });
    expect(errors).toEqual([]);
  });
}
test("preserves native Shadow item metadata,history and ODS in a DOM-free Worker", /** Bundles actual owners without test substitutes. @param fixtures - Browser. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcShadowFixture", nativeExports);
  const result = await page.evaluate(
    /** Executes source classes in both browser realms. @returns Observations. */ async () => {
      /** Performs native typed formatting,toggle,history and ODS operations. @returns Item observations. */ async function run() {
        const n = (globalThis as unknown as { CalcShadowFixture: Runtime }).CalcShadowFixture,
          shell = new n.ScDocShell(),
          doc = shell.GetDocument(),
          view = new n.ScViewData(doc),
          format = new n.ScFormatShell(view, shell),
          pos = new n.ScAddress(),
          text = n.unicode("Shadow text");
        doc.SetTextCell(pos, text);
        text.dispose();
        /** Reads genuine native line state. @returns Style and color. */ function values() {
          const item = doc.GetPattern(pos)?.GetItem(108) as InstanceType<typeof n.SvxShadowedItem>;
          const relief = doc.GetPattern(pos)?.GetItem(124) as InstanceType<
            typeof n.SvxCharReliefItem
          >;
          return [item.GetValue(), item.Which(), relief.GetValue(), relief.Which()];
        }
        try {
          const item = new n.SvxShadowedItem(true, 108);
          format.SetCharacterRelief(new n.SvxCharReliefItem(2, 124));
          format.SetShadowed(item);
          format.SetShadowed();
          const off = values();
          shell.GetUndoManager().Undo(shell);
          const undo = values();
          shell.GetUndoManager().Redo(shell);
          const redo = values(),
            reopened = await n.readOdsDocument(n.writeOdsDocument(doc));
          try {
            const saved = reopened.GetPattern(pos)?.GetItem(108) as InstanceType<
              typeof n.SvxShadowedItem
            >;
            return {
              off,
              undo,
              redo,
              reopened: [
                saved.GetValue(),
                saved.Which(),
                (
                  reopened.GetPattern(pos)?.GetItem(124) as InstanceType<typeof n.SvxCharReliefItem>
                ).GetValue(),
                124,
              ],
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
        ) => node.textContent?.includes(';globalThis["CalcShadowFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing shadow source bundle");
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
    off: [false, 108, 2, 124],
    undo: [true, 108, 2, 124],
    redo: [false, 108, 2, 124],
    reopened: [false, 108, 2, 124],
  };
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});

test("paints native relief over shadow on colored background with independent line colors", /** Opens an independently authored style through actual ODS and shared file UI. @param fixtures - Browser. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcShadowFixture", nativeExports);
  await page.evaluate(
    /** Writes a genuine primary package from independent XML. @returns Completion. */ async () => {
      const n = (globalThis as unknown as { CalcShadowFixture: Runtime }).CalcShadowFixture,
        doc = new n.ScDocument();
      try {
        new n.ScXMLImport(doc).importContent(
          `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"><office:automatic-styles><style:style style:name="Shadow" style:family="table-cell"><style:table-cell-properties fo:background-color="#ffff00"/><style:text-properties fo:font-size="10pt" fo:color="#0000ff" fo:text-shadow="1pt 1pt" style:font-relief="embossed" style:text-underline-style="solid" style:text-underline-color="#ff0000" style:text-overline-style="solid" style:text-overline-color="#008000"/></style:style><style:style style:name="BlackRelief" style:family="table-cell"><style:text-properties fo:color="#000000" style:font-relief="engraved" fo:text-shadow="1pt 1pt" style:text-outline="true" style:text-underline-style="solid" style:text-underline-color="#000000" style:text-overline-style="solid" style:text-overline-color="#000000"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Sheet"><table:table-row><table:table-cell table:style-name="Shadow" office:value-type="string"><text:p>OO</text:p></table:table-cell><table:table-cell table:style-name="BlackRelief" office:value-type="string"><text:p>Black</text:p></table:table-cell></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`,
        );
        await n.createCalcDocumentStore().saveAs({
          id: "shadow-paint",
          title: "Shadow paint",
          version: 1,
          content: n.writeOdsXml(doc),
        });
      } finally {
        doc.DisposeAttributes();
      }
    },
  );
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("button", { name: "Shadow paint", exact: true }).click();
  const cell = page.getByRole("gridcell", { name: "A1", exact: true });
  await expect(cell).toHaveCSS("background-color", "rgb(255, 255, 0)");
  await expect(cell).toHaveCSS("color", "rgb(0, 0, 255)");
  await expect(cell.getByText("OO", { exact: true })).toHaveCSS(
    "text-decoration-color",
    "rgb(0, 128, 0)",
  );
  await expect(cell.locator('div[style*="filter"]')).toHaveCSS(
    "text-decoration-color",
    "rgb(255, 0, 0)",
  );
  await expect(cell.locator("feOffset")).toHaveCount(1);
  const black = page.getByRole("gridcell", { name: "B1", exact: true }),
    raster = black.locator('div[style*="filter"]');
  await expect(raster).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(raster).toHaveCSS("text-decoration-color", "rgb(255, 255, 255)");
  await expect(black.getByText("Black", { exact: true })).toHaveCSS(
    "text-decoration-color",
    "rgb(255, 255, 255)",
  );
  await expect(black.locator("feOffset")).toHaveCount(1);
  await expect(black.locator("feOffset")).toHaveAttribute("dx", "-1");
  await black.screenshot({ path: test.info().outputPath("relief-black-lines-raster.png") });
  await cell.screenshot({ path: test.info().outputPath("shadow-colored-raster.png") });
});
