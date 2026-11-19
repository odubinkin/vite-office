/** @fileoverview Original CheckinArgument.idl defaults, generated compound value and cached type binding; fields retain actual RTL/UNO owners. */
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Original initialized compound address. */
interface Address {
  get(offset: number): unknown;
}
/** Original borrowed field projection. */
export interface CheckinArgumentConstReference {
  readonly MajorVersion: boolean;
  readonly VersionComment: OUStringConstReference;
  readonly SourceURL: OUStringConstReference;
  readonly TargetURL: OUStringConstReference;
  readonly NewTitle: OUStringConstReference;
  readonly MimeType: OUStringConstReference;
}
const the_type: [R | null] = [null];
/** Original normal cached generated struct type, with source base and member order. @returns Borrowed shared type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.CheckinArgument\0"),
      null,
      6,
      [
        UnoType.get("bool").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original generated compound value, with source field-copy and lifetime semantics. */
export class CheckinArgument {
  /** Compiler field projection borrows initialized addresses without constructing new field owners. @param address - Existing compound address. @returns Borrowed fields. */
  static unacquired(address: Address): CheckinArgumentConstReference {
    return {
      /** Original MajorVersion field. @returns Borrowed declared value. */ get MajorVersion() {
        return (address.get(0) as [boolean])[0];
      },
      /** Original VersionComment field. @returns Borrowed declared value. */ get VersionComment() {
        return OUString.unacquired(address.get(8) as Parameters<typeof OUString.unacquired>[0]);
      },
      /** Original SourceURL field. @returns Borrowed declared value. */ get SourceURL() {
        return OUString.unacquired(address.get(16) as Parameters<typeof OUString.unacquired>[0]);
      },
      /** Original TargetURL field. @returns Borrowed declared value. */ get TargetURL() {
        return OUString.unacquired(address.get(24) as Parameters<typeof OUString.unacquired>[0]);
      },
      /** Original NewTitle field. @returns Borrowed declared value. */ get NewTitle() {
        return OUString.unacquired(address.get(32) as Parameters<typeof OUString.unacquired>[0]);
      },
      /** Original MimeType field. @returns Borrowed declared value. */ get MimeType() {
        return OUString.unacquired(address.get(40) as Parameters<typeof OUString.unacquired>[0]);
      },
    };
  }
  private readonly fieldMajorVersion: [boolean] = [false];
  private readonly fieldVersionComment: OUString = new OUString();
  private readonly fieldSourceURL: OUString = new OUString();
  private readonly fieldTargetURL: OUString = new OUString();
  private readonly fieldNewTitle: OUString = new OUString();
  private readonly fieldMimeType: OUString = new OUString();
  /** Original default/copy/all-member constructor overloads. @param args - Declared native arguments. @returns Owned value. */
  constructor(
    ...args:
      | []
      | [source: CheckinArgumentConstReference]
      | [
          MajorVersion: boolean,
          VersionComment: OUStringConstReference,
          SourceURL: OUStringConstReference,
          TargetURL: OUStringConstReference,
          NewTitle: OUStringConstReference,
          MimeType: OUStringConstReference,
        ]
  ) {
    if (args.length === 1) CheckinArgument.prototype.assign.call(this, args[0]);
    else if (args.length === 6) {
      this.MajorVersion = args[0];
      this.VersionComment = args[1];
      this.SourceURL = args[2];
      this.TargetURL = args[3];
      this.NewTitle = args[4];
      this.MimeType = args[5];
    }
  }
  /** Original MajorVersion member. @returns Stable field value or owner. */ get MajorVersion(): boolean {
    return this.fieldMajorVersion[0];
  }
  /** Original MajorVersion assignment. @param value - Borrowed field input. @returns Nothing. */ set MajorVersion(
    value: boolean,
  ) {
    this.fieldMajorVersion[0] = value;
  }
  /** Original VersionComment member. @returns Stable field value or owner. */ get VersionComment(): OUString {
    return this.fieldVersionComment;
  }
  /** Original VersionComment assignment. @param value - Borrowed field input. @returns Nothing. */ set VersionComment(
    value: OUStringConstReference,
  ) {
    this.fieldVersionComment.assign(value);
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
  /** Original MimeType member. @returns Stable field value or owner. */ get MimeType(): OUString {
    return this.fieldMimeType;
  }
  /** Original MimeType assignment. @param value - Borrowed field input. @returns Nothing. */ set MimeType(
    value: OUStringConstReference,
  ) {
    this.fieldMimeType.assign(value);
  }
  /** Original memberwise assignment. @param source - Borrowed compound value. @returns This owner. */
  assign(source: CheckinArgumentConstReference): this {
    this.MajorVersion = source.MajorVersion;
    this.VersionComment = source.VersionComment;
    this.SourceURL = source.SourceURL;
    this.TargetURL = source.TargetURL;
    this.NewTitle = source.NewTitle;
    this.MimeType = source.MimeType;
    return this;
  }
  /** Original generated equality in declared field order. @param other - Compared compound. @returns Equality. */
  equals(other: CheckinArgumentConstReference): boolean {
    return (
      this.MajorVersion === other.MajorVersion &&
      this.fieldVersionComment.equals(other.VersionComment) &&
      this.fieldSourceURL.equals(other.SourceURL) &&
      this.fieldTargetURL.equals(other.TargetURL) &&
      this.fieldNewTitle.equals(other.NewTitle) &&
      this.fieldMimeType.equals(other.MimeType)
    );
  }
  /** Original generated inequality. @param other - Compared compound. @returns Inequality. */
  notEquals(other: CheckinArgumentConstReference): boolean {
    return !CheckinArgument.prototype.equals.call(this, other);
  }
  /** Compiler address projection for declared logical member offsets; invalid offsets are outside the source producer contract. @param offset - Declared member offset. @returns Existing field address. */
  get(offset: number): unknown {
    if (offset === 0) return this.fieldMajorVersion;
    if (offset === 8) return this.fieldVersionComment.getDataAddress();
    if (offset === 16) return this.fieldSourceURL.getDataAddress();
    if (offset === 24) return this.fieldTargetURL.getDataAddress();
    if (offset === 32) return this.fieldNewTitle.getDataAddress();
    if (offset === 40) return this.fieldMimeType.getDataAddress();
    return this.fieldMimeType.getDataAddress();
  }
  /** Original reverse field and base destruction. @returns Nothing. */
  dispose(): void {
    this.fieldMimeType.dispose();
    this.fieldNewTitle.dispose();
    this.fieldTargetURL.dispose();
    this.fieldSourceURL.dispose();
    this.fieldVersionComment.dispose();
  }
}
/** Original generated global type getter. @returns Borrowed cached type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
