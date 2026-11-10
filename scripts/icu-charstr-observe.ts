/** @fileoverview Actual CharString/MaybeStackArray byte-owner observer. Only initialized logical bytes are read; moved-from contents and uninitialized allocation tails are excluded. No alternate buffer/string/allocator/provider. */
import { CharString } from "../apps/office/src/external/icu/source/common/charstr.h";
import { MaybeStackArray } from "../apps/office/src/external/icu/source/common/cmemory";
import { StringPiece } from "../apps/office/src/external/icu/source/common/unicode/stringpiece";
import { UnicodeString } from "../apps/office/src/external/icu/source/common/unistr";
/** Original operation inputs. */
export interface CharOp {
  op: string;
  args: number[];
  bytes?: number[];
  number?: string;
}
/** Actual numeric field/byte observations. @param ops - Original command stream. @returns Full rows. */
export function observeCharStrings(ops: CharOp[]): number[][] {
  const owners = [new CharString(), new CharString()],
    known = [true, true],
    pending: (Uint8Array | null)[] = [null, null],
    rows: number[][] = [];
  const arrays = [new MaybeStackArray(40), new MaybeStackArray(40)];
  for (let i = 0; i < 2; ++i) (arrays[i] as MaybeStackArray).getAlias().fill(0x41 + i);
  const alias = new Uint8Array(64).fill(0x7e);
  const arrayKnown = [40, 40];
  /** Reads initialized actual CharString fields and its one buffer. @param id - Owner. @returns Fields. */
  function state(id: number): number[] {
    const s = owners[id] as CharString,
      b = s["buffer"],
      p = s.toStringPiece(),
      row = [
        s.length(),
        b.getCapacity(),
        Number(b["needToRelease"]),
        Number(s.data() === b["stackArray"]),
        Number(s.isEmpty()),
        p.length(),
        Number(p.data() === s.data()),
        s.lastIndexOf(97),
        known[id] ? s.at(0) : -9999,
      ];
    if (known[id]) row.push(...s.data().subarray(0, s.length() + 1));
    else row.push(-9999);
    return row;
  }
  /** Reads initialized array metadata/prefix, excluding uninitialized tails. @param id - Owner. @returns Fields. */
  function arrayState(id: number): number[] {
    const a = arrays[id] as MaybeStackArray;
    return [
      a.getCapacity(),
      Number(a["needToRelease"]),
      Number(a.getAlias() === a["stackArray"]),
      a.getArrayLimit().byteOffset - a.getAlias().byteOffset,
      arrayKnown[id] as number,
      ...a.getAlias().subarray(0, arrayKnown[id]),
    ];
  }
  for (const item of ops) {
    const a = item.args,
      id = a[0] as number,
      s = owners[id] as CharString,
      error: [number] = [a[1] as number],
      data = new Uint8Array((item.bytes?.length ?? 0) + 8);
    data.set(item.bytes ?? []);
    let row: number[] = [];
    if (item.op === "N") {
      owners[id] =
        a[2] === 1
          ? new CharString(new StringPiece(data), error)
          : a[2] === 2
            ? new CharString(owners[a[3] as number] as CharString, error)
            : new CharString(a[2] === 3 ? null : data, a[3] as number, error);
      known[id] = true;
    }
    if (item.op === "A") {
      row = [Number(s.append(a[2] === 1 ? null : data, a[3] as number, error) === s)];
      if (error[0] <= 0 && s.length() > 0) known[id] = true;
    }
    if (item.op === "S") {
      row = [Number(s.append(s.data().subarray(a[2] as number), a[3] as number, error) === s)];
    }
    if (item.op === "B") {
      row = [Number(s.append(a[2] as number, error) === s)];
      if (error[0] <= 0) known[id] = true;
    }
    if (item.op === "C") {
      row = [Number(s.clear() === s)];
      known[id] = true;
    }
    if (item.op === "T") row = [Number(s.truncate(a[2] as number) === s)];
    if (item.op === "R") {
      const other = a[2] as number;
      row = [Number(s.copyFrom(owners[other] as CharString, error) === s)];
      if (error[0] <= 0 && other !== id) known[id] = known[other] as boolean;
    }
    if (item.op === "P") {
      row = [
        Number(s.copyFrom(new StringPiece(a[2] === 1 ? null : data, a[3] as number), error) === s),
      ];
      if (error[0] <= 0 && s.length() > 0) known[id] = true;
    }
    if (item.op === "D") row = [Number(s.appendNumber(BigInt(item.number ?? "0"), error) === s)];
    if (item.op === "G") {
      const result: [number] = [917],
        p = s.getAppendBuffer(a[2] as number, a[3] as number, result, error);
      pending[id] = p;
      row = [result[0], Number(p === null), p === null ? -1 : p.byteOffset - s.data().byteOffset];
      if (p !== null) {
        p.set((item.bytes ?? []).slice(0, result[0]));
        row.push((item.bytes ?? []).length, ...p.subarray(0, (item.bytes ?? []).length));
      }
    }
    if (item.op === "W") {
      row = [Number(s.append(pending[id] as Uint8Array, a[2] as number, error) === s)];
      pending[id] = null;
      if (error[0] <= 0 && s.length() > 0) known[id] = true;
    }
    if (item.op === "E") {
      const dest =
          a[3] === 1
            ? null
            : a[3] === 2
              ? s.data()
              : new Uint8Array(Math.max(0, a[2] as number) + 4).fill(0xa5),
        n = s.extract(dest, a[2] as number, error);
      row = [n, Number(dest === null)];
      if (dest !== null) row.push(...dest.subarray(0, a[3] === 2 ? s.length() + 1 : dest.length));
      if (a[3] === 2 && error[0] <= 0 && s.length() < (a[2] as number)) known[id] = true;
    }
    if (item.op === "Q") {
      const p = s.cloneData(error);
      row = [Number(p === null)];
      if (p !== null) row.push(...p);
    }
    if (item.op === "V") {
      const p = new StringPiece(a[2] === 1 ? null : data, a[3] as number);
      row = [Number(s.contains(p)), Number(s.equals(p)), Number(s.notEquals(p))];
    }
    if (item.op === "I") {
      let value = "";
      for (const c of item.bytes ?? []) value += String.fromCharCode(c);
      if (a[2] === 1 || a[2] === 2) {
        const u = new UnicodeString(value, value.length);
        if (a[2] === 2) u.setToBogus();
        row = [Number(s.appendInvariantChars(u, error) === s)];
      } else
        row = [
          Number(s.appendInvariantChars(a[2] === 3 ? null : value, a[3] as number, error) === s),
        ];
      if (error[0] <= 0) known[id] = true;
    }
    if (item.op === "J")
      row = [Number(s.appendPathPart(new StringPiece(data, a[3] as number), error) === s)];
    if (item.op === "F") row = [Number(s.ensureEndsWithFileSeparator(error) === s)];
    if (item.op === "M") {
      const other = a[2] as number;
      owners[id] = CharString.moveConstruct(owners[other] as CharString);
      known[id] = known[other] as boolean;
      known[other] = false;
    }
    if (item.op === "X") {
      const other = a[2] as number;
      row = [Number(s.moveAssign(owners[other] as CharString) === s)];
      known[id] = known[other] as boolean;
      known[other] = false;
    }
    if (item.op === "L") {
      const z = arrays[id] as MaybeStackArray,
        p = z.resize(a[2] as number, a[3] as number);
      if (p !== null)
        arrayKnown[id] = Math.max(
          0,
          Math.min(arrayKnown[id] as number, a[3] as number, z.getCapacity()),
        );
      row = [Number(p === null)];
    }
    if (item.op === "Y") {
      (arrays[id] as MaybeStackArray).aliasInstead(a[2] === 1 ? null : alias, a[3] as number);
      if (a[2] !== 1 && (a[3] as number) > 0) arrayKnown[id] = a[3] as number;
    }
    if (item.op === "O") {
      const z = arrays[id] as MaybeStackArray,
        old = z.getAlias(),
        result: [number] = [917],
        p = z.orphanOrClone(a[2] as number, result);
      row = [Number(p === null), result[0], Number(p !== null && p === old)];
      if (p !== null) {
        row.push(...p.subarray(0, Math.max(0, Math.min(a[2] as number, arrayKnown[id] as number))));
        arrayKnown[id] = 40;
      }
    }
    if (item.op === "Z") {
      const other = a[2] as number;
      row = [
        Number(
          (arrays[id] as MaybeStackArray).moveAssign(arrays[other] as MaybeStackArray) ===
            arrays[id],
        ),
      ];
      arrayKnown[id] = arrayKnown[other] as number;
      arrayKnown[other] = 40;
    }
    row.push(error[0], ...state(0), ...state(1), ...arrayState(0), ...arrayState(1));
    rows.push(row);
  }
  return rows;
}
