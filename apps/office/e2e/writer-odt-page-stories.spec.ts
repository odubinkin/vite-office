/** @fileoverview Writer ODT and DOCX page stories across Chromium storage and ODT download. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../src/package/source/zippackage/document-archive";

test("Writer retains ODT page stories through browser storage and download", /** Exercises the existing Worker and local storage paths with a pinned master-style fixture. @param root0 - Playwright fixtures. @param root0.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const path = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/core/header_footer/data/SimpleFirstLeftRight.odt",
      import.meta.url,
    ),
  );
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(path);
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );

  await page.reload();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "SimpleFirstLeftRight", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Writer document text" }).first()).toContainText(
    "Para 1",
  );

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download ODT", exact: true }).click();
  const downloaded = await (await pending).path();
  if (downloaded === null) throw new Error("Chromium did not expose the ODT download.");
  const archive = await DocumentArchive.open(new Uint8Array(await readFile(downloaded)));
  const styles = await archive.readTextEntry("styles.xml");
  for (const [tag, value] of [
    ["header", "RIGHT HEADER"],
    ["header-left", "LEFT HEADER"],
    ["header-first", "FIRST HEADER"],
    ["footer", "RIGHT FOOTER"],
    ["footer-left", "LEFT FOOTER"],
    ["footer-first", "FIRST FOOTER"],
  ] as const) {
    const start = styles.indexOf(`<style:${tag}>`);
    const end = styles.indexOf(`</style:${tag}>`, start);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(styles.slice(start, end)).toContain(value.replaceAll(" ", "<text:s/>"));
  }
});

test("Writer opens an original DOCX with a footer and retains it in browser storage", /** Exercises the existing browser file workflow and inspects the restored footer. @param root0 - Playwright fixtures. @param root0.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/NumberedList.docx",
      import.meta.url,
    ),
  );
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );

  await page.reload();
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "NumberedList", exact: true }).click();
  await expect(page.getByRole("cell", { name: "Instructions" })).toBeVisible();

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download ODT", exact: true }).click();
  const downloaded = await (await pending).path();
  if (downloaded === null) throw new Error("Chromium did not expose the ODT download.");
  const archive = await DocumentArchive.open(new Uint8Array(await readFile(downloaded)));
  const styles = await archive.readTextEntry("styles.xml");
  const footer = styles.match(/<style:footer>[\s\S]*?<\/style:footer>/)?.[0];
  expect(footer).toMatch(/>1</);

  const docxPending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX", exact: true }).click();
  const docxPath = await (await docxPending).path();
  if (docxPath === null) throw new Error("Chromium did not expose the DOCX download.");
  const buffer = await readFile(docxPath);
  const docx = await DocumentArchive.open(new Uint8Array(buffer));
  const document = await docx.readTextEntry("word/document.xml");
  expect(document).toContain("<w:footerReference");
  expect(document.match(/<w:tblInd w:w="360" w:type="dxa"\s*\/>/g)).toHaveLength(2);
  expect(document).toMatch(/<w:gridCol w:w="4050"\s*\/>/);
  expect(await docx.readTextEntry("word/footer1.xml")).toContain("<w:t>1</w:t>");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "NumberedList-reopened.docx",
  });
  await expect(page.getByRole("heading", { name: "NumberedList-reopened" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Instructions" })).toBeVisible();
});

test("Writer retains DOCX character spacing through browser reopen and DOCX download", /** Verifies native signed spacing in Chromium's existing editor and the exported document. @param root0 - Playwright fixtures. @param root0.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const source = await DocumentArchive.open(
    new Uint8Array(
      await readFile(
        new URL(
          "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/NumberedList.docx",
          import.meta.url,
        ),
      ),
    ),
  );
  const writer = new DocumentArchiveWriter();
  const main =
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:rPr><w:spacing w:val="30"/></w:rPr><w:t>Expanded</w:t></w:r><w:r><w:t> text</w:t></w:r></w:p><w:sectPr/></w:body></w:document>';
  for (const name of source.getEntryNames())
    writer.putNextEntry(
      name,
      name === "word/document.xml" ? new TextEncoder().encode(main) : await source.readEntry(name),
    );
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(await writer.finish()),
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "Manual-spacing.docx",
  });
  const expanded = page.getByText("Expanded", { exact: true });
  await expect(expanded).toHaveCSS("letter-spacing", "2px");
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );
  await page.reload();
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Manual-spacing", exact: true }).click();
  await expect(expanded).toHaveCSS("letter-spacing", "2px");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX", exact: true }).click();
  const downloaded = await (await pending).path();
  if (downloaded === null) throw new Error("Chromium did not expose the DOCX download.");
  const docx = await DocumentArchive.open(new Uint8Array(await readFile(downloaded)));
  expect(await docx.readTextEntry("word/document.xml")).toContain('<w:spacing w:val="30"/>');
});

test("Writer opens a DOCX with a floating picture in the header", /** Imports a standalone DrawingML picture and checks that the header survives browser storage. @param root0 - Playwright fixtures. @param root0.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const source = await DocumentArchive.open(
    new Uint8Array(
      await readFile(
        new URL(
          "../../../vendor/libreoffice-reference/sw/qa/extras/layout/data/testHeaderImageAlignment.docx",
          import.meta.url,
        ),
      ),
    ),
  );
  const writer = new DocumentArchiveWriter();
  const drawing = "http://schemas.openxmlformats.org/drawingml/2006";
  const header = `<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    xmlns:wp="${drawing}/wordprocessingDrawing" xmlns:a="${drawing}/main" xmlns:pic="${drawing}/picture">
    <w:p><w:r><w:drawing><wp:anchor simplePos="0" behindDoc="1" layoutInCell="1" allowOverlap="1" relativeHeight="0">
      <wp:simplePos x="0" y="0"/>
      <wp:positionH relativeFrom="column"><wp:posOffset>0</wp:posOffset></wp:positionH>
      <wp:positionV relativeFrom="paragraph"><wp:posOffset>0</wp:posOffset></wp:positionV>
      <wp:extent cx="635000" cy="317500"/><wp:wrapNone/><wp:docPr id="1" name="Letterhead"/>
      <a:graphic><a:graphicData uri="${drawing}/picture"><pic:pic>
        <pic:blipFill><a:blip r:embed="rId1"/></pic:blipFill>
      </pic:pic></a:graphicData></a:graphic>
    </wp:anchor></w:drawing></w:r></w:p>
  </w:hdr>`;
  for (const part of source.getEntryNames())
    writer.putNextEntry(
      part,
      part === "word/header1.xml" ? new TextEncoder().encode(header) : await source.readEntry(part),
    );

  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(await writer.finish()),
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "Floating-letterhead.docx",
  });
  const body = page.getByRole("textbox", { name: "Writer document text" }).first();
  const image = page.locator("[data-writer-graphic-fly]").getByRole("img");
  await expect(body).toContainText("Body");
  await expect(image).toBeVisible();
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );

  await page.reload();
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Floating-letterhead", exact: true }).click();
  await expect(body).toContainText("Body");
  await expect(image).toBeVisible();
});
