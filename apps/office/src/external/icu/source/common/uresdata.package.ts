/** @fileoverview Pinned ICU78.3 res_load/res_unload logical linked-package storage from uresdata.cpp. Native decoded raw resource graph preserves every top-level .res file, aliases, native table order, shared buffers and nofallback/pool metadata. Packed offsets, file handles, arbitrary external packages and allocator/ABI remain uncertified. */
import raw from "../data/in/icudt78l.resources.json" with { type: "json" };
import brkitr from "../data/in/icudt78l.brkitr.resources.json" with { type: "json" };
import type { Resource } from "./uresbund";
import { U_ICUDATA_BRKITR } from "./ubrkimpl";
import { U_ICUDATA_ALIAS } from "./unicode/udata";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
/** Actual immutable decoded package graph. Tuple indexes are a host projection of shared native resource storage, not substitute locale results. */
interface PackageGraph {
  bundles: Readonly<Record<string, readonly [number, number, number, number]>>;
  strings: readonly string[];
  buffers: readonly (readonly number[])[];
  nodes: readonly (readonly [number, number | readonly number[], (readonly number[])?])[];
}
/** Storage and raw node identities belong to a single linked package. */
interface ResourcePackage {
  graph: PackageGraph;
  nodes: Map<number, Resource>;
  identity: string;
}
const defaultPackage: ResourcePackage = {
  graph: raw as unknown as PackageGraph,
  nodes: new Map(),
  identity: "default-package",
};
const brkitrPackage: ResourcePackage = {
  graph: brkitr as unknown as PackageGraph,
  nodes: new Map(),
  identity: "brkitr-package",
};

/** Selects the linked package for the original narrow path. @param path - Original package name or null. @returns Linked package or null. */
function linkedPackage(path: string | null): ResourcePackage | null {
  if (path === null || path === U_ICUDATA_ALIAS) return defaultPackage;
  if (path === U_ICUDATA_BRKITR || path === U_ICUDATA_ALIAS + "-brkitr") return brkitrPackage;
  return null;
}
/** Original raw resource materialization over immutable mapped storage. @param owner - Selected linked package. @param id - Native-exported graph index. @returns Shared resource node. */
function resource(owner: ResourcePackage, id: number): Resource {
  const { graph, nodes, identity } = owner;
  const cached = nodes.get(id);
  if (cached !== undefined) return cached;
  const node = graph.nodes[id] as readonly [
      number,
      number | readonly number[],
      (readonly number[])?,
    ],
    type = node[0];
  let result: Resource;
  if (type === 0 || type === 3)
    result = { type, value: graph.strings[node[1] as number] as string };
  else if (type === 7) result = { type, value: node[1] as number };
  else if (type === 1 || type === 14)
    result = {
      type,
      storage: `${identity}:${node[1]}`,
      value: graph.buffers[node[1] as number] as readonly number[],
    };
  else if (type === 8) {
    const children = (node[1] as readonly number[]).map(
        /** Materializes a child in the same package. @param child - Graph index. @returns Raw child. */
        (child) => resource(owner, child),
      ),
      aliasIndices: number[] = [];
    for (let i = 0; i < children.length; ++i) if (children[i]?.type === 3) aliasIndices.push(i);
    result = { type, aliasIndices, value: children };
  } else {
    const keys = (node[1] as readonly number[]).map(
        /** Borrows native key text. @param index - String index. @returns Key. */ (index) =>
          graph.strings[index] as string,
      ),
      children = node[2] as readonly number[],
      aliasIndices: number[] = [],
      value: Record<string, Resource> = Object.create(null);
    for (let i = 0; i < keys.length; ++i) {
      const child = resource(owner, children[i] as number);
      value[keys[i] as string] = child;
      if (child.type === 3) aliasIndices.push(i);
    }
    result = { type: 2, keys, aliasIndices, value };
  }
  nodes.set(id, result);
  return result;
}
/** Original ResourceData consumed logical fields. Source res_load memset clears even on an incoming failure. */
export class ResourceData {
  /** Native open allocates an independent opaque handle while mapped resource storage is shared. */
  data: object | null = null;
  rootRes: Resource = { type: 0, value: "" };
  noFallback = false;
  usesPoolBundle = false;
  isPoolBundle = false;
}
/** Original linked-package raw loader; it does not resolve %%ALIAS or locale fallback. @param out - Existing data owner. @param path - Package name or default null. @param name - C resource name. @param status - Sticky status. @returns Nothing. */
export function res_load(
  out: ResourceData,
  path: string | null,
  name: string,
  status: [number],
): void {
  out.data = null;
  out.rootRes = { type: 0, value: "" };
  out.noFallback = out.usesPoolBundle = out.isPoolBundle = false;
  if (U_FAILURE(status[0])) return;
  if (name === null) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return;
  }
  const end = name.indexOf("\0");
  if (end >= 0) name = name.slice(0, end);
  if (name.length === 0) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return;
  }
  const owner = linkedPackage(path);
  if (owner === null || !Object.hasOwn(owner.graph.bundles, name)) {
    status[0] = E.U_FILE_ACCESS_ERROR;
    return;
  }
  const tuple = owner.graph.bundles[name] as readonly [number, number, number, number];
  out.data = {};
  out.rootRes = resource(owner, tuple[0]);
  out.noFallback = tuple[1] !== 0;
  out.usesPoolBundle = tuple[2] !== 0;
  out.isPoolBundle = tuple[3] !== 0;
}
/** Original unload clears only the owned data handle; source flags/resource token remain. Native use after physical release is not certified. @param data - Owner. @returns Nothing. */
export function res_unload(data: ResourceData): void {
  if (data.data !== null) data.data = null;
}
