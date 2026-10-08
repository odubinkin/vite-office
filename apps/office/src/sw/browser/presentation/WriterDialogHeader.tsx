/** @fileoverview Shared Open-document-style heading for Writer modal panels. */
import type { ReactNode } from "react";
import { X } from "lucide-react";

/** Presents the modal title and a non-submitting close action. @param props - Heading content and cancellation handler. @returns Dialog header. */
export function WriterDialogHeader({
  title,
  description,
  onClose,
}: Readonly<{
  title: ReactNode;
  description?: string;
  onClose: () => void;
}>): React.JSX.Element {
  return (
    <div className="writer-dialog-header flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        {description === undefined ? null : (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      <button
        aria-label="Close"
        className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-indigo-600"
        onClick={onClose}
        type="button"
      >
        <X aria-hidden="true" className="h-5 w-5" />
      </button>
    </div>
  );
}
