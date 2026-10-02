---
id: "202610020737-4VSHZS"
title: "Remove remaining ignored upstream probe sources"
status: "TODO"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-02T07:38:59.835Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments: []
events: []
doc_version: 3
doc_updated_at: "2026-10-02T07:38:58.676Z"
doc_updated_by: "PLANNER"
description: "Complete the explicit user source-artifact cleanup by deleting3historical ignored C++ probe files under .agentplane/tmp/upstream-probes, retaining only bounded path/hash/removal evidence in a separate commit. No runtime/test/policy change or generated helpers."
sections:
  Summary: "Remove3remaining ignored historical native probe source files under the explicit user cleanup instruction. No Python remains anywhere in Agentplane. This completes source-file cleanup without runtime changes."
  Scope: "Exactly3ignored .agentplane/tmp/upstream-probes sources:202609302319-9KTM99/native-marker-oracle.cxx;202610010940-WW4SFA/native-default.cxx;202610011012-HMMTBX/native-restart.cxx. Own task traceability/result artifact only. No runtime,tests,policy,deps or new sources; no history rewrite."
  Plan: "After the active implementation leaf closes, inventory the3exact ignored source paths and retain only hashes/byte counts. Delete those3files using inline tooling, then scan all Agentplane storage including ignored files for Python/bytecode and native source/helper extensions. Record the resulting zero inventory and a separate cleanup commit; run diff/routing/doctor checks, canonical verification and same-actor evaluator, close with clean tracked state. Existing compiled binaries/logs are outside the requested source deletion scope."
  Verify Steps: |-
    1. Before deletion exact3ignored source paths exist, are untracked and under the repository; record path/size/hash only without source body.
    2. Delete only those3historical sources. Recursive ignored-inclusive inventory finds zero .py/.pyc/.pyo and .c/.cc/.cpp/.cxx/.h/.hpp/.hxx source files anywhere in Agentplane; no helper script saved.
    3. Git diff remains limited to own task traceability/evidence, implementation is untouched; git diff --check, node .agentplane/policy/check-routing.mjs and ap doctor pass with no new errors. No runtime tests necessary for ignored source deletion; final tracked state clean and deletion evidence committed separately.
    4. Canonical verification and same-actor EVALUATOR use actual cleanup evidence SHA; finish only leaf. Continuing parity parent/goal stay active.
  Verification: "Pending."
  Rollback Plan: "Do not recreate forbidden source copies. Historical logs and pinned vendor remain available for reference inspection; no source body is retained for rollback."
  Findings: "Expanded ignored-inclusive inventory found3old C++ probe sources while scanning beyond canonical task artifacts. Earlier Python cleanup commits53373dff andcea5d14c removed Python; current Python/bytecode inventory is empty. User explicitly instructed deleting all saved upstream sources separately and keeping helpers out of Agentplane."
id_source: "generated"
---
## Summary

Remove3remaining ignored historical native probe source files under the explicit user cleanup instruction. No Python remains anywhere in Agentplane. This completes source-file cleanup without runtime changes.

## Scope

Exactly3ignored .agentplane/tmp/upstream-probes sources:202609302319-9KTM99/native-marker-oracle.cxx;202610010940-WW4SFA/native-default.cxx;202610011012-HMMTBX/native-restart.cxx. Own task traceability/result artifact only. No runtime,tests,policy,deps or new sources; no history rewrite.

## Plan

After the active implementation leaf closes, inventory the3exact ignored source paths and retain only hashes/byte counts. Delete those3files using inline tooling, then scan all Agentplane storage including ignored files for Python/bytecode and native source/helper extensions. Record the resulting zero inventory and a separate cleanup commit; run diff/routing/doctor checks, canonical verification and same-actor evaluator, close with clean tracked state. Existing compiled binaries/logs are outside the requested source deletion scope.

## Verify Steps

1. Before deletion exact3ignored source paths exist, are untracked and under the repository; record path/size/hash only without source body.
2. Delete only those3historical sources. Recursive ignored-inclusive inventory finds zero .py/.pyc/.pyo and .c/.cc/.cpp/.cxx/.h/.hpp/.hxx source files anywhere in Agentplane; no helper script saved.
3. Git diff remains limited to own task traceability/evidence, implementation is untouched; git diff --check, node .agentplane/policy/check-routing.mjs and ap doctor pass with no new errors. No runtime tests necessary for ignored source deletion; final tracked state clean and deletion evidence committed separately.
4. Canonical verification and same-actor EVALUATOR use actual cleanup evidence SHA; finish only leaf. Continuing parity parent/goal stay active.

## Verification

Pending.

## Rollback Plan

Do not recreate forbidden source copies. Historical logs and pinned vendor remain available for reference inspection; no source body is retained for rollback.

## Findings

Expanded ignored-inclusive inventory found3old C++ probe sources while scanning beyond canonical task artifacts. Earlier Python cleanup commits53373dff andcea5d14c removed Python; current Python/bytecode inventory is empty. User explicitly instructed deleting all saved upstream sources separately and keeping helpers out of Agentplane.
