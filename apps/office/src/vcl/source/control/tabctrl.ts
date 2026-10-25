/** @fileoverview Consumed TabControl keyboard-direction decisions from pinned tabctrl.cxx;native widgets/page ownership remain unrepresented. */
/** Returns original navigation direction;actual page owner applies native wraparound. @param key - Browser key mapped to native key identity. @param mod1 - Native primary modifier. @param shift - Shift modifier. @param tabFocused - Whether the actual tab control owns focus. @returns Direction or no consumed key. */
export function tabControlDirection(
  key: string,
  mod1: boolean,
  shift: boolean,
  tabFocused: boolean,
): 1 | -1 | undefined {
  if (mod1) {
    if (shift || key === "PageUp") {
      if (key === "Tab" || key === "PageUp") return -1;
    } else if (key === "Tab" || key === "PageDown") return 1;
  }
  if (tabFocused) {
    if (key === "ArrowLeft") return -1;
    if (key === "ArrowRight") return 1;
  }
  return undefined;
}
