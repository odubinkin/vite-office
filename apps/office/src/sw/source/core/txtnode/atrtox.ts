/** @fileoverview Original position-bound Writer index mark from atrtox.cxx. */
import { RES_TXTATR_TOXMARK } from "../../../inc/hintids";
import type { SwDoc } from "../doc/doc";
import type { SwTOXMark } from "../tox/tox";
import type { SwTextNode } from "./ndtxt";
import { SwTextAttrEnd } from "./txatbase";

/** A native range or single dummy-character index hint. */
export class SwTextTOXMark extends SwTextAttrEnd<SwTOXMark> {
  private node: SwTextNode | undefined;

  /** Binds the original non-shareable item and sets its native hint flags. @param format - Owned mark. @param start - Start position. @param end - End position for a range. @returns Native hint. */
  public constructor(format: SwTOXMark, start: number, end?: number) {
    super(format, start, end ?? start);
    this.SetHasDummyChar(format.alternativeText.length !== 0);
    this.SetDontMoveAttr(true);
    this.SetOverlapAllowedAttr(true);
    format.SetTextTOXMark(this);
  }

  /** Returns the original WhichId. @returns Native item type. */
  public override Which(): typeof RES_TXTATR_TOXMARK {
    return RES_TXTATR_TOXMARK;
  }

  /** A single alternative-text mark has no actual range end. @returns Native end, if present. */
  public override GetEnd(): number | undefined {
    return this.HasDummyChar() ? undefined : this.m_nEnd;
  }

  /** Connects the original text node owner. @param node - Destination paragraph or detached state. @returns Nothing. */
  public ChgTextNode(node: SwTextNode | undefined): void {
    this.node = node;
  }

  /** Reads the original paragraph owner. @returns Attached node. */
  public GetTextNode(): SwTextNode | undefined {
    return this.node;
  }

  /** Copies the original hint where the destination owns the corresponding index type. @param document - Destination document. @param offset - Position adjustment. @returns Detached native hint. */
  public CopyTOXMark(document: SwDoc, offset = 0): SwTextTOXMark {
    const mark = this.format.Clone();
    if (mark.type) mark.type = document.GetTOXType(mark.type.type, mark.type.name);
    const end = this.GetEnd();
    return new SwTextTOXMark(
      mark,
      this.GetStart() + offset,
      end === undefined ? undefined : end + offset,
    );
  }

  /** Creates a hint snapshot with the original point/range flags. @param offset - Position translation. @returns Independent hint. */
  public override clone(offset = 0): SwTextTOXMark {
    const end = this.GetEnd();
    const copy = new SwTextTOXMark(
      this.format.Clone(),
      this.GetStart() + offset,
      end === undefined ? undefined : end + offset,
    );
    this.CopyFlagsTo(copy);
    return copy;
  }
}
