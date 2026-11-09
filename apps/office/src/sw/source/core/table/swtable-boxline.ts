/** @fileoverview Owns original SwTableBox and SwTableLine classes from swtable.cxx, physically separated for the authored-file size limit. */
import { FindPreviousBoxInLine, FindPreviousBoxInBox } from "../doc/tblrwcl";
import type { SwTableBoxStartNode, SwTableNode } from "../docnode/node";
import { SwRowFrame, SwCellFrame } from "../layout/tabfrm";
import { TableLineFormatChanged, TableBoxFormatChanged } from "../../../inc/hints";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwFormatFrameSize } from "../../../inc/fmtfsize";
import type { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwClient, SwIterator } from "../../../inc/calbck";
import {
  SwTableLineFormat,
  SwTableBoxFormat as SwNativeTableBoxFormat,
} from "../../../inc/swtblfmt";
import { SfxItemState } from "../../../../svl/source/items/itemset";
import {
  RES_BOXATR_FORMULA,
  RES_BOXATR_VALUE,
  RES_VERT_ORIENT,
  RES_FRM_SIZE,
  RES_ROW_SPLIT,
  RES_BOX,
} from "../../../inc/hintids";
import type { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import type { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import type { SwTable, SwTableBoxFormat, SwTableLineFormatValue } from "./swtable";

/** Owns either one native content-cell section or anonymous nested lines. */
export class SwTableBox extends SwClient {
  private readonly lines: SwTableLine[] = [];
  private startNode: SwTableBoxStartNode | null;
  private upper: SwTableLine | null;
  private mnRowSpan = 1;
  /** Native leaf or anonymous-box constructor: a line count reserves capacity without creating lines or a text section. @param format - Actual box format. @param startOrLines - Real cell start, or native anonymous-box line capacity. @param upper - Actual containing row. @returns Nothing. */
  public constructor(
    format: SwNativeTableBoxFormat,
    startOrLines: SwTableBoxStartNode | number,
    upper: SwTableLine | null = null,
  ) {
    super();
    this.startNode = typeof startOrLines === "number" ? null : startOrLines;
    this.upper = upper;
    if (this.startNode && format.GetDoc() !== this.startNode.GetDoc())
      throw new Error("Writer cell format belongs to another document.");
    this.RegisterToModify(this.CheckBoxFormat(format));
    if (this.startNode) {
      const table = this.startNode.FindTableNode();
      if (!table) throw new Error("assert(content box belongs to a table)");
      table.GetTable().GetTabSortBoxes().insert(this);
    }
  }
  /** Original RemoveFromTable erases only this actual pointer and clears its content start once. @returns Nothing. */
  public RemoveFromTable(): void {
    if (!this.startNode) return;
    const table = this.startNode.FindTableNode();
    if (!table) throw new Error("assert(content box belongs to a table)");
    const boxes = table.GetTable().GetTabSortBoxes(),
      index = boxes.find(this);
    if (index >= 0) boxes.erase_at(index);
    this.startNode = null;
  }
  /** Original DelBoxNode friend access used only by table destruction. @returns Nothing. */
  public SourceClearStartNode(): void {
    this.startNode = null;
  }
  /** Original content-start index returns zero for anonymous/removed boxes. @returns Native node offset. */
  public GetSttIdx(): number {
    return this.startNode ? this.startNode.GetIndex() : 0;
  }
  /** Original signed row span. Covered cells have a negative value. @returns Native row span. */
  public getRowSpan(): number {
    return this.mnRowSpan;
  }
  /** Assigns the original signed row span. @param span - Native row span. @returns Nothing. */
  public setRowSpan(span: number): void {
    this.mnRowSpan = span | 0;
  }
  /** Original empty-cell test for one ordinary text node or source marker-only content. @returns Whether the represented leaf cell is empty. */
  public IsEmpty(): boolean {
    const start = this.startNode;
    if (start === null || start.GetIndex() + 2 !== start.EndOfSectionIndex()) return false;
    const text = start
      .GetNodes()
      .at(start.GetIndex() + 1)
      .GetTextNode()
      ?.GetText();
    return text === "" || text === "\u0001\u0001";
  }
  /** Original borrowed upper row. @returns Actual row or null. */
  public GetUpper(): SwTableLine | null {
    return this.upper;
  }
  /** Original direct upper-row assignment. @param upper - Actual new row or null. @returns Nothing. */
  public SetUpper(upper: SwTableLine | null): void {
    this.upper = upper;
  }
  /** Original nested-row vector. @returns Actual owned lines, empty for content boxes. */
  public GetTabLines(): readonly SwTableLine[] {
    return this.lines;
  }
  /** TypeScript mutation boundary for the original owned line vector. @param line - Actual nested line. @param index - Original vector insertion coordinate. @returns Nothing. */
  public AddLine(line: SwTableLine, index = this.lines.length): void {
    line.SetUpper(this);
    this.lines.splice(index, 0, line);
  }
  /** Original vector erase transfers ownership without destroying the line or changing its upper pointer. @param line - Actual contained row. @returns Nothing. */
  public RemoveLine(line: SwTableLine): void {
    const index = this.lines.indexOf(line);
    if (index < 0) throw new Error("assert(nested line belongs to box)");
    this.lines.splice(index, 1);
  }
  /** Keeps direct value/formula owners exclusive at native box construction. @param format - Requested owner. @returns Admitted native format. */
  private CheckBoxFormat(format: SwNativeTableBoxFormat): SwNativeTableBoxFormat {
    const items = format.GetAttrSet();
    if (
      (items.GetItemState(RES_BOXATR_VALUE, false) === SfxItemState.SET ||
        items.GetItemState(RES_BOXATR_FORMULA, false) === SfxItemState.SET) &&
      format.GetTableBox() !== undefined
    ) {
      const copy = format.GetDoc().MakeTableBoxFormat();
      copy.LockModify();
      try {
        copy.CopyFormatFrom(format);
        copy.ResetFormatAttr(RES_BOXATR_FORMULA);
        copy.ResetFormatAttr(RES_BOXATR_VALUE);
      } finally {
        copy.UnlockModify();
      }
      return copy;
    }
    return format;
  }
  /** Reads original registered native owner. @returns Native box format. */
  public GetFrameFormat(): SwNativeTableBoxFormat {
    return this.GetRegisteredIn() as SwNativeTableBoxFormat;
  }
  /** Claims exclusive native cell ownership before modification. @returns Original or independently copied owner. */
  public ClaimFrameFormat(): SwNativeTableBoxFormat {
    const original = this.GetFrameFormat();
    let shared = false;
    for (const client of new SwIterator(SwClient, original)) {
      if (client instanceof SwTableBox && client !== this) {
        shared = true;
        break;
      }
      continue;
    }
    if (!shared) return original;
    const copy = original.GetDoc().MakeTableBoxFormat();
    copy.LockModify();
    try {
      copy.CopyFormatFrom(original);
      copy.ResetFormatAttr(RES_BOXATR_FORMULA);
      copy.ResetFormatAttr(RES_BOXATR_VALUE);
    } finally {
      copy.UnlockModify();
    }
    for (const client of new SwIterator(SwClient, original)) {
      if (client instanceof SwCellFrame && client.GetTabBox() === this)
        client.RegisterToFormat(copy);
      continue;
    }
    this.RegisterToModify(copy);
    return copy;
  }
  /** Emits the native change hint before box registration. @param format - New same-document owner. @param needToReregister - Native loading notification flag. @returns Nothing. */
  public ChgFrameFormat(format: SwNativeTableBoxFormat, needToReregister = true): void {
    const original = this.GetFrameFormat();
    if (format.GetDoc() !== original.GetDoc())
      throw new Error("Writer cell format belongs to another document.");
    if (needToReregister) original.CallSwClientNotify(new TableBoxFormatChanged(format, this));
    this.RegisterToModify(format);
    if (!original.HasWriterListeners()) original.DisposeModify();
  }
  /** Releases owned nested lines and the original box client, deleting only a final-client format. @returns Nothing. */
  public override Dispose(): void {
    const format = this.GetRegisteredIn();
    if (format && !this.GetFrameFormat().GetDoc().IsInDtor()) this.RemoveFromTable();
    super.Dispose();
    if (format !== undefined && !format.HasWriterListeners()) format.DisposeModify();
    for (const line of this.lines.splice(0)) line.Dispose();
  }
  /** Original tblrwcl.cxx predecessor lookup uses this actual upper line and nested owned lines. @param table - Actual owning table. @param search - Original optional search pointer, null returns this leaf. @returns Actual predecessor or null. */
  public FindPreviousBox(table: SwTable, search: SwTableBox | null): SwTableBox | null {
    return FindPreviousBoxInBox(this, table, search);
  }

  /** Original GetSttNd borrows the cell's actual section owner. @returns Actual content start or null for an anonymous box. */
  public GetSttNd(): SwTableBoxStartNode | null {
    return this.startNode;
  }
  /** Existing required-leaf binding asserts the original nullable start. @returns Section start. */
  public GetStartNode(): SwTableBoxStartNode {
    if (!this.startNode) throw new Error("assert(content box has a start node)");
    return this.startNode;
  }
  /** Copies direct items only for construction/transport. @returns Independent boundary values. */
  public GetFormat(): SwTableBoxFormat {
    const items = this.GetFrameFormat().GetAttrSet(),
      box = items.GetItemIfSet(RES_BOX, false) as SvxBoxItem | undefined,
      frameSize = items.GetItemIfSet(RES_FRM_SIZE, false) as SwFormatFrameSize | undefined,
      vertOrient = items.GetItemIfSet(RES_VERT_ORIENT, false) as SwFormatVertOrient | undefined;
    return {
      ...(box === undefined ? {} : { box: box.Clone() }),
      ...(frameSize === undefined ? {} : { frameSize: frameSize.Clone() }),
      ...(vertOrient === undefined ? {} : { vertOrient: vertOrient.Clone() }),
    };
  }
  /** Replaces boundary values while retaining absent width and complete other native attributes. @param value - Construction/transport input. @returns Nothing. */
  public SetFormat(value: SwTableBoxFormat): void {
    const format = this.ClaimFrameFormat();
    format.ResetFormatAttr(RES_BOX);
    format.ResetFormatAttr(RES_VERT_ORIENT);
    if (value.box !== undefined) format.SetFormatAttr(value.box);
    if (value.frameSize !== undefined) format.SetFormatAttr(value.frameSize);
    if (value.vertOrient !== undefined) format.SetFormatAttr(value.vertOrient);
  }
  /** Copies the effective size for independent width editing. @returns Complete independent item. */
  public GetFrameSize(): SwFormatFrameSize {
    return this.GetFrameFormat().GetFrameSize().Clone();
  }
  /** Writes a complete item directly into a claimed native format. @param value - Borrowed native size. @returns Nothing. */
  public SetFrameSize(value: SwFormatFrameSize): void {
    this.ClaimFrameFormat().SetFormatAttr(value);
  }
  /** Copies the effective box for independent edge editing. @returns Complete independent item. */
  public GetBox(): SvxBoxItem {
    return this.GetFrameFormat().GetBox().Clone();
  }
  /** Copies effective orientation for independent editing. @returns Complete item. */
  public GetVertOrient(): SwFormatVertOrient {
    return this.GetFrameFormat().GetVertOrient().Clone();
  }
  /** Traverses direct cell content in native node order, preserving nested table boundaries. @returns Direct paragraph and table nodes. */
  public GetContentNodes(): readonly (SwTextNode | SwTableNode)[] {
    const start = this.GetStartNode();
    return start.GetNodes().GetSectionContent(start);
  }
  /** Reads the cell's current native node-array section, including split/join history changes. @returns Text nodes in document order. */
  public GetParagraphs(): readonly SwTextNode[] {
    const start = this.GetStartNode(),
      nodes = start.GetNodes();
    return nodes
      .entries()
      .slice(start.GetIndex() + 1, start.EndOfSectionNode().GetIndex())
      .filter(
        /** Selects actual cell text owners. @param node - Section member. @returns Whether text. */
        (node): node is SwTextNode => node instanceof SwTextNode,
      );
  }
}

/** Owns one ordered set of Writer table cells and row geometry. */
export class SwTableLine extends SwClient {
  private readonly boxes: SwTableBox[] = [];

  private upper: SwTableBox | null;
  /** Registers a native row without constructing reserved boxes. @param format - Actual row format. @param boxes - Native reserve capacity. @param upper - Actual containing box, null for base rows. @returns Nothing. */
  public constructor(format: SwTableLineFormat, boxes = 0, upper: SwTableBox | null = null) {
    super();
    this.upper = upper;
    void boxes; // Native reserve does not construct cells.
    this.RegisterToModify(format);
  }
  /** Original borrowed containing box, null for base lines. @returns Actual upper box. */
  public GetUpper(): SwTableBox | null {
    return this.upper;
  }
  /** Original direct upper assignment. @param upper - New borrowed box. @returns Nothing. */
  public SetUpper(upper: SwTableBox | null): void {
    this.upper = upper;
  }
  /** Original tblrwcl.cxx predecessor algorithm traverses actual base/nested rows and anonymous boxes. @param table - Actual table. @param search - Optional box search pointer. @param overTableLines - Original true default. @returns Previous actual leaf box or null. */
  public FindPreviousBox(
    table: SwTable,
    search: SwTableBox | null = null,
    overTableLines = true,
  ): SwTableBox | null {
    return FindPreviousBoxInLine(this, table, search, overTableLines);
  }

  /** Reads the original shared native format. @returns Registered format. */
  public GetFrameFormat(): SwTableLineFormat {
    return this.GetRegisteredIn() as SwTableLineFormat;
  }
  /** Makes this line the exclusive row client before mutation. @returns Owned native format. */
  public ClaimFrameFormat(): SwTableLineFormat {
    const original = this.GetFrameFormat();
    let shared = false;
    for (const client of new SwIterator(SwClient, original)) {
      if (client instanceof SwTableLine && client !== this) {
        shared = true;
        break;
      }
      continue;
    }
    if (!shared) return original;
    const copy = original.GetDoc().MakeTableLineFormat();
    copy.LockModify();
    try {
      copy.CopyFormatFrom(original);
    } finally {
      copy.UnlockModify();
    }
    for (const client of new SwIterator(SwClient, original)) {
      if (client instanceof SwRowFrame && client.GetTabLine() === this)
        client.RegisterToFormat(copy);
      continue;
    }
    this.RegisterToModify(copy);
    return copy;
  }
  /** Moves the original row registration to another same-document format. @param format - Replacement native owner. @returns Nothing. */
  public ChgFrameFormat(format: SwTableLineFormat): void {
    if (format.GetDoc() !== this.GetFrameFormat().GetDoc())
      throw new Error("Writer row format belongs to another document.");
    const original = this.GetFrameFormat();
    original.CallSwClientNotify(new TableLineFormatChanged(format, this));
    this.RegisterToModify(format);
    if (!original.HasWriterListeners()) original.DisposeModify();
  }
  /** Destroys owned boxes before ending the row client lifetime, preserving surviving format peers. @returns Nothing. */
  public override Dispose(): void {
    for (const box of this.boxes.splice(0)) box.Dispose();
    const format = this.GetRegisteredIn();
    super.Dispose();
    if (format !== undefined && !format.HasWriterListeners()) format.DisposeModify();
  }
  /** Exposes authored row values only at explicit construction and transport boundaries. @returns Independent direct values. */
  public GetFormat(): SwTableLineFormatValue {
    const items = this.GetFrameFormat().GetAttrSet(),
      size = items.GetItemIfSet(RES_FRM_SIZE, false) as SwFormatFrameSize | undefined,
      split = items.GetItemIfSet(RES_ROW_SPLIT, false) as SwFormatRowSplit | undefined;
    return {
      ...(size === undefined ? {} : { frameSize: size.Clone() }),
      ...(split === undefined ? {} : { rowSplit: split.Clone() }),
    };
  }
  /** Replaces direct row values at the explicit builder boundary. @param value - New authored values. @returns Nothing. */
  public SetFormat(value: SwTableLineFormatValue): void {
    const format = this.ClaimFrameFormat();
    format.ResetAllFormatAttr();
    if (value.frameSize !== undefined) format.SetFormatAttr(value.frameSize);
    if (value.rowSplit !== undefined) format.SetFormatAttr(value.rowSplit);
  }
  /** Reads an independent effective native row split, including the inherited true default. @returns Concrete item. */
  public GetRowSplit(): SwFormatRowSplit {
    return this.GetFrameFormat().GetRowSplit().Clone();
  }
  /** Reads complete independent native frame size, including inherited defaults. @returns Concrete item. */
  public GetFrameSize(): SwFormatFrameSize {
    return this.GetFrameFormat().GetFrameSize().Clone();
  }

  /** Adds a cell to this row. @param box - Canonical cell. @param index - Native insertion coordinate. @returns Nothing. */
  public AddBox(box: SwTableBox, index = this.boxes.length): void {
    box.SetUpper(this);
    this.boxes.splice(index, 0, box);
  }

  /** Removes one connected original box during native history. @param box - Actual box. @returns Nothing. */
  public RemoveBox(box: SwTableBox): void {
    const index = this.boxes.indexOf(box);
    if (index < 0) throw new Error("Writer table box is not connected.");
    this.boxes.splice(index, 1);
  }

  /** Returns ordered cells. @returns Cell view. */
  public GetTabBoxes(): readonly SwTableBox[] {
    return this.boxes;
  }
}
