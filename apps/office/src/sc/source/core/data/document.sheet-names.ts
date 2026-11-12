/** @fileoverview Original document.cxx sheet name validation, global lookup cache and load-only naming. Actual document/table/string owners are retained. */
import type { ScDocument } from "../../../inc/document";
import { ValidTab } from "../../../inc/address";
import { ScGlobal } from "../../../inc/global";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
const aCacheName = new OUString(),
  aCacheUpperName = new OUString();
/** Original counted UTF16 validation, including apostrophe position and absence of a31-character limit. @param name - Native name. @returns Valid characters. */
export function ValidTabName(name: OUStringConstReference): boolean {
  if (name.isEmpty()) return false;
  const length = name.getLength(),
    units = name.getStr();
  for (let index = 0; index < length; ++index) {
    switch (units[index]) {
      case 58:
      case 92:
      case 47:
      case 63:
      case 42:
      case 91:
      case 93:
        return false;
      case 39:
        if (index === 0 || index === length - 1) return false;
    }
  }
  return true;
}
/** Original source uppercase comparison uses the system character class and the real table's lazy cache. @param this - Actual document. @param name - Candidate name. @returns Available name. */
export function ValidNewTabName(this: ScDocument, name: OUStringConstReference): boolean {
  if (!ValidTabName(name)) return false;
  const upper = ScGlobal.getCharClass().uppercase(name);
  try {
    for (const table of this["maTabs"]) {
      if (!table) continue;
      if (table.GetUpperName().equals(upper)) return false;
    }
    return true;
  } finally {
    upper.dispose();
  }
}
/** Original two static COW strings are shared between document lookups; failed lookup resets the output to zero. @param this - Actual document. @param name - Queried native name. @param tab - Native output reference. @returns Found. */
export function GetTable(this: ScDocument, name: OUStringConstReference, tab: [number]): boolean {
  // document.hxx's IsThreadedGroupCalcInProgress is the original inline global flag query.
  if (ScGlobal.bThreadedGroupCalcInProgress)
    throw new Error("assert(!IsThreadedGroupCalcInProgress())");
  if (!aCacheName.equals(name)) {
    aCacheName.assign(name);
    const value = ScGlobal.getCharClass().uppercase(name);
    try {
      aCacheUpperName.assign(value);
    } finally {
      value.dispose();
    }
  }
  const upper = new OUString(aCacheUpperName);
  try {
    for (let index = 0; index < this.GetTableCount(); ++index) {
      const table = this["maTabs"][index];
      if (table && upper.equals(table.GetUpperName())) {
        tab[0] = (index << 16) >> 16;
        return true;
      }
    }
    tab[0] = 0;
    return false;
  } finally {
    upper.dispose();
  }
}
/** Original vector copies preserve positions of absent clipboard/undo sheets. @param this - Actual document. @returns Owned name copies, including empty entries for holes. */
export function GetAllTableNames(this: ScDocument): OUString[] {
  const result: OUString[] = [];
  for (const table of this["maTabs"])
    result.push(table ? new OUString(table.GetName()) : new OUString());
  return result;
}
/** Original signed16 sheet parameter and validation order, without duplicate-name or stream invalidation policy. @param this - Actual document. @param tab - Load target sheet. @param name - New native name. @returns Nothing. */
export function SetTabNameOnLoad(
  this: ScDocument,
  tab: number,
  name: OUStringConstReference,
): void {
  tab = (tab << 16) >> 16;
  if (!ValidTab(tab) || this.GetTableCount() <= tab) return;
  if (!ValidTabName(name)) return;
  // Native callers must pass a materialized sheet; this is not the editing RenameTab path.
  (this["maTabs"][tab] as NonNullable<ScDocument["maTabs"][number]>).SetName(name);
}
