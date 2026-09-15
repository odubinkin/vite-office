/** @fileoverview Browser output-device adapter for Writer default-font resolution. */

/** Font role requested by Writer's default-style initialization. */
type BrowserDefaultFontType = "fixed" | "heading" | "text";
/** Script group corresponding to Writer's western, CJK, and CTL slots. */
type BrowserFontScript = "cjk" | "ctl" | "western";

/** Structural device contract implemented without importing the consuming Writer module. */
export interface BrowserDefaultFontDevice {
  readonly getDefaultFont: (
    type: BrowserDefaultFontType,
    language: string,
    script: BrowserFontScript,
  ) => string | undefined;
}

const browserDefaultFamilies: Readonly<
  Record<BrowserDefaultFontType, Readonly<Record<BrowserFontScript, readonly string[]>>>
> = {
  fixed: {
    cjk: ["Noto Sans Mono CJK", "Noto Sans Mono"],
    ctl: ["Noto Sans Mono", "Liberation Mono"],
    western: ["Liberation Mono", "Noto Sans Mono"],
  },
  heading: {
    cjk: ["Noto Sans CJK", "Noto Sans"],
    ctl: ["Noto Sans Arabic", "Noto Sans"],
    western: ["Liberation Sans", "Noto Sans"],
  },
  text: {
    cjk: ["Noto Sans CJK", "Noto Serif CJK"],
    ctl: ["Noto Naskh Arabic", "Noto Sans Arabic"],
    western: ["Liberation Serif", "Noto Serif"],
  },
};

/** Creates the VCL-like synchronous font lookup used while constructing a document. @param document - Browser document exposing the CSS Font Loading API. @returns Default-font device. */
export function createBrowserDefaultFontDevice(document: Document): BrowserDefaultFontDevice {
  return {
    getDefaultFont:
      /** Selects the first device-present family for one role/script request. @param type - Font role. @param _language - Document/script locale retained for parity and future platform mapping. @param script - Writer script slot. @returns Available family. */
      (type, _language, script) =>
        browserDefaultFamilies[type][script].find(
          /** Checks one family without initiating a load. @param family - Candidate family. @returns Whether the device reports it available. */
          (family) => document.fonts?.check(`12px "${family}"`) === true,
        ),
  };
}
