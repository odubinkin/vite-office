/** @fileoverview Ports RelationsFragment path construction and native relationship SAX admission from oox/source/core/relationshandler.cxx. */
import type { SaxesAttributeNS, SaxesTagNS } from "saxes";
import { FragmentHandler, type FragmentContext, type FragmentFilter } from "./fragmenthandler";
import { Relation, type Relations } from "./relations";

/** Native package relationship namespace. */
export const PACKAGE_RELATION_NAMESPACE =
  "http://schemas.openxmlformats.org/package/2006/relationships";

/** Original owner-fragment to .rels path construction. @param fragmentPath - Owner, or empty for the package. @returns Relationship stream. */
export function getRelationsPath(fragmentPath: string): string {
  const length = fragmentPath.lastIndexOf("/") + 1;
  return fragmentPath.slice(0, length) + "_rels/" + fragmentPath.slice(length) + ".rels";
}

/** Native handler ignores incomplete relationships and keeps the first duplicate ID. */
export class RelationsFragment extends FragmentHandler {
  /** Binds the existing relations owner. @param filter - Filter. @param relations - Collection. @returns Handler. */
  constructor(
    filter: FragmentFilter,
    private readonly targetRelations: Relations,
  ) {
    super(filter, getRelationsPath(targetRelations.getFragmentPath()), targetRelations);
  }
  /** Applies the original PR_TOKEN element and unqualified attribute handling. @param tag - Expanded name. @param attributes - Attributes. @returns Child context or null. */
  override createFastChildContext(
    tag: SaxesTagNS,
    attributes: readonly SaxesAttributeNS[],
  ): FragmentContext | null {
    if (tag.uri !== PACKAGE_RELATION_NAMESPACE) return null;
    if (tag.local === "Relationships") return this;
    if (tag.local === "Relationship") {
      const values = new Map(
        attributes
          .filter(
            /** Only unqualified attributes have XML tokens. @param a - Attribute. @returns Admission. */ (
              a,
            ) => a.uri === "",
          )
          .map(
            /** Captures value. @param a - Attribute. @returns Pair. */ (a) => [a.local, a.value],
          ),
      );
      const relation = new Relation();
      relation.maId = values.get("Id") ?? "";
      relation.maType = values.get("Type") ?? "";
      relation.maTarget = values.get("Target") ?? "";
      if (relation.maId !== "" && relation.maType !== "" && relation.maTarget !== "") {
        relation.mbExternal = (values.get("TargetMode") ?? "Internal") !== "Internal";
        this.targetRelations.emplace(relation.maId, relation);
      }
    }
    return null;
  }
}
