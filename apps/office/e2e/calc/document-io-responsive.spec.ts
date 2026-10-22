/** @fileoverview Exercises production workers and raw XML storage with a 5000-row ODS while sampling main-thread responsiveness. */
import { expect, test, type Page } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { ZipOutputStream } from "../../src/package/source/zipapi/ZipOutputStream";
import { ODF_NAMESPACES } from "../../src/xmloff/source/core/xmltoken";
import { installKernelFixture } from "../shared/kernel-fixture";
/** Uses the explicitly supplied local regression file when requested, otherwise deterministic portable data. @returns ODS input. */
async function fixture(): Promise<Buffer> {
  if (process.env.OFFICE_LARGE_ODS_FIXTURE) return readFile(process.env.OFFICE_LARGE_ODS_FIXTURE);
  const output = new ZipOutputStream(),
    encoder = new TextEncoder();
  const mime = "application/vnd.oasis.opendocument.spreadsheet";
  const rows = Array.from(
    { length: 5000 },
    /** Measures the production document I/O path while servicing browser tasks. @param _ - _. @param row - row. @returns Operation result. */ (
      _,
      row,
    ) =>
      `<table:table-row>${Array.from({ length: 9 }, /** Measures the production document I/O path while servicing browser tasks. @param _ - _. @param col - col. @returns Operation result. */ (_, col) => `<table:table-cell office:value-type="string"><text:p>Row ${row + 1} column ${col + 1}</text:p></table:table-cell>`).join("")}</table:table-row>`,
  ).join("");
  output.putNextEntry("mimetype", encoder.encode(mime));
  output.putNextEntry(
    "META-INF/manifest.xml",
    encoder.encode(
      `<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3"><manifest:file-entry manifest:full-path="/" manifest:media-type="${mime}" manifest:version="1.3"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>`,
    ),
  );
  output.putNextEntry(
    "content.xml",
    encoder.encode(
      `<office:document-content xmlns:office="${ODF_NAMESPACES.office}" xmlns:table="${ODF_NAMESPACES.table}" xmlns:text="${ODF_NAMESPACES.text}" office:version="1.3"><office:body><office:spreadsheet><table:table table:name="Data">${rows}</table:table></office:spreadsheet></office:body></office:document-content>`,
    ),
  );
  return Buffer.from(output.finish());
}
/** Starts an event-loop heartbeat after prior UI work has settled. @param page - Browser. @returns Completion. */
async function startProbe(page: Page): Promise<void> {
  await page.evaluate(
    /** Measures the production document I/O path while servicing browser tasks.  @returns Operation result. */ () => {
      const state = { last: performance.now(), maxGap: 0, ticks: 0, timer: 0 };
      state.timer = window.setInterval(
        /** Measures the production document I/O path while servicing browser tasks.  @returns Operation result. */ () => {
          const now = performance.now();
          state.maxGap = Math.max(state.maxGap, now - state.last);
          state.last = now;
          state.ticks++;
        },
        10,
      );
      (window as unknown as { ioProbe: typeof state }).ioProbe = state;
    },
  );
}
/** Samples the final delayed task as well as tasks during the operation. @param page - Browser. @returns Responsiveness evidence. */
async function stopProbe(page: Page) {
  return page.evaluate(
    /** Measures the production document I/O path while servicing browser tasks.  @returns Operation result. */ async () => {
      await new Promise(
        /** Measures the production document I/O path while servicing browser tasks. @param resolve - resolve. @returns Operation result. */ (
          resolve,
        ) => setTimeout(resolve, 20),
      );
      const state = (
        window as unknown as { ioProbe: { maxGap: number; ticks: number; timer: number } }
      ).ioProbe;
      clearInterval(state.timer);
      return { maxGap: state.maxGap, ticks: state.ticks };
    },
  );
}
test("large ODS import, XML reopen, save and external export keep servicing UI tasks", /** Measures the production document I/O path while servicing browser tasks. @param input1 - Operation input. @param testInfo - testInfo. @returns Operation result. */ async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on(
    "pageerror",
    /** Measures the production document I/O path while servicing browser tasks. @param error - error. @returns Operation result. */ (
      error,
    ) => errors.push(error.message),
  );
  const bytes = await fixture(),
    inputPath = testInfo.outputPath("large-table.ods");
  await writeFile(inputPath, bytes);
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await startProbe(page);
  await page.getByLabel("Browse").setInputFiles(inputPath);
  await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 60_000 });
  const importing = await stopProbe(page);
  await installKernelFixture(page, "IOStore", [
    { module: "src/sc/browser/workflows/calc-ods-io.ts", names: ["createCalcDocumentStore"] },
  ]);
  const stored = await page.evaluate(
    /** Measures the production document I/O path while servicing browser tasks.  @returns Operation result. */ async () => {
      const store = (
        window as unknown as {
          IOStore: typeof import("../../src/sc/browser/workflows/calc-ods-io");
        }
      ).IOStore.createCalcDocumentStore();
      const records = await store.list(),
        first = records[0];
      if (!first) throw Error("Missing primary record");
      const record = await store.load(first.id);
      return {
        id: first.id,
        format: record?.content.format,
        xml: typeof record?.content.files["content.xml"],
        listHasBody: "content" in first,
      };
    },
  );
  expect(stored).toMatchObject({ format: "xml", xml: "string", listHasBody: false });
  const input = page.getByRole("textbox", { name: "Input line", exact: true });
  await input.fill("Updated words");
  await page.getByRole("button", { name: "Accept input", exact: true }).click();
  await startProbe(page);
  await page.keyboard.press("ControlOrMeta+s");
  await expect
    .poll(
      /** Measures the production document I/O path while servicing browser tasks.  @returns Operation result. */ () =>
        page.evaluate(
          /** Measures the production document I/O path while servicing browser tasks. @param id - id. @returns Operation result. */ async (
            id,
          ) => {
            const store = (
              window as unknown as {
                IOStore: typeof import("../../src/sc/browser/workflows/calc-ods-io");
              }
            ).IOStore.createCalcDocumentStore();
            const record = await store.load(id);
            return String(record?.content.files["content.xml"]).includes("Updated<text:s/>words");
          },
          stored.id,
        ),
      { timeout: 60_000 },
    )
    .toBe(true);
  const saving = await stopProbe(page);
  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await startProbe(page);
  await page.getByRole("button", { name: "large-table", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 60_000 });
  await expect(input).toHaveValue("Updated words");
  const reopening = await stopProbe(page);
  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
  await startProbe(page);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download ODS", exact: true }).click();
  await download;
  const exporting = await stopProbe(page);
  const evidence = {
    source: process.env.OFFICE_LARGE_ODS_FIXTURE ? "user ODS 5000" : "generated 5000 x 9",
    importing,
    saving,
    reopening,
    exporting,
    errors,
  };
  await testInfo.attach("responsiveness", {
    body: JSON.stringify(evidence, null, 2),
    contentType: "application/json",
  });
  console.log(JSON.stringify(evidence));
  expect(errors).toEqual([]);
  for (const sample of [importing, saving, reopening, exporting]) {
    expect(sample.ticks).toBeGreaterThan(2);
    expect(sample.maxGap).toBeLessThan(200);
  }
});
