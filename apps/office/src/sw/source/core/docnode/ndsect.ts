/** @fileoverview Writer named text section node from ndsect.cxx. */
import { SwFormatContent } from "../../../inc/fmtcntnt";
import { RES_CNTNT } from "../../../inc/hintids";
import { SwStartNodeType } from "../../../inc/ndtyp";
import { SwStartNode } from "./node";
import type { SwNodes } from "./nodes";
import { SwTOXBaseSection } from "../inc/doctxm";
import type { SwTOXBase } from "../tox/tox";
import { SwSection, SwSectionFormat, type SwSectionData } from "./section";

/** Native start node for a named text section and owner of its SwSection. */
export class SwSectionNode extends SwStartNode {
  private readonly section: SwSection;

  /** Connects the actual Writer node, section and derived format. @param nodes - Owning array. @param parent - Containing start node. @param data - Owned section data. @param parentFormat - Nearest containing named section format. @param tox - Owned index descriptor, if this is an index. @returns New section node. */
  public constructor(
    nodes: SwNodes,
    parent: SwStartNode,
    data: SwSectionData,
    parentFormat?: SwSectionFormat,
    tox?: SwTOXBase,
  ) {
    super(nodes, parent, SwStartNodeType.SwNormalStartNode, "section");
    const format = new SwSectionFormat(nodes.GetDoc(), parentFormat);
    format.SetFormatName(data.name);
    this.section = tox ? new SwTOXBaseSection(data, format, tox) : new SwSection(data, format);
    const content = new SwFormatContent(this);
    format.LockModify();
    try {
      format.SetFormatAttr(content);
    } finally {
      format.UnlockModify();
      content.Dispose();
    }
  }

  /** Borrows the typed native section start. @returns This node. */
  public override GetSectionNode(): SwSectionNode {
    return this;
  }

  /** Resolves the section owned by the original Writer node. @returns Native section. */
  public GetSection(): SwSection {
    return this.section;
  }

  /** Releases the native format and its registered node index. @returns Nothing. */
  public override DisposeModify(): void {
    const format = this.section.GetFormat();
    format.ResetFormatAttr(RES_CNTNT);
    format.DisposeModify();
    super.DisposeModify();
  }
}
