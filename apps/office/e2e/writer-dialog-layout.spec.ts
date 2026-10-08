/** @fileoverview Checks actual Writer modal geometry, shared styling and reachable actions. */
import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";

/** Opens an existing Writer command through its menu. @param page - Browser page. @param root - Root menu. @param command - Command label. @param submenu - Optional nested menu. @returns Completion. */
async function openCommand(
  page: Page,
  root: string,
  command: string,
  submenu?: string,
): Promise<void> {
  await page.getByRole("button", { name: root, exact: true }).click();
  if (submenu !== undefined)
    await page.getByRole("menuitem", { name: submenu, exact: true }).press("ArrowRight");
  await page.getByRole("menuitem", { name: command, exact: true }).click();
}

/** Reads the visual contract from the rendered panel and heading. @param panel - Modal panel. @returns Computed shared styles. */
async function surface(panel: Locator): Promise<unknown> {
  return panel.evaluate(
    /** Reads actual CSS after utility and global cascade. @param element - Modal panel. @returns Shared surface values. */ (
      element,
    ) => {
      const style = getComputedStyle(element);
      const title = getComputedStyle(element.querySelector("h2") as HTMLElement);
      return {
        radius: style.borderRadius,
        border: style.border,
        shadow: style.boxShadow,
        titleSize: title.fontSize,
        titleWeight: title.fontWeight,
      };
    },
  );
}

/** Asserts controls and text occupy distinct space and remain within the panel. @param page - Browser page. @param reference - Open-document computed styles. @param label - Evidence name. @param info - Screenshot destination. @returns Completion. */
async function inspect(
  page: Page,
  reference: unknown,
  label: string,
  info: TestInfo,
): Promise<void> {
  const panel = page.locator("[data-writer-modal-panel]");
  await expect(panel).toBeVisible();
  expect(await surface(panel)).toEqual(reference);
  const issues = await panel.evaluate(
    /** Measures actual controls and text, excluding intentionally crossing border-preview hit regions. @param element - Panel. @returns Geometry violations. */ (
      element,
    ) => {
      const bounds = element.getBoundingClientRect();
      const issues: string[] = [];
      if (
        bounds.left < 0 ||
        bounds.top < 0 ||
        bounds.right > innerWidth ||
        bounds.bottom > innerHeight
      )
        issues.push("panel outside viewport");
      if (element.scrollWidth > element.clientWidth + 1) issues.push("horizontal panel overflow");
      const controls = [...element.querySelectorAll<HTMLElement>("input,select,button")].filter(
        /** Omits hidden controls and the intentionally intersecting border selector. @param control - Candidate control. @returns Whether measured. */ (
          control,
        ) =>
          control.getClientRects().length > 0 && !control.hasAttribute("data-writer-border-edge"),
      );
      const rects = controls.map(
        /** Reads one control rectangle. @param control - Control. @returns Rectangle. */ (
          control,
        ) => control.getBoundingClientRect(),
      );
      for (let i = 0; i < controls.length; i++) {
        const control = controls[i] as HTMLElement;
        const rect = rects[i] as DOMRect;
        const name = control.getAttribute("aria-label") ?? control.textContent ?? control.tagName;
        if (rect.left < bounds.left + 1 || rect.right > bounds.right - 1)
          issues.push(`control outside panel: ${name}`);
        for (let j = i + 1; j < rects.length; j++) {
          const other = rects[j] as DOMRect;
          if (
            Math.min(rect.right, other.right) - Math.max(rect.left, other.left) > 1 &&
            Math.min(rect.bottom, other.bottom) - Math.max(rect.top, other.top) > 1
          )
            issues.push(`overlapping controls: ${name}`);
        }
      }
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const parent = node.parentElement;
        if (!node.textContent?.trim() || !parent || parent.closest("button,select,option,svg"))
          continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const text of range.getClientRects()) {
          if (text.left < bounds.left || text.right > bounds.right)
            issues.push(`text outside panel: ${node.textContent.trim()}`);
          for (const rect of rects) {
            if (
              Math.min(text.right, rect.right) - Math.max(text.left, rect.left) > 1 &&
              Math.min(text.bottom, rect.bottom) - Math.max(text.top, rect.top) > 1
            )
              issues.push(`text overlaps control: ${node.textContent.trim()}`);
          }
        }
      }
      return issues;
    },
  );
  expect(issues, label).toEqual([]);
  const action = panel.locator(".writer-dialog-actions button").last();
  if (await action.count()) {
    await action.scrollIntoViewIfNeeded();
    expect(
      await action.evaluate(
        /** Checks the action receives pointer hits after scrolling. @param element - Action. @returns Whether reachable. */ (
          element,
        ) => {
          const bounds = element.getBoundingClientRect();
          return element.contains(
            document.elementFromPoint(
              bounds.left + bounds.width / 2,
              bounds.top + bounds.height / 2,
            ),
          );
        },
      ),
    ).toBe(true);
  }
  await panel.evaluate(
    /** Restores the panel heading before capturing evidence. @param element - Panel. @returns Nothing. */ (
      element,
    ) => {
      element.scrollTop = 0;
    },
  );
  await page.screenshot({ path: info.outputPath(`${label}.png`) });
}

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 600 },
  { width: 640, height: 360 },
]) {
  test(`Writer dialog layout ${viewport.width}x${viewport.height}`, /** Covers all modal presenters and tab pages through real command ingress. @param fixtures - Browser fixtures. @param info - Evidence destination. @returns Completion. */ async ({
    page,
  }, info) => {
    test.setTimeout(90_000);
    await page.setViewportSize(viewport);
    await page.goto("/writer");
    const panel = page.locator("[data-writer-modal-panel]");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    const reference = await surface(panel);
    await inspect(page, reference, "open-browser", info);
    await page.getByRole("tab", { name: "On computer" }).click();
    await inspect(page, reference, "open-computer", info);
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from("Dialog layout fixture"),
      mimeType: "text/plain",
      name: "layout-fixture.txt",
    });
    await expect(page.getByRole("dialog")).toHaveCount(0);

    for (const command of ["Save As…", "Export…"]) {
      await openCommand(page, "File", command);
      await inspect(page, reference, command === "Save As…" ? "save-as" : "export", info);
      if (command === "Save As…") {
        expect(
          await panel.getByRole("textbox").evaluate(
            /** Measures Save As input insets against panel bounds. @param element - Name input. @returns Insets. */ (
              element,
            ) => {
              const input = element.getBoundingClientRect();
              const panel = (
                element.closest("[data-writer-modal-panel]") as HTMLElement
              ).getBoundingClientRect();
              return { left: input.left - panel.left, right: panel.right - input.right };
            },
          ),
        ).toEqual({ left: 25, right: 25 });
      }
      await panel.locator('button[aria-label="Close"]').click();
    }

    for (const [root, command, name, submenu] of [
      ["Insert", "Hyperlink…", "hyperlink"],
      ["Insert", "Bookmark…", "bookmark"],
      ["Insert", "Manual Break…", "insert-break", "More Breaks"],
      ["Format", "Page Style…", "page-style"],
      ["Tools", "Line Numbering…", "line-numbering"],
      ["Format", "Paragraph…", "paragraph"],
    ]) {
      await openCommand(page, root as string, command as string, submenu);
      await inspect(page, reference, name as string, info);
      if (name === "paragraph") {
        for (const tab of ["Text Flow", "Tabs"]) {
          await panel.getByRole("tab", { name: tab, exact: true }).click();
          await inspect(page, reference, `paragraph-${tab}`, info);
        }
      }
      await panel.locator('button[aria-label="Close"]').click();
    }

    await openCommand(page, "Table", "Table…");
    await inspect(page, reference, "insert-table", info);
    await panel.getByRole("button", { name: "Insert", exact: true }).click();
    const cell = page.getByRole("table").getByRole("textbox").first();
    await cell.click();
    await openCommand(page, "Table", "Table Properties…");
    await inspect(page, reference, "table-properties", info);
    for (const tab of ["Text Flow", "Columns", "Borders"]) {
      await panel.getByRole("tab", { name: tab, exact: true }).click();
      await inspect(page, reference, `table-${tab}`, info);
    }
    await panel.locator('button[aria-label="Close"]').click();
    await cell.click();
    await openCommand(page, "Table", "Row Height…", "Size");
    await inspect(page, reference, "row-height", info);
    await panel.getByRole("button", { name: "Help", exact: true }).click();
    await inspect(page, reference, "row-height-help", info);
    await panel.locator('button[aria-label="Close"]').click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    for (const name of ["Layout target", "Layout current"]) {
      await openCommand(page, "File", "Save As…");
      await panel.getByRole("textbox", { name: "New copy name" }).fill(name);
      await panel.getByRole("button", { name: "Save copy", exact: true }).click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
    await page.getByRole("button", { name: "Edit document title" }).click();
    await page.getByRole("textbox", { name: "Document title" }).fill("Layout target");
    await page.getByRole("textbox", { name: "Document title" }).press("Tab");
    await expect(page.getByRole("dialog", { name: "Resolve document name" })).toBeVisible();
    await inspect(page, reference, "name-collision", info);
    await panel.locator('button[aria-label="Close"]').click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
}
