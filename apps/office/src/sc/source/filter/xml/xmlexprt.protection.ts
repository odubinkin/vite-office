/** @fileoverview Original ODF sheet-protection verifier selection and XML projection. */
import { encodeBase64 } from "../../../../comphelper/source/misc/base64";
import { ScPasswordHash as Hash } from "../../../inc/tabprotection";
import type { ScDocument } from "../../../inc/document";
import {
  needsPassHashRegen,
  type ScDocProtection,
  type ScTableProtection,
} from "../../core/data/tabprotection";
import { odfProtectionOptions, protectionDigestUris } from "./xmlsubti";

/** Writes the verifier in the ODF 1.3 family selected by the native export methods. @param protection - Current protection owner. @returns Digest attributes if available. */
async function writeProtectionKey(
  protection: Readonly<ScTableProtection | ScDocProtection>,
): Promise<string> {
  for (const primary of [Hash.SHA1, Hash.SHA256, Hash.XL] as const) {
    const secondary = primary === Hash.XL ? Hash.SHA1 : Hash.UNSPECIFIED;
    if (!protection.hasPasswordHash(primary, secondary)) continue;
    const bytes = await protection.getPasswordHash(primary, secondary);
    if (!bytes.length) return "";
    const digest = ` table:protection-key="${encodeBase64(bytes)}" table:protection-key-digest-algorithm="${protectionDigestUris[primary]}"`;
    return primary === Hash.XL
      ? digest + ` loext:protection-key-digest-algorithm-2="${protectionDigestUris[Hash.SHA1]}"`
      : digest;
  }
  return "";
}

/** Checks protection compatibility before unattended ODF saves. @param document - Source Calc document. @returns Whether existing passwords need retyping. */
export function needsOdfPasswordHashRegen(document: ScDocument): boolean {
  return (
    needsPassHashRegen(document, Hash.SHA1) &&
    needsPassHashRegen(document, Hash.XL, Hash.SHA1) &&
    needsPassHashRegen(document, Hash.SHA256)
  );
}

/** Prepares the protection attributes before the synchronous XML row traversal. @param document - Source Calc document. @returns Attributes keyed by the actual sheet protection owner. */
export async function prepareTableProtection(
  document: ScDocument,
): Promise<ReadonlyMap<Readonly<ScTableProtection>, string>> {
  if (needsOdfPasswordHashRegen(document)) {
    const owner = document.IsDocProtected() ? "Workbook or sheet" : "Sheet";
    throw new Error(`${owner} protection requires re-entering its password to save as ODS.`);
  }
  const records = new Map<Readonly<ScTableProtection>, string>();
  for (let tab = 0; tab < document.GetTableCount(); ++tab) {
    const protection = document.GetTabProtection(tab);
    if (!protection?.isProtected()) continue;
    const digest = await writeProtectionKey(protection);
    if (!digest && protection.hasPassword())
      throw new Error("Sheet protection requires re-entering its password to save as ODS.");
    records.set(protection, ' table:protected="true"' + digest);
  }
  return records;
}

/** Writes the original protected spreadsheet body attributes. @param document - Source Calc document. @returns Spreadsheet attributes. */
export async function prepareDocProtection(document: ScDocument): Promise<string> {
  const protection = document.GetDocProtection();
  if (!protection?.isProtected()) return "";
  return ' table:structure-protected="true"' + (await writeProtectionKey(protection));
}

/** Writes the extended ODF child containing enabled sheet operations. @param protection - Sheet state. @returns ODF XML. */
export function writeTableProtectionOptions(protection: Readonly<ScTableProtection>): string {
  let xml = "<loext:table-protection";
  for (const [option, , name] of odfProtectionOptions)
    if (protection.isOptionEnabled(option)) xml += ` loext:${name}="true"`;
  return xml + "/>";
}
