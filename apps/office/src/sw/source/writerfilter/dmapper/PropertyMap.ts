/** @fileoverview Ports consumed native PropertyMap/PropValue ordering, merge/default/cache and four interop grab-bag contracts; actual Any/PropertyValue/Sequence owners retain native value semantics. */
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { Paper } from "../../../../i18nutil/inc/paper";
import { PaperInfo } from "../../../../i18nutil/source/utility/paper";
import { TextGridMode } from "../../../../offapi/com/sun/star/text/TextGridMode";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import type { SwXTextRange } from "../../core/unocore/unoobj2";
import { NS_ooxml } from "../inc/ooxml/resourceids";
import {
  PageStyleLayout,
  cppu_detail_getUnoType_PageStyleLayout,
} from "../../../../offapi/com/sun/star/style/PageStyleLayout";
import type { SwXPageStyle } from "../../core/unocore/unostyle";
import type { DomainMapper_Impl } from "./DomainMapper_Impl";
import { text } from "../../core/unocore/unocrsrhelper";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { rtl_uString } from "../../../../sal/inc/rtl/ustring.h";
import { PropertyIds as P, getPropertyName } from "./PropertyIds";

/** Original discriminant order. */
export enum GrabBagType {
  NO_GRAB_BAG = 0,
  ROW_GRAB_BAG = 1,
  CELL_GRAB_BAG = 2,
  PARA_GRAB_BAG = 3,
  CHAR_GRAB_BAG = 4,
}
/** Existing compiler-erased Sequence<PropertyValue> specialization, using the same native logical stride as the generated struct. */
const PropertyValues = Sequence.specialize<PropertyValue>(cppu_detail_getUnoType_PropertyValue, 48);
const propertySequenceType = ["Sequence", cppu_detail_getUnoType_PropertyValue] as const;

/** Original RedlineParams member owner; native token is uninitialized until its importing producer assigns it. */
export class RedlineParams {
  readonly m_sAuthor = new OUString();
  readonly m_sDate = new OUString();
  m_nToken!: number;
  readonly m_aRevertProperties = new PropertyValues();
  /** Original Unicode and sequence member destruction. @returns Nothing. */
  dispose(): void {
    this.m_sAuthor.dispose();
    this.m_sDate.dispose();
    this.m_aRevertProperties.dispose();
  }
}

/** Native Unicode binding for literal grab-bag names. @param value - Text. @returns Owned string. */
function unicode(value: string): OUString {
  return new OUString(
    Uint16Array.from(
      value.split(""),
      /** Reads a UTF16 unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
    ),
    value.length,
  );
}
/** Releases generated values when their original native vector goes out of scope. @param values - Owned values. @returns Nothing. */
function release(values: readonly PropertyValue[]): void {
  for (const value of values) {
    value.Name.dispose();
    value.Value.dispose();
  }
}
/** Copies one original sequence element's generated fields, without a second serialized representation. @param sequence - Actual sequence. @param index - Element index. @returns Value copy. */
function propertyAt(sequence: Sequence<PropertyValue>, index: number): PropertyValue {
  const address = sequence.operatorIndex(index) as unknown as { get(offset: number): unknown };
  const name = new OUString((address.get(0) as [rtl_uString])[0]),
    value = new Any(address.get(16) as Any);
  try {
    return new PropertyValue(
      name,
      (address.get(8) as [number])[0],
      value,
      (address.get(40) as [PropertyState])[0],
    );
  } finally {
    name.dispose();
    value.dispose();
  }
}
/** Original comphelper::makePropertyValue result uses handle zero and DIRECT_VALUE. @param id - Native property ID. @param value - Native value. @returns Value copy. */
function makeProperty(id: P, value: Any): PropertyValue {
  return new PropertyValue(getPropertyName(id), 0, value, PropertyState.DIRECT_VALUE);
}

/** Original map value owns an Any copy and the source grab/default flags. */
export class PropValue {
  private readonly value: Any;
  /** Original default/member constructors. @param value - Optional native value. @param grab - Grab-bag identity. @param docDefault - Default marker. @returns Value. */
  constructor(
    value?: Any,
    private readonly grab = GrabBagType.NO_GRAB_BAG,
    private readonly docDefault = false,
  ) {
    this.value = value ? new Any(value) : new Any();
  }
  /** Borrows the original stored Any. @returns Value. */ getValue(): Any {
    return this.value;
  }
  /** Original flag. @returns Grab-bag type. */ getGrabBagType(): GrabBagType {
    return this.grab;
  }
  /** Original flag. @returns Whether document default. */ getIsDocDefault(): boolean {
    return this.docDefault;
  }
  /** Native value destructor bound to the host filter lifetime. @returns Nothing. */ dispose(): void {
    this.value.dispose();
  }
}

/** Native map orders numeric property IDs, prioritizes style/numbering properties and retains its original nonempty result cache. */
export class PropertyMap {
  private readonly values: PropertyValue[] = [];
  private readonly map = new Map<P, PropValue>();
  /** Native cache invalidation releases original generated values. @returns Nothing. */
  protected Invalidate(): void {
    release(this.values);
    this.values.length = 0;
  }
  /** Native Insert deliberately drops docDefault on its overwrite branch. @param id - Property ID. @param value - Typed value. @param overwrite - Replacement mode. @param grab - Grab type. @param docDefault - Source default marker. @returns Nothing. */
  Insert(
    id: P,
    value: Any,
    overwrite = true,
    grab = GrabBagType.NO_GRAB_BAG,
    docDefault = false,
  ): void {
    if (overwrite || !this.map.has(id)) {
      const next = new PropValue(value, grab, overwrite ? false : docDefault);
      this.map.get(id)?.dispose();
      this.map.set(id, next);
    }
    this.Invalidate();
  }
  /** Original safe erase always invalidates cached values. @param id - ID. @returns Nothing. */
  Erase(id: P): void {
    this.map.get(id)?.dispose();
    this.map.delete(id);
    this.Invalidate();
  }
  /** Original optional pair contains an Any value copy. @param id - ID. @returns Pair or undefined. */
  getProperty(id: P): readonly [P, Any] | undefined {
    const entry = this.map.get(id);
    return entry ? [id, new Any(entry.getValue())] : undefined;
  }
  /** Original presence predicate. @param id - ID. @returns Presence. */ isSet(id: P): boolean {
    return this.map.has(id);
  }
  /** Original missing-is-false predicate. @param id - ID. @returns Flag. */ isDocDefault(
    id: P,
  ): boolean {
    return this.map.get(id)?.getIsDocDefault() ?? false;
  }
  /** Original ordered map keys. @returns IDs. */
  GetPropertyIds(): P[] {
    return [...this.map.keys()].sort(
      /** Orders the original numeric enum keys. @param a - ID. @param b - ID. @returns Ordering. */ (
        a,
        b,
      ) => a - b,
    );
  }
  /** Original merge marks newly inherited values as defaults only in non-overwrite mode. @param source - Map or null. @param overwrite - Replacement mode. @returns Nothing. */
  InsertProps(source: PropertyMap | null, overwrite = true): void {
    if (source === null) return;
    for (const id of source.GetPropertyIds()) {
      const value = source.map.get(id) as PropValue;
      if (overwrite || !this.map.has(id)) {
        const next =
          !overwrite && !value.getIsDocDefault()
            ? new PropValue(value.getValue(), value.getGrabBagType(), true)
            : new PropValue(value.getValue(), value.getGrabBagType(), value.getIsDocDefault());
        this.map.get(id)?.dispose();
        this.map.set(id, next);
      }
    }
    this.insertTableProperties(source, overwrite);
    this.Invalidate();
  }
  /** Original base hook is inert; table-aware derived maps can override it. @param source - Source. @param overwrite - Replacement mode. @returns Nothing. */
  insertTableProperties(source: PropertyMap, overwrite = true): void {
    void source;
    void overwrite;
  }
  /** Original GetPropertyValues preserves style-first order and grab-bag sequence contents, including its cache's first-call behavior. @param charGrabBag - Whether to publish character grab bags when recomputing. @returns Borrowed cached vector. */
  GetPropertyValues(charGrabBag = true): readonly PropertyValue[] {
    if (this.values.length !== 0 || this.map.size === 0) return this.values;
    const counts = new Map<GrabBagType, number>([
      [GrabBagType.CHAR_GRAB_BAG, 0],
      [GrabBagType.PARA_GRAB_BAG, 0],
      [GrabBagType.CELL_GRAB_BAG, 0],
      [GrabBagType.ROW_GRAB_BAG, 0],
    ]);
    const ids = this.GetPropertyIds();
    for (const id of ids) {
      const value = this.map.get(id) as PropValue,
        grab = value.getGrabBagType();
      if (
        grab === GrabBagType.CHAR_GRAB_BAG ||
        grab === GrabBagType.PARA_GRAB_BAG ||
        grab === GrabBagType.CELL_GRAB_BAG
      )
        counts.set(grab, (counts.get(grab) as number) + 1);
      else if (id === P.PROP_CELL_INTEROP_GRAB_BAG) {
        const sequence = new PropertyValues();
        try {
          value.getValue().extract(sequence.getAddress(), propertySequenceType);
          counts.set(
            GrabBagType.CELL_GRAB_BAG,
            (counts.get(GrabBagType.CELL_GRAB_BAG) as number) + sequence.getLength(),
          );
        } finally {
          sequence.dispose();
        }
      } else if (grab === GrabBagType.ROW_GRAB_BAG)
        counts.set(grab, (counts.get(grab) as number) + 1);
    }
    for (const id of [P.PROP_PARA_STYLE_NAME, P.PROP_CHAR_STYLE_NAME, P.PROP_NUMBERING_RULES]) {
      const value = this.map.get(id);
      if (value) this.values.push(makeProperty(id, value.getValue()));
    }
    const bags = new Map<GrabBagType, PropertyValue[]>();
    const positions = new Map<GrabBagType, number>();
    for (const [grab, count] of counts) {
      const values: PropertyValue[] = [];
      for (let i = 0; i < count; ++i) values.push(new PropertyValue());
      bags.set(grab, values);
      positions.set(grab, 0);
    }
    const append =
      /** Assigns the next native grab-bag slot. @param grab - Bag. @param property - Owned value copied into the slot. @returns Nothing. */ (
        grab: GrabBagType,
        property: PropertyValue,
      ): void => {
        const index = positions.get(grab) as number,
          values = bags.get(grab) as PropertyValue[];
        release([values[index] as PropertyValue]);
        values[index] = property;
        positions.set(grab, index + 1);
      };
    try {
      for (const id of ids) {
        if (
          id === P.PROP_PARA_STYLE_NAME ||
          id === P.PROP_CHAR_STYLE_NAME ||
          id === P.PROP_NUMBERING_RULES
        )
          continue;
        const value = this.map.get(id) as PropValue,
          grab = value.getGrabBagType();
        if (grab === GrabBagType.CHAR_GRAB_BAG) {
          if (charGrabBag) append(grab, makeProperty(id, value.getValue()));
        } else if (
          grab === GrabBagType.PARA_GRAB_BAG ||
          grab === GrabBagType.CELL_GRAB_BAG ||
          grab === GrabBagType.ROW_GRAB_BAG
        )
          append(grab, makeProperty(id, value.getValue()));
        else if (id === P.PROP_CELL_INTEROP_GRAB_BAG) {
          const sequence = new PropertyValues();
          try {
            value.getValue().extract(sequence.getAddress(), propertySequenceType);
            for (let i = 0; i < sequence.getLength(); ++i)
              append(GrabBagType.CELL_GRAB_BAG, propertyAt(sequence, i));
          } finally {
            sequence.dispose();
          }
        } else this.values.push(makeProperty(id, value.getValue()));
      }
      for (const [grab, name] of [
        [GrabBagType.CHAR_GRAB_BAG, "CharInteropGrabBag"],
        [GrabBagType.PARA_GRAB_BAG, "ParaInteropGrabBag"],
        [GrabBagType.CELL_GRAB_BAG, "CellInteropGrabBag"],
        [GrabBagType.ROW_GRAB_BAG, "RowInteropGrabBag"],
      ] as const) {
        const values = bags.get(grab) as PropertyValue[];
        if (values.length !== 0 && (grab !== GrabBagType.CHAR_GRAB_BAG || charGrabBag)) {
          const sequence = new PropertyValues(
            {
              /** Existing generated struct address binding. @param offset - Native logical offset. @returns Element. */ get: (
                offset,
              ) => values[offset / 48],
            },
            values.length,
          );
          const key = unicode(name),
            value = new Any(sequence.getAddress(), propertySequenceType);
          try {
            this.values.push(new PropertyValue(key, 0, value, PropertyState.DIRECT_VALUE));
          } finally {
            key.dispose();
            value.dispose();
            sequence.dispose();
          }
        }
      }
    } finally {
      for (const values of bags.values()) release(values);
    }
    return this.values;
  }
  /** Native map/vector destructor bound explicitly to the host filter lifetime. @returns Nothing. */
  dispose(): void {
    this.Invalidate();
    for (const value of this.map.values()) value.dispose();
    this.map.clear();
  }
}

/** Native section property owner. The current admission supplies page defaults, actual style attachment and property application; section finalization is ported on this same owner. */
export class SectionPropertyMap extends PropertyMap {
  private readonly m_sPageStyleName = new OUString();
  private m_aPageStyle: SwXPageStyle | null = null;
  /** Original consumed constructor defaults use Letter independently of the browser document locale. @param m_bIsFirstSection - Original first-section flag. @returns Section map. */
  constructor(private readonly m_bIsFirstSection: boolean) {
    super();
    const letter = new PaperInfo(Paper.PAPER_LETTER),
      margin = Number(convert(1n, Length.in, Length.mm100));
    for (const [id, value] of [
      [P.PROP_HEIGHT, letter.getHeight()],
      [P.PROP_WIDTH, letter.getWidth()],
      [P.PROP_LEFT_MARGIN, margin],
      [P.PROP_RIGHT_MARGIN, margin],
      [P.PROP_TOP_MARGIN, margin],
      [P.PROP_BOTTOM_MARGIN, margin],
    ] as const) {
      const any = new Any([value], "sal_Int32");
      try {
        this.Insert(id, any);
      } finally {
        any.dispose();
      }
    }
    const layout = new Any([PageStyleLayout.ALL], cppu_detail_getUnoType_PageStyleLayout),
      mode = new Any([TextGridMode.NONE], "sal_Int16"),
      no = new Any(false);
    try {
      this.Insert(P.PROP_PAGE_STYLE_LAYOUT, layout);
      this.Insert(P.PROP_GRID_DISPLAY, no);
      this.Insert(P.PROP_GRID_PRINT, no);
      this.Insert(P.PROP_GRID_MODE, mode);
    } finally {
      layout.dispose();
      mode.dispose();
      no.dispose();
    }
    if (m_bIsFirstSection) this.m_sPageStyleName.assign(getPropertyName(P.PROP_STANDARD));
  }
  /** Original first-section predicate. @returns Flag. */
  IsFirstSection(): boolean {
    return this.m_bIsFirstSection;
  }
  /** Original borrowed page-style name; empty means not yet imported. @returns Name. */
  GetPageStyleName(): OUStringConstReference {
    return this.m_sPageStyleName;
  }
  /** Original required width property extraction. @returns Width in mm100. */
  GetPageWidth(): number {
    const property = this.getProperty(P.PROP_WIDTH);
    if (!property) throw new Error("Section page width is absent.");
    try {
      return property[1].get("sal_Int32");
    } finally {
      property[1].dispose();
    }
  }
  /** Original typed page style lookup/creation caches its actual native wrapper; UNO failures return null. @param mapper - Original mapper state. @returns Native page-style wrapper or null. */
  GetPageStyle(mapper: DomainMapper_Impl): SwXPageStyle | null {
    const styles = mapper.GetPageStyles();
    try {
      if (this.m_sPageStyleName.getLength() === 0) {
        const name = mapper.GetUnusedPageStyleName();
        try {
          this.m_sPageStyleName.assign(name);
        } finally {
          name.dispose();
        }
        this.m_aPageStyle = mapper.GetTextDocument().createPageStyle();
        styles.insertStyleByName(this.m_sPageStyleName, this.m_aPageStyle);
      } else if (!this.m_aPageStyle)
        this.m_aPageStyle = styles.getPageStyleByName(this.m_sPageStyleName);
      return this.m_aPageStyle;
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
      return null;
    }
  }
  /** Original property application unwraps character and paragraph bags after ordinary properties, omitting section-only protection. Protected access is the compiler-erased native helper boundary. @param style - Actual page style or null. @returns Nothing. */
  protected ApplyProperties_(style: SwXPageStyle | null): void {
    if (!style) return;
    const properties = this.GetPropertyValues(),
      names: OUString[] = [],
      values: Any[] = [],
      extracted: PropertyValue[] = [];
    try {
      for (const property of properties) {
        const name = text(property.Name);
        if (
          name !== "CharInteropGrabBag" &&
          name !== "ParaInteropGrabBag" &&
          name !== "IsProtected"
        ) {
          names.push(property.Name);
          values.push(property.Value);
        }
      }
      for (const name of ["CharInteropGrabBag", "ParaInteropGrabBag"]) {
        const property = properties.find(
          /** Finds the first original named bag. @param entry - Generated property. @returns Match. */ (
            entry,
          ) => text(entry.Name) === name,
        );
        if (!property) continue;
        const sequence = new PropertyValues();
        try {
          property.Value.extract(sequence.getAddress(), propertySequenceType);
          for (let index = 0; index < sequence.getLength(); ++index) {
            const value = propertyAt(sequence, index);
            extracted.push(value);
            names.push(value.Name);
            values.push(value.Value);
          }
        } finally {
          sequence.dispose();
        }
      }
      try {
        style.setPropertyValues(names, values);
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        error.dispose();
      }
    } finally {
      release(extracted);
    }
  }
  /** Releases native property/name owners at the actual filter lifetime boundary. @returns Nothing. */
  override dispose(): void {
    super.dispose();
    this.m_sPageStyleName.dispose();
  }
}

/** Original paragraph frame/list fields; range interfaces retain the actual Writer range identities. */
export class ParagraphProperties {
  private m_bFrameMode = false;
  private m_nDropCap: number = NS_ooxml.LN_Value_doc_ST_DropCap_none;
  private m_nLines = 0;
  private m_w = -1;
  private m_h = -1;
  private m_nWrap = WrapTextMode.MAKE_FIXED_SIZE;
  private m_hAnchor = -1;
  private m_vAnchor = -1;
  private m_x = -1;
  private m_bxValid = false;
  private m_y = -1;
  private m_byValid = false;
  private m_hSpace = -1;
  private m_vSpace = -1;
  private m_hRule = -1;
  private m_xAlign = -1;
  private m_yAlign = -1;
  private m_nDropCapLength = 0;
  private readonly m_sParaStyleName = new OUString();
  private readonly m_sParaId = new OUString();
  private m_xStartingRange: SwXTextRange | null = null;
  private m_xEndingRange: SwXTextRange | null = null;
  private m_nListId = -1;
  /** Original default and implicit copy forms, with native string value copies and shared interface identities. @param source - Optional original fields. @returns Owner. */
  constructor(source?: Readonly<ParagraphProperties>) {
    if (source) this.assign(source);
  }
  /** Original defaulted member assignment, including independent x/y validity bits. @param source - Original fields. @returns This owner. */
  assign(source: Readonly<ParagraphProperties>): this {
    this.m_bFrameMode = source.IsFrameMode();
    this.m_nDropCap = source.GetDropCap();
    this.m_nLines = source.GetLines();
    this.m_w = source.Getw();
    this.m_h = source.Geth();
    this.m_nWrap = source.GetWrap();
    this.m_hAnchor = source.GethAnchor();
    this.m_vAnchor = source.GetvAnchor();
    this.m_x = source.Getx();
    this.m_bxValid = source.IsxValid();
    this.m_y = source.Gety();
    this.m_byValid = source.IsyValid();
    this.m_hSpace = source.GethSpace();
    this.m_vSpace = source.GetvSpace();
    this.m_hRule = source.GethRule();
    this.m_xAlign = source.GetxAlign();
    this.m_yAlign = source.GetyAlign();
    this.m_nDropCapLength = source.GetDropCapLength();
    this.m_sParaStyleName.assign(source.GetParaStyleName());
    this.m_sParaId.assign(source.GetParaId());
    this.m_xStartingRange = source.GetStartingRange();
    this.m_xEndingRange = source.GetEndingRange();
    this.m_nListId = source.GetListId();
    return this;
  }
  /** Original list identity. @returns Signed32 list ID. */
  GetListId(): number {
    return this.m_nListId;
  }
  /** Original signed32 assignment. @param value - List ID. @returns Nothing. */
  SetListId(value: number): void {
    this.m_nListId = value | 0;
  }
  /** Original frame-mode state. @returns Frame mode. */
  IsFrameMode(): boolean {
    return this.m_bFrameMode;
  }
  /** Original default-true setter. @param value - New flag. @returns Nothing. */
  SetFrameMode(value = true): void {
    this.m_bFrameMode = value;
  }
  /** Original drop-cap token. @returns Native ID. */
  GetDropCap(): number {
    return this.m_nDropCap;
  }
  /** Original signed32 token storage. @param value - Native ID. @returns Nothing. */
  SetDropCap(value: number): void {
    this.m_nDropCap = value | 0;
  }
  /** Original line count. @returns Count. */
  GetLines(): number {
    return this.m_nLines;
  }
  /** Original signed32 line assignment. @param value - Count. @returns Nothing. */
  SetLines(value: number): void {
    this.m_nLines = value | 0;
  }
  /** Original width field. @returns Width. */
  Getw(): number {
    return this.m_w;
  }
  /** Original signed32 width assignment. @param value - Width. @returns Nothing. */
  Setw(value: number): void {
    this.m_w = value | 0;
  }
  /** Original height field. @returns Height. */
  Geth(): number {
    return this.m_h;
  }
  /** Original signed32 height assignment. @param value - Height. @returns Nothing. */
  Seth(value: number): void {
    this.m_h = value | 0;
  }
  /** Original wrap enum, including its uninitialized sentinel. @returns Mode. */
  GetWrap(): WrapTextMode {
    return this.m_nWrap;
  }
  /** Original enum assignment without mode validation. @param value - Mode. @returns Nothing. */
  SetWrap(value: WrapTextMode): void {
    this.m_nWrap = value;
  }
  /** Original horizontal anchor. @returns Anchor. */
  GethAnchor(): number {
    return this.m_hAnchor;
  }
  /** Original signed32 anchor assignment. @param value - Anchor. @returns Nothing. */
  SethAnchor(value: number): void {
    this.m_hAnchor = value | 0;
  }
  /** Original vertical anchor. @returns Anchor. */
  GetvAnchor(): number {
    return this.m_vAnchor;
  }
  /** Original signed32 anchor assignment. @param value - Anchor. @returns Nothing. */
  SetvAnchor(value: number): void {
    this.m_vAnchor = value | 0;
  }
  /** Original horizontal coordinate. @returns Coordinate. */
  Getx(): number {
    return this.m_x;
  }
  /** Original coordinate assignment marks x valid even for-1. @param value - Coordinate. @returns Nothing. */
  Setx(value: number): void {
    this.m_x = value | 0;
    this.m_bxValid = true;
  }
  /** Original x validity. @returns Whether explicitly assigned. */
  IsxValid(): boolean {
    return this.m_bxValid;
  }
  /** Original vertical coordinate. @returns Coordinate. */
  Gety(): number {
    return this.m_y;
  }
  /** Original coordinate assignment marks y valid even for-1. @param value - Coordinate. @returns Nothing. */
  Sety(value: number): void {
    this.m_y = value | 0;
    this.m_byValid = true;
  }
  /** Original y validity. @returns Whether explicitly assigned. */
  IsyValid(): boolean {
    return this.m_byValid;
  }
  /** Original horizontal padding assignment. @param value - Padding. @returns Nothing. */
  SethSpace(value: number): void {
    this.m_hSpace = value | 0;
  }
  /** Original horizontal padding. @returns Padding. */
  GethSpace(): number {
    return this.m_hSpace;
  }
  /** Original vertical padding. @returns Padding. */
  GetvSpace(): number {
    return this.m_vSpace;
  }
  /** Original vertical padding assignment. @param value - Padding. @returns Nothing. */
  SetvSpace(value: number): void {
    this.m_vSpace = value | 0;
  }
  /** Original height-rule field. @returns Rule. */
  GethRule(): number {
    return this.m_hRule;
  }
  /** Original signed32 rule assignment. @param value - Rule. @returns Nothing. */
  SethRule(value: number): void {
    this.m_hRule = value | 0;
  }
  /** Original horizontal alignment field. @returns Alignment. */
  GetxAlign(): number {
    return this.m_xAlign;
  }
  /** Original signed32 alignment assignment. @param value - Alignment. @returns Nothing. */
  SetxAlign(value: number): void {
    this.m_xAlign = value | 0;
  }
  /** Original vertical alignment field. @returns Alignment. */
  GetyAlign(): number {
    return this.m_yAlign;
  }
  /** Original signed32 alignment assignment. @param value - Alignment. @returns Nothing. */
  SetyAlign(value: number): void {
    this.m_yAlign = value | 0;
  }
  /** Original signed8 drop-cap length. @returns Length. */
  GetDropCapLength(): number {
    return this.m_nDropCapLength;
  }
  /** Original signed8 assignment. @param value - Length. @returns Nothing. */
  SetDropCapLength(value: number): void {
    this.m_nDropCapLength = (value << 24) >> 24;
  }
  /** Borrows the original live starting interface. @returns Interface or null. */
  GetStartingRange(): SwXTextRange | null {
    return this.m_xStartingRange;
  }
  /** Retains the actual starting range identity. @param value - Interface or null. @returns Nothing. */
  SetStartingRange(value: SwXTextRange | null): void {
    this.m_xStartingRange = value;
  }
  /** Borrows the original live ending interface. @returns Interface or null. */
  GetEndingRange(): SwXTextRange | null {
    return this.m_xEndingRange;
  }
  /** Retains the actual ending range identity. @param value - Interface or null. @returns Nothing. */
  SetEndingRange(value: SwXTextRange | null): void {
    this.m_xEndingRange = value;
  }
  /** Borrows the native Unicode style-name field. @returns Name. */
  GetParaStyleName(): OUStringConstReference {
    return this.m_sParaStyleName;
  }
  /** Original Unicode value assignment. @param value - Name. @returns Nothing. */
  SetParaStyleName(value: OUStringConstReference): void {
    this.m_sParaStyleName.assign(value);
  }
  /** Borrows the native paragraph ID field. @returns ID. */
  GetParaId(): OUStringConstReference {
    return this.m_sParaId;
  }
  /** Original Unicode value assignment. @param value - ID. @returns Nothing. */
  SetParaId(value: OUStringConstReference): void {
    this.m_sParaId.assign(value);
  }
  /** Original frame reset deliberately retains list ID, names and both ranges. @returns Nothing. */
  ResetFrameProperties(): void {
    this.m_bFrameMode = false;
    this.m_nDropCap = NS_ooxml.LN_Value_doc_ST_DropCap_none;
    this.m_nLines = 0;
    this.m_w = -1;
    this.m_h = -1;
    this.m_nWrap = WrapTextMode.MAKE_FIXED_SIZE;
    this.m_hAnchor = -1;
    this.m_vAnchor = -1;
    this.m_x = -1;
    this.m_bxValid = false;
    this.m_y = -1;
    this.m_byValid = false;
    this.m_hSpace = -1;
    this.m_vSpace = -1;
    this.m_hRule = -1;
    this.m_xAlign = -1;
    this.m_yAlign = -1;
    this.m_nDropCapLength = 0;
  }
  /** Releases owned Unicode values and retained host interface references at native member destruction. @returns Nothing. */
  dispose(): void {
    this.m_sParaStyleName.dispose();
    this.m_sParaId.dispose();
    this.m_xStartingRange = null;
    this.m_xEndingRange = null;
  }
}

/** Original base embeds one paragraph-state component rather than copying it into ordinary property values. */
export class ParagraphPropertiesPropertyMap extends PropertyMap {
  private readonly m_props = new ParagraphProperties();
  /** Borrows the original embedded paragraph component. @returns Stable state owner. */
  props(): ParagraphProperties {
    return this.m_props;
  }
  /** Native member destruction precedes base-map value destruction. @returns Nothing. */
  override dispose(): void {
    this.m_props.dispose();
    super.dispose();
  }
}
/** Original paragraph-context dynamic type. */
export class ParagraphPropertyMap extends ParagraphPropertiesPropertyMap {}
/** Original Word outline boundary constants; the setter has only the native upper-bound guard. */
export const WW_OUTLINE_MAX = 9,
  WW_OUTLINE_MIN = 0;
/** Original stylesheet map owns signed16 list and outline levels independently of paragraph state. */
export class StyleSheetPropertyMap extends ParagraphPropertiesPropertyMap {
  private mnListLevel = -1;
  private mnOutlineLevel = -1;
  /** Original list level. @returns Signed16 value. */
  GetListLevel(): number {
    return this.mnListLevel;
  }
  /** Original signed16 assignment without range validation. @param value - Level. @returns Nothing. */
  SetListLevel(value: number): void {
    this.mnListLevel = (value << 16) >> 16;
  }
  /** Original outline level. @returns Signed16 value. */
  GetOutlineLevel(): number {
    return this.mnOutlineLevel;
  }
  /** Original upper-only guard preserves negative values. @param value - Level. @returns Nothing. */
  SetOutlineLevel(value: number): void {
    const level = (value << 16) >> 16;
    if (level <= WW_OUTLINE_MAX) this.mnOutlineLevel = level;
  }
}
/** Original table-property side-channel enum; its MAX sentinel is not a valid array slot. */
export enum TablePropertyMapTarget {
  TablePropertyMapTarget_START = 0,
  // eslint-disable-next-line @typescript-eslint/prefer-literal-enum-member -- Original native alias shares the first array slot with the START enumerator.
  CELL_MAR_LEFT = TablePropertyMapTarget_START,
  CELL_MAR_RIGHT,
  CELL_MAR_TOP,
  CELL_MAR_BOTTOM,
  TABLE_WIDTH,
  TABLE_WIDTH_TYPE,
  LEFT_MARGIN,
  HORI_ORIENT,
  TablePropertyMapTarget_MAX,
}
/** Original ValidValue fields, independently default constructed for each native slot. */
interface ValidValue {
  nValue: number;
  bValid: boolean;
}
/** Original table map retains valid zeroes and merges its side-channel even when the ordinary property map is empty. */
export class TablePropertyMap extends PropertyMap {
  private readonly m_aValidValues = Array.from(
    { length: TablePropertyMapTarget.TablePropertyMapTarget_MAX },
    /** Original ValidValue zero/false defaults. @returns Independent slot. */ (): ValidValue => ({
      nValue: 0,
      bValid: false,
    }),
  );
  /** Original upper-bound/validity query leaves the output unchanged on failure. Native enum producers are nonnegative. @param which - Original enum target. @param fill - Signed32 output reference. @returns Whether set. */
  getValue(which: TablePropertyMapTarget, fill: [number]): boolean {
    if (which < TablePropertyMapTarget.TablePropertyMapTarget_MAX) {
      const slot = this.m_aValidValues[which] as ValidValue;
      if (slot.bValid) fill[0] = slot.nValue;
      return slot.bValid;
    }
    return false;
  }
  /** Original upper-bound setter records even a zero value as valid. @param which - Native target. @param value - Signed32 field. @returns Nothing. */
  setValue(which: TablePropertyMapTarget, value: number): void {
    if (which < TablePropertyMapTarget.TablePropertyMapTarget_MAX) {
      const slot = this.m_aValidValues[which] as ValidValue;
      slot.bValid = true;
      slot.nValue = value | 0;
    }
  }
  /** Original dynamic-type filter and per-slot overwrite policy. @param source - Original map or null. @param overwrite - Replacement flag. @returns Nothing. */
  override insertTableProperties(source: PropertyMap | null, overwrite = true): void {
    if (source instanceof TablePropertyMap) {
      for (
        let target = TablePropertyMapTarget.TablePropertyMapTarget_START;
        target < TablePropertyMapTarget.TablePropertyMapTarget_MAX;
        ++target
      ) {
        const from = source.m_aValidValues[target] as ValidValue,
          to = this.m_aValidValues[target] as ValidValue;
        if (from.bValid && (overwrite || !to.bValid)) {
          to.bValid = true;
          to.nValue = from.nValue;
        }
      }
    }
  }
}
