/** @fileoverview Consumed OOXMLFactory_wml generated lookup methods over source-generated native definition, attribute, element, token and list tables. */
import { AttributeInfo, ResourceType as R, type OOXMLFactory_ns } from "./OOXMLFactory";
import type { Id } from "../inc/dmapper/resourcemodel";
import * as tables from "./OOXMLFactory_wml.tables";
import * as TokenMap from "../../../../oox/source/token/tokenmap";
import { XML_TOKEN_INVALID } from "../../../../oox/source/token/tokenmap";
import { namespaceTokens } from "../../../../oox/source/token/namespacemap";
import type { FactoryAttributeHandler } from "./OOXMLFactory";
import type { OOXMLValue } from "./OOXMLPropertySet";

/** Binds generated C++ NMSP/XML constant expressions to their original numeric IDs. @param qname - Canonical namespace alias and exact local lexeme. @returns Native token, or DONTKNOW for invalid expressions. */
export function nativeToken(qname: string): number {
  const colon = qname.indexOf(":"),
    prefix = qname.slice(0, colon);
  const namespace = prefix === "" ? 0 : namespaceTokens.get(prefix),
    local = TokenMap.getTokenFromUtf8(qname.slice(colon + 1));
  return namespace === undefined || local === XML_TOKEN_INVALID
    ? XML_TOKEN_INVALID
    : namespace | local;
}
/** One original generated action row; phase distinguishes native token versus resource-ID guards. */
export type FactoryAction = readonly [Id, string, string, Id, Id];
/** Native generated namespace factory singleton and switch-table behavior. */
export class OOXMLFactory_wml implements OOXMLFactory_ns {
  private static instance: OOXMLFactory_wml | null = null;
  private readonly attributes = new Map<Id, AttributeInfo[]>();
  private readonly elements = new Map<Id, Map<number, readonly [R, Id]>>();
  private readonly resources = new Map<Id, Map<number, Id>>();
  private readonly lists = new Map<Id, Map<string, Id>>();
  private readonly actions: FactoryAction[] = [];
  /** Builds native static lookup storage from generated records without renumbering identities. @returns Factory. */
  private constructor() {
    for (const [id, token, kind, ref] of tables.attributes) {
      let values = this.attributes.get(id);
      if (!values) {
        values = [];
        this.attributes.set(id, values);
      }
      values.push(new AttributeInfo(nativeToken(token), R[kind], ref));
    }
    for (const [id, token, kind, ref] of tables.elements) {
      let values = this.elements.get(id);
      if (!values) {
        values = new Map();
        this.elements.set(id, values);
      }
      values.set(nativeToken(token), [R[kind], ref]);
    }
    for (const [id, token, resource] of tables.resources) {
      let values = this.resources.get(id);
      if (!values) {
        values = new Map();
        this.resources.set(id, values);
      }
      values.set(nativeToken(token), resource);
    }
    for (const [id, value, token] of tables.lists) {
      let values = this.lists.get(id);
      if (!values) {
        values = new Map();
        this.lists.set(id, values);
      }
      // Generation retains the first native if/else spelling match.
      values.set(value, token);
    }
    for (const [id, phase, action, guard, send] of tables.actions)
      this.actions.push([
        id,
        phase,
        action,
        typeof guard === "string" ? nativeToken(guard) : guard,
        send,
      ]);
  }
  /** Original lazily initialized namespace singleton. @returns Shared factory. */
  static getInstance(): OOXMLFactory_wml {
    if (!this.instance) this.instance = new OOXMLFactory_wml();
    return this.instance;
  }
  /** Original list lookup leaves out untouched on unknown definition/spelling. @param id - Native definition. @param value - Lexical value. @param out - Native output cell. @returns Success. */
  getListValue(id: Id, value: string, out: [number]): boolean {
    const found = this.lists.get(id)?.get(value);
    if (found === undefined) return false;
    out[0] = found;
    return true;
  }
  /** Native generated switch default searches root/start resource mappings only when the definition has no generated case. @param define - Native context. @param token - Canonical QName. @returns Resource ID or zero. */
  getResourceId(define: Id, token: number): Id {
    return (this.resources.get(define) ?? this.resources.get(0))?.get(token) ?? 0;
  }
  /** Native no-attribute definitions return null. @param id - Native definition. @returns Borrowed immutable array. */
  getAttributeInfoArray(id: Id): readonly AttributeInfo[] | null {
    return this.attributes.get(id) ?? null;
  }
  /** Original generated element switch/default behavior and failure-preserving output cells. @param define - Native context. @param token - Canonical QName. @param resource - Resource output. @param element - Definition output. @returns Success. */
  getElementId(define: Id, token: number, resource: [R], element: [Id]): boolean {
    const found = (this.elements.get(define) ?? this.elements.get(0))?.get(token);
    if (found === undefined) return false;
    resource[0] = found[0];
    element[0] = found[1];
    return true;
  }
  /** Generated action selection retains original phase, source order and conditional resource ID. @param define - Native context. @param phase - Native action phase. @returns Borrowed action rows. */
  getActions(define: Id, phase: string): readonly FactoryAction[] {
    return this.actions.filter(
      /** Selects original generated action cases. @param row - Native row. @returns Match. */ (
        row,
      ) => row[0] === define && row[1] === phase,
    );
  }
  /** Original generated attributeAction cases perform statically selected setValue calls. @param handler - Native value context. @param token - Original fast token. @param value - Typed value. @returns Nothing. */
  attributeAction(handler: FactoryAttributeHandler, token: number, value: OOXMLValue): void {
    for (const action of this.getActions(handler.getDefine(), "attribute")) {
      // Generation rejects new attribute-action kinds until their native owner is ported.
      if (action[3] === token) handler.setValue(value);
    }
  }
  /** The admitted native definition names provide no fallback for an unported parser context. @param id - Native definition. @returns Name or null. */
  getDefineName(id: Id): string | null {
    return (tables.defines as Readonly<Record<number, string>>)[id] ?? null;
  }
}
