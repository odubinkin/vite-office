/** @fileoverview Original GlobalTransferCommandArgument.idl defaults, generated compound value and cached type binding; fields retain actual RTL/UNO owners. */
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import {
  TransferCommandOperation,
  cppu_detail_getUnoType_TransferCommandOperation as operationType,
} from "./TransferCommandOperation";
/** Original initialized compound address. */
interface Address {
  get(offset: number): unknown;
}
/** Original borrowed field projection. */
export interface GlobalTransferCommandArgumentConstReference {
  readonly Operation: TransferCommandOperation;
  readonly SourceURL: OUStringConstReference;
  readonly TargetURL: OUStringConstReference;
  readonly NewTitle: OUStringConstReference;
  readonly NameClash: number;
}
const the_type: [R | null] = [null];
/** Original normal cached generated struct type, with source base and member order. @returns Borrowed shared type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.GlobalTransferCommandArgument\0"),
      null,
      5,
      [
        operationType().getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original generated compound value, with source field-copy and lifetime semantics. */
export class GlobalTransferCommandArgument {
  /** Compiler field projection borrows initialized addresses without constructing new field owners. @param address - Existing compound address. @returns Borrowed fields. */
  static unacquired(address: Address): GlobalTransferCommandArgumentConstReference {
    return {
      /** Original Operation field. @returns Borrowed declared value. */ get Operation() {
        return (address.get(0) as [TransferCommandOperation])[0];
      },
      /** Original SourceURL field. @returns Borrowed declared value. */ get SourceURL() {
        return OUString.unacquired(address.get(8) as Parameters<typeof OUString.unacquired>[0]);
      },
      /** Original TargetURL field. @returns Borrowed declared value. */ get TargetURL() {
        return OUString.unacquired(address.get(16) as Parameters<typeof OUString.unacquired>[0]);
      },
      /** Original NewTitle field. @returns Borrowed declared value. */ get NewTitle() {
        return OUString.unacquired(address.get(24) as Parameters<typeof OUString.unacquired>[0]);
      },
      /** Original NameClash field. @returns Borrowed declared value. */ get NameClash() {
        return (address.get(32) as [number])[0];
      },
    };
  }
  private readonly fieldOperation: [TransferCommandOperation] = [TransferCommandOperation.COPY];
  private readonly fieldSourceURL: OUString = new OUString();
  private readonly fieldTargetURL: OUString = new OUString();
  private readonly fieldNewTitle: OUString = new OUString();
  private readonly fieldNameClash: [number] = [0];
  /** Original default/copy/all-member constructor overloads. @param args - Declared native arguments. @returns Owned value. */
  constructor(
    ...args:
      | []
      | [source: GlobalTransferCommandArgumentConstReference]
      | [
          Operation: TransferCommandOperation,
          SourceURL: OUStringConstReference,
          TargetURL: OUStringConstReference,
          NewTitle: OUStringConstReference,
          NameClash: number,
        ]
  ) {
    if (args.length === 1) GlobalTransferCommandArgument.prototype.assign.call(this, args[0]);
    else if (args.length === 5) {
      this.Operation = args[0];
      this.SourceURL = args[1];
      this.TargetURL = args[2];
      this.NewTitle = args[3];
      this.NameClash = args[4];
    }
  }
  /** Original Operation member. @returns Stable field value or owner. */ get Operation(): TransferCommandOperation {
    return this.fieldOperation[0];
  }
  /** Original Operation assignment. @param value - Borrowed field input. @returns Nothing. */ set Operation(
    value: TransferCommandOperation,
  ) {
    this.fieldOperation[0] = (value | 0) as TransferCommandOperation;
  }
  /** Original SourceURL member. @returns Stable field value or owner. */ get SourceURL(): OUString {
    return this.fieldSourceURL;
  }
  /** Original SourceURL assignment. @param value - Borrowed field input. @returns Nothing. */ set SourceURL(
    value: OUStringConstReference,
  ) {
    this.fieldSourceURL.assign(value);
  }
  /** Original TargetURL member. @returns Stable field value or owner. */ get TargetURL(): OUString {
    return this.fieldTargetURL;
  }
  /** Original TargetURL assignment. @param value - Borrowed field input. @returns Nothing. */ set TargetURL(
    value: OUStringConstReference,
  ) {
    this.fieldTargetURL.assign(value);
  }
  /** Original NewTitle member. @returns Stable field value or owner. */ get NewTitle(): OUString {
    return this.fieldNewTitle;
  }
  /** Original NewTitle assignment. @param value - Borrowed field input. @returns Nothing. */ set NewTitle(
    value: OUStringConstReference,
  ) {
    this.fieldNewTitle.assign(value);
  }
  /** Original NameClash member. @returns Stable field value or owner. */ get NameClash(): number {
    return this.fieldNameClash[0];
  }
  /** Original NameClash assignment. @param value - Borrowed field input. @returns Nothing. */ set NameClash(
    value: number,
  ) {
    this.fieldNameClash[0] = value | 0;
  }
  /** Original memberwise assignment. @param source - Borrowed compound value. @returns This owner. */
  assign(source: GlobalTransferCommandArgumentConstReference): this {
    this.Operation = source.Operation;
    this.SourceURL = source.SourceURL;
    this.TargetURL = source.TargetURL;
    this.NewTitle = source.NewTitle;
    this.NameClash = source.NameClash;
    return this;
  }
  /** Original generated equality in declared field order. @param other - Compared compound. @returns Equality. */
  equals(other: GlobalTransferCommandArgumentConstReference): boolean {
    return (
      this.Operation === other.Operation &&
      this.fieldSourceURL.equals(other.SourceURL) &&
      this.fieldTargetURL.equals(other.TargetURL) &&
      this.fieldNewTitle.equals(other.NewTitle) &&
      this.NameClash === other.NameClash
    );
  }
  /** Original generated inequality. @param other - Compared compound. @returns Inequality. */
  notEquals(other: GlobalTransferCommandArgumentConstReference): boolean {
    return !GlobalTransferCommandArgument.prototype.equals.call(this, other);
  }
  /** Compiler address projection for declared logical member offsets; invalid offsets are outside the source producer contract. @param offset - Declared member offset. @returns Existing field address. */
  get(offset: number): unknown {
    if (offset === 0) return this.fieldOperation;
    if (offset === 8) return this.fieldSourceURL.getDataAddress();
    if (offset === 16) return this.fieldTargetURL.getDataAddress();
    if (offset === 24) return this.fieldNewTitle.getDataAddress();
    if (offset === 32) return this.fieldNameClash;
    return this.fieldNameClash;
  }
  /** Original reverse field and base destruction. @returns Nothing. */
  dispose(): void {
    this.fieldNewTitle.dispose();
    this.fieldTargetURL.dispose();
    this.fieldSourceURL.dispose();
  }
}
/** Original generated global type getter. @returns Borrowed cached type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
