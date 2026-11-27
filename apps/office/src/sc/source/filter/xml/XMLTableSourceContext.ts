/** @fileoverview Native link-source properties of a real Calc sheet from XMLTableSourceContext.cxx. */
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { convertDurationToDays } from "../../../../sax/source/tools/converter.duration";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { ScLinkMode } from "../../../inc/global";
import { ScXMLImportContext } from "./importcontext";
import type { ScXMLImport } from "./xmlimprt";

/** Applies source link properties independently of the external formula-cache contexts. */
export class ScXMLTableSourceContext extends ScXMLImportContext {
  /** Binds the linked sheet and source declaration. @param owner - Original Calc importer. @param sheet - Native sheet index. @param attributes - ODF link values. @returns Context. */
  constructor(
    owner: ScXMLImport,
    private readonly sheet: number,
    private readonly attributes: FastAttributeList,
  ) {
    super(owner);
  }

  /** Connects the imported source to the actual table. @returns Nothing. */
  override endFastElement(): void {
    const source = this.attributes;
    const href = source.get(XMLToken.XLINK_HREF);
    if (!href) return;
    const owner = this.GetScImport();
    const document = owner.GetDocument();
    const table = document.FetchTable(this.sheet);
    if (!table) return;
    const file = unicode(owner.GetAbsoluteReference(href));
    const currentName = new OUString(table.GetName());
    const name = unicode(source.get(XMLToken.TABLE_TABLE_NAME) ?? "");
    const filter = unicode(source.get(XMLToken.TABLE_FILTER_NAME) ?? "");
    const options = unicode(source.get(XMLToken.TABLE_FILTER_OPTIONS) ?? "");
    try {
      if (file.isEmpty() || !document.RenameTab(this.sheet, currentName, true)) return;
      const delay = source.get(XMLToken.TABLE_REFRESH_DELAY);
      const days: [number] = [0];
      const refresh =
        delay && convertDurationToDays(days, delay) ? Math.max(0, (days[0] * 86400) | 0) : 0;
      const mode =
        source.get(XMLToken.TABLE_MODE) === "copy-results-only"
          ? ScLinkMode.VALUE
          : ScLinkMode.NORMAL;
      document.SetLink(this.sheet, mode, file, filter, options, name, refresh);
    } finally {
      currentName.dispose();
      file.dispose();
      name.dispose();
      filter.dispose();
      options.dispose();
    }
  }
}
