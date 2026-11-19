/** @fileoverview Native OOXML document-protection settings receiver and its interoperability sequence. */
import type { Id, Properties, Sprm, Value } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  type PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import type { GrabBagValueConstReference } from "../../../../svl/inc/grabbagitem";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import type { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { stringAny, text } from "../../core/unocore/unocrsrhelper";
import { namedProperty, SetDocumentInteropProperties } from "./SettingsTable.compat";
import { propertyAt } from "./PropertyMap";

const fields = [
  "edit",
  "enforcement",
  "formatting",
  "cryptProviderType",
  "cryptAlgorithmClass",
  "cryptAlgorithmType",
  "cryptAlgorithmSid",
  "cryptSpinCount",
  "hash",
  "salt",
] as const;
/** Name of an OOXML attribute retained in the original protection sequence. */
type Field = (typeof fields)[number];

/** Source-ordered string members of the native UNO protection sequence. */
export type DocumentProtectionSettings = Partial<Record<Field, string>>;

const editModes = new Map<Id, string>([
  [N.LN_Value_doc_ST_DocProtect_none, "none"],
  [N.LN_Value_doc_ST_DocProtect_readOnly, "readOnly"],
  [N.LN_Value_doc_ST_DocProtect_comments, "comments"],
  [N.LN_Value_doc_ST_DocProtect_trackedChanges, "trackedChanges"],
  [N.LN_Value_doc_ST_DocProtect_forms, "forms"],
]);
const providers = new Map<Id, string>([
  [N.LN_Value_doc_ST_CryptProv_rsaAES, "rsaAES"],
  [N.LN_Value_doc_ST_CryptProv_rsaFull, "rsaFull"],
]);
const sequenceType = ["Sequence", propertyType] as const;
const PropertyValues = Sequence.specialize<PropertyValue>(propertyType, 48);

/** Receives the settings attributes consumed by the original DocumentProtection owner. */
export class DocumentProtection implements Properties {
  private edit: Id = N.LN_Value_doc_ST_DocProtect_none;
  private enforcement = false;
  private formatting = false;
  private provider: Id = N.LN_Value_doc_ST_CryptProv_rsaAES;
  private sid = "";
  private spinCount = 0;
  private hash = "";
  private salt = "";

  /** Receives one original scalar attribute. @param id - Resource identity. @param value - Source value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    const integer = value.getInt();
    const string = value.getString();
    try {
      switch (id) {
        case N.LN_CT_DocProtect_edit:
          this.edit = integer;
          break;
        case N.LN_CT_DocProtect_enforcement:
          this.enforcement = integer !== 0;
          break;
        case N.LN_CT_DocProtect_formatting:
          this.formatting = integer !== 0;
          break;
        case N.LN_AG_Password_cryptProviderType:
          this.provider = integer;
          break;
        case N.LN_AG_Password_cryptAlgorithmSid:
          this.sid = text(string);
          break;
        case N.LN_AG_Password_cryptSpinCount:
          this.spinCount = integer;
          break;
        case N.LN_AG_Password_hash:
          this.hash = text(string);
          break;
        case N.LN_AG_Password_salt:
          this.salt = text(string);
          break;
      }
    } finally {
      string.dispose();
    }
  }

  /** Matches the native no-op callback for nested modifiers. @param modifier - Nested modifier. @returns Nothing. */
  sprm(modifier: Sprm): void {
    void modifier;
  }

  /** Returns whether the document requests an active editing restriction. @returns Enforcement of a specified editing mode. */
  hasEnforcedEdit(): boolean {
    return this.enforcement && this.edit !== N.LN_Value_doc_ST_DocProtect_none;
  }

  /** Projects original attributes with native defaults and the original empty result for no editing restriction. @returns Sequence members. */
  toSequence(): DocumentProtectionSettings {
    if (this.edit === N.LN_Value_doc_ST_DocProtect_none) return {};
    const edit = editModes.get(this.edit);
    const provider = providers.get(this.provider);
    return {
      ...(edit === undefined ? {} : { edit }),
      enforcement: this.enforcement ? "1" : "0",
      ...(this.formatting ? { formatting: "1" } : {}),
      ...(provider === undefined ? {} : { cryptProviderType: provider }),
      cryptAlgorithmClass: "hash",
      cryptAlgorithmType: "typeAny",
      cryptAlgorithmSid: this.sid,
      cryptSpinCount: String(this.spinCount),
      hash: this.hash,
      salt: this.salt,
    };
  }
}

/** Writes the ordered native sequence as a typed UNO document bag entry. @param model - Writer document property owner. @param settings - Projection of the original sequence. @returns Nothing. */
export function SetDocumentProtection(
  model: SwXTextDocument,
  settings: DocumentProtectionSettings,
): void {
  const entries: PropertyValue[] = [];
  try {
    for (const field of fields) {
      const spelling = settings[field];
      if (spelling === undefined) continue;
      const value = stringAny(spelling);
      try {
        entries.push(namedProperty(field, value));
      } finally {
        value.dispose();
      }
    }
    SetDocumentInteropProperties(model, "DocumentProtection", entries);
  } finally {
    for (const entry of entries) entry.dispose();
  }
}

/** Reads the supported native protection fields from the typed document bag sequence. @param value - Borrowed bag value. @returns Validated sequence projection, or absence. */
export function ReadDocumentProtection(
  value: GrabBagValueConstReference | undefined,
): DocumentProtectionSettings | undefined {
  const sequence = new PropertyValues();
  const spelling = new OUString();
  const result: DocumentProtectionSettings = {};
  try {
    if (!value?.extract(sequence.getAddress(), sequenceType)) return undefined;
    for (let index = 0; index < sequence.getLength(); index++) {
      const entry = propertyAt(sequence, index);
      try {
        const name = text(entry.Name);
        if (isProtectionField(name) && entry.Value.extract(spelling, "OUString"))
          result[name] = text(spelling);
      } finally {
        entry.dispose();
      }
    }
    return result;
  } finally {
    spelling.dispose();
    sequence.dispose();
  }
}

/** Matches the original DOCX protection attribute list. @param name - Candidate field name. @returns Whether this is a protection field. */
export function isProtectionField(name: string): name is Field {
  return (fields as readonly string[]).includes(name);
}
