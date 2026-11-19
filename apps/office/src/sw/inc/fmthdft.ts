/** @fileoverview Page header/footer pool items from fmthdft.hxx and atrfrm.cxx. */
import { SfxPoolItem } from "../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../svl/source/items/itempool";
import type { SwFrameFormat } from "../source/core/layout/atrfrm";
import { SwFrame } from "../source/core/layout/wsfrm";
import { SwClient, WriterListenerIterator } from "./calbck";
import { RES_FOOTER, RES_HEADER } from "./hintids";

/** Common frame-client behavior of the original header and footer items. */
abstract class SwFormatHeaderFooter extends SfxPoolItem {
  private readonly frameClient = new SwClient();
  private readonly m_bActive: boolean;

  /** Retains the original bool, frame pointer, or copy constructor semantics. @param which - Original item identity. @param source - Active flag, native format or source item. @returns Pool item. */
  constructor(which: number, source: boolean | SwFrameFormat | SwFormatHeaderFooter | null) {
    super(which);
    if (source instanceof SwFormatHeaderFooter) {
      this.m_bActive = source.IsActive();
      this.frameClient.StartListeningToSameModifyAs(source.frameClient);
    } else if (typeof source === "boolean") this.m_bActive = source;
    else {
      this.m_bActive = source !== null;
      if (source) this.RegisterToFormat(source);
    }
  }

  /** Borrows the frame format from the original Writer client registration. @returns Registered format or null. */
  protected GetRegisteredIn(): SwFrameFormat | null {
    return (this.frameClient.GetRegisteredIn() as SwFrameFormat | undefined) ?? null;
  }

  /** Original flag that controls automatic content creation. @returns Whether active. */
  IsActive(): boolean {
    return this.m_bActive;
  }

  /** Registers the original frame client at its actual owning format. @param format - Native owner. @returns Nothing. */
  RegisterToFormat(format: SwFrameFormat): void {
    format.Add(this.frameClient);
  }

  /** Compares WhichId, registered format identity and flag. @param other - Pool item. @returns Native equality. */
  override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatHeaderFooter &&
      this.Which() === other.Which() &&
      this.GetRegisteredIn() === other.GetRegisteredIn() &&
      this.IsActive() === other.IsActive()
    );
  }

  /** Original last-client release, with cursor correction through the document's section deletion. @returns Nothing. */
  override Dispose(): void {
    const format = this.GetRegisteredIn();
    if (!format) return;
    format.Remove(this.frameClient);
    for (const listener of new WriterListenerIterator(format))
      if (!(listener instanceof SwFrame)) return;
    const doc = format.GetDoc();
    if (!doc.IsInDtor()) {
      const content = format.GetContent(false);
      const start = content.GetContentIdx()?.GetNode();
      if (start) {
        content.SetNewContentIdx(null);
        const undo = doc.GetUndoManager();
        const enabled = undo.DoesUndo();
        undo.DoUndo(false);
        try {
          doc.GetDocumentContentOperationsManager().DeleteSection(start);
        } finally {
          undo.DoUndo(enabled);
        }
      }
    }
    format.DisposeModify();
  }
}

/** Original page header value and registration. */
export class SwFormatHeader extends SwFormatHeaderFooter {
  /** Constructs the inactive default or a native active/registered item. @param source - Activation flag, native frame or copied item. @returns Header item. */
  constructor(source: boolean | SwFrameFormat | SwFormatHeader | null = false) {
    super(RES_HEADER, source);
  }

  /** Original frame-format accessor. @returns Borrowed header frame. */
  GetHeaderFormat(): SwFrameFormat | null {
    return this.GetRegisteredIn();
  }

  /** Copies the flag and registers another client at the same format. @param pool - Unused native pool. @returns Copied header item. */
  override Clone(pool?: SfxItemPool): SwFormatHeader {
    void pool;
    return new SwFormatHeader(this);
  }
}

/** Original page footer value and registration. */
export class SwFormatFooter extends SwFormatHeaderFooter {
  /** Constructs the inactive default or a native active/registered item. @param source - Activation flag, native frame or copied item. @returns Footer item. */
  constructor(source: boolean | SwFrameFormat | SwFormatFooter | null = false) {
    super(RES_FOOTER, source);
  }

  /** Original frame-format accessor. @returns Borrowed footer frame. */
  GetFooterFormat(): SwFrameFormat | null {
    return this.GetRegisteredIn();
  }

  /** Copies the flag and registers another client at the same format. @param pool - Unused native pool. @returns Copied footer item. */
  override Clone(pool?: SfxItemPool): SwFormatFooter {
    void pool;
    return new SwFormatFooter(this);
  }
}
