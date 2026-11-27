/** @fileoverview Native document public numbering-mode contract from doc.hxx and existing browser construction/font-ingress type declarations. Host-only option and package-font records do not claim native scalar/ABI parity. */
import type { OdfFontResource } from "../../package/source/zippackage/odf-font-resources";
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
/** One package-backed Writer face, with the shared ODF package resource contract. */
export type WriterEmbeddedFont = OdfFontResource;

/** Original ThemeFontLangProps document interoperability values. */
export interface ThemeFontLanguages {
  readonly val?: string;
  readonly eastAsia?: string;
  readonly bidi?: string;
}
