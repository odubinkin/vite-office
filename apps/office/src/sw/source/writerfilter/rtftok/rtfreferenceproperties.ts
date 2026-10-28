/** @fileoverview Native RTFReferenceProperties value-list ownership and ordered resource delivery from rtfreferenceproperties.cxx. */
import type { Properties, Reference } from "../inc/dmapper/resourcemodel";
import { RTFSprm, RTFSprms } from "./rtfsprm";
/** Original container copies by-value constructor arguments and sends attributes before modifiers. */
export class RTFReferenceProperties extends SvRefBase implements Reference<Properties> {
  private readonly m_aAttributes: RTFSprms;
  private readonly m_aSprms: RTFSprms;
  /** Original attributes/attributes+modifiers overloads; borrowed inputs retain their own list values. @param attributes - Attributes. @param sprms - Optional modifiers. @returns Reference. */
  constructor(attributes: RTFSprms, sprms?: RTFSprms) {
    super();
    this.m_aAttributes = new RTFSprms(attributes);
    this.m_aSprms = sprms === undefined ? new RTFSprms() : new RTFSprms(sprms);
  }
  /** Native mutable attribute view. @returns Actual list. */
  getAttributes(): RTFSprms {
    return this.m_aAttributes;
  }
  /** Native mutable modifier view. @returns Actual list. */
  getSprms(): RTFSprms {
    return this.m_aSprms;
  }
  /** Original ordered synchronous callbacks keep modifier references bound to actual entry cells. @param handler - Real resource receiver. @returns Nothing. */
  resolve(handler: Properties): void {
    for (const [id, value] of this.m_aAttributes)
      handler.attribute(id, value.operatorDereference());
    for (const entry of this.m_aSprms) handler.sprm(new RTFSprm(entry[0], entry[1]));
  }
  /** Logical original destructor releases both by-value list members. @returns Nothing. */
  dispose(): void {
    this.m_aAttributes.dispose();
    this.m_aSprms.dispose();
  }
  /** Original virtual reference destructor releases its actual value-list members. @returns Nothing. */
  protected override destroy(): void {
    this.dispose();
  }
}

import { SvRefBase } from "../../../../tools/inc/ref";
