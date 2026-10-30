/** @fileoverview Native inherited list-level lookup and first-use validation from DomainMapper_Impl.cxx. */
import type { DomainMapper_Impl } from "./DomainMapper_Impl";
import type { StyleSheetEntry, StyleSheetTable } from "./StyleSheetTable";
import type { ParagraphPropertyMap } from "./PropertyMap";
import { PropertyIds as P } from "./PropertyIds";
/** Original list-ID recursion retains its direct self-parent guard and original base-style side channel. @param entry - Style entry. @param table - Actual style table. @param inherited - Original output flag. @returns First nonnegative list ID. */
export function lcl_getListId(
  entry: StyleSheetEntry | null,
  table: StyleSheetTable,
  inherited: [boolean],
): number {
  if (!entry) return -1;
  const id = entry.m_pProperties.props().GetListId();
  if (id >= 0) return id;
  const parent = table.FindStyleSheetByISTD(entry.m_sBaseStyleIdentifier);
  if (!parent || parent === entry) return -1;
  inherited[0] = true;
  return lcl_getListId(parent, table, inherited);
}
/** Original direct paragraph property wins, then actual style metadata and its parents; there is no inherited-property fallback from the paragraph map. @param this - Actual mapper state. @param entry - Native style. @param paragraph - Optional direct context. @returns Signed native level. */
export function GetListLevel(
  this: DomainMapper_Impl,
  entry: StyleSheetEntry | null,
  paragraph?: ParagraphPropertyMap,
): number {
  const direct = paragraph?.getProperty(P.PROP_NUMBERING_LEVEL);
  if (direct) {
    const level: [number] = [-1];
    try {
      direct[1].extract(level, "sal_Int16");
      if (level[0] !== -1) return level[0];
    } finally {
      direct[1].dispose();
    }
  }
  if (!entry) return -1;
  const level = entry.m_pProperties.GetListLevel();
  if (level >= 0) return level;
  const parent = this.GetStyleSheetTable().FindStyleSheetByISTD(entry.m_sBaseStyleIdentifier);
  if (!parent || parent === entry) return -1;
  return GetListLevel.call(this, parent);
}
/** Original first style claims a level; a later claimant gets body metadata9 while its property vector stays unchanged. @param this - Actual mapper. @param id - Original style identifier. @returns Nothing. */
export function ValidateListLevel(this: DomainMapper_Impl, id: string): void {
  const table = this.GetStyleSheetTable(),
    style = table.FindStyleSheetByISTD(id);
  if (!style) return;
  const level = (this.GetListLevel(style) << 24) >> 24;
  if (level < 0 || level >= 9) return;
  const listId = (lcl_getListId(style, table, [false]) << 16) >> 16;
  if (listId < 1) return;
  const list = this.GetListTable().GetList(listId);
  if (!list) return;
  const native = list.GetLevel(level) ?? list.GetAbstractDefinition()?.GetLevel(level);
  if (!native) return;
  if (!native.GetParaStyle()) native.SetParaStyle(style);
  else if (native.GetParaStyle() !== style) style.m_pProperties.SetListLevel(9);
}
