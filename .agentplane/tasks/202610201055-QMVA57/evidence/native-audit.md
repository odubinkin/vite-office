# Task47 native source audit

Pinned LibreOffice26.8.0.2,commit9bc445578031fecf56086729d8e4940c77e14d65.

Actual native owners,not replacement workbook/geometry/filter services,own the supported state. The current default-view/unprotected/unmerged normal-document branch is represented.

- `vendor/libreoffice-reference/sc/source/core/data/attarray.cxx:1701` — `void ScAttrArray::ChangeIndent`;SHA256 `dfd43a44c441b5723501c8424891220caa68a954817bb1fbda0b224bb59664dd`.
- `vendor/libreoffice-reference/sc/inc/table.hxx:1483` — `void ScTable::ApplyWithAllocation`;SHA256 `8960902f512b806a8776a2cada0b659215c622f91e45958b65665f4383fc223e`.
- `vendor/libreoffice-reference/sc/source/core/data/table2.cxx:3835` — `void ScTable::ShowRows`;SHA256 `c72ca245c9e9500ee11df0cb3072fc70f713a88f1912ac819c09d22cdda17e33`.
- `vendor/libreoffice-reference/sc/source/core/data/table2.cxx:1337` — `void ScTable::CopyToTable`;SHA256 `c72ca245c9e9500ee11df0cb3072fc70f713a88f1912ac819c09d22cdda17e33`.
- `vendor/libreoffice-reference/sc/source/core/data/table5.cxx:596` — `void ScTable::CopyRowHeight`;SHA256 `77af7b774748decb521f51ec414019f9031fd5b2a84da39c7a1d3c7cfbb709d1`.
- `vendor/libreoffice-reference/sc/source/core/data/FilterData.cxx:325` — `bool FilterData::setRowHidden`;SHA256 `a2742e204bf2d41e09d176dbec7b63e2864209626d69a52cce6b1236257b6a58`.
- `vendor/libreoffice-reference/sc/source/core/data/document.cxx:4646` — `void ScDocument::SetRowFiltered`;SHA256 `e89ce72a7e618225be9d61e531e36175787a32e246d5cbb0b4738a93f7e3d9da`.
- `vendor/libreoffice-reference/sc/source/ui/operation/ChangeIndentOperation.cxx:35` — `bool ChangeIndentOperation::runImplementation`;SHA256 `378d5b998f1d4aa7d3c950130a6e259a0bcf33b7d4e515de21ada343355e6a3a`.
- `vendor/libreoffice-reference/sc/source/ui/undo/undoblk.cxx:2131` — `void ScUndoIndent::Undo`;SHA256 `1c703ca905fead3be2ddfb4b647ff2304ba17490715997f0a8365fc02ca309db`.
- `vendor/libreoffice-reference/sc/source/ui/view/viewfunc.cxx:89` — `static void ShowFilteredRows`;SHA256 `cdf4e2940ceb1d585b3acf672bdbd21213e16cf09c67bd55f23b070e7bee3260`.
- `vendor/libreoffice-reference/sc/source/ui/view/viewfunc.cxx:3108` — `void ScViewFunc::ChangeIndent`;SHA256 `cdf4e2940ceb1d585b3acf672bdbd21213e16cf09c67bd55f23b070e7bee3260`.
- `vendor/libreoffice-reference/sc/source/ui/view/viewutil.cxx:223` — `void ScViewUtil::UnmarkFiltered`;SHA256 `47856c9d8100c4abc6bfa516ad0fead9d32fe9d044c1ef7ab4aeb023a99d23bc`.
- `vendor/libreoffice-reference/sc/source/ui/view/cellsh3.cxx:580` — `case FID_ROW_HEIGHT:`;SHA256 `92959feb0ed284ea03da5cb864ab99c7a86e0f076db4205ce00fe3f165612b4d`.
- `vendor/libreoffice-reference/sc/source/ui/miscdlgs/mtrindlg.cxx:26` — `ScMetricInputDlg::ScMetricInputDlg`;SHA256 `19e46c30e3c9456ed71d54d22ce1dd33e17d88e08824506530f5d45506eb0d6b`.
- `vendor/libreoffice-reference/sc/source/ui/inc/mtrindlg.hxx:37` — `tools::Long           nMinimum`;SHA256 `43dbeb315e4cda6f7aa68ad990818be572c276fe305b89f024e321967a2d56a6`.
- `vendor/libreoffice-reference/sc/source/ui/unoobj/cellsuno.cxx:1885` — `case ATTR_INDENT:`;SHA256 `55c8357e6ad0b4c98ada78da72262c151e35a8e5e230d91c5ef5c3b71f817304`.
- `vendor/libreoffice-reference/sc/source/filter/xml/xmlstyle.cxx:102` — `SC_UNONAME_PINDENT`;SHA256 `6a190cb7817269fe24d9a1ff65f35697e54cac7ac573446c56e18c2b190698df`.
- `vendor/libreoffice-reference/sc/source/filter/xml/xmlrowi.cxx:198` — `bool bFiltered (false)`;SHA256 `9ce1129be5f861dfe21cd0cb68c7feda699aef3a0e27c3cc6cd37ce801ae39cc`.
- `vendor/libreoffice-reference/xmloff/source/style/xmlbahdl.cxx:185` — `bool XMLMeasurePropHdl::importXML`;SHA256 `008d43838ad2bf131230277f3a4dc3e9b5bd2ca4331f83e1778e010ad4b3aefd`.
- `vendor/libreoffice-reference/xmloff/inc/xmlbahdl.hxx:64` — `explicit XMLMeasurePropHdl`;SHA256 `62101ff943e9856dd3f04f31701a4a09434ea3d216930059085201b744a175c8`.
- `vendor/libreoffice-reference/sc/source/ui/view/output2.cxx:2661` — `void ScOutputData::DrawEditParam::calcMargins`;SHA256 `6cdeea262b4fcd0aed313a76ebf222142a5e885bed5d6be766e994c2e009d4d3`.

The metric constructor retains required minimum;the native factory supplies2 explicitly. ShowFilteredRows skips genuine filtered runs;ShowRows clears filtering. Indent coerces justification independently of numeric changes,and redo re-evaluates real widths. Geometry-only copies retain raw heights/flags and hidden/filtered runs. ODS uses native signed16 HMM conversions,not direct twip serialization. Browser margin projection follows calcMargins over actual items;native string cache/device parity remains unported.

CALC224–226 record suspicious source behavior. No network,branch,merge,other checkout,or unrelated active-task mutation occurred.
