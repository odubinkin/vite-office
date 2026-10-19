# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: writer-menu-alignment.spec.ts >> menu commands and submenus align their labels
- Location: apps/office/e2e/writer-menu-alignment.spec.ts:4:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('menuitemradio', { name: 'No List' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('menuitemradio', { name: 'No List' })

```

```yaml
- main:
  - region "Writer workspace":
    - heading "Edit document title" [level=1]:
      - button "Edit document title": Untitled Writer Document
    - paragraph: Writer · browser workbench
    - menubar "Writer menu bar":
      - menuitem "File"
      - menuitem "Edit"
      - menuitem "View"
      - menuitem "Insert"
      - menuitem "Format" [expanded]
      - menu "Format menu":
        - menuitem "Text"
        - menuitem "Spacing"
        - menuitem "Paragraph…"
        - menuitem "Lists"
        - menuitem "Page Style…"
      - menuitem "Styles"
      - menuitem "Table"
      - menuitem "Tools"
    - toolbar "Writer standard toolbar":
      - button "New Document"
      - button "Open"
      - button "Print"
      - button "Cut"
      - button "Copy"
      - button "Paste"
      - button "Undo" [disabled]
      - button "Redo" [disabled]
      - button "Insert Table"
      - button "Page Break"
      - button "Hyperlink"
      - button "Bookmark"
    - toolbar "Writer formatting toolbar":
      - text: Paragraph style
      - combobox "Paragraph style":
        - option "Default Paragraph Style" [selected]
        - option "Text body"
        - option "Title"
        - option "Subtitle"
        - option "Heading 1"
        - option "Heading 2"
        - option "Heading 3"
        - option "Heading 4"
        - option "Quotations"
        - option "Preformatted Text"
      - text: Font name
      - combobox "Font name":
        - option "Liberation Serif" [selected]
        - option "Arial"
        - option "Calibri"
        - option "Cambria"
        - option "Courier New"
        - option "DejaVu Sans"
        - option "DejaVu Serif"
        - option "Liberation Mono"
        - option "Liberation Sans"
        - option "Noto Sans"
        - option "Noto Serif"
        - option "Times New Roman"
      - text: Font size
      - combobox "Font size":
        - option "8 pt"
        - option "9 pt"
        - option "10 pt"
        - option "11 pt"
        - option "12 pt" [selected]
        - option "14 pt"
        - option "16 pt"
        - option "18 pt"
        - option "20 pt"
        - option "24 pt"
        - option "28 pt"
        - option "32 pt"
        - option "36 pt"
        - option "48 pt"
        - option "72 pt"
      - button "Bold": B
      - button "Italic": I
      - button "Underline": U
      - button "Start" [pressed]
      - button "Center"
      - button "End"
      - button "Justified"
      - button "Unordered List"
      - button "Ordered List"
      - button "Increase"
      - button "Decrease"
      - button "Line Spacing": ↕
      - button "Font Color": A
      - group: ▾
      - button "Character Highlighting Color": ▨
      - group: ▾
    - toolbar "Writer horizontal ruler":
      - button "Left page margin"
      - button "Right page margin"
      - button "Paragraph left indent"
      - button "First line indent"
      - button "Paragraph right indent"
    - toolbar "Writer vertical ruler":
      - button "Top page margin"
      - button "Bottom page margin"
    - region "Writer document canvas":
      - article "Writer document body":
        - document "Page 1":
          - textbox "Writer document text"
    - complementary "Writer properties sidebar":
      - heading "Properties" [level=2]
      - button "Close Sidebar Deck"
      - region "Paragraph":
        - heading "Paragraph" [level=2]:
          - button "Paragraph" [expanded]
        - toolbar "Paragraph options":
          - button "More Options"
        - paragraph: Paragraph 1 is active.
        - paragraph: Alignment
        - paragraph: Left
        - button "Start" [pressed]
        - button "Center"
        - button "End"
        - button "Justified"
        - paragraph: Style
        - paragraph: Default Paragraph Style
        - paragraph: List
        - paragraph: No List
        - button "No List" [pressed]
        - button "Unordered List"
        - button "Ordered List"
      - toolbar "Sidebar deck selection":
        - button "Properties" [pressed]
    - status "Writer status bar": Not saved in this browser.
```

# Test source

```ts
  1  | /** @fileoverview Checks equal, compact insets for Writer command and submenu labels. */
  2  | import { expect, test } from "@playwright/test";
  3  | 
  4  | test("menu commands and submenus align their labels", /** Checks rendered label positions and submenu interaction. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
  5  |   page,
  6  | }) => {
  7  |   await page.goto("/writer");
  8  |   await page.getByRole("menuitem", { name: "Format" }).click();
  9  |   const paragraph = page.getByRole("menuitem", { name: "Paragraph…" });
  10 |   const lists = page.getByRole("menuitem", { name: "Lists" });
  11 |   const commandLabel = await paragraph.locator("span").nth(1).boundingBox();
  12 |   const submenuLabel = await lists.locator("span").nth(1).boundingBox();
  13 |   const commandX = commandLabel?.x ?? Number.NaN;
  14 |   const submenuX = submenuLabel?.x ?? Number.NaN;
  15 |   const rowX = (await paragraph.boundingBox())?.x ?? Number.NaN;
  16 |   expect(commandX).toBe(submenuX);
  17 |   expect(commandX - rowX).toBeLessThanOrEqual(20);
  18 |   await lists.hover();
> 19 |   await expect(page.getByRole("menuitemradio", { name: "No List" })).toBeVisible();
     |                                                                      ^ Error: expect(locator).toBeVisible() failed
  20 |   await page.getByRole("menuitem", { name: "View" }).hover();
  21 |   const sidebarX =
  22 |     (
  23 |       await page
  24 |         .getByRole("menuitemcheckbox", { name: "Sidebar" })
  25 |         .locator("span")
  26 |         .nth(1)
  27 |         .boundingBox()
  28 |     )?.x ?? Number.NaN;
  29 |   const rulersX =
  30 |     (await page.getByRole("menuitem", { name: "Rulers" }).locator("span").nth(1).boundingBox())
  31 |       ?.x ?? Number.NaN;
  32 |   expect(sidebarX).toBe(rulersX);
  33 | });
  34 | 
```