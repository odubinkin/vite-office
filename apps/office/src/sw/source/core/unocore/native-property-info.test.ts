/** @fileoverview Actual Writer static property schemas, metadata component/reference contracts and source dispatch/member values. */
import { expect, it } from "vitest";
import { SwUnoPropertyMapProvider, aSwMapProvider } from "./unomap";
import * as Id from "../../../inc/unomap";
import * as Command from "../../../inc/cmdid";
import { SID_ATTR_PAGE, SID_ATTR_PAGE_SIZE } from "../../../../svx/inc/svxids";
import { createWriterDocument } from "../doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { XPropertySetInfo } from "../../../../udkapi/com/sun/star/beans/XPropertySetInfo";
import { Reference, UNO_QUERY_THROW } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { metadata, descriptors } from "../../../../test/uno-property-metadata";
import { text, unicode } from "./unocrsrhelper";
it.each([
  Id.PROPERTY_MAP_TEXT_CURSOR,
  Id.PROPERTY_MAP_CHAR_STYLE,
  Id.PROPERTY_MAP_PARA_STYLE,
  Id.PROPERTY_MAP_PAGE_STYLE,
  Id.PROPERTY_MAP_NUM_STYLE,
  Id.PROPERTY_MAP_TEXT_DOCUMENT,
])(
  "retains original function-static schema and property-set identities across providers for map %i",
  /** Original provider member arrays borrow the same function-local statics. @param id - Actual admitted map ID. @returns Nothing. */ (
    id,
  ) => {
    const first = new SwUnoPropertyMapProvider(),
      second = new SwUnoPropertyMapProvider();
    expect(first.GetPropertyMapEntries(id)).toBe(second.GetPropertyMapEntries(id));
    expect(first.GetPropertyMapEntries(id)).toBe(aSwMapProvider.GetPropertyMapEntries(id));
    expect(first.GetPropertySet(id)).toBe(second.GetPropertySet(id));
    expect(first.GetPropertySet(id)).toBe(aSwMapProvider.GetPropertySet(id));
    expect(first.GetPropertySet(id)).toBe(first.GetPropertySet(id));
  },
);
it("publishes real original handles and members instead of host-only minus-one handles", /** Inspects actual admitted native schema entries through the original provider. @returns Nothing. */ () => {
  const cursor = aSwMapProvider.GetPropertySet(Id.PROPERTY_MAP_TEXT_CURSOR).getPropertyMap();
  for (const [name, which, member] of [
    ["ParaStyleName", Command.FN_UNO_PARA_STYLE, 0],
    ["NumberingRules", Command.FN_UNO_NUM_RULES, 128],
    ["NumberingLevel", Command.FN_UNO_NUM_LEVEL, 0],
    ["NumberingStartValue", Command.FN_UNO_NUM_START_VALUE, 128],
    ["NumberingIsNumber", Command.FN_UNO_IS_NUMBER, 0],
    ["ParaIsNumberingRestart", Command.FN_NUMBER_NEWSTART, 0],
    ["ListId", Command.FN_UNO_LIST_ID, 0],
  ] as const) {
    const key = unicode(name);
    try {
      const entry = cursor.getByName(key.getStr().subarray(0, key.getLength()));
      expect([entry?.nWID, entry?.nMemberId, entry?.nFlags]).toEqual([which, member, 1]);
    } finally {
      key.dispose();
    }
  }
  const page = aSwMapProvider.GetPropertySet(Id.PROPERTY_MAP_PAGE_STYLE).getPropertyMap();
  for (const [name, which, member] of [
    ["Width", SID_ATTR_PAGE_SIZE, 129],
    ["Height", SID_ATTR_PAGE_SIZE, 130],
    ["IsLandscape", SID_ATTR_PAGE, 1],
    ["PageStyleLayout", SID_ATTR_PAGE, 2],
    ["FollowStyle", Command.FN_UNO_FOLLOW_STYLE, 0],
  ] as const) {
    const key = unicode(name);
    try {
      const entry = page.getByName(key.getStr().subarray(0, key.getLength()));
      expect([entry?.nWID, entry?.nMemberId, entry?.nFlags]).toEqual([which, member, 0]);
    } finally {
      key.dispose();
    }
  }
});
it("returns actual queried metadata References and native sequences from existing document, cursor and style APIs", /** No replacement document graph, injected component or test provider is used. @returns Nothing. */ () => {
  const doc = createWriterDocument(),
    model = new SwXTextDocument(doc),
    key = unicode("Standard");
  try {
    const document = model.getPropertySetInfo(),
      queried = new Reference<XPropertySetInfo>(
        document,
        UNO_QUERY_THROW,
        XPropertySetInfo.static_type,
      );
    try {
      expect(queried.get()).toBe(document.get());
    } finally {
      queried.dispose();
      document.dispose();
    }
    const documentRows = descriptors(metadata(model.getPropertySetInfo()));
    expect(
      documentRows.map(
        /** Reads actual native descriptors. @param value - Descriptor. @returns Original fields. */ (
          value,
        ) => [text(value.Name), value.Handle, value.Attributes],
      ),
    ).toEqual([["DefaultPageMode", Id.WID_DOC_DEFAULT_PAGE_MODE, 0]]);
    const cursor = metadata(model.getText().getStart().getPropertySetInfo());
    const numbering = unicode("NumberingRules"),
      descriptor = cursor.getPropertyByName(numbering);
    try {
      expect(descriptor.Handle).toBe(Command.FN_UNO_NUM_RULES);
    } finally {
      descriptor.dispose();
      numbering.dispose();
    }
    const paragraphFamily = unicode("ParagraphStyles");
    const paragraph = model.getStyleFamilies().getByName(paragraphFamily).getByName(key);
    paragraphFamily.dispose();
    const paragraphInfo = metadata(paragraph.getPropertySetInfo());
    for (const [name, flags] of [
      ["ParaKeepTogether", 0],
      ["CharWeight", 1],
      ["FillStyle", 0],
    ] as const) {
      const propertyName = unicode(name),
        value = paragraphInfo.getPropertyByName(propertyName);
      try {
        expect(value.Attributes).toBe(flags);
      } finally {
        value.dispose();
        propertyName.dispose();
      }
    }
    for (const name of ["FillStyle", "ParaTopBorder", "ParaConnectBorder"]) {
      const propertyName = unicode(name);
      try {
        expect(cursor.hasPropertyByName(propertyName)).toBe(false);
      } finally {
        propertyName.dispose();
      }
    }
    const borderName = unicode("TopBorder"),
      border = cursor.getPropertyByName(borderName),
      borderType = border.Type.getTypeName();
    try {
      expect(text(borderType)).toBe("com.sun.star.table.BorderLine");
    } finally {
      borderType.dispose();
      border.dispose();
      borderName.dispose();
    }
    for (const style of [
      model.createCharacterStyle(),
      paragraph,
      model.createPageStyle(),
      model.createNumberingStyle(),
    ]) {
      const info = style.getPropertySetInfo(),
        facet = new Reference<XPropertySetInfo>(
          info,
          UNO_QUERY_THROW,
          XPropertySetInfo.static_type,
        );
      try {
        expect(facet.get()).toBe(info.get());
      } finally {
        facet.dispose();
        info.dispose();
        style.dispose();
      }
    }
  } finally {
    key.dispose();
    model.dispose();
    doc.Dispose();
  }
});
