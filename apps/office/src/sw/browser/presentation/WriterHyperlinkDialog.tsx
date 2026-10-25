/** @fileoverview Renders the browser counterpart of Writer's Hyperlink dialog. */

import { WriterDialogHeader } from "./WriterDialogHeader";
import { useEffect, useId, useRef, useState } from "react";

import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { SfxFrame } from "../../../sfx2/source/view/frame";
import { HyperlinkInternetTP } from "../../../cui/source/dialogs/hyperlinkinternettabpage";
import type { WriterHyperlink } from "../../source/core/txtnode/fmtatr2";

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
  const localization = useBrowserLocalization();
  const title = localization.GetText("writer.hyperlink.title", "Hyperlink");
  const [internet] = useState(
    /** Creates original represented entry/toggle state for this request. @returns Internet page. */ () =>
      new HyperlinkInternetTP(initialHyperlink?.url ?? ""),
  );
  const [url, setUrl] = useState(internet.GetTarget());
  const [removeQuery, setRemoveQuery] = useState(internet.IsRemoveQueryString());
  const [targets] = useState(
    /** Populates actual native target defaults once for this mounted page. @returns Default target list. */ () => {
      const values: string[] = [];
      SfxFrame.GetDefaultTargetList(values);
      return values;
    },
  );
  const targetListId = useId(),
    input = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [targetFrame, setTargetFrame] = useState(initialHyperlink?.targetFrame ?? "");
  const [name, setName] = useState(initialHyperlink?.name ?? "");
  useEffect(
    /** Focuses the primary hyperlink field after the modal mounts. @returns Nothing. */ () => {
      input.current?.focus();
    },
    [],
  );
  return (
    <div
      aria-label={title}
      aria-modal="true"
      data-writer-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      onKeyDown={
        /** Cancels this original request from its own modal. @param event - Native key. @returns Nothing. */ (
          event,
        ) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onCancel();
          }
        }
      }
      role="dialog"
    >
      <form
        data-writer-modal-panel="true"
        className="w-full max-w-md bg-white"
        onSubmit={
          /** Submits normalized hyperlink fields. @param event - Form submit event. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            const destination = url.trim();
            if (destination.length === 0) return;
            const initialWithoutTarget = { ...(initialHyperlink ?? { url: destination }) };
            delete initialWithoutTarget.targetFrame;
            delete initialWithoutTarget.name;
            onSubmit(
              {
                ...initialWithoutTarget,
                ...(targetFrame.length === 0 ? {} : { targetFrame }),
                ...(name.length === 0 ? {} : { name }),
                url: destination,
              },
              text,
            );
          }
        }
      >
        <WriterDialogHeader title={title} onClose={onCancel} />
        <div className="writer-dialog-content">
          <div className="border-b border-slate-300 pb-2 text-sm font-semibold text-indigo-700">
            Internet
          </div>
          <fieldset className="grid gap-3 border border-slate-300 p-3">
            <legend className="px-1 text-sm font-semibold">Hyperlink Settings</legend>
            {initialHyperlink === undefined ? (
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                {localization.GetText("writer.hyperlink.text", "Text")}
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 font-normal"
                  onChange={
                    /** Updates optional inserted text. @param event - Input change. @returns Nothing. */
                    (event) => setText(event.target.value)
                  }
                  placeholder={localization.GetText(
                    "writer.hyperlink.text-placeholder",
                    "Uses the URL when empty",
                  )}
                  value={text}
                />
              </label>
            ) : null}
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              {localization.GetText("writer.hyperlink.url", "Link")}
              <input
                aria-label="URL"
                className="rounded-md border border-slate-300 px-3 py-2 font-normal"
                ref={input}
                onChange={
                  /** Updates the destination field. @param event - Input change. @returns Nothing. */
                  (event) => {
                    internet.ModifiedTargetHdl_Impl(event.target.value);
                    setUrl(internet.GetTarget());
                  }
                }
                required
                inputMode="url"
                type="text"
                value={url}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={removeQuery}
                onChange={
                  /** Applies the source checkbox immediately;unchecking does not restore deleted text. @param event - Native toggle. @returns Nothing. */ (
                    event,
                  ) => {
                    internet.ClickRemoveQueryStringHdl_Impl(event.target.checked);
                    setRemoveQuery(internet.IsRemoveQueryString());
                    setUrl(internet.GetTarget());
                  }
                }
              />
              {localization.GetText(
                "hyperlinkinternetpage.removequerystring",
                "Remove query string",
              )}
            </label>
          </fieldset>
          <fieldset className="grid gap-3 border border-slate-300 p-3">
            <legend className="px-1 text-sm font-semibold">Further Settings</legend>
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              {localization.GetText("writer.hyperlink.target", "Frame")}
              <input
                aria-label="Target"
                list={targetListId}
                className="rounded-md border border-slate-300 px-3 py-2 font-normal"
                value={targetFrame}
                onChange={
                  /** Retains native editable target text,including custom frame names. @param event - Actual entry. @returns Nothing. */ (
                    event,
                  ) => setTargetFrame(event.target.value)
                }
              />
              <datalist id={targetListId}>
                {targets.map(
                  /** Renders original frame defaults in source order. @param value - Raw native target. @returns Entry. */ (
                    value,
                  ) => (
                    <option key={value} value={value} />
                  ),
                )}
              </datalist>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Name
              <input
                className="rounded-md border border-slate-300 px-3 py-2 font-normal"
                onChange={
                  /** Updates the hyperlink name. @param event - Name input event. @returns Nothing. */ (
                    event,
                  ) => setName(event.target.value)
                }
                value={name}
              />
            </label>
          </fieldset>
        </div>
        <div className="writer-dialog-actions">
          <button
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold"
            onClick={onCancel}
            type="button"
          >
            {localization.GetText("writer.common.cancel", "Cancel")}
          </button>
          <button className="writer-dialog-primary" type="submit">
            {localization.GetText("writer.common.apply", "Apply")}
          </button>
        </div>
      </form>
    </div>
  );
}
