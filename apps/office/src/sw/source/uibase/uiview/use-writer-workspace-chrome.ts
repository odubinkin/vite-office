/**
 * @fileoverview Owns transient Writer workspace chrome preferences and browser-selection requests outside the serialized document workbench.
 */

import { useState } from "react";

/** Describes visibility preferences for non-document Writer workspace chrome. */
export interface WriterWorkspaceChromeState {
  /** Whether the horizontal Writer ruler is shown below the formatting toolbar. */
  readonly isHorizontalRulerVisible: boolean;
  /** Whether the Writer properties sidebar is shown beside the document canvas. */
  readonly isPropertiesSidebarVisible: boolean;
  /** Whether the Writer status feedback row is shown below the canvas. */
  readonly isStatusBarVisible: boolean;
  /** Changes horizontal-ruler visibility without altering document state. */
  readonly setIsHorizontalRulerVisible: (isVisible: boolean) => void;
  /** Changes properties-sidebar visibility without altering document state. */
  readonly setIsPropertiesSidebarVisible: (isVisible: boolean) => void;
  /** Changes status-bar visibility without altering document state. */
  readonly setIsStatusBarVisible: (isVisible: boolean) => void;
}

/** Describes a monotonically increasing request that asks the editor to use its browser selection. */
export interface WriterDocumentSelectionState {
  /** Distinguishes each explicit Select All request from the initial editor render. */
  readonly selectAllRequestId: number | undefined;
  /** Requests a fresh browser selection over the complete integrated Writer body. */
  readonly requestSelectAll: () => void;
}

/**
 * Owns visibility preferences for Writer chrome that must not participate in document history or storage snapshots.
 *
 * @returns Current chrome visibility values and their workspace-only setters.
 */
export function useWriterWorkspaceChrome(): WriterWorkspaceChromeState {
  const [isHorizontalRulerVisible, setIsHorizontalRulerVisible] = useState(true);
  const [isPropertiesSidebarVisible, setIsPropertiesSidebarVisible] = useState(true);
  const [isStatusBarVisible, setIsStatusBarVisible] = useState(true);
  return {
    isHorizontalRulerVisible,
    isPropertiesSidebarVisible,
    isStatusBarVisible,
    setIsHorizontalRulerVisible,
    setIsPropertiesSidebarVisible,
    setIsStatusBarVisible,
  };
}

/**
 * Owns explicit selection requests so the workbench can ask the rendered document editor to select its current DOM body.
 *
 * @returns Current Select All request identity and an action that advances it.
 */
export function useWriterDocumentSelection(): WriterDocumentSelectionState {
  const [selectAllRequestId, setSelectAllRequestId] = useState<number>();

  /**
   * Advances the request identity, causing the editor to select its current document body after React commits.
   *
   * @returns Nothing; React schedules a new selection request identity.
   */
  function requestSelectAll(): void {
    setSelectAllRequestId(
      /** Increments a prior request identity while assigning the first request its deterministic zero value. @param currentRequestId - Current request identity or no prior request. @returns Next selection request identity. */
      function advanceSelectAllRequest(currentRequestId): number {
        return currentRequestId === undefined ? 0 : currentRequestId + 1;
      },
    );
  }

  return { requestSelectAll, selectAllRequestId };
}
