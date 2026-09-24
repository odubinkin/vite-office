/** @fileoverview Shares the fixed ruler lane and document scroll position with paged Writer content. */

import { createContext } from "react";

/** Canvas-owned lane used by page rulers while the document scrolls. */
export const WriterRulerLaneContext = createContext<
  Readonly<{
    lane: HTMLElement | null;
    scrollTop: number;
  }>
>({ lane: null, scrollTop: 0 });
