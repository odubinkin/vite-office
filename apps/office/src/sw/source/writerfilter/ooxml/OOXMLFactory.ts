/** @fileoverview Consumed native OOXMLFactory attribute conversion and source-ordered delivery over actual OOXMLValue/resource contracts and original numeric fast-token identities. */
import type { Id } from "../inc/dmapper/resourcemodel";
import { OOXMLFactory_wml } from "./OOXMLFactory_wml";
import { OOXMLValue as V } from "./OOXMLPropertySet";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { toInt32 } from "../../../../o3tl/inc/string_view";
import { namespaces } from "./OOXMLFactory_wml.tables";
import { XML_TOKEN_COUNT } from "../../../../oox/source/token/tokenmap";
import {
  OOXMLFastContextHandler,
  OOXMLFastContextHandlerStream,
  OOXMLFastContextHandlerProperties,
  OOXMLFastContextHandlerValue,
} from "./OOXMLFastContextHandler";

/** Original ResourceType declaration order. */
export enum ResourceType {
  NoResource,
  Table,
  Stream,
  List,
  Integer,
  Properties,
  Hex,
  HexColor,
  String,
  Shape,
  Boolean,
  Value,
  XNote,
  TextTableCell,
  TextTableRow,
  TextTable,
  PropertyTable,
  Math,
  Any,
  EmuMeasure,
  TwipsMeasure_asSigned,
  TwipsMeasure_asZero,
  HpsMeasure,
  MeasurementOrPercent,
  CommentEx,
  Theme,
}
/** Original AttributeInfo fields; array bounds replace only the native -1 terminator. */
export class AttributeInfo {
  /** Copies original immutable generated metadata. @param m_nToken - QName token. @param m_nResource - Resource kind. @param m_nRef - Referenced native definition identity. @returns Metadata. */
  constructor(
    readonly m_nToken: number,
    readonly m_nResource: ResourceType,
    readonly m_nRef: Id,
  ) {}
}
/** Original namespace factory query contracts retain success booleans and unchanged output cells on failure. */
export interface OOXMLFactory_ns {
  getListValue(id: Id, value: string, out: [number]): boolean;
  getResourceId(define: Id, token: number): Id;
  getAttributeInfoArray(id: Id): readonly AttributeInfo[] | null;
  getElementId(define: Id, token: number, resource: [ResourceType], element: [Id]): boolean;
}

/** Native XML attribute token and lexical value at the parser boundary. */
export interface FastAttribute {
  readonly token: number;
  readonly value: string;
}
/** Original consumed handler operations used by Factory::attributes and generated attribute actions. */
export interface FactoryAttributeHandler {
  getDefine(): Id;
  newProperty(id: Id, value: V): void;
  setValue(value: V): void;
}

/** Native factory dispatch/lexical conversion owner; document context creation remains with OOXMLFastContextHandler. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original static OOXMLFactory owner (OOXMLFactory.hxx deletes its constructor).
export class OOXMLFactory {
  /** Original generated start factory tries namespaces in source order; the admitted slice currently contains wml. @param parent - Parent context. @param element - Native fast token. @returns Child or null. */
  static createFastChildContextFromStart(
    parent: OOXMLFastContextHandler,
    element: number,
  ): OOXMLFastContextHandler | null {
    return this.createFastChildContextFromFactory(parent, OOXMLFactory_wml.getInstance(), element);
  }
  /** Original token-count guard prevents unknown-token recursion. @param parent - Parent context. @param element - Token. @returns Child or null. */
  static createFastChildContext(
    parent: OOXMLFastContextHandler,
    element: number,
  ): OOXMLFastContextHandler | null {
    return (element & 0xffff) < XML_TOKEN_COUNT
      ? this.createFastChildContextFromFactory(
          parent,
          this.getFactoryForNamespace(parent.getDefine()),
          element,
        )
      : null;
  }
  /** Native generated resource selection and helper assignment order. Missing ported owners fail explicitly until implemented. @param parent - Parent. @param factory - Namespace factory. @param token - Token. @returns Child or null. */
  private static createFastChildContextFromFactory(
    parent: OOXMLFastContextHandler,
    factory: OOXMLFactory_wml | null,
    token: number,
  ): OOXMLFastContextHandler | null {
    if (!factory) return null;
    const resource: [ResourceType] = [ResourceType.NoResource],
      define: [Id] = [0];
    if (!factory.getElementId(parent.getDefine(), token, resource, define)) return null;
    const id = factory.getResourceId(parent.getDefine(), token);
    let context: OOXMLFastContextHandler;
    switch (resource[0]) {
      case ResourceType.Stream:
        context = new OOXMLFastContextHandlerStream(parent);
        break;
      case ResourceType.Properties:
        context = new OOXMLFastContextHandlerProperties(parent);
        break;
      case ResourceType.Value:
        context = new OOXMLFastContextHandlerValue(parent);
        break;
      case ResourceType.Any:
        // Native start dispatch finds this token in another namespace factory
        // before revisiting wml. That namespace owner is not ported yet.
        throw new Error("OOXML start namespace factory is not implemented for token: " + token);
      default:
        throw new Error("OOXML resource context is not implemented: " + ResourceType[resource[0]]);
    }
    if (factory.getDefineName(define[0]) === null)
      throw new Error("OOXML definition is not implemented: " + define[0]);
    context.setToken(token);
    context.setId(id);
    context.setDefine(define[0]);
    return context;
  }
  /** Original generated namespace start dispatch. @param handler - Context. @returns Nothing. */ static startAction(
    handler: OOXMLFastContextHandler,
  ): void {
    this.getFactoryForNamespace(handler.getDefine())?.dispatchActions(handler, "start");
  }
  /** Original generated namespace end dispatch. @param handler - Context. @returns Nothing. */ static endAction(
    handler: OOXMLFastContextHandler,
  ): void {
    this.getFactoryForNamespace(handler.getDefine())?.dispatchActions(handler, "end");
  }
  /** Original generated character dispatch. @param handler - Context. @param text - UTF16 text. @returns Nothing. */ static characters(
    handler: OOXMLFastContextHandler,
    text: string,
  ): void {
    this.getFactoryForNamespace(handler.getDefine())?.dispatchActions(handler, "characters", text);
  }
  /** Selects the source native namespace from high identity bits; the start handler selects wml explicitly. @param id - Definition identity. @returns Factory or null. */
  static getFactoryForNamespace(id: Id): OOXMLFactory_wml | null {
    return (id & 0xffff0000) === namespaces.NN_wml ? OOXMLFactory_wml.getInstance() : null;
  }
  /** Original typed attribute conversion, including no-value unknown list entries and negative-twip zero mode. @param kind - Native type. @param reference - Native list definition. @param value - Lexical value. @param factory - Namespace factory. @returns Native value, possibly empty. */
  static createAttributeValue(
    kind: ResourceType,
    reference: Id,
    value: string,
    factory: OOXMLFactory_wml,
  ): V {
    switch (kind) {
      case ResourceType.Boolean:
        return V.createBoolean(value);
      case ResourceType.String: {
        const text = new OUString(
          Uint16Array.from(
            value.split(""),
            /** Copies one UTF16 unit. @param unit - Unit. @returns Code. */ (unit) =>
              unit.charCodeAt(0),
          ),
          value.length,
        );
        try {
          return V.createString(text);
        } finally {
          text.dispose();
        }
      }
      case ResourceType.Integer:
        return V.createInteger(toInt32(new TextEncoder().encode(value), 10));
      case ResourceType.Hex:
        return V.createHex(value);
      case ResourceType.HexColor:
        return V.createHexColor(value);
      case ResourceType.EmuMeasure:
        return V.createEmuMeasure(value);
      case ResourceType.TwipsMeasure_asSigned:
        return V.createTwipsMeasure(value);
      case ResourceType.TwipsMeasure_asZero: {
        const result = V.createTwipsMeasure(value);
        return result.getInt() < 0 ? V.createInteger(0) : result;
      }
      case ResourceType.HpsMeasure:
        return V.createHpsMeasure(value);
      case ResourceType.MeasurementOrPercent:
        return V.createMeasurementOrPercent(value);
      case ResourceType.List: {
        const output: [number] = [0];
        return factory.getListValue(reference, value, output)
          ? V.createInteger(output[0])
          : new V();
      }
      default:
        return new V();
    }
  }
  /** Native schema-array order controls dispatch, independently of the XML attribute order. @param handler - Original context receiver. @param attributes - XML attributes. @returns Nothing. */
  static attributes(handler: FactoryAttributeHandler, attributes: readonly FastAttribute[]): void {
    const define = handler.getDefine(),
      factory = this.getFactoryForNamespace(define);
    if (!factory) return;
    const metadata = factory.getAttributeInfoArray(define);
    if (!metadata) return;
    for (const info of metadata) {
      const attribute = attributes.find(
        /** Matches native fast-token identity. @param candidate - Attribute. @returns Match. */ (
          candidate,
        ) => candidate.token === info.m_nToken,
      );
      if (!attribute) continue;
      const value = this.createAttributeValue(
        info.m_nResource,
        info.m_nRef,
        attribute.value,
        factory,
      );
      if (!value.hasValue()) continue;
      handler.newProperty(factory.getResourceId(define, info.m_nToken), value);
      factory.attributeAction(handler, info.m_nToken, value);
    }
  }
}
