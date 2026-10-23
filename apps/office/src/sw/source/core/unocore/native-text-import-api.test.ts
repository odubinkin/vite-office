/** @fileoverview Independent pinned SwXText/SwXTextCursor import contract examples, exercising actual Writer nodes and items. */
import {
  BorderLine,
  cppu_detail_getUnoType_BorderLine as borderType,
} from "../../../../offapi/com/sun/star/table/BorderLine";
import { RES_BOX } from "../../../inc/hintids";
import type { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SwDocShell } from "../../uibase/app/docsh";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { cppu_detail_getUnoType as indexReplaceType } from "../../../../cppu/inc/com/sun/star/container/XIndexReplace";

import { UnknownPropertyException } from "../../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { WrappedTargetException } from "../../../../cppu/inc/com/sun/star/lang/WrappedTargetException";
import { SwXNumberingRules } from "./unosett";
import { SwXBookmark } from "./unobkm";
import { readNumberingProperty } from "./unosett-properties";
import { describe, expect, it } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { SwXStyle } from "./unostyle";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { stringAny } from "./unocrsrhelper";
import { SwXText } from "./unotext";
import { RuntimeException } from "../../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IllegalArgumentException } from "../../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { RES_CHRATR_WEIGHT } from "../../../inc/hintids";
import { FontWeight } from "../../../../tools/inc/fontenum";
/** Builds the real native sequence element with explicit Any type. @param name - Native property or element name. @param value - Declared native value. @returns The represented native operation result. */
function property(name: string, value: Any): PropertyValue {
  return new PropertyValue(unicode(name), -1, value, PropertyState.DIRECT_VALUE);
}
/** Reads through real Any extraction, not the browser projection. @param value - Declared native value. @returns The represented native operation result. */
function number(value: Any): number {
  const out: [number] = [0];
  expect(value.extract(out, "double")).toBe(true);
  return out[0];
}
/** Captures generated UNO exceptions, which are native values rather than JS Error subclasses. @param action - Original action input. @returns The represented native operation result. */
function failure(action: () => unknown): unknown {
  try {
    action();
    return undefined;
  } catch (value) {
    return value;
  }
}
describe("native Writer text import API" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
  it("appends typed portions, returns only inserted ranges and finishes the preceding paragraph" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
    const doc = createWriterDocument(),
      model = new SwXTextDocument(doc),
      body = model.getText();
    const a = body.appendTextPortion(unicode("A"), [
      property("CharWeight", new Any([150], "float")),
    ]);
    const b = body.appendTextPortion(unicode("B"), [
      property("CharWeight", new Any([100], "float")),
    ]);
    expect(text(a.getString())).toBe("A");
    expect(text(b.getString())).toBe("B");
    expect(number(a.getPropertyValue(unicode("CharWeight")))).toBe(150);
    expect(number(b.getPropertyValue(unicode("CharWeight")))).toBe(100);
    const paragraph = body.finishParagraph([
      property("ParaLeftMargin", new Any([2540], "sal_Int32")),
    ]);
    expect(text(paragraph.getString())).toBe("AB");
    expect(doc.paragraphs).toHaveLength(2);
    expect(present(doc.paragraphs[0]).GetParagraphTextLeftMargin()).toBe(1440);
    expect(present(doc.paragraphs[1]).GetParagraphTextLeftMargin()).toBe(0);
    body.appendTextPortion(unicode("C"), []);
    expect(text(body.getString())).toBe("AB\nC");
  });
  it("splits CR only and rejects prohibited control input before mutation" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
    const body = new SwXTextDocument(createWriterDocument()).getText();
    body.appendTextPortion(unicode("A\nB\rC"), []);
    expect(
      body.GetTextNodes().map(
        /** Processes one ordered native value at this boundary. @param n - Original n input. @returns The represented native operation result. */
        (n) => n.GetText(),
      ),
    ).toEqual(["A\nB", "C"]);
    body.appendTextPortion(unicode("bad\u0001text"), []);
    expect(text(body.getString())).toBe("A\nB\nC");
  });
  it("moves and expands across paragraph boundaries and clamps unsuccessful movement" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
    const body = new SwXTextDocument(createWriterDocument()).getText();
    body.appendTextPortion(unicode("AB\rCD"), []);
    const c = body.createTextCursor();
    expect(c.goRight(3, true)).toBe(true);
    expect(text(c.getString())).toBe("AB\n");
    c.collapseToEnd();
    expect(c.goRight(9, true)).toBe(false);
    expect(text(c.getString())).toBe("CD");
    c.gotoStart(false);
    expect(c.isCollapsed()).toBe(true);
    expect(c.goLeft(1, false)).toBe(false);
  });
  it("distinguishes nonabsorbing insertion and absorbing replacement" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
    const body = new SwXTextDocument(createWriterDocument()).getText();
    body.appendTextPortion(unicode("abcd"), []);
    const c = body.createTextCursor();
    c.goRight(1, false);
    c.goRight(2, true);
    body.insertString(c, unicode("X"), false);
    expect(text(body.getString())).toBe("aXbcd");
    expect(text(c.getString())).toBe("bc");
    body.insertString(c, unicode("Y"), true);
    expect(text(body.getString())).toBe("aXYd");
    expect(text(c.getString())).toBe("Y");
  });
  it("retains live endpoints through text insertion and rejects foreign or disposed text" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
    const body = new SwXTextDocument(createWriterDocument()).getText();
    body.appendTextPortion(unicode("AB"), []);
    const c = body.createTextCursor();
    c.gotoEnd(false);
    const foreign = new SwXTextDocument(createWriterDocument()).getText().getStart();
    expect(
      failure(
        /** Processes one ordered native value at this boundary. @returns The represented native operation result. */
        () => c.gotoRange(foreign, false),
      ),
    ).toBeInstanceOf(RuntimeException);
    body.insertString(body.getStart(), unicode("X"), false);
    expect(c.GetPaM().GetPoint().GetContentIndex()).toBe(3);
    body.dispose();
    expect(
      failure(
        /** Processes one ordered native value at this boundary. @returns The represented native operation result. */
        () => c.getString(),
      ),
    ).toBeInstanceOf(RuntimeException);
  });
  it("uses the same core API in a cell and rejects inserting a body range there" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
    const doc = createWriterDocument(),
      table = doc.GetNodes().MakeTableNode("T"),
      row = doc.GetNodes().AppendTableRow(table, 1),
      cell = new SwXText(doc, present(row.GetTabBoxes()[0]).GetStartNode());
    cell.appendTextPortion(unicode("Cell"), []);
    cell.finishParagraph([]);
    cell.appendTextPortion(unicode("Next"), []);
    expect(text(cell.getString())).toBe("Cell\nNext");
    const body = new SwXText(doc);
    expect(
      failure(
        /** Processes one ordered native value at this boundary. @returns The represented native operation result. */
        () => cell.insertString(body.getStart(), unicode("bad"), false),
      ),
    ).toBeInstanceOf(RuntimeException);
  });
  it("groups item members before applying cursor properties and wraps unknown names after known values", /** Executes this bounded native contract operation. @returns Native operation result. */ () => {
    const doc = createWriterDocument(),
      body = new SwXTextDocument(doc).getText();
    body.appendTextPortion(unicode("A"), []);
    const cursor = body.createTextCursor();
    cursor.gotoEnd(true);
    expect(
      failure(
        /** Executes this bounded native contract operation. @returns Native operation result. */ () =>
          cursor.setPropertyValues([unicode("ParaLeftMargin")], []),
      ),
    ).toBeInstanceOf(IllegalArgumentException);
    expect(
      failure(
        /** Executes this bounded native contract operation. @returns Native operation result. */ () =>
          cursor.setPropertyValues(
            [unicode("ParaLeftMargin"), unicode("ParaRightMargin"), unicode("Unknown")],
            [new Any([2540], "sal_Int32"), new Any([1270], "sal_Int32"), new Any()],
          ),
      ),
    ).toBeInstanceOf(WrappedTargetException);
    expect(present(doc.paragraphs[0]).GetParagraphTextLeftMargin()).toBe(1440);
    const right = cursor.getPropertyValue(unicode("ParaRightMargin")),
      out: [number] = [0];
    expect(right.extract(out, "sal_Int32")).toBe(true);
    expect(out[0]).toBe(1270);
  });
  it("restores the original paragraph style when an inserted portion rolls back", /** Verifies native undo of earlier style side effects. @returns Nothing. */ () => {
    const doc = createWriterDocument(),
      body = new SwXTextDocument(doc).getText(),
      node = present(doc.paragraphs[0]),
      original = node.GetTextFormatColl();
    doc.MakeTextFormatColl("Imported", original);
    expect(
      failure(
        /** Applies style before a rejected typed value. @returns Failure. */ () =>
          body.appendTextPortion(unicode("Bad"), [
            property("ParaStyleName", stringAny("Imported")),
            property("CharWeight", stringAny("bad")),
          ]),
      ),
    ).toBeInstanceOf(IllegalArgumentException);
    expect(node.GetTextFormatColl()).toBe(original);
    expect(text(body.getString())).toBe("");
  });
  it("publishes paragraph line counts as native signed bytes", /** Verifies the original sal_Int8 property transport. @returns Nothing. */ () => {
    const body = new SwXTextDocument(createWriterDocument()).getText(),
      cursor = body.createTextCursor(),
      name = unicode("ParaOrphans");
    expect(text(cursor.getPropertySetInfo().getPropertyByName(name).Type.getTypeName())).toBe(
      "byte",
    );
    cursor.setPropertyValue(unicode("CharUnderline"), new Any([1], "sal_Int16"));
    expect(number(cursor.getPropertyValue(unicode("CharUnderline")))).toBe(1);
    cursor.setPropertyValue(unicode("ParaKeepTogether"), new Any(true));
    const keep: [boolean] = [false];
    expect(cursor.getPropertyValue(unicode("ParaKeepTogether")).extract(keep, "bool")).toBe(true);
    expect(keep[0]).toBe(true);
    cursor.setPropertyValue(name, new Any([-1], "sal_Int8"));
    const result: [number] = [0];
    expect(cursor.getPropertyValue(name).extract(result, "sal_Int8")).toBe(true);
    expect(result[0]).toBe(-1);
  });
  it("propagates uncaught unknown portion properties after native insertion", /** Executes this bounded native contract operation. @returns Native operation result. */ () => {
    const doc = createWriterDocument(),
      body = new SwXTextDocument(doc).getText();
    expect(
      failure(
        /** Executes this bounded native contract operation. @returns Native operation result. */ () =>
          body.appendTextPortion(unicode("Kept"), [property("Unknown", new Any())]),
      ),
    ).toBeInstanceOf(UnknownPropertyException);
    expect(text(body.getString())).toBe("Kept");
  });
  it("rolls back invalid portion properties and paragraph properties" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
    const doc = createWriterDocument(),
      body = new SwXTextDocument(doc).getText();
    body.appendTextPortion(unicode("Before"), []);
    expect(
      failure(
        /** Processes one ordered native value at this boundary. @returns The represented native operation result. */
        () => body.appendTextPortion(unicode("Bad"), [property("CharWeight", stringAny("bad"))]),
      ),
    ).toBeInstanceOf(IllegalArgumentException);
    expect(text(body.getString())).toBe("Before");
    expect(
      failure(
        /** Processes one ordered native value at this boundary. @returns The represented native operation result. */
        () =>
          body.finishParagraph([
            property("ParaLeftMargin", new Any([2540], "sal_Int32")),
            property("Unknown", new Any()),
          ]),
      ),
    ).toBeInstanceOf(RuntimeException);
    expect(doc.paragraphs).toHaveLength(1);
    expect(present(doc.paragraphs[0]).GetParagraphTextLeftMargin()).toBe(0);
  });
  it("attaches paragraph and page style descriptors to actual document owners" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
    const doc = createWriterDocument(),
      model = new SwXTextDocument(doc),
      family = model.getStyleFamilies().getByName(unicode("ParagraphStyles")),
      style = model.createInstance(unicode("com.sun.star.style.ParagraphStyle")) as SwXStyle;
    style.setPropertyValue(unicode("CharWeight"), new Any([150], "float"));
    family.insertByName(unicode("Imported"), style);
    const core = present(doc.FindTextFormatCollByName("Imported"));
    expect((core.GetAttrSet().Get(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(
      FontWeight.WEIGHT_BOLD,
    );
    const body = model.getText();
    body.finishParagraph([property("ParaStyleName", stringAny("Imported"))]);
    expect(present(doc.paragraphs[0]).GetTextFormatColl()).toBe(core);
    const page = model.createInstance(unicode("com.sun.star.style.PageStyle")) as SwXStyle;
    page.setPropertyValue(unicode("Width"), new Any([21590], "sal_Int32"));
    model
      .getStyleFamilies()
      .getByName(unicode("PageStyles"))
      .insertByName(unicode("Imported Page"), page);
    expect(present(doc.FindPageDesc("Imported Page")).GetValue().width).toBe(12240);
  });
  it("supports finish insertion after the referenced paragraph without splitting its text" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
    const doc = createWriterDocument(),
      body = new SwXTextDocument(doc).getText();
    body.appendTextPortion(unicode("AB\rCD"), []);
    const c = body.createTextCursor();
    c.goRight(1, false);
    const done = body.finishParagraphInsert([], c);
    expect(text(done.getString())).toBe("AB");
    expect(
      body.GetTextNodes().map(
        /** Processes one ordered native value at this boundary. @param n - Original n input. @returns The represented native operation result. */
        (n) => n.GetText(),
      ),
    ).toEqual(["AB", "", "CD"]);
  });
});

it("transports real typed numbering property sequences and preserves failed replacements" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
  const model = new SwXTextDocument(createWriterDocument()),
    rules = model.createInstance(unicode("com.sun.star.text.NumberingRules"));
  if (!(rules instanceof SwXNumberingRules)) throw new Error("Expected numbering service");
  expect(rules.getCount()).toBe(10);
  expect(rules.hasElements()).toBe(true);
  const value = rules.getByIndex(0);
  rules.replaceByIndex(1, value);
  value.dispose();
  const seq = rules.getRuleByIndex(1);
  expect(seq.getLength()).toBeGreaterThan(3);
  let type: PropertyValue | undefined;
  for (let i = 0; i < seq.getLength(); i++) {
    const p = readNumberingProperty(seq, i);
    if (text(p.Name) === "NumberingType") type = p;
  }
  expect(type).toBeDefined();
  expect(number(present(type).Value)).toBe(rules.GetNumRule().Get(0).GetNumberingType());
  seq.dispose();
  const previous = rules.GetNumRule().Get(1);
  expect(
    failure(
      /** Processes one ordered native value at this boundary. @returns The represented native operation result. */
      () => rules.replaceByIndex(1, new Any(true)),
    ),
  ).toBeInstanceOf(IllegalArgumentException);
  expect(rules.GetNumRule().Get(1)).toBe(previous);
});

it("converts imported body paragraphs into cells without copying nodes or registered positions" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
  const doc = createWriterDocument(),
    body = new SwXTextDocument(doc).getText();
  const first = body.appendTextPortion(unicode("First"), []);
  body.finishParagraph([]);
  const second = body.appendTextPortion(unicode("Second"), []);
  body.finishParagraph([]);
  const original = first.GetPaM().Start().GetNode(),
    table = present(
      body.convertToTable(
        [
          [
            [first.getStart(), first.getEnd()],
            [second.getStart(), second.getEnd()],
          ],
        ],
        [],
        [],
        [],
      ),
    );
  expect(present(table.table.GetTabLines()[0]).GetTabBoxes()).toHaveLength(2);
  expect(
    present(present(table.table.GetTabLines()[0]).GetTabBoxes()[0]).GetStartNode().GetIndex() + 1,
  ).toBe(original.GetIndex());
  expect(text(table.getCellByName(unicode("A1")).getString())).toBe("First");
  expect(text(table.getCellByName(unicode("B1")).getString())).toBe("Second");
  expect(doc.GetNodes().entries()).toContain(original);
});

it("retains explicit normal character items across later paragraph style changes" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
  const doc = createWriterDocument(),
    body = new SwXTextDocument(doc).getText();
  body.appendTextPortion(unicode("A"), [property("CharWeight", new Any([100], "float"))]);
  doc
    .GetDfltTextFormatColl()
    .SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
  const c = body.createTextCursor();
  c.goRight(1, true);
  expect(number(c.getPropertyValue(unicode("CharWeight")))).toBe(100);
});

it("applies native NumberingRules interface properties to real document lists and named styles" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
  const doc = createWriterDocument(),
    model = new SwXTextDocument(doc),
    rules = model.createInstance(unicode("com.sun.star.text.NumberingRules"));
  if (!(rules instanceof SwXNumberingRules)) throw new Error("Expected numbering service");
  const value = new Any([rules], ["Reference", indexReplaceType]);
  const family = model.getStyleFamilies().getByName(unicode("NumberingStyles")),
    style = model.createInstance(unicode("com.sun.star.style.NumberingStyle")) as SwXStyle;
  style.setPropertyValue(unicode("NumberingRules"), value);
  family.insertByName(unicode("Imported numbering"), style);
  model.getText().appendTextPortion(unicode("Item"), []);
  const done = model
    .getText()
    .finishParagraph([
      property("NumberingRules", value),
      property("NumberingLevel", new Any([2], "sal_Int16")),
    ]);
  expect(present(doc.paragraphs[0]).GetNumRule()).toBe(rules.GetNumRule());
  expect(present(doc.paragraphs[0]).GetAttrListLevel()).toBe(2);
  expect(doc.FindNumRulePtr("Imported numbering")).toBeDefined();
  expect(done.getPropertyValue(unicode("NumberingRules")).hasValue()).toBe(true);
  value.dispose();
});

it("reports mixed character values as native void and retains independent composite properties" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
  const body = new SwXTextDocument(createWriterDocument()).getText();
  body.appendTextPortion(unicode("A"), [property("CharWeight", new Any([150], "float"))]);
  body.appendTextPortion(unicode("B"), [property("CharWeight", new Any([100], "float"))]);
  const c = body.createTextCursor();
  c.gotoEnd(true);
  expect(c.getPropertyValue(unicode("CharWeight")).hasValue()).toBe(false);
  body.finishParagraph([
    property("ParaTopMargin", new Any([2540], "sal_Int32")),
    property("ParaBottomMargin", new Any([1270], "sal_Int32")),
  ]);
  c.gotoStart(false);
  expect(number(c.getPropertyValue(unicode("ParaTopMargin")))).toBe(2540);
  expect(number(c.getPropertyValue(unicode("ParaBottomMargin")))).toBe(1270);
});

it("keeps the shell model stable and invalidates old API ranges on document replacement" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
  const doc = createWriterDocument(),
    shell = new SwDocShell(doc, createDocument({ id: "api", suiteId: "writer", title: "API" }));
  const model = shell.GetModel(),
    range = model.getText().getStart();
  expect(shell.GetModel()).toBe(model);
  shell.ReplaceDocument(
    createWriterDocument(),
    createDocument({ id: "next", suiteId: "writer", title: "Next" }),
    { kind: "untitled", name: "Next" },
  );
  expect(shell.GetModel()).not.toBe(model);
  expect(
    failure(
      /** Processes one ordered native value at this boundary. @returns The represented native operation result. */
      () => range.getString(),
    ),
  ).toBeInstanceOf(RuntimeException);
  shell.Close();
});

it("attaches collapsed bookmark descriptors through the canonical mark manager" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
  const doc = createWriterDocument(),
    model = new SwXTextDocument(doc),
    body = model.getText(),
    bookmark = model.createInstance(unicode("com.sun.star.text.Bookmark")) as SwXBookmark;
  body.appendTextPortion(unicode("AB"), []);
  const cursor = body.createTextCursor();
  cursor.goRight(1, false);
  bookmark.setName(unicode("ImportedBookmark"));
  body.insertTextContent(cursor, bookmark, true);
  expect(
    present(doc.GetIDocumentMarkAccess().FindMark("ImportedBookmark"))
      .GetMarkPos()
      .GetContentIndex(),
  ).toBe(1);
  body.insertString(body.getStart(), unicode("X"), false);
  expect(bookmark.getAnchor().GetPaM().GetPoint().GetContentIndex()).toBe(2);
  bookmark.dispose();
  expect(doc.GetIDocumentMarkAccess().FindMark("ImportedBookmark")).toBeUndefined();
});

it("splits partial paragraph cell ranges through canonical nodes and rejects gaps before mutation" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
  const doc = createWriterDocument(),
    body = new SwXTextDocument(doc).getText();
  body.appendTextPortion(unicode("ABCD"), []);
  const first = body.createTextCursor();
  first.goRight(2, true);
  const second = body.createTextCursor();
  second.goRight(2, false);
  second.goRight(2, true);
  const result = present(
    body.convertToTable(
      [
        [
          [first.getStart(), first.getEnd()],
          [second.getStart(), second.getEnd()],
        ],
      ],
      [],
      [],
      [],
    ),
  );
  expect(text(result.getCellByName(unicode("A1")).getString())).toBe("AB");
  expect(text(result.getCellByName(unicode("B1")).getString())).toBe("CD");
  const other = new SwXTextDocument(createWriterDocument()).getText();
  other.appendTextPortion(unicode("XYZ"), []);
  const a = other.createTextCursor(),
    b = other.createTextCursor();
  a.goRight(1, true);
  b.goRight(2, false);
  b.goRight(1, true);
  expect(
    failure(
      /** Processes one ordered native value at this boundary. @returns The represented native operation result. */
      () =>
        other.convertToTable(
          [
            [
              [a.getStart(), a.getEnd()],
              [b.getStart(), b.getEnd()],
            ],
          ],
          [],
          [],
          [],
        ),
    ),
  ).toBeInstanceOf(IllegalArgumentException);
  expect(text(other.getString())).toBe("XYZ");
});

it("restores the original style and hints after a rejected paragraph property batch" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
  const doc = createWriterDocument(),
    model = new SwXTextDocument(doc),
    body = model.getText(),
    style = model.createInstance(unicode("com.sun.star.style.ParagraphStyle")) as SwXStyle;
  model
    .getStyleFamilies()
    .getByName(unicode("ParagraphStyles"))
    .insertByName(unicode("Changed"), style);
  body.appendTextPortion(unicode("A"), []);
  const original = present(doc.paragraphs[0]).GetTextFormatColl();
  expect(
    failure(
      /** Processes one ordered native value at this boundary. @returns The represented native operation result. */
      () =>
        body.finishParagraph([
          property("ParaStyleName", stringAny("Changed")),
          property("CharWeight", new Any([150], "float")),
          property("Missing", new Any()),
        ]),
    ),
  ).toBeInstanceOf(RuntimeException);
  expect(doc.paragraphs).toHaveLength(1);
  expect(present(doc.paragraphs[0]).GetTextFormatColl()).toBe(original);
  expect(number(body.getStart().getPropertyValue(unicode("CharWeight")))).toBe(100);
});

it("applies hyperlink property members in one batch without losing sibling metadata" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
  const doc = createWriterDocument(),
    body = new SwXTextDocument(doc).getText();
  const range = body.appendTextPortion(unicode("Link"), [
    property("HyperLinkName", stringAny("Target")),
    property("HyperLinkTarget", stringAny("_blank")),
    property("HyperLinkURL", stringAny("https://example.test/")),
  ]);
  expect(present(doc.paragraphs[0]).getHyperlinkAt(1)).toMatchObject({
    name: "Target",
    targetFrame: "_blank",
    url: "https://example.test/",
  });
  const value = range.getPropertyValue(unicode("HyperLinkURL")),
    out = unicode("");
  expect(value.extract(out, "OUString")).toBe(true);
  expect(text(out)).toBe("https://example.test/");
});

it("converts row geometry and cell border properties through native item units" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
  const doc = createWriterDocument(),
    body = new SwXTextDocument(doc).getText(),
    r = body.appendTextPortion(unicode("Cell"), []);
  body.finishParagraph([]);
  const line = new BorderLine();
  line.Color = 0x112233;
  line.OuterLineWidth = 127;
  const result = present(
    body.convertToTable(
      [[[r.getStart(), r.getEnd()]]],
      [
        [
          [
            property("LeftBorder", new Any(line, borderType)),
            property("LeftBorderDistance", new Any([254], "sal_Int32")),
          ],
        ],
      ],
      [
        [
          property("Height", new Any([2540], "sal_Int32")),
          property("IsAutoHeight", new Any(false)),
          property("IsSplitAllowed", new Any(false)),
        ],
      ],
      [],
    ),
  );
  const row = result.getRows().getByIndex(0);
  expect(number(row.getPropertyValue(unicode("Height")))).toBe(2540);
  const value: [boolean] = [true];
  expect(row.getPropertyValue(unicode("IsSplitAllowed")).extract(value, "bool")).toBe(true);
  expect(value[0]).toBe(false);
  const box = present(present(result.table.GetTabLines()[0]).GetTabBoxes()[0]);
  expect((box.GetFrameFormat().GetAttrSet().Get(RES_BOX) as SvxBoxItem).GetDistance(2)).toBe(144);
});

it("exposes native style property descriptors and resets direct values without flattening inheritance" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
  const doc = createWriterDocument(),
    model = new SwXTextDocument(doc),
    family = model.getStyleFamilies().getByName(unicode("ParagraphStyles")),
    style = family.getByName(unicode("Standard")),
    name = unicode("CharWeight");
  const info = style.getPropertySetInfo();
  expect(info.hasPropertyByName(name)).toBe(true);
  expect(info.hasPropertyByName(unicode("InventedProperty"))).toBe(false);
  const descriptor = info.getPropertyByName(name);
  expect(text(descriptor.Type.getTypeName())).toBe("float");
  expect(descriptor.Attributes).toBe(1);
  expect(
    info.getProperties().some(
      /** Processes one ordered native value at this boundary. @param p - Original p input. @returns The represented native operation result. */
      (p) => text(p.Name) === "ParaTabStops",
    ),
  ).toBe(true);
  style.setPropertyValue(name, new Any([150], "float"));
  expect(style.getPropertyStates([name])[0]).toBe(PropertyState.DIRECT_VALUE);
  style.setPropertyToDefault(name);
  expect(style.getPropertyStates([name])[0]).toBe(PropertyState.DEFAULT_VALUE);
  expect(number(style.getPropertyValue(name))).toBe(100);
  expect(
    model.getText().getStart().getPropertySetInfo().hasPropertyByName(unicode("NumberingRules")),
  ).toBe(true);
});

it("resets only selected direct character properties and retains formatting outside the range" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
  const doc = createWriterDocument(),
    body = new SwXTextDocument(doc).getText();
  body.appendTextPortion(unicode("ABC"), [property("CharWeight", new Any([150], "float"))]);
  const cursor = body.createTextCursor();
  cursor.goRight(1, false);
  cursor.goRight(1, true);
  expect(cursor.getPropertyState(unicode("CharWeight"))).toBe(PropertyState.DIRECT_VALUE);
  cursor.setPropertyToDefault(unicode("CharWeight"));
  expect(number(cursor.getPropertyValue(unicode("CharWeight")))).toBe(100);
  cursor.gotoStart(false);
  cursor.goRight(1, true);
  expect(number(cursor.getPropertyValue(unicode("CharWeight")))).toBe(150);
});

it("keeps UNO range marks out of user bookmarks and invalidates them on core document disposal" /** Processes one ordered native value at this boundary. @returns The represented native operation result. */, () => {
  const doc = createWriterDocument(),
    body = new SwXTextDocument(doc).getText(),
    range = body.appendTextPortion(unicode("Range"), []);
  expect(doc.GetIDocumentMarkAccess().GetBookmarkNames()).toEqual([]);
  doc.Dispose();
  expect(
    failure(
      /** Processes one ordered native value at this boundary. @returns The represented native operation result. */
      () => range.getString(),
    ),
  ).toBeInstanceOf(RuntimeException);
  range.dispose();
});

/** Requires a fixture value before exercising its native contract. @param value - Fixture lookup. @returns The existing fixture value. */
function present<T>(value: T | null | undefined): T {
  if (value == null) throw new Error("Missing test fixture");
  return value;
}

it("keeps table import progressing past rejected properties while honoring native denylists", /** Uses native property failure isolation and final table state. @returns Nothing. */ () => {
  const doc = createWriterDocument(),
    body = new SwXTextDocument(doc).getText(),
    range = body.appendTextPortion(unicode("Cell"), []);
  const table = present(
    body.convertToTable(
      [[[range.getStart(), range.getEnd()]]],
      [[[property("Unknown", new Any()), property("LeftMargin", new Any([2540], "sal_Int32"))]]],
      [[], []],
      [
        property("Unknown", new Any()),
        property("ParaTopBorder", new Any()),
        property("Width", new Any([2540], "sal_Int32")),
      ],
    ),
  );
  expect(table.table.GetFormat().width).toBe(1440);
  expect(text(table.getCellByName(unicode("A1")).getString())).toBe("Cell");
  expect(
    number(
      table
        .getCellByName(unicode("A1"))
        .createTextCursor()
        .getPropertyValue(unicode("ParaLeftMargin")),
    ),
  ).toBe(0);
});
