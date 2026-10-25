/** @fileoverview Native style descriptor attachment, property-state, reset and family ownership contracts used by Writer import. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { SwXStyle } from "./unostyle";
import { SwStyleNameMapper } from "../doc/SwStyleNameMapper";
import { SwPoolFormatId, WRITER_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import type { OUString } from "../../../../sal/inc/rtl/ustring";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import { IllegalArgumentException } from "../../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { UnknownPropertyException } from "../../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { NoSuchElementException } from "../../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { ElementExistException } from "../../../../cppu/inc/com/sun/star/container/ElementExistException";
import { RuntimeException } from "../../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { unicode, text, stringValue, stringAny } from "./unocrsrhelper";

/** Owns actual style suppliers and every native key used by one scenario. @returns Fixture and native key factory. */
function fixture() {
  const document = new SwDoc();
  const model = new SwXTextDocument(document);
  const keys = new Map<string, OUString>();
  return {
    document,
    model,
    families: model.getStyleFamilies(),
    /** Reuses one owned native key. @param name - API name. @returns Native string. */
    key(name: string): OUString {
      let key = keys.get(name);
      if (!key) {
        key = unicode(name);
        keys.set(name, key);
      }
      return key;
    },
    /** Releases the scenario's actual native owners. @returns Nothing. */
    close(): void {
      for (const key of keys.values()) key.dispose();
      model.dispose();
      document.Dispose();
    },
  };
}
/** Captures generated native exception values. @param operation - API operation. @returns Thrown value or unexpected success. */
function failure(operation: () => unknown): unknown {
  try {
    return operation();
  } catch (error) {
    return error;
  }
}
/** Reads numeric native Any and releases it. @param value - Owned Any. @returns Number. */
function number(value: Any): number {
  const result: [number] = [0];
  try {
    expect(value.extract(result, "double")).toBe(true);
    return result[0];
  } finally {
    value.dispose();
  }
}
/** Reads string native Any and releases it. @param value - Owned Any. @returns Logical string. */
function string(value: Any): string {
  try {
    return stringValue(value);
  } finally {
    value.dispose();
  }
}

it("attaches pending paragraph properties to the actual format and retains default versus direct state", /** Exercises descriptor, family insertion and live format identity. @returns Nothing. */ () => {
  const f = fixture();
  const style = new SwXStyle(f.document, "ParagraphStyles");
  const family = f.families.getByName(f.key("ParagraphStyles"));
  const weight = f.key("CharWeight");
  const follow = f.key("FollowStyle");
  const bold = new Any([150], "float");
  const standard = stringAny("Standard");
  try {
    expect(family.getByName(f.key("Standard")).isUserDefined()).toBe(false);
    expect(text(style.getName())).toBe("");
    expect(style.isUserDefined()).toBe(false);
    expect(text(style.getParentStyle())).toBe("");
    expect(style.getPropertyState(weight)).toBe(PropertyState.DEFAULT_VALUE);
    expect(number(style.getPropertyValue(weight))).toBe(100);
    style.setPropertyValue(weight, bold);
    expect(number(style.getPropertyValue(weight))).toBe(150);
    expect(style.getPropertyState(weight)).toBe(PropertyState.DIRECT_VALUE);
    style.setPropertyToDefault(weight);
    expect(style.getPropertyState(weight)).toBe(PropertyState.DEFAULT_VALUE);
    style.setParentStyle(f.key("Standard"));
    style.setPropertyValues([weight, follow], [bold, standard]);
    family.insertByName(f.key("Imported"), style);
    expect(style.isUserDefined()).toBe(true);
    expect(text(style.getParentStyle())).toBe("Standard");
    expect(string(style.getPropertyValue(follow))).toBe("Standard");
    expect(style.getPropertyStates([weight, follow])).toEqual([
      PropertyState.DIRECT_VALUE,
      PropertyState.DIRECT_VALUE,
    ]);
    style.setPropertyToDefault(weight);
    expect(number(style.getPropertyValue(weight))).toBe(100);
    expect(style.getPropertyState(weight)).toBe(PropertyState.DEFAULT_VALUE);
    style.setName(f.key("Renamed"));
    expect(family.hasByName(f.key("Renamed"))).toBe(true);
    expect(family.hasByName(f.key("Imported"))).toBe(false);
    style.setPropertyToDefault(follow);
    expect(string(style.getPropertyValue(follow))).toBe("Renamed");
    expect(family.getElementNames()).toContain("Renamed");
  } finally {
    bold.dispose();
    standard.dispose();
    f.close();
  }
});

it("maps native paragraph pool IDs without replacing custom or internet identities", /** Checks source-owned UI versus programmatic names at the existing mapper. @returns Nothing. */ () => {
  const standard = WRITER_PARAGRAPH_STYLE_POOL.find(
    /** Selects the native standard paragraph pool entry. @param style - Pool metadata. @returns Match. */
    (style) => style.name === "Standard",
  );
  const heading = WRITER_PARAGRAPH_STYLE_POOL.find(
    /** Selects the native first heading pool entry. @param style - Pool metadata. @returns Match. */
    (style) => style.name === "Heading 1",
  );
  if (!standard || !heading) throw new Error("Missing pinned paragraph pool metadata");
  expect(SwStyleNameMapper.GetUIName(standard.poolId, "unused")).toBe("Default Paragraph Style");
  expect(SwStyleNameMapper.GetProgName(standard.poolId, "Default Paragraph Style")).toBe(
    "Standard",
  );
  expect(SwStyleNameMapper.GetUIName(heading.poolId, "unused")).toBe("Heading 1");
  expect(SwStyleNameMapper.GetProgName(heading.poolId, "Heading 1")).toBe("Heading 1");
  expect(SwStyleNameMapper.GetProgName(SwPoolFormatId.UNKNOWN, "Custom")).toBe("Custom");
  expect(SwStyleNameMapper.GetUIName(SwPoolFormatId.UNKNOWN, "Custom")).toBe("Custom");
  expect(SwStyleNameMapper.GetUIName(SwPoolFormatId.CHR_INET_NORMAL, "unused")).toBe(
    "Internet Link",
  );
  expect(SwStyleNameMapper.GetUIName(SwPoolFormatId.CHR_INET_VISIT, "unused")).toBe(
    "Visited Internet Link",
  );
});

it("retains page descriptor units, pending values and native follow/reset behavior", /** Verifies physical units and independent descriptor attachment rather than browser preferences. @returns Nothing. */ () => {
  const f = fixture();
  const page = new SwXStyle(f.document, "PageStyles");
  const family = f.families.getByName(f.key("PageStyles"));
  const width = f.key("Width");
  const landscape = f.key("IsLandscape");
  const follow = f.key("FollowStyle");
  const wide = new Any([25400], "sal_Int32");
  const yes = new Any([true], "bool");
  const standard = stringAny("Standard");
  try {
    const defaultWidth = number(page.getPropertyValue(width));
    expect(page.getPropertySetInfo().hasPropertyByName(width)).toBe(true);
    expect(page.getPropertySetInfo().hasPropertyByName(f.key("CharWeight"))).toBe(false);
    expect(page.getPropertyState(width)).toBe(PropertyState.DEFAULT_VALUE);
    page.setPropertyValues([width, landscape, follow], [wide, yes, standard]);
    expect(page.getPropertyState(width)).toBe(PropertyState.DIRECT_VALUE);
    expect(number(page.getPropertyValue(width))).toBe(25400);
    page.setParentStyle(f.key("Unused"));
    expect(text(page.getParentStyle())).toBe("");
    family.insertByName(f.key("Large"), page);
    expect(number(page.getPropertyValue(width))).toBe(25400);
    expect(string(page.getPropertyValue(follow))).toBe("Standard");
    const actual = page.getPropertyValue(landscape);
    const flag: [boolean] = [false];
    expect(actual.extract(flag, "bool")).toBe(true);
    expect(flag[0]).toBe(true);
    actual.dispose();
    expect(page.getPropertyState(landscape)).toBe(PropertyState.DIRECT_VALUE);
    page.setPropertyToDefault(width);
    page.setPropertyToDefault(landscape);
    page.setPropertyToDefault(follow);
    expect(number(page.getPropertyValue(width))).toBe(defaultWidth);
    expect(string(page.getPropertyValue(follow))).toBe("Large");
    expect(family.getElementNames()).toContain("Large");
    expect(
      failure(
        /** Rejects an unrepresented page-style rename. @returns Nothing. */ () =>
          page.setName(f.key("Other")),
      ),
    ).toBeInstanceOf(IllegalArgumentException);
  } finally {
    wide.dispose();
    yes.dispose();
    standard.dispose();
    f.close();
  }
});

it("rejects invalid style names, typed values and ownership transfers before replacing registered formats", /** Pins native exceptions for malformed descriptor and family use. @returns Nothing. */ () => {
  const f = fixture();
  const other = new SwDoc();
  const family = f.families.getByName(f.key("ParagraphStyles"));
  const descriptor = new SwXStyle(f.document, "ParagraphStyles");
  const wrong = new Any([true], "bool");
  try {
    expect(f.families.getElementNames()).toEqual([
      "ParagraphStyles",
      "PageStyles",
      "NumberingStyles",
    ]);
    expect(f.families.hasByName(f.key("PageStyles"))).toBe(true);
    expect(f.families.hasByName(f.key("Unsupported"))).toBe(false);
    expect(
      failure(
        /** Rejects an unsupported family. @returns Family. */ () =>
          f.families.getByName(f.key("Unsupported")),
      ),
    ).toBeInstanceOf(NoSuchElementException);
    expect(
      failure(
        /** Rejects a missing style. @returns Style. */ () => family.getByName(f.key("Missing")),
      ),
    ).toBeInstanceOf(NoSuchElementException);
    expect(
      failure(
        /** Detached descriptors have no format to rename. @returns Nothing. */ () =>
          descriptor.setName(f.key("Name")),
      ),
    ).toBeInstanceOf(RuntimeException);
    for (const operation of [
      /** Unknown descriptor properties have no default. @returns Value. */ () =>
        descriptor.getPropertyValue(f.key("Unknown")),
      /** Unknown descriptor property state is rejected. @returns State. */ () =>
        descriptor.getPropertyState(f.key("Unknown")),
      /** Unknown descriptor reset is rejected. @returns Nothing. */ () =>
        descriptor.setPropertyToDefault(f.key("Unknown")),
    ])
      expect(failure(operation)).toBeInstanceOf(UnknownPropertyException);
    expect(
      failure(
        /** Mismatched property lists cannot partially apply. @returns Nothing. */ () =>
          descriptor.setPropertyValues([f.key("CharWeight")], []),
      ),
    ).toBeInstanceOf(IllegalArgumentException);
    expect(
      failure(
        /** Native font weight rejects a boolean. @returns Nothing. */ () =>
          descriptor.setPropertyValue(f.key("CharWeight"), wrong),
      ),
    ).toBeInstanceOf(IllegalArgumentException);
    expect(
      failure(
        /** Cross-document formats cannot attach. @returns Nothing. */ () =>
          family.insertByName(f.key("Foreign"), new SwXStyle(other, "ParagraphStyles")),
      ),
    ).toBeInstanceOf(IllegalArgumentException);
    expect(
      failure(
        /** Cross-family descriptors cannot attach. @returns Nothing. */ () =>
          family.insertByName(f.key("Wrong"), new SwXStyle(f.document, "PageStyles")),
      ),
    ).toBeInstanceOf(IllegalArgumentException);
    family.insertByName(f.key("Original"), descriptor);
    expect(
      failure(
        /** Existing styles cannot be overwritten by name. @returns Nothing. */ () =>
          family.insertByName(f.key("Original"), new SwXStyle(f.document, "ParagraphStyles")),
      ),
    ).toBeInstanceOf(ElementExistException);
    expect(
      failure(
        /** An attached descriptor cannot attach twice. @returns Nothing. */ () =>
          descriptor.Attach("Another"),
      ),
    ).toBeInstanceOf(RuntimeException);
    expect(
      failure(
        /** Missing parent names cannot change the existing graph. @returns Nothing. */ () =>
          descriptor.setParentStyle(f.key("Missing")),
      ),
    ).toBeInstanceOf(IllegalArgumentException);
  } finally {
    wrong.dispose();
    other.Dispose();
    f.close();
  }
});

it("retains typed failures for missing follow styles, invalid numbering suppliers and unresolved pending parents", /** Covers the public style services used when XML declarations reference unsupported owners. @returns Nothing. */ () => {
  const f = fixture(),
    paragraph = new SwXStyle(f.document, "ParagraphStyles"),
    page = new SwXStyle(f.document, "PageStyles"),
    numbering = new SwXStyle(f.document, "NumberingStyles"),
    pending = new SwXStyle(f.document, "ParagraphStyles");
  const bad = new Any([true], "bool"),
    missing = stringAny("Missing style");
  try {
    paragraph.Attach("Paragraph");
    page.Attach("Page");
    numbering.Attach("Numbering");
    const child = new SwXStyle(f.document, "ParagraphStyles");
    child.setParentStyle(f.key("Paragraph"));
    child.Attach("Child");
    expect(text(page.getName())).toBe("Page");
    expect(text(numbering.getName())).toBe("Numbering");
    expect(numbering.getPropertyState(f.key("NumberingRules"))).toBe(PropertyState.DIRECT_VALUE);
    pending.setParentStyle(f.key("Missing style"));
    for (const operation of [
      /** A child cannot become the parent of its own ancestor. @returns Nothing. */ () =>
        paragraph.setParentStyle(f.key("Child")),
      /** A pending missing parent cannot materialize a format. @returns Nothing. */ () =>
        pending.Attach("Child"),
      /** Unknown paragraph follow styles cannot replace the existing link. @returns Nothing. */ () =>
        paragraph.setPropertyValue(f.key("FollowStyle"), missing),
      /** Unknown page follow styles cannot replace the existing link. @returns Nothing. */ () =>
        page.setPropertyValue(f.key("FollowStyle"), missing),
      /** Numbering rules require the actual native supplier interface. @returns Nothing. */ () =>
        numbering.setPropertyValue(f.key("NumberingRules"), bad),
      /** Numbering rename is explicitly unrepresented at this boundary. @returns Nothing. */ () =>
        numbering.setName(f.key("Other")),
    ])
      expect(failure(operation)).toBeInstanceOf(IllegalArgumentException);
    for (const operation of [
      /** Attached paragraphs reject unknown getters. @returns Value. */ () =>
        paragraph.getPropertyValue(f.key("Missing")),
      /** Pages reject unknown getters. @returns Value. */ () =>
        page.getPropertyValue(f.key("Missing")),
      /** Numbering reset remains explicitly unsupported. @returns Nothing. */ () =>
        numbering.setPropertyToDefault(f.key("NumberingRules")),
    ])
      expect(failure(operation)).toBeInstanceOf(UnknownPropertyException);
  } finally {
    bad.dispose();
    missing.dispose();
    f.close();
  }
});
