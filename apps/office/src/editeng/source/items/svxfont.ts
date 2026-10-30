/** @fileoverview Original SvxFont value constructors, assignment and consumed case/escapement/proportion fields. Device rendering and automatic escapement adjustment remain separate. */
import { Font, type ConstFont } from "../../../vcl/source/font/font";
import { LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import { SvxCaseMap } from "../../inc/svxenum";
/** Original derived font value used by ContentNode's cached default font. */
export class SvxFont extends Font {
  private eCaseMap = SvxCaseMap.NotMapped;
  private nEsc = 0;
  private nPropr = 100;
  /** Original default/base-font/copy constructor differences, including reset-to-SYSTEM for a base-font operand. @param source - Original source value. @param base - Erased explicit base-reference overload selector. @returns Font. */
  constructor(source?: ConstFont, base?: true) {
    super(source);
    if (source instanceof SvxFont && base !== true) {
      this.nEsc = source.GetEscapement();
      this.nPropr = source.GetPropr();
      this.eCaseMap = source.GetCaseMap();
      this.SetLanguage(source.GetLanguage());
    } else this.SetLanguage(LANGUAGE_SYSTEM);
  }
  /** Original overload-selected assignment; a base-font assignment leaves derived scalar fields untouched. @param source - Actual base or derived font. @param base - Erased explicit base-reference overload selector. @returns This value. */
  override assign(source: ConstFont, base?: true): this {
    super.assign(source);
    if (source instanceof SvxFont && base !== true) {
      this.eCaseMap = source.eCaseMap;
      this.nEsc = source.nEsc;
      this.nPropr = source.nPropr;
    }
    return this;
  }
  /** Original signed16 escapement value. @returns Stored value. */
  GetEscapement(): number {
    return this.nEsc;
  }
  /** Original signed16 assignment. @param value - Source short. @returns Nothing. */
  SetEscapement(value: number): void {
    this.nEsc = (value << 16) >> 16;
  }
  /** Original unsigned8 proportion. @returns Stored value. */
  GetPropr(): number {
    return this.nPropr;
  }
  /** Original unsigned8 assignment. @param value - Source byte. @returns Nothing. */
  SetPropr(value: number): void {
    this.nPropr = value & 0xff;
  }
  /** Original integral relative scaling and unsigned8 narrowing. @param value - Original unsigned8 multiplier. @returns Nothing. */
  SetProprRel(value: number): void {
    this.SetPropr(Math.trunc(((value & 0xff) * this.nPropr) / 100));
  }
  /** Original case-map value. @returns Stored enum. */
  GetCaseMap(): SvxCaseMap {
    return this.eCaseMap;
  }
  /** Original direct case-map assignment. @param value - Source enum. @returns Nothing. */
  SetCaseMap(value: SvxCaseMap): void {
    this.eCaseMap = value;
  }
  /** Original active-map predicate. @returns Source predicate. */
  IsCaseMap(): boolean {
    return this.eCaseMap !== SvxCaseMap.NotMapped;
  }
  /** Original small-caps predicate. @returns Source predicate. */
  IsCapital(): boolean {
    return this.eCaseMap === SvxCaseMap.SmallCaps;
  }
  /** Original active-escapement predicate. @returns Source predicate. */
  IsEsc(): boolean {
    return this.nEsc !== 0;
  }
  /** Original derived-field-only equality, deliberately independent of base Font data. @param source - Compared derived font. @returns Source subset equality. */
  SvxFontSubsetEquals(source: SvxFont): boolean {
    return (
      this.nEsc === source.GetEscapement() &&
      this.nPropr === source.GetPropr() &&
      this.eCaseMap === source.GetCaseMap()
    );
  }
}
