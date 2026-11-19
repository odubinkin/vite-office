/** @fileoverview Real Calc imported document, model service query and original service catalog in main/Worker; not a complete spreadsheet model/factory or XLSX filter. */
import { ScModelObj } from "../../apps/office/src/sc/inc/docuno";
import type { ScDocument } from "../../apps/office/src/sc/inc/document";
import { ScDocShell } from "../../apps/office/src/sc/source/ui/docshell/docsh";
import { ScServiceProvider } from "../../apps/office/src/sc/source/ui/unoobj/servuno";
import { ScServiceProviderType } from "../../apps/office/src/sc/inc/servuno";
import {
  Reference,
  UNO_QUERY_THROW,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import { XServiceInfo } from "../../apps/office/src/cppu/inc/com/sun/star/lang/XServiceInfo";
import { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import { unicode, text } from "../../apps/office/src/i18nlangtag/source/isolang/isolang.tables";
/** Queries the actual model owning the imported document, then releases source owners. @param document - Actual canonical imported document. @returns Exact source-contract observation. */
export function probeNativeCalcModelServices(document: ScDocument): boolean {
  const shell = new ScDocShell(document),
    model = new ScModelObj(shell),
    owner = new Reference(model),
    service = new Reference<XServiceInfo>(owner, UNO_QUERY_THROW, XServiceInfo.static_type),
    name = unicode("com.sun.star.sheet.SpreadsheetDocument"),
    catalog = ScServiceProvider.GetAllServiceNames(),
    implementation = service.operatorStar().getImplementationName();
  try {
    return (
      model.GetDocument() === document &&
      service.get() === model &&
      text(implementation) === "ScModelObj" &&
      service.operatorStar().supportsService(name) &&
      catalog.getLength() === 60 &&
      ScServiceProvider.GetProviderType(OUString.unacquired(catalog.operatorIndex(0))) ===
        ScServiceProviderType.SHEET
    );
  } finally {
    implementation.dispose();
    catalog.dispose();
    name.dispose();
    service.dispose();
    owner.dispose();
    shell.Dispose();
  }
}
