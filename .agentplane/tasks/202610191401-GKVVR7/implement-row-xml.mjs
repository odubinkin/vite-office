import fs from 'node:fs';
const root='apps/office/src/';
const edit=(p,fn)=>{let s=fs.readFileSync(root+p,'utf8');fs.writeFileSync(root+p,fn(s));};
edit('xmloff/source/core/xmltoken.ts',s=>s.replace('  STYLE_FONT_SIZE_COMPLEX,','  STYLE_FONT_SIZE_COMPLEX,\n  STYLE_USE_OPTIMAL_ROW_HEIGHT,').replace('  [ODF_NAMESPACES.style, "font-size-complex", XMLToken.STYLE_FONT_SIZE_COMPLEX],','  [ODF_NAMESPACES.style, "font-size-complex", XMLToken.STYLE_FONT_SIZE_COMPLEX],\n  [ODF_NAMESPACES.style, "use-optimal-row-height", XMLToken.STYLE_USE_OPTIMAL_ROW_HEIGHT],'));
edit('sc/source/filter/xml/xmlimprt.ts',s=>s.replace('import { XMLTableStylesContext }','import type { ScTable } from "../../../inc/table";\nimport { RowHeightContext } from "../../../inc/rowheightcontext";\nimport { XMLTableStylesContext }').replace('  private body = false;',`  private body = false;
  private readonly rowStyles = new Map<string, { height: number | null; optimal: boolean | null }>();
  /** Registers consumed native row-style properties. @param name - Style. @param height - Twips. @param optimal - Automatic flag. @returns Nothing. */
  AddRowStyle(name: string, height: number | null, optimal: boolean | null): void { this.rowStyles.set(name, { height, optimal }); }
  /** Applies row style directly to actual sheet storage. @param name - Style. @param tab - Sheet. @param first - First row. @param last - Last row. @returns Nothing. */
  ApplyRowStyle(name: string, tab: number, first: number, last: number): void {
    const style = this.rowStyles.get(name);
    if (!style) { this.unsupported("row style"); return; }
    const table = this.document.FetchTable(tab) as ScTable;
    if (style.height !== null) table.SetRowHeightOnly(first, last, style.height);
    if (style.optimal !== null) table.SetManualHeight(first, last, !style.optimal);
  }`).replace('      if (!this.body) throw new Error("ODS spreadsheet body is missing");',`      if (!this.body) throw new Error("ODS spreadsheet body is missing");
      for (let tab = 0; tab < this.document.GetTableCount(); tab++)
        (this.document.FetchTable(tab) as ScTable).SetOptimalHeight(new RowHeightContext(this.document.MaxRow(), 1 / 15), 0, this.document.MaxRow(), true);`).replace('      this.autoStyles.clear();','      this.autoStyles.clear();\n      this.rowStyles.clear();'));
edit('sc/source/filter/xml/xmlstyli.ts',s=>s.replace('    if (\n      element !== XMLToken.STYLE_STYLE',`    if (element === XMLToken.STYLE_STYLE && attributes.get(XMLToken.STYLE_FAMILY) === "table-row")
      return new XMLTableRowStyleContext(this.owner, attributes.require(XMLToken.STYLE_NAME, "row style name"));
    if (
      element !== XMLToken.STYLE_STYLE`)+`
/** Native row style property context; properties are applied directly to ScTable row storage. */
class XMLTableRowStyleContext extends ScXMLImportContext {
  private height: number | null = null;
  private optimal: boolean | null = null;
  /** Binds importer and style name. @param owner - Importer. @param name - Style. @returns Context. */
  constructor(private readonly owner: ScXMLImport, private readonly name: string) { super(owner); }
  /** Converts native row-height properties in twips. @param element - Child token. @param attributes - Properties. @returns Ignored leaf. */
  override createFastChildContext(element: XMLToken, attributes: FastAttributeList): SvXMLImportContext {
    if (element !== XMLToken.STYLE_TABLE_ROW_PROPERTIES) { this.owner.unsupported("row style properties"); return new SvXMLIgnoreContext(true); }
    attributes.assertOnly([XMLToken.STYLE_ROW_HEIGHT, XMLToken.STYLE_USE_OPTIMAL_ROW_HEIGHT], "Calc row geometry");
    const height = attributes.get(XMLToken.STYLE_ROW_HEIGHT), optimal = attributes.get(XMLToken.STYLE_USE_OPTIMAL_ROW_HEIGHT);
    if (height !== null) {
      this.height = new SvXMLUnitConverter("twip").convertMeasureToCore(height, 0, 65535);
      if (this.height === null) this.owner.unsupported("invalid row height");
    }
    if (optimal !== null) {
      if (optimal === "true" || optimal === "false") this.optimal = optimal === "true";
      else this.owner.unsupported("invalid optimal row height");
    }
    return new SvXMLIgnoreContext(true);
  }
  /** Transfers parsed row properties. @returns Nothing. */
  override endFastElement(): void { this.owner.AddRowStyle(this.name, this.height, this.optimal); }
}
`);
edit('sc/source/filter/xml/xmlrowi.ts',s=>s.replace('    if (attributes.get(XMLToken.TABLE_STYLE_NAME) !== null) table.owner.unsupported("row style");',`    const style = attributes.get(XMLToken.TABLE_STYLE_NAME);
    if (style !== null) table.owner.ApplyRowStyle(style, table.tab, this.start, Math.min(table.owner.GetDocument().MaxRow(), this.start + this.repeat - 1));`));
edit('sc/source/filter/xml/xmlexprt.ts',s=>s.replace('import { CellType }','import { CRFlags } from "../../../inc/global";\nimport { CellType }').replace('  private readonly styles = new Map<string, string>();','  private readonly styles = new Map<string, string>();\n  private readonly rowStyles = new Map<string, string>();').replace('    this.styles.clear();','    this.styles.clear();\n    this.rowStyles.clear();').replace('      const iterator = new ScHorizontalCellIterator',`      for (let r = 0; r <= MAXROW;) {
        const h = table.GetRowHeightRange(r), f = table.GetRowFlagsRange(r), end = Math.min(h.mnRow2, f.mnRow2);
        if (h.mnValue !== table.GetOptimalMinRowHeight() || (f.maValue & CRFlags.ManualSize)) maxRow = Math.max(maxRow, end);
        r = end + 1;
      }
      const iterator = new ScHorizontalCellIterator`).replace('        let endRow = maxRow;',`        const heightRun = table.GetRowHeightRange(currentRow), flagsRun = table.GetRowFlagsRange(currentRow);
        let endRow = Math.min(maxRow, heightRun.mnRow2, flagsRun.mnRow2);
        const key = heightRun.mnValue + "," + ((flagsRun.maValue & CRFlags.ManualSize) ? "false" : "true");
        let rowStyle = this.rowStyles.get(key);
        if (rowStyle === undefined) { rowStyle = "ro" + (this.rowStyles.size + 1); this.rowStyles.set(key, rowStyle); }`).replace('body += `<table:table-row${repeat', 'body += `<table:table-row table:style-name="${rowStyle}"${repeat').replace('    return `<?xml version=',`    for (const [key, name] of this.rowStyles) {
      const [height, optimal] = key.split(",");
      automatic += \`<style:style style:name="\${name}" style:family="table-row"><style:table-row-properties style:row-height="\${Number(height) / 20}pt" style:use-optimal-row-height="\${optimal}"/></style:style>\`;
    }
    return \`<?xml version=`));
