/** @fileoverview Original XCS schema/templates, property values, descriptions and conservative merge over actual configmgr nodes and event/value parsers. */
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../sal/inc/rtl/ustrbuf";
import { trim } from "../../o3tl/inc/string_view";
import { XmlReader, Text } from "../../xmlreader/inc/xmlreader";
import { Span, type ByteView } from "../../xmlreader/inc/span";
import { Parser } from "./parser";
import { ValueParser } from "./valueparser";
import { NAMESPACE_OOR } from "./parsemanager";
import { Type } from "./type";
import { Data } from "./data";
import { Node } from "./node";
import { GroupNode } from "./groupnode";
import { SetNode } from "./setnode";
import { PropertyNode } from "./propertynode";
import { LocalizedPropertyNode } from "./localizedpropertynode";
import * as xmldata from "./xmldata";
/** Erases local UTF16 value/literal construction. @param value - Exact text. @returns Native owner. */
function unicode(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Erases local native string concatenation without normalization. @param value - Native value. @returns Exact UTF16 text. */
function text(value: OUStringConstReference): string {
  let out = "";
  for (let i = 0; i < value.getLength(); i++)
    out += String.fromCharCode(value.getStr()[i] as number);
  return out;
}
/** Original RuntimeException construction. @param message - Native diagnostic text. @returns Actual exception. */
function error(message: string): RuntimeException {
  return new RuntimeException(unicode(message), new Reference());
}
/** Original ASCII literal comparison against a borrowed span. @param value - Native span. @param literal - Source literal. @returns Exact byte equality. */
function equals(value: Span, literal: string): boolean {
  const bytes = new TextEncoder().encode(literal);
  return value.equals(bytes, bytes.length);
}
/** Original anonymous-namespace conservative merge kernel. Export binds this source responsibility for initialized kernel tests, not a new UNO service API. @param original - Actual existing node. @param update - Actual same-kind unfinalized update. @returns Nothing. */
export function merge(original: Node, update: Node): void {
  if (
    original === null ||
    update === null ||
    original.kind() !== update.kind() ||
    update.getFinalized() !== Data.NO_LAYER
  )
    throw new Error("assert(original/update merge invariants)");
  if (update.getLayer() < original.getLayer() || update.getLayer() > original.getFinalized())
    return;
  switch (original.kind()) {
    case Node.KIND_PROPERTY:
    case Node.KIND_LOCALIZED_PROPERTY:
    case Node.KIND_LOCALIZED_VALUE:
      break;
    case Node.KIND_GROUP:
      for (const member of update.getMembers()) {
        const members = original.getMembers(),
          found = members.find(member.first),
          child = member.second as Node;
        if (found === undefined) {
          if (child.kind() === Node.KIND_PROPERTY && (original as GroupNode).isExtensible())
            members.insert(member);
        } else if (child.kind() === (found.second as Node).kind())
          merge(found.second as Node, child);
      }
      break;
    case Node.KIND_SET:
      for (const member of update.getMembers()) {
        const members = original.getMembers(),
          found = members.find(member.first),
          child = member.second as Node;
        if (found === undefined) {
          if ((original as SetNode).isValidTemplate(child.getTemplateName()))
            members.insert(member);
        } else if (
          child.kind() === (found.second as Node).kind() &&
          child.getTemplateName().equals((found.second as Node).getTemplateName())
        )
          merge(found.second as Node, child);
      }
      break;
    case Node.KIND_ROOT:
      throw new Error("assert(false)");
  }
}
/** Original parser states in declaration order. */
enum State {
  START,
  COMPONENT_SCHEMA,
  TEMPLATES,
  TEMPLATES_DONE,
  COMPONENT,
  COMPONENT_DONE,
}
/** Original stack element; ordinary references replace rtl::Reference lifetime. */
interface Element {
  node: Node | null;
  name: OUString;
}
/** Actual complete XCS event owner; OS/UNO service management stays outside this parser. */
export class XcsParser extends Parser {
  private readonly valueParser_: ValueParser;
  private readonly data_: Data;
  private readonly componentName_ = new OUString();
  private state_ = State.START;
  private ignoring_ = 0;
  private readonly elements_: Element[] = [];
  private bIsParsingInfo_ = false;
  private readonly description_ = new OUStringBuffer();
  /** Original layer and actual shared Data ownership. @param layer - Native layer. @param data - Actual shared tree. @returns Parser. */
  constructor(layer: number, data: Data) {
    super();
    this.valueParser_ = new ValueParser(layer);
    this.data_ = data;
  }
  /** Original info text overrides the value parser's mode. @returns Native reporting mode. */
  public override getTextMode(): Text {
    return this.bIsParsingInfo_ ? Text.Raw : this.valueParser_.getTextMode();
  }
  /** Original start transitions, including ignored tags at illegal locations and active value-parser delegation. @param reader - Actual reader. @param nsId - Namespace id. @param name - Borrowed element name. @param existingDependencies - Original ignored dependency pointer. @returns Whether consumed. */
  public override startElement(
    reader: XmlReader,
    nsId: number,
    name: Span,
    existingDependencies: ReadonlySet<OUStringConstReference> | null,
  ): boolean {
    void existingDependencies;
    const plain = nsId === XmlReader.NAMESPACE_NONE;
    if (
      this.ignoring_ > 0 ||
      (plain &&
        ["import", "uses", "constraints", "desc", "deprecated", "author", "label"].some(
          /** Compares one original ignored tag. @param tag - Literal. @returns Match. */ (tag) =>
            equals(name, tag),
        ))
    ) {
      this.ignoring_++;
      return true;
    }
    if (this.bIsParsingInfo_) return true;
    if (this.valueParser_.startElement(reader, nsId, name)) return true;
    if (this.state_ === State.START) {
      if (nsId === NAMESPACE_OOR && equals(name, "component-schema")) {
        this.handleComponentSchema(reader);
        this.state_ = State.COMPONENT_SCHEMA;
        this.ignoring_ = 0;
        return true;
      }
    } else {
      if (this.state_ === State.COMPONENT_SCHEMA) {
        if (plain && equals(name, "templates")) {
          this.state_ = State.TEMPLATES;
          return true;
        }
        if (plain && equals(name, "info")) {
          this.bIsParsingInfo_ = true;
          return true;
        }
      }
      if (this.state_ === State.COMPONENT_SCHEMA || this.state_ === State.TEMPLATES_DONE) {
        if (plain && equals(name, "component")) {
          this.state_ = State.COMPONENT;
          if (this.elements_.length !== 0) throw new Error("assert(elements_.empty())");
          this.elements_.push({
            node: new GroupNode(this.valueParser_.getLayer(), false, new OUString()),
            name: new OUString(this.componentName_),
          });
          return true;
        }
      }
      if (this.state_ === State.TEMPLATES) {
        if (plain && equals(name, "info")) {
          this.bIsParsingInfo_ = true;
          return true;
        }
        if (this.elements_.length === 0) {
          if (plain && equals(name, "group")) {
            this.handleGroup(reader, true);
            return true;
          }
          if (plain && equals(name, "set")) {
            this.handleSet(reader, true);
            return true;
          }
        } else if (this.startMember(reader, nsId, name)) return true;
      } else if (this.state_ === State.COMPONENT && this.startMember(reader, nsId, name))
        return true;
    }
    const converted = name.convertFromUtf8();
    try {
      throw error("bad member <" + text(converted) + "> in " + text(reader.getUrl()));
    } finally {
      converted.dispose();
    }
  }
  /** Erases the original STATE_TEMPLATES to STATE_COMPONENT fallthrough without a second owner or parser state. @param reader - Actual reader. @param nsId - Namespace. @param name - Element. @returns Whether a source member branch matched. */
  private startMember(reader: XmlReader, nsId: number, name: Span): boolean {
    const top = this.elements_[this.elements_.length - 1] as Element,
      node = top.node as Node;
    if (nsId !== XmlReader.NAMESPACE_NONE) return false;
    if (equals(name, "info")) {
      this.bIsParsingInfo_ = true;
      return true;
    }
    switch (node.kind()) {
      case Node.KIND_PROPERTY:
      case Node.KIND_LOCALIZED_PROPERTY:
        if (equals(name, "value")) {
          this.handlePropValue(reader, node);
          return true;
        }
        break;
      case Node.KIND_GROUP:
        if (equals(name, "prop")) {
          this.handleProp(reader);
          return true;
        }
        if (equals(name, "node-ref")) {
          this.handleNodeRef(reader);
          return true;
        }
        if (equals(name, "group")) {
          this.handleGroup(reader, false);
          return true;
        }
        if (equals(name, "set")) {
          this.handleSet(reader, false);
          return true;
        }
        break;
      case Node.KIND_SET:
        if (equals(name, "item")) {
          this.handleSetItem(reader, node as SetNode);
          return true;
        }
        break;
      default:
        throw new Error("assert(false)");
    }
    return false;
  }
  /** Original end transitions insert completed nodes immediately, retaining partial tree state on later errors. @param reader - Actual reader for diagnostics. @returns Nothing. */
  public override endElement(reader: XmlReader): void {
    if (this.ignoring_ > 0) {
      this.ignoring_--;
      return;
    }
    if (this.bIsParsingInfo_) {
      this.bIsParsingInfo_ = false;
      return;
    }
    if (this.valueParser_.endElement()) return;
    if (this.elements_.length !== 0) {
      const top = this.elements_.pop() as Element;
      if (top.node !== null) {
        if (
          top.node.kind() === Node.KIND_PROPERTY ||
          top.node.kind() === Node.KIND_LOCALIZED_PROPERTY
        ) {
          const full = this.description_.makeStringAndClear();
          try {
            const view = trim(full.getStr().subarray(0, full.getLength()));
            const trimmed = new OUString(view, view.length);
            let desc = text(trimmed);
            trimmed.dispose();
            while (desc.includes("  ")) desc = desc.replaceAll("  ", " ");
            const value = unicode(desc);
            try {
              top.node.setDescription(value);
            } finally {
              value.dispose();
            }
          } finally {
            full.dispose();
          }
        }
        if (this.elements_.length === 0) {
          let entry;
          switch (this.state_) {
            case State.TEMPLATES:
              entry = this.data_.templates.insert({ first: top.name, second: top.node });
              break;
            case State.COMPONENT:
              entry = this.data_.getComponents().insert({ first: top.name, second: top.node });
              break;
            default:
              throw error("this cannot happen");
          }
          if (!entry[1]) merge(entry[0].second as Node, top.node);
          if (this.state_ === State.COMPONENT) this.state_ = State.COMPONENT_DONE;
        } else {
          const parent = (this.elements_[this.elements_.length - 1] as Element).node as Node;
          if (!parent.getMembers().insert({ first: top.name, second: top.node })[1])
            throw error("duplicate " + text(top.name) + " in " + text(reader.getUrl()));
        }
      }
    } else
      switch (this.state_) {
        case State.COMPONENT_SCHEMA:
          this.state_ = State.COMPONENT_DONE;
          break;
        case State.TEMPLATES:
          this.state_ = State.TEMPLATES_DONE;
          break;
        case State.TEMPLATES_DONE:
          throw error("no component element in " + text(reader.getUrl()));
        case State.COMPONENT_DONE:
          break;
        default:
          throw new Error("assert(false)");
      }
  }
  /** Original characters do not consult ignoring_; info text is accumulated across nested desc tags. @param value - Borrowed bytes. @returns Nothing. */
  public override characters(value: Span): void {
    if (this.bIsParsingInfo_) {
      const converted = value.convertFromUtf8();
      try {
        this.description_.append(converted);
      } finally {
        converted.dispose();
      }
      return;
    }
    this.valueParser_.characters(value);
  }
  /** Erases repeated native attribute iterator syntax; values are read from the same current reader attribute inside the callback. @param reader - Actual reader. @param consume - Original branch body. @returns Nothing. */
  private attributes(reader: XmlReader, consume: (nsId: number, name: Span) => void): void {
    const ns: [number] = [0],
      name = new Span();
    while (reader.nextAttribute(ns, name)) consume(ns[0], name);
  }
  /** Original component name assembly requires exactly one package/name and decodes the combined bytes only after both are present. @param reader - Actual reader. @returns Nothing. */
  private handleComponentSchema(reader: XmlReader): void {
    let hasPackage = false,
      hasName = false;
    let bytes: number[] = [46];
    this.attributes(
      reader,
      /** Original component attribute branches. @param ns - Namespace. @param name - Local name. @returns Nothing. */ (
        ns,
        name,
      ) => {
        if (ns === NAMESPACE_OOR && equals(name, "package")) {
          if (hasPackage)
            throw error("multiple component-schema package attributes in " + text(reader.getUrl()));
          hasPackage = true;
          const value = reader.getAttributeValue(false),
            prefix: number[] = [];
          for (let i = 0; i < value.length; i++)
            prefix.push((value.begin as ByteView)[i] as number);
          bytes = prefix.concat(bytes);
        } else if (ns === NAMESPACE_OOR && equals(name, "name")) {
          if (hasName)
            throw error("multiple component-schema name attributes in " + text(reader.getUrl()));
          hasName = true;
          const value = reader.getAttributeValue(false);
          for (let i = 0; i < value.length; i++) bytes.push((value.begin as ByteView)[i] as number);
        }
      },
    );
    if (!hasPackage)
      throw error("no component-schema package attribute in " + text(reader.getUrl()));
    if (!hasName) throw error("no component-schema name attribute in " + text(reader.getUrl()));
    const converted = new Span(bytes, bytes.length).convertFromUtf8();
    try {
      this.componentName_.assign(converted);
    } finally {
      converted.dispose();
    }
  }
  /** Original node reference clones a visible existing template and applies the current source layer. @param reader - Actual reader. @returns Nothing. */
  private handleNodeRef(reader: XmlReader): void {
    let hasName = false,
      hasNodeType = false;
    const name = new OUString(),
      component = new OUString(this.componentName_),
      nodeType = new OUString();
    this.attributes(
      reader,
      /** Original reference attribute branches. @param ns - Namespace. @param attr - Name. @returns Nothing. */ (
        ns,
        attr,
      ) => {
        if (ns === NAMESPACE_OOR) {
          if (equals(attr, "name")) {
            hasName = true;
            name.assign(reader.getAttributeValue(false).convertFromUtf8());
          } else if (equals(attr, "component"))
            component.assign(reader.getAttributeValue(false).convertFromUtf8());
          else if (equals(attr, "node-type")) {
            hasNodeType = true;
            nodeType.assign(reader.getAttributeValue(false).convertFromUtf8());
          }
        }
      },
    );
    if (!hasName) throw error("no node-ref name attribute in " + text(reader.getUrl()));
    const tmpl = this.data_.getTemplate(
      this.valueParser_.getLayer(),
      xmldata.parseTemplateReference(component, hasNodeType, nodeType, null),
    );
    if (tmpl === null)
      throw error("unknown node-ref " + text(name) + " in " + text(reader.getUrl()));
    const node = tmpl.clone(false) as Node;
    node.setLayer(this.valueParser_.getLayer());
    this.elements_.push({ node, name });
  }
  /** Original property metadata defaults nillable=true/localized=false, with mandatory name/type. @param reader - Actual reader. @returns Nothing. */
  private handleProp(reader: XmlReader): void {
    let hasName = false,
      localized = false,
      nillable = true;
    const name = new OUString();
    this.valueParser_.type_ = Type.TYPE_ERROR;
    this.attributes(
      reader,
      /** Original property attribute branches. @param ns - Namespace. @param attr - Name. @returns Nothing. */ (
        ns,
        attr,
      ) => {
        if (ns === NAMESPACE_OOR) {
          if (equals(attr, "name")) {
            hasName = true;
            name.assign(reader.getAttributeValue(false).convertFromUtf8());
          } else if (equals(attr, "type"))
            this.valueParser_.type_ = xmldata.parseType(reader, reader.getAttributeValue(true));
          else if (equals(attr, "localized"))
            localized = xmldata.parseBoolean(reader.getAttributeValue(true));
          else if (equals(attr, "nillable"))
            nillable = xmldata.parseBoolean(reader.getAttributeValue(true));
        }
      },
    );
    if (!hasName) throw error("no prop name attribute in " + text(reader.getUrl()));
    if (this.valueParser_.type_ === Type.TYPE_ERROR)
      throw error("no prop type attribute in " + text(reader.getUrl()));
    this.elements_.push({
      node: localized
        ? new LocalizedPropertyNode(this.valueParser_.getLayer(), this.valueParser_.type_, nillable)
        : new PropertyNode(
            this.valueParser_.getLayer(),
            this.valueParser_.type_,
            nillable,
            new Any(),
            false,
          ),
      name,
    });
  }
  /** Original value separator is optional but cannot be explicitly empty; value parser owns decoding and target mutation. @param reader - Actual reader. @param property - Actual target. @returns Nothing. */
  private handlePropValue(reader: XmlReader, property: Node): void {
    let separator = new Uint8Array();
    this.attributes(
      reader,
      /** Original separator branch. @param ns - Namespace. @param attr - Name. @returns Nothing. */ (
        ns,
        attr,
      ) => {
        if (ns === NAMESPACE_OOR && equals(attr, "separator")) {
          const value = reader.getAttributeValue(false);
          if (value.length === 0)
            throw error("bad oor:separator attribute in " + text(reader.getUrl()));
          separator = new Uint8Array(value.length);
          for (let i = 0; i < value.length; i++)
            separator[i] = (value.begin as ByteView)[i] as number;
        }
      },
    );
    this.valueParser_.separator_ = separator;
    this.valueParser_.start(property);
  }
  /** Original group/template constructor and extensibility flag. @param reader - Actual reader. @param isTemplate - Original template scope. @returns Nothing. */
  private handleGroup(reader: XmlReader, isTemplate: boolean): void {
    let hasName = false,
      extensible = false;
    let name = new OUString();
    this.attributes(
      reader,
      /** Original group branches. @param ns - Namespace. @param attr - Name. @returns Nothing. */ (
        ns,
        attr,
      ) => {
        if (ns === NAMESPACE_OOR) {
          if (equals(attr, "name")) {
            hasName = true;
            name.assign(reader.getAttributeValue(false).convertFromUtf8());
          } else if (equals(attr, "extensible"))
            extensible = xmldata.parseBoolean(reader.getAttributeValue(true));
        }
      },
    );
    if (!hasName) throw error("no group name attribute in " + text(reader.getUrl()));
    if (isTemplate) name = Data.fullTemplateName(this.componentName_, name);
    this.elements_.push({
      node: new GroupNode(
        this.valueParser_.getLayer(),
        extensible,
        isTemplate ? name : new OUString(),
      ),
      name,
    });
  }
  /** Original set/template metadata; item children only add allowed template names. @param reader - Actual reader. @param isTemplate - Original template scope. @returns Nothing. */
  private handleSet(reader: XmlReader, isTemplate: boolean): void {
    let hasName = false,
      hasNodeType = false;
    let name = new OUString();
    const component = new OUString(this.componentName_),
      nodeType = new OUString();
    this.attributes(
      reader,
      /** Original set branches. @param ns - Namespace. @param attr - Name. @returns Nothing. */ (
        ns,
        attr,
      ) => {
        if (ns === NAMESPACE_OOR) {
          if (equals(attr, "name")) {
            hasName = true;
            name.assign(reader.getAttributeValue(false).convertFromUtf8());
          } else if (equals(attr, "component"))
            component.assign(reader.getAttributeValue(false).convertFromUtf8());
          else if (equals(attr, "node-type")) {
            hasNodeType = true;
            nodeType.assign(reader.getAttributeValue(false).convertFromUtf8());
          }
        }
      },
    );
    if (!hasName) throw error("no set name attribute in " + text(reader.getUrl()));
    if (isTemplate) name = Data.fullTemplateName(this.componentName_, name);
    this.elements_.push({
      node: new SetNode(
        this.valueParser_.getLayer(),
        xmldata.parseTemplateReference(component, hasNodeType, nodeType, null),
        isTemplate ? name : new OUString(),
      ),
      name,
    });
  }
  /** Original additional allowed template insertion and null stack marker. @param reader - Actual reader. @param set - Actual source set. @returns Nothing. */
  private handleSetItem(reader: XmlReader, set: SetNode): void {
    let hasNodeType = false;
    const component = new OUString(this.componentName_),
      nodeType = new OUString();
    this.attributes(
      reader,
      /** Original item branches. @param ns - Namespace. @param attr - Name. @returns Nothing. */ (
        ns,
        attr,
      ) => {
        if (ns === NAMESPACE_OOR) {
          if (equals(attr, "component"))
            component.assign(reader.getAttributeValue(false).convertFromUtf8());
          else if (equals(attr, "node-type")) {
            hasNodeType = true;
            nodeType.assign(reader.getAttributeValue(false).convertFromUtf8());
          }
        }
      },
    );
    set
      .getAdditionalTemplateNames()
      .push(xmldata.parseTemplateReference(component, hasNodeType, nodeType, null));
    this.elements_.push({ node: null, name: new OUString() });
  }
}
