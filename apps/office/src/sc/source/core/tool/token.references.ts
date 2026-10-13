/** @fileoverview Original Calc reference-token responsibility split from token.cxx; complete single/range/list/table values use existing shared and data owners. */
import { FormulaToken, StackVar } from "../../../../formula/inc/token";
import type { FormulaTokenConstReference } from "../../../../formula/inc/types";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import { OpCode } from "../../../../formula/inc/opcode";
import { ScSingleRefData, ScComplexRefData } from "../../../inc/refdata";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import { ScAddress } from "../../../inc/address";

/** Original single-reference token copies data and borrows sheet limits through ordinary JS references. */
export class ScSingleRefToken extends FormulaToken {
  private readonly mrSheetLimits: ScSheetLimits;
  private readonly aSingleRef: ScSingleRefData;
  /** Original data/default-opcode and implicit copy construction. @param args - Bounds/data/opcode or copied token. @returns Reference token. */
  constructor(
    ...args:
      | [source: ScSingleRefToken]
      | [limits: ScSheetLimits, reference: Readonly<ScSingleRefData>, opcode?: OpCode]
  ) {
    const first = args[0];
    super(
      first instanceof ScSingleRefToken ? first : StackVar.svSingleRef,
      args[2] ?? OpCode.ocPush,
    );
    this.mrSheetLimits = first instanceof ScSingleRefToken ? first.mrSheetLimits : first;
    this.aSingleRef = new ScSingleRefData(
      first instanceof ScSingleRefToken ? first.aSingleRef : (args[1] as ScSingleRefData),
    );
  }
  /** Original stable mutable member reference, also used by const callers. @returns Owned reference data. */
  GetSingleRef(): ScSingleRefData {
    return this.aSingleRef;
  }
  /** Original base comparison precedes origin-range text comparison using receiver limits. @param token - True matching reference token or base mismatch. @returns Text equality. */
  override TextEqual(token: FormulaTokenConstReference): boolean {
    return (
      super.equals(token) && checkTextEqual(this.mrSheetLimits, this, token as ScSingleRefToken)
    );
  }
  /** Original data equality after base discriminator/opcode equality. @param token - Original compared token. @returns Equality. */
  override equals(token: FormulaTokenConstReference): boolean {
    return (
      super.equals(token) && this.aSingleRef.equals((token as ScSingleRefToken).GetSingleRef())
    );
  }
  /** Original implicit-copy clone has independent member storage and shared limits. @returns Copied token. */
  override Clone(): FormulaToken {
    return new ScSingleRefToken(this);
  }
}

/** Original range-reference token copies both endpoints and trim state, retaining the original bounds owner. */
export class ScDoubleRefToken extends FormulaToken {
  private readonly mrSheetLimits: ScSheetLimits;
  private readonly aDoubleRef: ScComplexRefData;
  /** Original range/default-opcode and implicit copy construction. @param args - Bounds/data/opcode or copied token. @returns Range token. */
  constructor(
    ...args:
      | [source: ScDoubleRefToken]
      | [limits: ScSheetLimits, reference: ScComplexRefData, opcode?: OpCode]
  ) {
    const first = args[0];
    super(
      first instanceof ScDoubleRefToken ? first : StackVar.svDoubleRef,
      args[2] ?? OpCode.ocPush,
    );
    this.mrSheetLimits = first instanceof ScDoubleRefToken ? first.mrSheetLimits : first;
    this.aDoubleRef = new ScComplexRefData(
      first instanceof ScDoubleRefToken ? first.aDoubleRef : (args[1] as ScComplexRefData),
    );
  }
  /** Original first endpoint member reference. @returns Owned endpoint. */
  GetSingleRef(): ScSingleRefData {
    return this.aDoubleRef.Ref1;
  }
  /** Original stable mutable range member reference. @returns Owned range data. */
  GetDoubleRef(): ScComplexRefData {
    return this.aDoubleRef;
  }
  /** Original second endpoint member reference. @returns Owned endpoint. */
  GetSingleRef2(): ScSingleRefData {
    return this.aDoubleRef.Ref2;
  }
  /** Original base guard and origin-range text comparison with receiver limits. @param token - True matching range token or base mismatch. @returns Text equality. */
  override TextEqual(token: FormulaTokenConstReference): boolean {
    return (
      super.equals(token) && checkTextEqual(this.mrSheetLimits, this, token as ScDoubleRefToken)
    );
  }
  /** Original range data equality; original reference-data comparison ignores trim state. @param token - Compared token. @returns Equality. */
  override equals(token: FormulaTokenConstReference): boolean {
    return (
      super.equals(token) && this.aDoubleRef.equals((token as ScDoubleRefToken).GetDoubleRef())
    );
  }
  /** Original implicit-copy clone keeps independent endpoint owners and shared bounds. @returns Copied token. */
  override Clone(): FormulaToken {
    return new ScDoubleRefToken(this);
  }
}

/** Original matching-reference text helper uses origin-normalized ranges and exact endpoint flags. @param limits - Receiver bounds. @param left - True reference token. @param right - Same concrete tag/opcode token. @returns Text equality. */
function checkTextEqual(
  limits: ScSheetLimits,
  left: ScSingleRefToken | ScDoubleRefToken,
  right: ScSingleRefToken | ScDoubleRefToken,
): boolean {
  const temp1 = new ScComplexRefData();
  if (left.GetType() === StackVar.svSingleRef) {
    temp1.Ref1.assign(left.GetSingleRef());
    temp1.Ref2.assign(temp1.Ref1);
  } else temp1.assign((left as ScDoubleRefToken).GetDoubleRef());
  const temp2 = new ScComplexRefData();
  if (right.GetType() === StackVar.svSingleRef) {
    temp2.Ref1.assign(right.GetSingleRef());
    temp2.Ref2.assign(temp2.Ref1);
  } else temp2.assign((right as ScDoubleRefToken).GetDoubleRef());
  const origin = new ScAddress();
  const range1 = temp1.toAbs(limits, origin),
    range2 = temp2.toAbs(limits, origin);
  return (
    range1.equals(range2) &&
    temp1.Ref1.FlagValue() === temp2.Ref1.FlagValue() &&
    temp1.Ref2.FlagValue() === temp2.Ref2.FlagValue()
  );
}

/** Original union-result token has a value-owned list and list-object identity equality. */
export class ScRefListToken extends FormulaToken {
  private readonly aRefList: ScComplexRefData[] = [];
  private readonly mbArrayResult: boolean;
  /** Original default/bool and implicit copy/move construction; witness restores erased rvalue category. @param args - Array marker or source/category. @returns Token. */
  constructor(
    ...args:
      [] | [arrayResult: boolean] | [source: ScRefListToken, category?: typeof ScRefListToken.move]
  ) {
    const source = args[0] ?? false;
    super(source instanceof ScRefListToken ? source : StackVar.svRefList);
    this.mbArrayResult = source instanceof ScRefListToken ? source.mbArrayResult : source;
    if (source instanceof ScRefListToken) {
      if (args[1] === ScRefListToken.move) {
        for (const ref of source.aRefList) this.aRefList.push(ref);
        source.aRefList.length = 0;
      } else for (const ref of source.aRefList) this.aRefList.push(new ScComplexRefData(ref));
    }
  }
  /** Original implicit vector move retains source list owner and transfers its elements. @param source - Rvalue source. @returns Moved token. */
  static move(source: ScRefListToken): ScRefListToken {
    return new ScRefListToken(source, ScRefListToken.move);
  }
  /** Original stable mutable vector value, also used by const callers. @returns Owned list. */
  GetRefList(): ScComplexRefData[] {
    return this.aRefList;
  }
  /** Original array-result marker. @returns Marker. */
  IsArrayResult(): boolean {
    return this.mbArrayResult;
  }
  /** Original base discriminator, vector-object identity and array-result comparison. @param token - Genuine list token or base mismatch. @returns Equality. */
  override equals(token: FormulaTokenConstReference): boolean {
    if (!super.equals(token)) return false;
    const other = token as ScRefListToken;
    if (this.aRefList !== other.GetRefList()) return false;
    return this.mbArrayResult === other.IsArrayResult();
  }
  /** Original implicit-copy clone copies list values independently. @returns Copied token. */
  override Clone(): ScRefListToken {
    return new ScRefListToken(this);
  }
}

/** Original structured-reference Item constants and retained RPN-area token. */
export class ScTableRefToken extends FormulaToken {
  static readonly Item = {
    TABLE: 0,
    ALL: 1,
    HEADERS: 2,
    DATA: 4,
    TOTALS: 8,
    THIS_ROW: 16,
    HEADERS_DATA: 6,
    DATA_TOTALS: 12,
  } as const;
  private mxAreaRefRPN: FormulaToken | null = null;
  private mnIndex: number;
  private meItem: number;
  /** Original explicit constructor and area-cloning copy constructor. @param args - Index/item or copied token. @returns Table reference. */
  constructor(...args: [index: number, item: number] | [source: ScTableRefToken]) {
    const source = args[0];
    super(source instanceof ScTableRefToken ? source : StackVar.svIndex, OpCode.ocTableRef);
    if (source instanceof ScTableRefToken) {
      this.mxAreaRefRPN = source.mxAreaRefRPN ? source.mxAreaRefRPN.Clone() : null;
      this.mnIndex = source.mnIndex;
      this.meItem = source.meItem;
    } else {
      this.mnIndex = source & 0xffff;
      this.meItem = args[1] as number;
    }
  }
  /** Original UInt16 table/database index. @returns Index. */
  GetIndex(): number {
    return this.mnIndex;
  }
  /** Original UInt16 index update. @param value - Index. @returns Nothing. */
  SetIndex(value: number): void {
    this.mnIndex = value & 0xffff;
  }
  /** Original item bit set. @returns Item. */
  GetItem(): number {
    return this.meItem;
  }
  /** Original item union; only initialized original enum domain is certified. @param item - Added item flags. @returns Nothing. */
  AddItem(item: number): void {
    this.meItem = this.meItem | item;
  }
  /** Original nullable area token retained by ordinary reference. @param token - Actual area token. @returns Nothing. */
  SetAreaRefRPN(token: FormulaToken | null): void {
    this.mxAreaRefRPN = token;
  }
  /** Original current borrowed area token. @returns Area. */
  GetAreaRefRPN(): FormulaToken | null {
    return this.mxAreaRefRPN;
  }
  /** Original index/item/null-area/value comparisons after base guard. @param token - Genuine table token or base mismatch. @returns Equality. */
  override equals(token: FormulaTokenConstReference): boolean {
    if (!super.equals(token)) return false;
    const other = token as ScTableRefToken;
    if (this.mnIndex !== other.GetIndex()) return false;
    if (this.meItem !== other.GetItem()) return false;
    if (!this.mxAreaRefRPN && !other.mxAreaRefRPN) {
      /* Original both-null case. */
    } else if (!this.mxAreaRefRPN || !other.mxAreaRefRPN) return false;
    else if (!this.mxAreaRefRPN.equals(other.mxAreaRefRPN)) return false;
    return true;
  }
  /** Original explicit copy clones the RPN area if present. @returns Copied token. */
  override Clone(): ScTableRefToken {
    return new ScTableRefToken(this);
  }
}

/** Original external token base stores file index and discriminator; concrete construction uses the protected native boundary. */
export class ScExternalToken extends FormulaToken {
  private readonly mnFileId: number;
  /** Original typed construction or base-field copy for actual derived owners. @param source - Type or copied owner. @param opcode - Explicit native opcode. @param fileId - UInt16 index. @returns Base. */
  protected constructor(source: StackVar | ScExternalToken, opcode: OpCode, fileId: number) {
    super(source, opcode);
    this.mnFileId = source instanceof ScExternalToken ? source.mnFileId : fileId & 0xffff;
  }
  /** Original external document index. @returns UInt16 file id. */
  GetFileId(): number {
    return this.mnFileId;
  }
  /** Original base discriminator/opcode/file equality. @param token - True external owner or base mismatch. @returns Equality. */
  override equals(token: FormulaTokenConstReference): boolean {
    if (!super.equals(token)) return false;
    return this.mnFileId === (token as ScExternalToken).mnFileId;
  }
}

/** Original external reference token owns value members and retains literal ocPush. */
export class ScExternalSingleRefToken extends ScExternalToken {
  private readonly maTabName: SharedString;
  private readonly maSingleRef: ScSingleRefData;
  /** Original value/copy/implicit move construction; witnesses restore erased rvalue categories. @param args - File/string/data or copied/moved owner. @returns Token. */
  constructor(
    ...args:
      | [source: ScExternalSingleRefToken, category?: typeof ScExternalSingleRefToken.move]
      | [
          fileId: number,
          name: SharedStringConstReference,
          reference: Readonly<ScSingleRefData>,
          category?: typeof SharedString.move,
        ]
  ) {
    const source = args[0];
    super(
      source instanceof ScExternalSingleRefToken ? source : StackVar.svExternalSingleRef,
      OpCode.ocPush,
      source instanceof ScExternalSingleRefToken ? 0 : source,
    );
    if (source instanceof ScExternalSingleRefToken) {
      this.maTabName =
        args[1] === ScExternalSingleRefToken.move
          ? SharedString.move(source.maTabName)
          : new SharedString(source.maTabName);
      this.maSingleRef = new ScSingleRefData(source.maSingleRef);
    } else {
      this.maTabName =
        args[3] === SharedString.move
          ? SharedString.move(args[1] as SharedString)
          : new SharedString(args[1] as SharedStringConstReference);
      this.maSingleRef = new ScSingleRefData(args[2] as ScSingleRefData);
    }
  }
  /** Original implicit move transfers only the string member and copies reference/base values. @param source - Rvalue owner. @returns Moved token. */
  static move(source: ScExternalSingleRefToken): ScExternalSingleRefToken {
    return new ScExternalSingleRefToken(source, ScExternalSingleRefToken.move);
  }
  /** Original stable const shared-string member. @returns Borrowed member. */
  GetTableName(): SharedStringConstReference {
    return this.maTabName;
  }
  /** Original stable mutable single reference, also used by const callers. @returns Owned data. */
  GetSingleRef(): ScSingleRefData {
    return this.maSingleRef;
  }
  /** Original file/base/string/data value comparison using actual owners. @param token - Genuine external token or base mismatch. @returns Equality. */
  override equals(token: FormulaTokenConstReference): boolean {
    if (!super.equals(token)) return false;
    const other = token as ScExternalSingleRefToken;
    if (!this.maTabName.equals(other.GetTableName())) return false;
    return this.maSingleRef.equals(other.GetSingleRef());
  }
  /** Original implicit-copy clone has independent value members. @returns Copied token. */
  override Clone(): ScExternalSingleRefToken {
    return new ScExternalSingleRefToken(this);
  }
  /** Existing shared-value cleanup boundary; JS GC owns token lifetime. @returns Nothing. */
  override dispose(): void {
    this.maTabName.dispose();
    super.dispose();
  }
}

/** Original external reference token owns value members and retains literal ocPush. */
export class ScExternalDoubleRefToken extends ScExternalToken {
  private readonly maTabName: SharedString;
  private readonly maDoubleRef: ScComplexRefData;
  /** Original value/copy/implicit move construction; witnesses restore erased rvalue categories. @param args - File/string/data or copied/moved owner. @returns Token. */
  constructor(
    ...args:
      | [source: ScExternalDoubleRefToken, category?: typeof ScExternalDoubleRefToken.move]
      | [
          fileId: number,
          name: SharedStringConstReference,
          reference: ScComplexRefData,
          category?: typeof SharedString.move,
        ]
  ) {
    const source = args[0];
    super(
      source instanceof ScExternalDoubleRefToken ? source : StackVar.svExternalDoubleRef,
      OpCode.ocPush,
      source instanceof ScExternalDoubleRefToken ? 0 : source,
    );
    if (source instanceof ScExternalDoubleRefToken) {
      this.maTabName =
        args[1] === ScExternalDoubleRefToken.move
          ? SharedString.move(source.maTabName)
          : new SharedString(source.maTabName);
      this.maDoubleRef = new ScComplexRefData(source.maDoubleRef);
    } else {
      this.maTabName =
        args[3] === SharedString.move
          ? SharedString.move(args[1] as SharedString)
          : new SharedString(args[1] as SharedStringConstReference);
      this.maDoubleRef = new ScComplexRefData(args[2] as ScComplexRefData);
    }
  }
  /** Original implicit move transfers only the string member and copies reference/base values. @param source - Rvalue owner. @returns Moved token. */
  static move(source: ScExternalDoubleRefToken): ScExternalDoubleRefToken {
    return new ScExternalDoubleRefToken(source, ScExternalDoubleRefToken.move);
  }
  /** Original stable const shared-string member. @returns Borrowed member. */
  GetTableName(): SharedStringConstReference {
    return this.maTabName;
  }
  /** Original first range endpoint reference. @returns Owned first endpoint. */
  GetSingleRef(): ScSingleRefData {
    return this.maDoubleRef.Ref1;
  }
  /** Original const second endpoint reference. @returns Owned second endpoint. */
  GetSingleRef2(): Readonly<ScSingleRefData> {
    return this.maDoubleRef.Ref2;
  }
  /** Original stable mutable range member. @returns Owned data. */
  GetDoubleRef(): ScComplexRefData {
    return this.maDoubleRef;
  }
  /** Original file/base/string/data value comparison using actual owners. @param token - Genuine external token or base mismatch. @returns Equality. */
  override equals(token: FormulaTokenConstReference): boolean {
    if (!super.equals(token)) return false;
    const other = token as ScExternalDoubleRefToken;
    if (!this.maTabName.equals(other.GetTableName())) return false;
    return this.maDoubleRef.equals(other.GetDoubleRef());
  }
  /** Original implicit-copy clone has independent value members. @returns Copied token. */
  override Clone(): ScExternalDoubleRefToken {
    return new ScExternalDoubleRefToken(this);
  }
  /** Existing shared-value cleanup boundary; JS GC owns token lifetime. @returns Nothing. */
  override dispose(): void {
    this.maTabName.dispose();
    super.dispose();
  }
}

/** Original external name token owns value members and retains literal ocPush. */
export class ScExternalNameToken extends ScExternalToken {
  private readonly maName: SharedString;
  /** Original value/copy/implicit move construction; witnesses restore erased rvalue categories. @param args - File/string/data or copied/moved owner. @returns Token. */
  constructor(
    ...args:
      | [source: ScExternalNameToken, category?: typeof ScExternalNameToken.move]
      | [fileId: number, name: SharedStringConstReference, category?: typeof SharedString.move]
  ) {
    const source = args[0];
    super(
      source instanceof ScExternalNameToken ? source : StackVar.svExternalName,
      OpCode.ocPush,
      source instanceof ScExternalNameToken ? 0 : source,
    );
    if (source instanceof ScExternalNameToken) {
      this.maName =
        args[1] === ScExternalNameToken.move
          ? SharedString.move(source.maName)
          : new SharedString(source.maName);
    } else {
      this.maName =
        args[2] === SharedString.move
          ? SharedString.move(args[1] as SharedString)
          : new SharedString(args[1] as SharedStringConstReference);
    }
  }
  /** Original implicit move transfers only the string member and copies reference/base values. @param source - Rvalue owner. @returns Moved token. */
  static move(source: ScExternalNameToken): ScExternalNameToken {
    return new ScExternalNameToken(source, ScExternalNameToken.move);
  }
  /** Original stable const shared-string member. @returns Borrowed member. */
  GetName(): SharedStringConstReference {
    return this.maName;
  }
  /** Original file/base/string value comparison using actual owners. @param token - Genuine external token or base mismatch. @returns Equality. */
  override equals(token: FormulaTokenConstReference): boolean {
    if (!super.equals(token)) return false;
    const other = token as ScExternalNameToken;
    return this.maName.equals(other.maName);
  }
  /** Original implicit-copy clone has independent value members. @returns Copied token. */
  override Clone(): ScExternalNameToken {
    return new ScExternalNameToken(this);
  }
  /** Existing shared-value cleanup boundary; JS GC owns token lifetime. @returns Nothing. */
  override dispose(): void {
    this.maName.dispose();
    super.dispose();
  }
}
