# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-bullet-font-roundtrip.spec.ts >> native bullet font ODT body cell width=390
- Location: apps/office/e2e/native-bullet-font-roundtrip.spec.ts:29:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('p[data-writer-node-index]').filter({ hasText: 'Body bullet font' }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('p[data-writer-node-index]').filter({ hasText: 'Body bullet font' }).first()

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
      - menuitem "Format"
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
      - combobox "Paragraph style" [disabled]:
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
  - dialog "Open":
    - heading "Open document" [level=2]
    - paragraph: Choose a saved document or import a file.
    - button "Close"
    - tablist "Document source":
      - tab "In browser"
      - tab "On computer" [selected]
    - tabpanel "On computer":
      - paragraph: Drop a file here
      - paragraph: ODT and TXT files are supported
      - text: Browse
      - button "Browse"
    - alert: ODT worker failed.
```

# Test source

```ts
  1   | /** @fileoverview Checks real custom bullet-face ODT persistence, Chromium fonts and body/cell glyph separation. */
  2   | import { FontItalic, FontWeight } from "../src/tools/inc/fontenum";
  3   | import { expect, test } from "@playwright/test";
  4   | import { SwDoc } from "../src/sw/source/core/doc/doc";
  5   | import { applyWriterParagraphList } from "../src/sw/source/core/doc/list";
  6   | import { createWriterNumFormat } from "../src/sw/source/core/doc/number";
  7   | import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
  8   | import {
  9   |   SvxFontItem,
  10  |   SvxFontHeightItem,
  11  |   SvxPostureItem,
  12  |   SvxWeightItem,
  13  | } from "../src/editeng/source/items/textitem";
  14  | import {
  15  |   RES_CHRATR_FONT,
  16  |   RES_CHRATR_FONTSIZE,
  17  |   RES_CHRATR_POSTURE,
  18  |   RES_CHRATR_WEIGHT,
  19  |   RES_CHRATR_CJK_FONT,
  20  |   RES_CHRATR_CJK_FONTSIZE,
  21  |   RES_CHRATR_CJK_POSTURE,
  22  |   RES_CHRATR_CJK_WEIGHT,
  23  |   RES_CHRATR_CTL_FONT,
  24  |   RES_CHRATR_CTL_FONTSIZE,
  25  |   RES_CHRATR_CTL_POSTURE,
  26  |   RES_CHRATR_CTL_WEIGHT,
  27  | } from "../src/sw/inc/hintids";
  28  | for (const width of [1280, 390])
  29  |   test(`native bullet font ODT body cell width=${width}`, /** Checks imported actual rule/paragraph owners, marker style, real font loading, glyph gap and subsequent typing/history. @param fixtures - Browser fixtures. @param fixtures.page - Production browser. @returns Completion. */ async ({
  30  |     page,
  31  |   }) => {
  32  |     const doc = new SwDoc(),
  33  |       body = doc.paragraphs[0];
  34  |     if (body === undefined) throw Error("Missing body");
  35  |     const table = doc.GetNodes().MakeTableNode("Number font");
  36  |     table.AddColumnWidth(6000);
  37  |     for (const cell of [false, true])
  38  |       for (const [index, kind] of ["bullet", "numbered"].entries()) {
  39  |         const node = cell
  40  |           ? doc.GetNodes().AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0]
  41  |           : index === 0
  42  |             ? body
  43  |             : doc.GetNodes().MakeTextNode();
  44  |         if (node === undefined || (kind !== "bullet" && kind !== "numbered"))
  45  |           throw Error("Missing node");
  46  |         node.SetText(`${cell ? "Cell" : "Body"} ${kind} font`);
  47  |         for (const [family, height, weight, posture] of [
  48  |           [RES_CHRATR_FONT, RES_CHRATR_FONTSIZE, RES_CHRATR_WEIGHT, RES_CHRATR_POSTURE],
  49  |           [
  50  |             RES_CHRATR_CJK_FONT,
  51  |             RES_CHRATR_CJK_FONTSIZE,
  52  |             RES_CHRATR_CJK_WEIGHT,
  53  |             RES_CHRATR_CJK_POSTURE,
  54  |           ],
  55  |           [
  56  |             RES_CHRATR_CTL_FONT,
  57  |             RES_CHRATR_CTL_FONTSIZE,
  58  |             RES_CHRATR_CTL_WEIGHT,
  59  |             RES_CHRATR_CTL_POSTURE,
  60  |           ],
  61  |         ] as const) {
  62  |           node.SetAttr(new SvxFontItem(0, "Liberation Serif", "", 0, 0, family));
  63  |           node.SetAttr(new SvxFontHeightItem(480, 100, height));
  64  |           node.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, weight));
  65  |           node.SetAttr(new SvxPostureItem(FontItalic.ITALIC_NORMAL, posture));
  66  |         }
  67  |         applyWriterParagraphList(node, {
  68  |           kind,
  69  |           level: 0,
  70  |           ruleName: `${cell ? "Cell" : "Body"}${kind}`,
  71  |         });
  72  |         const rule = node.GetNumRule();
  73  |         if (rule === undefined) throw Error("Missing rule");
  74  |         rule.Set(
  75  |           0,
  76  |           createWriterNumFormat(kind, "•", {
  77  |             bulletFont: "Liberation Mono",
  78  |             firstLineIndent: 0,
  79  |             indentAt: 720,
  80  |             listTabPosition: 720,
  81  |             positionAndSpaceMode: "label-alignment",
  82  |           }),
  83  |         );
  84  |       }
  85  |     const bytes = writeOdtDocument(doc, { title: "Number font" });
  86  |     doc.Dispose();
  87  |     await page.setViewportSize({ width, height: 900 });
  88  |     await page.goto("/writer");
  89  |     await page.getByRole("button", { name: "Open", exact: true }).click();
  90  |     await page.getByRole("tab", { name: "On computer" }).click();
  91  |     await page.getByLabel("Browse").setInputFiles({
  92  |       buffer: Buffer.from(bytes),
  93  |       mimeType: "application/vnd.oasis.opendocument.text",
  94  |       name: "number-font.odt",
  95  |     });
  96  |     await expect(
  97  |       page.locator("p[data-writer-node-index]").filter({ hasText: "Body bullet font" }).first(),
> 98  |     ).toBeVisible();
      |       ^ Error: expect(locator).toBeVisible() failed
  99  |     const loaded = await page.evaluate(
  100 |       /** Loads and checks actual requested device faces after import, rather than relying on an earlier font readiness promise. @returns Font readiness evidence. */ async () => {
  101 |         const markerFaces = await document.fonts.load('400 24pt "Liberation Mono"');
  102 |         const textFaces = await document.fonts.load('italic 700 24pt "Liberation Serif"');
  103 |         await document.fonts.ready;
  104 |         return {
  105 |           markerFaces: markerFaces.length,
  106 |           textFaces: textFaces.length,
  107 |           markerReady: document.fonts.check('400 24pt "Liberation Mono"'),
  108 |           textReady: document.fonts.check('italic 700 24pt "Liberation Serif"'),
  109 |         };
  110 |       },
  111 |     );
  112 |     expect(loaded.markerFaces).toBeGreaterThan(0);
  113 |     expect(loaded.textFaces).toBeGreaterThan(0);
  114 |     expect(loaded.markerReady && loaded.textReady).toBe(true);
  115 |     for (const scope of ["Body", "Cell"])
  116 |       for (const kind of ["bullet", "numbered"]) {
  117 |         const text = `${scope} ${kind} font`,
  118 |           paragraph = page.locator("p[data-writer-node-index]").filter({ hasText: text }).first(),
  119 |           marker = paragraph.locator("..").locator("[data-writer-list-marker]");
  120 |         await expect(marker).toHaveCSS(
  121 |           "font-family",
  122 |           kind === "bullet" ? /^"?Liberation Mono"?(,|$)/ : /^"?Liberation Serif"?(,|$)/,
  123 |         );
  124 |         await expect(marker).toHaveCSS("font-weight", kind === "bullet" ? "400" : "700");
  125 |         await expect(marker).toHaveCSS("font-style", kind === "bullet" ? "normal" : "italic");
  126 |         await expect(paragraph).toHaveCSS("font-weight", "700");
  127 |         await expect(paragraph).toHaveCSS("font-style", "italic");
  128 |         const gap = await paragraph.evaluate(
  129 |           /** Measures actual first glyph separation from the number glyph. @param element - Native text host. @returns Gap. */ (
  130 |             element,
  131 |           ) => {
  132 |             const label = element.parentElement?.querySelector("[data-writer-list-marker]"),
  133 |               textNode = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
  134 |             if (label == null || textNode === null) throw Error("Missing glyph owners");
  135 |             const markerRange = document.createRange(),
  136 |               textRange = document.createRange();
  137 |             markerRange.selectNodeContents(label);
  138 |             textRange.setStart(textNode, 0);
  139 |             textRange.setEnd(textNode, 1);
  140 |             return (
  141 |               textRange.getBoundingClientRect().left - markerRange.getBoundingClientRect().right
  142 |             );
  143 |           },
  144 |         );
  145 |         expect(gap).toBeGreaterThanOrEqual(-0.1);
  146 |         await paragraph.focus();
  147 |         await paragraph.evaluate(
  148 |           /** Places the browser caret inside actual text before native Home transitions. @param element - Text host. @returns Nothing. */ (
  149 |             element,
  150 |           ) => {
  151 |             const node = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
  152 |             if (node === null) throw Error("Missing text");
  153 |             window.getSelection()?.setBaseAndExtent(node, 2, node, 2);
  154 |             document.dispatchEvent(new Event("selectionchange"));
  155 |           },
  156 |         );
  157 |         await page.keyboard.press("Home");
  158 |         await page.keyboard.press("Home");
  159 |         await expect(marker.locator("[data-writer-label-caret]")).toBeVisible();
  160 |         await expect(marker).toHaveCSS("background-color", "rgb(192, 192, 192)");
  161 |         await page.keyboard.type("X");
  162 |         await expect(paragraph).toHaveText("X" + text);
  163 |         await expect(marker).toHaveCSS("font-weight", kind === "bullet" ? "400" : "700");
  164 |         await page.getByRole("button", { name: "Undo", exact: true }).click();
  165 |         await expect(paragraph).toHaveText(text);
  166 |         await page.getByRole("button", { name: "Redo", exact: true }).click();
  167 |         await expect(paragraph).toHaveText("X" + text);
  168 |       }
  169 |   });
  170 | 
```