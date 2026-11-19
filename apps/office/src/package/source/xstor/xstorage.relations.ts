/** @fileoverview Original OFOPXML relationship storage loading, staging and persistence over actual child storage and stream owners. */
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XNameContainer } from "../../../cppu/inc/com/sun/star/container/XNameContainer";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import type { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import {
  StringPair,
  cppu_detail_getUnoType_StringPair as pairType,
} from "../../../udkapi/com/sun/star/beans/StringPair";
import { OFOPXML } from "../../../offapi/com/sun/star/embed/StorageFormats";
import { READWRITE, TRUNCATE, WRITE } from "../../../offapi/com/sun/star/embed/ElementModes";
import { OStorageHelper } from "../../../comphelper/source/misc/storagehelper";
import { ReadRelationsInfoSequence } from "../../../comphelper/source/xml/ofopxmlhelper";
import { WriteRelationsInfoSequence } from "../../../comphelper/source/xml/ofopxmlhelper.write";
import { MutexGuard } from "../../../sal/inc/osl/mutex";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { OStorage_Impl } from "./xstorage.impl";

/** Original nested UNO relationship rows. */
export const Relations = Sequence.specialize<Sequence<StringPair>>(["Sequence", pairType], 8);
/** Original status constants from xstorage.hxx. */
export enum RelInfoStatus {
  NoInit = 1,
  Read,
  Changed,
  ChangedStream,
  ChangedStreamRead,
  Broken,
  ChangedBroken,
}
const nameOf = new TextEncoder();
/** Constructs an owned original name. @param text - Native literal. @returns New string. */
function literal(text: string): OUString {
  return OUString.fromUtf8(nameOf.encode(text));
}
/** Original RelationsInfo or RelationsInfoStream property assignment before broadcasting. @param owner - Storage implementation. @param stream - Whether accepting the original stream property. @param value - Actual property value. @returns Nothing. */
export function setStorageRelations(owner: OStorage_Impl, stream: boolean, value: Any): void {
  const guard = new MutexGuard(owner.m_xMutex.operatorStar().GetMutex());
  try {
    if (owner.m_nStorageType !== OFOPXML || !(owner.m_nStorageMode & WRITE))
      throw new RuntimeException();
    if (stream) {
      const input = new Reference<XInputStream>();
      try {
        if (
          !value.extract(input.getAddress(), ["Reference", XInputStream.static_type]) ||
          !input.is()
        )
          throw new IllegalArgumentException();
        const seek = new Reference<XSeekable>(input, UNO_QUERY, XSeekable.static_type);
        try {
          if (!seek.is()) throw new IllegalArgumentException();
        } finally {
          seek.dispose();
        }
        owner.m_xNewRelInfoStream.assign(input);
        owner.m_aRelInfo.realloc(0);
        owner.m_nRelInfoStatus = RelInfoStatus.ChangedStream;
      } finally {
        input.dispose();
      }
    } else {
      if (!value.extract(owner.m_aRelInfo.getAddress(), ["Sequence", ["Sequence", pairType]]))
        throw new IllegalArgumentException();
      owner.m_xNewRelInfoStream.clear();
      owner.m_nRelInfoStatus = RelInfoStatus.Changed;
    }
    owner.m_bBroadcastModified = owner.m_bIsModified = true;
  } finally {
    guard.dispose();
  }
}
/** Source error used by both storage and stream relationship getters. @returns Owned UNO error. */
export function wrongRelationsStream(): IOException {
  const message = literal("Wrong relinfo stream!"),
    context = new Reference();
  try {
    return new IOException(message, context);
  } finally {
    context.dispose();
    message.dispose();
  }
}

/** Opens an existing relationship part using the native child and package stream owners. @param owner - Actual storage. @param name - Owning part name, or empty for the storage itself. @returns Acquired input or empty. */
export function getRelInfoStreamForName(
  owner: OStorage_Impl,
  name: OUStringConstReference,
): Reference<XInputStream> {
  if (owner.m_nStorageType !== OFOPXML) return new Reference();
  owner.ReadContents();
  const storage = owner.m_pRelStorElement?.m_xStorage;
  if (storage === undefined || storage === null) return new Reference();
  const partName = relationName(name);
  try {
    if (!storage.FindElement(partName)) return new Reference();
    const stream = storage.OpenReadStream(partName);
    try {
      return stream.operatorStar().getInputStream();
    } finally {
      stream.dispose();
    }
  } finally {
    partName.dispose();
  }
}

/** Loads root or child-storage relationships on demand and preserves the original failure states. @param owner - Actual storage. @returns Nothing. */
export function readRelInfoIfNecessary(owner: OStorage_Impl): void {
  const status = owner.m_nRelInfoStatus;
  if (status !== RelInfoStatus.NoInit && status !== RelInfoStatus.ChangedStream) return;
  const original = status === RelInfoStatus.NoInit;
  const empty = new OUString();
  try {
    const input = original
      ? getRelInfoStreamForName(owner, empty)
      : new Reference(owner.m_xNewRelInfoStream);
    try {
      if (input.is()) {
        const name = literal("_rels/.rels");
        try {
          const parsed = ReadRelationsInfoSequence(input, name.subView(0), owner.m_xContext);
          try {
            owner.m_aRelInfo.moveAssign(parsed);
          } finally {
            parsed.dispose();
          }
        } finally {
          name.dispose();
        }
      }
      owner.m_nRelInfoStatus = original ? RelInfoStatus.Read : RelInfoStatus.ChangedStreamRead;
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
      if (!original) owner.m_nRelInfoStatus = RelInfoStatus.ChangedBroken;
    } finally {
      input.dispose();
    }
  } finally {
    empty.dispose();
  }
}

/** Original removal of a persisted relation part for a deleted catalog child. @param owner - Actual owner. @param original - Persisted stream name. @returns Nothing. */
export function removeStreamRelations(
  owner: OStorage_Impl,
  original: OUStringConstReference,
): void {
  const rel = owner.m_pRelStorElement?.m_xStorage;
  if (owner.m_nStorageType !== OFOPXML || !rel) return;
  const name = relationName(original);
  try {
    if (rel.FindElement(name)) rel.RemoveElement(name);
  } finally {
    name.dispose();
  }
}
/** Original unchanged relation stream rename. The relation data remains owned by its existing package element. @param owner - Actual owner. @param original - Persisted stream name. @param target - New name. @returns Nothing. */
export function renameStreamRelations(
  owner: OStorage_Impl,
  original: OUStringConstReference,
  target: OUStringConstReference,
): void {
  const rel = owner.m_pRelStorElement?.m_xStorage;
  if (owner.m_nStorageType !== OFOPXML || !rel || original.equals(target)) return;
  const from = relationName(original),
    to = relationName(target);
  try {
    if (rel.FindElement(from)) rel.RenameElement(from, to);
  } finally {
    to.dispose();
    from.dispose();
  }
}
/** Original relation-part filename uses the source member name verbatim. @param name - Original member or empty root name. @returns Native relation name. */
export function relationName(name: OUStringConstReference): OUString {
  const result = new OUString(name),
    suffix = literal(".rels");
  try {
    result.append(suffix);
    return result;
  } finally {
    suffix.dispose();
  }
}
/** Writes a typed part to the associated relationship storage. @param storage - Internal relationship storage. @param name - Relationship member name. @param write - Original XML write or stream-copy operation. @returns Nothing. */
export function writeRelationshipStream(
  storage: OStorage_Impl,
  name: OUStringConstReference,
  write: (output: Reference<XOutputStream>) => void,
): void {
  const stream = storage.OpenTruncatedStream(name, TRUNCATE | READWRITE);
  try {
    const output = stream.operatorStar().getOutputStream();
    try {
      if (!output.is()) throw new RuntimeException();
      write(output);
    } finally {
      output.dispose();
    }
  } finally {
    stream.dispose();
  }
  const child = storage.FindElement(name)?.m_xStream;
  if (!child) throw new RuntimeException();
  child.SetMediaType("application/vnd.openxmlformats-package.relationships+xml");
}
/** Original CommitRelInfo state machine and insertion of a nonempty relationship folder. @param owner - Actual storage. @param target - Actual committing package folder. @returns Nothing. */
export function commitStorageRelations(owner: OStorage_Impl, target: XNameContainer): void {
  if (owner.m_nStorageType !== OFOPXML) return;
  const status = owner.m_nRelInfoStatus;
  if (status === RelInfoStatus.Broken || status === RelInfoStatus.ChangedBroken)
    throw new IOException();
  const ownName = literal(".rels"),
    folderName = literal("_rels");
  try {
    if (status === RelInfoStatus.Changed && !owner.m_aRelInfo.hasElements()) {
      const rel = owner.m_pRelStorElement?.m_xStorage;
      if (rel?.FindElement(ownName)) rel.RemoveElement(ownName);
    } else if (
      status === RelInfoStatus.Changed ||
      status === RelInfoStatus.ChangedStream ||
      status === RelInfoStatus.ChangedStreamRead
    ) {
      const rel = owner.CreateRelStorage();
      writeRelationshipStream(
        rel,
        ownName,
        /** Writes the original root relations. @param output - Actual relation part. @returns Nothing. */ (
          output,
        ) => {
          if (status === RelInfoStatus.Changed) {
            WriteRelationsInfoSequence(output, owner.m_aRelInfo, owner.m_xContext);
          } else {
            const input = owner.m_xNewRelInfoStream;
            const seek = new Reference<XSeekable>(input, UNO_QUERY_THROW, XSeekable.static_type);
            try {
              seek.operatorStar().seek(0n);
              OStorageHelper.CopyInputToOutput(input, output);
            } finally {
              seek.dispose();
            }
          }
        },
      );
      if (status !== RelInfoStatus.Changed) owner.m_xNewRelInfoStream.clear();
      if (status === RelInfoStatus.ChangedStream) owner.m_aRelInfo.realloc(0);
      owner.m_nRelInfoStatus =
        status === RelInfoStatus.ChangedStream ? RelInfoStatus.NoInit : RelInfoStatus.Read;
    }
    const rel = owner.m_pRelStorElement?.m_xStorage;
    if (!rel) return;
    if (rel.HasChildren()) rel.Commit();
    if (target.hasByName(folderName)) target.removeByName(folderName);
    if (!rel.HasChildren()) {
      owner.m_pRelStorElement?.dispose();
      owner.m_pRelStorElement = null;
    } else {
      const payload = new Any(rel.m_xPackageFolder.getAddress(), "XInterface");
      try {
        target.insertByName(folderName, payload);
      } finally {
        payload.dispose();
      }
      rel.m_bCommited = false;
    }
  } finally {
    folderName.dispose();
    ownName.dispose();
  }
}
