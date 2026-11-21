/** @fileoverview React subscription to the existing Calc and Sfx dialog stores. */
import { useSyncExternalStore } from "react";

/** Subscribes to a native dialog owner for the workspace's inert and reference state. @param dialog - Original request owner. @returns Active request. */
export function useCalcDialog<Snapshot>(dialog: {
  Subscribe: (notify: () => void) => () => void;
  GetSnapshot: () => Snapshot;
}) {
  return useSyncExternalStore(dialog.Subscribe, dialog.GetSnapshot, dialog.GetSnapshot);
}
