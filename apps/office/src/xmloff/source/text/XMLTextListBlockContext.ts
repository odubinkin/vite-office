/** @fileoverview Owns native nested list block references and pending restart inheritance/return. */
import { FastAttributeList, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import type { XMLTextImportTarget, XMLTextListRule } from "./txtparai";
import type { XMLTextListsHelper } from "./txtlists";
import { XMLTextListItemContext } from "./XMLTextListItemContext";

/** Imports one text:list and resolves its rule through the document-facing target. */
export class XMLTextListBlockContext extends SvXMLImportContext {
  public readonly level: number;
  public readonly listId: string;
  private readonly continueListId: string;
  public readonly rule: XMLTextListRule;
  public readonly styleName: string;
  private readonly parent: XMLTextListBlockContext | undefined;
  private restartNumbering = false;

  /** Resolves a list context. @param target - Writer target. @param attributes - List attributes. @param state - Stream identity state. @param restartAtSubList - Native second/later sublist restart signal. @returns Context. */
  public constructor(
    private readonly target: XMLTextImportTarget,
    attributes: FastAttributeList,
    private readonly textLists: XMLTextListsHelper,
    restartAtSubList = false,
  ) {
    super();
    this.parent = textLists.ListContextTop()?.block as XMLTextListBlockContext | undefined;
    const parent = this.parent;
    this.restartNumbering =
      parent === undefined ? false : parent.IsRestartNumbering() || restartAtSubList;
    attributes.assertOnly(
      [
        XMLToken.TEXT_STYLE_NAME,
        XMLToken.TEXT_CONTINUE_LIST,
        XMLToken.TEXT_CONTINUE_NUMBERING,
        XMLToken.XML_ID,
      ],
      "list",
    );
    const continueNumbering = attributes.get(XMLToken.TEXT_CONTINUE_NUMBERING);
    if (continueNumbering !== null) this.restartNumbering = continueNumbering !== "true";
    const styleName = attributes.get(XMLToken.TEXT_STYLE_NAME) ?? parent?.styleName;
    if (styleName === undefined) throw new Error("Unsupported ODF list without a list style.");
    const rule = target.getListRule(styleName);
    if (rule === undefined) throw new Error(`Unsupported ODF list style: ${styleName}`);
    const level = parent === undefined ? 0 : parent.level + 1;
    if (level >= rule.levelCount) throw new Error("Unsupported ODF list level.");
    this.level = level;
    this.rule = rule;
    this.styleName = styleName;
    let listId = parent?.GetListId() ?? "";
    let continueListId = parent?.GetContinueListId() ?? "";
    if (parent === undefined) {
      listId = attributes.get(XMLToken.XML_ID) ?? "";
      continueListId = attributes.get(XMLToken.TEXT_CONTINUE_LIST) ?? "";
      if (listId.length === 0) listId = textLists.GenerateNewListId();
      if (continueNumbering !== null && !this.restartNumbering && continueListId.length === 0) {
        const last = textLists.GetLastProcessedListId();
        if (textLists.GetListStyleOfLastProcessedList() === styleName && last !== listId)
          continueListId = last;
      }
      if (continueListId.length !== 0) {
        if (!textLists.IsListProcessed(continueListId)) continueListId = "";
        else {
          let previous = textLists.GetContinueListIdOfProcessedList(continueListId);
          while (previous.length !== 0) {
            continueListId = previous;
            previous = textLists.GetContinueListIdOfProcessedList(continueListId);
          }
        }
      }
      if (!textLists.IsListProcessed(listId))
        textLists.KeepListAsProcessed(listId, styleName, continueListId, rule.defaultListId ?? "");
    }
    this.listId = listId;
    this.continueListId = continueListId;
    textLists.PushListContext(this);
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
          this.textLists,
          this,
          element === XMLToken.TEXT_LIST_HEADER,
        )
      : null;
  }
  /** Restores the parent block and clears its item after a sublist, as native XMLTextListBlockContext does. @returns Nothing. */
  public override endFastElement(): void {
    if (this.parent !== undefined) this.parent.restartNumbering = this.restartNumbering;
    this.textLists.PopListContext();
    this.textLists.SetListItem(undefined);
  }
  /** Returns the own root ID inherited by nested lists. @returns Raw ID. */
  public GetListId(): string {
    return this.listId;
  }
  /** Returns the resolved root continuation inherited by nested lists. @returns Master ID or empty. */
  public GetContinueListId(): string {
    return this.continueListId;
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
