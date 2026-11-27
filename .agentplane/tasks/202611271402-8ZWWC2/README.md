---
id: "202611271402-8ZWWC2"
title: "Preserve native Writer ruby text and styled ranges through ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "odt"
  - "ruby"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T14:03:17.920Z"
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
    body: "Start: Trace the pinned Writer ruby attribute, ODF styles and containment of linked text."
events:
  -
    type: "status"
    at: "2026-11-27T14:03:18.526Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Trace the pinned Writer ruby attribute, ODF styles and containment of linked text."
doc_version: 3
doc_updated_at: "2026-11-27T14:03:18.526Z"
doc_updated_by: "CODER"
description: "Implement the represented SwFormatRuby and SwTextRuby nesting attribute, conforming UNO properties and ruby style import/export. Preserve ruby reading, position, formatting and ruby-base hyperlinks through Worker and ODT. Port the pinned ruby position and hyperlink fixtures."
sections:
  Summary: |-
    Preserve native Writer ruby text and styled ranges through ODT

    Implement the represented SwFormatRuby and SwTextRuby nesting attribute, conforming UNO properties and ruby style import/export. Preserve ruby reading, position, formatting and ruby-base hyperlinks through Worker and ODT. Port the pinned ruby position and hyperlink fixtures.
  Scope: |-
    - In scope: Implement the represented SwFormatRuby and SwTextRuby nesting attribute, conforming UNO properties and ruby style import/export. Preserve ruby reading, position, formatting and ruby-base hyperlinks through Worker and ODT. Port the pinned ruby position and hyperlink fixtures.
    - Out of scope: unrelated refactors not required for "Preserve native Writer ruby text and styled ranges through ODT".
  Plan: "Follow pinned SwFormatRuby, SwTextRuby, MakeTextAttr and the original Ruby UNO and ODF property contracts. Add the native nesting attribute to the represented pool/WhichId, style and edit paths. Apply the shared ruby base/text SAX contexts and chart the ordinary canonical Writer portion ordering, including a nested hyperlink. Transfer the independent footing, reading text and style through the genuine Writer graph and round-trip ODT. Port ruby-position.odt and the ODF markup of ruby+hyperlink.fodt and run focused hint, paragraph, ODT and Worker checks. Record any suspicious behavior from the pinned native implementation and keep current browser lifecycle."
  Verify Steps: |-
    PLANNER fallback scaffold for "Preserve native Writer ruby text and styled ranges through ODT". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Preserve native Writer ruby text and styled ranges through ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Preserve native Writer ruby text and styled ranges through ODT

Implement the represented SwFormatRuby and SwTextRuby nesting attribute, conforming UNO properties and ruby style import/export. Preserve ruby reading, position, formatting and ruby-base hyperlinks through Worker and ODT. Port the pinned ruby position and hyperlink fixtures.

## Scope

- In scope: Implement the represented SwFormatRuby and SwTextRuby nesting attribute, conforming UNO properties and ruby style import/export. Preserve ruby reading, position, formatting and ruby-base hyperlinks through Worker and ODT. Port the pinned ruby position and hyperlink fixtures.
- Out of scope: unrelated refactors not required for "Preserve native Writer ruby text and styled ranges through ODT".

## Plan

Follow pinned SwFormatRuby, SwTextRuby, MakeTextAttr and the original Ruby UNO and ODF property contracts. Add the native nesting attribute to the represented pool/WhichId, style and edit paths. Apply the shared ruby base/text SAX contexts and chart the ordinary canonical Writer portion ordering, including a nested hyperlink. Transfer the independent footing, reading text and style through the genuine Writer graph and round-trip ODT. Port ruby-position.odt and the ODF markup of ruby+hyperlink.fodt and run focused hint, paragraph, ODT and Worker checks. Record any suspicious behavior from the pinned native implementation and keep current browser lifecycle.

## Verify Steps

PLANNER fallback scaffold for "Preserve native Writer ruby text and styled ranges through ODT". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Preserve native Writer ruby text and styled ranges through ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
