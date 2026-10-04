/** @fileoverview Applies named paragraph collections with the native common-style creation/finish ownership from prstylei.cxx and txtstyli.cxx. */
import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/source/items/paraitem";
import { SvxTextLeftMarginItem } from "../../../../editeng/source/items/frmitems";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import type {
  OdfStyleDefinition,
  XMLParagraphImportProperties,
} from "../../../../xmloff/source/text/txtparai";
import type { OdfCharacterProperties } from "../../../../xmloff/source/text/txtparae";
import { getWriterStyleIdFromOdfName } from "../../../inc/poolfmt";
import { RES_PARATR_ADJUST, RES_MARGIN_TEXTLEFT } from "../../../inc/hintids";
import type { SwDoc } from "../../core/doc/doc";
import { isWriterParagraphStyle, type SwTextFormatColl } from "../../core/doc/fmtcol";
import type { SwFormat } from "../../core/attr/format";
import { SwNumRuleItem } from "../../core/para/paratr";

/** Materializes common styles before linking their document-owned hierarchy. @param document - Destination graph. @param styles - Common paragraph definitions. @param defaultStyle - Shared defaults. @param paragraphItems - Supported paragraph item conversion. @param characterItems - Supported character item conversion. @param listName - Native list display-name resolution. @returns Nothing. */
export function applyNamedParagraphStyles(
  document: SwDoc,
  styles: ReadonlyMap<string, OdfStyleDefinition>,
  defaultStyle: OdfStyleDefinition | undefined,
  paragraphItems: (
    properties: XMLParagraphImportProperties,
    put: (item: SfxPoolItem) => unknown,
    inherited: (which: number) => SfxPoolItem,
  ) => void,
  characterItems: (
    properties: Partial<OdfCharacterProperties>,
    put: (item: SfxPoolItem) => unknown,
  ) => void,
  listName: (name: string) => string | undefined,
): void {
  if (!styles.has("Standard")) throw new Error("ODF Writer Standard paragraph style is missing.");
  const collections = new Map<string, SwTextFormatColl>();
  for (const [name, definition] of styles) {
    const builtIn = getWriterStyleIdFromOdfName(name);
    const collection =
      builtIn !== undefined && isWriterParagraphStyle(builtIn)
        ? document.GetTextFormatColl(builtIn)
        : document.MakeTextFormatColl(
            definition.displayName ?? name,
            document.GetDfltTextFormatColl(),
            name,
          );
    collections.set(name, collection);
    collection.SetDerivedFrom(undefined);
  }
  /** Applies only this definition's own items to its actual style owner. @param collection - Named owner. @param definition - Own definition. @returns Nothing. */
  function apply(collection: SwTextFormatColl, definition: OdfStyleDefinition): void {
    if (definition.alignment !== undefined) {
      const value =
        definition.alignment === "center"
          ? SvxAdjust.Center
          : definition.alignment === "right"
            ? SvxAdjust.ParaEnd
            : definition.alignment === "justify"
              ? SvxAdjust.Block
              : SvxAdjust.ParaStart;
      collection.SetFormatAttr(new SvxAdjustItem(value, RES_PARATR_ADJUST));
    }
    if (definition.leftMargin !== undefined)
      collection.SetFormatAttr(
        new SvxTextLeftMarginItem(definition.leftMargin, RES_MARGIN_TEXTLEFT),
      );
    if (definition.paragraphProperties !== undefined)
      paragraphItems(
        definition.paragraphProperties,
        /** Stores one style-owned paragraph item. @param item - Converted item. @returns Set result. */ (
          item,
        ) => collection.SetFormatAttr(item),
        /** Reads untouched subfields of a composite inherited item. @param which - Identity. @returns Effective item. */
        (which) => collection.GetAttrSet().Get(which),
      );
    if (definition.properties !== undefined)
      characterItems(
        definition.properties,
        /** Stores one style-owned character item. @param item - Converted item. @returns Set result. */ (
          item,
        ) => collection.SetFormatAttr(item),
      );
  }
  if (defaultStyle !== undefined) apply(document.GetDfltTextFormatColl(), defaultStyle);
  for (const [name, definition] of styles) {
    const collection = collections.get(name) as SwTextFormatColl;
    const parent =
      name === "Standard" ? undefined : collections.get(definition.parentStyleName ?? "");
    if (parent !== collection && !derivesFrom(parent, collection))
      collection.SetDerivedFrom(parent);
    collection.SetNextTextFormatColl(
      collections.get(definition.nextStyleName ?? name) ?? collection,
    );
  }
  const applied = new Set<string>();
  /** Applies parent items before child property updates on shared native items. @param name - Common identity. @returns Nothing. */
  function applyOwner(name: string): void {
    if (applied.has(name)) return;
    applied.add(name);
    const definition = styles.get(name) as OdfStyleDefinition;
    const collection = collections.get(name) as SwTextFormatColl;
    if (definition.parentStyleName !== undefined && styles.has(definition.parentStyleName))
      applyOwner(definition.parentStyleName);
    if (definition.displayName !== undefined) collection.SetFormatName(definition.displayName);
    if (definition.outlineLevel !== undefined)
      collection.SetAttrOutlineLevel(definition.outlineLevel);
    if (definition.listStyleName !== undefined) {
      const rule =
        definition.listStyleName === "" || definition.listStyleName === "Outline"
          ? definition.listStyleName
          : listName(definition.listStyleName);
      if (rule !== undefined) collection.SetFormatAttr(new SwNumRuleItem(rule));
    }
    apply(collection, definition);
  }
  for (const name of styles.keys()) applyOwner(name);
}

/** Detects inheritance cycles before the native style-finish linkage is assigned. @param format - Candidate parent. @param ancestor - Style whose cycle must be prevented. @returns Whether candidate derives from this style. */
function derivesFrom(format: SwFormat | undefined, ancestor: SwFormat): boolean {
  for (let current = format; current !== undefined; current = current.DerivedFrom())
    if (current === ancestor) return true;
  return false;
}
