---
id: "202610091422-KCHP9M"
title: "Reparent native format clients before format destruction"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T14:23:03.684Z"
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
    body: "Start: Port approved original-client format destruction stage under existing iterative user authorization; correction 3/10."
events:
  -
    type: "status"
    at: "2026-10-09T14:23:05.472Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port approved original-client format destruction stage under existing iterative user authorization; correction 3/10."
doc_version: 3
doc_updated_at: "2026-10-09T14:23:05.472Z"
doc_updated_by: "CODER"
description: "Correction 3 after full TS7/Istanbul baseline: port SwFormat::Destr and SwModify::PrepareFormatDeath for original clients, borrowed format-change hints, inherited item-set rebinding and mounted UI invalidation. Preserve root cleanup and defer generic ObjectDying/cache/naming protocol to separate corrections. Existing iterative user authorization applies."
sections:
  Summary: "Port the non-root native SwFormat destruction stage so original Writer clients reparent before receiving SwFormatChangeHint and surviving child item sets no longer retain the destroyed parent. Correction 3 after full TS7/Istanbul baseline XJTGF0."
  Scope: "Production: sw/inc/calbck.ts and sw/source/core/attr/format.ts. Fresh core, real history and mounted React tests for original formats/clients/layout; related existing notification/format/table/history/UI tests, with only exact source-backed conflicting expectations eligible for migration. Preserve 4 canonical runtime/provenance records and derived views. Root RES_PAGEDESC cleanup is included; generic ObjectDying/client death, native caches and name behavior remain separate corrections. No save/open/recovery changes, upstream source artifacts, outside access, network, subagents or full suite."
  Plan: "Inspect pinned calbck.cxx::PrepareFormatDeath and format.cxx::Destr; snapshot all source/scripts/docs hashes, canonical records and append-only parent Findings in ignored cache. Port original-client re-registration followed by direct native hint callback before inherited notifier/base destruction. Exercise silent/no-client, parentless cleanup, multiple original clients, surviving attribute inheritance and mounted UI/history identities. Collect new+related Istanbul coverage once with upstream physically absent, use failed/new-only closure if needed with identical complete current-source maps; require actual 100% lines/statements/functions/branches on both complete production modules and zero negative counters. Run static gates upstream-absent; restore symlink in finally; then metadata-only audits. Preserve inventory semantics/history and unrelated files; record bounded English evidence; semantic commit, same-agent non-independent quality and canonical finish. Existing user-authorized iterative scope applies."
  Verify Steps: |-
    1. With vendor/libreoffice-reference physically unavailable, run all fresh and related native format/notification/layout/table/history/mounted UI scenarios. Assert exact native old/new/source identities, registration before callbacks, surviving item inheritance, frame invalidation and browser presentation without generic document revision/DTO bridge. Retain raw failures and repair them; do not replay passing cases merely to accumulate counters.
    2. Require actual Istanbul 100% lines/statements/functions/branches for complete calbck.ts and format.ts, zero negative counters, unchanged production source and identical complete maps for any failed/new-only closure. Never use prior task/V8 counters, synthetic counters, narrowed lines or thresholds.
    3. Run npm run format:check, lint, typecheck (TS7), check:dependencies, test:static, check:docs, check:file-size upstream-absent. Restore reference in finally. Then inventory:registry:build/check, check:source-tree/provenance, writer resource --check, routing validator and ap doctor as metadata-only audits.
    4. Prove old record fields/responsibility/evidence prefixes, parent Findings prefix and unrelated source/scripts/docs/tests preserved. Bind semantic SHA, record verification and explicitly same-agent non-independent quality. Finish with clean git status. Full suite is due after correction 10, not repeated here.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this leaf semantic changes and appended inventory evidence through a new task. Do not rewrite DONE evidence or parent Findings."
  Findings: "Pinned reference 9bc445578031fecf56086729d8e4940c77e14d65: sw/source/core/attr/format.cxx:188-210 and sw/source/core/attr/calbck.cxx:172-187. Current generic BroadcasterDying registration repair skips the native format-change callback, leaving surviving item inheritance stale. This leaf ports the pre-base format death stage; complete ObjectDying/cache/name behavior remains unverified. Last full baseline XJTGF0; two resumed corrections already DONE."
id_source: "generated"
---
## Summary

Port the non-root native SwFormat destruction stage so original Writer clients reparent before receiving SwFormatChangeHint and surviving child item sets no longer retain the destroyed parent. Correction 3 after full TS7/Istanbul baseline XJTGF0.

## Scope

Production: sw/inc/calbck.ts and sw/source/core/attr/format.ts. Fresh core, real history and mounted React tests for original formats/clients/layout; related existing notification/format/table/history/UI tests, with only exact source-backed conflicting expectations eligible for migration. Preserve 4 canonical runtime/provenance records and derived views. Root RES_PAGEDESC cleanup is included; generic ObjectDying/client death, native caches and name behavior remain separate corrections. No save/open/recovery changes, upstream source artifacts, outside access, network, subagents or full suite.

## Plan

Inspect pinned calbck.cxx::PrepareFormatDeath and format.cxx::Destr; snapshot all source/scripts/docs hashes, canonical records and append-only parent Findings in ignored cache. Port original-client re-registration followed by direct native hint callback before inherited notifier/base destruction. Exercise silent/no-client, parentless cleanup, multiple original clients, surviving attribute inheritance and mounted UI/history identities. Collect new+related Istanbul coverage once with upstream physically absent, use failed/new-only closure if needed with identical complete current-source maps; require actual 100% lines/statements/functions/branches on both complete production modules and zero negative counters. Run static gates upstream-absent; restore symlink in finally; then metadata-only audits. Preserve inventory semantics/history and unrelated files; record bounded English evidence; semantic commit, same-agent non-independent quality and canonical finish. Existing user-authorized iterative scope applies.

## Verify Steps

1. With vendor/libreoffice-reference physically unavailable, run all fresh and related native format/notification/layout/table/history/mounted UI scenarios. Assert exact native old/new/source identities, registration before callbacks, surviving item inheritance, frame invalidation and browser presentation without generic document revision/DTO bridge. Retain raw failures and repair them; do not replay passing cases merely to accumulate counters.
2. Require actual Istanbul 100% lines/statements/functions/branches for complete calbck.ts and format.ts, zero negative counters, unchanged production source and identical complete maps for any failed/new-only closure. Never use prior task/V8 counters, synthetic counters, narrowed lines or thresholds.
3. Run npm run format:check, lint, typecheck (TS7), check:dependencies, test:static, check:docs, check:file-size upstream-absent. Restore reference in finally. Then inventory:registry:build/check, check:source-tree/provenance, writer resource --check, routing validator and ap doctor as metadata-only audits.
4. Prove old record fields/responsibility/evidence prefixes, parent Findings prefix and unrelated source/scripts/docs/tests preserved. Bind semantic SHA, record verification and explicitly same-agent non-independent quality. Finish with clean git status. Full suite is due after correction 10, not repeated here.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this leaf semantic changes and appended inventory evidence through a new task. Do not rewrite DONE evidence or parent Findings.

## Findings

Pinned reference 9bc445578031fecf56086729d8e4940c77e14d65: sw/source/core/attr/format.cxx:188-210 and sw/source/core/attr/calbck.cxx:172-187. Current generic BroadcasterDying registration repair skips the native format-change callback, leaving surviving item inheritance stale. This leaf ports the pre-base format death stage; complete ObjectDying/cache/name behavior remains unverified. Last full baseline XJTGF0; two resumed corrections already DONE.
