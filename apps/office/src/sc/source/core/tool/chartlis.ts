/** @fileoverview Native ScChartListener value ownership from chartlis.cxx. Live chart notification,external links,UNO and Idle collection scheduling are not yet bound. */
import { SvtListener } from "../../../../svl/source/notify/listener";
import type { SfxHint } from "../../../../svl/inc/hint";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScRangeList } from "../../../inc/rangelst";
import type { ScTokenRef } from "../../../inc/types";
import { getRangeListFromTokens, getTokensFromRangeList } from "../../../inc/reftokenhelper";

/** Original listener's name,document,token vector and independent used/dirty flags. */
export class ScChartListener extends SvtListener<SfxHint> {
  private readonly maName: OUString;
  private maTokens: ScTokenRef[];
  private bUsed = false;
  private bDirty = false;

  /** Original range-list and by-value token-vector overloads. Tokens retain their actual native identity under the shared GC adaptation. @param name - Original name value. @param mrDoc - Actual document owner. @param source - Original ranges or copied vector. @returns Listener. */
  constructor(
    name: OUStringConstReference,
    private readonly mrDoc: ScDocument,
    source: ScRangeList | readonly ScTokenRef[],
  ) {
    super();
    this.maName = new OUString(name);
    if (source instanceof ScRangeList) {
      this.maTokens = [];
      getTokensFromRangeList(mrDoc, this.maTokens, source);
    } else this.maTokens = [...source];
  }
  /** Borrows the original stable name member. @returns Const name reference. */
  GetName(): OUStringConstReference {
    return this.maName;
  }
  /** Reads the original unused-by-default state. @returns Used flag. */
  IsUsed(): boolean {
    return this.bUsed;
  }
  /** Stores the original used flag independently of dirtiness. @param used - New value. @returns Nothing. */
  SetUsed(used: boolean): void {
    this.bUsed = used;
  }
  /** Reads original clean-by-default state. @returns Dirty flag. */
  IsDirty(): boolean {
    return this.bDirty;
  }
  /** Stores the original dirty flag without implicitly starting the collection timer. @param dirty - New value. @returns Nothing. */
  SetDirty(dirty: boolean): void {
    this.bDirty = dirty;
  }
  /** Original allocates a fresh list and extracts at the default origin with default internal-reference admission. @returns Independent range values. */
  GetRangeList(): ScRangeList {
    const result = new ScRangeList();
    getRangeListFromTokens(this.mrDoc, result, this.maTokens, new ScAddress());
    return result;
  }
  /** Original converts into a new vector then swaps without changing flags,name or document. @param ranges - Actual source ranges. @returns Nothing. */
  SetRangeList(ranges: ScRangeList): void {
    const tokens: ScTokenRef[] = [];
    getTokensFromRangeList(this.mrDoc, tokens, ranges);
    this.maTokens = tokens;
  }
  /** Original equality compares document,name,flags,emptiness and token pointer identities,not numerical range equality. @param other - Native listener. @returns Equal. */
  equals(other: ScChartListener): boolean {
    const first = this.maTokens.length !== 0,
      second = other.maTokens.length !== 0;
    if (
      this.mrDoc !== other.mrDoc ||
      this.bUsed !== other.bUsed ||
      this.bDirty !== other.bDirty ||
      !this.GetName().equals(other.GetName()) ||
      first !== second
    )
      return false;
    if (!first && !second) return true;
    return (
      this.maTokens.length === other.maTokens.length &&
      this.maTokens.every(
        /** Native intrusive-pointer vector comparison preserves pointee identity. @param token - Actual token. @param index - Position. @returns Same token. */
        (token, index) => token === other.maTokens[index],
      )
    );
  }
  /** Original inequality delegates to equality. @param other - Native listener. @returns Unequal. */
  notEquals(other: ScChartListener): boolean {
    return !this.equals(other);
  }
  /** Explicit destruction releases the owned name and inherited broadcaster registrations. Live chart listening is not exposed by this ownership slice. @returns Nothing. */
  override Dispose(): void {
    this.maName.dispose();
    super.Dispose();
  }
}
