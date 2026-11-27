/** @fileoverview Writer UNO document-index descriptor and text-bound attachment. */
import type { SwDoc } from "../doc/doc";
import type { SwSectionNode } from "../docnode/ndsect";
import { SwTOXBaseSection } from "../inc/doctxm";
import { MAXLEVEL, SwTOXBase, TOXTypes, type SwTOXMark } from "../tox/tox";
import { SwTextTOXMark } from "../txtnode/atrtox";
import type { SwXTextRange } from "./unoobj2";

/** Native contents-index service descriptor used by stream import. */
export class SwXDocumentIndex {
  private readonly descriptor: SwTOXBase;
  private section: SwTOXBaseSection | undefined;

  /** Registers the descriptor with its original document type. @param document - Native document. @param type - Index family. @returns New index descriptor. */
  public constructor(
    private readonly document: SwDoc,
    type = TOXTypes.Content,
  ) {
    this.descriptor = new SwTOXBase(document.GetTOXType(type));
  }

  /** Returns descriptor fields before attachment and connected fields afterwards. @returns Index properties. */
  public GetTOXBase(): SwTOXBase {
    return this.section?.tox ?? this.descriptor;
  }

  /** Attaches the index at the Writer paragraph boundary used by the XML reader. @param range - Native insertion cursor. @returns Attached native section. */
  public attach(range: SwXTextRange): SwSectionNode {
    const selection = range.GetPaM();
    const point = selection.GetPoint();
    const node = point.GetNode().GetTextNode();
    if (
      this.section ||
      selection.HasMark() ||
      point.GetContentIndex() !== 0 ||
      node?.GetDoc() !== this.document
    )
      throw new Error("Writer index requires an unattached paragraph insertion boundary.");
    const inserted = this.document.InsertTableOf(node, this.descriptor);
    const section = inserted.GetSection();
    if (!(section instanceof SwTOXBaseSection))
      throw new Error("Writer index section is missing its descriptor.");
    this.section = section;
    return inserted;
  }
}

const defaultUserIndexName = "User-Defined";

/** Converts a programmatic user-index name to its original document type. @param document - Owner of the default name. @param name - UNO name. @returns Native type name. */
export function getUserIndexTypeName(document: SwDoc, name: string): string {
  const defaultType = document.GetTOXType(TOXTypes.User).name;
  if (name === defaultUserIndexName) return defaultType;
  if (defaultType !== defaultUserIndexName && name === `${defaultUserIndexName} (user)`)
    return defaultUserIndexName;
  return name;
}

/** Converts a connected user-index type into its programmatic name. @param document - Original document. @param name - Type name. @returns UNO name. */
export function getUserIndexProgrammaticName(document: SwDoc, name: string): string {
  if (name === document.GetTOXType(TOXTypes.User).name) return defaultUserIndexName;
  return name === defaultUserIndexName ? `${name} (user)` : name;
}

/** Writer native index mark descriptor, attached through a real paragraph hint. */
export class SwXDocumentIndexMark {
  /** Holds the descriptor before one native attachment. @param mark - Native descriptor values. @returns UNO index mark. */
  public constructor(private readonly mark: SwTOXMark) {}

  /** Sets the native zero-based UNO level. @param level - UNO outline level. @returns Nothing. */
  public setLevel(level: number): void {
    if (!Number.isInteger(level) || level < 0 || level >= MAXLEVEL)
      throw new Error("Writer index mark outline level is out of range.");
    this.mark.level = level + 1;
  }

  /** Applies the original point/range rule and attaches the mark to the actual text node. @param range - Native selected range. @returns Connected hint or absent on native insertion failure. */
  public attach(range: SwXTextRange): SwTextTOXMark | undefined {
    const selection = range.GetPaM();
    const start = selection.Start();
    const end = selection.End();
    const text = start.GetNode().GetTextNode();
    if (!text || end.GetNode() !== start.GetNode()) return undefined;
    const item = this.mark.Clone();
    if (item.type?.type === TOXTypes.User || item.type?.type === TOXTypes.Content) item.level ||= 1;
    const first = start.GetContentIndex();
    const last = end.GetContentIndex();
    const ranged = first !== last && !item.alternativeText;
    if (!ranged && !item.alternativeText) item.alternativeText = " ";
    const hint = new SwTextTOXMark(item, first, ranged ? last : undefined);
    return text.InsertHint(hint) ? hint : undefined;
  }
}
