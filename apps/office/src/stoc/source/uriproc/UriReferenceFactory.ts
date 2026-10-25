/** @fileoverview Consumed generic URI parser and native Factory::makeAbsolute/processSegments algorithm; preserves excessive parents, escapes and empty components instead of browser URL normalization. */
import { UriReference } from "./UriReference";

/** Original RelativeUriExcessParentSegments constants. */
export enum RelativeUriExcessParentSegments {
  ERROR = 0,
  RETAIN = 1,
  REMOVE = 2,
}
/** Original processSegments entry. */
interface Segment {
  leadingSlash: boolean;
  excessParent: boolean;
  segment: string;
}

/** Ports the original two-half traversal, including terminal separators and excessive parent markers. @param first - Base path prefix. @param second - Reference path. @param special - Process special segments in base too. @returns Segments and whether any special segments were processed. */
export function processSegments(
  first: string,
  second: string,
  special: boolean,
): readonly [readonly Segment[], boolean] {
  const halves = [first, second],
    segments: Segment[] = [];
  let half = 0,
    index = 0,
    slash = false,
    processed = false;
  if (first.length === 0) half = 1;
  if (index !== (halves[half] as string).length) {
    if ((halves[half] as string)[index] === "/") {
      slash = true;
      ++index;
    }
    for (;;) {
      if (index === (halves[half] as string).length && half === 0) {
        half = 1;
        index = 0;
      }
      const current = halves[half] as string;
      if (index === current.length) {
        if (slash) segments.push({ leadingSlash: true, excessParent: false, segment: "" });
        break;
      }
      const found = current.indexOf("/", index),
        end = found < 0 ? current.length : found;
      const leadingSlash: boolean = slash;
      const segment = current.slice(index, end),
        process = special || half === 1;
      index = end;
      slash = false;
      if (index === current.length && half === 0) {
        half = 1;
        index = 0;
      }
      if (index !== (halves[half] as string).length && (halves[half] as string)[index] === "/") {
        slash = true;
        ++index;
      }
      if (process) {
        if (segment === ".") {
          slash = leadingSlash;
          processed = true;
          continue;
        }
        if (segment === "..") {
          if (segments.length === 0 || segments.at(-1)?.excessParent)
            segments.push({ leadingSlash, excessParent: true, segment });
          else {
            if (leadingSlash) segments.pop();
            slash = leadingSlash;
          }
          processed = true;
          continue;
        }
      }
      segments.push({ leadingSlash, excessParent: false, segment });
    }
  }
  return [segments, processed];
}

/** Generic factory operations consumed by Writer package streams; specialized scheme services remain outside this surface. */
export class UriReferenceFactory {
  /** Original generic parser leaves lexical escapes and path spelling intact. @param reference - UTF16 URI. @returns Parsed URI. */
  parse(reference: string): UriReference {
    const hash = reference.indexOf("#"),
      fragment = hash < 0 ? reference.length : hash;
    const schemeMatch = /^[A-Za-z][A-Za-z0-9+.-]*:/.exec(reference.slice(0, fragment));
    const scheme = schemeMatch ? schemeMatch[0].slice(0, -1) : "";
    const part = reference.slice(schemeMatch?.[0].length ?? 0, fragment);
    let index = 0,
      authority: string | null = null;
    if (part.startsWith("//")) {
      index = 2;
      while (index < part.length && part[index] !== "/" && part[index] !== "?") ++index;
      authority = part.slice(2, index);
    }
    const question = part.indexOf("?", index),
      end = question < 0 ? part.length : question;
    const result = new UriReference(
      scheme,
      authority,
      part.slice(index, end),
      question < 0 ? null : part.slice(end + 1),
    );
    if (hash >= 0) result.setFragment(reference.slice(hash + 1));
    return result;
  }

  /** Native makeAbsolute, preserving source special-segment and absent-component semantics. @param base - Absolute base. @param reference - URI to resolve. @param special - Process additional special segments. @param excess - Excess-parent policy. @returns Absolute URI or null. */
  makeAbsolute(
    base: UriReference | null,
    reference: UriReference | null,
    special: boolean,
    excess: RelativeUriExcessParentSegments,
  ): UriReference | null {
    if (!base?.isAbsolute() || !reference) return null;
    /** Serializes native segments under the selected excess-parent policy. @param segments - Native entries. @returns Path or null. */
    function pathOf(segments: readonly Segment[]): string | null {
      let path = "";
      for (const entry of segments) {
        if (entry.excessParent) {
          if (excess === RelativeUriExcessParentSegments.ERROR) return null;
          if (excess === RelativeUriExcessParentSegments.REMOVE) continue;
        }
        path += (entry.leadingSlash ? "/" : "") + entry.segment;
      }
      return path;
    }
    let scheme = base.getScheme();
    let authority: string | null, path: string, query: string | null;
    if (reference.isAbsolute()) {
      if (!special) return this.parse(reference.getUriReference());
      const [segments, processed] = processSegments(reference.getPath(), "", true);
      if (!processed) return this.parse(reference.getUriReference());
      const normalized = pathOf(segments);
      if (normalized === null) return null;
      scheme = reference.getScheme();
      authority = reference.hasAuthority() ? reference.getAuthority() : null;
      path = normalized;
      query = reference.hasQuery() ? reference.getQuery() : null;
    } else if (!reference.hasAuthority() && reference.getPath() === "") {
      authority = base.hasAuthority() ? base.getAuthority() : null;
      path = base.getPath();
      query = reference.hasQuery()
        ? reference.getQuery()
        : base.hasQuery()
          ? base.getQuery()
          : null;
    } else {
      authority = reference.hasAuthority()
        ? reference.getAuthority()
        : base.hasAuthority()
          ? base.getAuthority()
          : null;
      if (reference.hasRelativePath()) {
        let first = base.getPath();
        if (first === "") {
          if (base.hasAuthority()) first = "/";
        } else first = first.slice(0, first.lastIndexOf("/") + 1);
        const normalized = pathOf(processSegments(first, reference.getPath(), special)[0]);
        if (normalized === null) return null;
        path = normalized;
      } else {
        path = reference.getPath();
        if (special) {
          const [segments, processed] = processSegments(path, "", true);
          if (processed) {
            const normalized = pathOf(segments);
            if (normalized === null) return null;
            path = normalized;
          }
        }
      }
      query = reference.hasQuery() ? reference.getQuery() : null;
    }
    const result = new UriReference(scheme, authority, path, query);
    if (reference.hasFragment()) result.setFragment(reference.getFragment());
    return result;
  }
}
