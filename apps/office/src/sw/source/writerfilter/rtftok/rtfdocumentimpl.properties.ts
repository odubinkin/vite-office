/** @fileoverview Original RTFDocumentImpl nested property helpers from rtfdocumentimpl.cxx, operating on actual RTFSprms/RTFValue owners. */
import { SvRef } from "../../../../tools/inc/ref";
import { COL_AUTO } from "../../../../tools/inc/color";
import type { Id } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { RTFConflictPolicy, RTFSprms } from "./rtfsprm";
import { RTFValue } from "./rtfvalue";
/** Original nested insertion performs the outer write barrier and seeds native table-cell shading auto colors. @param sprms - Actual outer list. @param parentId - Parent token. @param id - Child token. @param value - Original pointer/reference. @param policy - Conflict policy. @param attribute - Child belongs to attributes rather than modifiers. @returns Nothing. */
export function putNestedAttribute(
  sprms: RTFSprms,
  parentId: Id,
  id: Id,
  value: RTFValue | SvRef<RTFValue>,
  policy = RTFConflictPolicy.Overwrite,
  attribute = true,
): void {
  const parent = sprms.find(parentId, true, true);
  try {
    if (!parent.is()) {
      const attrs = new RTFSprms();
      try {
        if (parentId === N.LN_CT_TcPrBase_shd) {
          attrs.set(N.LN_CT_Shd_color, new RTFValue(COL_AUTO.toInt32()));
          attrs.set(N.LN_CT_Shd_fill, new RTFValue(COL_AUTO.toInt32()));
        }
        const created = new RTFValue(attrs);
        sprms.set(parentId, created, policy);
        parent.assign(created);
      } finally {
        attrs.dispose();
      }
    }
    (attribute
      ? parent.operatorDereference().getAttributes()
      : parent.operatorDereference().getSprms()
    ).set(id, value, policy);
  } finally {
    parent.dispose();
  }
}
/** Original nested modifier insertion. @param sprms - Outer list. @param parentId - Parent ID. @param id - Child ID. @param value - Native pointer/reference. @param policy - Conflict policy. @returns Nothing. */
export function putNestedSprm(
  sprms: RTFSprms,
  parentId: Id,
  id: Id,
  value: RTFValue | SvRef<RTFValue>,
  policy = RTFConflictPolicy.Overwrite,
): void {
  putNestedAttribute(sprms, parentId, id, value, policy, false);
}
/** Original nested attribute query with an owned returned pointer. @param sprms - Outer list. @param parentId - Parent ID. @param id - Attribute ID. @returns Nullable reference. */
export function getNestedAttribute(sprms: RTFSprms, parentId: Id, id: Id): SvRef<RTFValue> {
  const parent = sprms.find(parentId);
  try {
    return parent.is()
      ? parent.operatorDereference().getAttributes().find(id)
      : new SvRef<RTFValue>();
  } finally {
    parent.dispose();
  }
}
/** Original nested modifier query. @param sprms - Outer list. @param parentId - Parent ID. @param id - Modifier ID. @returns Nullable reference. */
export function getNestedSprm(sprms: RTFSprms, parentId: Id, id: Id): SvRef<RTFValue> {
  const parent = sprms.find(parentId);
  try {
    return parent.is() ? parent.operatorDereference().getSprms().find(id) : new SvRef<RTFValue>();
  } finally {
    parent.dispose();
  }
}
/** Original nested erase deliberately uses read lookup, preserving its shared outer-value mutation behavior. @param sprms - Outer list. @param parentId - Parent ID. @param id - Child ID. @returns Whether erased. */
export function eraseNestedAttribute(sprms: RTFSprms, parentId: Id, id: Id): boolean {
  const parent = sprms.find(parentId);
  try {
    return parent.is() ? parent.operatorDereference().getAttributes().erase(id) : false;
  } finally {
    parent.dispose();
  }
}
/** Original last modifier attributes query, falling back to the outer list when no type is defined. @param sprms - Outer list. @param id - Parent ID. @returns Borrowed actual list. */
export function getLastAttributes(sprms: RTFSprms, id: Id): RTFSprms {
  const parent = sprms.find(id);
  try {
    return parent.is() && !parent.operatorDereference().getSprms().empty()
      ? parent.operatorDereference().getSprms().back()[1].operatorDereference().getAttributes()
      : sprms;
  } finally {
    parent.dispose();
  }
}

/** Original paragraph edge lookup. @param index - Defined native index0..4. @returns Resource token. */
export function getParagraphBorder(index: number): Id {
  const result = [
    N.LN_CT_PBdr_top,
    N.LN_CT_PBdr_left,
    N.LN_CT_PBdr_bottom,
    N.LN_CT_PBdr_right,
    N.LN_CT_PBdr_between,
  ][index];
  if (result === undefined) throw new Error("getParagraphBorder outside native domain");
  return result;
}
