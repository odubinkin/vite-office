/** @fileoverview Named paragraph styles with only child tab-stop properties retain explicit clears without spurious XML attributes. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { RES_PARATR_TABSTOP } from "../../../inc/hintids";
import { SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { createTabs } from "../../../../../test/tab-item-fixtures";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { writeOdtDocument } from "./wrtxml";
import { readOdtDocument } from "./swxml";

it("round trips a named style containing only an explicit empty tab sequence", /** Exercises real package persistence when paragraph children exist without paragraph attributes. @returns Completion. */ async () => {
  const doc = new SwDoc(),
    metadata = createDocument({ id: "tabs-only", suiteId: "writer", title: "Tabs" });
  try {
    const style = doc.MakeTextFormatColl("TabsOnly");
    style.SetFormatAttr(createTabs(RES_PARATR_TABSTOP, []));
    const bytes = writeOdtDocument(doc, metadata);
    const styles = await new ZipFile(bytes).readTextEntry("styles.xml");
    expect(styles).toContain(
      "<style:paragraph-properties><style:tab-stops/></style:paragraph-properties>",
    );
    const reopened = await readOdtDocument(bytes, metadata);
    try {
      const tabs = reopened.document
        .GetTextFormatColl(style.id)
        .GetAttrSet()
        .Get(RES_PARATR_TABSTOP) as SvxTabStopItem;
      expect(tabs.Count()).toBe(0);
    } finally {
      reopened.document.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});
