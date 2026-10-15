---
id: "202610151815-3Q0R95"
title: "Extend shared Font metadata for Calc document defaults"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T18:16:17.645Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement shared native stored Font metadata for real Calc document defaults and preserve it across existing Writer value and transport consumers."
events:
  -
    type: "status"
    at: "2026-10-15T18:16:21.518Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement shared native stored Font metadata for real Calc document defaults and preserve it across existing Writer value and transport consumers."
doc_version: 3
doc_updated_at: "2026-10-15T18:16:21.518Z"
doc_updated_by: "CODER"
description: "Task162: implement native stored Font style/family/pitch/charset values required by ScDocumentPool in the existing VCL owner, with copy/equality and const contracts; preserve them through real Writer numbering copies and Worker transport. Configuration lookup/default-font resolution remains a subsequent actual provider, never a fake MaybeAskConfig implementation."
sections:
  Summary: "Task162: extend the existing shared Font stored metadata required by Calc docpool font items; prevent loss in real Writer numbering copies and Worker records."
  Scope: "Existing vcl/source/font/font.ts; one native-metadata test; existing writer-document-codec.ts and focused transport test; relevant shared runtime/provenance/capability records and calc-core/readiness docs (up to14 intentional files). No font-provider placeholder, MaybeAskConfig approximation, memory manager, native compilation/probe, UI localization, formula/ODS stub or unrelated Writer coverage repair."
  Plan: "Implement default-empty style, FAMILY_DONTKNOW, PITCH_DONTKNOW and RTL_TEXTENCODING_DONTKNOW, native getters/setters and copy/COW/equality in existing Font. Broaden const exclusion to all mutators. Preserve newly represented values through native numbering copies and Writer Worker encoding/decoding with validation and old records retaining original defaults. Update authoritative existing inventories without claiming full Font/default-device parity; record exact native source evidence. Run focused shared/Writer tests with strict raw100 on changed shared owner and whole Calc raw100,13 established source gates and required build/browser checks with reference symlinks absent as applicable. Commit verified source before evaluator/finish."
  Verify Steps: "Inspect pinned Font/ImplFont defaults, setter guards, stored getters and equality. Test all new default fields, independent copied changes, no-op setters and type-safe const view; actual SvxNumberFormat copying/equality and Worker round trips with non-default metadata, present-empty/absent/legacy fonts and malformed metadata. Whole Calc and changed Font shared owner exact raw statements/branches/functions/lines100 with every counter positive; related Writer tests (Writer-only coverage exempt). Run established typecheck/format/lint/JSDoc/size/dependency/tree/provenance/inventory/routing/doctor gates, production build and related existing browser suites with reference symlinks removed/restored. No full all-app suite before requested minimum UI/ODS milestone."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert intentional source/test/docs/registry task commit; older Worker records continue to decode with default Font metadata. No unrelated task state or reference checkout is changed."
  Findings: ""
id_source: "generated"
---
## Summary

Task162: extend the existing shared Font stored metadata required by Calc docpool font items; prevent loss in real Writer numbering copies and Worker records.

## Scope

Existing vcl/source/font/font.ts; one native-metadata test; existing writer-document-codec.ts and focused transport test; relevant shared runtime/provenance/capability records and calc-core/readiness docs (up to14 intentional files). No font-provider placeholder, MaybeAskConfig approximation, memory manager, native compilation/probe, UI localization, formula/ODS stub or unrelated Writer coverage repair.

## Plan

Implement default-empty style, FAMILY_DONTKNOW, PITCH_DONTKNOW and RTL_TEXTENCODING_DONTKNOW, native getters/setters and copy/COW/equality in existing Font. Broaden const exclusion to all mutators. Preserve newly represented values through native numbering copies and Writer Worker encoding/decoding with validation and old records retaining original defaults. Update authoritative existing inventories without claiming full Font/default-device parity; record exact native source evidence. Run focused shared/Writer tests with strict raw100 on changed shared owner and whole Calc raw100,13 established source gates and required build/browser checks with reference symlinks absent as applicable. Commit verified source before evaluator/finish.

## Verify Steps

Inspect pinned Font/ImplFont defaults, setter guards, stored getters and equality. Test all new default fields, independent copied changes, no-op setters and type-safe const view; actual SvxNumberFormat copying/equality and Worker round trips with non-default metadata, present-empty/absent/legacy fonts and malformed metadata. Whole Calc and changed Font shared owner exact raw statements/branches/functions/lines100 with every counter positive; related Writer tests (Writer-only coverage exempt). Run established typecheck/format/lint/JSDoc/size/dependency/tree/provenance/inventory/routing/doctor gates, production build and related existing browser suites with reference symlinks removed/restored. No full all-app suite before requested minimum UI/ODS milestone.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert intentional source/test/docs/registry task commit; older Worker records continue to decode with default Font metadata. No unrelated task state or reference checkout is changed.

## Findings
