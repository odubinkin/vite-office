/** @fileoverview Consumed Style panel selector from sidebarstylespanel.ui, using the actual style toolbox acceptance contract. */
import { useRef } from "react";
import { SidebarPanel } from "../../../../sfx2/browser/presentation/SidebarPanel";
import {
  StyleToolboxSelect,
  type StyleToolboxSelectProps,
} from "../../tbxctrls/StyleToolboxSelect";

/** Renders the native Style panel's consumed selector;style editing and creation toolbars remain unported. @param props - Actual style selection and panel focus ports. @returns Style panel. */
export function StylesPropertyPanel({
  title,
  ...selector
}: StyleToolboxSelectProps & { readonly title: string }): React.JSX.Element {
  const content = useRef<HTMLDivElement>(null);
  return (
    <SidebarPanel
      title={title}
      focusDocument={selector.focusDocument}
      focusContent={
        /** Enters the actual style widget. @returns Nothing. */ () =>
          content.current?.querySelector("select")?.focus()
      }
    >
      <div className="py-2 [&_select]:w-full [&_select]:min-w-0" ref={content}>
        <StyleToolboxSelect {...selector} />
      </div>
    </SidebarPanel>
  );
}
