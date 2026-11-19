/** @fileoverview Checks visible progress across both real browser document-opening paths. */
import { expect, test, type Page } from "@playwright/test";

/** Records progress with layout at a browser frame, including for operations too fast to poll. @param page - Active editor. @returns Installed observation. */
async function observeOpeningProgress(page: Page): Promise<void> {
  await page.evaluate(
    /** Observes the open dialog until it paints its progress indicator. @returns Nothing. */ () => {
      const dialog = document.querySelector('[role="dialog"][aria-label="Open"]');
      if (dialog === null) throw new Error("Open dialog is missing");
      delete document.documentElement.dataset.testOpeningProgress;
      const observer = new MutationObserver(
        /** Samples the visible, indeterminate browser control. @returns Nothing. */ () => {
          const progress = dialog.querySelector("progress");
          if (progress === null) return;
          observer.disconnect();
          window.requestAnimationFrame(
            /** Records the indicator if still visible at rendering time. @returns Nothing. */ () => {
              if (progress.getBoundingClientRect().width > 0 && progress.position === -1)
                document.documentElement.dataset.testOpeningProgress = "painted";
            },
          );
        },
      );
      observer.observe(dialog, { childList: true, subtree: true });
    },
  );
}

for (const suite of [
  { route: "writer", extension: "txt", mimeType: "text/plain" },
  { route: "calc", extension: "csv", mimeType: "text/csv" },
]) {
  test(`${suite.route} shows progress during import, reopen and recovery`, /** Opens through the production suite adapters and browser store. @param fixtures - Browser fixtures. @returns Completion. */ async ({
    page,
  }) => {
    await page.goto(`/${suite.route}`);
    const open = page.getByRole("button", { name: "Open", exact: true });
    const dialog = page.getByRole("dialog", { name: "Open", exact: true });
    const computer = dialog.getByRole("tab", { name: "On computer" });
    const browse = dialog.getByLabel("Browse");
    const progress = dialog.getByRole("progressbar", { name: "Opening document" });
    const content = Buffer.from("Opening progress fixture\n");
    const source = {
      name: `opening-progress.${suite.extension}`,
      mimeType: suite.mimeType,
      buffer: content,
    };
    const html = page.locator("html");

    await open.click();
    await computer.click();
    await observeOpeningProgress(page);
    await browse.setInputFiles(source);
    await expect(dialog).toHaveCount(0);
    await expect(html).toHaveAttribute("data-test-opening-progress", "painted");

    await open.click();
    await observeOpeningProgress(page);
    await dialog.getByRole("button", { name: "opening-progress", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(html).toHaveAttribute("data-test-opening-progress", "painted");

    await open.click();
    await computer.click();
    await browse.setInputFiles(source);
    await expect(
      dialog.getByRole("heading", { name: "A document with this name exists" }),
    ).toBeVisible();
    await expect(progress).toHaveCount(0);
    await observeOpeningProgress(page);
    await dialog.getByRole("button", { name: "Save as new" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(html).toHaveAttribute("data-test-opening-progress", "painted");

    await open.click();
    await computer.click();
    await observeOpeningProgress(page);
    await browse.setInputFiles({
      name: suite.route === "writer" ? "invalid.odt" : "invalid.ods",
      mimeType: "application/octet-stream",
      buffer: content,
    });
    await expect(dialog.getByRole("alert")).toBeVisible();
    await expect(html).toHaveAttribute("data-test-opening-progress", "painted");
    await expect(progress).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Close", exact: true })).toBeEnabled();
  });
}
