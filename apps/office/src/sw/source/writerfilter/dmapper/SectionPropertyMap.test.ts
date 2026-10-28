/** @fileoverview Native section defaults, typed page-style attachment and bag application use the actual Writer document graph and UNO values. */
import { DomainMapper } from "./DomainMapper";
import { afterEach, expect, it, vi } from "vitest";
import { SectionPropertyMap, GrabBagType as G } from "./PropertyMap";
import { ContextType as C } from "./DomainMapper_Impl";
import { PropertyIds as P } from "./PropertyIds";
import { SwDoc } from "../../core/doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { SwXPageStyle } from "../../core/unocore/unostyle";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { text, unicode, invalid } from "../../core/unocore/unocrsrhelper";
import { Length, toTwips } from "../../../../o3tl/inc/unit_conversion";
import { PageStyleLayout } from "../../../../offapi/com/sun/star/style/PageStyleLayout";
import { getEnumAsINT32 } from "../../../../comphelper/source/misc/types";

afterEach(
  /** Restores observers over actual owners. @returns Nothing. */ () => vi.restoreAllMocks(),
);
/** Borrows a required actual page style. @param value - Native optional. @returns Page style. */
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw Error("Missing actual native owner");
  return value;
}
/** Inserts an owned temporary with original Any address syntax. @param map - Actual map. @param id - Native property ID. @param value - Scalar. @param grab - Original bag. @returns Nothing. */
function insert(map: SectionPropertyMap, id: P, value: number, grab = G.NO_GRAB_BAG): void {
  const any = new Any([value], "sal_Int32");
  try {
    map.Insert(id, any, true, grab);
  } finally {
    any.dispose();
  }
}

it("constructs first and later native section contexts with Letter defaults independent of document locale", /** Checks exact UNO types, default values and the actual page descriptor. @returns Nothing. */ () => {
  const doc = new SwDoc({ locale: "de-DE" }),
    model = new SwXTextDocument(doc),
    mapper = new DomainMapper(model, SourceDocumentType.OOXML).impl;
  try {
    expect(doc.GetPageDesc().GetValue().width).not.toBe(Number(toTwips(21590n, Length.mm100)));
    const first = mapper.PushProperties(C.CONTEXT_SECTION) as SectionPropertyMap;
    expect(first).toBeInstanceOf(SectionPropertyMap);
    expect(first.IsFirstSection()).toBe(true);
    expect(text(first.GetPageStyleName())).toBe("Standard");
    expect(first.GetPageWidth()).toBe(21590);
    for (const [id, expected] of [
      [P.PROP_HEIGHT, 27940],
      [P.PROP_LEFT_MARGIN, 2540],
      [P.PROP_RIGHT_MARGIN, 2540],
      [P.PROP_TOP_MARGIN, 2540],
      [P.PROP_BOTTOM_MARGIN, 2540],
    ] as const) {
      const property = first.getProperty(id);
      expect(property).toBeDefined();
      expect(property?.[1].get("sal_Int32")).toBe(expected);
      property?.[1].dispose();
    }
    expect(first.GetPropertyValues()).toHaveLength(10);
    const layout = first.getProperty(P.PROP_PAGE_STYLE_LAYOUT);
    expect(getEnumAsINT32(required(layout)[1])).toBe(PageStyleLayout.ALL);
    required(layout)[1].dispose();
    const style = required(first.GetPageStyle(mapper));
    expect(style).toBeInstanceOf(SwXPageStyle);
    expect(first.GetPageStyle(mapper)).toBe(style);
    expect(doc.GetPageDescCnt()).toBe(1);
    const observe = vi.spyOn(style, "setPropertyValues");
    first["ApplyProperties_"](style);
    expect(observe.mock.calls[0]?.[0].map(text)).toEqual(
      first
        .GetPropertyValues()
        .map(
          /** Reads generated native names. @param property - Property. @returns Name. */ (
            property,
          ) => text(property.Name),
        ),
    );
    expect(doc.GetPageDesc().GetValue().width).toBe(Number(toTwips(21590n, Length.mm100)));
    mapper.PopProperties(C.CONTEXT_SECTION);
    const next = mapper.PushProperties(C.CONTEXT_SECTION) as SectionPropertyMap;
    expect(next.IsFirstSection()).toBe(false);
    expect(text(next.GetPageStyleName())).toBe("");
    expect(required(next.GetPageStyle(mapper))).toBeInstanceOf(SwXPageStyle);
    expect(text(next.GetPageStyleName())).toBe("Converted1");
    expect(doc.FindPageDesc("Converted1")).toBeDefined();
    mapper.PopProperties(C.CONTEXT_SECTION);
  } finally {
    mapper.dispose();
    model.dispose();
    doc.Dispose();
  }
});

it("scans original signed32 Converted prefixes once and continues its cache without rescanning", /** Uses actual document names, including native numeric prefix and overflow behavior. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    model = new SwXTextDocument(doc),
    mapper = new DomainMapper(model, SourceDocumentType.OOXML).impl;
  try {
    for (const name of [
      "Converted2",
      "Converted8junk",
      "Converted2147483648",
      "Converted-9",
      "Other90",
    ])
      doc.MakePageDesc(name);
    expect(mapper.GetPageStyles()).toBe(mapper.GetPageStyles());
    expect(mapper.GetTextDocument()).toBe(model);
    const first = mapper.GetUnusedPageStyleName();
    expect(text(first)).toBe("Converted9");
    first.dispose();
    doc.MakePageDesc("Converted900");
    const next = mapper.GetUnusedPageStyleName();
    expect(text(next)).toBe("Converted10");
    next.dispose();
  } finally {
    mapper.dispose();
    model.dispose();
    doc.Dispose();
  }
});

it("unwraps character then paragraph bags after ordinary properties and omits section-only protection", /** Checks original application order and concrete page-grid items. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    model = new SwXTextDocument(doc),
    mapper = new DomainMapper(model, SourceDocumentType.OOXML).impl,
    section = new SectionPropertyMap(true);
  try {
    insert(section, P.PROP_GRID_BASE_HEIGHT, 720, G.CHAR_GRAB_BAG);
    insert(section, P.PROP_GRID_BASE_WIDTH, 800, G.PARA_GRAB_BAG);
    const protection = new Any(true);
    try {
      section.Insert(P.PROP_IS_PROTECTED, protection);
    } finally {
      protection.dispose();
    }
    const style = required(section.GetPageStyle(mapper)),
      observe = vi.spyOn(style, "setPropertyValues");
    section["ApplyProperties_"](null);
    expect(observe).not.toHaveBeenCalled();
    section["ApplyProperties_"](style);
    const names = required(observe.mock.calls[0])[0].map(text);
    expect(names.slice(-2)).toEqual(["GridBaseHeight", "GridBaseWidth"]);
    expect(names).not.toContain("IsProtected");
    expect(names).not.toContain("CharInteropGrabBag");
    expect(names).not.toContain("ParaInteropGrabBag");
    expect(doc.GetPageDesc().GetMaster().GetTextGrid().GetBaseHeight()).toBe(
      Number(toTwips(720n, Length.mm100)),
    );
    expect(doc.GetPageDesc().GetMaster().GetTextGrid().GetBaseWidth()).toBe(
      Number(toTwips(800n, Length.mm100)),
    );
  } finally {
    section.dispose();
    mapper.dispose();
    model.dispose();
    doc.Dispose();
  }
});

it("retains native UNO catch boundaries and the reserved name after failed creation", /** Observes original failure admission over actual owners, without a replacement model. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    model = new SwXTextDocument(doc),
    mapper = new DomainMapper(model, SourceDocumentType.OOXML).impl,
    section = new SectionPropertyMap(false);
  try {
    vi.spyOn(model, "createPageStyle").mockImplementationOnce(
      /** Emits a real UNO failure. @returns Never. */ () => invalid("Native creation failure"),
    );
    expect(section.GetPageStyle(mapper)).toBeNull();
    expect(text(section.GetPageStyleName())).toBe("Converted1");
    expect(section.GetPageStyle(mapper)).toBeNull();
    expect(doc.FindPageDesc("Converted1")).toBeUndefined();
    vi.spyOn(mapper.GetPageStyles(), "getPageStyleByName").mockImplementationOnce(
      /** Host failures remain visible. @returns Never. */ () => {
        throw Error("host failure");
      },
    );
    expect(
      /** Does not swallow host implementation failures. @returns Native result. */ () =>
        section.GetPageStyle(mapper),
    ).toThrow("host failure");
    const actual = model.createPageStyle(),
      name = unicode("Real");
    mapper.GetPageStyles().insertStyleByName(name, actual);
    name.dispose();
    vi.spyOn(actual, "setPropertyValues").mockImplementationOnce(
      /** Emits a real application failure. @returns Never. */ () =>
        invalid("Native application failure"),
    );
    section["ApplyProperties_"](actual);
    vi.spyOn(actual, "setPropertyValues").mockImplementationOnce(
      /** Host application failure is not a UNO exception. @returns Never. */ () => {
        throw Error("host apply");
      },
    );
    expect(
      /** Keeps non-UNO failure. @returns Nothing. */ () => section["ApplyProperties_"](actual),
    ).toThrow("host apply");
  } finally {
    section.dispose();
    mapper.dispose();
    model.dispose();
    doc.Dispose();
  }
});

it("uses original Any get failure diagnostics for incompatible required widths", /** The shared actual Any owns extraction and error values. @returns Nothing. */ () => {
  const section = new SectionPropertyMap(true),
    wrong = new Any(true);
  try {
    section.Insert(P.PROP_WIDTH, wrong);
    try {
      section.GetPageWidth();
      throw Error("Expected native failure");
    } catch (error) {
      expect(error).toBeInstanceOf(RuntimeException);
      if (!(error instanceof RuntimeException)) throw error;
      expect(text(error.Message)).toContain("long");
      error.dispose();
    }
    section.Erase(P.PROP_WIDTH);
    expect(
      /** Missing required native width violates the source precondition. @returns Never. */ () =>
        section.GetPageWidth(),
    ).toThrow("absent");
  } finally {
    wrong.dispose();
    section.dispose();
  }
});

it("keeps typed and generic page-style factories on the same descriptor graph and enforces typed family/model preconditions", /** Uses native family/descriptor APIs and source model lifetime checks. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    model = new SwXTextDocument(doc),
    families = model.getStyleFamilies(),
    pageName = unicode("Typed page"),
    service = unicode("com.sun.star.style.PageStyle"),
    standard = unicode("Standard"),
    para = unicode("ParagraphStyles");
  try {
    const descriptor = model.createInstance(service);
    expect(descriptor).toBeInstanceOf(SwXPageStyle);
    if (!(descriptor instanceof SwXPageStyle)) throw Error("Expected page descriptor");
    families.GetPageStyles().insertStyleByName(pageName, descriptor);
    const actual = families.GetPageStyles().getPageStyleByName(pageName),
      ordinary = families.GetPageStyles().getByName(pageName);
    expect(actual).toBeInstanceOf(SwXPageStyle);
    expect(ordinary).toBeInstanceOf(SwXPageStyle);
    const width = unicode("Width"),
      changed = new Any([23000], "sal_Int32");
    try {
      actual.setPropertyValue(width, changed);
      const read = ordinary.getPropertyValue(width);
      expect(Math.abs(read.get("sal_Int32") - 23000)).toBeLessThanOrEqual(1);
      read.dispose();
    } finally {
      width.dispose();
      changed.dispose();
    }
    expect(
      /** Original typed-family assertion is a host precondition. @returns Never. */ () =>
        families.getByName(para).getPageStyleByName(standard),
    ).toThrow("Expected native page style family");
    model.dispose();
    try {
      model.createPageStyle();
      throw Error("Expected lifetime failure");
    } catch (error) {
      expect(error).toBeInstanceOf(RuntimeException);
      if (!(error instanceof RuntimeException)) throw error;
      error.dispose();
    }
  } finally {
    pageName.dispose();
    service.dispose();
    standard.dispose();
    para.dispose();
    model.dispose();
    doc.Dispose();
  }
});

it("retains actual native page-layout type rejection before and after descriptor attachment", /** Covers the same typed property contract on both native descriptor states. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    model = new SwXTextDocument(doc),
    style = model.createPageStyle(),
    name = unicode("Layout rejection"),
    key = unicode("PageStyleLayout"),
    invalidValue = new Any(true);
  try {
    for (const attach of [false, true]) {
      if (attach) model.getStyleFamilies().GetPageStyles().insertStyleByName(name, style);
      let rejected = false;
      try {
        style.setPropertyValue(key, invalidValue);
      } catch (error) {
        rejected = true;
        if (!(error instanceof Exception)) throw error;
        expect(text(error.Message)).toBe("Invalid page style layout");
        error.dispose();
      }
      expect(rejected).toBe(true);
    }
  } finally {
    name.dispose();
    key.dispose();
    invalidValue.dispose();
    style.dispose();
    model.dispose();
    doc.Dispose();
  }
});

import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";
