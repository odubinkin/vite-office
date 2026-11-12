/** @fileoverview Ports plain ZipPackage::parseManifest/parseContentType metadata/MIME, folder consistency and WriteContentTypes metadata over actual ZIP entries; UNO storage services and encryption remain outside this package slice. */
import { writeContentSequenceXml } from "../../../comphelper/source/xml/ofopxmlhelper.string";

import { lookForUnexpectedODF12Streams, type Folder } from "./ZipPackageFolder";
import type { DocumentArchive } from "./document-archive";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { readManifestSequence } from "../manifest/ManifestReader";
import { ReadContentTypeSequence } from "../../../comphelper/source/xml/ofopxmlhelper";
import { splitAtLastToken } from "../../../comphelper/source/misc/directoryhelper";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  StringPair,
  cppu_detail_getUnoType_StringPair as pairType,
} from "../../../udkapi/com/sun/star/beans/StringPair";
import {
  rtl_uString_assign,
  type rtl_uStringSlot,
  type rtl_uString,
} from "../../../sal/inc/rtl/ustring.h";
import type { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import type { uno_Sequence } from "../../../cppu/inc/uno/sequence2";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { PKG_MNFST_MEDIATYPE, PKG_MNFST_FULLPATH } from "../../inc/PackageConstants";
const Pairs = Sequence.specialize<StringPair>(pairType, 16);
/** Initializes one source UTF16 literal using the genuine native string owner. @param value - Literal. @returns Owned value. */
function native(value: string): OUString {
  return new OUString(
    Uint16Array.from(
      value.split(""),
      /** Literal UTF16 unit. @param c - Unit. @returns Numeric unit. */ (c) => c.charCodeAt(0),
    ),
    value.length,
  );
}
/** Native stored folder properties. */
interface FolderProperties {
  mediaType: string;
  version: string;
}
/** Readonly represented native package properties and stream media types. */
export interface PlainPackageMetadata {
  readonly mediaType: string;
  readonly version: string;
  readonly mediaTypeFallbackUsed: boolean;
  readonly isInconsistent: boolean;
  readonly streamMediaTypes: ReadonlyMap<string, string>;
  readonly folderProperties: ReadonlyMap<string, Readonly<FolderProperties>>;
}
/** Reads exact native UTF16. @param value - String. @returns Text. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); ++i)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Builds only the actual archive's native hierarchy metadata. @param paths - Validated archive entry names. @returns Root folder and lookup maps. */
function hierarchy(paths: readonly string[]): {
  root: Folder;
  folders: Map<string, FolderProperties>;
  streams: Map<string, { bFolder: false; fromManifest: boolean }>;
} {
  const root: Folder = new Map(),
    folders = new Map<string, FolderProperties>([["/", { mediaType: "", version: "" }]]),
    streams = new Map<string, { bFolder: false; fromManifest: boolean }>();
  for (const path of paths) {
    const directory = path.endsWith("/"),
      parts = path.split("/");
    if (directory) parts.pop();
    let current = root,
      prefix = "";
    for (let i = 0; i < parts.length; ++i) {
      const name = parts[i] as string,
        last = i === parts.length - 1,
        existing = current.get(name);
      if (!last || directory) {
        if (existing && !existing.bFolder) throw new Error("ODF package file/folder conflict");
        const child = existing?.bFolder
          ? existing.pFolder
          : new Map<
              string,
              { bFolder: true; pFolder: Folder } | { bFolder: false; fromManifest: boolean }
            >();
        if (!existing) current.set(name, { bFolder: true, pFolder: child });
        prefix += name + "/";
        let properties = folders.get(prefix);
        if (properties === undefined) {
          properties = { mediaType: "", version: "" };
          folders.set(prefix, properties);
          folders.set(prefix.slice(0, -1), properties);
        }
        current = child;
      } else {
        if (existing) throw new Error("ODF package file/folder conflict");
        const entry = { bFolder: false as const, fromManifest: false };
        current.set(name, entry);
        streams.set(path, entry);
      }
    }
  }
  return { root, folders, streams };
}
/** Applies actual PropertyValue entries in original order and computes normal non-recovery package metadata. @param archive - Real readonly ZIP. @param manifest - Native parsed property sequences. @param mimetype - Optional decoded native mimetype stream. @returns Represented metadata. */
export function applyPlainManifestMetadata(
  archive: Pick<DocumentArchive, "getEntryNames">,
  manifest: readonly (readonly PropertyValue[])[],
  mimetype?: string,
): PlainPackageMetadata {
  const names = archive.getEntryNames();
  if (!names.includes("META-INF/manifest.xml")) throw new Error("Could not parse manifest.xml");
  if (names.includes("encrypted-package"))
    throw new Error("Encrypted ODF packages are not implemented");
  const { root, folders, streams } = hierarchy(names),
    types = new Map<string, string>();
  for (const name of streams.keys()) types.set(name, "");
  const rootProperties = folders.get("/") as FolderProperties;
  let firstVersion: string | undefined,
    mediaTypeFallbackUsed = false;
  for (const sequence of manifest) {
    const path = new OUString(),
      media = new OUString(),
      entryVersion = new OUString();
    try {
      for (const property of sequence) {
        const name = text(property.Name);
        if (name === "FullPath") property.Value.extract(path, "OUString");
        else if (name === "MediaType") property.Value.extract(media, "OUString");
        else if (name === "Version") {
          property.Value.extract(entryVersion, "OUString");
          if (firstVersion === undefined) firstVersion = text(entryVersion);
        }
      }
      const fullPath = text(path);
      if (fullPath !== "") {
        const folder = folders.get(fullPath);
        if (folder !== undefined) {
          folder.mediaType = text(media);
          folder.version = text(entryVersion);
        } else if (streams.has(fullPath)) {
          (streams.get(fullPath) as { fromManifest: boolean }).fromManifest = true;
          types.set(fullPath, text(media));
        }
      }
    } finally {
      path.dispose();
      media.dispose();
      entryVersion.dispose();
    }
  }
  if (mimetype !== undefined) {
    if (rootProperties.mediaType === "") {
      if (mimetype.startsWith("application/vnd.")) {
        rootProperties.mediaType = mimetype;
        if (firstVersion !== undefined && rootProperties.version === "")
          rootProperties.version = firstVersion;
        mediaTypeFallbackUsed = true;
      }
    } else if (rootProperties.mediaType !== mimetype)
      throw new Error("mimetype conflicts with manifest.xml");
  }
  // Native parseManifest hides these internal streams after applying metadata.
  types.delete("mimetype");
  types.delete("META-INF/manifest.xml");
  const isInconsistent = lookForUnexpectedODF12Streams(root, "");
  if (rootProperties.version >= "1.2" && isInconsistent)
    throw new Error("there are streams not referred in manifest.xml");
  return {
    mediaType: rootProperties.mediaType,
    version: rootProperties.version,
    mediaTypeFallbackUsed,
    isInconsistent,
    streamMediaTypes: types,
    folderProperties: folders,
  };
}
/** Shared plain reader composition;all applications consume the same actual importer and package metadata responsibilities. @param archive - Real ZIP. @param xml - Decoded manifest stream. @param mimetype - Optional native mimetype stream. @returns Represented package properties. */
export function readPlainPackageManifest(
  archive: Pick<DocumentArchive, "getEntryNames">,
  xml: string,
  mimetype?: string,
): PlainPackageMetadata {
  return applyPlainManifestMetadata(archive, readManifestSequence(xml), mimetype);
}

/** Native ZipPackage::WriteContentTypes standard defaults and manifest override selection. @param manifest - Actual package PropertyValue sequences. @returns Content types XML. */
export function WriteContentTypes(manifest: readonly (readonly PropertyValue[])[]): string {
  const defaults = new Pairs(5),
    overrides = new Pairs(manifest.length);
  const defaultFields = defaults.getArray() as SequenceElements;
  const overrideFields = overrides.getArray() as SequenceElements;
  let length = 0;
  try {
    const literals = [
      ["fntdata", "application/x-fontdata"],
      ["jpeg", "image/jpeg"],
      ["png", "image/png"],
      ["rels", "application/vnd.openxmlformats-package.relationships+xml"],
      ["xml", "application/xml"],
    ] as const;
    for (let i = 0; i < literals.length; ++i) {
      const literal = literals[i] as readonly [string, string];
      const first = native(literal[0]),
        second = native(literal[1]);
      const pair = defaultFields.get(i * 16) as SequenceElements;
      try {
        rtl_uString_assign(pair.get(0) as rtl_uStringSlot, first.pData as rtl_uString);
        rtl_uString_assign(pair.get(8) as rtl_uStringSlot, second.pData as rtl_uString);
      } finally {
        second.dispose();
        first.dispose();
      }
    }
    for (const sequence of manifest) {
      const type = new OUString();
      try {
        (sequence[PKG_MNFST_MEDIATYPE] as PropertyValue).Value.extract(type, "OUString");
        if (type.isEmpty()) continue;
        const path = new OUString(),
          extension = new OUString();
        try {
          (sequence[PKG_MNFST_FULLPATH] as PropertyValue).Value.extract(path, "OUString");
          splitAtLastToken(path.subView(0), 46, extension);
          let found = false;
          if (!extension.isEmpty()) {
            for (let i = 0; i < defaults.getLength(); ++i) {
              const pair = StringPair.unacquired(
                (defaults.getConstArray() as SequenceElements).get(i * 16) as SequenceElements,
              );
              if (pair.First.equals(extension) && pair.Second.equals(type)) {
                found = true;
                break;
              }
            }
          }
          if (found) continue;
          const fullPath = native("/");
          try {
            fullPath.append(path);
            const pair = overrideFields.get(length * 16) as SequenceElements;
            rtl_uString_assign(pair.get(0) as rtl_uStringSlot, fullPath.pData as rtl_uString);
            rtl_uString_assign(pair.get(8) as rtl_uStringSlot, type.pData as rtl_uString);
            ++length;
          } finally {
            fullPath.dispose();
          }
        } finally {
          extension.dispose();
          path.dispose();
        }
      } finally {
        type.dispose();
      }
    }
    overrides.realloc(length);
    return writeContentSequenceXml(defaults, overrides);
  } finally {
    overrides.dispose();
    defaults.dispose();
  }
}

/** Original parseContentType application order over the existing flat ZIP catalog binding: defaults first, then explicit overrides; internal content types are excluded from exposed streams. @param archive - Actual catalog. @param source - Actual content-type input. @returns Stream MIME fields at the ZIP boundary. */
export function readPlainPackageContentTypes(
  archive: Pick<DocumentArchive, "getEntryNames">,
  source: InputSource,
): ReadonlyMap<string, string> {
  const parsed = ReadContentTypeSequence(source);
  try {
    if (parsed.getLength() !== 2) throw new IOException();
    const types = new Map<string, string>();
    for (const path of archive.getEntryNames()) if (!path.endsWith("/")) types.set(path, "");
    const defaults = Sequence.unacquired(
      Pairs,
      (parsed.getConstArray() as SequenceElements).get(0) as [uno_Sequence | null],
    );
    for (let i = 0; i < defaults.getLength(); ++i) {
      const pair = StringPair.unacquired(
        (defaults.getConstArray() as SequenceElements).get(i * 16) as SequenceElements,
      );
      const extension = text(pair.First),
        suffix = extension.startsWith(".") ? extension : "." + extension,
        mediaType = text(pair.Second);
      for (const path of types.keys())
        if (path.slice(path.lastIndexOf("/") + 1).endsWith(suffix)) types.set(path, mediaType);
    }
    const overrides = Sequence.unacquired(
      Pairs,
      (parsed.getConstArray() as SequenceElements).get(8) as [uno_Sequence | null],
    );
    for (let i = 0; i < overrides.getLength(); ++i) {
      const pair = StringPair.unacquired(
        (overrides.getConstArray() as SequenceElements).get(i * 16) as SequenceElements,
      );
      const raw = text(pair.First),
        path = raw.startsWith("/") ? raw.slice(1) : raw;
      if (path !== "" && types.has(path)) types.set(path, text(pair.Second));
    }
    types.delete("[Content_Types].xml");
    return types;
  } finally {
    parsed.dispose();
  }
}
