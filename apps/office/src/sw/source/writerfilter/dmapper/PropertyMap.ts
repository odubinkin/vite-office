/** @fileoverview Ports consumed native PropertyMap/PropValue ordering, merge/default/cache and four interop grab-bag contracts; actual Any/PropertyValue/Sequence owners retain native value semantics. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import { OUString } from "../../../../sal/inc/rtl/ustring";
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
