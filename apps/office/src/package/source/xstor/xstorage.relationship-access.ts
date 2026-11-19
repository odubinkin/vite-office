/** @fileoverview Original OFOPXML OStorage relationship lookup and ordered row mutation. */
import { ElementExistException } from "../../../cppu/inc/com/sun/star/container/ElementExistException";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { WrappedTargetRuntimeException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetRuntimeException";
import {
  Sequence,
  type SequenceElements,
  type SequenceReference,
} from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { withCaughtException } from "../../../cppu/inc/uno/exception-context";
import { getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import type { uno_Sequence } from "../../../cppu/inc/uno/sequence2";
import { OFOPXML } from "../../../offapi/com/sun/star/embed/StorageFormats";
import { MutexGuard } from "../../../sal/inc/osl/mutex";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  StringPair,
  type StringPairConstReference,
  cppu_detail_getUnoType_StringPair as pairType,
} from "../../../udkapi/com/sun/star/beans/StringPair";
import { Relations, RelInfoStatus } from "./xstorage.relations";
import type { OStorage_Impl } from "./xstorage.impl";

const Pairs = Sequence.specialize<StringPair>(pairType, 16);
const idField = Uint8Array.of(73, 100);
const typeField = Uint8Array.of(84, 121, 112, 101);
const targetField = Uint8Array.of(84, 97, 114, 103, 101, 116);

/** Borrows each initialized row while its containing sequence is live. @param rows - Native relation rows. @returns Borrowed rows. */
function borrowRows(rows: Sequence<Sequence<StringPair>>): SequenceReference<StringPair>[] {
  const result: SequenceReference<StringPair>[] = [];
  for (let i = 0; i < rows.getLength(); ++i)
    result.push(
      Sequence.unacquired(
        Pairs,
        (rows.getConstArray() as SequenceElements).get(i * 8) as [uno_Sequence | null],
      ),
    );
  return result;
}

/** Borrows fields from an initialized row. @param row - Original row. @returns Ordered fields. */
function borrowPairs(row: SequenceReference<StringPair>): StringPairConstReference[] {
  const result: StringPairConstReference[] = [];
  for (let i = 0; i < row.getLength(); ++i)
    result.push(
      StringPair.unacquired(
        (row.getConstArray() as SequenceElements).get(i * 16) as SequenceElements,
      ),
    );
  return result;
}

/** Copies fields into a native row. @param pairs - Actual compounds. @returns Owned row. */
function rowFrom(pairs: readonly StringPairConstReference[]): Sequence<StringPair> {
  const fields = new Map<number, StringPair>();
  try {
    for (const [index, pair] of pairs.entries()) fields.set(index * 16, new StringPair(pair));
    return new Pairs(fields, pairs.length);
  } finally {
    for (const pair of fields.values()) pair.dispose();
  }
}

/** Copies the row sequence with original shared native row data. @param rows - Ordered native rows. @returns Owned relationship sequence. */
function rowsFrom(rows: readonly SequenceReference<StringPair>[]): Sequence<Sequence<StringPair>> {
  const fields = new Map<number, unknown>();
  for (const [index, row] of rows.entries()) fields.set(index * 8, row.getAddress());
  return new Relations(fields, rows.length);
}

/** Reads the source-published OFOPXML relations and original exception contract. @param owner - Storage implementation. @returns Owned rows. */
export function getAllStorageRelationships(owner: OStorage_Impl): Sequence<Sequence<StringPair>> {
  if (owner.m_nStorageType !== OFOPXML) throw new RuntimeException();
  try {
    return owner.GetAllRelationshipsIfAny();
  } catch (error) {
    if (
      !(error instanceof Exception) ||
      error instanceof IOException ||
      error instanceof RuntimeException
    )
      throw error;
    const message = OUString.fromUtf8(new TextEncoder().encode("Can't getAllRelationships!"));
    const context = new Reference();
    const caught = withCaughtException(error, getCaughtException);
    try {
      throw new WrappedTargetRuntimeException(message, context, caught);
    } finally {
      caught.dispose();
      context.dispose();
      message.dispose();
      error.dispose();
    }
  }
}

/** Looks for an exact matching Id pair. @param row - Native relation. @param id - Source ID. @returns Whether present. */
function hasId(row: SequenceReference<StringPair>, id: OUStringConstReference): boolean {
  return borrowPairs(row).some(
    /** Tests an original exact ID field. @param pair - Native field. @returns Match. */
    (pair) => pair.First.equalsAsciiL(idField, idField.length) && pair.Second.equals(id),
  );
}

/** Looks up the first row containing the exact ID pair. @param owner - Storage implementation. @param id - Source ID. @returns Owned row. */
export function getStorageRelationshipByID(
  owner: OStorage_Impl,
  id: OUStringConstReference,
): Sequence<StringPair> {
  const rows = getAllStorageRelationships(owner);
  try {
    for (const row of borrowRows(rows)) if (hasId(row, id)) return new Pairs(row);
    throw new NoSuchElementException();
  } finally {
    rows.dispose();
  }
}

/** Reads the first named field of the first matching row. @param owner - Storage implementation. @param id - Source ID. @param field - Target or Type. @returns Owned value. */
export function getStorageRelationshipField(
  owner: OStorage_Impl,
  id: OUStringConstReference,
  field: "Target" | "Type",
): OUString {
  const row = getStorageRelationshipByID(owner, id);
  const key = field === "Target" ? targetField : typeField;
  try {
    for (const pair of borrowPairs(row))
      if (pair.First.equalsAsciiL(key, key.length)) return new OUString(pair.Second);
    return new OUString();
  } finally {
    row.dispose();
  }
}

/** Selects the first type field per row and compares its value case-insensitively as ASCII. @param owner - Storage implementation. @param type - Requested type. @returns Owned source-order rows. */
export function getStorageRelationshipsByType(
  owner: OStorage_Impl,
  type: OUStringConstReference,
): Sequence<Sequence<StringPair>> {
  const rows = getAllStorageRelationships(owner);
  try {
    const hits: SequenceReference<StringPair>[] = [];
    for (const row of borrowRows(rows)) {
      const field = borrowPairs(row).find(
        /** Finds the first Type field. @param pair - Native pair. @returns Match. */
        (pair) => pair.First.equalsAsciiL(typeField, typeField.length),
      );
      if (field?.Second.equalsIgnoreAsciiCase(type)) hits.push(row);
    }
    return rowsFrom(hits);
  } finally {
    rows.dispose();
  }
}

/** Moves the new rows into the original cached state, preserving the source's modification flags. @param owner - Actual storage. @param rows - New relation sequence. @returns Nothing. */
function stage(owner: OStorage_Impl, rows: Sequence<Sequence<StringPair>>): void {
  owner.m_aRelInfo.moveAssign(rows);
  owner.m_xNewRelInfoStream.clear();
  owner.m_nRelInfoStatus = RelInfoStatus.Changed;
}

/** Replaces the last matching row or appends a new row with its canonical leading Id. @param owner - Actual storage. @param id - Source ID. @param value - Entry fields. @param replace - Whether a duplicate can be replaced. @returns Nothing. */
export function insertStorageRelationship(
  owner: OStorage_Impl,
  id: OUStringConstReference,
  value: Sequence<StringPair>,
  replace: boolean,
): void {
  const guard = new MutexGuard(owner.m_xMutex.operatorStar().GetMutex());
  try {
    const originals = getAllStorageRelationships(owner);
    try {
      const rows = borrowRows(originals);
      let index = rows.length;
      for (let i = 0; i < rows.length; ++i)
        if (hasId(rows[i] as SequenceReference<StringPair>, id)) index = i;
      if (index !== rows.length && !replace) throw new ElementExistException();
      const key = OUString.fromUtf8(new TextEncoder().encode("Id"));
      const first = new StringPair(key, id);
      try {
        const row = rowFrom([
          first,
          ...borrowPairs(value).filter(
            /** Drops the caller's Id fields. @param pair - Native pair. @returns Whether retained. */
            (pair) => !pair.First.equals(key),
          ),
        ]);
        try {
          rows[index] = row;
          const result = rowsFrom(rows);
          try {
            stage(owner, result);
          } finally {
            result.dispose();
          }
        } finally {
          row.dispose();
        }
      } finally {
        first.dispose();
        key.dispose();
      }
    } finally {
      originals.dispose();
    }
  } finally {
    guard.dispose();
  }
}

/** Removes the first row containing the specified ID. @param owner - Actual storage. @param id - Source ID. @returns Nothing. */
export function removeStorageRelationship(owner: OStorage_Impl, id: OUStringConstReference): void {
  const guard = new MutexGuard(owner.m_xMutex.operatorStar().GetMutex());
  try {
    const originals = getAllStorageRelationships(owner);
    try {
      const rows = borrowRows(originals);
      const index = rows.findIndex(
        /** Locates the first matching source row. @param row - Actual relation row. @returns Match. */
        (row) => hasId(row, id),
      );
      if (index === -1) throw new NoSuchElementException();
      rows.splice(index, 1);
      const result = rowsFrom(rows);
      try {
        stage(owner, result);
      } finally {
        result.dispose();
      }
    } finally {
      originals.dispose();
    }
  } finally {
    guard.dispose();
  }
}

/** Replaces colliding old rows and appends the source relations in order. @param owner - Actual storage. @param values - Incoming rows. @param replace - Whether duplicate rows may be replaced. @returns Nothing. */
export function insertStorageRelationships(
  owner: OStorage_Impl,
  values: Sequence<Sequence<StringPair>>,
  replace: boolean,
): void {
  const guard = new MutexGuard(owner.m_xMutex.operatorStar().GetMutex());
  try {
    const originals = getAllStorageRelationships(owner);
    const created: Sequence<StringPair>[] = [];
    try {
      const incoming = borrowRows(values);
      const result: SequenceReference<StringPair>[] = [];
      for (const row of borrowRows(originals)) {
        const first = borrowPairs(row).find(
          /** Selects the first Id field. @param pair - Native field. @returns Match. */
          (pair) => pair.First.equalsAsciiL(idField, idField.length),
        );
        if (!first) continue;
        const collision = incoming.some(
          /** Checks whether an incoming row defines the ID. @param entry - Actual row. @returns Match. */
          (entry) => hasId(entry, first.Second),
        );
        if (collision && !replace) throw new ElementExistException();
        if (!collision) result.push(row);
      }
      for (const row of incoming) {
        const fields = borrowPairs(row);
        const index = fields.findIndex(
          /** Finds the Id field to rotate to the front. @param pair - Source field. @returns Match. */
          (pair) => pair.First.equalsAsciiL(idField, idField.length),
        );
        if (index === -1) throw new IOException();
        const [id] = fields.splice(index, 1);
        fields.unshift(id as StringPairConstReference);
        const entry = rowFrom(fields);
        created.push(entry);
        result.push(entry);
      }
      const rows = rowsFrom(result);
      try {
        stage(owner, rows);
      } finally {
        rows.dispose();
      }
    } finally {
      for (const row of created) row.dispose();
      originals.dispose();
    }
  } finally {
    guard.dispose();
  }
}

/** Clears the root relation value using the original status transition. @param owner - Actual storage. @returns Nothing. */
export function clearStorageRelationships(owner: OStorage_Impl): void {
  const guard = new MutexGuard(owner.m_xMutex.operatorStar().GetMutex());
  try {
    if (owner.m_nStorageType !== OFOPXML) throw new RuntimeException();
    const rows = new Relations();
    try {
      stage(owner, rows);
    } finally {
      rows.dispose();
    }
  } finally {
    guard.dispose();
  }
}
