/** @fileoverview Original Calc mtvelements.hxx value-block specializations over shared mdds and actual SVL/Calc value owners. */
import { MDDS_MTV_DEFINE_ELEMENT_CALLBACKS_PTR } from "../../external/mdds/include/mdds/multi_type_vector/macro.ts";
import { SvtBroadcaster } from "../../svl/source/notify/broadcast";
import type { SfxHint } from "../../svl/inc/hint";
import type { ScFormulaCell } from "./formulacell";
import type { EditTextObject } from "../../editeng/inc/editobj";
import { CellStoreEvent, cell_store_event_value_ops } from "../source/core/data/mtvelements";
export {
  CellStoreEvent,
  cell_store_event_value_ops,
  toRefCell,
  ColumnBlockPositionSet,
  TableColumnBlockPositionSet,
} from "../source/core/data/mtvelements";
import { MDDS_MTV_DEFINE_ELEMENT_CALLBACKS } from "../../external/mdds/include/mdds/multi_type_vector/macro.ts";
import { SharedString } from "../../svl/inc/sharedstring";
import { CellTextAttr } from "./celltextattr";
import { type DelayedValueOperations } from "../../external/mdds/include/mdds/multi_type_vector/delayed_delete_vector.ts";
import {
  default_element_block,
  managed_element_block,
  noncopyable_managed_element_block,
  element_type_user_start,
  element_type_empty as empty,
} from "../../external/mdds/include/mdds/multi_type_vector/types.ts";
import {
  double_element_block,
  uint16_element_block,
  element_type_double,
  element_type_uint16 as uint16,
} from "../../external/mdds/include/mdds/multi_type_vector/standard_element_blocks.ts";
export const element_type_broadcaster = element_type_user_start;
export const element_type_celltextattr = element_type_user_start + 1;
export const element_type_string = element_type_user_start + 2;
export const element_type_edittext = element_type_user_start + 3;
export const element_type_formula = element_type_user_start + 4;
export const element_type_cellnote = element_type_user_start + 5;
export const element_type_sparkline = element_type_user_start + 6;
export const element_type_numeric = element_type_double;
export const element_type_empty = empty;
export const element_type_uint16 = uint16;
export const numeric_block = double_element_block;
export const uint16_block = uint16_element_block;
const string_operations: DelayedValueOperations<SharedString> = {
  move_noexcept: true,
  /** Original empty ValueT constructor. @returns Empty value. */
  default_construct() {
    return new SharedString();
  },
  /** Actual const-value constructor. @param value - Source. @returns Independent shared value. */
  copy_construct(value) {
    return new SharedString(value);
  },
  /** Actual move constructor. @param value - Rvalue source. @returns Transferred value. */
  move_construct(value) {
    return SharedString.move(value);
  },
  /** Actual const-value assignment. @param target - Target. @param source - Source. @returns Nothing. */
  copy_assign(target, source) {
    target.assign(source);
  },
  /** Actual move assignment. @param target - Target. @param source - Rvalue source. @returns Nothing. */
  move_assign(target, source) {
    target.moveAssign(source);
  },
  /** Actual original value destructor. @param value - Live value. @returns Nothing. */
  destroy(value) {
    value.dispose();
  },
  /** Actual original operator==. @param left - Left value. @param right - Right value. @returns Equality. */
  equal(left, right) {
    return left.equals(right);
  },
};
const attr_operations: DelayedValueOperations<CellTextAttr> = {
  move_noexcept: true,
  /** Original default metadata constructor. @returns Metadata. */
  default_construct() {
    return new CellTextAttr();
  },
  /** Original implicit memberwise copy. @param value - Source. @returns Independent metadata. */
  copy_construct(value) {
    return new CellTextAttr(value);
  },
  /** Original implicit move of scalar members retains source members. @param value - Source. @returns Metadata. */
  move_construct(value) {
    return new CellTextAttr(value);
  },
  /** Original implicit assignment. @param target - Target. @param source - Source. @returns Nothing. */
  copy_assign(target, source) {
    target.assign(source);
  },
  /** Original implicit move assignment of scalar members. @param target - Target. @param source - Source. @returns Nothing. */
  move_assign(target, source) {
    target.assign(source);
  },
  /** Original trivial destructor has no resource operation. @param value - Metadata. @returns Nothing. */
  destroy(value) {
    void value;
  },
};
/** Original value conversion keeps a const reference; construction belongs to the underlying store. @param value - Native value. @returns Same reference. */
function string_value(value: SharedString): SharedString {
  return value;
}
/** Original metadata const reference conversion. @param value - Metadata. @returns Same reference. */
function attr_value(value: CellTextAttr): CellTextAttr {
  return value;
}
export const string_block = default_element_block(
  element_type_string,
  new SharedString(),
  string_value,
  false,
  string_operations,
);
export const celltextattr_block = default_element_block(
  element_type_celltextattr,
  new CellTextAttr(),
  attr_value,
  false,
  attr_operations,
);

/** Original svl namespace SharedString callback overloads with explicit erased value-type witness. */
export const string_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(
  element_type_string,
  new SharedString(),
  string_block,
  { operations: string_operations, empty: string_operations.default_construct },
);
/** Original sc namespace CellTextAttr callback overloads, reusing its actual metadata members. */
export const celltextattr_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(
  element_type_celltextattr,
  new CellTextAttr(),
  celltextattr_block,
  { operations: attr_operations, empty: attr_operations.default_construct },
);

/** Actual original value-type members, reused for erased native container return declarations. */
export const string_value_type = string_operations;
export const celltextattr_value_type = attr_operations;
import {
  default_traits,
  empty_event_func,
} from "../../external/mdds/include/mdds/multi_type_vector/util.ts";
import { element_block_funcs } from "../../external/mdds/include/mdds/multi_type_vector/block_funcs.ts";
import {
  multi_type_vector,
  empty_event_value_ops,
} from "../../external/mdds/include/mdds/multi_type_vector/soa/main.ts";
/** Original default_traits specialization registers only the original text metadata block. */
export const CellTextAttrTraits = {
  ...default_traits,
  block_funcs: element_block_funcs(celltextattr_block),
};
const text_attr_constructor = (multi_type_vector<empty_event_func>).bind(
  null,
  CellTextAttrTraits,
  empty_event_value_ops,
);
/** Original typedef binds the existing constructor/traits and inherits its static methods; no second engine or subclass. */
export const CellTextAttrStoreType = Object.setPrototypeOf(
  text_attr_constructor,
  multi_type_vector,
) as typeof text_attr_constructor & Omit<typeof multi_type_vector, "prototype">;
/** Original text attribute container typedef instance, sharing the generic container owner. */
export type CellTextAttrStoreType = InstanceType<typeof CellTextAttrStoreType>;

/** Real formula pointer identity uses ordinary GC; physical managed-pointer deletion is not ported. Native noncopyable operations remain explicit. */
export const formula_block = Object.assign(
  noncopyable_managed_element_block<ScFormulaCell>(element_type_formula, {
    /** Ends actual subscriptions and formula-list membership; JS GC owns physical lifetime. @param cell - Removed cell. @returns Nothing. */
    delete(cell) {
      cell.Dispose();
    },
  }),
  {
    /** Full formula semantic equality is outside this editing subset. @returns Never. */
    equal_block(): never {
      throw new Error("Formula block semantic equality is not implemented");
    },
  },
);
export const formula_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS_PTR(
  element_type_formula,
  null as ScFormulaCell | null,
  formula_block,
);
/** Native owned edit-text pointer block; the actual EditEngine object owns its paragraphs. */
export const edittext_block = managed_element_block<EditTextObject>(element_type_edittext, {
  /** Copies an inserted edit object when mdds copies a managed block. @param source - Source text. @returns Copy. */
  copy_construct(source) {
    return source.Clone();
  },
  /** Releases paragraphs when a cell is replaced or removed. @param value - Removed object. @returns Nothing. */
  delete(value) {
    value.dispose();
  },
});
export const edittext_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS_PTR(
  element_type_edittext,
  null as EditTextObject | null,
  edittext_block,
);
/** Native scalar, edit-text and formula alternatives, with logical block events. */
export const CellStoreTraits = {
  ...default_traits,
  event_func: CellStoreEvent,
  block_funcs: element_block_funcs(numeric_block, string_block, edittext_block, formula_block),
};
const cell_store_constructor = (multi_type_vector<CellStoreEvent>).bind(
  null,
  CellStoreTraits,
  cell_store_event_value_ops,
);
/** Existing shared SoA engine bound to actual supported Calc cell alternatives. */
export const CellStoreType = Object.setPrototypeOf(
  cell_store_constructor,
  multi_type_vector,
) as typeof cell_store_constructor & Omit<typeof multi_type_vector, "prototype">;
/** Actual typed cell-store instance. */
export type CellStoreType = InstanceType<typeof CellStoreType>;

/** Native broadcaster copy/semantic destruction. Dispose ends registrations and sends dying notifications; JS GC owns physical lifetime. */
export const broadcaster_block = managed_element_block<SvtBroadcaster<SfxHint>>(
  element_type_broadcaster,
  {
    /** Copies native reciprocal registrations. @param source - Source. @returns Broadcaster. */
    copy_construct(source) {
      return new SvtBroadcaster(source);
    },
    /** Ends native observable registrations; this does not free JS memory. @param value - Removed broadcaster. @returns Nothing. */
    delete(value) {
      value.Dispose();
    },
  },
);
export const broadcaster_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS_PTR(
  element_type_broadcaster,
  null as SvtBroadcaster<SfxHint> | null,
  broadcaster_block,
);
export const BroadcasterTraits = {
  ...default_traits,
  block_funcs: element_block_funcs(broadcaster_block),
};
const broadcaster_constructor = (multi_type_vector<empty_event_func>).bind(
  null,
  BroadcasterTraits,
  empty_event_value_ops,
);
/** Actual shared SoA broadcaster store, separate from cell values. */
export const BroadcasterStoreType = Object.setPrototypeOf(
  broadcaster_constructor,
  multi_type_vector,
) as typeof broadcaster_constructor & Omit<typeof multi_type_vector, "prototype">;
/** Native broadcaster-store instance. */
export type BroadcasterStoreType = InstanceType<typeof BroadcasterStoreType>;

/** Consumed native ColumnBlockConstPosition fields;default iterator storage is uninitialized until the original InitBlockPosition operation. Note/sparkline cursor families remain unported. */
export interface ColumnBlockConstPosition {
  miCellPos?: ReturnType<CellStoreType["cbegin"]>;
  miCellTextAttrPos?: ReturnType<CellTextAttrStoreType["cbegin"]>;
}
/** Original mutable block-position value;iterator members are uninitialized until InitBlockPosition,without dummy owners. Notes/sparklines remain unrepresented. */
export class ColumnBlockPosition {
  declare miCellPos?: ReturnType<CellStoreType["begin"]>;
  declare miCellTextAttrPos?: ReturnType<CellTextAttrStoreType["begin"]>;
  declare miBroadcasterPos?: ReturnType<BroadcasterStoreType["begin"]>;
}
