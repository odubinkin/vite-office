/** @fileoverview Projects native sidebar panel expansion and title-entry behavior. */
import { useId, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { ChevronDown, ChevronRight } from "lucide-react";

/** Supplies one existing sidebar panel without coupling to command or localization layers. */
export interface SidebarPanelProps {
  readonly children: ReactNode;
  readonly title: string;
  readonly focusContent: () => void;
  readonly initiallyExpanded?: boolean;
  readonly moreOptions?: ReactNode;
}

/** Renders a panel title and persistent content with optional source-owned toolbar controls.
 * @param props - Panel content and source-owned command projection.
 * @param props.children - Content retained when the panel is collapsed.
 * @param props.title - Localized native panel title.
 * @param props.focusContent - Focuses the first eligible child control.
 * @param props.initiallyExpanded - Native context's initial expansion state.
 * @param props.moreOptions - Existing bindings-backed title toolbar control.
 * @returns Panel title, expander, toolbar and retained content.
 */
export function SidebarPanel({
  children,
  title,
  focusContent,
  initiallyExpanded = true,
  moreOptions,
}: SidebarPanelProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const contentId = useId();
  const Icon = expanded ? ChevronDown : ChevronRight;
  return (
    <section aria-label={title}>
      <header className="flex min-h-9 items-center justify-between gap-1 border-b border-slate-200">
        <h2 className="min-w-0 flex-1 text-sm font-bold text-slate-950">
          <button
            aria-controls={contentId}
            aria-expanded={expanded}
            className="flex min-h-9 w-full items-center gap-1 text-left"
            onClick={
              /** Updates only this panel's expansion. @returns Nothing. */ () =>
                setExpanded(
                  /** Toggles retained panel visibility. @param current - Current state. @returns Requested state. */ (
                    current,
                  ) => !current,
                )
            }
            onKeyDown={
              /** Enters panel content without toggling its expander. @param event - Title key input. @returns Nothing. */ (
                event,
              ) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                flushSync(
                  /** Shows retained content before the native child-focus operation. @returns Nothing. */ () =>
                    setExpanded(true),
                );
                focusContent();
              }
            }
            type="button"
          >
            <Icon aria-hidden size={16} />
            {title}
          </button>
        </h2>
        {moreOptions == null ? null : (
          <div aria-label={`${title} options`} role="toolbar">
            {moreOptions}
          </div>
        )}
      </header>
      <div hidden={!expanded} id={contentId}>
        {children}
      </div>
    </section>
  );
}
