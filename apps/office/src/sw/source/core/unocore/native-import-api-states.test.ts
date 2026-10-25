/** @fileoverview Native cursor selection, property-state and bookmark lifetime contracts across the merged import API. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { SwXBookmark } from "./unobkm";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import { UnknownPropertyException } from "../../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { IllegalArgumentException } from "../../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { RuntimeException } from "../../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { unicode, text } from "./unocrsrhelper";
import { stringValue } from "./unocrsrhelper";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { NoSuchElementException } from "../../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { IndexOutOfBoundsException } from "../../../../cppu/inc/com/sun/star/lang/IndexOutOfBoundsException";
import { SwPaM } from "../crsr/pam";
import { SwXTextTable } from "./unotbl";
import { RES_BOX } from "../../../inc/hintids";
import { SvxBoxItemLine, type SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { cppu_detail_getUnoType_BreakType } from "../../../../offapi/com/sun/star/style/BreakType";
import { type UnoTypeArgument } from "../../../../cppu/inc/unotype";
import { stringAny } from "./unocrsrhelper";
import { SwXNumberingRules } from "./unosett";
import { UnoType } from "../../../../cppu/inc/unotype";
import { Type } from "../../../../cppu/inc/com/sun/star/uno/Type";

/** Creates actual document, text and cursor owners with two literal paragraphs. @returns Owned fixture. */
function fixture() {
  const document = new SwDoc();
  const model = new SwXTextDocument(document);
  const body = model.getText();
  const value = unicode("AB\rCD");
  body.setString(value);
  value.dispose();
  return { document, model, body, cursor: body.createTextCursor() };
}
/** Releases the actual host API positions and document. @param f - Owned fixture. @returns Nothing. */
function close(f: ReturnType<typeof fixture>): void {
  f.cursor.dispose();
  f.model.dispose();
  f.document.Dispose();
}
/** Extracts an independently expected numeric property and releases its Any. @param value - Owned result. @returns Numeric value. */
function number(value: Any): number {
  const result: [number] = [0];
  try {
    expect(value.extract(result, "double")).toBe(true);
    return result[0];
  } finally {
    value.dispose();
  }
}
/** Captures generated UNO value exceptions, which do not inherit JavaScript Error. @param operation - API call. @returns Thrown native value or the unexpected successful result. */
function failure(operation: () => unknown): unknown {
  try {
    return operation();
  } catch (error) {
    return error;
  }
}

it("moves paragraph boundaries, collapses either endpoint and clamps backward movement across paragraphs", /** Exercises the actual XParagraphCursor and live range semantics. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const c = f.cursor;
    expect(c.GetCursor()).toBe(c.GetPaM());
    expect(c.isStartOfParagraph()).toBe(true);
    expect(c.isEndOfParagraph()).toBe(false);
    expect(c.gotoEndOfParagraph(true)).toBe(true);
    expect(text(c.getString())).toBe("AB");
    expect(c.isEndOfParagraph()).toBe(true);
    c.collapseToStart();
    expect(c.isCollapsed()).toBe(true);
    c.gotoEnd(false);
    expect(c.goLeft(3, true)).toBe(true);
    expect(text(c.getString())).toBe("\nCD");
    c.collapseToEnd();
    expect(c.gotoStartOfParagraph(true)).toBe(true);
    expect(text(c.getString())).toBe("CD");
    c.collapseToStart();
    expect(c.goLeft(99, true)).toBe(false);
    expect(text(c.getString())).toBe("AB\n");
    c.gotoStart(false);
    expect(c.isStartOfParagraph()).toBe(true);
    expect(c.isCollapsed()).toBe(true);
  } finally {
    close(f);
  }
});

it("interns valid automatic-style properties while independently rejecting unsupported names and malformed members", /** Exercises the native character family rather than constructing a parallel style record. @returns Nothing. */ () => {
  const f = fixture();
  const familyName = unicode("CharacterStyles");
  const weight = unicode("CharWeight");
  const height = unicode("CharHeight");
  const unknown = unicode("MissingProperty");
  const paragraph = unicode("ParaLeftMargin");
  const identity = unicode("CharAutoStyleName");
  const bold = new Any([150], "float");
  const bad = new Any([true], "bool");
  const properties = [
    new PropertyValue(unknown, -1, bad, PropertyState.DIRECT_VALUE),
    new PropertyValue(paragraph, -1, bad, PropertyState.DIRECT_VALUE),
    new PropertyValue(height, -1, bad, PropertyState.DIRECT_VALUE),
    new PropertyValue(weight, -1, bold, PropertyState.DIRECT_VALUE),
  ];
  try {
    const family = f.model.getAutoStyles().getByName(familyName);
    const style = family.insertStyle(properties);
    expect(number(style.getPropertyValue(weight))).toBe(150);
    expect(number(style.getPropertyValue(height))).toBe(
      number(f.cursor.getPropertyDefault(height)),
    );
    const name = style.getPropertyValue(identity);
    expect(stringValue(name)).not.toBe("");
    name.dispose();
    expect(
      failure(
        /** Rejects an unknown family. @returns Family. */ () =>
          f.model.getAutoStyles().getByName(unknown),
      ),
    ).toBeInstanceOf(NoSuchElementException);
    expect(
      failure(
        /** Rejects an unknown automatic property. @returns Value. */ () =>
          style.getPropertyValue(unknown),
      ),
    ).toBeInstanceOf(UnknownPropertyException);
    expect(
      failure(
        /** Character automatic styles cannot expose paragraph properties. @returns Value. */ () =>
          style.getPropertyValue(paragraph),
      ),
    ).toBeInstanceOf(UnknownPropertyException);
  } finally {
    for (const property of properties) {
      property.Name.dispose();
      property.Value.dispose();
    }
    for (const key of [familyName, weight, height, unknown, paragraph, identity]) key.dispose();
    bold.dispose();
    bad.dispose();
    close(f);
  }
});

it("copies live range positions, batches typed properties and releases invalidated marks independently of the text owner", /** Covers actual XTextRange ownership and native Any results. @returns Nothing. */ () => {
  const f = fixture();
  const start = f.body.getStart();
  const end = f.body.getEnd();
  const position = new SwPaM(f.cursor.GetPaM().GetPoint());
  const weight = unicode("CharWeight");
  const bold = new Any([150], "float");
  try {
    expect(end.GetPositions(position)).toBe(true);
    expect(position.GetPoint().GetNode()).toBe(f.document.paragraphs[1]);
    expect(position.GetPoint().GetContentIndex()).toBe(2);
    end.SetPositions(start.GetPaM());
    expect(end.GetPaM().GetPoint().GetNode()).toBe(f.document.paragraphs[0]);
    end.setPropertyValues([weight], [bold]);
    const values = end.getPropertyValues([weight]);
    expect(values).toHaveLength(1);
    expect(number(values[0] as Any)).toBe(150);
    expect(
      failure(
        /** Mismatched native range properties must fail before mutation. @returns Nothing. */ () =>
          end.setPropertyValues([weight], []),
      ),
    ).toBeInstanceOf(IllegalArgumentException);
    end.dispose();
    end.dispose();
    expect(
      failure(
        /** Released range positions are no longer observable. @returns Range. */ () =>
          end.GetPaM(),
      ),
    ).toBeInstanceOf(RuntimeException);
    f.body.dispose();
    expect(
      failure(
        /** A disposed parent text invalidates its borrowed ranges. @returns Text. */ () =>
          start.getText(),
      ),
    ).toBeInstanceOf(RuntimeException);
  } finally {
    start.dispose();
    end.dispose();
    position.Dispose();
    weight.dispose();
    bold.dispose();
    close(f);
  }
});

it("writes table, row and cell properties through their original native format owners", /** Verifies public units, multi-letter cell names and shared body/cell character property routing. @returns Nothing. */ () => {
  const f = fixture();
  const table = f.document.GetNodes().MakeTableNode("Native table");
  for (let index = 0; index < 27; index++) table.AddColumnWidth(200);
  const line = f.document.GetNodes().AppendTableRow(table, 27);
  const api = new SwXTextTable(table);
  const keys = new Map<string, ReturnType<typeof unicode>>();
  /** Retains a native property key for this table scenario. @param name - Public name. @returns Key. */
  function key(name: string) {
    let result = keys.get(name);
    if (!result) {
      result = unicode(name);
      keys.set(name, result);
    }
    return result;
  }
  const inch = new Any([2540], "sal_Int32");
  const width = new Any([12700], "sal_Int32");
  const yes = new Any([true], "bool");
  const no = new Any([false], "bool");
  const bold = new Any([150], "float");
  const orientation = new Any([HoriOrientation.CENTER], "sal_Int16");
  const vertical = new Any([VertOrientation.CENTER], "sal_Int16");
  try {
    expect(text(api.getName())).toBe("Native table");
    expect(api.getRows().getCount()).toBe(1);
    const row = api.getRows().getByIndex(0);
    row.setPropertyValue(key("IsAutoHeight"), yes);
    row.setPropertyValue(key("Height"), inch);
    expect(number(row.getPropertyValue(key("Height")))).toBe(2540);
    const auto = row.getPropertyValue(key("IsAutoHeight"));
    const flag: [boolean] = [false];
    expect(auto.extract(flag, "bool")).toBe(true);
    expect(flag[0]).toBe(true);
    auto.dispose();
    row.setPropertyValue(key("IsAutoHeight"), no);
    row.setPropertyValue(key("IsSplitAllowed"), no);
    expect(line.GetRowSplit().GetValue()).toBe(false);
    api.setPropertyValue(key("Width"), width);
    for (const name of ["LeftMargin", "RightMargin", "TopMargin", "BottomMargin"])
      api.setPropertyValue(key(name), inch);
    api.setPropertyValue(key("HoriOrient"), orientation);
    api.setPropertyValue(key("Split"), no);
    expect(table.GetFormat()).toMatchObject({
      width: 7200,
      marginLeft: 1440,
      marginRight: 1440,
      marginTop: 1440,
      marginBottom: 1440,
      horiOrient: HoriOrientation.CENTER,
      layoutSplit: false,
    });
    const cell = api.getCellByName(key("AA1"));
    assert(cell, "AA1 must resolve to its actual cell owner");
    cell.setString(key("Last cell"));
    cell.setPropertyValue(key("CharWeight"), bold);
    cell.setPropertyValue(key("VertOrient"), vertical);
    cell.setPropertyValue(key("BottomBorderDistance"), inch);
    const box = line.GetTabBoxes()[26];
    assert(box, "AA1 is the original twenty-seventh cell");
    expect(box.GetParagraphs()[0]?.GetText()).toBe("Last cell");
    expect(box.GetVertOrient().GetVertOrient()).toBe(VertOrientation.CENTER);
    expect(
      (box.GetFrameFormat().GetAttrSet().Get(RES_BOX) as SvxBoxItem).GetDistance(
        SvxBoxItemLine.BOTTOM,
      ),
    ).toBe(1440);
    const cursor = cell.createTextCursor();
    expect(number(cursor.getPropertyValue(key("CharWeight")))).toBe(150);
    cursor.dispose();
    expect(
      failure(
        /** Rejects out-of-range row access. @returns Row. */ () => api.getRows().getByIndex(1),
      ),
    ).toBeInstanceOf(IndexOutOfBoundsException);
    expect(
      failure(
        /** Unknown row properties cannot mutate row formats. @returns Nothing. */ () =>
          row.setPropertyValue(key("Missing"), yes),
      ),
    ).toBeInstanceOf(UnknownPropertyException);
    expect(
      failure(
        /** Unknown row queries cannot invent values. @returns Value. */ () =>
          row.getPropertyValue(key("Missing")),
      ),
    ).toBeInstanceOf(UnknownPropertyException);
    expect(
      failure(
        /** Unknown table properties cannot invent a format member. @returns Nothing. */ () =>
          api.setPropertyValue(key("Missing"), yes),
      ),
    ).toBeInstanceOf(UnknownPropertyException);
  } finally {
    for (const value of [inch, width, yes, no, bold, orientation, vertical]) value.dispose();
    for (const value of keys.values()) value.dispose();
    close(f);
  }
});

it("distinguishes inherited, direct and mixed character properties and resets only the selected native delta", /** Verifies public XPropertyState and typed default results independently of storage. @returns Nothing. */ () => {
  const f = fixture();
  const weight = unicode("CharWeight");
  const keep = unicode("ParaKeepTogether");
  const missing = unicode("MissingNativeProperty");
  const bold = new Any([150], "float");
  const yes = new Any([true], "bool");
  try {
    const c = f.cursor;
    expect(c.getPropertyStates([weight, keep])).toEqual([
      PropertyState.DEFAULT_VALUE,
      PropertyState.DEFAULT_VALUE,
    ]);
    expect(number(c.getPropertyDefault(weight))).toBe(100);
    c.goRight(1, true);
    c.setPropertyValue(weight, bold);
    expect(c.getPropertyState(weight)).toBe(PropertyState.DIRECT_VALUE);
    expect(number(c.getPropertyValue(weight))).toBe(150);
    c.gotoEndOfParagraph(true);
    expect(c.getPropertyState(weight)).toBe(PropertyState.AMBIGUOUS_VALUE);
    const mixed = c.getPropertyValue(weight);
    expect(mixed.hasValue()).toBe(false);
    mixed.dispose();
    c.setPropertyToDefault(weight);
    expect(number(c.getPropertyValue(weight))).toBe(100);
    c.setPropertyValue(keep, yes);
    expect(c.getPropertyState(keep)).toBe(PropertyState.DIRECT_VALUE);
    c.gotoEnd(true);
    expect(c.getPropertyState(keep)).toBe(PropertyState.AMBIGUOUS_VALUE);
    c.setPropertyToDefault(keep);
    expect(c.getPropertyStates([keep, weight])).toEqual([
      PropertyState.DEFAULT_VALUE,
      PropertyState.DEFAULT_VALUE,
    ]);
    expect(
      failure(
        /** Queries an unsupported property state. @returns Native state. */ () =>
          c.getPropertyState(missing),
      ),
    ).toBeInstanceOf(UnknownPropertyException);
    expect(
      failure(
        /** Queries an unsupported property default. @returns Native value. */ () =>
          c.getPropertyDefault(missing),
      ),
    ).toBeInstanceOf(UnknownPropertyException);
    expect(
      failure(
        /** Resets an unsupported property. @returns Nothing. */ () =>
          c.setPropertyToDefault(missing),
      ),
    ).toBeInstanceOf(UnknownPropertyException);
    expect(
      failure(
        /** Rejects mismatched native multi-property arguments. @returns Nothing. */ () =>
          c.setPropertyValues([weight], []),
      ),
    ).toBeInstanceOf(IllegalArgumentException);
  } finally {
    for (const key of [weight, keep, missing]) key.dispose();
    bold.dispose();
    yes.dispose();
    close(f);
  }
});

it("keeps nonabsorbing bookmark attachment separate from selected text and enforces rename and disposal ownership", /** Exercises actual bookmark descriptors, the mark manager and live anchors. @returns Nothing. */ () => {
  const f = fixture();
  const first = new SwXBookmark();
  const second = new SwXBookmark();
  const renamed = unicode("Renamed");
  try {
    expect(text(first.getName())).toBe("");
    expect(
      failure(/** Queries a detached bookmark. @returns Anchor. */ () => first.getAnchor()),
    ).toBeInstanceOf(RuntimeException);
    f.cursor.goRight(2, true);
    f.body.insertTextContent(f.cursor, first, false);
    expect(text(f.cursor.getString())).toBe("AB");
    expect(text(first.getName())).toBe("Bookmark");
    const anchor = first.getAnchor();
    expect(anchor.GetPaM().GetPoint().GetContentIndex()).toBe(0);
    anchor.dispose();
    f.cursor.collapseToStart();
    second.attach(f.cursor);
    expect(text(second.getName())).toBe("Bookmark Copy 1");
    first.setName(renamed);
    first.setName(renamed);
    expect(text(first.getName())).toBe("Renamed");
    expect(
      failure(
        /** Rejects a colliding rename without replacing either mark. @returns Nothing. */ () =>
          second.setName(renamed),
      ),
    ).toBeInstanceOf(RuntimeException);
    expect(
      failure(
        /** Rejects attaching an already attached descriptor. @returns Nothing. */ () =>
          first.attach(f.cursor),
      ),
    ).toBeInstanceOf(RuntimeException);
    f.body.removeTextContent(first);
    expect(
      failure(
        /** Invalidates the disposed bookmark anchor. @returns Anchor. */ () => first.getAnchor(),
      ),
    ).toBeInstanceOf(RuntimeException);
    assert(f.document.GetIDocumentMarkAccess().FindMark("Bookmark Copy 1"));
  } finally {
    first.dispose();
    second.dispose();
    renamed.dispose();
    close(f);
  }
});

it("preserves typed paragraph and character properties and rejects malformed values without changing native items", /** Checks independent literal UNO values and failed conversions on an actual selected paragraph. @returns Nothing. */ () => {
  const f = fixture();
  const cases: readonly (readonly [string, number | boolean | string, UnoTypeArgument])[] = [
    ["CharHighlight", -1, "sal_Int32"],
    ["CharFontName", "Liberation Serif", "OUString"],
    ["CharUnderline", 1, "sal_Int16"],
    ["ParaKeepTogether", true, "bool"],
    ["ParaOrphans", -1, "sal_Int8"],
    ["OutlineLevel", 1, "sal_Int16"],
    ["ParaLineNumberCount", false, "bool"],
    ["HyperLinkURL", "https://example.test/native", "OUString"],
    ["HyperLinkTarget", "_blank", "OUString"],
    ["HyperLinkName", "Native link", "OUString"],
    ["PageDescName", "", "OUString"],
    ["NumberingStyleName", "", "OUString"],
    ["ListId", "native-list", "OUString"],
    ["NumberingIsNumber", false, "bool"],
    ["ParaIsNumberingRestart", true, "bool"],
    ["NumberingStartValue", 3, "sal_Int16"],
    ["NumberingLevel", 2, "sal_Int16"],
    ["BreakType", 4, cppu_detail_getUnoType_BreakType],
  ];
  try {
    f.cursor.gotoEndOfParagraph(true);
    for (const [name, value, type] of cases) {
      const key = unicode(name);
      const input = typeof value === "string" ? stringAny(value) : new Any([value], type);
      try {
        f.cursor.setPropertyValue(key, input);
        const output = f.cursor.getPropertyValue(key);
        expect(output.operatorEquals(input), name).toBe(true);
        output.dispose();
      } finally {
        key.dispose();
        input.dispose();
      }
    }
    const bad = new Any([true], "bool");
    for (const name of ["CharFontName", "CharUnderline", "CharWeight", "BreakType", "ListId"]) {
      const key = unicode(name);
      const before = f.cursor.getPropertyValue(key);
      try {
        const error = failure(
          /** Rejects a bool for a represented non-bool property. @returns Nothing. */ () =>
            f.cursor.setPropertyValue(key, bad),
        );
        expect(error, name).toBeInstanceOf(IllegalArgumentException);
        const after = f.cursor.getPropertyValue(key);
        expect(after.operatorEquals(before), name).toBe(true);
        after.dispose();
      } finally {
        before.dispose();
        key.dispose();
      }
    }
    bad.dispose();
    for (const name of ["ParaStyleName", "NumberingStyleName", "PageDescName"]) {
      const key = unicode(name);
      const absent = stringAny("Missing native style");
      try {
        expect(
          failure(
            /** Rejects a nonexistent named style before mutation. @returns Nothing. */ () =>
              f.cursor.setPropertyValue(key, absent),
          ),
        ).toBeInstanceOf(IllegalArgumentException);
      } finally {
        key.dispose();
        absent.dispose();
      }
    }
    const key = unicode("NumberingLevel");
    const invalid = new Any([10], "sal_Int16");
    try {
      expect(
        failure(
          /** Rejects a level beyond the ten native levels. @returns Nothing. */ () =>
            f.cursor.setPropertyValue(key, invalid),
        ),
      ).toBeInstanceOf(IllegalArgumentException);
    } finally {
      key.dispose();
      invalid.dispose();
    }
  } finally {
    close(f);
  }
});

it("rejects foreign document ranges and invalidated UNO marks through the public text owners", /** Exercises ownership failures using real documents and the canonical mark manager. @returns Nothing. */ () => {
  const f = fixture();
  const other = fixture();
  const range = f.body.getStart();
  const value = unicode("foreign");
  const position = new SwPaM(f.cursor.GetPaM().GetPoint());
  try {
    for (const operation of [
      /** Rejects a foreign cursor destination. @returns Nothing. */ () =>
        f.cursor.gotoRange(other.cursor, false),
      /** Rejects foreign insertion without touching either document. @returns Nothing. */ () =>
        f.body.insertString(other.cursor, value, false),
      /** Rejects creation over a foreign document. @returns Cursor. */ () =>
        f.body.createTextCursorByRange(other.cursor),
    ])
      expect(failure(operation)).toBeInstanceOf(RuntimeException);
    f.document.GetIDocumentMarkAccess().Dispose();
    expect(
      failure(/** Queries a removed native range mark. @returns Positions. */ () => range.GetPaM()),
    ).toBeInstanceOf(RuntimeException);
    expect(
      failure(
        /** Cannot replace positions of a removed range mark. @returns Nothing. */ () =>
          range.SetPositions(position),
      ),
    ).toBeInstanceOf(RuntimeException);
  } finally {
    range.dispose();
    position.Dispose();
    value.dispose();
    close(other);
    close(f);
  }
});

it("publishes numbering container interfaces and round-trips native line-numbering settings", /** Checks original public units, valid ranges and ignored invalid numeric settings. @returns Nothing. */ () => {
  const f = fixture();
  const rules = new SwXNumberingRules(f.document);
  try {
    expect(rules.getCount()).toBe(10);
    expect(rules.hasElements()).toBe(true);
    const elementType = rules.getElementType();
    const typeName = elementType.getTypeName();
    expect(text(typeName)).toBe("[]com.sun.star.beans.PropertyValue");
    typeName.dispose();
    elementType.dispose();
    for (const argument of [["Reference", "XInterface"], "bool"] as const) {
      const type = new Type(UnoType.get(argument));
      const result = rules.queryInterface(type);
      expect(result.hasValue()).toBe(typeof argument !== "string");
      result.dispose();
      type.dispose();
    }
    const settings = f.model.getLineNumberingProperties();
    const cases: readonly (readonly [string, number | boolean | string, UnoTypeArgument])[] = [
      ["SeparatorText", "native divider", "OUString"],
      ["Distance", 2540, "sal_Int32"],
      ["Interval", 4, "sal_Int16"],
      ["SeparatorInterval", 2, "sal_Int16"],
      ["NumberPosition", 2, "sal_Int16"],
      ["IsOn", true, "bool"],
      ["CountEmptyLines", false, "bool"],
      ["CountLinesInFrames", true, "bool"],
      ["RestartAtEachPage", true, "bool"],
    ];
    for (const [name, value, type] of cases) {
      const key = unicode(name);
      const input = typeof value === "string" ? stringAny(value) : new Any([value], type);
      try {
        settings.setPropertyValue(key, input);
        const output = settings.getPropertyValue(key);
        expect(output.operatorEquals(input), name).toBe(true);
        output.dispose();
      } finally {
        key.dispose();
        input.dispose();
      }
    }
    for (const [name, invalid, expected] of [
      ["Interval", 0, 4],
      ["SeparatorInterval", -1, 2],
      ["NumberPosition", -1, 2],
      ["NumberPosition", 4, 2],
    ] as const) {
      const key = unicode(name);
      const input = new Any([invalid], "sal_Int16");
      settings.setPropertyValue(key, input);
      expect(number(settings.getPropertyValue(key))).toBe(expected);
      input.dispose();
      key.dispose();
    }
    const missing = unicode("Missing");
    const bad = new Any([true], "bool");
    try {
      for (const operation of [
        /** Rejects an unknown rules property. @returns Value. */ () =>
          rules.getPropertyValue(missing),
        /** Rejects an unknown line-number query. @returns Value. */ () =>
          settings.getPropertyValue(missing),
        /** Rejects an unknown line-number setter. @returns Nothing. */ () =>
          settings.setPropertyValue(missing, bad),
      ])
        expect(failure(operation)).toBeInstanceOf(UnknownPropertyException);
    } finally {
      missing.dispose();
      bad.dispose();
    }
  } finally {
    rules.release();
    close(f);
  }
});

it("inserts original control characters and compares native range endpoints in the declared order", /** Covers actual XText controls and the positive-before native range-comparison convention. @returns Nothing. */ () => {
  for (const [control, prefix] of [
    [0, "\n"],
    [1, "\n"],
    [2, "\u2011"],
    [3, "\u00ad"],
    [4, "\u00a0"],
  ] as const) {
    const f = fixture();
    try {
      const start = f.body.getStart();
      const end = f.body.getEnd();
      expect(f.body.compareRegionStarts(start, end)).toBe(1);
      expect(f.body.compareRegionStarts(end, start)).toBe(-1);
      expect(f.body.compareRegionEnds(start, start) === 0).toBe(true);
      expect(f.body.compareRegionEnds(start, end)).toBe(1);
      start.dispose();
      end.dispose();
      f.body.insertControlCharacter(f.cursor, control, false);
      const result = f.body.getString();
      expect(text(result)).toBe(prefix + "AB\nCD");
      result.dispose();
      expect(f.document.paragraphs).toHaveLength(control === 0 ? 3 : 2);
      expect(
        failure(
          /** Rejects an unknown control without editing content. @returns Nothing. */ () =>
            f.body.insertControlCharacter(f.cursor, 999, false),
        ),
      ).toBeInstanceOf(IllegalArgumentException);
    } finally {
      close(f);
    }
  }
});
