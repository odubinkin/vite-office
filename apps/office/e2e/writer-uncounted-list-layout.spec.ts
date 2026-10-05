/** @fileoverview Measures native uncounted list text placement in real body and cell editing. */
import { expect, test } from "@playwright/test";
for (const cellMode of [false, true])
  test(`Writer uncounted list keeps native text-left through history cell=${cellMode}`, /** Exercises count intent and rendered geometry without upstream access. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
    page,
  }) => {
    await page.goto("/writer");
    if (cellMode) {
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
    }
    const editor = page.getByRole("textbox", {
      name: cellMode ? "Row 1 column 1 paragraph 1" : "Writer document text",
      exact: true,
    });
    await editor.click();
    await page.keyboard.type("Geometry");
    await page.getByRole("button", { name: "Format", exact: true }).click();
    await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
    await page.getByRole("menuitemradio", { name: "Ordered List", exact: true }).click();
    const readGeometry =
      /** Reads actual DOM text and wrapper positions. @returns Measured values. */ () =>
        editor.evaluate(
          /** Measures paragraph and first text glyph independently of marker presence. @param p - Editable host. @returns Geometry. */ (
            p,
          ) => {
            const rect = p.getBoundingClientRect(),
              wrapper = p.parentElement,
              outer = wrapper?.parentElement;
            const node = p.firstChild;
            if (wrapper === null || outer === null || outer === undefined || node === null)
              throw new Error("Missing geometry");
            const range = document.createRange();
            range.setStart(node, 0);
            range.setEnd(node, 1);
            const style = getComputedStyle(p),
              marker = wrapper.querySelector("[data-writer-list-marker]");
            return {
              text: p.textContent,
              marker: marker?.textContent ?? null,
              left: rect.left - outer.getBoundingClientRect().left,
              glyph: range.getBoundingClientRect().left - rect.left,
              margin: parseFloat(style.marginInlineStart),
              indent: parseFloat(style.textIndent),
            };
          },
        );
    const counted = await readGeometry();
    expect(counted.marker).toContain("1.");
    for (let i = 0; i < 8; i++) await editor.press("ArrowLeft");
    await editor.press("Backspace");
    await expect(editor).toHaveText("Geometry");
    await expect
      .poll(
        /** Waits for native uncounted marker projection. @returns Marker. */ async () =>
          (await readGeometry()).marker,
      )
      .toBeNull();
    const hidden = await readGeometry();
    expect(hidden.margin).toBeGreaterThan(0);
    expect(hidden.indent).toBe(0);
    expect(hidden.left).toBeCloseTo(counted.left, 1);
    expect(hidden.glyph).toBeCloseTo(0, 1);
    await editor.press("Control+z");
    await expect
      .poll(
        /** Waits for counted history projection. @returns Marker. */ async () =>
          (await readGeometry()).marker,
      )
      .toContain("1.");
    expect((await readGeometry()).left).toBeCloseTo(counted.left, 1);
    await editor.press("Control+y");
    await expect
      .poll(
        /** Waits for uncounted history projection. @returns Marker. */ async () =>
          (await readGeometry()).marker,
      )
      .toBeNull();
    expect((await readGeometry()).left).toBeCloseTo(hidden.left, 1);
    await editor.press("Shift+Backspace");
    await expect
      .poll(
        /** Waits for ShiftBackspace counted projection. @returns Marker. */ async () =>
          (await readGeometry()).marker,
      )
      .toContain("1.");
    await expect(editor).toHaveText("Geometry");
    await expect(editor).toHaveAttribute("data-list-level", "0");
    if (cellMode)
      await expect(
        page.getByRole("textbox", { name: "Row 1 column 2 paragraph 1", exact: true }),
      ).toHaveText("");
  });
