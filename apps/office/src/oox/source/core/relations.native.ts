/** @fileoverview Original Relation/Relations native OUString values, ordered map contracts, path resolution and actual shared ownership. Existing host relations remain explicitly separate until native fragment/filter migration. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import { SharedReference } from "./shared-reference";
/** Original shared relation collection pointer alias. */
export type RelationsRef = SharedReference<Relations>;
/** Original const Relations reference exposes only source const queries. */
export type RelationsConstReference = Readonly<
  Pick<
    Relations,
    | "size"
    | "count"
    | "entries"
    | "getFragmentPath"
    | "getRelationFromRelId"
    | "getRelationFromFirstType"
    | "getRelationsFromTypeFromOfficeDoc"
    | "getExternalTargetFromRelId"
    | "getInternalTargetFromRelId"
    | "getFragmentPathFromRelation"
    | "getFragmentPathFromRelId"
    | "getFragmentPathFromFirstType"
    | "getFragmentPathFromFirstTypeFromOfficeDoc"
  >
>;

/** Original borrowed const relation fields. */
export interface RelationConstReference {
  readonly maId: OUStringConstReference;
  readonly maType: OUStringConstReference;
  readonly maTarget: OUStringConstReference;
  readonly mbExternal: boolean;
}
/** Original default/implicit-copy relation value. */
export class Relation implements RelationConstReference {
  private readonly id = new OUString();
  private readonly type = new OUString();
  private readonly target = new OUString();
  mbExternal = false;
  /** Original default or implicit fieldwise copy. @param source - Optional native source. @returns Value. */
  constructor(source?: RelationConstReference) {
    if (source !== undefined) this.assign(source);
  }
  /** Original stable ID member. @returns Native member. */ get maId(): OUString {
    return this.id;
  }
  /** Original member copy assignment. @param value - Borrowed source. @returns Nothing. */ set maId(
    value: OUStringConstReference,
  ) {
    this.id.assign(value);
  }
  /** Original stable type member. @returns Native member. */ get maType(): OUString {
    return this.type;
  }
  /** Original member copy assignment. @param value - Borrowed source. @returns Nothing. */ set maType(
    value: OUStringConstReference,
  ) {
    this.type.assign(value);
  }
  /** Original stable target member. @returns Native member. */ get maTarget(): OUString {
    return this.target;
  }
  /** Original member copy assignment. @param value - Borrowed source. @returns Nothing. */ set maTarget(
    value: OUStringConstReference,
  ) {
    this.target.assign(value);
  }
  /** Original implicit memberwise assignment. @param source - Borrowed source. @returns This value. */
  assign(source: RelationConstReference): this {
    this.maId = source.maId;
    this.maType = source.maType;
    this.maTarget = source.maTarget;
    this.mbExternal = source.mbExternal;
    return this;
  }
  /** Original reverse field destruction. @returns Nothing. */ dispose(): void {
    this.target.dispose();
    this.type.dispose();
    this.id.dispose();
  }
}
/** Original std::map owned key/value pair; physical tree layout/allocation complexity is not claimed by the sorted native-key binding. */
type Entry = readonly [OUString, Relation];
/** Original counted view conversion. @param value - Native source. @returns Borrowed view. */
function view(value: OUStringConstReference): Uint16Array {
  return value.getStr().subarray(0, value.getLength());
}
/** Original lclRemoveFileName returns a borrowed view. @param path - Native path view. @returns Parent view. */
function lclRemoveFileName(path: Uint16Array): Uint16Array {
  const index = path.lastIndexOf(47);
  return index < 0 ? new Uint16Array() : path.subarray(0, index);
}
/** Original lclAppendFileName value return/concat. @param path - Parent view. @param file - Native file value. @returns Owned result. */
function lclAppendFileName(path: Uint16Array, file: OUStringConstReference): OUString {
  return path.length === 0
    ? new OUString(file)
    : new OUString(new StringConcat(new StringConcat(path, new Uint16Array([47])), file));
}
/** Original source ASCII concatenation literal. @param c - Source unit. @returns Byte. */ function ascii(
  c: string,
): number {
  return c.charCodeAt(0);
}
const office = Uint8Array.from(
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/\0",
    ascii,
  ),
  strict = Uint8Array.from("http://purl.oclc.org/ooxml/officeDocument/relationships/\0", ascii),
  microsoft = Uint8Array.from("http://schemas.microsoft.com/office/2006/relationships/\0", ascii);
/** Original three relation type concat helpers. @param prefix - Declared source literal. @param type - Borrowed type view. @returns Owned concatenation. */
function createType(prefix: Uint8Array, type: Uint16Array): OUString {
  return new OUString(new StringConcat(OUString.Concat(prefix), type));
}
/** Original native relation collection and path owner. */
export class Relations {
  private readonly maMap: Entry[] = [];
  private readonly maFragmentPath: OUString;
  /** Original by-value argument/move lowers to one retained native field copy for a borrowed caller. @param path - Native fragment path. @returns Collection. */
  constructor(path: OUStringConstReference) {
    this.maFragmentPath = new OUString(path);
  }
  /** Original size. @returns Count. */ size(): number {
    return this.maMap.length;
  }
  /** Original native-key lower_bound for std::map operations. @param key - Native key. @returns Position. */
  private lowerBound(key: OUStringConstReference): number {
    let first = 0,
      count = this.maMap.length;
    while (count !== 0) {
      const step = Math.floor(count / 2),
        middle = first + step;
      if ((this.maMap[middle] as Entry)[0].compareTo(key) < 0) {
        first = middle + 1;
        count -= step + 1;
      } else count = step;
    }
    return first;
  }
  /** Original count. @param key - Native key. @returns Zero or one. */ count(
    key: OUStringConstReference,
  ): number {
    return this.getRelationFromRelId(key) === null ? 0 : 1;
  }
  /** Original emplace retains first equal key and copies actual native fields. @param key - Native map key. @param value - Native relation. @returns Nothing. */
  emplace(key: OUStringConstReference, value: RelationConstReference): void {
    const at = this.lowerBound(key);
    if (at !== this.maMap.length && (this.maMap[at] as Entry)[0].equals(key)) return;
    this.maMap.splice(at, 0, [new OUString(key), new Relation(value)]);
  }
  /** Original begin/end traversal in native Unicode key order. @returns Borrowed ordered entries. */
  entries(): readonly (readonly [OUStringConstReference, RelationConstReference])[] {
    return this.maMap;
  }
  /** Original borrowed fragment field. @returns Const native path. */ getFragmentPath(): OUStringConstReference {
    return this.maFragmentPath;
  }
  /** Original exact ID lookup. @param id - Native key. @returns Borrowed relation or null. */
  getRelationFromRelId(id: OUStringConstReference): RelationConstReference | null {
    const at = this.lowerBound(id);
    return at < this.maMap.length && (this.maMap[at] as Entry)[0].equals(id)
      ? (this.maMap[at] as Entry)[1]
      : null;
  }
  /** Original first ordered ASCII-insensitive type match. @param type - Native type view. @returns Borrowed relation or null. */
  getRelationFromFirstType(type: Uint16Array): RelationConstReference | null {
    for (const [, value] of this.maMap) if (value.maType.equalsIgnoreAsciiCase(type)) return value;
    return null;
  }
  /** Original shared result copies only Transitional/Strict matches and retains source fragment path. @param type - Native unqualified view. @returns Actual shared result. */
  getRelationsFromTypeFromOfficeDoc(type: Uint16Array): RelationsRef {
    const result = new SharedReference(new Relations(this.maFragmentPath));
    try {
      for (const [key, value] of this.maMap) {
        const transitional = createType(office, type);
        let match: boolean;
        try {
          match = value.maType.equalsIgnoreAsciiCase(transitional);
          if (!match) {
            const strictType = createType(strict, type);
            try {
              match = value.maType.equalsIgnoreAsciiCase(strictType);
            } finally {
              strictType.dispose();
            }
          }
        } finally {
          transitional.dispose();
        }
        if (match) result.operatorStar().emplace(key, value);
      }
      return result;
    } catch (error) {
      result.dispose();
      throw error;
    }
  }
  /** Original external-only target value. @param id - Native ID. @returns Owned target or empty. */
  getExternalTargetFromRelId(id: OUStringConstReference): OUString {
    const value = this.getRelationFromRelId(id);
    return value !== null && value.mbExternal ? new OUString(value.maTarget) : new OUString();
  }
  /** Original internal-only target value. @param id - Native ID. @returns Owned target or empty. */
  getInternalTargetFromRelId(id: OUStringConstReference): OUString {
    const value = this.getRelationFromRelId(id);
    return value !== null && !value.mbExternal ? new OUString(value.maTarget) : new OUString();
  }
  /** Original relative path algorithm preserves dot, empty, root and external behavior. @param relation - Native relation. @returns Owned result. */
  getFragmentPathFromRelation(relation: RelationConstReference): OUString {
    if (relation.mbExternal || relation.maTarget.isEmpty()) return new OUString();
    if (relation.maTarget.charAt(0) === 47) return relation.maTarget.copy(1);
    if (this.maFragmentPath.isEmpty()) return new OUString(relation.maTarget);
    const path = new OUString(
      lclRemoveFileName(view(this.maFragmentPath)),
      lclRemoveFileName(view(this.maFragmentPath)).length,
    );
    try {
      let start = 0;
      while (start < relation.maTarget.getLength()) {
        let end = relation.maTarget.indexOf(47, start);
        if (end < 0) end = relation.maTarget.getLength();
        if (
          start + 2 === end &&
          relation.maTarget.charAt(start) === 46 &&
          relation.maTarget.charAt(start + 1) === 46
        ) {
          const parent = lclRemoveFileName(view(path)),
            temporary = new OUString(parent, parent.length);
          try {
            path.moveAssign(temporary);
          } finally {
            temporary.dispose();
          }
        } else {
          const file = relation.maTarget.copy(start, end - start);
          try {
            const appended = lclAppendFileName(view(path), file);
            try {
              path.moveAssign(appended);
            } finally {
              appended.dispose();
            }
          } finally {
            file.dispose();
          }
        }
        start = end + 1;
      }
      return path;
    } catch (error) {
      path.dispose();
      throw error;
    }
  }
  /** Original ID path lookup. @param id - Native ID. @returns Owned path. */
  getFragmentPathFromRelId(id: OUStringConstReference): OUString {
    const value = this.getRelationFromRelId(id);
    return value === null ? new OUString() : this.getFragmentPathFromRelation(value);
  }
  /** Original full-type path lookup. @param type - Native type view. @returns Owned path. */
  getFragmentPathFromFirstType(type: Uint16Array): OUString {
    const value = this.getRelationFromFirstType(type);
    return value === null ? new OUString() : this.getFragmentPathFromRelation(value);
  }
  /** Original Transitional/Strict/Microsoft short-circuit lookup. @param type - Native unqualified type. @returns Owned path. */
  getFragmentPathFromFirstTypeFromOfficeDoc(type: Uint16Array): OUString {
    const transitional = createType(office, type);
    try {
      let relation = this.getRelationFromFirstType(view(transitional));
      if (relation === null) {
        const strictType = createType(strict, type);
        try {
          relation = this.getRelationFromFirstType(view(strictType));
          if (relation === null) {
            const msType = createType(microsoft, type);
            try {
              relation = this.getRelationFromFirstType(view(msType));
            } finally {
              msType.dispose();
            }
          }
        } finally {
          strictType.dispose();
        }
      }
      return relation === null ? new OUString() : this.getFragmentPathFromRelation(relation);
    } finally {
      transitional.dispose();
    }
  }
  /** Original reverse members/map element destruction. @returns Nothing. */
  dispose(): void {
    this.maFragmentPath.dispose();
    for (const [key, value] of this.maMap) {
      value.dispose();
      key.dispose();
    }
  }
}
