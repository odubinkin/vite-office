/** @fileoverview Genuine raw owner and fresh UTF8 value replay. Every initialized field/array compares live in the native producer; full-row SHA256 retains the oracle without duplicating large compiled tables. */
import { expect, it } from "vitest";
import { createHash } from "node:crypto";
import native from "./rbbidata.native-observations.json" with { type: "json" };
import { RBBIDataHeader, RBBIDataWrapper, RBBIStateTable } from "./rbbidata.h";
import { UnicodeString } from "./unistr";
import { StringPiece } from "./unicode/stringpiece";
/** Actual readable value query contract. */
type Value = ReturnType<RBBIDataWrapper["getRuleSourceString"]>;
/** Reads actual value methods, without an alternate decoder. @param source - Real value owner. @returns Full initialized payload/scalar fields. */
function value(source: Value): number[] {
  const row = [
    Number(source.isBogus()),
    Number(source.getBuffer() === null),
    source.length(),
    Number(source.isEmpty()),
    source.charAt(0),
    source.charAt(source.length()),
    source.char32At(0),
  ];
  for (let i = 0; i < source.length(); ++i) row.push(source.charAt(i));
  return row;
}
/** Reads source table fields and actual stored rows. @param source - Table or null. @returns Complete table state. */
function table(source: RBBIStateTable | null): number[] {
  return source === null
    ? [-1]
    : [
        source.fNumStates,
        source.fRowLen,
        source.fDictCategoriesStart,
        source.fLookAheadResultsSize,
        source.fFlags,
        source.fTableData.length,
        ...source.fTableData,
      ];
}
/** Reads initialized real wrapper fields. Native uninitialized status-count storage is excluded until its table is assigned, exactly as in the witness. @param source - Real owner. @param status - Source status. @param bytes - Actual binary allocation. @returns Complete observed fields. */
function state(source: RBBIDataWrapper, status: number, bytes: Uint8Array): number[] {
  const row = [
    status,
    Number(source.fHeader !== null),
    source["fRefCount"],
    Number(source["fDontFreeData"]),
    Number(source["fUDataMem"] === null),
  ];
  if (source.fHeader !== null)
    row.push(...new Uint32Array(bytes.buffer, bytes.byteOffset, 20), source.hashCode());
  row.push(...table(source.fForwardTable), ...table(source.fReverseTable));
  const t = source.fTrie;
  if (t === null) row.push(-1);
  else
    row.push(
      t.type,
      t.valueWidth,
      t.indexLength,
      t.dataLength,
      t.highStart,
      t.shifted12HighStart,
      t.reserved32,
      t.reserved16,
      t.index3NullOffset,
      t.dataNullOffset,
      t.nullValue,
      ...t.index,
      ...t.data,
    );
  row.push(
    source.fRuleSource === null ? -1 : source.fRuleSource.byteOffset - bytes.byteOffset,
    source.fRuleStatusTable === null ? -1 : source.fStatusMaxIdx,
  );
  if (source.fRuleStatusTable !== null) row.push(...source.fRuleStatusTable);
  row.push(...value(source.getRuleSourceString()));
  return row;
}
/** Invokes actual constructors/ref/equality APIs with the original input data. @param bytes - Original binary. @param tag - Native overload/embedded-allocation witness. @param initial - Incoming status. @returns Native-observed full traces. */
function observeOwner(bytes: Uint8Array, tag: number, initial: number): number[] {
  if (tag === 3) {
    const storage = new Uint8Array(bytes.length + 8);
    storage.set(bytes, 8);
    bytes = storage.subarray(8);
  }
  const status: [number] = [initial],
    header = new RBBIDataHeader(bytes),
    source = tag
      ? new RBBIDataWrapper(header, RBBIDataWrapper.kDontAdopt, status)
      : new RBBIDataWrapper(header, status),
    row = state(source, status[0], bytes);
  if (status[0] <= 0) {
    row.push(Number(source.addReference() === source), ...state(source, status[0], bytes));
    source.removeReference();
    row.push(...state(source, status[0], bytes));
  } else {
    source.removeReference();
    row.push(...state(source, status[0], bytes));
  }
  row.push(Number(source.equals(source)));
  if (source.fHeader !== null)
    for (let mode = 0; mode < 4; ++mode) {
      const copy = bytes.slice();
      if (mode === 2) copy[56] = (copy[56] as number) ^ 1;
      if (mode === 3) {
        const h = new Uint32Array(copy.buffer, copy.byteOffset, 20);
        h[2] = (h[2] as number) - 1;
      }
      const other = new RBBIDataWrapper(
        mode === 0 ? header : new RBBIDataHeader(copy),
        RBBIDataWrapper.kDontAdopt,
        [0],
      );
      row.push(Number(source.equals(other)));
      other.removeReference();
    }
  source.removeReference();
  return row;
}
/** Invokes actual StringPiece and UnicodeString factories. @param length - Source count. @param flags - Original overload selector. @param data - Actual bytes. @returns Native-observed fields. */
function observeValue(length: number, flags: number, data: number[]): number[] {
  const bytes = new Uint8Array(data.length + 8);
  bytes.set(data);
  const piece =
    flags & 2
      ? new StringPiece()
      : flags & 4
        ? new StringPiece(null)
        : new StringPiece(flags & 1 ? null : bytes, length);
  return [
    Number(piece.data() === null),
    piece.length(),
    piece.size(),
    Number(piece.empty()),
    ...value(UnicodeString.fromUTF8(piece)),
  ];
}
/** Hashes every observed numeric field. @param row - Full snapshot. @returns SHA256. */
function digest(row: unknown): string {
  return createHash("sha256").update(JSON.stringify(row)).digest("hex");
}
it("retains every original fresh byte-pair value", /** Exercises real conversion and owned values against the complete original matrix hash. @returns Nothing. */ () => {
  const hashes: string[] = [];
  for (let a = 0; a < 256; ++a)
    for (let b = 0; b < 256; ++b) hashes.push(digest(observeValue(2, 0, [a, b])));
  expect(hashes.length).toBe(native.pairCount);
  expect(digest(hashes)).toBe(native.pairHash);
});
it("retains original counted/null/long UTF8 value ownership", /** Replays every retained original descriptor and value query. @returns Nothing. */ () => {
  for (let i = 0; i < native.factories.length; ++i) {
    const [length, flags, data] = native.factories[i] as [number, number, number[]];
    expect(digest(observeValue(length, flags, data))).toBe(native.factoryHashes[i]);
  }
});
for (let which = 0; which < native.binaries.length; ++which) {
  it(`retains complete native ${native.binaries[which]?.name} owner state`, /** Replays original owning/borrowed/embedded constructors, references and equality without prepared owner fields. @returns Nothing. */ () => {
    for (let i = 0; i < native.calls.length; ++i) {
      const [index, tag, status] = native.calls[i] as [number, number, number];
      if (index !== which) continue;
      const bytes = Uint8Array.from(
        Buffer.from((native.binaries[index] as { binary: string }).binary, "base64"),
      );
      expect(digest(observeOwner(bytes, tag, status))).toBe(native.ownerHashes[i]);
    }
  });
}
