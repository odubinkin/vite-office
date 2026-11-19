/** @fileoverview Original GlobalTransferCommandArgument2.idl defaults, generated compound value and cached type binding; fields retain actual RTL/UNO owners. */
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { TransferCommandOperation } from "./TransferCommandOperation";
import {
  GlobalTransferCommandArgument,
  type GlobalTransferCommandArgumentConstReference,
  cppu_detail_getUnoType as baseType,
} from "./GlobalTransferCommandArgument";
/** Original initialized compound address. */
interface Address {
  get(offset: number): unknown;
}
/** Original borrowed field projection. */
export interface GlobalTransferCommandArgument2ConstReference extends GlobalTransferCommandArgumentConstReference {
  readonly MimeType: OUStringConstReference;
  readonly DocumentId: OUStringConstReference;
}
const the_type: [R | null] = [null];
/** Original normal cached generated struct type, with source base and member order. @returns Borrowed shared type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.GlobalTransferCommandArgument2\0"),
      baseType().getTypeLibType() as R,
      2,
      [
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original generated compound value, with source field-copy and lifetime semantics. */
export class GlobalTransferCommandArgument2 extends GlobalTransferCommandArgument {
  /** Compiler field projection borrows initialized addresses without constructing new field owners. @param address - Existing compound address. @returns Borrowed fields. */
  static override unacquired(address: Address): GlobalTransferCommandArgument2ConstReference {
    const base = GlobalTransferCommandArgument.unacquired(address);
    return {
      /** Original live inherited enum field. @returns Borrowed value. */ get Operation() {
        return base.Operation;
      },
      /** Original live inherited source URL. @returns Borrowed field. */ get SourceURL() {
        return base.SourceURL;
      },
      /** Original live inherited target URL. @returns Borrowed field. */ get TargetURL() {
        return base.TargetURL;
      },
      /** Original live inherited title. @returns Borrowed field. */ get NewTitle() {
        return base.NewTitle;
      },
      /** Original live inherited clash mode. @returns Borrowed value. */ get NameClash() {
        return base.NameClash;
      },
      /** Original MimeType field. @returns Borrowed declared value. */ get MimeType() {
        return OUString.unacquired(address.get(40) as Parameters<typeof OUString.unacquired>[0]);
      },
      /** Original DocumentId field. @returns Borrowed declared value. */ get DocumentId() {
        return OUString.unacquired(address.get(48) as Parameters<typeof OUString.unacquired>[0]);
      },
    };
  }
  private readonly fieldMimeType: OUString = new OUString();
  private readonly fieldDocumentId: OUString = new OUString();
  /** Original default/copy/all-member constructor overloads. @param args - Declared native arguments. @returns Owned value. */
  constructor(
    ...args:
      | []
      | [source: GlobalTransferCommandArgument2ConstReference]
      | [
          Operation: TransferCommandOperation,
          SourceURL: OUStringConstReference,
          TargetURL: OUStringConstReference,
          NewTitle: OUStringConstReference,
          NameClash: number,
          MimeType: OUStringConstReference,
          DocumentId: OUStringConstReference,
        ]
  ) {
    super();
    if (args.length === 1) GlobalTransferCommandArgument2.prototype.assign.call(this, args[0]);
    else if (args.length === 7) {
      this.Operation = args[0];
      this.SourceURL = args[1];
      this.TargetURL = args[2];
      this.NewTitle = args[3];
      this.NameClash = args[4];
      this.MimeType = args[5];
      this.DocumentId = args[6];
    }
  }
  /** Original MimeType member. @returns Stable field value or owner. */ get MimeType(): OUString {
    return this.fieldMimeType;
  }
  /** Original MimeType assignment. @param value - Borrowed field input. @returns Nothing. */ set MimeType(
    value: OUStringConstReference,
  ) {
    this.fieldMimeType.assign(value);
  }
  /** Original DocumentId member. @returns Stable field value or owner. */ get DocumentId(): OUString {
    return this.fieldDocumentId;
  }
  /** Original DocumentId assignment. @param value - Borrowed field input. @returns Nothing. */ set DocumentId(
    value: OUStringConstReference,
  ) {
    this.fieldDocumentId.assign(value);
  }
  /** Original memberwise assignment. @param source - Borrowed compound value. @returns This owner. */
  override assign(source: GlobalTransferCommandArgument2ConstReference): this {
    super.assign(source);
    this.MimeType = source.MimeType;
    this.DocumentId = source.DocumentId;
    return this;
  }
  /** Original generated equality in declared field order. @param other - Compared compound. @returns Equality. */
  override equals(other: GlobalTransferCommandArgument2ConstReference): boolean {
    return (
      super.equals(other) &&
      this.fieldMimeType.equals(other.MimeType) &&
      this.fieldDocumentId.equals(other.DocumentId)
    );
  }
  /** Original generated inequality. @param other - Compared compound. @returns Inequality. */
  override notEquals(other: GlobalTransferCommandArgument2ConstReference): boolean {
    return !GlobalTransferCommandArgument2.prototype.equals.call(this, other);
  }
  /** Compiler address projection for declared logical member offsets; invalid offsets are outside the source producer contract. @param offset - Declared member offset. @returns Existing field address. */
  override get(offset: number): unknown {
    if (offset === 40) return this.fieldMimeType.getDataAddress();
    if (offset === 48) return this.fieldDocumentId.getDataAddress();
    return super.get(offset);
  }
  /** Original reverse field and base destruction. @returns Nothing. */
  override dispose(): void {
    this.fieldDocumentId.dispose();
    this.fieldMimeType.dispose();
    super.dispose();
  }
}
/** Original generated global type getter. @returns Borrowed cached type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
