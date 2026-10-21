/** @fileoverview Original XCU component/items update state machine over actual Parser/ValueParser/Data/Node owners; no configuration provider, external resolver or diagnostic service substitute. */
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { assert } from "../../sal/inc/cassert";
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { XmlReader, type Text } from "../../xmlreader/inc/xmlreader";
import { Span, type ByteView } from "../../xmlreader/inc/span";
import { Parser } from "./parser";
import { ValueParser } from "./valueparser";
import { NAMESPACE_OOR, NAMESPACE_XSI } from "./parsemanager";
import { Type } from "./type";
import { Data } from "./data";
import { Node } from "./node";
import { GroupNode } from "./groupnode";
import { SetNode } from "./setnode";
import { PropertyNode } from "./propertynode";
import { LocalizedPropertyNode } from "./localizedpropertynode";
import { LocalizedValueNode } from "./localizedvaluenode";
import { Partial } from "./partial";
import type { Modifications } from "./modifications";
import type { Additions } from "./additions";
import type { ConfigEntry } from "./config_map";
import * as xmldata from "./xmldata";
/** Erases native UTF16 concatenation. @param value - Original view. @returns Exact text. */
function text(value: OUStringConstReference): string {
  let out = "";
  for (let i = 0; i < value.getLength(); i++)
    out += String.fromCharCode(value.getStr()[i] as number);
  return out;
}
/** Constructs original diagnostic values. @param value - Exact text. @returns Actual string. */
function unicode(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Original exception construction. @param message - Original diagnostic. @returns Exception. */
function error(message: string): RuntimeException {
  return new RuntimeException(unicode(message), new Reference());
}
/** Copies OString byte data without decoding or normalization. @param value - Borrowed span. @returns Exact owned bytes. */
function bytes(value: Span): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i++) out[i] = (value.begin as ByteView)[i] as number;
  return out;
}
/** Original span/literal equality. @param value - Borrowed name. @param literal - Native ASCII literal. @returns Exact equality. */
function equals(value: Span, literal: string): boolean {
  const data = new TextEncoder().encode(literal);
  return value.equals(data, data.length);
}
/** Original operation identities in declaration order. */
enum Operation {
  MODIFY,
  REPLACE,
  FUSE,
  REMOVE,
}
/** Actual native state record and constructor variants; ordinary references erase rtl::Reference syntax. */
class State {
  /** Erases the original three State constructor overloads into their initialized fields. @param node - Actual node. @param name - Owned name. @param ignore - Ignore flag. @param insert - Delayed insertion. @param pop - Path ownership. @returns State. */
  private constructor(
    public readonly node: Node | null,
    public readonly name: OUString,
    public readonly ignore: boolean,
    public readonly insert: boolean,
    public readonly pop: boolean,
  ) {}
  /** Original ignored element. @param pop - Whether its path entry is owned. @returns State. */
  public static Ignore(pop: boolean): State {
    return new State(null, new OUString(), true, false, pop);
  }
  /** Original modify or items root. @param node - Actual node or null. @returns State. */
  public static Modify(node: Node | null): State {
    return new State(node, new OUString(), false, false, true);
  }
  /** Original delayed insertion. @param node - Actual child. @param name - Copied key. @returns State. */
  public static Insert(node: Node, name: OUStringConstReference): State {
    return new State(node, new OUString(name), false, true, true);
  }
}
/** Complete original XCU update event owner; loaded bytes and real Data are supplied by its native parser caller. */
export class XcuParser extends Parser {
  private readonly valueParser_: ValueParser;
  private readonly recordModifications_: boolean;
  private readonly trackPath_: boolean;
  private readonly componentName_ = new OUString();
  private readonly state_: State[] = [];
  private readonly path_: OUString[] = [];
  /** Original constructor and path-tracking predicate. @param layer - Native layer. @param data_ - Actual configuration tree. @param partial_ - Optional native filter. @param broadcastModifications_ - Optional actual changes owner. @param additions_ - Optional actual additions vector. @returns Parser. */
  constructor(
    layer: number,
    private readonly data_: Data,
    private readonly partial_: Partial | null,
    private readonly broadcastModifications_: Modifications | null,
    private readonly additions_: Additions | null,
  ) {
    super();
    this.valueParser_ = new ValueParser(layer);
    this.recordModifications_ = layer === Data.NO_LAYER;
    this.trackPath_ =
      partial_ !== null ||
      broadcastModifications_ !== null ||
      additions_ !== null ||
      this.recordModifications_;
  }
  /** Original delegated text reporting. @returns Text mode. */
  public override getTextMode(): Text {
    return this.valueParser_.getTextMode();
  }
  /** Original start dispatch, including ignore states and value-parser priority. @param reader - Actual reader. @param nsId - Namespace. @param name - Borrowed element name. @param existingDependencies - Ignored native pointer. @returns True after consuming. */
  public override startElement(
    reader: XmlReader,
    nsId: number,
    name: Span,
    existingDependencies: ReadonlySet<OUStringConstReference> | null,
  ): boolean {
    void existingDependencies;
    if (this.valueParser_.startElement(reader, nsId, name)) return true;
    const state = this.state_[this.state_.length - 1],
      plain = nsId === XmlReader.NAMESPACE_NONE;
    if (state === undefined) {
      if (nsId === NAMESPACE_OOR && equals(name, "component-data"))
        this.handleComponentData(reader);
      else if (nsId === NAMESPACE_OOR && equals(name, "items"))
        this.state_.push(State.Modify(null));
      else
        throw error(
          "bad root element <" + text(name.convertFromUtf8()) + "> in " + text(reader.getUrl()),
        );
    } else if (state.ignore) this.state_.push(State.Ignore(false));
    else if (state.node === null) {
      if (!plain || !equals(name, "item"))
        throw error(
          "bad items node member <" +
            text(name.convertFromUtf8()) +
            "> in " +
            text(reader.getUrl()),
        );
      this.handleItem(reader);
    } else
      switch (state.node.kind()) {
        case Node.KIND_PROPERTY:
          if (!plain || !equals(name, "value"))
            throw error(
              "bad property node member <" +
                text(name.convertFromUtf8()) +
                "> in " +
                text(reader.getUrl()),
            );
          this.handlePropValue(reader, state.node as PropertyNode);
          break;
        case Node.KIND_LOCALIZED_PROPERTY:
          if (!plain || !equals(name, "value"))
            throw error(
              "bad localized property node member <" +
                text(name.convertFromUtf8()) +
                "> in " +
                text(reader.getUrl()),
            );
          this.handleLocpropValue(reader, state.node as LocalizedPropertyNode);
          break;
        case Node.KIND_LOCALIZED_VALUE:
          throw error(
            "bad member <" + text(name.convertFromUtf8()) + "> in " + text(reader.getUrl()),
          );
        case Node.KIND_GROUP:
          if (plain && equals(name, "prop")) this.handleGroupProp(reader, state.node as GroupNode);
          else if (plain && equals(name, "node")) this.handleGroupNode(reader, state.node);
          else
            throw error(
              "bad group node member <" +
                text(name.convertFromUtf8()) +
                "> in " +
                text(reader.getUrl()),
            );
          break;
        case Node.KIND_SET:
          if (plain && equals(name, "node")) this.handleSetNode(reader, state.node as SetNode);
          else if (plain && equals(name, "prop")) this.state_.push(State.Ignore(false));
          else
            throw error(
              "bad set node member <" +
                text(name.convertFromUtf8()) +
                "> in " +
                text(reader.getUrl()),
            );
          break;
        case Node.KIND_ROOT:
          assert(false, "false");
      }
    return true;
  }
  /** Original end defers insertions until the child's closing event and pops at most one tracked segment. @param reader - Ignored actual reader. @returns Nothing. */
  public override endElement(reader: XmlReader): void {
    void reader;
    if (this.valueParser_.endElement()) return;
    assert(this.state_.length !== 0, "!state_.empty()");
    const state = this.state_.pop() as State;
    if (state.insert) {
      assert(state.node !== null, "insert.is()");
      const parent = this.state_[this.state_.length - 1];
      assert(
        parent !== undefined && parent.node !== null,
        "!state_.empty() && state_.top().node.is()",
      );
      parent.node.getMembers().getOrInsert(state.name).second = state.node;
    }
    if (state.pop && this.path_.length !== 0) this.path_.pop();
  }
  /** Original character delegation. @param span - Borrowed text. @returns Nothing. */
  public override characters(span: Span): void {
    this.valueParser_.characters(span);
  }
  /** Original operation lexical grammar. @param value - Present span. @returns Operation. */
  private static parseOperation(value: Span): Operation {
    assert(value.is(), "text.is()");
    for (const [name, op] of [
      ["modify", Operation.MODIFY],
      ["replace", Operation.REPLACE],
      ["fuse", Operation.FUSE],
      ["remove", Operation.REMOVE],
    ] as const)
      if (equals(value, name)) return op;
    throw error("invalid op " + text(value.convertFromUtf8()));
  }
  /** Original finalized comparison, excluding the no-layer sentinel. @param layer - Node finalized layer. @returns Whether blocked. */
  private isAlreadyFinalized(layer: number): boolean {
    return layer !== Data.NO_LAYER && layer <= this.valueParser_.getLayer();
  }
  /** Erases repeated original attribute iteration, preserving lazy value decoding in each branch. @param reader - Actual reader. @param consume - Original branch body. @returns Nothing. */
  private attributes(reader: XmlReader, consume: (ns: number, name: Span) => void): void {
    const ns: [number] = [0],
      name = new Span();
    while (reader.nextAttribute(ns, name)) consume(ns[0], name);
  }
  /** Original component root resolution, package/name byte assembly, layer and partial gates. @param reader - Actual reader. @returns Nothing. */
  private handleComponentData(reader: XmlReader): void {
    let hasPackage = false,
      hasName = false,
      op = Operation.MODIFY,
      finalized = false;
    let buffer: number[] = [46];
    this.attributes(
      reader,
      /** Original component attribute branches. @param ns - Namespace. @param name - Local name. @returns Nothing. */ (
        ns,
        name,
      ) => {
        if (ns !== NAMESPACE_OOR) return;
        if (equals(name, "package")) {
          if (hasPackage)
            throw error("multiple component-update package attributes in " + text(reader.getUrl()));
          hasPackage = true;
          buffer = [...bytes(reader.getAttributeValue(false)), ...buffer];
        } else if (equals(name, "name")) {
          if (hasName)
            throw error("multiple component-update name attributes in " + text(reader.getUrl()));
          hasName = true;
          for (const byte of bytes(reader.getAttributeValue(false))) buffer.push(byte);
        } else if (equals(name, "op"))
          op = XcuParser.parseOperation(reader.getAttributeValue(true));
        else if (equals(name, "finalized"))
          finalized = xmldata.parseBoolean(reader.getAttributeValue(true));
      },
    );
    if (!hasPackage) throw error("no component-data package attribute in " + text(reader.getUrl()));
    if (!hasName) throw error("no component-data name attribute in " + text(reader.getUrl()));
    this.componentName_.assign(new Span(buffer, buffer.length).convertFromUtf8());
    if (this.trackPath_) {
      assert(this.path_.length === 0, "path_.empty()");
      this.path_.push(new OUString(this.componentName_));
      if (this.partial_ !== null && this.partial_.contains(this.path_) === Partial.CONTAINS_NOT) {
        this.state_.push(State.Ignore(true));
        return;
      }
    }
    const node = this.data_
      .getComponents()
      .findNode(this.valueParser_.getLayer(), this.componentName_);
    if (node === null) {
      this.state_.push(State.Ignore(true));
      return;
    }
    if (op !== Operation.MODIFY && op !== Operation.FUSE)
      throw error("invalid operation on root node in " + text(reader.getUrl()));
    if (this.isAlreadyFinalized(node.getFinalized())) {
      this.state_.push(State.Ignore(true));
      return;
    }
    if (finalized) node.setFinalized(this.valueParser_.getLayer());
    this.state_.push(State.Modify(node));
  }
  /** Original registry item lookup and optional tracked-path reset. @param reader - Actual reader. @returns Nothing. */
  private handleItem(reader: XmlReader): void {
    let attrPath = new Span();
    this.attributes(
      reader,
      /** Reads original item path. @param ns - Namespace. @param name - Attribute name. @returns Nothing. */ (
        ns,
        name,
      ) => {
        if (ns === NAMESPACE_OOR && equals(name, "path"))
          attrPath = reader.getAttributeValue(false);
      },
    );
    if (!attrPath.is()) throw error("missing path attribute in " + text(reader.getUrl()));
    const path = attrPath.convertFromUtf8(),
      finalized: [number] = [0],
      node = this.data_.resolvePathRepresentation(path, null, this.path_, finalized);
    if (node === null) {
      this.state_.push(State.Ignore(true));
      return;
    }
    assert(this.path_.length !== 0, "!path_.empty()");
    this.componentName_.assign(this.path_[0] as OUString);
    if (this.trackPath_) {
      if (this.partial_ !== null && this.partial_.contains(this.path_) === Partial.CONTAINS_NOT) {
        this.state_.push(State.Ignore(true));
        return;
      }
    } else this.path_.length = 0;
    switch (node.kind()) {
      case Node.KIND_PROPERTY:
      case Node.KIND_LOCALIZED_VALUE:
        this.state_.push(State.Ignore(true));
        return;
      case Node.KIND_LOCALIZED_PROPERTY:
        this.valueParser_.type_ = (node as LocalizedPropertyNode).getStaticType();
        break;
    }
    if (this.isAlreadyFinalized(finalized[0])) {
      this.state_.push(State.Ignore(true));
      return;
    }
    this.state_.push(State.Modify(node));
  }
  /** Original ordinary value attributes and nil/external/parser choices. @param reader - Actual reader. @param prop - Actual property. @returns Nothing. */
  private handlePropValue(reader: XmlReader, prop: PropertyNode): void {
    let nil = false,
      separator = new Uint8Array();
    const external = new OUString();
    this.attributes(
      reader,
      /** Original value attributes. @param ns - Namespace. @param name - Attribute name. @returns Nothing. */ (
        ns,
        name,
      ) => {
        if (ns === NAMESPACE_XSI && equals(name, "nil"))
          nil = xmldata.parseBoolean(reader.getAttributeValue(true));
        else if (ns === NAMESPACE_OOR) {
          if (equals(name, "type")) {
            const type = xmldata.parseType(reader, reader.getAttributeValue(true));
            if (this.valueParser_.type_ !== Type.TYPE_ANY && type !== this.valueParser_.type_)
              throw error("invalid value type in " + text(reader.getUrl()));
            this.valueParser_.type_ = type;
          } else if (equals(name, "separator")) {
            const value = reader.getAttributeValue(false);
            if (value.length === 0)
              throw error("bad oor:separator attribute in " + text(reader.getUrl()));
            separator = bytes(value);
          } else if (equals(name, "external")) {
            external.assign(reader.getAttributeValue(true).convertFromUtf8());
            if (external.isEmpty())
              throw error("bad oor:external attribute value in " + text(reader.getUrl()));
          }
        }
      },
    );
    if (nil) {
      if (!prop.isNillable())
        throw error("xsi:nil attribute for non-nillable prop in " + text(reader.getUrl()));
      if (!external.isEmpty())
        throw error("xsi:nil and oor:external attributes for prop in " + text(reader.getUrl()));
      const value = new Any();
      try {
        prop.setValue(
          this.valueParser_.getLayer(),
          value,
          this.valueParser_.getLayer() === Data.NO_LAYER,
        );
      } finally {
        value.dispose();
      }
      this.state_.push(State.Ignore(false));
    } else if (external.isEmpty()) {
      this.valueParser_.separator_ = separator;
      this.valueParser_.start(prop);
    } else {
      prop.setExternal(this.valueParser_.getLayer(), external);
      this.state_.push(State.Ignore(false));
    }
  }
  /** Original localized value operation, path, layer and delayed value parser ownership. @param reader - Actual reader. @param locprop - Actual localized property. @returns Nothing. */
  private handleLocpropValue(reader: XmlReader, locprop: LocalizedPropertyNode): void {
    const name = new OUString();
    let nil = false,
      separator = new Uint8Array(),
      op = Operation.FUSE;
    this.attributes(
      reader,
      /** Original localized value attributes. @param ns - Namespace. @param attr - Attribute name. @returns Nothing. */ (
        ns,
        attr,
      ) => {
        if (ns === XmlReader.NAMESPACE_XML && equals(attr, "lang"))
          name.assign(reader.getAttributeValue(false).convertFromUtf8());
        else if (ns === NAMESPACE_XSI && equals(attr, "nil"))
          nil = xmldata.parseBoolean(reader.getAttributeValue(true));
        else if (ns === NAMESPACE_OOR) {
          if (equals(attr, "type")) {
            const type = xmldata.parseType(reader, reader.getAttributeValue(true));
            if (this.valueParser_.type_ !== Type.TYPE_ANY && type !== this.valueParser_.type_)
              throw error("invalid value type in " + text(reader.getUrl()));
            this.valueParser_.type_ = type;
          } else if (equals(attr, "separator")) {
            const value = reader.getAttributeValue(false);
            if (value.length === 0)
              throw error("bad oor:separator attribute in " + text(reader.getUrl()));
            separator = bytes(value);
          } else if (equals(attr, "op"))
            op = XcuParser.parseOperation(reader.getAttributeValue(true));
        }
      },
    );
    if (this.trackPath_) {
      this.path_.push(new OUString(name));
      if (this.partial_ !== null && this.partial_.contains(this.path_) !== Partial.CONTAINS_NODE) {
        this.state_.push(State.Ignore(true));
        return;
      }
    }
    const members = locprop.getMembers(),
      entry = members.find(name);
    if (entry !== undefined && (entry.second as Node).getLayer() > this.valueParser_.getLayer()) {
      this.state_.push(State.Ignore(true));
      return;
    }
    if (nil && !locprop.isNillable())
      throw error("xsi:nil attribute for non-nillable prop in " + text(reader.getUrl()));
    switch (op as Operation) {
      case Operation.FUSE: {
        let pop = false;
        if (nil) {
          const value = new Any();
          try {
            if (entry === undefined)
              members.getOrInsert(name).second = new LocalizedValueNode(
                this.valueParser_.getLayer(),
                value,
              );
            else
              (entry.second as LocalizedValueNode).setValue(
                this.valueParser_.getLayer(),
                value,
                this.valueParser_.getLayer() === Data.NO_LAYER,
              );
          } finally {
            value.dispose();
          }
          this.state_.push(State.Ignore(true));
        } else {
          this.valueParser_.separator_ = separator;
          this.valueParser_.start(locprop, name);
          pop = true;
        }
        if (this.trackPath_) {
          this.recordModification(false);
          if (pop) this.path_.pop();
        }
        break;
      }
      case Operation.REMOVE:
        if (entry !== undefined) members.erase(entry);
        this.state_.push(State.Ignore(true));
        this.recordModification(false);
        break;
      default:
        throw error("bad op attribute for value element in " + text(reader.getUrl()));
    }
  }
  /** Original group-property attribute dispatch and exact partial leaf requirement. @param reader - Actual reader. @param group - Actual parent. @returns Nothing. */
  private handleGroupProp(reader: XmlReader, group: GroupNode): void {
    let hasName = false,
      type = Type.TYPE_ERROR,
      op = Operation.MODIFY,
      finalized = false;
    const name = new OUString();
    this.attributes(
      reader,
      /** Original property metadata. @param ns - Namespace. @param attr - Attribute name. @returns Nothing. */ (
        ns,
        attr,
      ) => {
        if (ns !== NAMESPACE_OOR) return;
        if (equals(attr, "name")) {
          hasName = true;
          name.assign(reader.getAttributeValue(false).convertFromUtf8());
        } else if (equals(attr, "type"))
          type = xmldata.parseType(reader, reader.getAttributeValue(true));
        else if (equals(attr, "op")) op = XcuParser.parseOperation(reader.getAttributeValue(true));
        else if (equals(attr, "finalized"))
          finalized = xmldata.parseBoolean(reader.getAttributeValue(true));
      },
    );
    if (!hasName) throw error("no prop name attribute in " + text(reader.getUrl()));
    if (this.trackPath_) {
      this.path_.push(new OUString(name));
      if (this.partial_ !== null && this.partial_.contains(this.path_) !== Partial.CONTAINS_NODE) {
        this.state_.push(State.Ignore(true));
        return;
      }
    }
    const entry = group.getMembers().find(name);
    if (entry === undefined) this.handleUnknownGroupProp(reader, group, name, type, op, finalized);
    else
      switch ((entry.second as Node).kind()) {
        case Node.KIND_PROPERTY:
          this.handlePlainGroupProp(reader, group, entry, name, type, op, finalized);
          break;
        case Node.KIND_LOCALIZED_PROPERTY:
          this.handleLocalizedGroupProp(
            reader,
            entry.second as LocalizedPropertyNode,
            name,
            type,
            op,
            finalized,
          );
          break;
        default:
          throw error("inappropriate prop " + text(name) + " in " + text(reader.getUrl()));
      }
  }
  /** Original extension-only creation; unknown ordinary properties are ignored. @param reader - Actual reader. @param group - Parent. @param name - Property name. @param type - Parsed type. @param operation - Operation. @param finalized - Metadata flag. @returns Nothing. */
  private handleUnknownGroupProp(
    reader: XmlReader,
    group: GroupNode,
    name: OUString,
    type: Type,
    operation: Operation,
    finalized: boolean,
  ): void {
    if ((operation === Operation.REPLACE || operation === Operation.FUSE) && group.isExtensible()) {
      if (type === Type.TYPE_ERROR)
        throw error(
          "missing type attribute for prop " + text(name) + " in " + text(reader.getUrl()),
        );
      this.valueParser_.type_ = type;
      const value = new Any();
      let prop: PropertyNode;
      try {
        prop = new PropertyNode(this.valueParser_.getLayer(), Type.TYPE_ANY, true, value, true);
      } finally {
        value.dispose();
      }
      if (finalized) prop.setFinalized(this.valueParser_.getLayer());
      this.state_.push(State.Insert(prop, name));
      this.recordModification(false);
    } else this.state_.push(State.Ignore(true));
  }
  /** Original plain property operation ordering, including metadata mutation before type/op errors. @param reader - Actual reader. @param group - Parent. @param entry - Stable map entry. @param name - Name. @param type - Optional declared type. @param operation - Operation. @param finalized - Metadata flag. @returns Nothing. */
  private handlePlainGroupProp(
    reader: XmlReader,
    group: GroupNode,
    entry: ConfigEntry<Node | null>,
    name: OUStringConstReference,
    type: Type,
    operation: Operation,
    finalized: boolean,
  ): void {
    const property = entry.second as PropertyNode;
    if (
      property.getLayer() > this.valueParser_.getLayer() ||
      this.isAlreadyFinalized(property.getFinalized())
    ) {
      this.state_.push(State.Ignore(true));
      return;
    }
    if (finalized) property.setFinalized(this.valueParser_.getLayer());
    if (
      type !== Type.TYPE_ERROR &&
      property.getStaticType() !== Type.TYPE_ANY &&
      type !== property.getStaticType()
    )
      throw error("invalid type for prop " + text(name) + " in " + text(reader.getUrl()));
    this.valueParser_.type_ = type === Type.TYPE_ERROR ? property.getStaticType() : type;
    switch (operation) {
      case Operation.MODIFY:
      case Operation.REPLACE:
      case Operation.FUSE:
        this.state_.push(State.Modify(property));
        this.recordModification(false);
        break;
      case Operation.REMOVE:
        if (!property.isExtension())
          throw error(
            "invalid remove of non-extension prop " + text(name) + " in " + text(reader.getUrl()),
          );
        group.getMembers().erase(entry);
        this.state_.push(State.Ignore(true));
        this.recordModification(false);
        break;
    }
  }
  /** Original localized property replacement clones schema metadata but clears values. @param reader - Actual reader. @param property - Existing property. @param name - Name. @param type - Optional type. @param operation - Operation. @param finalized - Metadata flag. @returns Nothing. */
  private handleLocalizedGroupProp(
    reader: XmlReader,
    property: LocalizedPropertyNode,
    name: OUString,
    type: Type,
    operation: Operation,
    finalized: boolean,
  ): void {
    if (
      property.getLayer() > this.valueParser_.getLayer() ||
      this.isAlreadyFinalized(property.getFinalized())
    ) {
      this.state_.push(State.Ignore(true));
      return;
    }
    if (finalized) property.setFinalized(this.valueParser_.getLayer());
    if (
      type !== Type.TYPE_ERROR &&
      property.getStaticType() !== Type.TYPE_ANY &&
      type !== property.getStaticType()
    )
      throw error("invalid type for prop " + text(name) + " in " + text(reader.getUrl()));
    this.valueParser_.type_ = type === Type.TYPE_ERROR ? property.getStaticType() : type;
    switch (operation) {
      case Operation.MODIFY:
      case Operation.FUSE:
        this.state_.push(State.Modify(property));
        break;
      case Operation.REPLACE: {
        const replacement = new LocalizedPropertyNode(
          this.valueParser_.getLayer(),
          property.getStaticType(),
          property.isNillable(),
        );
        replacement.setFinalized(property.getFinalized());
        this.state_.push(State.Insert(replacement, name));
        this.recordModification(false);
        break;
      }
      case Operation.REMOVE:
        throw error(
          "invalid remove of non-extension prop " + text(name) + " in " + text(reader.getUrl()),
        );
    }
  }
  /** Original child group/set visibility, kind and operation gates. @param reader - Actual reader. @param group - Parent. @returns Nothing. */
  private handleGroupNode(reader: XmlReader, group: Node): void {
    let hasName = false,
      op = Operation.MODIFY,
      finalized = false;
    const name = new OUString();
    this.attributes(
      reader,
      /** Original group-node metadata. @param ns - Namespace. @param attr - Attribute name. @returns Nothing. */ (
        ns,
        attr,
      ) => {
        if (ns !== NAMESPACE_OOR) return;
        if (equals(attr, "name")) {
          hasName = true;
          name.assign(reader.getAttributeValue(false).convertFromUtf8());
        } else if (equals(attr, "op"))
          op = XcuParser.parseOperation(reader.getAttributeValue(true));
        else if (equals(attr, "finalized"))
          finalized = xmldata.parseBoolean(reader.getAttributeValue(true));
      },
    );
    if (!hasName) throw error("no node name attribute in " + text(reader.getUrl()));
    if (this.trackPath_) {
      this.path_.push(new OUString(name));
      if (this.partial_ !== null && this.partial_.contains(this.path_) === Partial.CONTAINS_NOT) {
        this.state_.push(State.Ignore(true));
        return;
      }
    }
    const child = group.getMembers().findNode(this.valueParser_.getLayer(), name);
    if (child === null) {
      this.state_.push(State.Ignore(true));
      return;
    }
    const kind = child.kind();
    if (kind !== Node.KIND_GROUP && kind !== Node.KIND_SET)
      throw error(
        'bad <node> "' + text(name) + '" of non group/set kind in ' + text(reader.getUrl()),
      );
    if (op !== Operation.MODIFY && op !== Operation.FUSE)
      throw error("invalid operation on group node in " + text(reader.getUrl()));
    if (this.isAlreadyFinalized(child.getFinalized())) {
      this.state_.push(State.Ignore(true));
      return;
    }
    if (finalized) child.setFinalized(this.valueParser_.getLayer());
    this.state_.push(State.Modify(child));
  }
  /** Original template/member operations, with existing metadata mutation preceding layer/finalized checks. @param reader - Actual reader. @param set - Parent set. @returns Nothing. */
  private handleSetNode(reader: XmlReader, set: SetNode): void {
    let hasName = false,
      hasNodeType = false,
      op = Operation.MODIFY,
      finalized = false,
      mandatory = false;
    const name = new OUString(),
      component = new OUString(this.componentName_),
      nodeType = new OUString();
    this.attributes(
      reader,
      /** Original set member attributes. @param ns - Namespace. @param attr - Attribute name. @returns Nothing. */ (
        ns,
        attr,
      ) => {
        if (ns !== NAMESPACE_OOR) return;
        if (equals(attr, "name")) {
          hasName = true;
          name.assign(reader.getAttributeValue(false).convertFromUtf8());
        } else if (equals(attr, "component"))
          component.assign(reader.getAttributeValue(false).convertFromUtf8());
        else if (equals(attr, "node-type")) {
          hasNodeType = true;
          nodeType.assign(reader.getAttributeValue(false).convertFromUtf8());
        } else if (equals(attr, "op"))
          op = XcuParser.parseOperation(reader.getAttributeValue(true));
        else if (equals(attr, "finalized"))
          finalized = xmldata.parseBoolean(reader.getAttributeValue(true));
        else if (equals(attr, "mandatory"))
          mandatory = xmldata.parseBoolean(reader.getAttributeValue(true));
      },
    );
    if (!hasName) throw error("no node name attribute in " + text(reader.getUrl()));
    if (this.trackPath_) {
      this.path_.push(new OUString(name));
      if (this.partial_ !== null && this.partial_.contains(this.path_) === Partial.CONTAINS_NOT) {
        this.state_.push(State.Ignore(true));
        return;
      }
    }
    const templateName = xmldata.parseTemplateReference(
      component,
      hasNodeType,
      nodeType,
      set.getDefaultTemplateName(),
    );
    if (!set.isValidTemplate(templateName))
      throw error(
        "set member node " +
          text(name) +
          " references invalid template " +
          text(templateName) +
          " in " +
          text(reader.getUrl()),
      );
    const tmpl = this.data_.getTemplate(this.valueParser_.getLayer(), templateName);
    if (tmpl === null)
      throw error(
        "set member node " +
          text(name) +
          " references undefined template " +
          text(templateName) +
          " in " +
          text(reader.getUrl()),
      );
    let alreadyFinalized = false,
      finalizedLayer = finalized ? this.valueParser_.getLayer() : Data.NO_LAYER,
      mandatoryLayer = mandatory ? this.valueParser_.getLayer() : Data.NO_LAYER;
    const members = set.getMembers(),
      entry = members.find(name);
    if (entry !== undefined) {
      const existing = entry.second as Node,
        fin = existing.getFinalized();
      alreadyFinalized = this.isAlreadyFinalized(fin);
      finalizedLayer = Math.min(finalizedLayer, fin);
      existing.setFinalized(finalizedLayer);
      mandatoryLayer = Math.min(mandatoryLayer, existing.getMandatory());
      existing.setMandatory(mandatoryLayer);
      if (existing.getLayer() > this.valueParser_.getLayer()) {
        this.state_.push(State.Ignore(true));
        return;
      }
    }
    if (alreadyFinalized) {
      this.state_.push(State.Ignore(true));
      return;
    }
    switch (op as Operation) {
      case Operation.MODIFY:
        this.state_.push(entry === undefined ? State.Ignore(true) : State.Modify(entry.second));
        break;
      case Operation.REPLACE: {
        const member = tmpl.clone(true) as Node;
        member.setLayer(this.valueParser_.getLayer());
        member.setFinalized(finalizedLayer);
        member.setMandatory(mandatoryLayer);
        this.state_.push(State.Insert(member, name));
        this.recordModification(entry === undefined);
        break;
      }
      case Operation.FUSE:
        if (entry === undefined) {
          const member = tmpl.clone(true) as Node;
          member.setLayer(this.valueParser_.getLayer());
          member.setFinalized(finalizedLayer);
          member.setMandatory(mandatoryLayer);
          this.state_.push(State.Insert(member, name));
          this.recordModification(true);
        } else this.state_.push(State.Modify(entry.second));
        break;
      case Operation.REMOVE: {
        const known = entry !== undefined;
        if (
          known &&
          (mandatoryLayer === Data.NO_LAYER || mandatoryLayer > this.valueParser_.getLayer())
        )
          members.erase(entry);
        this.state_.push(State.Ignore(true));
        if (known) this.recordModification(false);
        break;
      }
    }
  }
  /** Original broadcast, additions value-copy and user-layer modification recording. @param addition - Whether this path is a new set member. @returns Nothing. */
  private recordModification(addition: boolean): void {
    this.broadcastModifications_?.add(this.path_);
    if (addition && this.additions_ !== null)
      this.additions_.push(
        this.path_.map(
          /** Copies the native vector value. @param segment - Actual path segment. @returns Independent string. */ (
            segment,
          ) => new OUString(segment),
        ),
      );
    if (this.recordModifications_) this.data_.modifications.add(this.path_);
  }
}
