/** @fileoverview Original FieldUpdater/Impl and SvxFieldItemUpdater responsibilities from fieldupdater.cxx,operating on real rich-text attributes and shared item holders. */
import type { EditTextObject } from "./editobj";
import type { EditTextObjectImpl } from "./editobj.owner";
import { SfxPoolItemHolder } from "../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { EE_FEATURE_FIELD } from "../../inc/eeitem";
import { SvxFieldItem, SvxTableField, type SvxFieldDataConstReference } from "../../inc/flditem";
import * as FieldType from "../../../offapi/com/sun/star/text/textfield/Type";

/** Original abstract callback write-access contract. */
export abstract class SvxFieldItemUpdater {
  /** Original native field-item replacement. @param item - Actual replacement. @returns Nothing. */
  abstract SetItem(item: SvxFieldItem): void;
}
/** Original stack-scoped callback sink over the existing native holder member. */
class SvxFieldItemUpdaterImpl extends SvxFieldItemUpdater {
  /** Borrows original mutable holder storage. @param holder - Actual holder. @returns Sink. */
  constructor(private readonly holder: SfxPoolItemHolder) {
    super();
  }
  /** Original original-pool/non-adopting replacement. @param item - Actual replacement. @returns Nothing. */
  override SetItem(item: SvxFieldItem): void {
    this.holder.assign(new SfxPoolItemHolder(this.holder.getPool(), item, false));
  }
}
/** Original private helper and copied reference to the actual text object. */
class FieldUpdaterImpl {
  private readonly mrObj: EditTextObjectImpl;
  /** Original owner/copy construction;the concrete producer precondition is the native toImpl contract. @param source - Actual owner or helper copy. @returns Helper. */
  constructor(source: EditTextObject | FieldUpdaterImpl) {
    this.mrObj = source instanceof FieldUpdaterImpl ? source.mrObj : (source as EditTextObjectImpl);
  }
  /** Original unconditional table-field rewrite. @param tab - Signed32 ID. @returns Nothing. */
  updateTableFields(tab: number): void {
    const pool = this.mrObj.GetPool();
    for (const content of this.mrObj.GetContents())
      for (const attribute of content.GetCharAttribs()) {
        const item = attribute.GetItem() as SfxPoolItem;
        if (item.Which() !== EE_FEATURE_FIELD) continue;
        const data = (item as SvxFieldItem).GetField() as SvxFieldDataConstReference;
        if (data.GetClassId() !== FieldType.TABLE) continue;
        attribute.SetItem(pool, new SvxFieldItem(new SvxTableField(tab), EE_FEATURE_FIELD));
      }
  }
  /** Original callback visits all field items,not just URL fields;the caller owns any semantic filtering. @param callback - Actual native callback. @returns Nothing. */
  UpdatePageRelativeURLs(
    callback: (item: SvxFieldItem, updater: SvxFieldItemUpdater) => void,
  ): void {
    for (const content of this.mrObj.GetContents())
      for (const attribute of content.GetCharAttribs()) {
        const item = attribute.GetItem() as SfxPoolItem;
        if (item.Which() !== EE_FEATURE_FIELD) continue;
        callback(item as SvxFieldItem, new SvxFieldItemUpdaterImpl(attribute.GetItemHolder()));
      }
  }
}
/** Original public field-updater value,not a replacement engine or formatting service. */
export class FieldUpdater {
  private readonly mpImpl: FieldUpdaterImpl;
  /** Original owner/copy constructors. @param source - Actual text object or updater value. @returns Value. */
  constructor(source: EditTextObject | FieldUpdater) {
    this.mpImpl = new FieldUpdaterImpl(source instanceof FieldUpdater ? source.mpImpl : source);
  }
  /** Original table-field entry point. @param tab - Signed32 ID. @returns Nothing. */
  updateTableFields(tab: number): void {
    this.mpImpl.updateTableFields(tab);
  }
  /** Original callback entry point. @param callback - Native callback. @returns Nothing. */
  UpdatePageRelativeURLs(
    callback: (item: SvxFieldItem, updater: SvxFieldItemUpdater) => void,
  ): void {
    this.mpImpl.UpdatePageRelativeURLs(callback);
  }
}
