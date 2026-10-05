/** @fileoverview Verifies Add to List over a real selected table row, all labels and atomic restart history. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { applyWriterParagraphList } from "../src/sw/source/core/doc/list";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";

for (const kind of ["Ordered List", "Unordered List"] as const)
  for (const initial of ["plain", "different"] as const) {
    test(
      "Writer table row Add to List " + kind + "/" + initial,
      /** Checks actual selection command state, all boxes and one-step UndoRedo. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
        page,
      }) => {
        await page.goto("/writer");
        await page.getByRole("button", { name: "Insert Table" }).click();
        await page
          .getByLabel("Table size")
          .locator("..")
          .getByRole("button", { name: "More Options" })
          .click();
        await page
          .getByRole("dialog", { name: "Insert Table" })
          .getByRole("button", { name: "Insert" })
          .click();
        const previous = page.getByRole("textbox", {
            name: "Row 1 column 2 paragraph 1",
            exact: true,
          }),
          neighbor = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }),
          first = page.getByRole("textbox", { name: "Row 2 column 1 paragraph 1", exact: true }),
          second = page.getByRole("textbox", { name: "Row 2 column 2 paragraph 1", exact: true });
        await neighbor.fill("Neighbor");
        await previous.fill("Previous");
        await page.getByRole("button", { name: "Format", exact: true }).click();
        await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
        await page.getByRole("menuitemradio", { name: kind, exact: true }).click();
        await first.fill("First");
        await second.fill("Second");
        if (initial === "different") {
          await page.getByRole("button", { name: "Select row 2 in Table1" }).click();
          await page.getByRole("button", { name: "Format", exact: true }).click();
          await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
          await page
            .getByRole("menuitemradio", {
              name: kind === "Ordered List" ? "Unordered List" : "Ordered List",
              exact: true,
            })
            .click();
        }
        await page.getByRole("button", { name: "Select row 2 in Table1" }).click();
        const table = page.getByRole("table", { name: "Table1" });
        await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
        await page.getByRole("button", { name: "Format", exact: true }).click();
        await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
        const command = page.getByRole("menuitem", { name: "Add to List", exact: true });
        await expect(command).toBeEnabled();
        await command.click();
        const firstId = await first.getAttribute("data-writer-paragraph-id"),
          secondId = await second.getAttribute("data-writer-paragraph-id"),
          previousId = await previous.getAttribute("data-writer-paragraph-id"),
          expected = kind === "Ordered List" ? "numbered" : "bullet",
          old = initial === "plain" ? "none" : kind === "Ordered List" ? "bullet" : "numbered";
        await expect(first).toHaveAttribute("data-list-kind", expected);
        await expect(second).toHaveAttribute("data-list-kind", expected);
        await expect(page.locator('[data-writer-list-marker="' + firstId + '"]')).toHaveText(
          kind === "Ordered List" ? "2." : "•",
        );
        await expect(page.locator('[data-writer-list-marker="' + secondId + '"]')).toHaveText(
          kind === "Ordered List" ? "3." : "•",
        );
        for (let cycle = 0; cycle < 3; cycle++) {
          await page.keyboard.press("Control+z");
          await expect(first).toHaveAttribute("data-list-kind", old);
          await expect(second).toHaveAttribute("data-list-kind", old);
          await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
          await page.keyboard.press("Control+y");
          await expect(first).toHaveAttribute("data-list-kind", expected);
          await expect(second).toHaveAttribute("data-list-kind", expected);
          await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
        }
        await expect(page.locator('[data-writer-list-marker="' + previousId + '"]')).toHaveText(
          kind === "Ordered List" ? "1." : "•",
        );
        await expect(previous).toHaveText("Previous");
        await expect(first).toHaveText("First");
        await expect(second).toHaveText("Second");
        await expect(neighbor).toHaveText("Neighbor");
        await expect(neighbor).toHaveAttribute("data-list-kind", "none");
      },
    );
  }

test("Writer table row Add to List continues an imported restarted body list", /** Checks native structural rule search and atomic row continuation in the final bundle using a supported local ODT. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const doc = new SwDoc(),
    body = doc.paragraphs[0];
  if (body === undefined) throw new Error("Missing native body");
  body.SetText("Body");
  const table = doc.nodes.MakeTableNode("RestartRow", {}, body);
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  const top = doc.nodes.AppendTableRow(table, 2),
    row = doc.nodes.AppendTableRow(table, 2),
    previous = top.GetTabBoxes()[1]?.GetParagraphs()[0],
    neighbor = top.GetTabBoxes()[0]?.GetParagraphs()[0],
    firstNode = row.GetTabBoxes()[0]?.GetParagraphs()[0],
    secondNode = row.GetTabBoxes()[1]?.GetParagraphs()[0];
  if (
    previous === undefined ||
    neighbor === undefined ||
    firstNode === undefined ||
    secondNode === undefined
  )
    throw new Error("Missing native table boxes");
  previous.SetText("Previous");
  neighbor.SetText("Neighbor");
  firstNode.SetText("First");
  secondNode.SetText("Second");
  applyWriterParagraphList(body, {
    kind: "numbered",
    styleId: "Prior",
    listId: "prior",
    restart: true,
    startValue: 7,
  });
  const metadata = createDocument({ id: "restart-row", suiteId: "writer", title: "Restart row" }),
    shell = new SwDocShell(doc, metadata),
    bytes = writeOdtDocument(doc, metadata);
  shell.Close();
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(bytes),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "restart-row.odt",
  });
  const first = page.getByRole("textbox", { name: "Row 2 column 1 paragraph 1", exact: true }),
    second = page.getByRole("textbox", { name: "Row 2 column 2 paragraph 1", exact: true }),
    firstId = await first.getAttribute("data-writer-paragraph-id"),
    secondId = await second.getAttribute("data-writer-paragraph-id"),
    firstMarker = page.locator('[data-writer-list-marker="' + firstId + '"]'),
    secondMarker = page.locator('[data-writer-list-marker="' + secondId + '"]'),
    rendered = page.getByRole("table", { name: "RestartRow" });
  await first.click();
  await page.getByRole("button", { name: "Select row 2 in RestartRow" }).click();
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
  await page.getByRole("menuitemradio", { name: "Unordered List", exact: true }).click();
  await expect(firstMarker).toHaveText("•");
  await expect(secondMarker).toHaveText("•");
  await page.getByRole("button", { name: "Select row 2 in RestartRow" }).click();
  await expect(rendered.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
  await page.getByRole("menuitem", { name: "Add to List", exact: true }).click();
  await expect(firstMarker).toHaveText("8.");
  await expect(secondMarker).toHaveText("9.");
  await expect(rendered.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
  for (let cycle = 0; cycle < 3; cycle++) {
    await page.keyboard.press("Control+z");
    await expect(firstMarker).toHaveText("•");
    await expect(secondMarker).toHaveText("•");
    await expect(rendered.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
    await page.keyboard.press("Control+y");
    await expect(firstMarker).toHaveText("8.");
    await expect(secondMarker).toHaveText("9.");
    await expect(rendered.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
  }
  await expect(first).toHaveText("First");
  await expect(second).toHaveText("Second");
  await expect(
    page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }),
  ).toHaveText("Neighbor");
  await expect(
    page.getByRole("textbox", { name: "Row 1 column 2 paragraph 1", exact: true }),
  ).toHaveText("Previous");
});
