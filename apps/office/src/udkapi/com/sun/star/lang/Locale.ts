/** @fileoverview Original Locale.idl string fields and cppumaker plain-struct value semantics, reusing the shared OUString owner. */
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";

/** Original borrowed const Locale value; fields retain actual shared string identity. */
export interface LocaleConstReference {
  readonly Language: OUStringConstReference;
  readonly Country: OUStringConstReference;
  readonly Variant: OUStringConstReference;
}

/** Original three-member UNO value struct; explicit copy/move/lifetime methods adapt implicit C++ special members. */
export class Locale implements LocaleConstReference {
  private fields: { Language: OUString; Country: OUString; Variant: OUString };

  /** Original default, implicit copy and three-field constructors. @param args - Native constructor arguments in IDL field order. @returns Initialized value owner. */
  constructor(
    ...args:
      | []
      | [source: LocaleConstReference]
      | [
          Language: OUStringConstReference,
          Country: OUStringConstReference,
          Variant: OUStringConstReference,
        ]
  ) {
    if (args.length === 0) {
      this.fields = { Language: new OUString(), Country: new OUString(), Variant: new OUString() };
    } else if (args.length === 1) {
      this.fields = {
        Language: new OUString(args[0].Language),
        Country: new OUString(args[0].Country),
        Variant: new OUString(args[0].Variant),
      };
    } else {
      this.fields = {
        Language: new OUString(args[0]),
        Country: new OUString(args[1]),
        Variant: new OUString(args[2]),
      };
    }
  }

  /** Original Language field. @returns Stable mutable string field owner. */
  get Language(): OUString {
    return this.fields.Language;
  }
  /** Original string-field copy assignment. @param value - Borrowed source. @returns Nothing. */
  set Language(value: OUStringConstReference) {
    this.fields.Language.assign(value);
  }
  /** Original Country field. @returns Stable mutable string field owner. */
  get Country(): OUString {
    return this.fields.Country;
  }
  /** Original string-field copy assignment. @param value - Borrowed source. @returns Nothing. */
  set Country(value: OUStringConstReference) {
    this.fields.Country.assign(value);
  }
  /** Original Variant field; no BCP47 validation or normalization occurs in the IDL value type. @returns Stable mutable string field owner. */
  get Variant(): OUString {
    return this.fields.Variant;
  }
  /** Original string-field copy assignment. @param value - Borrowed source. @returns Nothing. */
  set Variant(value: OUStringConstReference) {
    this.fields.Variant.assign(value);
  }

  /** Original implicit memberwise move construction in declaration order. @param source - Live rvalue. @returns Transferred value owner. */
  static move(source: Locale): Locale {
    const result = Object.create(Locale.prototype) as Locale;
    result.fields = {
      Language: OUString.move(source.Language),
      Country: OUString.move(source.Country),
      Variant: OUString.move(source.Variant),
    };
    return result;
  }

  /** Original implicit memberwise copy assignment in declaration order. @param source - Borrowed live value. @returns This value. */
  assign(source: LocaleConstReference): this {
    this.Language = source.Language;
    this.Country = source.Country;
    this.Variant = source.Variant;
    return this;
  }

  /** Original implicit memberwise move assignment. @param source - Live rvalue. @returns This value. */
  moveAssign(source: Locale): this {
    this.Language.moveAssign(source.Language);
    this.Country.moveAssign(source.Country);
    this.Variant.moveAssign(source.Variant);
    return this;
  }

  /** Original generated operator== in IDL declaration order. @param other - Borrowed live value. @returns Exact string-field equality. */
  equals(other: LocaleConstReference): boolean {
    return (
      this.Language.equals(other.Language) &&
      this.Country.equals(other.Country) &&
      this.Variant.equals(other.Variant)
    );
  }

  /** Original generated operator!=. @param other - Borrowed live value. @returns Negated complete value equality. */
  notEquals(other: LocaleConstReference): boolean {
    return !this.equals(other);
  }

  /** Original implicit destructor destroys members in reverse declaration order. @returns Nothing. */
  dispose(): void {
    this.Variant.dispose();
    this.Country.dispose();
    this.Language.dispose();
  }
}
