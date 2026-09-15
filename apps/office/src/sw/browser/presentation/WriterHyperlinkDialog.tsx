/** @fileoverview Renders the browser counterpart of Writer's Hyperlink dialog. */

import { useEffect, useState } from "react";

import type { WriterHyperlink } from "../../source/core/txtnode/fmtinfmt";

/** Hyperlink dialog properties. */
export interface WriterHyperlinkDialogProps {
  readonly initialHyperlink?: WriterHyperlink;
  readonly onCancel: () => void;
  readonly onSubmit: (hyperlink: WriterHyperlink, text: string) => void;
}

/** Collects the bounded text-link fields supported by the Writer model. @param props - Dialog state and callbacks. @returns Accessible modal dialog. */
export function WriterHyperlinkDialog({
  initialHyperlink,
  onCancel,
  onSubmit,
}: WriterHyperlinkDialogProps): React.JSX.Element {
  const [url, setUrl] = useState(initialHyperlink?.url ?? "");
  const [text, setText] = useState("");
  const [targetFrame, setTargetFrame] = useState(initialHyperlink?.targetFrame ?? "");
  useEffect(
    /** Focuses the primary hyperlink field after the modal mounts. @returns Nothing. */ () => {
      globalThis.document.querySelector<HTMLInputElement>("#writer-hyperlink-url")?.focus();
    },
    [],
  );
  return (
    <div
      aria-label="Hyperlink"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      role="dialog"
    >
      <form
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
        onSubmit={
          /** Submits normalized hyperlink fields. @param event - Form submit event. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            const destination = url.trim();
            if (destination.length === 0) return;
            const initialWithoutTarget = { ...(initialHyperlink ?? { url: destination }) };
            delete initialWithoutTarget.targetFrame;
            onSubmit(
              {
                ...initialWithoutTarget,
                ...(targetFrame.length === 0 ? {} : { targetFrame }),
                url: destination,
              },
              text,
            );
          }
        }
      >
        <h2 className="text-lg font-bold text-slate-950">Hyperlink</h2>
        <div className="mt-4 grid gap-4">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            URL
            <input
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
              id="writer-hyperlink-url"
              onChange={
                /** Updates the destination field. @param event - Input change. @returns Nothing. */
                (event) => setUrl(event.target.value)
              }
              required
              inputMode="url"
              type="text"
              value={url}
            />
          </label>
          {initialHyperlink === undefined ? (
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Text
              <input
                className="rounded-md border border-slate-300 px-3 py-2 font-normal"
                onChange={
                  /** Updates optional inserted text. @param event - Input change. @returns Nothing. */
                  (event) => setText(event.target.value)
                }
                placeholder="Uses the URL when empty"
                value={text}
              />
            </label>
          ) : null}
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Target
            <select
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
              onChange={
                /** Updates the target frame choice. @param event - Selection change. @returns Nothing. */
                (event) => setTargetFrame(event.target.value)
              }
              value={targetFrame}
            >
              <option value="">Current frame</option>
              <option value="_blank">New window</option>
              <option value="_self">Same frame</option>
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white"
            type="submit"
          >
            Apply
          </button>
        </div>
      </form>
    </div>
  );
}
