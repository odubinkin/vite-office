/** @fileoverview SvxStyleBox controller acceptance and saved-value focus contracts from pinned tbcontrl.cxx. */
import type { ReactNode } from "react";
import { ComboBox } from "../../../vcl/browser/ComboBox";
import type { StyleToolboxEntry } from "./style-toolbox-control";

/** Original frame-owned style pool lookup and dispatch ports. */
export interface StyleToolboxSelectProps {
  readonly popupWidth?: number;
  readonly options: readonly StyleToolboxEntry[];
  readonly value: string;
  readonly enabled: boolean;
  readonly label: string;
  readonly getLabel: (style: StyleToolboxEntry) => string;
  readonly applyStyle: (style: StyleToolboxEntry) => void;
  readonly acceptName: (name: string) => void;
  readonly focusDocument?: () => void;
  readonly inSidebar?: boolean;
  readonly renderItem?: (style: StyleToolboxEntry, selected: boolean) => ReactNode;
}

/** Resolves actual style identities before dispatch while the shared widget owns only text and travel. @param props - Actual pool projection and frame controller ports. @returns Style combo. */
export function StyleToolboxSelect(props: StyleToolboxSelectProps): React.JSX.Element {
  const current = props.options.find(
    /** Resolves the actual document style identity. @param entry - Pool row. @returns Match. */
    (entry) => entry.id === props.value,
  );
  return (
    <ComboBox
      {...(props.popupWidth === undefined ? {} : { popupWidth: props.popupWidth })}
      resetKey={props.options}
      options={props.options}
      value={current === undefined ? "" : props.getLabel(current)}
      enabled={props.enabled}
      label={props.label}
      getText={props.getLabel}
      getId={
        /** Supplies native identity independently of translated display text. @param entry - Pool row. @returns Identity. */
        (entry) => entry.id
      }
      {...(props.renderItem === undefined ? {} : { renderItem: props.renderItem })}
      onAccept={
        /** Releases focus before dispatch, preserving raw names for creation. @param text - Accepted text. @param release - Whether controller focus release is requested. @returns Nothing. */
        (text, release) => {
          const entry = props.options.find(
            /** Translates visible names to real pool identities. @param style - Pool row. @returns Match. */
            (style) => props.getLabel(style) === text,
          );
          if (release) props.focusDocument?.();
          if (entry !== undefined) props.applyStyle(entry);
          else props.acceptName(text);
        }
      }
      onCancel={
        /** Sidebar Escape belongs to its deck; toolbar cancellation releases document focus. @returns Whether the key was consumed. */
        () => {
          if (props.inSidebar) return false;
          props.focusDocument?.();
          return true;
        }
      }
    />
  );
}
