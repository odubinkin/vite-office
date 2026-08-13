/**
 * @fileoverview Displays the focused Writer paragraph's implemented formatting in the durable properties sidebar without claiming unimplemented layout controls.
 */

import type { WriterParagraphAlignment, WriterParagraphStyle } from "../../core/doc/writer";
import type { WriterParagraphListKind } from "../../core/doc/list";

/** Maps serializable alignment literals to concise reader-facing property values. */
const alignmentLabels: Readonly<Record<WriterParagraphAlignment, string>> = {
  center: "Centered",
  justify: "Justified",
  left: "Left",
  right: "Right",
};

/** Maps serializable paragraph-style literals to their focused properties labels. */
const styleLabels: Readonly<Record<WriterParagraphStyle, string>> = {
  default: "Default Paragraph Style",
  "heading-1": "Heading 1",
};

/** Maps serializable list literals to concise focused properties labels. */
const listLabels: Readonly<Record<WriterParagraphListKind, string>> = {
  bullet: "Unordered List",
  none: "No List",
  numbered: "Ordered List",
};

/** Defines the focused paragraph details rendered by the Writer properties sidebar. */
export interface WriterParagraphPropertiesProps {
  /** Alignment currently applied to the focused Writer paragraph. */
  readonly alignment: WriterParagraphAlignment;
  /** One-based document position of the focused Writer paragraph. */
  readonly paragraphNumber: number;
  /** List presentation currently applied to the focused Writer paragraph. */
  readonly listKind: WriterParagraphListKind;
  /** Style currently applied to the focused Writer paragraph. */
  readonly style: WriterParagraphStyle;
}

/**
 * Renders focused paragraph formatting feedback in the Writer properties sidebar.
 *
 * @param props - Immutable selected paragraph information supplied by the Writer workbench.
 * @param props.alignment - Current horizontal alignment for the active paragraph.
 * @param props.listKind - Current default-list presentation for the active paragraph.
 * @param props.paragraphNumber - One-based visible position for the active paragraph.
 * @param props.style - Current bounded paragraph style for the active paragraph.
 * @returns A concise properties panel with no unimplemented interactive controls.
 */
export function WriterParagraphProperties({
  alignment,
  listKind,
  paragraphNumber,
  style,
}: WriterParagraphPropertiesProps): React.JSX.Element {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
        Properties
      </p>
      <h2 className="mt-1 text-base font-bold text-slate-950">Paragraph</h2>
      <p className="mt-1 text-sm text-slate-600">Paragraph {paragraphNumber} is active.</p>
      <dl className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Alignment
        </dt>
        <dd className="mt-1 text-sm font-bold text-slate-900">{alignmentLabels[alignment]}</dd>
        <dt className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Style
        </dt>
        <dd className="mt-1 text-sm font-bold text-slate-900">{styleLabels[style]}</dd>
        <dt className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          List
        </dt>
        <dd className="mt-1 text-sm font-bold text-slate-900">{listLabels[listKind]}</dd>
      </dl>
      <p className="mt-5 text-sm leading-6 text-slate-600">
        Indents, spacing, text flow, and character formatting are separate Writer features.
      </p>
    </>
  );
}
