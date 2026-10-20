/** @fileoverview Native font-step/ODS Worker execution and real shared UI script-height selection at desktop/mobile widths. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";

/** Actual source exports only;no test runtime is shipped by the application. */
const fontKernelExports = [
  { module: "src/sc/source/ui/docshell/docsh.ts", names: ["ScDocShell"] },
  { module: "src/sc/source/ui/inc/viewdata.ts", names: ["ScViewData"] },
  { module: "src/sc/source/ui/view/formatsh.ts", names: ["ScFormatShell"] },
  { module: "src/sc/inc/document.ts", names: ["ScDocument"] },
  { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
  { module: "src/sc/inc/patattr.ts", names: ["ScPatternAttr"] },
  { module: "src/editeng/inc/fhgtitem.ts", names: ["SvxFontHeightItem"] },
  { module: "src/svl/inc/languageoptions.ts", names: ["SvtScriptType"] },
  { module: "src/sc/source/filter/xml/xmlwrap.ts", names: ["writeOdsDocument", "readOdsDocument"] },
  { module: "src/sc/source/filter/xml/xmlimprt.ts", names: ["ScXMLImport"] },
  { module: "src/sc/browser/workflows/calc-ods-io.ts", names: ["createCalcDocumentStore"] },
  { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode"] },
] as const;
/** Statically typed source bundle used in page and Worker. */
type Runtime = typeof import("../../src/sc/source/ui/docshell/docsh") &
  typeof import("../../src/sc/source/ui/inc/viewdata") &
  typeof import("../../src/sc/source/ui/view/formatsh") &
  typeof import("../../src/sc/inc/document") &
  typeof import("../../src/sc/inc/address") &
  typeof import("../../src/sc/inc/patattr") &
  typeof import("../../src/editeng/inc/fhgtitem") &
  typeof import("../../src/svl/inc/languageoptions") &
  typeof import("../../src/sc/source/filter/xml/xmlwrap") &
  typeof import("../../src/sc/source/filter/xml/xmlimprt") &
  typeof import("../../src/sc/browser/workflows/calc-ods-io") &
  typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");

test("executes real script-height items,font stepping,history and ODS in page and DOM-free Worker", /** Native owners are bundled from repository sources. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  await installKernelFixture(page, "CalcFontStepFixture", fontKernelExports);
  const result = await page.evaluate(
    /** Executes native owners in the page realm. @returns Runtime observations. */ async () => {
      /** Uses the actual core classes and package wrapper in either runtime. @returns Native observations. */
      async function run() {
        const n = (globalThis as unknown as { CalcFontStepFixture: Runtime }).CalcFontStepFixture,
          shell = new n.ScDocShell(),
          doc = shell.GetDocument(),
          view = new n.ScViewData(doc),
          format = new n.ScFormatShell(view, shell),
          pos = new n.ScAddress(),
          text = n.unicode("漢");
        doc.SetTextCell(pos, text);
        text.dispose();
        /** Reads initialized native items. @returns Heights and property fields. */
        function values() {
          return [101, 112, 117].map(
            /** Reads a real script item. @param which - Native attribute id. @returns Height and proportion. */ (
              which,
            ) => {
              const item = doc.GetPattern(pos)?.GetItem(which) as InstanceType<
                typeof n.SvxFontHeightItem
              >;
              return [item.GetHeight(), item.GetProp()];
            },
          );
        }
        try {
          format.SetFontHeight(new n.SvxFontHeightItem(240, 125, 101));
          const before = values();
          format.ChangeFontSize(true, n.SvtScriptType.ASIAN);
          const after = values();
          shell.GetUndoManager().Undo(shell);
          const undo = values();
          shell.GetUndoManager().Redo(shell);
          const redo = values();
          const reopened = await n.readOdsDocument(n.writeOdsDocument(doc));
          try {
            return {
              before,
              after,
              undo,
              redo,
              reopened: [101, 112, 117].map(
                /** Reads a reopened script height. @param which - Native attribute id. @returns Twips. */ (
                  which,
                ) =>
                  (
                    reopened.GetPattern(pos)?.GetItem(which) as InstanceType<
                      typeof n.SvxFontHeightItem
                    >
                  ).GetHeight(),
              ),
            };
          } finally {
            reopened.DisposeAttributes();
          }
        } finally {
          shell.Close();
        }
      }
      const script = Array.from(document.scripts).find(
        /** Locates the installed source bundle. @param script - DOM script node. @returns Whether it owns the fixture. */ (
          script,
        ) => script.textContent?.includes(';globalThis["CalcFontStepFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing font-step kernel fixture");
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
        const other = new Promise<{ value: unknown; dom: string }>(
          /** Receives the DOM-free runtime result. @param resolve - Success continuation. @param reject - Failure continuation. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Accepts the worker observations. @param event - Message. @returns Completion. */ (
                event,
              ) => resolve(event.data);
            worker.onerror =
              /** Propagates worker failures. @param event - Error. @returns Completion. */ (
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
  const expected = {
    before: [
      [300, 125],
      [300, 125],
      [300, 125],
    ],
    after: [
      [300, 125],
      [340, 100],
      [300, 125],
    ],
    undo: [
      [300, 125],
      [300, 125],
      [300, 125],
    ],
    redo: [
      [300, 125],
      [340, 100],
      [300, 125],
    ],
    reopened: [300, 340, 300],
  };
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});

for (const width of [1280, 390])
  test(`shows actual script font sizes and reopens the saved ODS at ${width}px`, /** Interacts with the production shared file dialog,font selector and history buttons. @param fixtures - Page. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Captures uncaught application exceptions. @param error - Browser error. @returns Array length. */ (
        error,
      ) => errors.push(error.message),
    );
    await page.goto("/calc");
    await installKernelFixture(page, "CalcFontStepFixture", fontKernelExports);
    await page.evaluate(
      /** Executes native owners in the page realm. @returns Runtime observations. */ async () => {
        const n = (globalThis as unknown as { CalcFontStepFixture: Runtime }).CalcFontStepFixture,
          doc = new n.ScDocument();
        try {
          new n.ScXMLImport(doc).importContent(
            '<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"><office:automatic-styles><style:style style:name="Scripts" style:family="table-cell"><style:text-properties fo:font-size="12pt" style:font-size-asian="18pt" style:font-size-complex="24pt"/></style:style><style:style style:name="Tall" style:family="table-row"><style:table-row-properties style:row-height="48pt"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Data"><table:table-row table:style-name="Tall"><table:table-cell table:style-name="Scripts" office:value-type="string"><text:p>A漢ش</text:p></table:table-cell><table:table-cell table:style-name="Scripts" office:value-type="string"><text:p>Latin</text:p></table:table-cell></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>',
          );
          await n.createCalcDocumentStore().saveAs({
            id: "script-heights",
            title: "Script sizes",
            version: 1,
            bytes: n.writeOdsDocument(doc),
          });
        } finally {
          doc.DisposeAttributes();
        }
      },
    );
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("button", { name: "Script sizes", exact: true }).click();
    const size = page.getByRole("combobox", { name: "Font Size", exact: true }),
      a1 = page.getByRole("gridcell", { name: "A1", exact: true });
    await expect(size).toHaveValue("");
    await expect(a1.getByText("A", { exact: true })).toHaveCSS("font-size", "16px");
    await expect(a1.getByText("漢", { exact: true })).toHaveCSS("font-size", "24px");
    await expect(a1.getByText("ش", { exact: true })).toHaveCSS("font-size", "32px");
    await page.screenshot({ path: test.info().outputPath(`font-script-mixed-${width}.png`) });
    await page.getByRole("gridcell", { name: "B1", exact: true }).click();
    await expect(size).toHaveValue("12");
    await a1.click();
    await expect(size).toHaveValue("");
    await size.selectOption("18");
    await expect(a1.getByText("A", { exact: true })).toHaveCSS("font-size", "24px");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(size).toHaveValue("");
    await expect(a1.getByText("ش", { exact: true })).toHaveCSS("font-size", "32px");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(size).toHaveValue("18");
    await expect
      .poll(
        /** Reads the primary stored ODS after the shared autosave cadence. @returns Native saved heights. */ () =>
          page.evaluate(
            /** Executes native owners in the page realm. @returns Runtime observations. */ async () => {
              const n = (globalThis as unknown as { CalcFontStepFixture: Runtime })
                  .CalcFontStepFixture,
                record = await n.createCalcDocumentStore().load("script-heights");
              if (!record) return [];
              const doc = await n.readOdsDocument(record.bytes);
              try {
                return [101, 112, 117].map(
                  /** Reads a reopened script height. @param which - Native attribute id. @returns Twips. */ (
                    which,
                  ) =>
                    (
                      doc.GetPattern(new n.ScAddress())?.GetItem(which) as InstanceType<
                        typeof n.SvxFontHeightItem
                      >
                    ).GetHeight(),
                );
              } finally {
                doc.DisposeAttributes();
              }
            },
          ),
        { timeout: 20_000 },
      )
      .toEqual([360, 360, 360]);
    await page.reload();
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("button", { name: "Script sizes", exact: true }).click();
    await expect(size).toHaveValue("18");
    for (const text of ["A", "漢", "ش"])
      await expect(a1.getByText(text, { exact: true })).toHaveCSS("font-size", "24px");
    await page.screenshot({ path: test.info().outputPath(`font-script-reopened-${width}.png`) });
    expect(errors).toEqual([]);
  });
