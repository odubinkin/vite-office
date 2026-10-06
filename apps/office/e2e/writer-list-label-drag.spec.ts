/** @fileoverview Checks ordinary Open then native document-origin label ruler gesture in Chromium. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { applyWriterParagraphList } from "../src/sw/source/core/doc/list";
import { SwNumFormat } from "../src/sw/source/core/doc/number";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(`Writer native label document ruler width=${width}`, /** Checks actual pointer preview, cancellation, accepted item history and neighbor ownership. @param fixtures - Browser fixtures. @param fixtures.page - Production browser. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      current = doc.paragraphs[0],
      target = doc.nodes.MakeTextNode();
    if (current === undefined) throw new Error("Missing native current paragraph");
    current.SetText("Current");
    target.SetText("Target");
    applyWriterParagraphList(target, {
      kind: "numbered",
      styleId: "LabelRule",
      listId: "label-list",
      level: 0,
    });
    const rule = target.GetNumRule();
    if (rule === undefined) throw new Error("Missing native rule");
    const format = new SwNumFormat(rule.Get(0));
    format.SetIndentAt(720);
    format.SetFirstLineIndent(-360);
    format.SetListtabPos(720);
    rule.Set(0, format);
    const bytes = writeOdtDocument(
      doc,
      createDocument({ id: "label-drag", suiteId: "writer", title: "Label Drag" }),
    );
    doc.Dispose();
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "native-label-drag.odt",
    });
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    const currentEditor = page.getByRole("textbox", { name: "Writer document text", exact: true }),
      targetEditor = page.getByRole("textbox", { name: "Writer paragraph 2", exact: true }),
      label = page.locator("[data-writer-list-marker]"),
      handle = page.getByRole("button", { name: "Paragraph left indent", exact: true });
    await currentEditor.click({ position: { x: 3, y: 8 } });
    await expect(currentEditor).toHaveText("Current");
    const original = await handle.evaluate(
      /** Reads actual initial item projection. @param element - Ruler handle. @returns Pixel coordinate. */ (
        element,
      ) => Number.parseFloat(element.style.left),
    );
    const targetOriginal = await label.evaluate(
      /** Reads actual label layout. @param element - Native label. @returns Parent margin. */ (
        element,
      ) => (element.parentElement as HTMLElement).style.marginInlineStart,
    );
    /** Starts real mouse input near the left edge of the native label. @returns Pointer coordinates. */
    async function begin() {
      await label.scrollIntoViewIfNeeded();
      const box = await label.boundingBox();
      if (box === null) throw new Error("Missing native label bounds");
      const x = box.x + 1,
        y = box.y + box.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(1);
      await page.mouse.move(x + 20, y, { steps: 3 });
      return { x, y };
    }
    await begin();
    await page.keyboard.press("Escape");
    await page.mouse.up();
    await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(0);
    expect(
      await handle.evaluate(
        /** Reads cancellation item projection. @param element - Ruler handle. @returns Pixel coordinate. */ (
          element,
        ) => Number.parseFloat(element.style.left),
      ),
    ).toBe(original);
    await expect(currentEditor).toHaveText("Current");
    await expect(targetEditor).toHaveText("Target");
    await begin();
    await page.keyboard.press("Enter");
    await page.mouse.up();
    await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(0);
    const accepted = await handle.evaluate(
      /** Reads accepted current paragraph item. @param element - Ruler handle. @returns Pixel coordinate. */ (
        element,
      ) => Number.parseFloat(element.style.left),
    );
    expect(accepted).toBeGreaterThan(original + 24);
    expect(
      await label.evaluate(
        /** Reads untouched target list geometry. @param element - Label owner. @returns Parent margin. */ (
          element,
        ) => (element.parentElement as HTMLElement).style.marginInlineStart,
      ),
    ).toBe(targetOriginal);
    await page.keyboard.press("Control+z");
    expect(
      await handle.evaluate(
        /** Reads Undo item projection. @param element - Ruler handle. @returns Pixel coordinate. */ (
          element,
        ) => Number.parseFloat(element.style.left),
      ),
    ).toBe(original);
    await page.keyboard.press("Control+Shift+z");
    expect(
      await handle.evaluate(
        /** Reads Redo item projection. @param element - Ruler handle. @returns Pixel coordinate. */ (
          element,
        ) => Number.parseFloat(element.style.left),
      ),
    ).toBe(accepted);
    await expect(currentEditor).toHaveText("Current");
    await expect(targetEditor).toHaveText("Target");
    await expect(label).toHaveText("1.");
  });
