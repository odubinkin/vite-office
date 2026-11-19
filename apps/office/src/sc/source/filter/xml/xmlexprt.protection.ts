/** @fileoverview Original ODF sheet-protection verifier selection and XML projection. */
import { encodeBase64 } from "../../../../comphelper/source/misc/base64";
import { ScPasswordHash as Hash, type ScStoredPasswordHash } from "../../../inc/tabprotection";
import type { ScDocument } from "../../../inc/document";
import { needsPassHashRegen, type ScTableProtection } from "../../core/data/tabprotection";
import { odfProtectionOptions, protectionDigestUris } from "./xmlsubti";

/** Returns the stored verifier in the family selected by ScXMLExport::WriteTable. @param protection - Sheet protection. @returns Verifier with an ODF representation or absence. */
function selectOdfPasswordHash(
  protection: Readonly<ScTableProtection>,
): ScStoredPasswordHash | undefined {
  const hash = protection.getStoredPasswordHash();
  if (!hash?.bytes.length) return undefined;
  const { primary, secondary } = hash;
  if (
    primary === Hash.XL
      ? secondary === Hash.UNSPECIFIED || secondary === Hash.SHA1
      : (primary === Hash.SHA1 || primary === Hash.SHA256) && secondary === Hash.UNSPECIFIED
  )
    return hash;
  return undefined;
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
  if (needsOdfPasswordHashRegen(document))
    throw new Error("Sheet protection requires re-entering its password to save as ODS.");
  const records = new Map<Readonly<ScTableProtection>, string>();
  for (let tab = 0; tab < document.GetTableCount(); ++tab) {
    const protection = document.GetTabProtection(tab);
    if (!protection?.isProtected()) continue;
    let attributes = ' table:protected="true"';
    const hash = selectOdfPasswordHash(protection);
    if (hash) {
      const { primary, secondary } = hash;
      const digest =
        primary === Hash.XL && secondary === Hash.UNSPECIFIED
          ? new Uint8Array(await crypto.subtle.digest("SHA-1", new Uint8Array(hash.bytes)))
          : hash.bytes;
      const algorithm =
        primary === Hash.SHA1
          ? protectionDigestUris[Hash.SHA1]
          : primary === Hash.SHA256
            ? protectionDigestUris[Hash.SHA256]
            : protectionDigestUris[Hash.XL];
      attributes += ` table:protection-key="${encodeBase64(digest)}" table:protection-key-digest-algorithm="${algorithm}"`;
      if (primary === Hash.XL)
        attributes += ` loext:protection-key-digest-algorithm-2="${protectionDigestUris[Hash.SHA1]}"`;
    } else if (protection.hasPassword()) {
      throw new Error("Sheet protection requires re-entering its password to save as ODS.");
    }
    records.set(protection, attributes);
  }
  return records;
}

/** Writes the extended ODF child containing enabled sheet operations. @param protection - Sheet state. @returns ODF XML. */
export function writeTableProtectionOptions(protection: Readonly<ScTableProtection>): string {
  let xml = "<loext:table-protection";
  for (const [option, , name] of odfProtectionOptions)
    if (protection.isOptionEnabled(option)) xml += ` loext:${name}="true"`;
  return xml + "/>";
}
