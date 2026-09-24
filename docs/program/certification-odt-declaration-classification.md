# Certification ODT declaration classification

Phase 1 of [the import plan](certification-odt-import-plan.md) recognizes exact
expanded XML names and silences diagnostics only inside contexts explicitly
classified as having no modeled document effect. The source document and full
reports remain untracked.

## Local acceptance comparison

The same authorized local ODT was run through the phase 0 CLI before and after
this phase. The XML inventory and canonical paragraph, link, list, page and
paragraph-metric projection were identical. The import completed both times.

| Diagnostic count | Phase 0 | Phase 1 |
| --- | ---: | ---: |
| Warning occurrences | 490 | 445 |
| Distinct stream/path/kind/name groups | 184 | 173 |
| Unknown attributes | 437 | 337 |
| Unknown elements | 35 | 34 |
| Known but unsupported attributes | 18 | 74 |

The increased known-but-unsupported count is intentional. Recognizing a token
does not claim its semantic value is supported. The new `style:text-properties`
context policy also exposes known font properties that were previously silent.
For example, `style:default-outline-level` remains at 9 occurrences, generic
font family at 17, font pitch at 19, and font charset at 3. Later vertical
phases own their Writer state, UI and export behavior.

## Deliberate ignore contexts

| Fields | Reason safe for this local sample | Pinned LibreOffice reference |
| --- | --- | --- |
| `loext:theme` and its nested theme name/color declarations | The package contains no theme-reference attributes outside the declaration subtree; current paragraph and page properties use direct values. Theme colors are not document content nodes. | `xmloff/source/core/xmltoken.cxx` theme and loext tokens; `xmloff/source/style/xmlstyle.cxx` style ownership |
| `text:sequence-decls` with `text:name` and `text:display-outline-level` | The sample contains zero `text:sequence` fields, so these declarations have no visible sequence value to resolve. | `xmloff/source/text/txtvfldi.cxx` handles sequence field display outline level |
| `meta:document-statistic` count attributes | Derived metadata counts have no Writer edit/layout effect in this browser slice; the report measures live XML/canonical counts independently. | `sw/source/filter/xml/xmlimp.cxx` metadata import ownership |
| `settings.xml`, RDF and thumbnail package entries | The validated ZIP and manifest recognize these resources; they are not Writer body nodes and produce no filter warning in this sample. | `package/source`, `sw/source/filter/xml/swxml.cxx` |

Other `SvXMLIgnoreContext` uses retain unknown-attribute diagnostics. In
particular, table, font resource, header/footer, outline-list and graphic
properties are not classified harmless by this phase.

## Semantic properties deferred with explicit diagnostics

`style:default-outline-level` is an outline-style property in pinned
`xmloff/source/text/txtprmap.cxx` and `txtstyli.cxx`; it needs canonical
numbering state and an editing path. `style:font-family-generic`,
`style:font-pitch` and `style:font-charset` are parsed by pinned
`xmloff/source/style/XMLFontStylesContext.cxx` into font properties. Their
style-text variants are in `xmloff/source/text/txtprmap.cxx`. They remain
unsupported-attribute diagnostics until font identity and fallback are modeled
in phase 4. `loext:num-list-format` and style/layout extensions remain visible
diagnostics for later list, layout or table phases. Invalid semantic values
cannot disappear into an ignore context.

## Source-backed tests and provenance

`apps/office/src/sw/source/filter/xml/odt-declarations.test.ts` opens the
already tracked `sw/qa/uitest/data/styles.odt` (pinned upstream
`sw/qa/uitest/styleInspector/styleInspector.py::test_listbox_is_updated`) and
`sw/qa/extras/odfimport/data/feature_text.odt` (pinned upstream
`sw/qa/extras/odfimport/odffeatures.cxx::testFeatureText`). It asserts canonical paragraph
counts and explicit remaining font diagnostics. Synthetic XML tests cover the
theme/sequence/statistic ignore contexts, exact namespace matching, malformed
semantic values and the default diagnostic behavior of other ignored subtrees.
No upstream binary was copied for this phase.
