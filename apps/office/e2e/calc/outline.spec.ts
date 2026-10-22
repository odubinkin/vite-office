/** @fileoverview Actual Outline menu,glyph painting,history and primary ODS reopen in Chromium. */
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
  { module: "src/editeng/inc/contouritem.ts", names: ["SvxContourItem"] },

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
  typeof import("../../src/editeng/inc/contouritem") &
  typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
for (const width of [1280, 390]) {
  test(`native Outline menu and ODS reopen at ${width}px`, /** Uses production UI and actual native package storage. @param fixtures - Browser. @returns Completion. */ async ({
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
    await installKernelFixture(page, "CalcOutlineFixture", nativeExports);
    const input = page.getByRole("textbox", { name: "Input line", exact: true }),
      cell = page.getByRole("gridcell", { name: "A1", exact: true });
    await input.fill("Outline text");
    await page.getByRole("button", { name: "Accept input", exact: true }).click();
    await page.getByRole("menuitem", { name: "Format", exact: true }).click();
    await page.getByRole("menuitem", { name: "Text", exact: true }).click();
    const command = page.getByRole("menuitemcheckbox", {
      name: "Outline Font Effect",
      exact: true,
    });
    await expect(command).toHaveAttribute("aria-checked", "false");
    await command.click();
    const filter = cell.locator("filter");
    await expect(filter).toHaveCount(1);
    await expect(filter.locator("feOffset")).toHaveCount(8);
    await expect(cell.getByText("Outline text", { exact: true })).toHaveCount(1);
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
              const n = (globalThis as unknown as { CalcOutlineFixture: Runtime })
                  .CalcOutlineFixture,
                store = n.createCalcDocumentStore(),
                records = await store.list(),
                record = records.find(
                  /** Selects the automatically named real document. @param record - Stored metadata. @returns Whether matching. */ (
                    record,
                  ) => record.title === "Outline text",
                );
              if (!record) return -1;
              const stored = await store.load(record.id);
              if (!stored) return -1;
              const doc = await n.readOdsDocument(stored.content);
              try {
                return (
                  doc.GetPattern(new n.ScAddress())?.GetItem(107) as InstanceType<
                    typeof n.SvxContourItem
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
    await page.getByRole("button", { name: "Outline text", exact: true }).click();
    await expect(filter).toHaveCount(1);
    await page.getByRole("menuitem", { name: "Format", exact: true }).click();
    await page.getByRole("menuitem", { name: "Text", exact: true }).click();
    await expect(command).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await page.screenshot({ path: test.info().outputPath(`outline-reopened-${width}.png`) });
    expect(errors).toEqual([]);
  });
}
test("preserves native Outline item metadata,history and ODS in a DOM-free Worker", /** Bundles actual owners without test substitutes. @param fixtures - Browser. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcOutlineFixture", nativeExports);
  const result = await page.evaluate(
    /** Executes source classes in both browser realms. @returns Observations. */ async () => {
      /** Performs native typed formatting,toggle,history and ODS operations. @returns Item observations. */ async function run() {
        const n = (globalThis as unknown as { CalcOutlineFixture: Runtime }).CalcOutlineFixture,
          shell = new n.ScDocShell(),
          doc = shell.GetDocument(),
          view = new n.ScViewData(doc),
          format = new n.ScFormatShell(view, shell),
          pos = new n.ScAddress(),
          text = n.unicode("Outline text");
        doc.SetTextCell(pos, text);
        text.dispose();
        /** Reads genuine native line state. @returns Style and color. */ function values() {
          const item = doc.GetPattern(pos)?.GetItem(107) as InstanceType<typeof n.SvxContourItem>;
          return [item.GetValue(), item.Which()];
        }
        try {
          const item = new n.SvxContourItem(true, 107);
          format.SetOutlineFont(item);
          format.SetOutlineFont();
          const off = values();
          shell.GetUndoManager().Undo(shell);
          const undo = values();
          shell.GetUndoManager().Redo(shell);
          const redo = values(),
            reopened = await n.readOdsDocument(n.writeOdsDocument(doc));
          try {
            const saved = reopened.GetPattern(pos)?.GetItem(107) as InstanceType<
              typeof n.SvxContourItem
            >;
            return {
              off,
              undo,
              redo,
              reopened: [saved.GetValue(), saved.Which()],
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
        ) => node.textContent?.includes(';globalThis["CalcOutlineFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing outline source bundle");
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
    off: [false, 107],
    undo: [true, 107],
    redo: [false, 107],
    reopened: [false, 107],
  };
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});

test("paints the native white center on colored background with independently colored lines", /** Opens an independently authored style through actual ODS and shared file UI. @param fixtures - Browser. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcOutlineFixture", nativeExports);
  await page.evaluate(
    /** Writes a genuine primary package from independent XML. @returns Completion. */ async () => {
      const n = (globalThis as unknown as { CalcOutlineFixture: Runtime }).CalcOutlineFixture,
        doc = new n.ScDocument();
      try {
        new n.ScXMLImport(doc).importContent(
          `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"><office:automatic-styles><style:style style:name="Outline" style:family="table-cell"><style:table-cell-properties fo:background-color="#ffff00"/><style:text-properties fo:font-size="10pt" fo:color="#0000ff" style:text-outline="true" style:text-underline-style="solid" style:text-underline-color="#ff0000" style:text-overline-style="solid" style:text-overline-color="#008000"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Sheet"><table:table-row><table:table-cell table:style-name="Outline" office:value-type="string"><text:p>OO</text:p></table:table-cell></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`,
        );
        await n.createCalcDocumentStore().saveAs({
          id: "outline-paint",
          title: "Outline paint",
          version: 1,
          content: n.writeOdsXml(doc),
        });
      } finally {
        doc.DisposeAttributes();
      }
    },
  );
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("button", { name: "Outline paint", exact: true }).click();
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
  await expect(cell.locator("feOffset")).toHaveCount(8);
  await cell.screenshot({ path: test.info().outputPath("outline-colored-raster.png") });
});
