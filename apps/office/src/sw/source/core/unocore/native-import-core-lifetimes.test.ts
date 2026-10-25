/** @fileoverview Native ownership and invalid-domain regression cases exposed by integrating the Writer import APIs. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { SwPaM, SwPosition } from "../crsr/pam";
import { UnoMark } from "../crsr/bookmark";
import { SwXTextRange } from "./unoobj2";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import {
  UnknownPropertyException,
  getCppuType,
  cppu_detail_getUnoType,
} from "../../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { StylePool } from "../../../../svl/source/items/stylepool";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import {
  RES_CHRATR_COLOR,
  RES_CHRATR_WEIGHT,
  RES_MARGIN_RIGHT,
  RES_PARATR_ORPHANS,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { Color } from "../../../../tools/inc/color";
import { SvxFontItem } from "../../../../editeng/source/items/textitem";
import { InsertPoolItem } from "../doc/docfmt";
import { createPropertySetInfo, SwUnoPropertyMap } from "./unomap";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { createWriterHighlightItem, writerHighlightColorValue } from "../attr/swatrset";
import { INVALID_POOL_ITEM } from "../../../../svl/source/items/poolitem";
import { SwFormatAutoFormat } from "../txtnode/txatbase";
import { SwFormatPageDesc } from "../attr/fmtpdsc";
import { SwNumRuleItem } from "../para/paratr";
import { IllegalArgumentException } from "../../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import {
  NumberingPropertySequence,
  numberingSequenceType,
  numberingToSequence,
  numberingFromAny,
} from "./unosett-properties";
import { SwXNumberingRules } from "./unosett";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { RuntimeException } from "../../../../cppu/inc/com/sun/star/uno/RuntimeException";
import {
  unicode,
  text,
  stringAny,
  stringValue,
  GetPropertyValue,
  SetPropertyValue,
  SetPropertyValues,
  queryItem,
  putItem,
  effectiveItem,
} from "./unocrsrhelper";

/** Captures generated exceptions independently of JavaScript Error inheritance. @param operation - Native operation. @returns Thrown value or unexpected result. */
function failure(operation: () => unknown): unknown {
  try {
    return operation();
  } catch (error) {
    return error;
  }
}

it("retains generated unknown-property messages across default copy move and erased member access", /** Checks real generated exception ownership used by wrapped API errors. @returns Nothing. */ () => {
  const empty = new UnknownPropertyException();
  const message = unicode("Missing native property");
  const context = new Reference();
  const original = new UnknownPropertyException(message, context);
  const copy = new UnknownPropertyException(original);
  const moved = UnknownPropertyException.move(copy);
  try {
    expect(text(empty.Message)).toBe("");
    expect(text(original.Message)).toBe("Missing native property");
    expect(text(moved.Message)).toBe("Missing native property");
    expect(original.get(0)).toEqual(original.Message.getDataAddress());
    expect(original.get(8)).toEqual([null]);
    expect(getCppuType()).toBe(cppu_detail_getUnoType());
    message.dispose();
    expect(text(moved.Message)).toBe("Missing native property");
  } finally {
    empty.dispose();
    original.dispose();
    copy.dispose();
    moved.dispose();
    context.dispose();
  }
});

it("preserves ordered internal mark endpoints and rejects queries or updates after native disposal", /** Covers collapsed and forward/reversed expanded positions without user bookmark aliases. @returns Nothing. */ () => {
  const document = new SwDoc();
  const node = document.paragraphs[0];
  assert(node);
  node.SetText("ABCD");
  const first = new SwPosition(node, 1),
    last = new SwPosition(node, 3);
  const range = new SwPaM(first),
    output = new SwPaM(last);
  const mark = new UnoMark(range);
  try {
    expect(mark.IsExpanded()).toBe(false);
    expect(mark.GetOtherMarkPos()).toBe(mark.GetMarkPos());
    range.Assign(last, first);
    expect(mark.SetPositions(range)).toBe(true);
    expect(mark.IsExpanded()).toBe(true);
    expect(mark.GetMarkPos().GetContentIndex()).toBe(3);
    expect(mark.GetOtherMarkPos().GetContentIndex()).toBe(1);
    expect(mark.GetPositions(output)).toBe(true);
    expect(output.Start().GetContentIndex()).toBe(1);
    expect(output.End().GetContentIndex()).toBe(3);
    range.Assign(first, last);
    expect(mark.SetPositions(range)).toBe(true);
    expect(mark.GetMarkPos().GetContentIndex()).toBe(1);
    expect(mark.GetOtherMarkPos().GetContentIndex()).toBe(3);
    range.DeleteMark();
    mark.SetPositions(range);
    mark.Dispose();
    mark.Dispose();
    expect(mark.GetPositions(output)).toBe(false);
    expect(mark.SetPositions(range)).toBe(false);
  } finally {
    mark.Dispose();
    range.Dispose();
    output.Dispose();
    first.Dispose();
    last.Dispose();
    document.Dispose();
  }
});

it("resolves uncached automatic-style handles and distinguishes mixed native styles from a uniform identity", /** Exercises actual pool enumeration, range boundaries and inherited item fallback. @returns Nothing. */ () => {
  const document = new SwDoc();
  const model = new SwXTextDocument(document),
    body = model.getText(),
    cursor = body.createTextCursor();
  const input = unicode("ABCD"),
    key = unicode("CharAutoStyleName"),
    weight = unicode("CharWeight");
  const set = new SfxItemSet(document.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  set.Put(new SvxColorItem(new Color(0x123456), RES_CHRATR_COLOR));
  const manager = document.GetIStyleAccess();
  const handle = manager.getAutomaticStyle(set, SwAutoStyleFamily.AUTO_STYLE_CHAR);
  const name = StylePool.nameOf(handle),
    identity = stringAny(name);
  try {
    expect(manager.getByName(name, SwAutoStyleFamily.AUTO_STYLE_CHAR)).toBe(handle);
    expect(
      manager.getByName("missing-native-handle", SwAutoStyleFamily.AUTO_STYLE_CHAR),
    ).toBeUndefined();
    body.setString(input);
    cursor.gotoStart(false);
    cursor.goRight(1, false);
    cursor.goRight(2, true);
    cursor.setPropertyValue(key, identity);
    const uniform = cursor.getPropertyValue(key);
    expect(stringValue(uniform)).toBe(name);
    uniform.dispose();
    const normal = cursor.getPropertyValue(weight);
    const value: [number] = [0];
    expect(normal.extract(value, "float")).toBe(true);
    expect(value[0]).toBe(100);
    normal.dispose();
    const node = document.paragraphs[0];
    assert(node);
    const entry = SwUnoPropertyMap.get("CharWeight");
    assert(entry);
    const inherited = queryItem(effectiveItem(node, 1, RES_CHRATR_WEIGHT), entry);
    expect(inherited.extract(value, "float")).toBe(true);
    expect(value[0]).toBe(100);
    inherited.dispose();
    const auto = SwUnoPropertyMap.get("CharAutoStyleName");
    assert(auto);
    const queried = queryItem(new SwFormatAutoFormat(handle), auto);
    expect(stringValue(queried)).toBe(name);
    queried.dispose();
    const linkKey = unicode("HyperLinkURL"),
      link = stringAny("https://example.test/native");
    cursor.gotoEnd(false);
    cursor.goLeft(1, true);
    cursor.setPropertyValue(linkKey, link);
    linkKey.dispose();
    link.dispose();
    cursor.gotoStart(false);
    cursor.gotoEnd(true);
    const mixed = cursor.getPropertyValue(key);
    expect(mixed.hasValue()).toBe(false);
    mixed.dispose();
    const absent = stringAny("missing-native-handle");
    cursor.setPropertyValue(key, absent);
    absent.dispose();
    cursor.gotoStart(false);
    const unstyled = cursor.getPropertyValue(key);
    expect(stringValue(unstyled)).toBe("");
    unstyled.dispose();
  } finally {
    input.dispose();
    key.dispose();
    weight.dispose();
    identity.dispose();
    cursor.dispose();
    model.dispose();
    document.Dispose();
  }
});

it("queries legacy transport items and rejects invalid item members before pooled state can change", /** Covers the actual bounded compatibility boundary alongside native item ownership. @returns Nothing. */ () => {
  const input = new Any([-1], "sal_Int32"),
    bad = new Any([true], "bool"),
    string = stringAny("Numbering");
  const color = SwUnoPropertyMap.get("CharHighlight"),
    page = SwUnoPropertyMap.get("PageDescName"),
    numbering = SwUnoPropertyMap.get("NumberingStyleName"),
    link = SwUnoPropertyMap.get("HyperLinkURL"),
    orphan = SwUnoPropertyMap.get("ParaOrphans");
  const document = new SwDoc();
  assert(color);
  assert(page);
  assert(numbering);
  assert(link);
  assert(orphan);
  try {
    for (const old of ["transparent", "#123456"]) {
      const value = queryItem(createWriterHighlightItem(old), color),
        actual: [number] = [0];
      expect(value.extract(actual, "sal_Int32")).toBe(true);
      expect(actual[0]).toBe(old === "#123456" ? 0x123456 : -1);
      value.dispose();
    }
    const highlight = putItem(createWriterHighlightItem("#123456"), color, input) as SvxBrushItem;
    expect(writerHighlightColorValue(highlight)).toBe("transparent");
    const named = queryItem(new SwFormatPageDesc("Standard", 3), page);
    expect(stringValue(named)).toBe("Standard");
    named.dispose();
    const updated = putItem(new SwFormatPageDesc("", 3), page, string) as SwFormatPageDesc;
    expect(updated.GetPageDescName()).toBe("Numbering");
    expect(updated.GetNumOffset()).toBe(3);
    const rule = putItem(new SwNumRuleItem(""), numbering, string);
    const name = queryItem(rule, numbering);
    expect(stringValue(name)).toBe("Numbering");
    name.dispose();
    const missingName = SwUnoPropertyMap.get("HyperLinkName");
    assert(missingName);
    const unnamed = queryItem(new SwFormatINetFormat(""), missingName);
    expect(stringValue(unnamed)).toBe("");
    unnamed.dispose();
    const short = new Any([254], "sal_Int16");
    const plain = putItem(
      new SfxInt16Item(999, 3),
      { which: 999, member: 0, kind: "short" },
      short,
    ) as SfxInt16Item;
    expect(plain.GetValue()).toBe(254);
    const right = SwUnoPropertyMap.get("ParaRightMargin");
    assert(right);
    const transport = { ...right, kind: "short" as const };
    const margin = putItem(
        document.GetAttrPool().GetUserOrPoolDefaultItem(RES_MARGIN_RIGHT),
        transport,
        short,
      ),
      measured = queryItem(margin, transport),
      actual: [number] = [0];
    expect(measured.extract(actual, "sal_Int16")).toBe(true);
    expect(actual[0]).toBe(254);
    measured.dispose();
    short.dispose();
    const invalidLink = { ...link, member: 99 };
    for (const operation of [
      /** Rejects an unrepresented hyperlink member query. @returns Value. */ () =>
        queryItem(new SwFormatINetFormat({ url: "" }), invalidLink),
      /** Rejects an unrepresented hyperlink member update. @returns Item. */ () =>
        putItem(new SwFormatINetFormat({ url: "" }), invalidLink, string),
      /** Rejects malformed scalar input before replacing an item. @returns Item. */ () =>
        putItem(new SfxInt16Item(orphan.which, 2), orphan, bad),
    ])
      expect(failure(operation)).toBeInstanceOf(IllegalArgumentException);
    expect(
      failure(
        /** A static invalid-state sentinel is not a mutable pooled attribute. @returns Item. */ () =>
          putItem(INVALID_POOL_ITEM, orphan, input),
      ),
    ).toBeInstanceOf(RuntimeException);
  } finally {
    input.dispose();
    bad.dispose();
    string.dispose();
    document.Dispose();
  }
});

it("validates typed numbering sequences before committing native level replacements", /** Checks original named properties, optional bullet fonts and rejected enum/range values at XIndexReplace. @returns Nothing. */ () => {
  const document = new SwDoc(),
    rules = new SwXNumberingRules(document);
  /** Owns a literal native one-property sequence. @param name - UNO property name. @param value - Native value. @returns Owned Any. */
  function property(name: string, value: Any): Any {
    const key = unicode(name),
      item = new PropertyValue(key, -1, value, 0);
    const sequence = new NumberingPropertySequence(
      {
        /** Borrows the one generated property at its compound address. @returns Property. */ get: () =>
          item,
      },
      1,
    );
    try {
      return new Any(sequence.getAddress(), numberingSequenceType);
    } finally {
      sequence.dispose();
      item.Name.dispose();
      item.Value.dispose();
      key.dispose();
      value.dispose();
    }
  }
  try {
    for (const [name, value] of [
      ["BulletFontName", stringAny("Native bullet")],
      ["PositionAndSpaceMode", new Any([0], "sal_Int16")],
      ["BulletChar", stringAny("")],
    ] as const) {
      const input = property(name, value);
      rules.replaceByIndex(0, input);
      input.dispose();
    }
    expect(rules.GetPropertiesByIndex(0).positionAndSpaceMode).toBe("label-width-and-position");
    const simple = numberingToSequence({
      kind: "bullet",
      suffix: "",
      positionAndSpaceMode: "label-width-and-position",
      bulletFont: { name: "Native bullet" },
    });
    const typed = new Any(simple.getAddress(), numberingSequenceType);
    simple.dispose();
    const decoded = numberingFromAny(typed, { kind: "bullet", suffix: "" });
    typed.dispose();
    expect(decoded.bulletFont).toEqual({ name: "Native bullet" });
    expect(decoded.positionAndSpaceMode).toBe("label-width-and-position");
    for (const [name, value] of [
      ["PositionAndSpaceMode", new Any([2], "sal_Int16")],
      ["LabelFollowedBy", new Any([-1], "sal_Int16")],
      ["LabelFollowedBy", new Any([3], "sal_Int16")],
      ["SymbolTextDistance", new Any([-1], "sal_Int32")],
      ["Unsupported", new Any([1], "sal_Int16")],
    ] as const) {
      const input = property(name, value);
      try {
        expect(
          failure(
            /** Rejects an invalid typed level update before commit. @returns Nothing. */ () =>
              rules.replaceByIndex(0, input),
          ),
        ).toBeInstanceOf(IllegalArgumentException);
      } finally {
        input.dispose();
      }
    }
    const invalid = new Any([true], "bool");
    expect(
      failure(
        /** A scalar cannot represent a generated property sequence. @returns Nothing. */ () =>
          rules.replaceByIndex(0, invalid),
      ),
    ).toBeInstanceOf(IllegalArgumentException);
    invalid.dispose();
  } finally {
    rules.release();
    document.Dispose();
  }
});

it("publishes programmatic paragraph-style names and void for selections spanning different native formats", /** Follows native GetCurTextFormatColl and FillProgName instead of exposing the English UI display name. @returns Nothing. */ () => {
  const document = new SwDoc(),
    model = new SwXTextDocument(document),
    body = model.getText(),
    cursor = body.createTextCursor();
  const input = unicode("AB\rCD"),
    key = unicode("ParaStyleName"),
    heading = stringAny("Heading 1");
  try {
    body.setString(input);
    cursor.gotoStart(false);
    cursor.gotoEnd(true);
    const standard = cursor.getPropertyValue(key);
    expect(stringValue(standard)).toBe("Standard");
    standard.dispose();
    cursor.gotoEnd(false);
    cursor.setPropertyValue(key, heading);
    const changed = cursor.getPropertyValue(key);
    expect(stringValue(changed)).toBe("Heading 1");
    changed.dispose();
    cursor.gotoStart(false);
    cursor.gotoEnd(true);
    const mixed = cursor.getPropertyValue(key);
    expect(mixed.hasValue()).toBe(false);
    mixed.dispose();
  } finally {
    input.dispose();
    key.dispose();
    heading.dispose();
    cursor.dispose();
    model.dispose();
    document.Dispose();
  }
});

it("guards empty and foreign core table conversions without moving canonical paragraph owners", /** Covers structural preconditions before TextToTable performs any model transaction. @returns Nothing. */ () => {
  const document = new SwDoc(),
    foreign = new SwDoc();
  const first = document.paragraphs[0],
    other = foreign.paragraphs[0];
  assert(first);
  assert(other);
  const middle = document.GetNodes().MakeTextNode(),
    last = document.GetNodes().MakeTextNode();
  try {
    for (const rows of [[], [[]], [[[]]]]) {
      expect(
        /** Rejects empty dimensions before mutation. @returns Table. */ () =>
          document.GetNodes().TextToTable(rows, "Empty"),
      ).toThrow("Empty table range");
    }
    expect(
      /** Rejects a foreign section assignment. @returns Nothing. */ () =>
        first.SetStartOfSection(other.StartOfSectionNode()),
    ).toThrow("another document");
    expect(
      /** Rejects foreign conversion nodes. @returns Table. */ () =>
        document.GetNodes().TextToTable([[[other]]], "Foreign"),
    ).toThrow("contiguous body text");
    expect(
      /** Rejects a noncontiguous conversion. @returns Table. */ () =>
        document.GetNodes().TextToTable([[[first, last]]], "Gap"),
    ).toThrow("contiguous body text");
    expect(document.paragraphs).toEqual([first, middle, last]);
    const table = document.GetNodes().MakeTableNode("Existing");
    const line = document.GetNodes().AppendTableRow(table, 1);
    const cell = line.GetTabBoxes()[0]?.GetParagraphs()[0];
    assert(cell);
    expect(
      /** Rejects cell text as body table input. @returns Table. */ () =>
        document.GetNodes().TextToTable([[[cell]]], "Nested"),
    ).toThrow("contiguous body text");
  } finally {
    document.Dispose();
    foreign.Dispose();
  }
});

it("applies default item-insertion mode across paragraph boundaries and rejects non-text API selections", /** Uses actual core ranges including an invalid table-node property domain. @returns Nothing. */ () => {
  const document = new SwDoc();
  const model = new SwXTextDocument(document),
    body = model.getText(),
    cursor = body.createTextCursor();
  const value = unicode("AB\rCD"),
    weight = unicode("CharWeight");
  body.setString(value);
  cursor.gotoStart(false);
  cursor.goRight(1, false);
  cursor.gotoEnd(true);
  const table = document.GetNodes().MakeTableNode("Empty");
  const position = new SwPosition(table.GetTableNode(), 0),
    tableRange = new SwPaM(position);
  const api = new SwXTextRange(tableRange, body, false),
    input = new Any([150], "float");
  try {
    document.InsertPoolItem(cursor.GetPaM(), new SfxInt16Item(RES_PARATR_ORPHANS, 3));
    InsertPoolItem(document, cursor.GetPaM(), new SwFormatINetFormat({ url: "" }));
    expect(createPropertySetInfo().hasPropertyByName(weight)).toBe(true);
    for (const operation of [
      /** Rejects an item setter on a non-text range. @returns Nothing. */ () =>
        SetPropertyValue(tableRange, "CharWeight", input),
      /** Rejects an item getter on a non-text range. @returns Value. */ () =>
        GetPropertyValue(tableRange, "CharWeight"),
      /** Rejects an empty batch on a non-text range. @returns Nothing. */ () =>
        SetPropertyValues(tableRange, []),
    ])
      expect(failure(operation)).toBeInstanceOf(RuntimeException);
    api.SetPositions(cursor.GetPaM());
    const positions = new SwPaM(cursor.GetPaM().GetPoint());
    cursor.collapseToStart();
    cursor.GetPositions(positions);
    positions.Dispose();
    const keep = unicode("ParaKeepTogether"),
      yes = new Any([true], "bool");
    cursor.gotoStart(false);
    cursor.setPropertyValue(keep, yes);
    cursor.gotoEnd(true);
    const mixed = cursor.getPropertyValue(keep);
    expect(mixed.hasValue()).toBe(false);
    mixed.dispose();
    keep.dispose();
    yes.dispose();
  } finally {
    input.dispose();
    api.dispose();
    tableRange.Dispose();
    position.Dispose();
    value.dispose();
    weight.dispose();
    cursor.dispose();
    model.dispose();
    document.Dispose();
  }
});

it("rejects unsupported font compound members and malformed native scalar values without changing font metadata", /** Exercises the real SvxFontItem Any boundary used by imported font names and scalar members. @returns Nothing. */ () => {
  const font = new SvxFontItem(0);
  const output = new Any(),
    wrong = stringAny("not a numeric font member");
  try {
    expect(font.QueryValue(output, 0)).toBe(false);
    expect(font.QueryValue(output, 99)).toBe(true);
    expect(font.PutValue(42, 3)).toBe(false);
    expect(font.PutValue(wrong, 3)).toBe(false);
    expect(font.PutValue(output, 0)).toBe(false);
    expect(font.PutValue(output, 99)).toBe(true);
  } finally {
    output.dispose();
    wrong.dispose();
  }
});
