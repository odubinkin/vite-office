/** @fileoverview Binds xmloff section properties to actual Writer sections and text cursors. */
import { SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import type { XMLTextExportBlock } from "../../../../xmloff/source/table/XMLTableExport";
import type { XMLSectionExportSource } from "../../../../xmloff/source/text/XMLSectionExport";
import type {
  XMLSectionImport,
  XMLSectionImportProperties,
} from "../../../../xmloff/source/text/XMLSectionImportContext";
import type { XMLSectionStyle } from "../../../../xmloff/source/text/XMLSectionStyleContext";
import type { XMLTextImportHelper } from "../../../../xmloff/source/text/txtimp";
import type { XMLSectionSource } from "../../../../xmloff/source/text/XMLSectionSourceImportContext";
import { RES_LR_SPACE } from "../../../inc/hintids";
import type { SwSectionNode } from "../../core/docnode/ndsect";
import { SectionType, type SwSectionFormat } from "../../core/docnode/section";
import { SwXTextCursor } from "../../core/unocore/unoobj";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwXTextSection } from "../../core/unocore/unosect";
import { exportFrameVisualProperties } from "./xmlexpit";
import { importFrameVisualProperties } from "./xmlimpit";

/** Applies existing frame items from the section style map. @param format - Section format. @param style - Authored section style. @returns Nothing. */
export function importSectionStyle(format: SwSectionFormat, style: XMLSectionStyle): void {
  importFrameVisualProperties(format, style);
  if (style.marginLeft === undefined && style.marginRight === undefined) return;
  const margins = format.GetLRSpace().Clone();
  try {
    if (style.marginLeft !== undefined) margins.SetLeft(SvxIndentValue.twips(style.marginLeft));
    if (style.marginRight !== undefined) margins.SetRight(SvxIndentValue.twips(style.marginRight));
    format.SetFormatAttr(margins);
  } finally {
    margins.Dispose();
  }
}

/** Attaches the Writer section and directs subsequent text to its own initial paragraph. @param helper - Shared text dispatcher. @param properties - Author's ODF section properties. @param style - Resolved section style. @returns Source and end operations for the section. */
export function importTextSection(
  helper: XMLTextImportHelper,
  properties: XMLSectionImportProperties,
  style: XMLSectionStyle | undefined,
): XMLSectionImport {
  const descriptor = new SwXTextSection(
    properties.name,
    properties.condition,
    properties.visible,
    properties.currentlyVisible,
    properties.protected,
    properties.protectionKey,
    properties.indexHeader ? SectionType.ToxHeader : SectionType.Content,
  );
  const parent = helper.GetCursor() as SwXTextCursor;
  const node = descriptor.attach(parent);
  if (style) importSectionStyle(node.GetSection().GetFormat(), style);
  return {
    /** Sets the imported FileLink and LinkRegion properties. @param source - Original section source values. @returns Nothing. */
    setSource(source: XMLSectionSource): void {
      descriptor.SetFileLink(source.url, source.filter, source.region);
    },
    end: pushSectionCursor(helper, node, parent),
  };
}

/** Enters a connected section and returns the native text import completion operation. @param helper - Shared dispatcher. @param node - New section. @param parent - Original text cursor. @returns Completion callback. */
export function pushSectionCursor(
  helper: XMLTextImportHelper,
  node: SwSectionNode,
  parent: SwXTextCursor,
): (hasContent: boolean) => void {
  const atStart = new SwPosition(node.GetNodes().at(node.GetIndex() + 1), 0);
  const range = new SwPaM(atStart);
  let cursor: SwXTextCursor;
  try {
    cursor = new SwXTextCursor(range, parent.getText());
  } finally {
    range.Dispose();
    atStart.Dispose();
  }
  helper.PushSectionCursor(cursor);
  return /** Removes the import terminator after successfully reading section text. @param hasContent - Whether a supported text child was read. @returns Nothing. */ (
    hasContent,
  ) => {
    const trailing = cursor.GetPaM().GetPoint().GetNode().GetTextNode();
    helper.PopSectionCursor();
    if (hasContent && trailing?.Len() === 0 && trailing.GetIndex() > node.GetIndex() + 1)
      node.GetNodes().RemoveNode(trailing.GetIndex(), 1, true);
  };
}

/** Projects a section's connected native state to the XML exporter. @param node - Native section node. @param content - Projected child blocks. @returns Shared ODF export values. */
export function exportTextSection(
  node: SwSectionNode,
  content: readonly XMLTextExportBlock[],
): XMLSectionExportSource {
  const section = node.GetSection();
  const data = section.GetSectionData();
  const format = section.GetFormat();
  const items = format.GetAttrSet();
  const spacing = items.GetItemIfSet(RES_LR_SPACE, false) ? format.GetLRSpace(false) : undefined;
  const source = SwXTextSection.GetFileLink(data);
  return {
    name: data.name,
    condition: data.condition,
    visible: !data.hidden,
    currentlyVisible: !data.condHidden,
    protected: section.IsProtect(),
    protectionKey: data.password,
    ...(source ? { source } : {}),
    ...(data.type === SectionType.ToxHeader ? { indexHeader: true } : {}),
    style: {
      ...exportFrameVisualProperties(items),
      marginLeft: spacing?.ResolveLeft(),
      marginRight: spacing?.ResolveRight(),
    },
    content,
  };
}
