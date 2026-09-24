# Certification ODT diagnostic baseline

This is the phase 0 baseline for [the import plan](certification-odt-import-plan.md).
The private document remains outside Git. No document text, URL, bookmark name,
font bytes, or full diagnostic report is tracked. The report was generated with:

```bash
npx tsx scripts/libreoffice-inventory/odt-import-diagnostics-cli.ts <authorized-local-odt-path> > .agentplane/tmp/certification-diagnostic.json
```

The CLI uses `SwXMLReader` and the same bounded ZIP/XML parser as normal import.
It groups structural diagnostics by stream, XML path, kind and name; frequency
counts every occurrence. Its loss class is deliberately conservative. An
`unclassified` entry needs manual review before a phase claims it is harmless.
The callback receives no attribute values or character data. Ordinary imports
without the callback retain their existing console behavior.

## Local sample on 2026-09-24

The import completed, but the canonical document is incomplete. This is the
baseline before any feature phase changes the importer.

| Measure | XML package | Canonical Writer model |
| --- | ---: | ---: |
| Paragraph elements | 74 | 59 paragraphs |
| Table rows / cells | 5 / 15 | 0 / 0 |
| Hyperlink elements / link runs | 19 | 14 |
| Bookmarks | 8 | 0 |
| Soft page breaks | 9 | 0 |
| Lists / list paragraphs | 1 list | 4 paragraphs |
| `style:style` elements across styles and content streams | 60 | not measured as named style count |

The 15 missing paragraph elements occur in table cells. The five missing link
runs also align with the table's unimported content, but link positions require
phase 3 and table preservation requires phase 5 before fidelity can be claimed.
The page descriptor is 11,906 × 16,838 twips with 1,417-twip margins on all
sides. Distinct imported paragraph metrics, in twips, are left margins
`0, 600, 720, 1440`, right margins `0, 600`, first-line indents
`-360, 0, 720`, and print widths `7631, 7871, 8351, 8711, 9071`.

The report groups 490 warning occurrences into 184 structural entries:

| Conservative loss class | Occurrences | Examples to investigate |
| --- | ---: | --- |
| Content | 41 | table cells and cell styles |
| Structure | 22 | bookmark names and soft page breaks |
| Styling | 331 | keep/break properties, script fonts, list geometry |
| Metadata | 16 | document statistics |
| Unclassified | 80 | theme declarations and outline/list extensions |

The kinds are 437 unknown attributes, 18 unsupported known attributes and 35
unknown elements. There was no import error. This classification is a triage
aid, not a statement that all 490 warnings correspond to distinct lost effects.
Phase 1 must review the theme and extension entries individually; later phases
must account for the structural and styling deltas.

## Pinned upstream fixture baseline

`scripts/libreoffice-inventory/odt-import-diagnostics.test.ts` reads the
already tracked `sw/qa/extras/odfimport/data/feature_text.odt`, whose pinned
upstream source test is `sw/qa/extras/odfimport/odffeatures.cxx` at commit
`9bc445578031fecf56086729d8e4940c77e14d65`. It asserts one XML and
canonical paragraph, a specific font declaration diagnostic and absence of
the fixture text in the report. The existing
`odt-upstream-fixtures.test.ts` remains the import/export/reimport regression
matrix for that file, its bold/italic variants, list, style and hyperlink
fixtures. The new metric test also reads the already tracked
`sw/qa/extras/odfexport/data/tdf114287.odt`, used by upstream
`sw/qa/extras/odfexport/odfexport4.cxx::testTdf114287`, and asserts that the
report retains distinct paragraph print widths. No new upstream bytes were
copied for this phase, so the baseline's fixture-copy provenance gate was not
needed.

## Command and dialog inventory for editable phases

The command names and menu positions below come from pinned
`sw/uiconfig/swriter/menubar/menubar.xml`; command declarations are in
`sw/sdi/swriter.sdi`. Dialog resources are under
`sw/uiconfig/swriter/ui/`. Browser-side paths refer to the current checkout.
Defaults and field validation must be checked at implementation time against
the cited upstream dialogs and Writer handlers; this matrix establishes the
ownership and gaps.

| Planned setting | Pinned upstream command and dialog | Current local control | Phase |
| --- | --- | --- | ---: |
| Paragraph keep, breaks, widow/orphan, indent, spacing | `.uno:ParagraphDialog`, `indentpage.ui`, `numparapage.ui`; Format menu | `WriterParagraphDialog`, formatting toolbar; these fields are not all exposed | 2 |
| Character underline, color, shading and script fonts | `.uno:FontDialog`, `characterproperties.ui`; Format menu | `WriterFormattingToolbar`; no equivalent full character dialog | 2, 4 |
| Page geometry and master-page settings | `.uno:PageDialog`, `pagestylespanel.ui`, `pageformatpanel.ui`; Format menu | `WriterPageStyleDialog` | 2, 4 |
| Bookmarks and navigation | `.uno:InsertBookmark`, `insertbookmark.ui`, `bookmarkmenu.ui`; Insert menu | no bookmark command or dialog | 3 |
| Hard break insertion | `.uno:InsertBreak`, `insertbreak.ui`; Insert menu | no break dialog; imported soft break remains a separate model hint | 3 |
| Hyperlink target and display | `.uno:HyperlinkDialog`; Insert menu | `WriterHyperlinkDialog` and command exist | 3 |
| Font family selection | `.uno:FontDialog`, `characterproperties.ui`; Format menu | toolbar font selector exists; embedded-font availability is not shown | 4 |
| Table insertion and properties | `.uno:InsertTable`, `.uno:TableDialog`, `tableproperties.ui`, `tablecolumnpage.ui`, `tabletextflowpage.ui`; Table menu | no table model, command or dialog | 5 |

For bookmarks, breaks and tables, the pinned Writer handlers are in
`sw/source/uibase/shells/textsh1.cxx` and `basesh.cxx`. Browser feature tasks
must map keyboard and accessibility behavior as well as visible fields before
their UI gates pass.
