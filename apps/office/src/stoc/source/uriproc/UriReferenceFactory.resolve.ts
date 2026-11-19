/** @fileoverview Complete original UriReferenceFactory.cxx makeAbsolute/makeRelative algorithms, on the same native factory receiver. Source temporary/string-view ownership is explicit; no browser URL or string-facing URI model is used. */
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XUriReference } from "../../../udkapi/com/sun/star/uri/XUriReference";
import { RelativeUriExcessParentSegments as E } from "../../../udkapi/com/sun/star/uri/RelativeUriExcessParentSegments";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { processSegments, type Segment } from "./UriReferenceFactory.segments";
import { parseScheme, equalIgnoreEscapeCase } from "./UriReferenceFactory.generic";
import {
  ascii,
  view,
  empty,
  is,
  starts,
  equal,
  sameScheme,
  append,
  schemeBuffer,
  appendScheme,
  expression,
  matches,
} from "./UriReferenceFactory.temporaries";
import type { Factory } from "./UriReferenceFactory";
/** Original repeated segment emission switch, lowered without replacing its vector/views. @param output - Actual source buffer. @param segments - Original vector. @param excess - Original policy enum. @returns False only on original ERROR return. */
function emit(output: OUStringBuffer, segments: readonly Segment[], excess: E): boolean {
  for (const item of segments) {
    if (item.excessParent) {
      switch (excess) {
        case E.ERROR:
          return false;
        case E.RETAIN:
          if (!(item.segment.length === 2 && item.segment[0] === 46 && item.segment[1] === 46))
            throw new Error("assert(excess segment == ..)");
          break;
        case E.REMOVE:
          continue;
        default:
          throw new Error("assert(valid excess-parent policy)");
      }
    }
    if (item.leadingSlash) output.append(ascii("/"));
    output.append(item.segment);
  }
  return true;
}
/** Original final buffer temporary consumed by parse at the full-expression boundary. @param factory - Actual receiver. @param buffer - Actual output. @returns Acquired URI. */
function parsed(factory: Factory, buffer: OUStringBuffer): Reference<XUriReference> {
  const value = buffer.makeStringAndClear();
  try {
    return factory.parse(value);
  } finally {
    value.dispose();
  }
}
/** Original makeAbsolute, including clone paths and all excess-parent policies. @param this - Original URI factory receiver. @param base - Actual base reference. @param target - Actual target reference. @param special - Original processAdditionalSpecialSegments. @param excess - Original policy. @returns Original fresh URI or empty reference. */
export function makeAbsolute(
  this: Factory,
  base: Reference<XUriReference>,
  target: Reference<XUriReference>,
  special: boolean,
  excess: E,
): Reference<XUriReference> {
  if (!base.is() || !base.operatorStar().isAbsolute() || !target.is())
    return new Reference<XUriReference>();
  const b = base.operatorStar(),
    r = target.operatorStar();
  if (r.isAbsolute()) {
    if (special) {
      const path = r.getPath();
      try {
        const [segments, processed] = processSegments(view(path), new Uint16Array(), true);
        if (processed) {
          const output = schemeBuffer(r.getScheme());
          try {
            if (r.hasAuthority()) append(output, r.getAuthority(), "//");
            if (!emit(output, segments, excess)) return new Reference<XUriReference>();
            if (r.hasQuery()) append(output, r.getQuery(), "?");
            if (r.hasFragment()) append(output, r.getFragment(), "#");
            return parsed(this, output);
          } finally {
            output.dispose();
          }
        }
      } finally {
        path.dispose();
      }
    }
    return this.clone(target);
  }
  if (!r.hasAuthority() && empty(r.getPath())) {
    const output = schemeBuffer(b.getScheme());
    try {
      if (b.hasAuthority()) append(output, b.getAuthority(), "//");
      append(output, b.getPath());
      if (r.hasQuery()) append(output, r.getQuery(), "?");
      else if (b.hasQuery()) append(output, b.getQuery(), "?");
      if (r.hasFragment()) append(output, r.getFragment(), "#");
      return parsed(this, output);
    } finally {
      output.dispose();
    }
  }
  const output = new OUStringBuffer(128);
  try {
    appendScheme(output, b.getScheme());
    if (r.hasAuthority()) append(output, r.getAuthority(), "//");
    else if (b.hasAuthority()) append(output, b.getAuthority(), "//");
    if (r.hasRelativePath()) {
      const path1 = b.getPath();
      try {
        if (path1.isEmpty()) {
          if (b.hasAuthority()) {
            const slash = new OUString(ascii("/"));
            try {
              path1.assign(slash);
            } finally {
              slash.dispose();
            }
          }
        } else {
          const directory = path1.copy(0, path1.lastIndexOf(47) + 1);
          try {
            path1.assign(directory);
          } finally {
            directory.dispose();
          }
        }
        const path2 = r.getPath();
        try {
          const [segments] = processSegments(view(path1), view(path2), special);
          if (!emit(output, segments, excess)) return new Reference<XUriReference>();
        } finally {
          path2.dispose();
        }
      } finally {
        path1.dispose();
      }
    } else {
      let processed = false;
      if (special) {
        const path = r.getPath();
        try {
          const [segments, proc] = processSegments(view(path), new Uint16Array(), true);
          if (proc) {
            if (!emit(output, segments, excess)) return new Reference<XUriReference>();
            processed = true;
          }
        } finally {
          path.dispose();
        }
      }
      if (!processed) append(output, r.getPath());
    }
    if (r.hasQuery()) append(output, r.getQuery(), "?");
    if (r.hasFragment()) append(output, r.getFragment(), "#");
    return parsed(this, output);
  } finally {
    output.dispose();
  }
}
/** Original makeRelative, retaining escaped-unit comparison and all preference flags. @param this - Original URI factory receiver. @param base - Actual base reference. @param target - Actual target reference. @param preferAuthority - Source preference. @param preferAbsolute - Source preference. @param encodeSpecial - Original special-segment encoding flag. @returns Fresh source URI or empty reference. */
export function makeRelative(
  this: Factory,
  base: Reference<XUriReference>,
  target: Reference<XUriReference>,
  preferAuthority: boolean,
  preferAbsolute: boolean,
  encodeSpecial: boolean,
): Reference<XUriReference> {
  if (!base.is() || !base.operatorStar().isAbsolute() || !target.is())
    return new Reference<XUriReference>();
  const b = base.operatorStar(),
    r = target.operatorStar();
  if (!r.isAbsolute() || r.hasRelativePath() || !sameScheme(b.getScheme(), r.getScheme()))
    return this.clone(target);
  const output = new OUStringBuffer(128);
  try {
    let omitQuery = false;
    if (b.hasAuthority() !== r.hasAuthority() || !equal(b.getAuthority(), r.getAuthority())) {
      if (r.hasAuthority()) append(output, r.getAuthority(), "//");
      append(output, r.getPath());
    } else if (
      expression(
        /** Preserves original full-expression lifetimes across path/query short-circuit operands. @param keep - Actual native temporary retention. @returns Original predicate. */ (
          keep,
        ) =>
          (equalIgnoreEscapeCase(view(keep(b.getPath())), view(keep(r.getPath()))) ||
            (matches(keep(b.getPath()), "/") && keep(r.getPath()).isEmpty())) &&
          b.hasQuery() === r.hasQuery() &&
          equalIgnoreEscapeCase(view(keep(b.getQuery())), view(keep(r.getQuery()))),
      )
    )
      omitQuery = true;
    else {
      const count1 = Math.max(b.getPathSegmentCount(), 1),
        count2 = Math.max(r.getPathSegmentCount(), 1);
      let i = 0;
      for (; i < Math.min(count1, count2) - 1; ++i)
        if (!equal(b.getPathSegment(i), r.getPathSegment(i))) break;
      if (
        i === 0 &&
        (preferAbsolute || r.hasQuery()) &&
        (preferAuthority || !starts(r.getPath(), "//"))
      ) {
        if (empty(r.getPath())) {
          if (
            expression(
              /** Retains both source getter temporaries until the complete condition ends. @param keep - Native temporary retention. @returns Original predicate. */ (
                keep,
              ) => !keep(b.getPath()).isEmpty() && !matches(keep(b.getPath()), "/"),
            )
          )
            output.append(ascii("/"));
        } else if (is(r.getPath(), "/")) {
          if (
            expression(
              /** Retains source getter temporaries across the original logical-or. @param keep - Native temporary retention. @returns Original predicate. */ (
                keep,
              ) => keep(b.getPath()).isEmpty() || !matches(keep(b.getPath()), "/"),
            )
          )
            output.append(ascii("/"));
        } else {
          if (starts(r.getPath(), "//")) {
            if (!r.hasAuthority()) throw new Error("assert(target has authority)");
            append(output, r.getAuthority(), "//");
          }
          append(output, r.getPath());
        }
      } else {
        let segments = false;
        for (let j = i; j < count1 - 1; ++j) {
          if (segments) output.append(ascii("/"));
          output.append(ascii(".."));
          segments = true;
        }
        if (i < count2 - 1 || !empty(r.getPathSegment(count2 - 1))) {
          if (
            expression(
              /** Preserves the original two possible path-segment temporaries within one short-circuit condition. @param keep - Native temporary retention. @returns Original predicate. */ (
                keep,
              ) =>
                !segments &&
                (keep(r.getPathSegment(i)).isEmpty() ||
                  parseScheme(view(keep(r.getPathSegment(i)))) >= 0),
            )
          ) {
            output.append(ascii("."));
            segments = true;
          }
          for (; i < count2; ++i) {
            if (segments) output.append(ascii("/"));
            const segment = r.getPathSegment(i);
            try {
              if (encodeSpecial && segment.getLength() === 1 && segment.getStr()[0] === 46)
                output.append(ascii("%2E"));
              else if (
                encodeSpecial &&
                segment.getLength() === 2 &&
                segment.getStr()[0] === 46 &&
                segment.getStr()[1] === 46
              )
                output.append(ascii("%2E%2E"));
              else output.append(segment);
            } finally {
              segment.dispose();
            }
            segments = true;
          }
        }
      }
    }
    if (!omitQuery && r.hasQuery()) append(output, r.getQuery(), "?");
    if (r.hasFragment()) append(output, r.getFragment(), "#");
    return parsed(this, output);
  } finally {
    output.dispose();
  }
}
