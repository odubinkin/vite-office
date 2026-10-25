/** @fileoverview Consumed Style panel selector from sidebarstylespanel.ui, using the actual style toolbox acceptance contract. */
import { useRef } from "react";
import { SidebarPanel } from "../../../../sfx2/browser/presentation/SidebarPanel";
import {
  StyleToolboxSelect,
  type StyleToolboxSelectProps,
} from "../../tbxctrls/StyleToolboxSelect";

/** Renders the native Style panel's editable selector and original command toolbar. @param props - Actual style selection and panel focus ports. @returns Style panel. */
export function StylesPropertyPanel({
  title,
  tools,
  ...selector
}: StyleToolboxSelectProps & {
  readonly title: string;
  readonly tools?: React.ReactNode;
}): React.JSX.Element {
  const content = useRef<HTMLDivElement>(null);
  return (
    <SidebarPanel
      title={title}
      focusDocument={selector.focusDocument}
      focusContent={
        /** Enters the actual style widget. @returns Nothing. */ () =>
          content.current?.querySelector("input")?.focus()
      }
    >
      <div className="flex gap-1 py-2 [&_input]:w-full" ref={content}>
        <StyleToolboxSelect {...selector} />
        <div className="flex shrink-0 [&_button]:size-7" role="group" aria-label="Style Actions">
          {tools}
        </div>
      </div>
    </SidebarPanel>
  );
}
