/** @fileoverview ODF sheet protection import data assembled for the native ScTable. */
import { decodeBase64 } from "../../../../comphelper/source/misc/base64";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import {
  ScPasswordHash as Hash,
  ScTableProtectionOption as Option,
} from "../../../inc/tabprotection";
import { ScTableProtection } from "../../core/data/tabprotection";

const digestUris = {
  [Hash.SHA1]: "http://www.w3.org/2000/09/xmldsig#sha1",
  [Hash.SHA256]: "http://www.w3.org/2000/09/xmldsig#sha256",
  [Hash.XL]: "http://docs.oasis-open.org/office/ns/table/legacy-hash-excel",
} as const;

/** Original digest names written by Calc. */
export const protectionDigestUris = digestUris;

/** Source permissions in their ODF export order. */
export const odfProtectionOptions = [
  [Option.SELECT_LOCKED_CELLS, XMLToken.TABLE_SELECT_PROTECTED_CELLS, "select-protected-cells"],
  [
    Option.SELECT_UNLOCKED_CELLS,
    XMLToken.TABLE_SELECT_UNPROTECTED_CELLS,
    "select-unprotected-cells",
  ],
  [Option.INSERT_COLUMNS, XMLToken.TABLE_INSERT_COLUMNS, "insert-columns"],
  [Option.INSERT_ROWS, XMLToken.TABLE_INSERT_ROWS, "insert-rows"],
  [Option.DELETE_COLUMNS, XMLToken.TABLE_DELETE_COLUMNS, "delete-columns"],
  [Option.DELETE_ROWS, XMLToken.TABLE_DELETE_ROWS, "delete-rows"],
  [Option.AUTOFILTER, XMLToken.TABLE_USE_AUTOFILTER, "use-autofilter"],
  [Option.PIVOT_TABLES, XMLToken.TABLE_USE_PIVOT, "use-pivot"],
] as const;

/** Resolves the digest URI as ScPassHashHelper does. @param uri - Explicit lexical value. @returns Native digest type. */
function digestType(uri: string): Hash {
  switch (uri) {
    case digestUris[Hash.SHA1]:
      return Hash.SHA1;
    case digestUris[Hash.SHA256]:
    case "http://www.w3.org/2001/04/xmlenc#sha256":
      return Hash.SHA256;
    case digestUris[Hash.XL]:
      return Hash.XL;
    default:
      return Hash.UNSPECIFIED;
  }
}

/** Builds the original protection owner for an ODF sheet marked protected. @param attributes - Table attributes. @returns Protection or absence. */
export function readTableProtection(attributes: FastAttributeList): ScTableProtection | undefined {
  if (attributes.get(XMLToken.TABLE_PROTECTED) !== "true") return undefined;
  const protection = new ScTableProtection();
  protection.setProtected(true);
  const key = attributes.get(XMLToken.TABLE_PROTECTION_KEY);
  if (key) {
    const primary = attributes.get(XMLToken.TABLE_PROTECTION_KEY_DIGEST_ALGORITHM);
    const secondary = attributes.get(XMLToken.TABLE_PROTECTION_KEY_DIGEST_ALGORITHM_2);
    protection.setStoredPasswordHash({
      bytes: decodeBase64(key),
      primary: primary === null ? Hash.SHA1 : digestType(primary),
      secondary: secondary === null ? Hash.UNSPECIFIED : digestType(secondary),
    });
  }
  return protection;
}

/** Reads the explicit protection child with false defaults for its missing options. @param protection - Sheet state. @param attributes - Child attributes. @returns Nothing. */
export function readTableProtectionOptions(
  protection: ScTableProtection,
  attributes: FastAttributeList,
): void {
  for (const [option, token] of odfProtectionOptions)
    protection.setOption(option, attributes.get(token) === "true");
}
