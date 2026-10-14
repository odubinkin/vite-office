/** @fileoverview Original configmgr Data storage, path grammar/resolution and extension additions; native JS UTF16 strings replace local view/buffer syntax without a new library. */
import { OUString } from "../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { SAL_MAX_INT32 } from "../../sal/inc/types";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { SortedVector } from "../../o3tl/inc/sorted_vector";
import { Node } from "./node";
import { NodeMap } from "./nodemap";
import { RootNode } from "./rootnode";
import { Modifications } from "./modifications";
import { LengthContentsCompare } from "./config_map";
import type { ConfigEntry, config_map } from "./config_map";
import type { Additions } from "./additions";
import type { SetNode } from "./setnode";

/** Erases local std::u16string_view syntax without code-point normalization or a spread argument limit. @param value - Actual UTF16 value. @returns Exact native JS UTF16 string. */
function text(value: OUStringConstReference): string {
  let result = "";
  const units = value.getStr();
  for (let i = 0; i < value.getLength(); i++) result += String.fromCharCode(units[i] as number);
  return result;
}
/** Materializes original OUStringBuffer output in the existing real string owner. @param value - Exact UTF16 temporary. @returns Actual value. */
function string(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Original actual UNO exception construction after local concatenation syntax erasure. @param message - Original exact message. @returns Actual exception. */
function error(message: string): RuntimeException {
  return new RuntimeException(string(message), new Reference());
}
/** Original private three-entity decoder; output assignment occurs only on success. @param encoded - Original full view. @param begin - First unit. @param end - End unit. @param decoded - Actual output owner. @returns Original success. */
function decode(encoded: string, begin: number, end: number, decoded: OUString): boolean {
  let buffer = "";
  while (begin !== end) {
    const character = encoded.charAt(begin++);
    if (character === "&") {
      if (encoded.startsWith("amp;", begin)) {
        buffer += "&";
        begin += 4;
      } else if (encoded.startsWith("quot;", begin)) {
        buffer += '"';
        begin += 5;
      } else if (encoded.startsWith("apos;", begin)) {
        buffer += "'";
        begin += 5;
      } else return false;
    } else buffer += character;
  }
  decoded.assign(string(buffer));
  return true;
}
/** Original ExtensionXcu logical record; no SimpleReferenceObject/refcount lifetime machinery. */
export class DataExtensionXcu {
  declare private layer_: number;
  public additions: Additions = [];
  /** Original initialized signed32 field query; reading before initialization remains outside native valid domain. @returns Layer. */
  public get layer(): number {
    return this.layer_;
  }
  /** Original int field assignment narrowed at its public boundary. @param value - Source scalar. @returns Nothing. */
  public set layer(value: number) {
    this.layer_ = value | 0;
  }
}
/** Binds original config_map key comparison for extension records. @param left - Actual entry. @param right - Actual entry. @returns Native key order. */
function compareExtensions(
  left: ConfigEntry<DataExtensionXcu | null>,
  right: ConfigEntry<DataExtensionXcu | null>,
): boolean {
  return LengthContentsCompare(left.first, right.first);
}
/** Original shared Data owns actual root/templates/modifications and extension path lists. */
export class Data {
  public static readonly NO_LAYER = SAL_MAX_INT32;
  public static readonly ExtensionXcu = DataExtensionXcu;
  public readonly templates = new NodeMap();
  public readonly modifications = new Modifications();
  private readonly root_ = new RootNode();
  private readonly extensionXcuAdditions_: config_map<DataExtensionXcu | null> = new SortedVector(
    compareExtensions,
  );
  /** Original escaping only applies to the element name when a template is present. @param templateName - Original UTF16 view. @param name - Actual name. @returns Segment value. */
  public static createSegment(
    templateName: OUStringConstReference,
    name: OUStringConstReference,
  ): OUString {
    if (templateName.isEmpty()) return new OUString(name);
    let buffer = text(templateName) + "['";
    const units = name.getStr();
    for (let i = 0; i < name.getLength(); i++) {
      const character = String.fromCharCode(units[i] as number);
      switch (character) {
        case "&":
          buffer += "&amp;";
          break;
        case '"':
          buffer += "&quot;";
          break;
        case "'":
          buffer += "&apos;";
          break;
        default:
          buffer += character;
          break;
      }
    }
    return string(buffer + "']");
  }
  /** Original parser preserves partial bool/template outputs on failure and leaves simple-segment template output unchanged. @param path - Actual path. @param index - Signed32 start. @param name - Actual name output. @param setElement - Bool output address. @param templateName - Optional actual template output. @returns End index or minus one. */
  public static parseSegment(
    path: OUStringConstReference,
    index: number,
    name: OUString,
    setElement: [boolean],
    templateName: OUString | null,
  ): number {
    index |= 0;
    const encoded = text(path);
    let i = index;
    while (i < encoded.length && encoded.charAt(i) !== "/" && encoded.charAt(i) !== "[") ++i;
    if (i === encoded.length || encoded.charAt(i) === "/") {
      name.assign(path.copy(index, i - index));
      setElement[0] = false;
      return i;
    }
    if (i - index === 1 && encoded.charAt(index) === "*") {
      setElement[0] = true;
      if (templateName !== null) templateName.clear();
    } else {
      setElement[0] = i !== index;
      if (templateName !== null) templateName.assign(path.copy(index, i - index));
    }
    if (++i === encoded.length) return -1;
    const delimiter = encoded.charAt(i++);
    if (delimiter !== "'" && delimiter !== '"') return -1;
    const j = encoded.indexOf(delimiter, i);
    if (
      j === -1 ||
      j + 1 === encoded.length ||
      encoded.charAt(j + 1) !== "]" ||
      !decode(encoded, i, j, name)
    )
      return -1;
    return j + 2;
  }
  /** Original full-template construction rejects colons in either component. @param component - Original view. @param name - Original view. @returns Full name. */
  public static fullTemplateName(
    component: OUStringConstReference,
    name: OUStringConstReference,
  ): OUString {
    const c = text(component),
      n = text(name);
    if (c.includes(":") || n.includes(":"))
      throw error("bad component/name pair containing colon " + c + "/" + n);
    return string(c + ":" + n);
  }
  /** Original short/full comparison; a colon in longName is a native debug precondition for short names. @param shortName - Actual input. @param longName - Actual full input. @returns Original equality. */
  public static equalTemplateNames(
    shortName: OUStringConstReference,
    longName: OUStringConstReference,
  ): boolean {
    const short = text(shortName),
      long = text(longName);
    return short.indexOf(":") === -1 ? short === long.slice(long.indexOf(":") + 1) : short === long;
  }
  /** Original absolute-path lookup, optional outputs, canonicalization and finalized minimum. Missing nodes return before validating their suffix. @param representation - Actual input. @param canonicRepresentation - Optional actual output owner. @param path - Optional path vector. @param finalizedLayer - Optional signed32 output address. @returns Actual node or null. */
  public resolvePathRepresentation(
    representation: OUStringConstReference,
    canonicRepresentation: OUString | null,
    path: OUString[] | null,
    finalizedLayer: [number] | null,
  ): Node | null {
    const encoded = text(representation);
    if (encoded.length === 0 || encoded.charAt(0) !== "/") throw error("bad path " + encoded);
    if (path !== null) path.length = 0;
    if (encoded === "/") {
      if (canonicRepresentation !== null) canonicRepresentation.assign(representation);
      if (finalizedLayer !== null) finalizedLayer[0] = Data.NO_LAYER;
      return this.root_;
    }
    const segment = new OUString(),
      templateName = new OUString();
    const setElement: [boolean] = [false];
    let n = Data.parseSegment(representation, 1, segment, setElement, null);
    if (n === -1 || setElement[0]) throw error("bad path " + encoded);
    const entry = this.getComponents().find(segment);
    let node = entry === undefined ? null : entry.second;
    let canonic = "";
    let finalized = Data.NO_LAYER;
    while (true) {
      if (node === null) return null;
      if (canonicRepresentation !== null)
        canonic += "/" + text(Data.createSegment(templateName, segment));
      if (path !== null) path.push(new OUString(segment));
      finalized = Math.min(finalized, node.getFinalized());
      if (n !== encoded.length && encoded.charAt(n++) !== "/") throw error("bad path " + encoded);
      if (n === encoded.length) {
        if (canonicRepresentation !== null) canonicRepresentation.assign(string(canonic));
        if (finalizedLayer !== null) finalizedLayer[0] = finalized;
        return node;
      }
      const parent = node;
      templateName.clear();
      n = Data.parseSegment(representation, n, segment, setElement, templateName);
      if (n === -1) throw error("bad path " + encoded);
      node = node.getMember(segment);
      if (setElement[0]) {
        switch (parent.kind()) {
          case Node.KIND_LOCALIZED_PROPERTY:
            if (!templateName.isEmpty()) throw error("bad path " + encoded);
            break;
          case Node.KIND_SET:
            if (!templateName.isEmpty() && !(parent as SetNode).isValidTemplate(templateName))
              throw error("bad path " + encoded);
            break;
          default:
            throw error("bad path " + encoded);
        }
        if (!templateName.isEmpty() && node !== null) {
          if (!Data.equalTemplateNames(templateName, node.getTemplateName()))
            throw error("bad path " + encoded);
        }
      }
    }
  }
  /** Original layer-filtered template lookup. @param layer - Signed32 visibility. @param fullName - Actual full key. @returns Actual template or null. */
  public getTemplate(layer: number, fullName: OUStringConstReference): Node | null {
    return this.templates.findNode(layer, fullName);
  }
  /** Original live root component map. @returns Stable actual map. */
  public getComponents(): NodeMap {
    return this.root_.getMembers();
  }
  /** Original extension registration returns a stable live additions vector and rejects duplicates. @param url - Actual key. @param layer - Signed32 metadata. @returns Actual additions vector. */
  public addExtensionXcuAdditions(url: OUStringConstReference, layer: number): Additions {
    const item = new DataExtensionXcu();
    const [index] = this.extensionXcuAdditions_.insert({ first: new OUString(url), second: null });
    const entry = this.extensionXcuAdditions_.at(index) as ConfigEntry<DataExtensionXcu | null>;
    if (entry.second !== null) throw error("already added extension xcu " + text(url));
    entry.second = item;
    item.layer = layer;
    return item.additions;
  }
  /** Original unknown extension returns null; native SAL diagnostic dispatch is not represented. @param url - Actual key. @returns Removed actual record or null. */
  public removeExtensionXcuAdditions(url: OUStringConstReference): DataExtensionXcu | null {
    const index = this.extensionXcuAdditions_.find({ first: url, second: null });
    if (index === -1) return null;
    const item = (this.extensionXcuAdditions_.at(index) as ConfigEntry<DataExtensionXcu | null>)
      .second;
    this.extensionXcuAdditions_.erase_at(index);
    return item;
  }
}
