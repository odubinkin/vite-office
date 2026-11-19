/** @fileoverview Original exchange.cxx standard/dynamic format registry operations over native DataFlavor owners. The same151-entry table, source range order, chart remap and parameter-admission asymmetry are preserved. Global deinitialization/native locking and unrelated IsInternal class-ID logic remain unqualified. */
import {
  DataFlavor,
  type DataFlavorConstReference,
} from "../../../offapi/com/sun/star/datatransfer/DataFlavor";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { UnoType } from "../../../cppu/inc/unotype";
import { FormatArray_Impl } from "./exchange.table";
import { SotClipboardFormatId as Id } from "../../inc/formats";
let dynamic: DataFlavor[] | undefined;
/** Original function-local DeleteOnDeinit vector. @returns Actual native flavor values. */
function InitFormats_Impl(): DataFlavor[] {
  return (dynamic ??= []);
}
/** Original dynamic ID arithmetic. @param index - Valid source vector index. @returns Source sal_uInt32 identifier. */
function FormatIdOfDynamicFormat(index: number): Id {
  if (index >= InitFormats_Impl().length) throw new Error("assert(valid dynamic index)");
  return (index + Id.USER_END + 1) >>> 0;
}
/** Original dynamic position arithmetic. @param id - Valid dynamic identifier. @returns Native size_t-bound index. */
function PosOfDynamicFormat(id: Id): number {
  if (id <= Id.USER_END) throw new Error("assert(dynamic format)");
  return id - Id.USER_END - 1;
}
/** Original vector copy construction. @param value - Actual source flavor. @returns Allocated identifier. */
function AddDynamicFormat(value: DataFlavorConstReference): Id {
  const values = InitFormats_Impl();
  values.push(new DataFlavor(value));
  return FormatIdOfDynamicFormat(values.length - 1);
}
/** Original source string_view equality. @param value - View. @param text - Actual native string. @returns Equality. */
function equals(value: Uint16Array, text: OUStringConstReference): boolean {
  if (value.length !== text.getLength()) return false;
  for (let i = 0; i < value.length; ++i) if (value[i] !== text.getStr()[i]) return false;
  return true;
}
/** Original source MIME lookup. @param value - Exact UTF16 input. @param allowMoreParams - Source caller's flag. @returns Identifier. */
function GetFormatIdFromMimeType_impl(value: Uint16Array, allowMoreParams: boolean): Id {
  const table = FormatArray_Impl();
  for (let i = Id.STRING; i <= Id.FILE_LIST; ++i)
    if (equals(value, (table[i] as DataFlavor).MimeType)) return i;
  for (let i = Id.RTF; i <= Id.USER_END; ++i) {
    const mime: OUString = (table[i] as DataFlavor).MimeType;
    const n: number = mime.getLength();
    if (value.length < n) continue;
    let prefix = true;
    for (let j = 0; j < n; ++j)
      if (value[j] !== mime.getStr()[j]) {
        prefix = false;
        break;
      }
    if (prefix && (value.length === n || (allowMoreParams && value[n] === 59)))
      return i === Id.STARCHARTDOCUMENT_50 ? Id.STARCHART_50 : i;
  }
  const values = InitFormats_Impl();
  for (let i = 0; i < values.length; ++i)
    if (equals(value, (values[i] as DataFlavor).MimeType)) return FormatIdOfDynamicFormat(i);
  return Id.NONE;
}
/** Original SotExchange selected public static operations; no clipboard/transfer provider is supplied. */
export const SotExchange = {
  /** Original name-first lookup and dynamic registration. @param name - Native exact name. @returns Format. */
  RegisterFormatName(name: OUStringConstReference): Id {
    const table = FormatArray_Impl();
    for (let i = Id.STRING; i <= Id.FILE_LIST; ++i)
      if (name.equals((table[i] as DataFlavor).HumanPresentableName)) return i;
    for (let i = Id.RTF; i <= Id.USER_END; ++i)
      if (name.equals((table[i] as DataFlavor).HumanPresentableName))
        return i === Id.STARCHARTDOCUMENT_50 ? Id.STARCHART_50 : i;
    const values = InitFormats_Impl();
    for (let i = 0; i < values.length; ++i)
      if (name.equals((values[i] as DataFlavor).HumanPresentableName))
        return FormatIdOfDynamicFormat(i);
    const value = new DataFlavor(name, name, UnoType.get("OUString"));
    try {
      return AddDynamicFormat(value);
    } finally {
      value.dispose();
    }
  },
  /** Original strict MIME registration. @param mime - Actual string. @returns Format. */
  RegisterFormatMimeType(mime: OUStringConstReference): Id {
    const id = SotExchange.GetFormatIdFromMimeType(mime.getStr().subarray(0, mime.getLength()));
    if (id !== Id.NONE) return id;
    const value = new DataFlavor(mime, mime, UnoType.get("OUString"));
    try {
      return AddDynamicFormat(value);
    } finally {
      value.dispose();
    }
  },
  /** Original flavor registration uses the parameter-permissive lookup first. @param flavor - Actual native fields. @returns Format. */
  RegisterFormat(flavor: DataFlavorConstReference): Id {
    const id = SotExchange.GetFormat(flavor);
    return id === Id.NONE ? AddDynamicFormat(flavor) : id;
  },
  /** Original output assignment or default initialization on a missing dynamic value. @param id - Source format. @param flavor - Actual destination. @returns Success. */
  GetFormatDataFlavor(id: Id, flavor: DataFlavor): boolean {
    if (id <= Id.USER_END) {
      flavor.assign(FormatArray_Impl()[id] as DataFlavor);
      return true;
    }
    const values = InitFormats_Impl(),
      index = PosOfDynamicFormat(id);
    if (values.length > index) {
      flavor.assign(values[index] as DataFlavor);
      return true;
    }
    const empty = new DataFlavor();
    try {
      flavor.assign(empty);
    } finally {
      empty.dispose();
    }
    return false;
  },
  /** Original empty MIME result for an unknown dynamic identifier. @param id - Source format. @returns Owned string. */
  GetFormatMimeType(id: Id): OUString {
    if (id <= Id.USER_END) return new OUString((FormatArray_Impl()[id] as DataFlavor).MimeType);
    const values = InitFormats_Impl(),
      index = PosOfDynamicFormat(id);
    return values.length > index
      ? new OUString((values[index] as DataFlavor).MimeType)
      : new OUString();
  },
  /** Original strict MIME view route. @param mime - Source view. @returns Format. */
  GetFormatIdFromMimeType(mime: Uint16Array): Id {
    return GetFormatIdFromMimeType_impl(mime, false);
  },
  /** Original flavor route accepts appended parameters only for the source builtin range. @param flavor - Actual flavor. @returns Format. */
  GetFormat(flavor: DataFlavorConstReference): Id {
    return GetFormatIdFromMimeType_impl(
      flavor.MimeType.getStr().subarray(0, flavor.MimeType.getLength()),
      true,
    );
  },
  /** Original name read through actual default/native output value. @param id - Source identifier. @returns Owned string. */
  GetFormatName(id: Id): OUString {
    const flavor = new DataFlavor();
    try {
      return SotExchange.GetFormatDataFlavor(id, flavor)
        ? new OUString(flavor.HumanPresentableName)
        : new OUString();
    } finally {
      flavor.dispose();
    }
  },
};
