/** @fileoverview Owns native nested list block references and pending restart inheritance/return. */
import { FastAttributeList, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import type { XMLTextImportTarget, XMLTextListRule } from "./txtparai";
import type { XMLTextListImportState } from "./txtlists";
import { XMLTextListItemContext } from "./XMLTextListItemContext";

/** Imports one text:list and resolves its rule through the document-facing target. */
export class XMLTextListBlockContext extends SvXMLImportContext {
  public readonly level: number;
  public readonly listId: string;
  public readonly rule: XMLTextListRule;
  public readonly styleName: string;
  private readonly parent: XMLTextListBlockContext | undefined;
  private restartNumbering = false;

  /** Resolves a list context. @param target - Writer target. @param attributes - List attributes. @param state - Stream identity state. @param restartAtSubList - Native second/later sublist restart signal. @returns Context. */
  public constructor(
    private readonly target: XMLTextImportTarget,
    attributes: FastAttributeList,
    private readonly state: XMLTextListImportState,
    restartAtSubList = false,
  ) {
    super();
    this.parent = state.textLists.ListContextTop()?.block as XMLTextListBlockContext | undefined;
    const parent = this.parent;
    this.restartNumbering =
      parent === undefined ? false : parent.IsRestartNumbering() || restartAtSubList;
    attributes.assertOnly(
      [XMLToken.TEXT_STYLE_NAME, XMLToken.TEXT_CONTINUE_LIST, XMLToken.XML_ID],
      "list",
    );
    const styleName = attributes.get(XMLToken.TEXT_STYLE_NAME) ?? parent?.styleName;
    if (styleName === undefined) throw new Error("Unsupported ODF list without a list style.");
    const rule = target.getListRule(styleName);
    if (rule === undefined) throw new Error(`Unsupported ODF list style: ${styleName}`);
    const level = parent === undefined ? 0 : parent.level + 1;
    if (level >= rule.levelCount) throw new Error("Unsupported ODF list level.");
    const xmlId = attributes.get(XMLToken.XML_ID);
    const continuedId = attributes.get(XMLToken.TEXT_CONTINUE_LIST);
    let listId = parent?.listId;
    if (continuedId !== null) listId = state.listIds.get(continuedId) ?? continuedId;
    else if (xmlId !== null) listId = xmlId;
    else if (listId === undefined) listId = `${rule.name}-${++state.generatedListId}`;
    if (xmlId !== null) state.listIds.set(xmlId, listId);
    this.level = level;
    this.listId = listId;
    this.rule = rule;
    this.styleName = styleName;
    state.textLists.PushListContext(this);
  }

  /** Creates a list-item context. @param element - Child token. @param attributes - Attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    return element === XMLToken.TEXT_LIST_ITEM || element === XMLToken.TEXT_LIST_HEADER
      ? new XMLTextListItemContext(
          this.target,
          attributes,
          this.state,
          this,
          element === XMLToken.TEXT_LIST_HEADER,
        )
      : null;
  }
  /** Restores the parent block and clears its item after a sublist, as native XMLTextListBlockContext does. @returns Nothing. */
  public override endFastElement(): void {
    if (this.parent !== undefined) this.parent.restartNumbering = this.restartNumbering;
    this.state.textLists.PopListContext();
    this.state.textLists.SetListItem(undefined);
  }
  /** Reports the pending native block restart. @returns Restart state. */
  public IsRestartNumbering(): boolean {
    return this.restartNumbering;
  }
  /** Consumes the pending block restart on the first paragraph. @returns Nothing. */
  public ResetRestartNumbering(): void {
    this.restartNumbering = false;
  }
}
