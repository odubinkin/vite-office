/** @fileoverview Original apitest XServiceInfo assertions against actual ScModelObj and native UNO queries; no fake model, factory or service implementation. */
import { expect, it } from "vitest";
import { ScModelObj } from "../../../inc/docuno";
import { ScDocument } from "../../../inc/document";
import { ScDocShell } from "../docshell/docsh";
import { Reference, UNO_QUERY_THROW } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { XServiceInfo } from "../../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XChild } from "../../../../udkapi/com/sun/star/container/XChild";
import { XModel } from "../../../../offapi/com/sun/star/frame/XModel";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Original model service assertions run with a real caller-owned model. @param model - Actual model. @returns Nothing. */
function check(model: ScModelObj): void {
  const owner = new Reference(model),
    info = new Reference<XServiceInfo>(owner, UNO_QUERY_THROW, XServiceInfo.static_type),
    base = new Reference<XChild>(owner, UNO_QUERY_THROW, XChild.static_type);
  try {
    expect(info.get()).toBe(model);
    expect(base.get()).toBe(model);
    const impl = info.operatorStar().getImplementationName();
    try {
      expect(text(impl)).toBe("ScModelObj");
    } finally {
      impl.dispose();
    }
    const names = info.operatorStar().getSupportedServiceNames();
    try {
      expect(names.hasElements()).toBe(true);
      expect(names.getLength()).toBe(3);
      const expected = [
        "com.sun.star.sheet.SpreadsheetDocument",
        "com.sun.star.sheet.SpreadsheetDocumentSettings",
        "com.sun.star.document.OfficeDocument",
      ];
      for (let i = 0; i < names.getLength(); ++i) {
        const name = OUString.unacquired(names.operatorIndex(i));
        expect(text(name)).toBe(expected[i]);
        expect(info.operatorStar().supportsService(name)).toBe(true);
      }
      for (const value of [
        "ScModelObj",
        "",
        "com.sun.star.sheet.spreadsheetDocument",
        "com.sun.star.sheet.SpreadsheetDocument\0tail",
      ]) {
        const name = unicode(value);
        try {
          expect(info.operatorStar().supportsService(name)).toBe(false);
        } finally {
          name.dispose();
        }
      }
    } finally {
      names.dispose();
    }
    const unavailable = model.queryInterface(XModel.static_type());
    try {
      expect(unavailable.hasValue()).toBe(false);
    } finally {
      unavailable.dispose();
    }
  } finally {
    base.dispose();
    info.dispose();
    owner.dispose();
  }
}
it("ports original implementation-name, supported-name and supportsService assertions on the actual Calc model", /** Shared apitest assertions plus exact source ordering. Whole ODS fixture load remains unqualified. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    shell = new ScDocShell(doc);
  try {
    check(new ScModelObj(shell));
  } finally {
    shell.Dispose();
    doc.Dispose();
  }
});
it("preserves service identity for options-only and Dying Calc model states", /** Native service methods have no shell/initialization guard. @returns Nothing. */ () => {
  check(new ScModelObj(null));
  const doc = new ScDocument(),
    shell = new ScDocShell(doc),
    model = new ScModelObj(shell);
  const keep = new Reference(model);
  try {
    shell.Dispose();
    expect(model.GetDocument()).toBeNull();
    check(model);
  } finally {
    keep.dispose();
    shell.Dispose();
    doc.Dispose();
  }
});
