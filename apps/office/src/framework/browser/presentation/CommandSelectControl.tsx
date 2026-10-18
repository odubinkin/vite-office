/** @fileoverview Shared Sfx select-controller binding;lower-layer widgets are injected through a render port. */
import type { ReactNode } from "react";
import {
  useBrowserCommandPresentation,
  type BrowserCommandSurfaceProps,
  type BrowserCommandPresentationResource,
} from "./command-surface";
/** Read-only current binding and the actual frame execution port supplied to a toolbox widget. */
export interface CommandSelectBinding {
  readonly value: unknown;
  readonly enabled: boolean;
  readonly onSelect: (value: unknown) => void;
}
/** Binds an injected selector without importing its widget module or creating document state. @param props - Source/resource/acceptance fields and widget render port. @returns Actual selected widget. */
export function CommandSelectControl({
  commandSource,
  commandId,
  getCommandResource,
  resolveArguments,
  argumentName,
  children,
}: BrowserCommandSurfaceProps &
  Readonly<{
    commandId: string;
    getCommandResource: (url: string) => BrowserCommandPresentationResource;
    argumentName: string;
    children: (binding: CommandSelectBinding) => ReactNode;
  }>): ReactNode {
  const presentation = useBrowserCommandPresentation(commandSource, commandId, getCommandResource);
  return children({
    value: presentation.selectedValue,
    enabled: presentation.enabled,
    onSelect:
      /** Preserves caller arguments and dispatches accepted widget data through the actual Sfx frame. @param value - Widget value. @returns Nothing. */ (
        value,
      ) => {
        const base = resolveArguments(commandId);
        commandSource.Execute(commandId, {
          ...(typeof base === "object" && base !== null ? base : {}),
          [argumentName]: value,
        });
      },
  });
}
