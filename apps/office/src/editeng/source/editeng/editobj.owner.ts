/** @fileoverview Original EditTextObject/Impl value ownership,pool resolution,text/attributes/fields/styles and cache invalidation from editobj.cxx. Layout,formatted cache payloads and diagnostics remain unported. */
import { EditTextObject, ContentInfo, XEditAttribute, XParaPortionList } from "./editobj";
import { FieldUpdater } from "../../inc/fieldupdater";
import { GetAllSections } from "./editobj.sections";
import { TextRotation } from "../../inc/editobj";
import { OutlinerMode } from "../../inc/outliner";
import { EE_PARA_MAX } from "../../inc/EPaM";
import { EECharAttrib } from "../../inc/editdata";
import { EE_FEATURE_FIELD } from "../../inc/eeitem";
import type { Section } from "../../inc/section";
import * as EditEngine from "../../inc/editeng";
import * as EditDoc from "../../inc/editdoc";
import { EditEngineItemPool } from "../../inc/editdoc";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import type { SfxItemSet } from "../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { SfxStyleFamily } from "../../../svl/inc/style-values";
import { SvtScriptType } from "../../../svl/inc/languageoptions";
import { SharedString } from "../../../svl/inc/sharedstring";
import type { SharedStringPool } from "../../../svl/inc/sharedstringpool";
import { SvxFieldItem, type SvxFieldDataConstReference } from "../../inc/flditem";
import * as FieldType from "../../../offapi/com/sun/star/text/textfield/Type";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { rtl_ustr_compare_WithLength } from "../../../sal/inc/rtl/ustring.h";
import { MapUnit } from "../../../tools/inc/mapunit";
import { LineEnd } from "../../../tools/inc/lineend";

/** Original helper finds a concrete EditEngine pool anywhere in the supplied chain;alien pools never stand in for it. @param pool - Actual optional chain. @param metric - Metric for a newly created pool only. @returns Actual concrete pool. */
function getEditEngineItemPool(pool: SfxItemPool | null, metric: MapUnit): SfxItemPool {
  for (let current = pool; current !== null; current = current.GetSecondaryPool())
    if (current instanceof EditEngineItemPool) return current;
  const created = EditEngine.CreatePool();
  created.SetDefaultMetric(metric);
  return created;
}

/** Original concrete data owner,using actual ContentInfo/shared strings/items and the genuine EditEngine pool. */
export class EditTextObjectImpl extends EditTextObject {
  private readonly maContents: ContentInfo[] = [];
  private readonly mpPool: SfxItemPool;
  private mpPortionInfo: XParaPortionList | null = null;
  private meUserType = OutlinerMode.DontKnow;
  private readonly meScriptType: SvtScriptType;
  private meRotation: TextRotation;
  private readonly meMetric: MapUnit;
  private mbVertical: boolean;
  /** Original complete five-input constructor and implicit copy form. @param args - Actual native inputs or source. @returns Object. */
  constructor(
    ...args:
      | [
          pool: SfxItemPool | null,
          metric: MapUnit,
          vertical: boolean,
          rotation: TextRotation,
          script: SvtScriptType,
        ]
      | [source: EditTextObjectImpl]
  ) {
    super();
    if (args.length === 1) {
      const source = args[0];
      this.mpPool = source.mpPool;
      this.meUserType = source.meUserType;
      this.meScriptType = source.meScriptType;
      this.meRotation = source.meRotation;
      this.meMetric = source.meMetric;
      this.mbVertical = source.mbVertical;
      for (const content of source.maContents)
        this.maContents.push(new ContentInfo(content, this.mpPool));
    } else {
      this.mpPool = getEditEngineItemPool(args[0], args[1]);
      this.meMetric = args[1];
      this.mbVertical = args[2];
      this.meRotation = args[3];
      this.meScriptType = args[4];
    }
  }
  /** Original destructor ordering releases cache before actual paragraph string members;GC owns pool/item references. @returns Nothing. */
  override dispose(): void {
    this.ClearPortionInfo();
    for (const content of this.maContents) content.dispose();
    this.maContents.length = 0;
  }
  /** Original shared pool identity. @returns Pool. */
  override GetPool(): SfxItemPool {
    return this.mpPool;
  }
  /** Original inline helper construction over the actual owner. @returns Native updater. */
  GetFieldUpdater(): FieldUpdater {
    return new FieldUpdater(this);
  }
  /** Original stable contents vector. @returns Actual vector. */
  GetContents(): ContentInfo[] {
    return this.maContents;
  }
  /** Original raw paragraph insertion;the native producer initializes text before reading it. @returns Actual paragraph. */
  CreateAndInsertContent(): ContentInfo {
    const content = new ContentInfo(this.mpPool);
    this.maContents.push(content);
    return content;
  }
  /** Original attribute value creation in the object's actual pool. @param item - Actual item. @param start - Signed32 start. @param end - Signed32 end. @returns Attribute. */
  CreateAttrib(item: SfxPoolItem, start: number, end: number): XEditAttribute {
    return new XEditAttribute(this.mpPool, item, start, end);
  }
  /** Original script mask. @returns Mask. */
  override GetScriptType(): SvtScriptType {
    return this.meScriptType;
  }
  /** Original user type. @returns Type. */
  override GetUserType(): OutlinerMode {
    return this.meUserType;
  }
  /** Original independent update without cache invalidation. @param mode - Native enum. @returns Nothing. */
  override SetUserType(mode: OutlinerMode): void {
    this.meUserType = mode;
  }
  /** Original metric presence sentinel. @returns Present. */
  HasMetric(): boolean {
    return this.meMetric !== MapUnit.LASTENUMDUMMY;
  }
  /** Original metric metadata,independent of an already supplied pool's metric. @returns Unit. */
  GetMetric(): MapUnit {
    return this.meMetric;
  }
  /** Original owned copy never copies portion info. @returns Clone. */
  override Clone(): EditTextObjectImpl {
    return new EditTextObjectImpl(this);
  }
  /** Original actual normalization. @param pool - Actual native string pool. @returns Nothing. */
  override NormalizeString(pool: SharedStringPool): void {
    for (const content of this.maContents) content.NormalizeString(pool);
  }
  /** Original by-value string-vector projection. @returns Independent native owners. */
  override GetSharedStrings(): SharedString[] {
    return this.maContents.map(
      /** Copies the actual native value. @param content - Paragraph. @returns Owned value. */ (
        content,
      ) => new SharedString(content.GetSharedString()),
    );
  }
  /** Original vertical flag. @returns Stored flag. */
  override GetVertical(): boolean {
    return this.mbVertical;
  }
  /** Original change-only cache invalidation. @param vertical - New flag. @returns Nothing. */
  override SetVertical(vertical: boolean): void {
    if (vertical !== this.mbVertical) {
      this.mbVertical = vertical;
      this.ClearPortionInfo();
    }
  }
  /** Original orientation formula. @returns Effective vertical. */
  override IsEffectivelyVertical(): boolean {
    return (
      (this.mbVertical && this.meRotation === TextRotation.NONE) ||
      (!this.mbVertical && this.meRotation !== TextRotation.NONE)
    );
  }
  /** Original direction formula. @returns Top-to-bottom. */
  override IsTopToBottom(): boolean {
    return (
      (this.mbVertical && this.meRotation === TextRotation.NONE) ||
      (!this.mbVertical && this.meRotation === TextRotation.TOPTOBOTTOM)
    );
  }
  /** Original rotation metadata. @returns Enum. */
  override GetRotation(): TextRotation {
    return this.meRotation;
  }
  /** Original change-only cache invalidation. @param rotation - New enum. @returns Nothing. */
  override SetRotation(rotation: TextRotation): void {
    if (rotation !== this.meRotation) {
      this.meRotation = rotation;
      this.ClearPortionInfo();
    }
  }
  /** Original cache pointer adoption;native unique_ptr syntax is erased under GC. @param info - Actual cache metadata or null. @returns Nothing. */
  SetPortionInfo(info: XParaPortionList | null): void {
    this.mpPortionInfo = info;
  }
  /** Original borrowed cache pointer. @returns Cache or null. */
  GetPortionInfo(): XParaPortionList | null {
    return this.mpPortionInfo;
  }
  /** Original cache release. @returns Nothing. */
  override ClearPortionInfo(): void {
    this.mpPortionInfo = null;
  }
  /** Original signed32 paragraph-count saturation. @returns Count. */
  override GetParagraphCount(): number {
    return Math.min(this.maContents.length, EE_PARA_MAX);
  }
  /** Original paragraph lookup or default LF whole-text overload. @param paragraph - Optional signed32 index. @returns Owned value. */
  override GetText(paragraph?: number): OUString {
    if (paragraph === undefined) return this.GetTextWithLineEnd(LineEnd.LINEEND_LF);
    paragraph |= 0;
    return paragraph < 0 || paragraph >= this.maContents.length
      ? new OUString()
      : (this.maContents[paragraph] as ContentInfo).GetText();
  }
  /** Original line-end overload through EditDoc's actual separator value. @param end - Native selector. @returns Owned complete text. */
  override GetTextWithLineEnd(end: LineEnd): OUString {
    if (this.maContents.length === 0) return new OUString();
    const separator = EditDoc.GetSepStr(end),
      buffer = new OUStringBuffer();
    try {
      for (let index = 0; index < this.maContents.length; index++) {
        if (!separator.isEmpty() && index > 0) buffer.append(separator);
        const value = (this.maContents[index] as ContentInfo).GetText();
        try {
          buffer.append(value);
        } finally {
          value.dispose();
        }
      }
      return buffer.makeStringAndClear();
    } finally {
      separator.dispose();
      buffer.dispose();
    }
  }
  /** Original bounds-preserving UTF16 length. @param paragraph - Signed32 index. @returns Length or zero. */
  override GetTextLen(paragraph: number): number {
    paragraph |= 0;
    return paragraph < 0 || paragraph >= this.maContents.length
      ? 0
      : (this.maContents[paragraph] as ContentInfo).GetTextLen();
  }
  /** Original spell-range presence. @returns Any stored errors. */
  HasOnlineSpellErrors(): boolean {
    for (const content of this.maContents) {
      const wrongs = content.GetWrongList();
      if (wrongs !== null && !wrongs.empty()) return true;
    }
    return false;
  }
  /** Original valid-index output clear/rebuild;invalid indices leave the caller's vector unchanged. @param paragraph - Signed32 index. @param output - Caller vector. @returns Nothing. */
  GetCharAttribs(paragraph: number, output: EECharAttrib[]): void {
    paragraph |= 0;
    if (paragraph < 0 || paragraph >= this.maContents.length) return;
    output.length = 0;
    for (const attribute of (this.maContents[paragraph] as ContentInfo).GetCharAttribs())
      output.push(new EECharAttrib(attribute.GetStart(), attribute.GetEnd(), attribute.GetItem()));
  }
  /** Original field-object predicate. @returns Has single-character field object. */
  IsFieldObject(): boolean {
    return this.GetField() !== null;
  }
  /** Original last-field lookup for exactly one UTF16 unit in exactly one paragraph. @returns Borrowed item or null. */
  GetField(): SvxFieldItem | null {
    if (this.maContents.length === 1) {
      const content = this.maContents[0] as ContentInfo,
        value = content.GetText();
      const length = value.getLength();
      value.dispose();
      if (length === 1) {
        const attributes = content.GetCharAttribs();
        for (let index = attributes.length; index;) {
          const item = (attributes[--index] as XEditAttribute).GetItem() as SfxPoolItem;
          if (item.Which() === EE_FEATURE_FIELD) return item as SvxFieldItem;
        }
      }
    }
    return null;
  }
  /** Original filtered-field ordinal lookup,not a text offset or unfiltered attribute position. @param paragraph - Signed32 paragraph. @param position - Unsigned64 ordinal. @param type - Native field class ID. @returns Borrowed data or null. */
  GetFieldData(
    paragraph: number,
    position: number | bigint,
    type: number,
  ): SvxFieldDataConstReference | null {
    paragraph |= 0;
    if (paragraph < 0 || paragraph >= this.maContents.length) return null;
    const attributes = (this.maContents[paragraph] as ContentInfo).GetCharAttribs();
    const wanted = Number(BigInt.asUintN(64, BigInt(position)));
    if (wanted >= attributes.length) return null;
    let current = 0;
    for (const attribute of attributes) {
      const item = attribute.GetItem() as SfxPoolItem;
      if (item.Which() !== EE_FEATURE_FIELD) continue;
      const data = (item as SvxFieldItem).GetField();
      if (
        type !== FieldType.UNSPECIFIED &&
        type !== (data as SvxFieldDataConstReference).GetClassId()
      )
        continue;
      if (current === wanted) return data;
      ++current;
    }
    return null;
  }
  /** Original any/matching field predicate. @param type - Native class ID. @returns Match. */
  HasField(type: number = FieldType.UNSPECIFIED): boolean {
    for (const content of this.maContents)
      for (const attribute of content.GetCharAttribs()) {
        const item = attribute.GetItem() as SfxPoolItem;
        if (item.Which() !== EE_FEATURE_FIELD) continue;
        if (type === FieldType.UNSPECIFIED) return true;
        const data = (item as SvxFieldItem).GetField();
        if (data !== null && data.GetClassId() === type) return true;
      }
    return false;
  }
  /** Original const paragraph-set reference;valid index is the producer precondition. @param paragraph - Native index. @returns Actual set. */
  GetParaAttribs(paragraph: number): SfxItemSet {
    return (this.maContents[paragraph] as ContentInfo).GetParaAttribs();
  }
  /** Original reverse removal and change-only cache invalidation. @param which - Unsigned16 ID,zero removes all. @returns Changed. */
  RemoveCharAttribs(which: number): boolean {
    which &= 0xffff;
    let changed = false;
    for (let paragraph = this.maContents.length; paragraph;) {
      const attributes = (this.maContents[--paragraph] as ContentInfo).GetCharAttribs();
      for (let index = attributes.length; index;) {
        const attribute = attributes[--index] as XEditAttribute;
        if (which === 0 || (attribute.GetItem() as SfxPoolItem).Which() === which) {
          attributes.splice(index, 1);
          changed = true;
        }
      }
    }
    if (changed) this.ClearPortionInfo();
    return changed;
  }
  /** Original section extraction over this actual owner vector. @param output - Caller vector. @returns Nothing. */
  GetAllSections(output: Section[]): void {
    GetAllSections(this.maContents, output);
  }
  /** Original valid-index output assignment;invalid indices preserve both outputs. @param paragraph - Signed32 index. @param name - Native string output. @param family - Original scalar-reference binding. @returns Nothing. */
  GetStyleSheet(paragraph: number, name: OUString, family: [SfxStyleFamily]): void {
    paragraph |= 0;
    if (paragraph < 0 || paragraph >= this.maContents.length) return;
    const content = this.maContents[paragraph] as ContentInfo;
    name.assign(content.GetStyle());
    family[0] = content.GetFamily();
  }
  /** Original style update deliberately does not clear cache. @param paragraph - Signed32 index. @param name - Actual style value. @param family - Native family. @returns Nothing. */
  SetStyleSheet(paragraph: number, name: OUStringConstReference, family: SfxStyleFamily): void {
    paragraph |= 0;
    if (paragraph < 0 || paragraph >= this.maContents.length) return;
    const content = this.maContents[paragraph] as ContentInfo;
    content.SetStyle(name);
    content.SetFamily(family);
  }
  /** Original matching update over the actual borrowed UTF16 view. @param oldName - Native view. @param oldFamily - Previous family. @param name - New value. @param family - New family. @returns Any match. */
  private ImpChangeStyleSheets(
    oldName: Uint16Array,
    oldFamily: SfxStyleFamily,
    name: OUStringConstReference,
    family: SfxStyleFamily,
  ): boolean {
    let changed = false;
    for (const content of this.maContents)
      if (content.GetFamily() === oldFamily) {
        const previous = content.GetStyle();
        if (
          rtl_ustr_compare_WithLength(
            previous.getStr(),
            previous.getLength(),
            oldName,
            oldName.length,
          ) === 0
        ) {
          content.SetStyle(name);
          content.SetFamily(family);
          changed = true;
        }
      }
    return changed;
  }
  /** Original change API clears cache for any match,even identical requested values. @param oldName - Native view. @param oldFamily - Previous family. @param name - New value. @param family - New family. @returns Any match. */
  ChangeStyleSheets(
    oldName: Uint16Array,
    oldFamily: SfxStyleFamily,
    name: OUStringConstReference,
    family: SfxStyleFamily,
  ): boolean {
    const changed = this.ImpChangeStyleSheets(oldName, oldFamily, name, family);
    if (changed) this.ClearPortionInfo();
    return changed;
  }
  /** Original rename API deliberately retains cache. @param family - Native family. @param oldName - Native view. @param name - New value. @returns Nothing. */
  ChangeStyleSheetName(
    family: SfxStyleFamily,
    oldName: Uint16Array,
    name: OUStringConstReference,
  ): void {
    this.ImpChangeStyleSheets(oldName, family, name, family);
  }
  /** Original strict virtual operator comparison. @param other - Actual object. @returns Equality including pool. */
  override equals(other: EditTextObject): boolean {
    return this.Equals(other, true);
  }
  /** Original concrete comparison;the omitted selector binds the base class's one-argument pool-insensitive API. @param other - Actual rich-text object. @param comparePool - Include actual pool identity. @returns Equality. */
  override Equals(other: EditTextObject, comparePool = false): boolean {
    if (this === other) return true;
    const source = other as EditTextObjectImpl;
    if (
      (comparePool && this.mpPool !== source.mpPool) ||
      this.meMetric !== source.meMetric ||
      this.meUserType !== source.meUserType ||
      this.meScriptType !== source.meScriptType ||
      this.mbVertical !== source.mbVertical ||
      this.meRotation !== source.meRotation
    )
      return false;
    return (
      this.maContents.length === source.maContents.length &&
      this.maContents.every(
        /** Original paragraph comparison. @param content - Left paragraph. @param index - Position. @returns Equality. */ (
          content,
          index,
        ) => content.Equals(source.maContents[index] as ContentInfo, comparePool),
      )
    );
  }
  /** Original spelling comparison is independent of text/style/format metadata. @param other - Actual object. @returns Spelling equality. */
  isWrongListEqual(other: EditTextObject): boolean {
    const source = other as EditTextObjectImpl;
    return (
      this.maContents.length === source.maContents.length &&
      this.maContents.every(
        /** Original spelling value comparison. @param content - Left paragraph. @param index - Position. @returns Equality. */ (
          content,
          index,
        ) => content.isWrongListEqual(source.maContents[index] as ContentInfo),
      )
    );
  }
}
