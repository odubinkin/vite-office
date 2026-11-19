/** @fileoverview Original SotStorage::GetFormatID/GetVersion native XStorage metadata responsibilities. The legacy compound-file SotStorage engine is separate and not supplied by this namespace binding. */
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import type { XStorage } from "../../../offapi/com/sun/star/embed/XStorage";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { DataFlavor } from "../../../offapi/com/sun/star/datatransfer/DataFlavor";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { SOFFICE_FILEFORMAT_8, SOFFICE_FILEFORMAT_60 } from "../../../comphelper/inc/fileformat.h";
import { SotClipboardFormatId as Id } from "../../inc/formats";
import { SotExchange } from "../base/exchange";
/** Original selected static helper entry points, without pretending to implement an XStorage provider. */
export const SotStorage = {
  /** Original native property query, ignored UNO errors and actual flavor registry. @param storage - Native storage reference. @returns Original format identifier. */
  GetFormatID(storage: Reference<XStorage>): Id {
    const props = new Reference<XPropertySet>(storage, UNO_QUERY, XPropertySet.static_type);
    try {
      if (!props.is()) return Id.NONE;
      const mime = new OUString();
      try {
        try {
          const name = OUString.createFromAscii(new TextEncoder().encode("MediaType\0"));
          try {
            const value = props.operatorStar().getPropertyValue(name);
            try {
              value.extract(mime, "OUString");
            } finally {
              value.dispose();
            }
          } finally {
            name.dispose();
          }
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        }
        if (!mime.isEmpty()) {
          const flavor = new DataFlavor();
          try {
            flavor.MimeType = mime;
            return SotExchange.GetFormat(flavor);
          } finally {
            flavor.dispose();
          }
        }
        return Id.NONE;
      } finally {
        mime.dispose();
      }
    } finally {
      props.dispose();
    }
  },
  /** Original exact format switch; unknown formats including database deliberately return0. @param storage - Actual storage. @returns Original office format version. */
  GetVersion(storage: Reference<XStorage>): number {
    const id = SotStorage.GetFormatID(storage);
    switch (id) {
      case Id.STARWRITER_8:
      case Id.STARWRITER_8_TEMPLATE:
      case Id.STARWRITERWEB_8:
      case Id.STARWRITERGLOB_8:
      case Id.STARWRITERGLOB_8_TEMPLATE:
      case Id.STARDRAW_8:
      case Id.STARDRAW_8_TEMPLATE:
      case Id.STARIMPRESS_8:
      case Id.STARIMPRESS_8_TEMPLATE:
      case Id.STARCALC_8:
      case Id.STARCALC_8_TEMPLATE:
      case Id.STARCHART_8:
      case Id.STARCHART_8_TEMPLATE:
      case Id.STARMATH_8:
      case Id.STARMATH_8_TEMPLATE:
        return SOFFICE_FILEFORMAT_8;
      case Id.STARWRITER_60:
      case Id.STARWRITERWEB_60:
      case Id.STARWRITERGLOB_60:
      case Id.STARDRAW_60:
      case Id.STARIMPRESS_60:
      case Id.STARCALC_60:
      case Id.STARCHART_60:
      case Id.STARMATH_60:
        return SOFFICE_FILEFORMAT_60;
    }
    return 0;
  },
};
