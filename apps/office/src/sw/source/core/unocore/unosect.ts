/** @fileoverview Writer UNO descriptor attachment for an ordinary text section from unosect.cxx. */
import type { SwSectionNode } from "../docnode/ndsect";
import { SectionType, SwSectionData } from "../docnode/section";
import type { SwXTextRange } from "./unoobj2";

const tokenSeparator = "\uffff";

/** Native text-section descriptor with the original UNO property defaults. */
export class SwXTextSection {
  private node: SwSectionNode | undefined;

  /** Creates a descriptor before it is attached to actual Writer text. @param name - Section name. @param condition - Writer visibility expression. @param visible - Section visibility property. @param currentlyVisible - Stored conditional visibility. @param protectedContent - Original content protection flag. @param protectionKey - Native digest sequence. @returns Text-section descriptor. */
  public constructor(
    private readonly name = "",
    private readonly condition = "",
    private readonly visible = true,
    private readonly currentlyVisible = true,
    private readonly protectedContent = false,
    private readonly protectionKey: Uint8Array = new Uint8Array(),
  ) {}

  /** Attaches the descriptor at the paragraph boundary used by the streaming text importer. @param range - Native insertion cursor. @returns Connected section. */
  public attach(range: SwXTextRange): SwSectionNode {
    if (this.node) throw new Error("Writer text section is already attached.");
    const selection = range.GetPaM();
    const point = selection.GetPoint();
    const text = point.GetNode().GetTextNode();
    if (selection.HasMark() || point.GetContentIndex() !== 0 || !text)
      throw new Error("Writer text section requires a paragraph insertion boundary.");
    const doc = text.GetDoc();
    const data = new SwSectionData(
      SectionType.Content,
      doc.GetUniqueSectionName(this.name || "TextSection"),
    );
    data.condition = this.condition;
    data.hidden = !this.visible;
    if (this.condition) data.condHidden = !this.currentlyVisible;
    data.password = this.protectionKey.slice();
    const node = doc.GetNodes().InsertTextSection(text, data);
    node.GetSection().SetProtect(this.protectedContent);
    this.node = node;
    return node;
  }

  /** Sets native FileLink and LinkRegion values on the attached section. @param url - Document URL. @param filter - Native filter name. @param region - Linked section name. @returns Nothing. */
  public SetFileLink(url: string, filter: string, region: string): void {
    const data = this.node?.GetSection().GetSectionData();
    if (!data) throw new Error("Writer linked section is detached.");
    data.type = SectionType.FileLink;
    data.linkFileName = [url, filter, region].join(tokenSeparator);
  }

  /** Returns FileLink and LinkRegion from the native token-separated link name. @param data - Connected section data. @returns File link properties, if present. */
  public static GetFileLink(
    data: SwSectionData,
  ): { url: string; filter: string; region: string } | undefined {
    if (data.type !== SectionType.FileLink) return undefined;
    const [url = "", filter = "", region = ""] = data.linkFileName.split(tokenSeparator);
    return { url, filter, region };
  }
}
