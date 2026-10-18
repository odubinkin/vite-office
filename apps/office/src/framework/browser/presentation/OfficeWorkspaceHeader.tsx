/** @fileoverview Shared office workspace header extracted from Writer without changing title,menu or toolbar layout and styles. */
import { useState, type ReactNode } from "react";
/** Suite resources and actual semantic actions injected into identical office chrome. */
export interface OfficeWorkspaceHeaderProps {
  readonly documentTitle: string;
  readonly onDocumentTitleChange: (title: string) => void;
  readonly titleLabel: string;
  readonly editTitleLabel: string;
  readonly subtitle: string;
  readonly standardToolbarLabel: string;
  readonly formattingToolbarLabel: string;
  readonly menuBar: ReactNode;
  readonly toolbar: ReactNode;
  readonly formattingToolbar?: ReactNode;
}
/** Renders shared Writer/Calc title,adjacent menus and standard/formatting toolbar regions. @param props - Suite resources and controls. @returns Header. */
export function OfficeWorkspaceHeader({
  documentTitle,
  onDocumentTitleChange,
  titleLabel,
  editTitleLabel,
  subtitle,
  standardToolbarLabel,
  formattingToolbarLabel,
  menuBar,
  toolbar,
  formattingToolbar,
}: OfficeWorkspaceHeaderProps): React.JSX.Element {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(documentTitle);
  /** Commits the normalized title draft and closes the inline editor. @returns Nothing. */
  function commitTitle(): void {
    const nextTitle = draftTitle.trim();
    if (nextTitle.length > 0 && nextTitle !== documentTitle) onDocumentTitleChange(nextTitle);
    setDraftTitle(nextTitle.length > 0 ? nextTitle : documentTitle);
    setIsEditingTitle(false);
  }

  return (
    <header className="relative z-50 shrink-0 border-b border-slate-200 bg-white">
      <div className="flex min-h-12 flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-2 sm:px-5">
        <div className="min-w-0">
          {isEditingTitle ? (
            <input
              aria-label={titleLabel}
              autoFocus
              className="w-full min-w-48 rounded border border-indigo-300 px-1 text-sm font-bold text-slate-950 outline-none ring-indigo-200 focus:ring-2"
              onBlur={commitTitle}
              onChange={
                /** Retains the current title draft. @param event - Input change. @returns Nothing. */ (
                  event,
                ) => setDraftTitle(event.target.value)
              }
              onKeyDown={
                /** Commits the title when Enter blurs the editor. @param event - Keyboard input. @returns Nothing. */ (
                  event,
                ) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.currentTarget.blur();
                  }
                }
              }
              type="text"
              value={draftTitle}
            />
          ) : (
            <button
              aria-label={editTitleLabel}
              className="block max-w-full truncate text-left text-sm font-bold text-slate-950 hover:text-indigo-700"
              onClick={
                /** Opens title editing with the current document title. @returns Nothing. */ () => {
                  setDraftTitle(documentTitle);
                  setIsEditingTitle(true);
                }
              }
              type="button"
            >
              {documentTitle}
            </button>
          )}
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-700">
            {subtitle}
          </p>
        </div>
        <div className="shrink-0">{menuBar}</div>
      </div>

      <div
        aria-label={standardToolbarLabel}
        className="flex min-h-12 min-w-0 items-center gap-1 overflow-x-auto border-b border-slate-200 px-3 py-1.5"
        role="toolbar"
      >
        {toolbar}
      </div>

      {formattingToolbar === undefined ? null : (
        <div
          aria-label={formattingToolbarLabel}
          className="flex min-h-12 min-w-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-1.5"
          role="toolbar"
        >
          {formattingToolbar}
        </div>
      )}
    </header>
  );
}
