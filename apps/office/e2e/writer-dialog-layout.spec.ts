/** @fileoverview Checks actual Writer modal geometry, shared styling and reachable actions. */
import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";

// Chromium's headless default hides scrollbars, which would invalidate visual affordance evidence.
test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });

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
      /** Intersects a rectangle with scroll/clip ancestors so hidden content is not reported as overlapping fixed chrome. @param node - Rectangle owner. @param rect - Layout rectangle. @returns Visible rectangle or undefined. */
      function visibleRect(node: HTMLElement, rect: DOMRect): DOMRect | undefined {
        let { left, right, top, bottom } = rect;
        for (let parent = node.parentElement; parent; parent = parent.parentElement) {
          const style = getComputedStyle(parent);
          const clip = parent.getBoundingClientRect();
          if (/auto|scroll|hidden|clip/.test(style.overflowX)) {
            left = Math.max(left, clip.left);
            right = Math.min(right, clip.right);
          }
          if (/auto|scroll|hidden|clip/.test(style.overflowY)) {
            top = Math.max(top, clip.top);
            bottom = Math.min(bottom, clip.bottom);
          }
        }
        return right > left && bottom > top
          ? new DOMRect(left, top, right - left, bottom - top)
          : undefined;
      }
      if (
        bounds.left < 0 ||
        bounds.top < 0 ||
        bounds.right > innerWidth ||
        bounds.bottom > innerHeight
      )
        issues.push("panel outside viewport");
      if (element.scrollWidth > element.clientWidth + 1) issues.push("horizontal panel overflow");
      for (const region of element.querySelectorAll<HTMLElement>(
        ".writer-dialog-content,.writer-dialog-scroll",
      )) {
        if (region.scrollWidth > region.clientWidth + 1) issues.push("horizontal body overflow");
      }
      const controls = [...element.querySelectorAll<HTMLElement>("input,select,button")].filter(
        /** Omits hidden controls and the intentionally intersecting border selector. @param control - Candidate control. @returns Whether measured. */ (
          control,
        ) =>
          control.getClientRects().length > 0 && !control.hasAttribute("data-writer-border-edge"),
      );
      const rects = controls.map(
        /** Reads one control rectangle. @param control - Control. @returns Rectangle. */ (
          control,
        ) => visibleRect(control, control.getBoundingClientRect()),
      );
      for (let i = 0; i < controls.length; i++) {
        const control = controls[i] as HTMLElement;
        const rect = rects[i];
        if (rect === undefined) continue;
        const name = control.getAttribute("aria-label") ?? control.textContent ?? control.tagName;
        if (rect.left < bounds.left + 1 || rect.right > bounds.right - 1)
          issues.push(`control outside panel: ${name}`);
        for (let j = i + 1; j < rects.length; j++) {
          const other = rects[j];
          if (other === undefined) continue;
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
        for (const rawText of range.getClientRects()) {
          const text = visibleRect(parent, rawText);
          if (text === undefined) continue;
          if (text.left < bounds.left || text.right > bounds.right)
            issues.push(`text outside panel: ${node.textContent.trim()}`);
          for (const rect of rects) {
            if (rect === undefined) continue;
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
  await inspectScrolling(panel, label);
  if (
    await panel.locator(".writer-dialog-content,.writer-dialog-scroll").evaluateAll(
      /** Finds bodies left at the bottom for visual scroll evidence. @param regions - Scroll regions. @returns Whether scrolled. */ (
        regions,
      ) =>
        regions.some(
          /** Checks one scroll offset. @param region - Scroll body. @returns Whether scrolled. */
          (region) => region.scrollTop > 0,
        ),
    )
  )
    await page.screenshot({ path: info.outputPath(`${label}-scrolled.png`) });
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
      for (const region of element.querySelectorAll<HTMLElement>(
        ".writer-dialog-content,.writer-dialog-scroll,.writer-dialog-tablist",
      ))
        region.scrollTop = 0;
    },
  );
  await page.screenshot({ path: info.outputPath(`${label}.png`) });
}

/** Checks every overflowing body leaves dialog chrome and navigation stationary and exposes a contrasting scrollbar. @param panel - Modal panel. @param label - Evidence name. @returns Completion. */
async function inspectScrolling(panel: Locator, label: string): Promise<void> {
  const result = await panel.evaluate(
    /** Scrolls actual constrained regions and compares fixed surfaces. @param element - Modal panel. @returns Contract violations. */ (
      element,
    ) => {
      const issues: string[] = [];
      const anchors = [
        ...element.querySelectorAll<HTMLElement>(
          ".writer-dialog-header,.writer-dialog-actions,.writer-dialog-tablist",
        ),
      ];
      const before = anchors.map(
        /** Captures fixed surface bounds. @param anchor - Fixed surface. @returns Rectangle tuple. */ (
          anchor,
        ) => JSON.stringify(anchor.getBoundingClientRect().toJSON()),
      );
      for (const region of element.querySelectorAll<HTMLElement>(
        ".writer-dialog-content,.writer-dialog-scroll",
      )) {
        if (region.scrollHeight <= region.clientHeight + 1) continue;
        if (getComputedStyle(region).overflowY !== "auto") {
          if (!["hidden", "clip"].includes(getComputedStyle(region).overflowY))
            issues.push("unbounded body");
          continue;
        }
        region.scrollTop = region.scrollHeight;
        if (region.scrollTop === 0) issues.push("body did not scroll");
        const lastControl = [...region.querySelectorAll<HTMLElement>("input,select,button")].at(-1);
        lastControl?.focus();
        if (element.scrollTop !== 0) issues.push("panel scrolled");
        anchors.forEach(
          /** Compares stationary navigation and chrome. @param anchor - Fixed surface. @param index - Snapshot index. @returns Nothing. */ (
            anchor,
            index,
          ) => {
            if (JSON.stringify(anchor.getBoundingClientRect().toJSON()) !== before[index])
              issues.push("chrome or navigation moved with body");
          },
        );
        const thumb = getComputedStyle(region, "::-webkit-scrollbar-thumb");
        const track = getComputedStyle(region, "::-webkit-scrollbar-track");
        if (getComputedStyle(region, "::-webkit-scrollbar").width !== "12px")
          issues.push("missing visible scrollbar width");
        if (thumb.backgroundColor === track.backgroundColor)
          issues.push("scroll thumb has no contrast");
      }
      return issues;
    },
  );
  expect(result, `${label}: stationary scroll surfaces`).toEqual([]);
}

/** Simulates a future overflowing navigation list without changing runtime dialog logic, then checks independent scrolling. @param panel - Tabbed modal. @returns Completion. */
async function inspectNavigationOverflow(panel: Locator): Promise<void> {
  const result = await panel.evaluate(
    /** Temporarily extends the tablist and measures its independent scroll contract. @param element - Modal panel. @returns Observed scroll state. */ (
      element,
    ) => {
      const nav = element.querySelector(".writer-dialog-tablist") as HTMLElement;
      const body = element.querySelector('[role="tabpanel"]') as HTMLElement;
      const header = element.querySelector(".writer-dialog-header") as HTMLElement;
      const footer = element.querySelector(".writer-dialog-actions") as HTMLElement;
      const clones: HTMLElement[] = [];
      for (let index = 0; index < 30; index++) {
        const clone = (nav.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;
        clone.textContent = `Additional tab ${index}`;
        clone.removeAttribute("aria-selected");
        nav.append(clone);
        clones.push(clone);
      }
      const fixedBefore = [header, footer, body].map(
        /** Captures fixed bounds after the longer navigation has laid out, before scrolling. @param node - Surface. @returns Rectangle string. */ (
          node,
        ) => JSON.stringify(node.getBoundingClientRect().toJSON()),
      );
      const vertical = getComputedStyle(nav).flexDirection === "column";
      if (vertical) nav.scrollTop = nav.scrollHeight;
      else nav.scrollLeft = nav.scrollWidth;
      const last = clones.at(-1) as HTMLElement;
      last.focus();
      const navBounds = nav.getBoundingClientRect();
      const lastBounds = last.getBoundingClientRect();
      const result = {
        navScrolled: vertical ? nav.scrollTop > 0 : nav.scrollLeft > 0,
        bodyScrollTop: body.scrollTop,
        panelScrollTop: element.scrollTop,
        keyboardFocus: document.activeElement === last,
        lastVisible: vertical
          ? lastBounds.top >= navBounds.top && lastBounds.bottom <= navBounds.bottom
          : lastBounds.left >= navBounds.left && lastBounds.right <= navBounds.right,
        scrollbarContrast:
          getComputedStyle(nav, "::-webkit-scrollbar-thumb").backgroundColor !==
          getComputedStyle(nav, "::-webkit-scrollbar-track").backgroundColor,
        stable: [header, footer, body].every(
          /** Compares fixed bounds after navigation scroll. @param node - Surface. @param index - Snapshot index. @returns Whether stationary. */ (
            node,
            index,
          ) => JSON.stringify(node.getBoundingClientRect().toJSON()) === fixedBefore[index],
        ),
      };
      for (const clone of clones) clone.remove();
      nav.scrollTop = 0;
      nav.scrollLeft = 0;
      (nav.firstElementChild as HTMLElement).focus({ preventScroll: true });
      return result;
    },
  );
  expect(result).toEqual({
    navScrolled: true,
    bodyScrollTop: 0,
    panelScrollTop: 0,
    keyboardFocus: true,
    lastVisible: true,
    scrollbarContrast: true,
    stable: true,
  });
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
              const region = element.closest(".writer-dialog-content") as HTMLElement;
              const gutter = region.offsetWidth - region.clientWidth;
              return { left: input.left - panel.left, right: panel.right - input.right - gutter };
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
        if (viewport.width === 390 || viewport.height === 360) {
          const body = panel.locator('.writer-dialog-scroll[role="tabpanel"]');
          const anchors = panel.locator(
            ".writer-dialog-header,.writer-dialog-actions,.writer-dialog-tablist",
          );
          const before = await anchors.evaluateAll(
            /** Captures chrome/navigation bounds before a real wheel event. @param elements - Fixed surfaces. @returns Rectangle snapshots. */ (
              elements,
            ) =>
              elements.map(
                /** Captures one anchor. @param element - Fixed surface. @returns Rectangle snapshot. */
                (element) => element.getBoundingClientRect().toJSON(),
              ),
          );
          await body.hover();
          await page.mouse.wheel(0, 10_000);
          await expect
            .poll(
              /** Waits for browser-native wheel scrolling. @returns Body scroll offset. */ () =>
                body.evaluate(
                  /** Reads native body scroll. @param element - Scroll body. @returns Offset. */
                  (element) => element.scrollTop,
                ),
            )
            .toBeGreaterThan(0);
          expect(
            await anchors.evaluateAll(
              /** Measures fixed surfaces after the wheel event. @param elements - Fixed surfaces. @returns Rectangle snapshots. */ (
                elements,
              ) =>
                elements.map(
                  /** Captures one anchor after scrolling. @param element - Fixed surface. @returns Rectangle snapshot. */
                  (element) => element.getBoundingClientRect().toJSON(),
                ),
            ),
          ).toEqual(before);
          await page.screenshot({ path: info.outputPath("paragraph-wheel-scrolled.png") });
          await body.evaluate(
            /** Restores initial content position for tab navigation checks. @param element - Scroll body. @returns Nothing. */ (
              element,
            ) => {
              element.scrollTop = 0;
            },
          );
        }
        await inspectNavigationOverflow(panel);
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
