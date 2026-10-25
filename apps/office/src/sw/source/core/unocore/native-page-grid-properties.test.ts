/** @fileoverview Native page/grid UNO properties use actual pooled formats and retain complete state through browser graph/worker transfer. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { unicode } from "./unocrsrhelper";
import { SwUnoPageStylePropertyMap } from "./unomap";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import { SwTextGridItem } from "../../../inc/tgrditem";
import { RES_TEXTGRID } from "../../../inc/hintids";
import { UseOnPage } from "../layout/pagedesc";
import {
  PageStyleLayout,
  cppu_detail_getUnoType_PageStyleLayout as layoutType,
} from "../../../../offapi/com/sun/star/style/PageStyleLayout";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import {
  encodePageFormats,
  restorePageFormats,
  encodeTextGridDefault,
  restoreTextGridDefault,
} from "../../../browser/filter/xml/writer-page-format-codec";
import { SwXStyle } from "./unostyle";

/** Owns the actual family key around native style lookup. @param model - Model. @returns Style. */
function standard(model: SwXTextDocument): SwXStyle {
  const familyName = unicode("PageStyles"),
    name = unicode("Standard");
  try {
    return model.getStyleFamilies().getByName(familyName).getByName(name);
  } finally {
    familyName.dispose();
    name.dispose();
  }
}
/** Reads a native scalar Any from the actual page style. @param style - Style. @param name - Property. @param type - Type. @returns Value. */
function read(
  style: SwXStyle,
  name: string,
  type: "bool" | "sal_Int16" | "sal_Int32" = "sal_Int32",
): number | boolean {
  const key = unicode(name),
    any = style.getPropertyValue(key);
  try {
    if (type === "bool") {
      const value: [boolean] = [false];
      expect(any.extract(value, type)).toBe(true);
      return value[0];
    }
    const value: [number] = [0];
    expect(any.extract(value, type)).toBe(true);
    return value[0];
  } finally {
    key.dispose();
    any.dispose();
  }
}

it("publishes original typed page-only grid properties and routes cloned items through native page formats", /** Detached descriptors and attached styles use one actual pool/item contract. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    model = new SwXTextDocument(doc),
    style = standard(model),
    descriptor = new SwXStyle(doc, "PageStyles");
  try {
    expect(SwUnoPageStylePropertyMap.size).toBe(11);
    for (const [name, entry] of SwUnoPageStylePropertyMap) {
      expect(entry.which).toBe(RES_TEXTGRID);
      const key = unicode(name);
      try {
        expect(style.getPropertySetInfo().hasPropertyByName(key)).toBe(true);
        expect(style.getPropertyState(key)).toBe(PropertyState.DEFAULT_VALUE);
      } finally {
        key.dispose();
      }
    }
    const key = unicode("GridLines"),
      count = new Any([44], "sal_Int16"),
      bad = new Any();
    try {
      expect(
        /** Native void Any is rejected without changing the style. @returns Never. */ () =>
          style.setPropertyValue(key, bad),
      ).toThrow();
      descriptor.setPropertyValue(key, count);
      expect(read(descriptor, "GridLines", "sal_Int16")).toBe(44);
      style.setPropertyValue(key, count);
      expect(read(style, "GridLines", "sal_Int16")).toBe(44);
      expect(style.getPropertyState(key)).toBe(PropertyState.DIRECT_VALUE);
      const fresh = new SwXStyle(doc, "PageStyles");
      try {
        expect(read(fresh, "GridLines", "sal_Int16")).toBe(20);
      } finally {
        fresh.dispose();
      }
      for (const frame of [
        doc.GetPageDesc().GetMaster(),
        doc.GetPageDesc().GetLeft(),
        doc.GetPageDesc().GetFirstMaster(),
        doc.GetPageDesc().GetFirstLeft(),
      ])
        expect(frame.GetTextGrid().GetLines()).toBe(44);
      style.setPropertyToDefault(key);
      expect(read(style, "GridLines", "sal_Int16")).toBe(20);
      expect(style.getPropertyState(key)).toBe(PropertyState.DEFAULT_VALUE);
      // Original reset targets the master format's complete Which item.
      expect(doc.GetPageDesc().GetLeft().GetTextGrid().GetLines()).toBe(44);
      const poolDefault = new SwTextGridItem();
      poolDefault.SetLines(33);
      doc.GetAttrPool().SetUserDefaultItem(poolDefault);
      const defaultDescriptor = new SwXStyle(doc, "PageStyles");
      try {
        expect(read(defaultDescriptor, "GridLines", "sal_Int16")).toBe(33);
      } finally {
        defaultDescriptor.dispose();
      }
    } finally {
      key.dispose();
      count.dispose();
      bad.dispose();
    }
    for (const [name, value, type] of [
      ["GridBaseHeight", 1, "sal_Int32"],
      ["GridBaseWidth", 1000, "sal_Int32"],
      ["GridRubyHeight", 0, "sal_Int32"],
      ["GridMode", 2, "sal_Int16"],
      ["GridPrint", false, "bool"],
      ["GridDisplay", false, "bool"],
      ["GridRubyBelow", true, "bool"],
      ["GridSnapToChars", false, "bool"],
      ["StandardPageMode", true, "bool"],
    ] as const) {
      const key = unicode(name),
        any = new Any([value], type);
      try {
        style.setPropertyValue(key, any);
        expect(read(style, name, type)).toBe(name === "GridBaseHeight" ? 176 : value);
      } finally {
        key.dispose();
        any.dispose();
      }
    }
    const layout = unicode("PageStyleLayout"),
      value = new Any([PageStyleLayout.MIRRORED], layoutType);
    try {
      descriptor.setPropertyValue(layout, value);
      style.setPropertyValue(layout, value);
      expect(doc.GetPageDesc().GetUseOn()).toBe(UseOnPage.Mirror);
      const result = style.getPropertyValue(layout);
      try {
        const out: [number] = [0];
        expect(result.extract(out, layoutType)).toBe(true);
        expect(out[0]).toBe(PageStyleLayout.MIRRORED);
      } finally {
        result.dispose();
      }
      style.setPropertyToDefault(layout);
      expect(doc.GetPageDesc().GetUseOn()).toBe(UseOnPage.All);
    } finally {
      layout.dispose();
      value.dispose();
    }
  } finally {
    descriptor.dispose();
    style.dispose();
    model.dispose();
  }
});

it("transfers all four native page-frame deltas, flags, pool defaults and follow links through actual worker graph codecs", /** Structured-clone and JSON transport preserve real items while older records keep their defined defaults. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    page = doc.GetPageDesc(),
    following = doc.MakePageDesc("following"),
    grid = new SwTextGridItem();
  grid.SetSquaredMode(false);
  grid.Init();
  doc.GetAttrPool().SetUserDefaultItem(grid);
  page.SetFollow(following);
  page.SetUseOn(UseOnPage.Mirror);
  for (const [index, frame] of [
    page.GetMaster(),
    page.GetLeft(),
    page.GetFirstMaster(),
    page.GetFirstLeft(),
  ].entries()) {
    const copy = grid.Clone();
    copy.SetLines(40 + index);
    frame.SetFormatAttr(copy);
  }
  const encoded = encodeWriterDocument(doc);
  for (const transport of [structuredClone(encoded), JSON.parse(JSON.stringify(encoded))]) {
    const restored = decodeWriterDocument(transport),
      actual = restored.GetPageDesc();
    expect(encodePageFormats(actual)).toEqual(encodePageFormats(page));
    expect(actual.GetFollow()).toBe(restored.FindPageDesc("following"));
    expect(encodeTextGridDefault(restored)).toEqual(encodeTextGridDefault(doc));
    expect(actual.GetMaster().GetTextGrid()).toBeInstanceOf(SwTextGridItem);
  }
  const legacy = structuredClone(encoded);
  delete (legacy as { textGridDefault?: unknown }).textGridDefault;
  for (const record of legacy.pageDescriptors)
    delete (record as { pageFormat?: unknown }).pageFormat;
  expect(decodeWriterDocument(legacy).GetPageDesc().GetMaster().GetTextGrid().QueryValue()).toEqual(
    new SwTextGridItem().QueryValue(),
  );
});

it("rejects malformed page-item transport without accepting unknown fields as native item identities", /** Validates browser records before restoring concrete pooled items. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    page = doc.GetPageDesc();
  restorePageFormats(page, undefined);
  restoreTextGridDefault(doc, undefined);
  expect(encodeTextGridDefault(doc)).toBeUndefined();
  const valid = encodePageFormats(page);
  for (const names of [null, [], ["x", "y", "z"], ["x", 1, "y", "z"]])
    expect(
      /** Rejects malformed native format names. @returns Never. */ () =>
        restorePageFormats(page, { ...valid, names }),
    ).toThrow("frame names");
  for (const candidate of [
    null,
    1,
    {},
    { formats: [] },
    { useOn: 0 },
    { useOn: "0", formats: valid.formats },
    { useOn: 0.5, formats: valid.formats },
    { useOn: -1, formats: valid.formats },
    { useOn: 65536, formats: valid.formats },
    { useOn: 0, formats: [] },
    { useOn: 0, formats: [1, [], [], []] },
    { useOn: 0, formats: [[{ which: 1, value: 0 }], [], [], []] },
    {
      useOn: 0,
      formats: [
        [
          { which: 93, value: { Width: 100, Height: 100 } },
          { which: 93, value: { Width: 100, Height: 100 } },
        ],
        [],
        [],
        [],
      ],
    },
    { useOn: 0, formats: [[null], [], [], []] },
    { useOn: 0, formats: [[{ which: "90", value: 0 }], [], [], []] },
    { useOn: 0, formats: [[{ which: 90.5, value: 0 }], [], [], []] },
    { useOn: 0, formats: [[], [], [], []] },
  ])
    expect(
      /** Rejects a malformed graph record. @returns Never. */ () =>
        restorePageFormats(page, candidate),
    ).toThrow();
  for (const candidate of [null, 1, {}, { which: RES_TEXTGRID }, { which: 1, value: 0 }])
    expect(
      /** Rejects a malformed document-pool override. @returns Never. */ () =>
        restoreTextGridDefault(doc, candidate),
    ).toThrow();
  const snapshot = new SwTextGridItem().QueryValue();
  for (const value of [
    null,
    [],
    [...snapshot.slice(0, 10)],
    ["bad", ...snapshot.slice(1)],
    [...snapshot.slice(0, 5), 0, ...snapshot.slice(6)],
    [...snapshot.slice(0, 2), -1, ...snapshot.slice(3)],
  ])
    expect(
      /** Rejects an invalid concrete grid snapshot. @returns Never. */ () =>
        doc.GetAttrPool().CreateItem({ which: RES_TEXTGRID, value: value as never }),
    ).toThrow();
});
