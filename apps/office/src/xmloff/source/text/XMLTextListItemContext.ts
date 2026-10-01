/** @fileoverview Owns native item start/marker consumption and the repeated-sublist count. */
import { FastAttributeList, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { XMLParaContext, type XMLTextImportTarget } from "./txtparai";
import type { XMLTextListsHelper } from "./txtlists";
import { XMLTextListBlockContext } from "./XMLTextListBlockContext";

/** Owns the native numbered-item signal while paragraph contexts mutate Writer directly. */
export class XMLTextListItemContext extends SvXMLImportContext {
  private readonly startValue: number | undefined;
  private subListCount = 0;

  /** Creates a list-item context. @param target - Writer target. @param attributes - Item attributes. @param state - Stream list state. @param active - Active list. @param header - Whether this is a header without a numbered-item signal. @returns Context. */
  public constructor(
    private readonly target: XMLTextImportTarget,
    attributes: FastAttributeList,
    private readonly textLists: XMLTextListsHelper,
    private readonly active: XMLTextListBlockContext,
    header: boolean,
  ) {
    super();
    attributes.assertOnly([XMLToken.TEXT_START_VALUE], "list item");
    if (!header) {
      const startValue = attributes.getAsInteger(XMLToken.TEXT_START_VALUE);
      if (startValue !== null && startValue >= 0 && startValue <= 32_767)
        this.startValue = startValue;
      textLists.SetListItem(this);
    }
  }
  /** Returns the explicit start retained only for ordinary items. @returns Start value. */
  public GetStartValue(): number | undefined {
    return this.startValue;
  }
  /** Clears the numbered item after its container ends. @returns Nothing. */
  public override endFastElement(): void {
    this.textLists.SetListItem(undefined);
  }

  /** Creates paragraph or nested-list children. @param element - Child token. @param attributes - Attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.TEXT_P || element === XMLToken.TEXT_H) {
      const item = this.textLists.ListContextTop()?.item;
      const startValue = item?.GetStartValue();
      const restart = this.active.IsRestartNumbering() || startValue !== undefined;
      this.active.ResetRestartNumbering();
      this.textLists.SetListItem(undefined);
      return new XMLParaContext(this.target, element, attributes, {
        level: this.active.level,
        listId: this.textLists.GetListIdForListBlock(this.active),
        ...(item === undefined ? { counted: false } : {}),
        ...(restart ? { restart: true } : {}),
        ...(startValue === undefined ? {} : { startValue }),
        ruleName: this.active.rule.name,
      });
    }
    if (element === XMLToken.TEXT_LIST) {
      // Native ++sal_Int16 narrows the incremented value at assignment.
      this.subListCount = ((this.subListCount + 1) << 16) >> 16;
      return new XMLTextListBlockContext(
        this.target,
        attributes,
        this.textLists,
        this.subListCount > 1,
      );
    }
    return null;
  }
}
