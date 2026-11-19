/** @fileoverview Actual native flavor value/Any/sequence semantics and original registry lookup/registration contracts; no clipboard, storage or fake service provider is installed. */
import { afterEach, expect, it } from "vitest";
import { SotExchange } from "./exchange";
import { SotClipboardFormatId as Id } from "../../inc/formats";
import { SotStorage } from "../sdstor/storage";
import {
  DataFlavor,
  cppu_detail_getUnoType_DataFlavor as flavorType,
} from "../../../offapi/com/sun/star/datatransfer/DataFlavor";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { UnoType } from "../../../cppu/inc/unotype";
import type { XStorage } from "../../../offapi/com/sun/star/embed/XStorage";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
/** Original UTF16 input view binding. @param value - Fixture text. @returns Borrowed view. */
function view(value: string): Uint16Array {
  const text = u(value);
  return text.getStr().subarray(0, text.getLength());
}
/** Actual flavor value with a source-declared Type. @param mime - Source MIME. @param name - Human name. @returns Actual owner. */
function flavor(mime: string, name = ""): DataFlavor {
  return own(new DataFlavor(u(mime), u(name), UnoType.get(["Sequence", "sal_Int8"])));
}
it("copies actual native DataFlavor fields through Any and sequence compound storage", /** Checks that copies actual native DataFlavor fields through Any and sequence compound storage. @returns Nothing. */ () => {
  const source = flavor("application/test-flavor", "Human"),
    copy = own(new DataFlavor(source)),
    any = own(new Any(source, flavorType)),
    result = own(new DataFlavor());
  expect(source.equals(copy)).toBe(true);
  source.MimeType = u("changed");
  expect(read(new OUString(copy.MimeType))).toBe("application/test-flavor");
  expect(any.extract(result, flavorType)).toBe(true);
  expect(read(new OUString(result.HumanPresentableName))).toBe("Human");
  expect(result.DataType.equals(UnoType.get(["Sequence", "sal_Int8"]))).toBe(true);
  const seq = own(
      new (Sequence.specialize<DataFlavor>(flavorType, 24))(
        {
          /** Borrows the actual copied flavor. @returns Native initialized aggregate. */
          get() {
            return copy;
          },
        },
        1,
      ),
    ),
    borrowed = DataFlavor.unacquired(
      seq.operatorIndex(0) as unknown as Parameters<typeof DataFlavor.unacquired>[0],
    );
  expect(read(new OUString(borrowed.MimeType))).toBe("application/test-flavor");
  expect(borrowed.DataType.equals(copy.DataType)).toBe(true);
});
it("preserves strict versus parameter-permissive builtin lookup and case sensitivity", /** Checks that preserves strict versus parameter-permissive builtin lookup and case sensitivity. @returns Nothing. */ () => {
  expect(SotExchange.GetFormatIdFromMimeType(view("application/vnd.oasis.opendocument.text"))).toBe(
    Id.STARWRITER_8,
  );
  expect(
    SotExchange.GetFormatIdFromMimeType(view("application/vnd.oasis.opendocument.text-template")),
  ).toBe(Id.STARWRITER_8_TEMPLATE);
  expect(SotExchange.GetFormatIdFromMimeType(view("application/vnd.sun.xml.calc"))).toBe(
    Id.STARCALC_60,
  );
  expect(
    SotExchange.GetFormatIdFromMimeType(
      view("application/vnd.oasis.opendocument.text;charset=utf-8"),
    ),
  ).toBe(Id.NONE);
  expect(
    SotExchange.GetFormat(flavor("application/vnd.oasis.opendocument.text;charset=utf-8")),
  ).toBe(Id.STARWRITER_8);
  expect(SotExchange.GetFormat(flavor("application/vnd.oasis.opendocument.text-illegal"))).toBe(
    Id.NONE,
  );
  expect(SotExchange.GetFormat(flavor("APPLICATION/VND.OASIS.OPENDOCUMENT.TEXT"))).toBe(Id.NONE);
  expect(SotExchange.GetFormat(flavor("text/plain;charset=utf-16;extra=1"))).toBe(Id.NONE);
  expect(SotExchange.GetFormat(flavor("image/png;anything"))).toBe(Id.PNG);
});
it("retains source legacy chart alias and complete source flavor metadata", /** Checks that retains source legacy chart alias and complete source flavor metadata. @returns Nothing. */ () => {
  expect(SotExchange.RegisterFormatName(u("StarChartDocument 5.0"))).toBe(Id.STARCHART_50);
  expect(
    SotExchange.GetFormat(
      flavor(
        'application/x-openoffice-starchartdocument-50;windows_formatname="StarChartDocument 5.0"',
      ),
    ),
  ).toBe(Id.STARCHART_50);
  expect(read(SotExchange.GetFormatName(Id.STARWRITER_8))).toBe("Writer 8");
  expect(read(SotExchange.GetFormatMimeType(Id.STARCALC_8_TEMPLATE))).toBe(
    "application/vnd.oasis.opendocument.spreadsheet-template",
  );
  const value = flavor("old", "old");
  expect(SotExchange.GetFormatDataFlavor(Id.STRING, value)).toBe(true);
  expect(value.DataType.equals(UnoType.get("OUString"))).toBe(true);
  expect(SotExchange.GetFormatDataFlavor(Id.PNG, value)).toBe(true);
  expect(value.DataType.equals(UnoType.get(["Sequence", "sal_Int8"]))).toBe(true);
});
it("retains real dynamic flavor copies, source names/types and exact dynamic MIME matching", /** Checks that retains real dynamic flavor copies, source names/types and exact dynamic MIME matching. @returns Nothing. */ () => {
  const source = flavor("application/native-sot-custom", "Custom"),
    id = SotExchange.RegisterFormat(source);
  expect(id).toBeGreaterThan(Id.USER_END);
  source.MimeType = u("changed-after-registration");
  const result = own(new DataFlavor());
  expect(SotExchange.GetFormatDataFlavor(id, result)).toBe(true);
  expect(read(new OUString(result.MimeType))).toBe("application/native-sot-custom");
  expect(result.DataType.equals(UnoType.get(["Sequence", "sal_Int8"]))).toBe(true);
  expect(SotExchange.RegisterFormat(flavor("application/native-sot-custom", "ignored"))).toBe(id);
  expect(SotExchange.RegisterFormatName(u("Custom"))).toBe(id);
  expect(SotExchange.GetFormat(flavor("application/native-sot-custom;more=1"))).toBe(Id.NONE);
  expect(SotExchange.GetFormatIdFromMimeType(view("application/native-sot-custom"))).toBe(id);
  const nameId = SotExchange.RegisterFormatName(u("SourceNameOnly"));
  expect(SotExchange.RegisterFormatName(u("SourceNameOnly"))).toBe(nameId);
  expect(SotExchange.GetFormatDataFlavor(nameId, result)).toBe(true);
  expect(result.DataType.equals(UnoType.get("OUString"))).toBe(true);
  const mimeId = SotExchange.RegisterFormatMimeType(u("application/native-sot-mime"));
  expect(SotExchange.RegisterFormatMimeType(u("application/native-sot-mime"))).toBe(mimeId);
  expect(read(SotExchange.GetFormatName(mimeId))).toBe("application/native-sot-mime");
});
it("preserves default output on unknown dynamic format and real null-storage version fallback", /** Checks that preserves default output on unknown dynamic format and real null-storage version fallback. @returns Nothing. */ () => {
  const value = flavor("old", "old"),
    unknown = Id.USER_END + 10000;
  expect(SotExchange.GetFormatDataFlavor(unknown, value)).toBe(false);
  expect(value.MimeType.isEmpty()).toBe(true);
  expect(value.HumanPresentableName.isEmpty()).toBe(true);
  expect(value.DataType.equals(UnoType.get("void"))).toBe(true);
  expect(read(SotExchange.GetFormatMimeType(unknown))).toBe("");
  expect(read(SotExchange.GetFormatName(unknown))).toBe("");
  const empty = own(new Reference<XStorage>());
  expect(SotStorage.GetFormatID(empty)).toBe(Id.NONE);
  expect(SotStorage.GetVersion(empty)).toBe(0);
});

it("moves native flavor strings while preserving Type copy construction and swap assignment", /** Exercises compiler memberwise operations on the original declared field types. @returns Nothing. */ () => {
  const source = flavor("application/native-flavor-move", "Moved"),
    expected = own(new DataFlavor(source)),
    moved = own(DataFlavor.move(source));
  expect(moved.equals(expected)).toBe(true);
  expect(source.MimeType.isEmpty()).toBe(true);
  expect(source.HumanPresentableName.isEmpty()).toBe(true);
  expect(source.DataType.equals(expected.DataType)).toBe(true);
  source.DataType = UnoType.get("OUString");
  source.moveAssign(moved);
  expect(source.equals(expected)).toBe(true);
  expect(moved.DataType.equals(UnoType.get("OUString"))).toBe(true);
  expect(moved.notEquals(expected)).toBe(true);
  expect(read(SotExchange.GetFormatMimeType(SotExchange.RegisterFormat(source)))).toBe(
    "application/native-flavor-move",
  );
});
