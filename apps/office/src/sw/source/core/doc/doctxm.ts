/** @fileoverview Writer document index insertion and native TOX name allocation. */
import { toInt32 } from "../../../../o3tl/inc/string_view";
import type { SwDoc } from "./doc";
import type { SwSectionNode } from "../docnode/ndsect";
import type { SwNode } from "../docnode/node";
import { SectionType, SwSectionData } from "../docnode/section";
import type { SwTOXBase, SwTOXType } from "../tox/tox";

/** Allocates a document index name using the native type prefix and suffix scan. @param document - Owning document. @param type - Index type. @param requested - Authored name. @returns Name for the attached index. */
export function GetUniqueTOXBaseName(document: SwDoc, type: SwTOXType, requested: string): string {
  const names = new Set<string>();
  let sectionCount = 0;
  for (const node of document.GetNodes().entries()) {
    const section = node.GetSectionNode();
    if (!section) continue;
    sectionCount++;
    const data = section.GetSection().GetSectionData();
    if (data.type === SectionType.ToxContent) names.add(data.name);
  }
  if (requested && !names.has(requested)) return requested;
  const occupied = new Set<number>();
  for (const name of names) {
    if (!name.startsWith(type.name)) continue;
    const suffix = toInt32(name.slice(type.name.length));
    if (suffix > 0 && suffix <= sectionCount) occupied.add(suffix);
  }
  let suffix = 1;
  while (occupied.has(suffix)) suffix++;
  return type.name + suffix;
}

/** Inserts the section for the import path which already carries generated index content. @param document - Owning document. @param before - Paragraph insertion boundary. @param descriptor - Index properties. @returns Attached native index node. */
export function InsertTableOf(
  document: SwDoc,
  before: SwNode,
  descriptor: SwTOXBase,
): SwSectionNode {
  const tox = descriptor.Clone(document.GetTOXType());
  tox.name = GetUniqueTOXBaseName(document, tox.type, tox.name);
  const data = new SwSectionData(SectionType.ToxContent, tox.name);
  const node = document.GetNodes().InsertTextSection(before, data, tox);
  node.GetSection().SetProtect(tox.protected);
  return node;
}
