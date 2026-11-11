# Pinned package QA data

Unmodified LibreOffice26.8.0.2 fixtures from commit9bc445578031fecf56086729d8e4940c77e14d65.
Upstream licensing applies. The normal-open assertions in package/qa/cppunit/test_zippackage.cxx are
translated at the current real ZIP transport boundary; no service factory is fabricated and recovery
is intentionally outside this application slice.

- `tdf163341.ods`: `package/qa/cppunit/data/tdf163341.ods`, SHA256
  `576284324ca7c41f9b2047121ca578cbb704696e3519dd2cf6d360b88e66901d`.
- `unicode-path.docx`: `package/qa/cppunit/data/unicode-path.docx`, SHA256
  `4d8b0b3dd8ada4eb6bf141e88f8dffc07f993545d9fdd25f505d8ac839918946`.
- `unicode-path.odt`: `package/qa/cppunit/data/unicode-path.odt`, SHA256
  `c55888e2a42314f3f369f24e6044ace3bc780144fd062702c4533dd739170ff3`.
- `dd-deflated.docx`: `package/qa/cppunit/data/dd-deflated.docx`, SHA256
  `701532bb07094f86361d51e046c3132432ecdba559e9fa4bdf0f5aac6dfb17a4`. Original normal
  `testDataDescriptorDeflatedDOCX` rejection is asserted at LOC consistency. The STORED descriptor
  fixture requires the still-unported native package/encryption service graph; its policy is not
  moved into ZipFile.
- `duplicate-files.odt`: `package/qa/cppunit/data/duplicate-files.odt`, SHA256
  `256b573143d767f144e6bc3ee128bd3ff4b2e502d1896360f0b6c5356e073026`. Unmodified normal source
  duplicate/case/overlap/gap assertion at the real current ZIP layer.
- `casing.docx`: `package/qa/cppunit/data/casing.docx`, SHA256
  `b616af60520ba5acee81d0dd290780cedf0db45b9c40706f4c95574c694976b0`. Unmodified normal source
  duplicate/case/overlap/gap assertion at the real current ZIP layer.
- `overlap.docx`: `package/qa/cppunit/data/overlap.docx`, SHA256
  `c58f5b46ed632a6df0551a40ac02ca7899420eaf5001743119cf423eaeb4bb03`. Unmodified normal source
  duplicate/case/overlap/gap assertion at the real current ZIP layer.
- `inner-gap.docx`: `package/qa/cppunit/data/inner-gap.docx`, SHA256
  `7cd806987aeb38bd3013786d2ee5988f5074db9af040c3a49da019911c674b86`. Unmodified normal source
  duplicate/case/overlap/gap assertion at the real current ZIP layer.
