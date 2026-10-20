/** @fileoverview Original EditEngineItemPool construction over the real shared item package. Native reference-count/destructor cleanup remains outside the current GC value boundary. */
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { getItemInfoPackageEditEngine } from "./eerdll";
import { LineEnd } from "../../../tools/inc/lineend";
import type { OUString } from "../../../sal/inc/rtl/ustring";

/** Original concrete EditEngine pool,not a document or rendering service. */
export class EditEngineItemPool extends SfxItemPool {
  /** Original pool name and complete default-package registration. @returns Pool. */
  constructor() {
    const name = unicode("EditEngineItemPool");
    super(name);
    name.dispose();
    this.registerItemInfoPackage(getItemInfoPackageEditEngine());
  }
}

/** Original EditDoc::GetSepStr static responsibility,with C++ qualification erased by the ESM namespace. @param end - Native line-end selection. @returns Owned native string. */
export function GetSepStr(end: LineEnd): OUString {
  if (end === LineEnd.LINEEND_CR) return unicode("\r");
  if (end === LineEnd.LINEEND_LF) return unicode("\n");
  return unicode("\r\n");
}
