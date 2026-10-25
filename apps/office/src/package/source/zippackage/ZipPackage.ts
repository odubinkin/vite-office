/** @fileoverview Ports plain ZipPackage::parseManifest metadata/MIME, folder consistency and WriteContentTypes metadata over actual ZIP entries; UNO storage services and encryption remain outside this package slice. */
import { lookForUnexpectedODF12Streams, type Folder } from "./ZipPackageFolder";
import type { ZipFile } from "../zipapi/ZipFile";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { readManifestSequence } from "../manifest/ManifestReader";
import {
  WriteContentSequence,
  type StringPair,
} from "../../../comphelper/source/xml/ofopxmlhelper";
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
  archive: Pick<ZipFile, "getEntryNames">,
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
  archive: Pick<ZipFile, "getEntryNames">,
  xml: string,
  mimetype?: string,
): PlainPackageMetadata {
  return applyPlainManifestMetadata(archive, readManifestSequence(xml), mimetype);
}

/** Native ZipPackage::WriteContentTypes standard defaults and manifest override selection. @param manifest - Actual package PropertyValue sequences. @returns Content types XML. */
export function WriteContentTypes(manifest: readonly (readonly PropertyValue[])[]): string {
  const defaults: StringPair[] = [
      { First: "fntdata", Second: "application/x-fontdata" },
      { First: "jpeg", Second: "image/jpeg" },
      { First: "png", Second: "image/png" },
      { First: "rels", Second: "application/vnd.openxmlformats-package.relationships+xml" },
      { First: "xml", Second: "application/xml" },
    ],
    overrides: StringPair[] = [];
  for (const sequence of manifest) {
    const type = new OUString(),
      path = new OUString();
    try {
      for (const property of sequence) {
        const name = text(property.Name);
        if (name === "MediaType") property.Value.extract(type, "OUString");
        else if (name === "FullPath") property.Value.extract(path, "OUString");
      }
      const mediaType = text(type),
        fullPath = text(path);
      if (mediaType === "") continue;
      const dot = fullPath.lastIndexOf("."),
        extension = dot > 0 ? fullPath.slice(dot + 1) : "";
      if (
        extension !== "" &&
        defaults.some(
          /** Original exact default match. @param pair - Default. @returns Match. */ (pair) =>
            pair.First === extension && pair.Second === mediaType,
        )
      )
        continue;
      overrides.push({ First: "/" + fullPath, Second: mediaType });
    } finally {
      type.dispose();
      path.dispose();
    }
  }
  return WriteContentSequence(defaults, overrides);
}
