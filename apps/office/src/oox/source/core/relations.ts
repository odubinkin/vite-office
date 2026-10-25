/** @fileoverview Ports pinned oox::core::Relation/Relations lookup, map ordering and fragment resolution; UTF16 values use JS strings at the XML/package boundary. */

/** Original relation value; missing attributes default to empty strings and an internal target. */
export class Relation {
  maId = "";
  maType = "";
  maTarget = "";
  mbExternal = false;
}

/** Native transitional office-document relationship prefix. */
export const OFFICE_DOCUMENT_RELATION =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/";
/** Native strict office-document relationship prefix. */
export const STRICT_OFFICE_DOCUMENT_RELATION =
  "http://purl.oclc.org/ooxml/officeDocument/relationships/";
/** Native Microsoft relationship fallback prefix. */
export const MS_OFFICE_RELATION = "http://schemas.microsoft.com/office/2006/relationships/";

/** Drops the final path component, including the preceding slash. @param path - Native fragment path. @returns Parent path. */
function removeFileName(path: string): string {
  const index = path.lastIndexOf("/");
  return index === -1 ? "" : path.slice(0, index);
}

/** Original ASCII-only case folding, leaving other UTF16 units intact. @param value - Type URI. @returns Folded type. */
function asciiLower(value: string): string {
  return value.replace(
    /[A-Z]/g,
    /** Folds one ASCII capital. @param c - Capital. @returns Lowercase. */ (c) => c.toLowerCase(),
  );
}

/** Relation owner preserves std::map UTF16 lexical order and first-emplace semantics. */
export class Relations {
  private readonly maMap = new Map<string, Readonly<Relation>>();
  /** Retains the owning fragment, with the empty string identifying package relationships. @param maFragmentPath - Owner path. @returns Collection. */
  constructor(private readonly maFragmentPath: string) {}
  /** Native collection size. @returns Count. */
  size(): number {
    return this.maMap.size;
  }
  /** Native std::map count. @param id - Identity. @returns Zero or one. */
  count(id: string): number {
    return this.maMap.has(id) ? 1 : 0;
  }
  /** Copies the relation only if its key is absent. @param id - Map key. @param relation - Value. @returns Nothing. */
  emplace(id: string, relation: Readonly<Relation>): void {
    if (!this.maMap.has(id)) this.maMap.set(id, { ...relation });
  }
  /** Enumerates the same UTF16 key order as the native map. @returns Ordered entries. */
  entries(): readonly (readonly [string, Readonly<Relation>])[] {
    return [...this.maMap.keys()]
      .sort()
      .map(
        /** Borrows a sorted entry. @param id - Key. @returns Entry. */ (id) =>
          [id, this.maMap.get(id) as Readonly<Relation>] as const,
      );
  }
  /** Borrows the fragment path. @returns Path. */
  getFragmentPath(): string {
    return this.maFragmentPath;
  }
  /** Looks up a native exact ID. @param id - ID. @returns Value or null. */
  getRelationFromRelId(id: string): Readonly<Relation> | null {
    return this.maMap.get(id) ?? null;
  }
  /** Selects the first sorted-ID ASCII-insensitive type match. @param type - Type. @returns Relation or null. */
  getRelationFromFirstType(type: string): Readonly<Relation> | null {
    for (const [, relation] of this.entries())
      if (asciiLower(relation.maType) === asciiLower(type)) return relation;
    return null;
  }
  /** Copies both strict and transitional matches, preserving the fragment owner. @param type - Unqualified type. @returns Filtered relations. */
  getRelationsFromTypeFromOfficeDoc(type: string): Relations {
    const result = new Relations(this.maFragmentPath);
    for (const [id, relation] of this.entries())
      if (
        asciiLower(relation.maType) === asciiLower(OFFICE_DOCUMENT_RELATION + type) ||
        asciiLower(relation.maType) === asciiLower(STRICT_OFFICE_DOCUMENT_RELATION + type)
      )
        result.emplace(id, relation);
    return result;
  }
  /** Returns only external raw targets. @param id - ID. @returns Target or empty. */
  getExternalTargetFromRelId(id: string): string {
    const relation = this.getRelationFromRelId(id);
    return relation?.mbExternal ? relation.maTarget : "";
  }
  /** Returns only internal raw targets. @param id - ID. @returns Target or empty. */
  getInternalTargetFromRelId(id: string): string {
    const relation = this.getRelationFromRelId(id);
    return relation && !relation.mbExternal ? relation.maTarget : "";
  }
  /** Ports the original path algorithm, including its handling of dot/empty segments. @param relation - Relation. @returns Fragment or empty. */
  getFragmentPathFromRelation(relation: Readonly<Relation>): string {
    if (relation.mbExternal || relation.maTarget === "") return "";
    const target = relation.maTarget;
    if (target[0] === "/") return target.slice(1);
    if (this.maFragmentPath === "") return target;
    let path = removeFileName(this.maFragmentPath),
      start = 0;
    while (start < target.length) {
      let end = target.indexOf("/", start);
      if (end < 0) end = target.length;
      const part = target.slice(start, end);
      path = part === ".." ? removeFileName(path) : path === "" ? part : path + "/" + part;
      start = end + 1;
    }
    return path;
  }
  /** Resolves one ID. @param id - ID. @returns Path or empty. */
  getFragmentPathFromRelId(id: string): string {
    const relation = this.getRelationFromRelId(id);
    return relation ? this.getFragmentPathFromRelation(relation) : "";
  }
  /** Resolves the first matching type. @param type - Type URI. @returns Path or empty. */
  getFragmentPathFromFirstType(type: string): string {
    const relation = this.getRelationFromFirstType(type);
    return relation ? this.getFragmentPathFromRelation(relation) : "";
  }
  /** Tries transitional, strict and then Microsoft type identities as upstream does. @param type - Unqualified type. @returns Path or empty. */
  getFragmentPathFromFirstTypeFromOfficeDoc(type: string): string {
    const relation =
      this.getRelationFromFirstType(OFFICE_DOCUMENT_RELATION + type) ??
      this.getRelationFromFirstType(STRICT_OFFICE_DOCUMENT_RELATION + type) ??
      this.getRelationFromFirstType(MS_OFFICE_RELATION + type);
    return relation ? this.getFragmentPathFromRelation(relation) : "";
  }
}
