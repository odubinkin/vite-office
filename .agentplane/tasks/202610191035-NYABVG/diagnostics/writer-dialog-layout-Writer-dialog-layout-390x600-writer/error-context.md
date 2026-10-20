# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: writer-dialog-layout.spec.ts >> Writer dialog layout 390x600
- Location: apps/office/e2e/writer-dialog-layout.spec.ts:321:3

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('menuitem', { name: 'Tools', exact: true })

```

# Page snapshot

```yaml
- main [ref=e3]:
  - region "Writer workspace" [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8]:
          - heading [level=1] [ref=e9]:
            - button "Edit document title" [ref=e10]: layout-fixture
          - paragraph [ref=e11]: Writer · browser workbench
        - menubar "Writer menu bar" [ref=e14]:
          - menuitem "File" [ref=e16]
          - menuitem "Edit" [ref=e18]
          - menuitem "View" [ref=e20]
          - menuitem "Insert" [ref=e22]
          - menuitem "Format" [ref=e24]
          - menuitem "More menus" [ref=e26]: »
      - toolbar "Writer standard toolbar" [ref=e27]:
        - button "New Document" [ref=e28]
        - button "Open" [ref=e32]
        - button "Print" [ref=e36]
        - button "Cut" [ref=e42]
        - button "Copy" [ref=e49]
        - button "Paste" [ref=e53]
        - button "Undo" [disabled] [ref=e60]
        - button "Redo" [disabled] [ref=e64]
        - button "Insert Table" [ref=e70] [cursor=pointer]
        - button "Page Break" [ref=e74]
        - button "Hyperlink" [ref=e79]
        - button "Bookmark" [ref=e83]
      - toolbar "Writer formatting toolbar" [ref=e86]:
        - generic [ref=e87]:
          - generic [ref=e88]: Paragraph style
          - combobox "Paragraph style" [ref=e89]:
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
        - generic [ref=e91]:
          - generic [ref=e92]: Font name
          - combobox "Font name" [ref=e93]:
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
        - generic [ref=e95]:
          - generic [ref=e96]: Font size
          - combobox "Font size" [ref=e97]:
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
        - button "Bold" [ref=e99]: B
        - button "Italic" [ref=e100]:
          - generic [ref=e101]: I
        - button "Underline" [ref=e102]:
          - generic [ref=e103]: U
        - button "Start" [pressed] [ref=e105]
        - button "Center" [ref=e107]
        - button "End" [ref=e109]
        - button "Justified" [ref=e111]
        - button "Unordered List" [ref=e114]
        - button "Ordered List" [ref=e116]
        - button "Increase" [ref=e121]
        - button "Decrease" [ref=e124]
        - button "Line Spacing" [ref=e129] [cursor=pointer]: ↕
        - generic "Character colors" [ref=e130]:
          - generic "Font Color" [ref=e131]:
            - button "Font Color" [ref=e132]:
              - generic [ref=e133]: A
            - group [ref=e135]:
              - generic "Font Color palette" [ref=e136] [cursor=pointer]: ▾
              - option "Standard" [selected]
              - option "LibreOffice"
              - option "HTML"
          - generic "Character Highlighting Color" [ref=e137]:
            - button "Character Highlighting Color" [ref=e138]:
              - generic [ref=e139]: ▨
            - group [ref=e141]:
              - generic "Character Highlighting Color palette" [ref=e142] [cursor=pointer]: ▾
              - option "Standard" [selected]
              - option "LibreOffice"
              - option "HTML"
    - generic [ref=e143]:
      - generic [ref=e144]:
        - toolbar "Writer horizontal ruler" [ref=e145]:
          - generic [ref=e146]:
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
            - button "Left page margin" [ref=e149]
            - button "Right page margin" [ref=e150]
            - button "Paragraph left indent" [ref=e151]
            - button "First line indent" [ref=e152]
            - button "Paragraph right indent" [ref=e153]
        - generic "Writer vertical ruler lane" [ref=e154]:
          - toolbar "Writer vertical ruler" [ref=e157]:
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
            - button "Top page margin" [ref=e160]
            - button "Bottom page margin" [ref=e161]
        - region "Writer document canvas" [ref=e162]:
          - article "Writer document body" [active] [ref=e163]:
            - document "Page 1" [ref=e165]:
              - textbox "Writer document text" [ref=e168]
      - complementary "Writer properties sidebar" [ref=e169]:
        - generic:
          - generic [ref=e170]:
            - heading "Properties" [level=2] [ref=e171]
            - button "Close Sidebar Deck" [ref=e172]
          - region "Paragraph" [ref=e177]:
            - generic [ref=e178]:
              - heading [level=2] [ref=e179]:
                - button "Paragraph" [expanded] [ref=e180]
              - toolbar "Paragraph options" [ref=e183]:
                - button "More Options" [ref=e184]
            - generic [ref=e189]:
              - paragraph [ref=e190]: Paragraph 1 is active.
              - generic [ref=e191]:
                - paragraph [ref=e192]: Alignment
                - paragraph [ref=e193]: Left
                - generic [ref=e194]:
                  - button "Start" [pressed] [ref=e195]
                  - button "Center" [ref=e197]
                  - button "End" [ref=e199]
                  - button "Justified" [ref=e201]
                - paragraph [ref=e203]: Style
                - paragraph [ref=e204]: Default Paragraph Style
                - paragraph [ref=e205]: List
                - paragraph [ref=e206]: No List
                - generic [ref=e207]:
                  - button "No List" [pressed] [ref=e208]
                  - button "Unordered List" [ref=e212]
                  - button "Ordered List" [ref=e214]
        - toolbar "Sidebar deck selection" [ref=e218]:
          - button "Properties" [pressed] [ref=e219]
    - status "Writer status bar" [ref=e221]:
      - generic [ref=e222]: Saved locally in this browser.
```

# Test source

```ts
  1   | /** @fileoverview Checks actual Writer modal geometry, shared styling and reachable actions. */
  2   | import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";
  3   | 
  4   | // Chromium's headless default hides scrollbars, which would invalidate visual affordance evidence.
  5   | test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });
  6   | 
  7   | /** Opens an existing Writer command through its menu. @param page - Browser page. @param root - Root menu. @param command - Command label. @param submenu - Optional nested menu. @returns Completion. */
  8   | async function openCommand(
  9   |   page: Page,
  10  |   root: string,
  11  |   command: string,
  12  |   submenu?: string,
  13  | ): Promise<void> {
> 14  |   await page.getByRole("menuitem", { name: root, exact: true }).click();
      |                                                                 ^ Error: locator.click: Test timeout of 90000ms exceeded.
  15  |   if (submenu !== undefined)
  16  |     await page.getByRole("menuitem", { name: submenu, exact: true }).press("ArrowRight");
  17  |   await page.getByRole("menuitem", { name: command, exact: true }).click();
  18  | }
  19  | 
  20  | /** Reads the visual contract from the rendered panel and heading. @param panel - Modal panel. @returns Computed shared styles. */
  21  | async function surface(panel: Locator): Promise<unknown> {
  22  |   return panel.evaluate(
  23  |     /** Reads actual CSS after utility and global cascade. @param element - Modal panel. @returns Shared surface values. */ (
  24  |       element,
  25  |     ) => {
  26  |       const style = getComputedStyle(element);
  27  |       const title = getComputedStyle(element.querySelector("h2") as HTMLElement);
  28  |       return {
  29  |         radius: style.borderRadius,
  30  |         border: style.border,
  31  |         shadow: style.boxShadow,
  32  |         titleSize: title.fontSize,
  33  |         titleWeight: title.fontWeight,
  34  |       };
  35  |     },
  36  |   );
  37  | }
  38  | 
  39  | /** Asserts controls and text occupy distinct space and remain within the panel. @param page - Browser page. @param reference - Open-document computed styles. @param label - Evidence name. @param info - Screenshot destination. @returns Completion. */
  40  | async function inspect(
  41  |   page: Page,
  42  |   reference: unknown,
  43  |   label: string,
  44  |   info: TestInfo,
  45  | ): Promise<void> {
  46  |   const panel = page.locator("[data-writer-modal-panel],[data-office-modal-panel]");
  47  |   await expect(panel).toBeVisible();
  48  |   expect(await surface(panel)).toEqual(reference);
  49  |   const issues = await panel.evaluate(
  50  |     /** Measures actual controls and text, excluding intentionally crossing border-preview hit regions. @param element - Panel. @returns Geometry violations. */ (
  51  |       element,
  52  |     ) => {
  53  |       const bounds = element.getBoundingClientRect();
  54  |       const issues: string[] = [];
  55  |       /** Intersects a rectangle with scroll/clip ancestors so hidden content is not reported as overlapping fixed chrome. @param node - Rectangle owner. @param rect - Layout rectangle. @returns Visible rectangle or undefined. */
  56  |       function visibleRect(node: HTMLElement, rect: DOMRect): DOMRect | undefined {
  57  |         let { left, right, top, bottom } = rect;
  58  |         for (let parent = node.parentElement; parent; parent = parent.parentElement) {
  59  |           const style = getComputedStyle(parent);
  60  |           const clip = parent.getBoundingClientRect();
  61  |           if (/auto|scroll|hidden|clip/.test(style.overflowX)) {
  62  |             left = Math.max(left, clip.left);
  63  |             right = Math.min(right, clip.right);
  64  |           }
  65  |           if (/auto|scroll|hidden|clip/.test(style.overflowY)) {
  66  |             top = Math.max(top, clip.top);
  67  |             bottom = Math.min(bottom, clip.bottom);
  68  |           }
  69  |         }
  70  |         return right > left && bottom > top
  71  |           ? new DOMRect(left, top, right - left, bottom - top)
  72  |           : undefined;
  73  |       }
  74  |       if (
  75  |         bounds.left < 0 ||
  76  |         bounds.top < 0 ||
  77  |         bounds.right > innerWidth ||
  78  |         bounds.bottom > innerHeight
  79  |       )
  80  |         issues.push("panel outside viewport");
  81  |       if (element.scrollWidth > element.clientWidth + 1) issues.push("horizontal panel overflow");
  82  |       for (const region of element.querySelectorAll<HTMLElement>(
  83  |         ":is(.writer-dialog-content,.office-dialog-content),:is(.writer-dialog-scroll,.office-dialog-scroll)",
  84  |       )) {
  85  |         if (region.scrollWidth > region.clientWidth + 1) issues.push("horizontal body overflow");
  86  |       }
  87  |       const controls = [...element.querySelectorAll<HTMLElement>("input,select,button")].filter(
  88  |         /** Omits hidden controls and the intentionally intersecting border selector. @param control - Candidate control. @returns Whether measured. */ (
  89  |           control,
  90  |         ) =>
  91  |           control.getClientRects().length > 0 && !control.hasAttribute("data-writer-border-edge"),
  92  |       );
  93  |       const rects = controls.map(
  94  |         /** Reads one control rectangle. @param control - Control. @returns Rectangle. */ (
  95  |           control,
  96  |         ) => visibleRect(control, control.getBoundingClientRect()),
  97  |       );
  98  |       for (let i = 0; i < controls.length; i++) {
  99  |         const control = controls[i] as HTMLElement;
  100 |         const rect = rects[i];
  101 |         if (rect === undefined) continue;
  102 |         const name = control.getAttribute("aria-label") ?? control.textContent ?? control.tagName;
  103 |         if (rect.left < bounds.left + 1 || rect.right > bounds.right - 1)
  104 |           issues.push(`control outside panel: ${name}`);
  105 |         for (let j = i + 1; j < rects.length; j++) {
  106 |           const other = rects[j];
  107 |           if (other === undefined) continue;
  108 |           if (
  109 |             Math.min(rect.right, other.right) - Math.max(rect.left, other.left) > 1 &&
  110 |             Math.min(rect.bottom, other.bottom) - Math.max(rect.top, other.top) > 1
  111 |           )
  112 |             issues.push(`overlapping controls: ${name}`);
  113 |         }
  114 |       }
```