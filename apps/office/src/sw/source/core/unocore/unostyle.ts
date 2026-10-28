/** @fileoverview Consumed SwXStyleFamilies/SwXStyleFamily/SwXStyle ownership from pinned unostyle.cxx; descriptors attach to the document's existing format owners. */
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import { SfxItemState } from "../../../../svl/source/items/itemset";
import { SwNumRule } from "../doc/number";
import { SwXNumberingRules } from "./unosett";
import { Reference, UNO_QUERY } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { cppu_detail_getUnoType as indexReplaceType } from "../../../../cppu/inc/com/sun/star/container/XIndexReplace";
import {
  WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL,
  getWriterMaterializedParagraphStyleDefinition,
} from "../../../inc/poolfmt";
import type { SwDoc } from "../doc/doc";
import { SwTextFormatColl } from "../doc/fmtcol";
import type { SwPageDesc } from "../layout/pagedesc";
import type { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Any as UnoAny } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "./unocrsrhelper";
import { SwUnoPropertyMap, createPropertySetInfo, type SwUnoPropertyEntry } from "./unomap";
import {
  putItem,
  queryItem,
  stringAny,
  stringValue,
  scalar,
  illegal,
  unknown,
  invalid,
  noSuchElement,
  elementExists,
} from "./unocrsrhelper";
import { getDefaultWriterPageDescriptorValue } from "../layout/pagedesc";
import { toTwips, Length } from "../../../../o3tl/inc/unit_conversion";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
import { SwStyleNameMapper } from "../doc/SwStyleNameMapper";
import { SwUnoPageStylePropertyMap } from "./unomap";
import { UseOnPage } from "../layout/pagedesc";
import { SvxPageItem, SvxPageUsage } from "../../../../svx/inc/pageitem";
import { MID_PAGE_LAYOUT } from "../../../../svx/inc/unomid";
import { cppu_detail_getUnoType_PageStyleLayout as pageLayoutType } from "../../../../offapi/com/sun/star/style/PageStyleLayout";
/** Represented native style families over actual document formats; frame/table/conditional family suppliers remain unported. */
export type SwStyleFamily =
  "CharacterStyles" | "ParagraphStyles" | "PageStyles" | "NumberingStyles";
/** A style descriptor owns pending properties only until insertByName attaches its canonical format. */
export class SwXStyle {
  private pending = new Map<string, Any>();
  private parentName = "";
  private owner: SwTextFormatColl | SwCharFormat | SwPageDesc | SwNumRule | undefined;
  /** Native wrapper destruction releases pending descriptor Any values; the attached document format is borrowed. @returns Nothing. */
  dispose(): void {
    for (const value of this.pending.values()) value.dispose();
    this.pending.clear();
  }
  /** Binds the represented native owner and its declared inputs. @param doc - Canonical document owner. @param family - Original family input. @param owner - Original owner input. @returns Nothing. */
  constructor(
    readonly doc: SwDoc,
    readonly family: SwStyleFamily,
    owner?: SwTextFormatColl | SwCharFormat | SwPageDesc | SwNumRule,
  ) {
    this.owner = owner;
  }
  /** Publishes the supported native property descriptors. @returns The represented native operation result. */
  getPropertySetInfo(): ReturnType<typeof createPropertySetInfo> {
    if (this.family === "CharacterStyles")
      return createPropertySetInfo([], true, SwUnoCharStylePropertyMap);
    if (this.family === "NumberingStyles")
      return createPropertySetInfo([["NumberingRules", ["Reference", indexReplaceType]]], false);
    if (this.family === "PageStyles")
      return createPropertySetInfo(
        [
          ["FollowStyle", "OUString"],
          ["Width", "sal_Int32"],
          ["Height", "sal_Int32"],
          ["LeftMargin", "sal_Int32"],
          ["RightMargin", "sal_Int32"],
          ["TopMargin", "sal_Int32"],
          ["BottomMargin", "sal_Int32"],
          ["IsLandscape", "bool"],
          ["PageStyleLayout", pageLayoutType],
          ...[...SwUnoPageStylePropertyMap].map(
            /** Publishes original grid property types. @param entry - Entry. @returns Descriptor. */ ([
              name,
              entry,
            ]) => [name, entry.type] as const,
          ),
        ],
        false,
      );
    return createPropertySetInfo([["FollowStyle", "OUString"]]);
  }
  /** Reads direct versus inherited native property state. @param name - Native property or element name. @returns The represented native operation result. */
  getPropertyState(name: OUStringConstReference): PropertyState {
    const n = text(name);
    if (!this.getPropertySetInfo().hasPropertyByName(name)) unknown("Unknown property: " + n);
    if (!this.owner)
      return this.pending.has(n) ? PropertyState.DIRECT_VALUE : PropertyState.DEFAULT_VALUE;
    if (this.family === "PageStyles" && SwUnoPageStylePropertyMap.has(n)) {
      const entry = SwUnoPageStylePropertyMap.get(n) as SwUnoPropertyEntry;
      return (this.owner as SwPageDesc)
        .GetMaster()
        .GetAttrSet()
        .GetItemState(entry.which, false) === SfxItemState.SET
        ? PropertyState.DIRECT_VALUE
        : PropertyState.DEFAULT_VALUE;
    }
    if (this.family !== "ParagraphStyles" && this.family !== "CharacterStyles")
      return PropertyState.DIRECT_VALUE;
    if (n === "FollowStyle") return PropertyState.DIRECT_VALUE;
    const entry = SwUnoPropertyMap.get(n) as SwUnoPropertyEntry;
    return (this.owner as SwTextFormatColl | SwCharFormat)
      .GetAttrSet()
      .GetItemState(entry.which, false) === SfxItemState.SET
      ? PropertyState.DIRECT_VALUE
      : PropertyState.DEFAULT_VALUE;
  }
  /** Reads native property states in caller order. @param names - Original names input. @returns The represented native operation result. */
  getPropertyStates(names: readonly OUStringConstReference[]): PropertyState[] {
    return names.map(
      /** Processes one ordered native value at this boundary. @param name - Native property or element name. @returns The represented native operation result. */
      (name) => this.getPropertyState(name),
    );
  }
  /** Removes the supported direct property delta. @param name - Native property or element name. @returns Nothing. */
  setPropertyToDefault(name: OUStringConstReference): void {
    const n = text(name);
    if (!this.getPropertySetInfo().hasPropertyByName(name)) unknown("Unknown property: " + n);
    if (!this.owner) {
      this.pending.get(n)?.dispose();
      this.pending.delete(n);
      return;
    }
    if (this.family === "PageStyles") {
      const entry = SwUnoPageStylePropertyMap.get(n);
      if (entry) {
        (this.owner as SwPageDesc).GetMaster().ResetFormatAttr(entry.which);
        return;
      }
      if (n === "PageStyleLayout") {
        (this.owner as SwPageDesc).SetUseOn(UseOnPage.All);
        return;
      }
      const defaults = getDefaultWriterPageDescriptorValue(this.doc.GetLocale());
      if (n === "FollowStyle") {
        (this.owner as SwPageDesc).SetFollow(null);
        return;
      }
      const field = pageFields[n];
      (this.owner as SwPageDesc).SetValue({
        ...(this.owner as SwPageDesc).GetValue(),
        ...(n === "IsLandscape"
          ? { landscape: defaults.landscape }
          : { [field as keyof typeof defaults]: defaults[field as keyof typeof defaults] }),
      });
      return;
    }
    if (n === "FollowStyle") {
      (this.owner as SwTextFormatColl).SetNextTextFormatColl(this.owner as SwTextFormatColl);
      return;
    }
    const entry = SwUnoPropertyMap.get(n);
    if (!entry) unknown("Unknown property: " + n);
    (this.owner as SwTextFormatColl | SwCharFormat).ResetFormatAttr(entry.which);
  }
  /** Implements the represented native getName operation. @returns The represented native operation result. */
  getName(): OUString {
    return unicode(this.owner ? programmaticStyleName(this.owner) : "");
  }
  /** Renames the actual attached style while retaining its canonical identity. @param name - Native display name. @returns Nothing. */
  setName(name: OUStringConstReference): void {
    if (!this.owner) invalid("Style descriptor is detached");
    if (this.owner instanceof SwNumRule) illegal("Numbering style rename is unrepresented");
    if (this.family === "ParagraphStyles" || this.family === "CharacterStyles")
      (this.owner as SwTextFormatColl | SwCharFormat).SetFormatName(
        this.family === "CharacterStyles"
          ? SwStyleNameMapper.FillUIName(text(name), SwGetPoolIdFromName.ChrFmt)
          : text(name),
      );
    else illegal("Page style rename is unrepresented");
  }
  /** Implements the represented native isUserDefined operation. @returns The represented native operation result. */
  isUserDefined(): boolean {
    if (this.family === "CharacterStyles")
      return (
        this.owner instanceof SwCharFormat &&
        this.owner !== this.doc.GetDfltCharFormat() &&
        !WRITER_CHARACTER_STYLE_POOL.some(
          /** Uses original pool identity rather than a colliding user name. @param entry - Native entry. @returns Pool identity match. */ (
            entry,
          ) => entry.poolId === (this.owner as SwCharFormat).GetPoolFormatId(),
        )
      );
    return (
      this.owner !== undefined &&
      programmaticStyleName(this.owner) !== "Standard" &&
      !WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.some(
        /** Processes one ordered native value at this boundary. @param s - Original s input. @returns The represented native operation result. */
        (s) =>
          s.name ===
          programmaticStyleName(
            this.owner as SwTextFormatColl | SwCharFormat | SwPageDesc | SwNumRule,
          ),
      )
    );
  }
  /** Implements the represented native getParentStyle operation. @returns The represented native operation result. */
  getParentStyle(): OUString {
    if (this.family === "CharacterStyles") {
      if (this.owner === undefined) return unicode(this.parentName);
      const parent = (this.owner as SwCharFormat).DerivedFrom();
      return unicode(
        parent === undefined || parent === this.doc.GetDfltCharFormat()
          ? ""
          : programmaticStyleName(parent as SwCharFormat),
      );
    }
    const parent =
      this.family === "ParagraphStyles"
        ? (this.owner as SwTextFormatColl | undefined)?.DerivedFrom()
        : undefined;
    return unicode(
      this.family === "ParagraphStyles"
        ? parent
          ? programmaticStyleName(parent as SwTextFormatColl)
          : this.parentName
        : "",
    );
  }
  /** Implements the represented native setParentStyle operation. @param name - Native property or element name. @returns Nothing. */
  setParentStyle(name: OUStringConstReference): void {
    const value = text(name);
    if (this.family !== "ParagraphStyles" && this.family !== "CharacterStyles") return;
    if (!this.owner) {
      this.parentName = value;
      return;
    }
    const parent =
      this.family === "CharacterStyles"
        ? value
          ? findCharacterStyle(this.doc, value)
          : this.doc.GetDfltCharFormat()
        : value
          ? findParagraphStyle(this.doc, value)
          : this.doc.GetDfltTextFormatColl();
    if (!parent) illegal("Unknown parent style");
    for (
      let ancestor: import("../attr/format").SwFormat | undefined = parent;
      ancestor;
      ancestor = ancestor.DerivedFrom()
    )
      if (ancestor === this.owner && parent !== this.owner) illegal("Cyclic parent style");
    (this.owner as SwTextFormatColl | SwCharFormat).SetDerivedFrom(
      parent === this.owner ? undefined : parent,
    );
  }
  /** Attaches the descriptor once; its pending state is then released. @param name - Native property or element name. @returns The represented native operation result. */
  Attach(name: string): void {
    if (this.owner) invalid("Style is already attached");
    if (this.family === "CharacterStyles") {
      const parent = this.parentName
        ? findCharacterStyle(this.doc, this.parentName)
        : this.doc.GetDfltCharFormat();
      if (!parent) illegal("Unknown parent style");
      this.owner = this.doc.MakeCharFormat(
        SwStyleNameMapper.FillUIName(name, SwGetPoolIdFromName.ChrFmt),
        parent,
      );
    } else if (this.family === "ParagraphStyles") {
      const parent = this.parentName
        ? findParagraphStyle(this.doc, this.parentName)
        : this.doc.GetDfltTextFormatColl();
      if (!parent) illegal("Unknown parent style");
      this.owner = this.doc.MakeTextFormatColl(name, parent);
    } else if (this.family === "PageStyles") this.owner = this.doc.MakePageDesc(name);
    else {
      const rule = new SwNumRule(name, "label-alignment");
      rule.SetAutoRule(false);
      this.owner = this.doc.AddNumRule(rule);
    }
    if (this.family === "CharacterStyles") {
      const pending = [...this.pending].sort(
        /** Native std::map iterates UTF16 names in lexical order. @param a - First entry. @param b - Second entry. @returns Name order. */ (
          a,
          b,
        ) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0),
      );
      const names = pending.map(
        /** Creates the source argument sequence's string values. @param entry - Native cached property. @returns Owned name. */ (
          entry,
        ) => unicode(entry[0]),
      );
      try {
        this.SetCharacterPropertyValues(
          names,
          pending.map(
            /** Borrows descriptor Any values. @param entry - Original cached entry. @returns Borrowed value. */ (
              entry,
            ) => entry[1],
          ),
        );
      } finally {
        for (const name of names) name.dispose();
        for (const value of this.pending.values()) value.dispose();
        this.pending.clear();
      }
      return;
    }
    for (const [key, value] of this.pending) {
      const n = unicode(key);
      try {
        this.setPropertyValue(n, value);
      } finally {
        n.dispose();
        value.dispose();
      }
    }
    this.pending.clear();
  }
  /** Queries the current native property value. @param name - Native property or element name. @returns The represented native operation result. */
  getPropertyValue(name: OUStringConstReference): Any {
    const n = text(name);
    if (!this.getPropertySetInfo().hasPropertyByName(name)) unknown("Unknown property: " + n);
    if (!this.owner)
      return this.pending.has(n) ? new UnoAny(this.pending.get(n) as Any) : this.defaultValue(n);
    if (n === "NumberingRules" && this.family === "NumberingStyles")
      return new UnoAny(
        [new SwXNumberingRules(new SwNumRule(this.owner as SwNumRule))],
        ["Reference", indexReplaceType],
      );
    if (n === "FollowStyle")
      return stringAny(
        this.family === "ParagraphStyles"
          ? programmaticStyleName((this.owner as SwTextFormatColl).GetNextTextFormatColl())
          : (this.owner as SwPageDesc).GetFollow().GetName(),
      );
    if (this.family === "PageStyles") return this.pageValue(n);
    const entry = SwUnoPropertyMap.get(n);
    if (!entry) unknown("Unknown property: " + n);
    return queryItem(
      (this.owner as SwTextFormatColl | SwCharFormat).GetAttrSet().Get(entry.which),
      entry,
    );
  }
  /** Applies a typed native property without duplicating model state. @param name - Native property or element name. @param value - Declared native value. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    const n = text(name);
    if (!this.getPropertySetInfo().hasPropertyByName(name)) unknown("Unknown property: " + n);
    if (!this.owner) {
      const entry =
        this.family === "PageStyles" ? SwUnoPageStylePropertyMap.get(n) : SwUnoPropertyMap.get(n);
      if (entry && this.family !== "CharacterStyles")
        putItem(this.doc.GetAttrPool().GetUserOrPoolDefaultItem(entry.which), entry, value);
      else if (n === "FollowStyle") stringValue(value);
      else if (n === "IsLandscape") scalar(value, "bool");
      else if (pageFields[n]) scalar(value, "sal_Int32");
      else if (n === "PageStyleLayout") {
        const item = SvxPageItem.CreateDefault();
        if (!item.PutValue(value, MID_PAGE_LAYOUT)) illegal("Invalid page style layout");
      }
      this.pending.get(n)?.dispose();
      this.pending.set(n, new UnoAny(value));
      return;
    }
    if (n === "NumberingRules" && this.family === "NumberingStyles") {
      const reference = new Reference(value, UNO_QUERY, indexReplaceType);
      try {
        const rules = reference.get();
        if (!(rules instanceof SwXNumberingRules)) illegal("Expected native numbering rules");
        for (let level = 0; level < 10; level++)
          (this.owner as SwNumRule).Set(level, rules.GetNumRule().Get(level));
      } finally {
        reference.dispose();
      }
      return;
    }
    if (n === "FollowStyle") {
      const v = stringValue(value);
      if (this.family === "ParagraphStyles") {
        const target = findParagraphStyle(this.doc, v);
        if (!target) illegal("Unknown follow style");
        (this.owner as SwTextFormatColl).SetNextTextFormatColl(target);
      } else {
        const target = this.doc.FindPageDesc(v);
        if (!target) illegal("Unknown page style");
        (this.owner as SwPageDesc).SetFollow(target);
      }
      return;
    }
    if (this.family === "PageStyles") {
      this.setPageValue(n, value);
      return;
    }
    if (this.family === "CharacterStyles") {
      this.SetCharacterPropertyValues([name], [value]);
      return;
    }
    const entry = SwUnoPropertyMap.get(n) as SwUnoPropertyEntry;
    const owner = this.owner as SwTextFormatColl | SwCharFormat;
    owner.SetFormatAttr(putItem(owner.GetAttrSet().Get(entry.which), entry, value));
  }
  /** Original native sequence argument form. @param names - Original name sequence. @param values - Original Any sequence. @returns Nothing. */
  setPropertyValues(names: Sequence<OUString>, values: Sequence<Any>): void;
  /** Existing borrowed array binding for the original span call sites. @param names - Original names. @param values - Original values. @returns Nothing. */
  setPropertyValues(names: readonly OUStringConstReference[], values: readonly Any[]): void;
  /** Applies the ordered native property sequence. @param names - Original names input. @param values - Original values input. @returns Nothing. */
  setPropertyValues(
    names: readonly OUStringConstReference[] | Sequence<OUString>,
    values: readonly Any[] | Sequence<Any>,
  ): void {
    const nameList =
      names instanceof Sequence
        ? Array.from(
            { length: names.getLength() },
            /** Borrows original native sequence elements at their logical byte addresses. @param _unused - Unused array initializer. @param index - Original index. @returns Borrowed string. */ (
              _unused,
              index,
            ) =>
              OUString.unacquired(
                (names.getConstArray() as SequenceElements).get(index * 8) as rtl_uStringSlot,
              ),
          )
        : names;
    const valueList =
      values instanceof Sequence
        ? Array.from(
            { length: values.getLength() },
            /** Copies native Any values from the erased sequence element addresses for this existing typed API boundary. @param _unused - Unused initializer. @param index - Original index. @returns Owned Any copy. */ (
              _unused,
              index,
            ) => new UnoAny((values.getConstArray() as SequenceElements).get(index * 24) as Any),
          )
        : values;
    try {
      if (nameList.length !== valueList.length) illegal("Property name/value count differs");
      if (this.family === "CharacterStyles" && this.owner !== undefined) {
        this.SetCharacterPropertyValues(nameList, valueList);
        return;
      }
      for (let i = 0; i < nameList.length; i++)
        this.setPropertyValue(nameList[i] as OUStringConstReference, valueList[i] as Any);
    } catch (error) {
      if (!(error instanceof UnknownPropertyException)) throw error;
      const target = new UnoAny(error, unknownPropertyType);
      const wrapped = new WrappedTargetException();
      try {
        wrapped.TargetException = target;
      } finally {
        target.dispose();
        error.dispose();
      }
      throw wrapped;
    } finally {
      if (values instanceof Sequence) for (const value of valueList) value.dispose();
    }
  }
  /** Original attached character SetPropertyValues_Impl item-set staging: combine item members before one actual format commit. @param names - Original names. @param values - Original Any values. @returns Nothing. */
  private SetCharacterPropertyValues(
    names: readonly OUStringConstReference[],
    values: readonly Any[],
  ): void {
    const owner = this.owner as SwCharFormat;
    const set = owner.GetAttrSet().Clone();
    try {
      for (let index = 0; index < names.length; ++index) {
        const name = text(names[index] as OUStringConstReference);
        const entry = SwUnoCharStylePropertyMap.get(name);
        if (entry === undefined) unknown("Unknown property: " + name);
        set.Put(putItem(set.Get(entry.which), entry, values[index] as Any));
      }
      owner.SetFormatAttrSet(set);
    } finally {
      set.Dispose();
    }
  }
  /** Implements the represented native defaultValue operation. @param n - Original n input. @returns The represented native operation result. */
  private defaultValue(n: string): Any {
    if (this.family === "PageStyles") return this.pageValue(n);
    const e = SwUnoPropertyMap.get(n);
    if (!e) unknown("Unknown property: " + n);
    return queryItem(this.doc.GetAttrPool().GetUserOrPoolDefaultItem(e.which), e);
  }
  /** Implements the represented native pageValue operation. @param n - Original n input. @returns The represented native operation result. */
  private pageValue(n: string): Any {
    const page = (this.owner as SwPageDesc | undefined) ?? this.doc.GetPageDesc(),
      value = page.GetValue(),
      out = new UnoAny();
    const entry = SwUnoPageStylePropertyMap.get(n);
    if (entry) {
      out.dispose();
      return queryItem(
        this.owner
          ? page.GetMaster().GetAttrSet().Get(entry.which)
          : this.doc.GetAttrPool().GetUserOrPoolDefaultItem(entry.which),
        entry,
      );
    }
    if (n === "PageStyleLayout") {
      const item = SvxPageItem.CreateDefault();
      item.SetPageUsage(page.GetUseOn() as unknown as SvxPageUsage);
      item.QueryValue(out, MID_PAGE_LAYOUT);
      return out;
    }
    if (n === "IsLandscape") out.insert([value.landscape], "bool");
    else {
      const key = pageFields[n];
      if (!key) unknown("Unknown property: " + n);
      out.insert([Number(convertTwipToMm100(BigInt(value[key])))], "sal_Int32");
    }
    return out;
  }
  /** Implements the represented native setPageValue operation. @param n - Original n input. @param v - Original v input. @returns Nothing. */
  private setPageValue(n: string, v: Any): void {
    const page = this.owner as SwPageDesc,
      old = page.GetValue();
    const entry = SwUnoPageStylePropertyMap.get(n);
    if (entry) {
      const item = putItem(page.GetMaster().GetAttrSet().Get(entry.which), entry, v);
      for (const frame of [
        page.GetMaster(),
        page.GetLeft(),
        page.GetFirstMaster(),
        page.GetFirstLeft(),
      ])
        frame.SetFormatAttr(item);
      return;
    }
    if (n === "PageStyleLayout") {
      const item = SvxPageItem.CreateDefault();
      item.SetPageUsage(page.GetUseOn() as unknown as SvxPageUsage);
      if (!item.PutValue(v, MID_PAGE_LAYOUT)) illegal("Invalid page style layout");
      page.SetUseOn(item.GetPageUsage() as unknown as UseOnPage);
      return;
    }
    if (n === "IsLandscape") page.SetValue({ ...old, landscape: scalar(v, "bool") as boolean });
    else {
      const key = pageFields[n] as (typeof pageFields)[string];
      page.SetValue({
        ...old,
        [key]: Number(toTwips(BigInt(scalar(v, "sal_Int32") as number), Length.mm100)),
      });
    }
  }
}
/** Native page-style identity over the existing descriptor/property implementation. */
export class SwXPageStyle extends SwXStyle {
  /** Binds the actual page descriptor or an unattached native descriptor. @param doc - Document. @param owner - Actual page descriptor. @returns Page style. */
  constructor(doc: SwDoc, owner?: SwPageDesc) {
    super(doc, "PageStyles", owner);
  }
}
const pageFields: Record<
  string,
  "width" | "height" | "leftMargin" | "rightMargin" | "topMargin" | "bottomMargin"
> = {
  Width: "width",
  Height: "height",
  LeftMargin: "leftMargin",
  RightMargin: "rightMargin",
  TopMargin: "topMargin",
  BottomMargin: "bottomMargin",
};
/** Resolves the consumed programmatic paragraph-style name through the existing pool before materializing its actual format. @param doc - Owning document. @param name - Programmatic or custom name. @returns Canonical format, when supported. */
function findParagraphStyle(doc: SwDoc, name: string): SwTextFormatColl | undefined {
  const existing = doc.FindTextFormatCollByName(name) ?? doc.FindTextFormatColl(name);
  if (existing) return existing;
  const definition =
    getWriterMaterializedParagraphStyleDefinition(name) ??
    WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.find(
      /** Resolves an original supported pool name. @param style - Native pool entry. @returns Whether matching. */
      (style) => style.name === name || style.id === name,
    );
  return definition && getWriterMaterializedParagraphStyleDefinition(definition.id)
    ? doc.GetTextFormatColl(definition.id)
    : undefined;
}
/** Resolves original character programmatic names on the real document table and lazy pool. @param doc - Actual document. @param name - Programmatic name. @returns Canonical owner. */
function findCharacterStyle(doc: SwDoc, name: string): SwCharFormat | undefined {
  if (name === "Standard") return doc.GetDfltCharFormat();
  const uiName = SwStyleNameMapper.FillUIName(name, SwGetPoolIdFromName.ChrFmt);
  const existing = doc.FindCharFormatByName(uiName);
  if (existing !== undefined) return existing;
  const entry = WRITER_CHARACTER_STYLE_POOL.find(
    /** Finds original pool UI identity. @param value - Native pool entry. @returns Match. */ (
      value,
    ) => value.uiName === uiName,
  );
  return entry === undefined ? undefined : doc.GetCharFormatFromPool(entry.poolId);
}
/** Exposes native pool names at the UNO boundary while retaining custom and page/rule identities. @param owner - Actual style owner. @returns Programmatic name. */
function programmaticStyleName(
  owner: SwTextFormatColl | SwCharFormat | SwPageDesc | SwNumRule,
): string {
  return owner instanceof SwCharFormat
    ? owner === owner.GetAttrSet().GetDoc().GetDfltCharFormat()
      ? "Standard"
      : SwStyleNameMapper.FillProgName(owner.GetName(), SwGetPoolIdFromName.ChrFmt)
    : owner instanceof SwTextFormatColl
      ? SwStyleNameMapper.GetProgName(owner.poolId, owner.GetName())
      : owner.GetName();
}
/** Name access resolves canonical formats afresh, retaining no parallel style catalog. */
export class SwXStyleFamily {
  /** Binds the represented native owner and its declared inputs. @param doc - Canonical document owner. @param family - Original family input. @returns Nothing. */
  constructor(
    private readonly doc: SwDoc,
    readonly family: SwStyleFamily,
  ) {}
  /** Implements the represented native getElementNames operation. @returns The represented native operation result. */
  getElementNames(): string[] {
    if (this.family === "CharacterStyles")
      return [
        ...new Set([
          "Standard",
          ...WRITER_CHARACTER_STYLE_POOL.map(
            /** Publishes the source programmatic pool names. @param entry - Native entry. @returns Programmatic name. */ (
              entry,
            ) => entry.name,
          ),
          ...this.doc
            .GetCharFormats()
            .map(
              /** Reads actual custom owner identity. @param owner - Native format. @returns Programmatic name. */ (
                owner,
              ) => programmaticStyleName(owner),
            ),
        ]),
      ];
    return this.family === "NumberingStyles"
      ? this.doc
          .GetNumRuleTable()
          .filter(
            /** Processes one ordered native value at this boundary. @param r - Original r input. @returns The represented native operation result. */
            (r) => !r.IsAutoRule(),
          )
          .map(
            /** Processes one ordered native value at this boundary. @param r - Original r input. @returns The represented native operation result. */
            (r) => r.GetName(),
          )
      : this.family === "ParagraphStyles"
        ? [
            ...new Set([
              ...WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.filter(
                /** Executes this bounded native operation. @param style - Native operation input. @returns Native operation result. */ (
                  style,
                ) => getWriterMaterializedParagraphStyleDefinition(style.id) !== undefined,
              ).map(
                /** Processes one ordered native value at this boundary. @param s - Original s input. @returns The represented native operation result. */
                (s) => s.name,
              ),
              ...this.doc.GetTextFormatColls().map(
                /** Processes one ordered native value at this boundary. @param s - Original s input. @returns The represented native operation result. */
                (s) => programmaticStyleName(s),
              ),
            ]),
          ]
        : Array.from(
            {
              length: this.doc.GetPageDescCnt(),
            } /** Processes one ordered native value at this boundary. @param _ - Original _ input. @param i - Original i input. @returns The represented native operation result. */,
            (_, i) => this.doc.GetPageDesc(i).GetName(),
          );
  }
  /** Implements the represented native hasByName operation. @param name - Native property or element name. @returns The represented native operation result. */
  hasByName(name: OUStringConstReference): boolean {
    if (this.family === "CharacterStyles") {
      const n = text(name);
      if (n === "Standard") return true;
      const uiName = SwStyleNameMapper.FillUIName(n, SwGetPoolIdFromName.ChrFmt);
      return (
        this.doc.FindCharFormatByName(uiName) !== undefined ||
        WRITER_CHARACTER_STYLE_POOL.some(
          /** Pool lookup includes original unmaterialized built-in styles. @param entry - Native pool entry. @returns UI identity match. */ (
            entry,
          ) => entry.uiName === uiName,
        )
      );
    }
    return this.getElementNames().includes(text(name));
  }
  /** Implements the represented native getByName operation. @param name - Native property or element name. @returns The represented native operation result. */
  getByName(name: OUStringConstReference): SwXStyle {
    const n = text(name),
      owner =
        this.family === "CharacterStyles"
          ? findCharacterStyle(this.doc, n)
          : this.family === "NumberingStyles"
            ? this.doc.FindNumRulePtr(n)
            : this.family === "ParagraphStyles"
              ? findParagraphStyle(this.doc, n)
              : this.doc.FindPageDesc(n);
    if (!owner) noSuchElement();
    return this.family === "PageStyles"
      ? new SwXPageStyle(this.doc, owner as SwPageDesc)
      : new SwXStyle(this.doc, this.family, owner);
  }
  /** Original typed style lookup shares the same actual document family. @param name - Programmatic name. @returns Style wrapper. */
  getStyleByName(name: OUStringConstReference): SwXStyle {
    return this.getByName(name);
  }
  /** Original typed page lookup uses the same native style lookup and requires a page family. @param name - Programmatic name. @returns Actual page-style wrapper. */
  getPageStyleByName(name: OUStringConstReference): SwXPageStyle {
    const style = this.getByName(name);
    if (!(style instanceof SwXPageStyle)) throw new Error("Expected native page style family");
    return style;
  }
  /** Original typed insertion shares the same attachment path as UNO insertByName. @param name - Programmatic name. @param style - Actual descriptor. @returns Nothing. */
  insertStyleByName(name: OUStringConstReference, style: SwXStyle): void {
    this.insertByName(name, style);
  }
  /** Implements the represented native insertByName operation. @param name - Native property or element name. @param style - Original style input. @returns The represented native operation result. */
  insertByName(name: OUStringConstReference, style: SwXStyle): void {
    if (style.doc !== this.doc || style.family !== this.family)
      illegal("Style belongs to another family/document");
    if (this.hasByName(name)) elementExists();
    style.Attach(text(name));
  }
}
/** Document style-family supplier, matching supported canonical families. */
export class SwXStyleFamilies {
  /** Binds the represented native owner and its declared inputs. @param doc - Canonical document owner. @returns Nothing. */
  constructor(private readonly doc: SwDoc) {}
  /** Original typed character-family supplier. @returns Character family. */
  GetCharacterStyles(): SwXStyleFamily {
    return new SwXStyleFamily(this.doc, "CharacterStyles");
  }
  /** Original typed page-family supplier uses the actual document family owner. @returns Page family. */
  GetPageStyles(): SwXStyleFamily {
    return new SwXStyleFamily(this.doc, "PageStyles");
  }
  /** Original page-style factory creates the native descriptor identity. @param doc - Actual document. @returns Unattached page style. */
  static CreateStylePage(doc: SwDoc): SwXPageStyle {
    return new SwXPageStyle(doc);
  }
  /** Implements the represented native getElementNames operation. @returns The represented native operation result. */
  getElementNames(): string[] {
    return ["CharacterStyles", "ParagraphStyles", "PageStyles", "NumberingStyles"];
  }
  /** Implements the represented native hasByName operation. @param name - Native property or element name. @returns The represented native operation result. */
  hasByName(name: OUStringConstReference): boolean {
    return this.getElementNames().includes(text(name));
  }
  /** Implements the represented native getByName operation. @param name - Native property or element name. @returns The represented native operation result. */
  getByName(name: OUStringConstReference): SwXStyleFamily {
    const n = text(name);
    if (
      n !== "CharacterStyles" &&
      n !== "ParagraphStyles" &&
      n !== "PageStyles" &&
      n !== "NumberingStyles"
    )
      noSuchElement();
    return new SwXStyleFamily(this.doc, n);
  }
}

import { SwCharFormat } from "../../../inc/charfmt";
import { WRITER_CHARACTER_STYLE_POOL } from "../../../inc/poolfmt";
import { SwGetPoolIdFromName } from "../../../inc/SwGetPoolIdFromName";
import { SwUnoCharStylePropertyMap } from "./unomap";

import { Sequence, type SequenceElements } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  UnknownPropertyException,
  cppu_detail_getUnoType as unknownPropertyType,
} from "../../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { WrappedTargetException } from "../../../../cppu/inc/com/sun/star/lang/WrappedTargetException";

import type { rtl_uStringSlot } from "../../../../sal/inc/rtl/ustring.h";
