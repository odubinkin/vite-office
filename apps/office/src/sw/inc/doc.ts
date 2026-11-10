/** @fileoverview Native document public numbering-mode contract from doc.hxx and existing browser construction/font-ingress type declarations. Host-only option and package-font records do not claim native scalar/ABI parity. */
import type { DefaultFontDevice } from "../source/core/doc/default-font";
/** Construction policy for locale/device-dependent Writer defaults. */
export interface SwDocOptions {
  readonly createInitialTextNode?: boolean;
  readonly defaultFontDevice?: DefaultFontDevice;
  readonly locale?: string;
}
/** Native SetNumRule operation flags from doc.hxx. */
export enum SetNumRuleMode {
  Default = 0,
  CreateNewList = 1,
  DontSetItem = 2,
  ResetIndentAttrs = 4,
  DontSetIfAlreadyApplied = 8,
}
/** One package-backed Writer font face; bytes are attached only after manifest and ZIP validation. */
export interface WriterEmbeddedFont {
  readonly faceName: string;
  readonly familyName: string;
  readonly path: string;
  readonly format: string;
  readonly weight: "normal" | "bold";
  readonly style: "normal" | "italic";
  readonly bytes?: Uint8Array;
  readonly canLoad?: boolean;
}
