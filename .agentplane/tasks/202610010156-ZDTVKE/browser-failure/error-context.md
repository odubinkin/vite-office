# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: writer-responsive-sidebar.spec.ts >> the page stays within the viewport while the document and modal scroll
- Location: apps/office/e2e/writer-responsive-sidebar.spec.ts:33:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('menuitem', { name: 'Paragraph…' })
    - locator resolved to <button tabindex="-1" type="button" role="menuitem" class="flex w-full items-center rounded-md px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45">…</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action
    - <html lang="en">…</html> intercepts pointer events
  - retrying click action
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- main [ref=e3]:
  - region "Writer workspace" [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8]:
          - button "Edit document title" [ref=e9]: Untitled Writer Document
          - paragraph [ref=e10]: Writer · browser workbench
        - menubar "Writer menu bar" [ref=e12]:
          - button "File" [ref=e14]
          - button "Edit" [ref=e16]
          - button "View" [ref=e18]
          - button "Insert" [ref=e20]
          - button "Format" [active] [ref=e22]
          - generic [ref=e23]:
            - button "Styles" [expanded] [ref=e24]
            - menu "Styles menu" [ref=e25]:
              - menuitemradio "Default Paragraph Style" [checked] [ref=e26]:
                - generic [ref=e27]: ✓
              - menuitemradio "Text body" [ref=e29]
              - menuitemradio "First line indent" [ref=e31]
              - menuitemradio "Hanging indent" [ref=e33]
              - menuitemradio "Text body indent" [ref=e35]
              - menuitemradio "Marginalia" [ref=e37]
              - menuitemradio "Caption" [ref=e39]
              - menuitemradio "Footnote" [ref=e41]
              - menuitemradio "Endnote" [ref=e43]
              - menuitemradio "Comment" [ref=e45]
              - menuitemradio "Title" [ref=e47]
              - menuitemradio "Subtitle" [ref=e49]
              - menuitemradio "Appendix" [ref=e51]
              - menuitemradio "Heading" [ref=e53]
              - menuitemradio "Heading 1" [ref=e55]
              - menuitemradio "Heading 2" [ref=e57]
              - menuitemradio "Heading 3" [ref=e59]
              - menuitemradio "Heading 4" [ref=e61]
              - menuitemradio "Heading 5" [ref=e63]
              - menuitemradio "Heading 6" [ref=e65]
              - menuitemradio "Heading 7" [ref=e67]
              - menuitemradio "Heading 8" [ref=e69]
              - menuitemradio "Heading 9" [ref=e71]
              - menuitemradio "Heading 10" [ref=e73]
              - menuitemradio "Quotations" [ref=e75]
              - menuitemradio "Preformatted Text" [ref=e77]
              - menuitemradio "No List" [checked] [ref=e80]:
                - generic [ref=e81]: ✓
                - generic [ref=e83]: Ctrl+Shift+F12
          - button "Table" [ref=e85]
          - button "Tools" [ref=e87]
      - toolbar "Writer standard toolbar" [ref=e88]:
        - button "New Document" [ref=e89]
        - button "Open" [ref=e93]
        - button "Print" [ref=e97]
        - button "Cut" [ref=e103]
        - button "Copy" [ref=e110]
        - button "Paste" [ref=e114]
        - button "Undo" [disabled] [ref=e121]
        - button "Redo" [disabled] [ref=e125]
        - button "Insert Table" [ref=e131] [cursor=pointer]
        - button "Page Break" [ref=e135]
        - button "Hyperlink" [ref=e140]
        - button "Bookmark" [ref=e144]
      - toolbar "Writer formatting toolbar" [ref=e147]:
        - generic [ref=e148]:
          - generic [ref=e149]: Paragraph style
          - combobox "Paragraph style" [ref=e150]:
            - option "Default Paragraph Style" [selected]
            - option "Text body"
            - option "First line indent"
            - option "Hanging indent"
            - option "Text body indent"
            - option "Marginalia"
            - option "Caption"
            - option "Footnote"
            - option "Endnote"
            - option "Comment"
            - option "Title"
            - option "Subtitle"
            - option "Appendix"
            - option "Heading"
            - option "Heading 1"
            - option "Heading 2"
            - option "Heading 3"
            - option "Heading 4"
            - option "Heading 5"
            - option "Heading 6"
            - option "Heading 7"
            - option "Heading 8"
            - option "Heading 9"
            - option "Heading 10"
            - option "Quotations"
            - option "Preformatted Text"
        - generic [ref=e152]:
          - generic [ref=e153]: Font name
          - combobox "Font name" [ref=e154]:
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
        - generic [ref=e156]:
          - generic [ref=e157]: Font size
          - combobox "Font size" [ref=e158]:
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
        - button "Bold" [ref=e160]: B
        - button "Italic" [ref=e161]:
          - generic [ref=e162]: I
        - button "Underline" [ref=e163]:
          - generic [ref=e164]: U
        - button "Start" [pressed] [ref=e166]
        - button "Center" [ref=e168]
        - button "End" [ref=e170]
        - button "Justified" [ref=e172]
        - button "Unordered List" [ref=e175]
        - button "Ordered List" [ref=e177]
        - button "Increase" [ref=e182]
        - button "Decrease" [disabled] [ref=e185]
        - button "Line Spacing" [ref=e190] [cursor=pointer]: ↕
        - generic "Character colors" [ref=e191]:
          - generic "Font Color" [ref=e192]:
            - button "Font Color" [ref=e193]:
              - generic [ref=e194]: A
            - group [ref=e196]:
              - generic "Font Color palette" [ref=e197] [cursor=pointer]: ▾
              - option "Standard" [selected]
              - option "LibreOffice"
              - option "HTML"
          - generic "Character Highlighting Color" [ref=e198]:
            - button "Character Highlighting Color" [ref=e199]:
              - generic [ref=e200]: ▨
            - group [ref=e202]:
              - generic "Character Highlighting Color palette" [ref=e203] [cursor=pointer]: ▾
              - option "Standard" [selected]
              - option "LibreOffice"
              - option "HTML"
    - generic:
      - generic:
        - toolbar "Writer horizontal ruler" [ref=e204]:
          - generic [ref=e205]:
            - generic:
              - generic: "3"
              - generic: "2"
              - generic: "1"
              - generic: "0"
              - generic: "1"
              - generic: "2"
              - generic: "3"
              - generic: "4"
              - generic: "5"
              - generic: "6"
              - generic: "7"
              - generic: "8"
              - generic: "9"
              - generic: "10"
              - generic: "11"
              - generic: "12"
              - generic: "13"
              - generic: "14"
              - generic: "15"
              - generic: "16"
              - generic: "17"
              - generic: "18"
            - button "Left page margin" [ref=e208]
            - button "Right page margin" [ref=e209]
            - button "Paragraph left indent" [ref=e210]
            - button "First line indent" [ref=e211]
            - button "Paragraph right indent" [ref=e212]
        - generic "Writer vertical ruler lane":
          - toolbar "Writer vertical ruler" [ref=e215]:
            - generic:
              - generic: "2"
              - generic: "1"
              - generic: "0"
              - generic: "1"
              - generic: "2"
              - generic: "3"
              - generic: "4"
              - generic: "5"
              - generic: "6"
              - generic: "7"
              - generic: "8"
              - generic: "9"
              - generic: "10"
              - generic: "11"
              - generic: "12"
              - generic: "13"
              - generic: "14"
              - generic: "15"
              - generic: "16"
              - generic: "17"
              - generic: "18"
              - generic: "19"
              - generic: "20"
              - generic: "21"
              - generic: "22"
              - generic: "23"
              - generic: "24"
              - generic: "25"
            - button "Top page margin" [ref=e218]
            - button "Bottom page margin" [ref=e219]
        - region "Writer document canvas" [ref=e220]:
          - article "Writer document body" [ref=e221]:
            - document "Page 1" [ref=e223]:
              - generic [ref=e224]:
                - generic [ref=e225]: "Paragraph style: Default Paragraph Style"
                - textbox "Writer document text" [ref=e227]
      - complementary "Writer properties sidebar" [ref=e228]:
        - paragraph [ref=e229]: Properties
        - heading "Paragraph" [level=2] [ref=e230]
        - paragraph [ref=e231]: Paragraph 1 is active.
        - generic [ref=e232]:
          - paragraph [ref=e233]: Alignment
          - paragraph [ref=e234]: Left
          - generic [ref=e235]:
            - button "Start" [pressed] [ref=e236]
            - button "Center" [ref=e238]
            - button "End" [ref=e240]
            - button "Justified" [ref=e242]
          - paragraph [ref=e244]: Style
          - paragraph [ref=e245]: Default Paragraph Style
          - paragraph [ref=e246]: List
          - paragraph [ref=e247]: No List
          - generic [ref=e248]:
            - button "No List" [pressed] [ref=e249]
            - button "Unordered List" [ref=e253]
            - button "Ordered List" [ref=e255]
    - status "Writer status bar" [ref=e259]:
      - generic [ref=e260]: Not saved in this browser.
```

# Test source

```ts
  1   | /** @fileoverview Verifies that the Writer sidebar command matches the reachable narrow-screen panel. */
  2   | 
  3   | import { expect, test } from "@playwright/test";
  4   | 
  5   | test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  6   | 
  7   | test("sidebar remains reachable and its checked state follows visibility on a touch viewport", /** Runs the focused test callback. @param argument1 - Input for this operation. @returns Operation result. */ async ({
  8   |   page,
  9   | }): Promise<void> => {
  10  |   await page.goto("/writer");
  11  | 
  12  |   const sidebar = page.getByRole("complementary", { name: "Writer properties sidebar" });
  13  |   await expect(sidebar).toBeVisible();
  14  |   await expect(sidebar.getByRole("heading", { name: "Paragraph" })).toBeVisible();
  15  | 
  16  |   await page.getByRole("button", { name: "View" }).click();
  17  |   const toggle = page.getByRole("menuitemcheckbox", { name: "Sidebar" });
  18  |   await expect(toggle).toHaveAttribute("aria-checked", "true");
  19  |   await toggle.click();
  20  |   await expect(sidebar).toHaveCount(0);
  21  | 
  22  |   await page.getByRole("button", { name: "View" }).click();
  23  |   await expect(page.getByRole("menuitemcheckbox", { name: "Sidebar" })).toHaveAttribute(
  24  |     "aria-checked",
  25  |     "false",
  26  |   );
  27  |   await page.getByRole("menuitemcheckbox", { name: "Sidebar" }).click();
  28  |   await expect(sidebar).toBeVisible();
  29  |   await sidebar.getByRole("button", { name: "Start" }).focus();
  30  |   await expect(sidebar.getByRole("button", { name: "Start" })).toBeFocused();
  31  | });
  32  | 
  33  | test("the page stays within the viewport while the document and modal scroll", /** Checks mobile containment. @param page - Browser page fixture. @returns Nothing. */ async ({
  34  |   page,
  35  | }) => {
  36  |   await page.goto("/writer");
  37  |   const canvas = page.getByRole("region", { name: "Writer document canvas" });
  38  |   const size = await page.evaluate(
  39  |     /** Reads viewport geometry. @returns Document and viewport dimensions. */ () => ({
  40  |       documentWidth: document.documentElement.scrollWidth,
  41  |       documentHeight: document.documentElement.scrollHeight,
  42  |       viewportWidth: innerWidth,
  43  |       viewportHeight: innerHeight,
  44  |     }),
  45  |   );
  46  |   expect(size.documentWidth).toBe(size.viewportWidth);
  47  |   expect(size.documentHeight).toBe(size.viewportHeight);
  48  |   expect(
  49  |     await canvas.evaluate(
  50  |       /** Checks canvas overflow. @param element - Canvas element. @returns Whether canvas scrolls. */ (
  51  |         element,
  52  |       ) => element.scrollWidth > element.clientWidth,
  53  |     ),
  54  |   ).toBe(true);
  55  | 
  56  |   await page.setViewportSize({ width: 390, height: 340 });
  57  |   await page.getByRole("button", { name: "Format" }).click();
> 58  |   await page.getByRole("menuitem", { name: "Paragraph…" }).click();
      |                                                            ^ Error: locator.click: Test timeout of 30000ms exceeded.
  59  |   const panel = page.locator("[data-writer-modal-panel]");
  60  |   await expect(panel).toBeVisible();
  61  |   expect(
  62  |     await panel.evaluate(
  63  |       /** Checks dialog overflow. @param element - Modal panel. @returns Whether panel scrolls. */ (
  64  |         element,
  65  |       ) => element.scrollHeight > element.clientHeight,
  66  |     ),
  67  |   ).toBe(true);
  68  |   expect(
  69  |     await page.evaluate(
  70  |       /** Reads document height. @returns Height in pixels. */ () =>
  71  |         document.documentElement.scrollHeight,
  72  |     ),
  73  |   ).toBe(340);
  74  | });
  75  | 
  76  | test("the mobile table grid dismisses outside and More Options opens the full dialog", /** Checks the pinned quick control on a touch viewport. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
  77  |   page,
  78  | }) => {
  79  |   await page.goto("/writer");
  80  |   const insertTable = page.getByRole("button", { name: "Insert Table" });
  81  |   await insertTable.click();
  82  |   await expect(page.getByRole("button", { name: "More Options" })).toBeVisible();
  83  |   await page
  84  |     .getByRole("region", { name: "Writer document canvas" })
  85  |     .click({ position: { x: 20, y: 20 } });
  86  |   await expect(page.getByRole("button", { name: "More Options" })).toHaveCount(0);
  87  |   await insertTable.click();
  88  |   await page.getByRole("button", { name: "More Options" }).click();
  89  |   await expect(page.getByRole("dialog", { name: "Insert Table" })).toBeVisible();
  90  |   await page
  91  |     .getByRole("dialog", { name: "Insert Table" })
  92  |     .getByRole("button", { name: "Cancel" })
  93  |     .click();
  94  |   await insertTable.click();
  95  |   const tableCell = page.getByRole("button", { name: "2 columns, 2 rows" });
  96  |   expect(
  97  |     await tableCell.evaluate(
  98  |       /** Confirms the cell receives a real pointer hit above both toolbars. @param element - Grid cell. @returns Whether the cell is topmost. */ (
  99  |         element,
  100 |       ) => {
  101 |         const bounds = element.getBoundingClientRect();
  102 |         return (
  103 |           document.elementFromPoint(
  104 |             bounds.left + bounds.width / 2,
  105 |             bounds.top + bounds.height / 2,
  106 |           ) === element
  107 |         );
  108 |       },
  109 |     ),
  110 |   ).toBe(true);
  111 |   await tableCell.click();
  112 |   await expect(page.getByRole("table", { name: "Table1" })).toBeVisible();
  113 | });
  114 | 
```