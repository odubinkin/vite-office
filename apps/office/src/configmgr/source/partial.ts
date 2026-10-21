/** @fileoverview Original configmgr Partial include/exclude tree and containment predicates from partial.hxx/cxx, including root and set-path quirks. */
import { assert } from "../../sal/inc/cassert";
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { Data } from "./data";

/** Erases local native string concatenation. @param value - Actual string. @returns Exact UTF16 text. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); i++)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Constructs native diagnostic strings without normalization. @param value - Exact text. @returns Actual owner. */
function unicode(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Actual nested Partial::Node; unordered content keys erase to primitive UTF16 map keys. */
class PartialNode {
  public startInclude = false;
  public readonly children = new Map<string, PartialNode>();
  /** Original tree-node reset. @returns Nothing. */
  public clear(): void {
    this.startInclude = false;
    this.children.clear();
  }
}
/** Original helper consumes one slash and canonicalizes the following Data segment. @param path - Source path. @param index - Mutable signed32 offset. @param segment - Actual output owner. @returns Whether this was the last segment. */
function parseSegment(path: OUStringConstReference, index: [number], segment: OUString): boolean {
  assert(index[0] >= 0 && index[0] <= path.getLength(), "index >= 0 && index <= path.getLength()");
  if (path.getStr()[index[0]++] === 47) {
    const name = new OUString(),
      templateName = new OUString(),
      setElement: [boolean] = [false];
    index[0] = Data.parseSegment(path, index[0], name, setElement, templateName);
    if (index[0] !== -1) {
      segment.assign(Data.createSegment(templateName, name));
      return index[0] === path.getLength();
    }
  }
  throw new RuntimeException(unicode("bad path " + text(path)), new Reference());
}
/** Original immutable include/exclude filter; no corrected prefix or set-element matching policy is added. */
export class Partial {
  public static readonly CONTAINS_NOT = 0;
  public static readonly CONTAINS_SUBNODES = 1;
  public static readonly CONTAINS_NODE = 2;
  private readonly root_ = new PartialNode();
  /** Builds the source tree in include-then-exclude order. @param includedPaths - Native sequence values. @param excludedPaths - Native sequence values. @returns Filter. */
  constructor(
    includedPaths: readonly OUStringConstReference[],
    excludedPaths: readonly OUStringConstReference[],
  ) {
    for (const path of includedPaths) {
      const index: [number] = [0];
      for (let node = this.root_; ;) {
        const segment = new OUString(),
          end = parseSegment(path, index, segment),
          key = text(segment);
        if (!segment.isEmpty()) {
          let child = node.children.get(key);
          if (child === undefined) {
            child = new PartialNode();
            node.children.set(key, child);
          }
          node = child;
        }
        if (node.startInclude) break;
        if (end) {
          node.children.clear();
          node.startInclude = true;
          break;
        }
      }
    }
    for (const path of excludedPaths) {
      const index: [number] = [0];
      for (let node = this.root_; ;) {
        const segment = new OUString(),
          end = parseSegment(path, index, segment),
          key = text(segment);
        if (end) {
          let child = node.children.get(key);
          if (child === undefined) {
            child = new PartialNode();
            node.children.set(key, child);
          }
          child.clear();
          break;
        }
        const child = node.children.get(key);
        if (child === undefined) break;
        node = child;
      }
    }
  }
  /** Original containment accumulator starts false, including for an included root. Source TODO warns that canonical set segments can mismatch caller paths. @param path - Initialized node path. @returns Original containment identity. */
  public contains(path: readonly OUStringConstReference[]): number {
    let node = this.root_,
      includes = false;
    for (const segment of path) {
      const child = node.children.get(text(segment));
      if (child === undefined)
        return node.startInclude ? Partial.CONTAINS_NODE : Partial.CONTAINS_NOT;
      node = child;
      includes ||= node.startInclude;
    }
    return node.children.size === 0 && !node.startInclude
      ? Partial.CONTAINS_NOT
      : includes
        ? Partial.CONTAINS_NODE
        : Partial.CONTAINS_SUBNODES;
  }
}
