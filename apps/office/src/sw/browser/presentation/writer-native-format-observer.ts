/** @fileoverview Connects browser presentation to original Writer format Svt notifiers without adding Writer clients. */
import { SvtListener, type SvtDyingHint } from "../../../svl/source/notify/listener";
import type { SwModelHint } from "../../inc/hints";
import type { SwFormat } from "../../source/core/attr/format";
import type { SwView } from "../../source/uibase/uiview/view";

/** Browser observer of original style, table, row and cell formats. It owns registrations, never model or layout copies. */
export class WriterNativeFormatObserver extends SvtListener<SwModelHint> {
  private formats = new Set<SwFormat>();

  /** Connects to one live native view. @param view - Original Writer view. @returns Nothing. */
  public constructor(private readonly view: SwView) {
    super();
    this.Sync();
  }

  /** Reconciles subscriptions with actual document owners after structural, history or replacement invalidation. @returns Nothing. */
  public Sync(): void {
    const doc = this.view.GetDocShell().GetDoc();
    const formats = new Set<SwFormat>(doc.GetTextFormatColls());
    for (const table of doc.GetTables()) {
      formats.add(table.GetFrameFormat());
      for (const row of table.GetTabLines()) {
        formats.add(row.GetFrameFormat());
        for (const box of row.GetTabBoxes()) formats.add(box.GetFrameFormat());
      }
    }
    for (const format of this.formats)
      if (!formats.has(format)) this.EndListening(format.GetNotifier());
    for (const format of formats) this.StartListening(format.GetNotifier());
    this.formats = formats;
  }

  /** Invalidates the existing native layout and Sfx command cache from the original accepted format hint. @param hint - Original format hint. @returns Nothing. */
  public override Notify(hint: SwModelHint | SvtDyingHint): void {
    if (hint.kind === "dying") return;
    const hints = hint.kind === "model-transaction" ? hint.hints : [hint];
    for (const nested of hints)
      if (
        nested.kind === "table-line-format-changed" ||
        nested.kind === "table-box-format-changed" ||
        nested.kind === "move-table-line" ||
        nested.kind === "move-table-box"
      ) {
        this.StartListening(nested.m_rNewFormat.GetNotifier());
        this.formats.add(nested.m_rNewFormat);
      }
    if (
      !hints.some(
        /** Selects original format item and inheritance changes, excluding intermediate ownership moves. @param nested - Original atomic hint. @returns Whether presentation changes. */
        (nested) =>
          nested.kind === "attr-set-change" || nested.kind === "format-inheritance-changed",
      )
    )
      return;
    this.view.GetLayout().Invalidate();
    this.view.GetViewFrame().GetBindings().Invalidate("document", "selection");
  }

  /** Releases original notifier references and all reciprocal registrations. @returns Nothing. */
  public Close(): void {
    this.EndListeningAll();
    this.formats.clear();
  }
}
