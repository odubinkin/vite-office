/** @fileoverview Original native RelationsFragment and lclGetRelationsPath over actual FragmentHandler/AttributeList/Relations owners; no host expanded-name provider or second relation graph. */
import { FragmentHandler } from "./fragmenthandler.native";
import { Relation, type RelationsRef } from "./relations.native";
import { AttributeList } from "../helper/attributelist";
import { SharedReference } from "./shared-reference";
import type { XmlFilterBase } from "./xmlfilterbase";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XFastAttributeList } from "../../../offapi/com/sun/star/xml/sax/XFastAttributeList";
import type { XFastContextHandler } from "../../../offapi/com/sun/star/xml/sax/XFastContextHandler";
import { namespaceTokens } from "../token/namespacemap";
import { getTokenFromUtf8 as token } from "../token/tokenmap";
/** Compiler-known original literal unit. @param c - Source ASCII character. @returns Byte. */
function ascii(c: string): number {
  return c.charCodeAt(0);
}
const rels = Uint8Array.from("_rels/\0", ascii),
  suffix = Uint8Array.from(".rels\0", ascii),
  relationship = (namespaceTokens.get("packageRel") as number) | token("Relationship"),
  relationships = (namespaceTokens.get("packageRel") as number) | token("Relationships");
/** Original path helper preserves counted UTF16 and the final directory separator. @param path - Borrowed owner fragment view. @returns Owned relation part path. */
function lclGetRelationsPath(path: Uint16Array): OUString {
  let length = path.lastIndexOf(47);
  length = length < 0 ? 0 : length + 1;
  return new OUString(
    new StringConcat(
      new StringConcat(
        new StringConcat(OUString.Concat(path.subarray(0, length)), rels),
        path.subarray(length),
      ),
      suffix,
    ),
  );
}
/** Original concrete relationship XML handler, with shared collection and real source context interface. */
export class RelationsFragment extends FragmentHandler {
  private readonly mxRelations: RelationsRef;
  /** Original explicit base relation path and copied shared owner. @param filter - Actual filter. @param relations - Actual shared native collection. @returns Handler. */
  constructor(filter: XmlFilterBase, relations: RelationsRef) {
    const path = lclGetRelationsPath(
      relations
        .operatorStar()
        .getFragmentPath()
        .getStr()
        .subarray(0, relations.operatorStar().getFragmentPath().getLength()),
    );
    try {
      super(filter, path, relations);
    } finally {
      path.dispose();
    }
    this.mxRelations = new SharedReference(relations);
  }
  /** Original reverse member/base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.mxRelations.dispose();
    super.destroy();
  }
  /** Original token switch, defaulted unqualified fields, native TargetMode token and first-emplace behavior. @param element - Generated combined token. @param attributes - Real native UNO attribute reference. @returns Acquired root context or empty child reference. */
  override createFastChildContext(
    element: number,
    attributes: Reference<XFastAttributeList>,
  ): Reference<XFastContextHandler> {
    const result = new Reference<XFastContextHandler>(),
      values = new AttributeList(attributes);
    try {
      switch (element) {
        case relationship: {
          const value = new Relation();
          try {
            const id = values.getStringDefaulted(token("Id"));
            try {
              value.maId = id;
            } finally {
              id.dispose();
            }
            const type = values.getStringDefaulted(token("Type"));
            try {
              value.maType = type;
            } finally {
              type.dispose();
            }
            const target = values.getStringDefaulted(token("Target"));
            try {
              value.maTarget = target;
            } finally {
              target.dispose();
            }
            if (!value.maId.isEmpty() && !value.maType.isEmpty() && !value.maTarget.isEmpty()) {
              const mode = values.getToken(token("TargetMode"), token("Internal"));
              value.mbExternal = mode !== token("Internal");
              this.mxRelations.operatorStar().emplace(value.maId, value);
            }
          } finally {
            value.dispose();
          }
          break;
        }
        case relationships: {
          const root = this.getFastContextHandler();
          try {
            result.assign(root);
          } finally {
            root.dispose();
          }
          break;
        }
      }
      return result;
    } catch (error) {
      result.dispose();
      throw error;
    } finally {
      values.dispose();
    }
  }
}
