/** @fileoverview Native building-block SDT parameters for the paragraph interoperability bag. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import type { GrabBagValueConstReference } from "../../../../svl/inc/grabbagitem";
import { stringAny, text, unicode } from "../../core/unocore/unocrsrhelper";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import {
  resolveReturnedReference,
  type Id,
  type Properties,
  type Sprm,
} from "../inc/dmapper/resourcemodel";
import { GrabBagType, propertyAt, type PropertyMap } from "./PropertyMap";
import { PropertyIds as P } from "./PropertyIds";

const PropertyValues = Sequence.specialize<PropertyValue>(propertyType, 48);
const sequenceType = ["Sequence", propertyType] as const;
const partKeys = ["docPartGallery", "docPartCategory", "docPartUnique"] as const;
const prefix = "ooxml:CT_SdtPr_";
const partPrefix = "ooxml:CT_SdtDocPart_";
const extraKeys = ["alias", "tag", "lock"] as const;
const partIds = new Map<number, (typeof partKeys)[number]>([
  [N.LN_CT_SdtDocPart_docPartGallery, "docPartGallery"],
  [N.LN_CT_SdtDocPart_docPartCategory, "docPartCategory"],
  [N.LN_CT_SdtDocPart_docPartUnique, "docPartUnique"],
]);

/** The native unsupported building-block SDT properties consumed by the block writer. */
export interface DocPartSdt {
  kind: "docPartObj" | "docPartList";
  part: Partial<Record<(typeof partKeys)[number], string>>;
  alias?: string;
  tag?: string;
  lock?: string;
  id?: number;
}

/** Encodes the nested native properties and owns no source XML. @param sdt - Typed building-block values. @returns Owned native property sequence. */
export function makeDocPartSdt(sdt: DocPartSdt): Any {
  return makeSequence([
    [
      prefix + sdt.kind,
      makeSequence(
        Object.entries(sdt.part).map(
          /** Builds one source docPart property. @param field - Original name and value. @returns Named value. */
          ([name, value]) => [partPrefix + name, stringAny(value)],
        ),
      ),
    ],
    ...extraKeys.flatMap(
      /** Encodes the known string attributes. @param key - Original property. @returns Present named value. */
      (key): [string, Any][] =>
        sdt[key] === undefined ? [] : [[prefix + key, stringAny(sdt[key])]],
    ),
    ...(sdt.id === undefined
      ? []
      : [[prefix + "id", new Any([sdt.id], "sal_Int32")] as [string, Any]]),
  ]);
}

/** Transfers owned named values to an original PropertyValue sequence. @param entries - Entries whose Any values are consumed. @returns Owned sequence Any. */
function makeSequence(entries: readonly (readonly [string, Any])[]): Any {
  const properties: PropertyValue[] = [];
  try {
    for (const [name, value] of entries) {
      const key = unicode(name);
      try {
        properties.push(new PropertyValue(key, 0, value, PropertyState.DIRECT_VALUE));
      } finally {
        key.dispose();
      }
    }
    const values = new PropertyValues(
      {
        /** Borrows the native record at its original logical byte offset. @param offset - Address offset. @returns Borrowed record. */
        get: (offset: number) => properties[offset / 48],
      },
      properties.length,
    );
    try {
      return new Any(values.getAddress(), sequenceType);
    } finally {
      values.dispose();
    }
  } finally {
    for (const property of properties) property.dispose();
    for (const [, value] of entries) value.dispose();
  }
}

/** Visits an original property sequence with its generated field access. @param any - Borrowed native bag. @param visit - Source-order value callback. @returns Nothing. */
function visitSequence(
  any: GrabBagValueConstReference | undefined,
  visit: (name: string, value: Any) => void,
): void {
  if (!any) return;
  const values = new PropertyValues();
  try {
    if (!any.extract(values.getAddress(), sequenceType)) return;
    for (let index = 0; index < values.getLength(); index++) {
      const property = propertyAt(values, index);
      try {
        visit(text(property.Name), property.Value);
      } finally {
        property.dispose();
      }
    }
  } finally {
    values.dispose();
  }
}

/** Reads only the native building-block properties represented by the Writer block writer. @param any - Paragraph SdtPr entry. @returns Building-block metadata if present. */
export function readDocPartSdt(
  any: GrabBagValueConstReference | undefined,
): DocPartSdt | undefined {
  let result: DocPartSdt | undefined;
  const extras: Omit<DocPartSdt, "kind" | "part"> = {};
  visitSequence(
    any,
    /** Reads the source type and its extra attributes. @param name - Native property. @param value - Original UNO value. @returns Nothing. */ (
      name,
      value,
    ) => {
      if (name === prefix + "docPartObj" || name === prefix + "docPartList") {
        const part: DocPartSdt["part"] = {};
        visitSequence(
          value,
          /** Reads a native string value from the docPart bag. @param name - Named property. @param value - Original UNO value. @returns Nothing. */ (
            name,
            value,
          ) => {
            for (const key of partKeys)
              if (name === partPrefix + key) part[key] = stringValue(value);
          },
        );
        result = { kind: name === prefix + "docPartObj" ? "docPartObj" : "docPartList", part };
      } else if (name === prefix + "id") {
        const integer: [number] = [0];
        if (value.extract(integer, "sal_Int32")) extras.id = integer[0];
      } else {
        for (const key of extraKeys) if (name === prefix + key) extras[key] = stringValue(value);
      }
    },
  );
  return result && Object.assign(result, extras);
}

/** Copies a typed native string without coercing nonstrings. @param value - Borrowed UNO value. @returns Native text. */
function stringValue(value: Any): string {
  const name = new OUString();
  try {
    return value.extract(name, "OUString") ? text(name) : "";
  } finally {
    name.dispose();
  }
}

/** Input state for the native unsupported block-SDT paragraph grab bag. */
class SdtBlock {
  part: DocPartSdt | undefined;
  readonly extras: Omit<DocPartSdt, "kind" | "part"> = {};
  emitted = false;
}

/** Keeps the represented block SDT metadata until the original paragraph receives it. */
export class SdtHelper {
  private readonly blocks: SdtBlock[] = [];
  private endDeferred = false;

  /** Receives original start/end stream attributes. @param id - Native attribute. @returns Whether this is a block marker. */
  attribute(id: Id): boolean {
    if (id === N.LN_CT_SdtBlock_sdtContent) this.blocks.push(new SdtBlock());
    else if (id === N.LN_CT_SdtBlock_sdtEndContent) {
      const ended = this.blocks.pop();
      this.endDeferred ||= ended?.emitted ?? false;
    } else return false;
    return true;
  }

  /** Resolves the original building-block modifiers sent directly by the sdtPr properties context. @param modifier - Source SdtPr child. @returns Whether consumed. */
  sprm(modifier: Sprm): boolean {
    const block = this.blocks.at(-1);
    if (!block) return false;
    const id = modifier.getId();
    const value = modifier.getValue();
    switch (id) {
      case N.LN_CT_SdtPr_docPartObj:
      case N.LN_CT_SdtPr_docPartList: {
        const part: DocPartSdt["part"] = {};
        const receiver: Properties = {
          /** DocPart uses child resources rather than attributes. @returns Nothing. */
          attribute() {},
          /** Captures the original lexical string projection. @param child - DocPart property. @returns Nothing. */
          sprm(child) {
            const key = partIds.get(child.getId());
            const value = child.getValue();
            if (key && value) {
              const string = value.getString();
              part[key] = text(string);
              string.dispose();
            }
          },
        };
        resolveReturnedReference(modifier.getProps(), receiver);
        block.part = { kind: id === N.LN_CT_SdtPr_docPartObj ? "docPartObj" : "docPartList", part };
        break;
      }
      case N.LN_CT_SdtPr_id:
        if (value) block.extras.id = value.getInt();
        break;
      case N.LN_CT_SdtPr_alias:
      case N.LN_CT_SdtPr_tag:
      case N.LN_CT_SdtPr_lock:
        if (value) {
          const string = value.getString();
          block.extras[
            id === N.LN_CT_SdtPr_alias ? "alias" : id === N.LN_CT_SdtPr_tag ? "tag" : "lock"
          ] = text(string);
          string.dispose();
        }
        break;
      default:
        return false;
    }
    return true;
  }

  /** Emits the original paragraph interop fields at the next paragraph boundary. @param context - Actually imported paragraph map. @returns Nothing. */
  FinishParagraph(context: PropertyMap | null): void {
    if (!context) return;
    if (this.endDeferred) {
      const end = new Any(true);
      try {
        context.Insert(P.PROP_PARA_SDT_END_BEFORE, end, true, GrabBagType.PARA_GRAB_BAG);
      } finally {
        end.dispose();
      }
      this.endDeferred = false;
    }
    const block = this.blocks.at(-1);
    if (!block?.part || block.emitted) return;
    const bag = makeDocPartSdt({ ...block.part, ...block.extras });
    try {
      context.Insert(P.PROP_SDTPR, bag, true, GrabBagType.PARA_GRAB_BAG);
    } finally {
      bag.dispose();
    }
    block.emitted = true;
  }
}
