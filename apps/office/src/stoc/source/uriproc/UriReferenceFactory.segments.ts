/** @fileoverview Original UriReferenceFactory.cxx processSegments native UTF16-view traversal. The two by-value view parameters retain distinct half identities even when their underlying storage is shared. */
/** Original Segment stores a borrowed view, not a normalized or decoded path. */
export interface Segment {
  readonly leadingSlash: boolean;
  readonly excessParent: boolean;
  readonly segment: Uint16Array;
}
/** Original two-half path processing with exact excessive-parent and terminal-slash rules. @param first - Borrowed base prefix view. @param second - Borrowed target path view. @param processSpecialSegments - Whether first-half dots are processed too. @returns Original vector and processed flag; callers retain both view owners until consumed. */
export function processSegments(
  first: Uint16Array,
  second: Uint16Array,
  processSpecialSegments: boolean,
): [Segment[], boolean] {
  const segments: Segment[] = [],
    halves = [first, second];
  let processed = false,
    half = 0,
    index = 0,
    slash = false;
  if (index === (halves[half] as Uint16Array).length) {
    half = 1;
    index = 0;
  }
  if (index !== (halves[half] as Uint16Array).length) {
    if ((halves[half] as Uint16Array)[index] === 47) {
      slash = true;
      ++index;
    }
    for (;;) {
      if (index === (halves[half] as Uint16Array).length && half === 0) {
        half = 1;
        index = 0;
      }
      if (index === (halves[half] as Uint16Array).length) {
        if (slash)
          segments.push({ leadingSlash: true, excessParent: false, segment: new Uint16Array() });
        break;
      }
      const current = halves[half] as Uint16Array,
        found = current.indexOf(47, index),
        end = found < 0 ? current.length : found,
        leadingSlash: boolean = slash,
        segment = current.subarray(index, end),
        process = processSpecialSegments || half === 1;
      index = end;
      slash = false;
      if (index === (halves[half] as Uint16Array).length && half === 0) {
        half = 1;
        index = 0;
      }
      if (
        index !== (halves[half] as Uint16Array).length &&
        (halves[half] as Uint16Array)[index] === 47
      ) {
        slash = true;
        ++index;
      }
      if (process) {
        if (segment.length === 1 && segment[0] === 46) {
          slash = leadingSlash;
          processed = true;
          continue;
        }
        if (segment.length === 2 && segment[0] === 46 && segment[1] === 46) {
          if (segments.length === 0 || (segments[segments.length - 1] as Segment).excessParent)
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
