/** @fileoverview Owns original SwTableBox and SwTableLine classes from swtable.cxx, physically separated for the authored-file size limit. */
import type { SwTableBoxStartNode } from "../docnode/node";
import { SwRowFrame, SwCellFrame } from "../layout/tabfrm";
import { TableLineFormatChanged, TableBoxFormatChanged } from "../../../inc/hints";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwFormatFrameSize } from "../../../inc/fmtfsize";
import type { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwClient } from "../../../inc/calbck";
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
import type { SwTableBoxFormat, SwTableLineFormatValue } from "./swtable";

/** Owns one cell section and its ordered paragraphs. */
export class SwTableBox extends SwClient {
  /** Registers the original cell at its native format. @param format - Native owner. @param startNode - Original cell section. @returns Nothing. */
  public constructor(
    format: SwNativeTableBoxFormat,
    private readonly startNode: SwTableBoxStartNode,
  ) {
    super();
    if (format.GetDoc() !== startNode.GetDoc())
      throw new Error("Writer cell format belongs to another document.");
    this.RegisterToModify(this.CheckBoxFormat(format));
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
    original.ForAllListeners(
      /** Finds another original native cell. @param client - Native listener. @returns Whether found. */ (
        client,
      ) => {
        if (client instanceof SwTableBox && client !== this) {
          shared = true;
          return true;
        }
        return false;
      },
    );
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
    original.ForAllListeners(
      /** Moves cell frames naming this original box before model registration. @param client - Original listener. @returns Continue flag. */ (
        client,
      ) => {
        if (client instanceof SwCellFrame && client.GetTabBox() === this)
          client.RegisterToFormat(copy);
        return false;
      },
    );
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
  /** Releases the native box and deletes only a final-client format. @returns Nothing. */
  public override Dispose(): void {
    const format = this.GetRegisteredIn();
    super.Dispose();
    if (format !== undefined && !format.HasWriterListeners()) format.DisposeModify();
  }
  /** Reads original native section start. @returns Section start. */
  public GetStartNode(): SwTableBoxStartNode {
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
  /** Reads the cell's current native node-array section, including split/join history changes. @returns Text nodes in document order. */
  public GetParagraphs(): readonly SwTextNode[] {
    const nodes = this.startNode.GetNodes();
    return nodes
      .entries()
      .slice(this.startNode.GetIndex() + 1, this.startNode.EndOfSectionNode().GetIndex())
      .filter(
        /** Selects actual cell text owners. @param node - Section member. @returns Whether text. */
        (node): node is SwTextNode => node instanceof SwTextNode,
      );
  }
}

/** Owns one ordered set of Writer table cells and row geometry. */
export class SwTableLine extends SwClient {
  private readonly boxes: SwTableBox[] = [];

  /** Registers a row at its document-owned native format. @param format - Native row format. @returns Nothing. */
  public constructor(format: SwTableLineFormat) {
    super();
    this.RegisterToModify(format);
  }
  /** Reads the original shared native format. @returns Registered format. */
  public GetFrameFormat(): SwTableLineFormat {
    return this.GetRegisteredIn() as SwTableLineFormat;
  }
  /** Makes this line the exclusive row client before mutation. @returns Owned native format. */
  public ClaimFrameFormat(): SwTableLineFormat {
    const original = this.GetFrameFormat();
    let shared = false;
    original.ForAllListeners(
      /** Finds another original row client. @param client - Registered listener. @returns Whether found. */ (
        client,
      ) => {
        if (client instanceof SwTableLine && client !== this) {
          shared = true;
          return true;
        }
        return false;
      },
    );
    if (!shared) return original;
    const copy = original.GetDoc().MakeTableLineFormat();
    copy.LockModify();
    try {
      copy.CopyFormatFrom(original);
    } finally {
      copy.UnlockModify();
    }
    original.ForAllListeners(
      /** Moves frame clients bound to this original row before the row registration. @param client - Original format listener. @returns Continue flag. */
      (client) => {
        if (client instanceof SwRowFrame && client.GetTabLine() === this)
          client.RegisterToFormat(copy);
        return false;
      },
    );
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
  /** Ends original row client lifetime without touching surviving format peers. @returns Nothing. */
  public override Dispose(): void {
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
