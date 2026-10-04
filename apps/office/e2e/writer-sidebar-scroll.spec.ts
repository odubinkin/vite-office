/** @fileoverview Checks measured native ShowPanel adjustment in real Writer chrome. */
import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`Sidebar ShowPanel reveals an oversized Paragraph panel at width ${width}`, /** Checks real DOM extents after focus and subsequent owned editing. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 600 });
    await page.goto("/writer");
    const sidebar = page.getByRole("complementary", { name: "Writer properties sidebar" });
    const panel = sidebar.getByRole("region", { name: "Paragraph" });
    const title = sidebar.getByRole("button", { name: "Paragraph", exact: true });
    const rail = sidebar.getByRole("button", { name: "Properties", exact: true });
    await panel.evaluate(
      /** Constrains the existing scrollport to exercise measured overflow. @param element - Owned panel root. @returns Nothing. */
      (element) => {
        const viewport = element.parentElement as HTMLElement;
        viewport.style.height = "100px";
        viewport.style.maxHeight = "100px";
      },
    );
    for (const route of ["Tab", "Escape"]) {
      await panel.evaluate(
        /** Resets only the owned viewport before focus entry. @param element - Panel root. @returns Nothing. */
        (element) => {
          (element.parentElement as HTMLElement).scrollTop = 0;
        },
      );
      const control =
        route === "Tab" ? rail : sidebar.getByRole("button", { name: "Start", exact: true });
      await control.focus();
      await control.press(route);
      await expect(title).toBeFocused();
      await expect(title).toHaveAttribute("aria-expanded", "true");
      const geometry = await panel.evaluate(
        /** Measures actual visible panel geometry, without an upstream implementation. @param element - Panel root. @returns Owned geometry. */
        (element) => {
          const viewport = element.parentElement as HTMLElement;
          const extent = element.getBoundingClientRect();
          return {
            panelTop: extent.top - viewport.getBoundingClientRect().top - viewport.clientTop,
            height: extent.height,
            pageSize: viewport.clientHeight,
            scroll: viewport.scrollTop,
          };
        },
      );
      expect(geometry.height).toBeGreaterThan(geometry.pageSize);
      expect(geometry.scroll).toBeGreaterThan(0);
      expect(geometry.panelTop).toBeCloseTo(0, 1);
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
    await title.press("Escape");
    const editor = page.getByLabel("Writer document body", { exact: true });
    await expect(editor).toBeFocused();
    await page.keyboard.insertText("SidebarScrollProof");
    await expect(editor).toContainText("SidebarScrollProof");
  });
}
