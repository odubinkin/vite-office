/** @fileoverview Binds browser export bytes to the original synchronous OFOPXML storage and stream interfaces. */
import { OStorageHelper } from "../../../comphelper/inc/storagehelper";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { native, text } from "../../../package/source/zippackage/ZipPackage.metadata";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { XComponent } from "../../../udkapi/com/sun/star/lang/XComponent";
import type { ZipFragmentStream } from "./zipstorage";
import { ZipStorage } from "./zipstorage.native";

const relationshipPath = /^(?:(.*)\/)?_rels\/([^/]+)\.rels$/u;

/** Binds a completed byte buffer to an independently seekable UNO input. @param bytes - Stream bytes. @returns Acquired input. */
function input(bytes: Uint8Array): Reference<XInputStream> {
  return new Reference(
    new MemoryInputStream(
      new Int8Array(bytes.buffer, bytes.byteOffset, bytes.length),
      bytes.length,
    ),
  );
}

/** Sets the root or part relationships through the original seekable stream property. @param owner - Storage or output part. @param relation - Actual relationship XML. @returns Nothing. */
function setRelations(owner: Reference<XInterface>, relation: Uint8Array): void {
  const props = new Reference<XPropertySet>(owner, UNO_QUERY_THROW, XPropertySet.static_type);
  const stream = input(relation);
  const key = native("RelationsInfoStream");
  const value = new Any(stream.getAddress(), ["Reference", XInputStream.static_type]);
  try {
    props.operatorStar().setPropertyValue(key, value);
  } finally {
    value.dispose();
    key.dispose();
    stream.dispose();
    props.dispose();
  }
}

/** Copies one serialized part into the actual native storage stream and applies its native media type. @param storage - Original output storage. @param fragment - Serialized part. @param relation - Optional part-local relationship stream. @returns Nothing. */
function writePart(
  storage: ZipStorage,
  fragment: ZipFragmentStream,
  relation: Uint8Array | undefined,
): void {
  const name = native(fragment.path);
  const destination = storage.openOutputStream(name);
  name.dispose();
  try {
    if (!destination.is()) throw new Error(`Cannot open OOXML part ${fragment.path}.`);
    const properties = new Reference<XPropertySet>(
      destination,
      UNO_QUERY_THROW,
      XPropertySet.static_type,
    );
    const mediaType = native(fragment.mediaType);
    const key = native("MediaType");
    const value = new Any(mediaType.getDataAddress(), "OUString");
    try {
      properties.operatorStar().setPropertyValue(key, value);
      if (relation) setRelations(properties, relation);
      const data = input(fragment.getBytes());
      try {
        OStorageHelper.CopyInputToOutput(data, destination);
        destination.operatorStar().closeOutput();
        const component = new Reference<XComponent>(
          destination,
          UNO_QUERY_THROW,
          XComponent.static_type,
        );
        try {
          component.operatorStar().dispose();
        } finally {
          component.dispose();
        }
      } finally {
        data.dispose();
      }
    } finally {
      value.dispose();
      key.dispose();
      mediaType.dispose();
      properties.dispose();
    }
  } finally {
    destination.dispose();
  }
}

/** Commits rendered parts, relationship streams and package content types via the original storage. @param fragments - Parts emitted by the format filter. @param attached - Relationship XML by owning stream. @returns Actual packaged bytes. */
export async function commitZipStorage(
  fragments: ReadonlyMap<string, ZipFragmentStream>,
  attached: ReadonlyMap<ZipFragmentStream | undefined, Uint8Array>,
): Promise<Uint8Array> {
  await initializeRuntime();
  const context = new Reference(getProcessComponentContext().get());
  const bytes = new Reference(new UNOMemoryStream());
  const storage = new ZipStorage(context, bytes, "output");
  try {
    if (!storage.isStorage()) throw new Error("Cannot create OOXML storage.");
    const rootRelations = attached.get(undefined) ?? fragments.get("_rels/.rels")?.getBytes();
    if (rootRelations) {
      const root = storage.getXStorage();
      try {
        root.operatorStar().getElementNames().dispose();
        setRelations(root, rootRelations);
      } finally {
        root.dispose();
      }
    }
    const relationships = new Map<string, ZipFragmentStream>();
    for (const [path, fragment] of fragments) {
      const match = relationshipPath.exec(path);
      if (match) {
        const name = (match[1] ? match[1] + "/" : "") + match[2];
        if (!fragments.has(name)) throw new Error(`OOXML relationship owner is missing: ${name}.`);
        relationships.set(name, fragment);
      }
    }
    for (const [path, fragment] of fragments) {
      if (path === "[Content_Types].xml" || path === "_rels/.rels" || relationshipPath.test(path))
        continue;
      writePart(storage, fragment, attached.get(fragment) ?? relationships.get(path)?.getBytes());
    }
    storage.commit(true);

    const result = bytes.operatorStar();
    const length = Number(result.getLength());
    if (!length) throw new Error("OOXML storage commit produced no data.");
    const output = new Int8Array(length);
    result.seek(0n);
    if (result.readSomeBytes(output, length) !== length)
      throw new Error("OOXML storage commit returned incomplete data.");
    return new Uint8Array(output.buffer);
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    const failure = new Error("Could not write OOXML storage.", {
      cause: new Error(text(error.Message) || error.constructor.name),
    });
    error.dispose();
    throw failure;
  } finally {
    storage.dispose();
    bytes.dispose();
    context.dispose();
  }
}
