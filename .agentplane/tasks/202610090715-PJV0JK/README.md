---
id: "202610090715-PJV0JK"
title: "Prepare Writer local dependencies and pinned reference"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "ops"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T07:17:45.621Z"
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
    body: "Start: prepare explicitly approved local upstream symlink and independent dependency copies in Writer only; validate local workspace and absent-profile build/typecheck while retaining original project, pin, registry and functional sources."
events:
  -
    type: "status"
    at: "2026-10-09T07:17:47.546Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: prepare explicitly approved local upstream symlink and independent dependency copies in Writer only; validate local workspace and absent-profile build/typecheck while retaining original project, pin, registry and functional sources."
doc_version: 3
doc_updated_at: "2026-10-09T07:17:47.546Z"
doc_updated_by: "CODER"
description: "Create ignored local vendor symlink to approved pinned vite-office upstream and copy approved node_modules locally without source-project changes or network; restore deterministic ignored registry views as needed, verify dependency resolution and upstream-absent build/typecheck, keep Writer branch clean."
sections:
  Summary: "Prepare independent local Writer dependencies and shared pinned upstream reference under explicit human approvals."
  Scope: ".gitignore exact vendor entry, ignored local vendor symlink and node_modules/generated compatibility views, new task subtree. Only approved old upstream/dependency paths read; no original project writes, network or merge."
  Plan: "Prepare only vite-office-writer on writer. User explicitly approved linking/copying vite-office vendor/libreoffice-reference and subsequently local copying node_modules. Create vendor/libreoffice-reference symlink to exact old local checkout; amend only that gitignore entry to cover directories and symlinks. Copy root/app node_modules with rsync preserving package structure but omitting large caches/generated outputs; optionally copy only4 prior verified coverage map/proof files from approved dependency cache into local ignored cache. No dependency symlink to old checkout and no writes/network/merge outside Writer. Rebuild current registry's deterministic ignored compatibility views if absent. Verify exact upstream core/corpus pins, target working-tree status unchanged, symlink-only rename/restore leaves original target available, dependency/workspace resolution points to Writer, app/tools typecheck and build/static once with local vendor symlink physically absent/restored finally. Docs/governance checks doctor/routing/diff pass. Bounded English AP MD/JSON metadata only, no upstream/source/raw maps/scripts inAP. Functional implementation/acceptance/registry records preserved. Record meaningful operational commit and close task; overall parity goal remains incomplete."
  Verify Steps: |-
    1. Confirm Writer clean branch, approved old upstream at9bc445578031fecf56086729d8e4940c77e14d65 and original clean target. Record .gitignore/package/lock and tracked source hashes before setup; explicit human approvals cover only local upstream/dependency read/copy.
    2. Create relative vendor symlink ../.. to approved source; exact gitignore entry supports links. Copy root/app dependencies locally without large caches or external writes/network; validate installed manifest versions against local lockfile and any workspace symlink resolves within Writer. Raw optional4 prior maps/proofs only ignored local dependency cache.
    3. Generate deterministic ignored registry compatibility views using current canonical registry if absent; check registry using local upstream source. No canonical record mutation. During npm run typecheck and npm run test:static physically rename only local symlink and restore finally, keeping original target reachable/unchanged. No runtime/full functional suite or coverage claim for this environment-only task.
    4. Verify original upstream/corpus pins and clean target unchanged, local symlink ignored/untracked upstream content never staged, functional source/tests/metadata unchanged, app/tool package resolution works locally. ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass. Record bounded English evidence and clean final tracked state; meaningful operational commit, same-agent evaluation if required and close. Overall goal active/incomplete.
  Verification: "Pending local setup and upstream-absent build/typecheck; no functional parity/coverage claims."
  Rollback Plan: "Remove only newly created Writer local symlink/dependency copies if setup invalid; restore renamed local symlink in finally. Original upstream/dependencies remain untouched. Do not reset tracked code or merge branches."
  Findings: "Writer fork is clean on writer at069279d9. Dependencies and vendor reference absent. Human explicitly authorized using existing vite-office upstream, prefers symlink, and answered yes to local dependency copy. Original upstream pin verified9bc445578031fecf56086729d8e4940c77e14d65 with clean status. Directory-only gitignore entry does not match a symlink; adapt only this entry. New scoped Writer/Calc/shared test configurations and canonical UUID registry from current branch must be retained."
id_source: "generated"
---
## Summary

Prepare independent local Writer dependencies and shared pinned upstream reference under explicit human approvals.

## Scope

.gitignore exact vendor entry, ignored local vendor symlink and node_modules/generated compatibility views, new task subtree. Only approved old upstream/dependency paths read; no original project writes, network or merge.

## Plan

Prepare only vite-office-writer on writer. User explicitly approved linking/copying vite-office vendor/libreoffice-reference and subsequently local copying node_modules. Create vendor/libreoffice-reference symlink to exact old local checkout; amend only that gitignore entry to cover directories and symlinks. Copy root/app node_modules with rsync preserving package structure but omitting large caches/generated outputs; optionally copy only4 prior verified coverage map/proof files from approved dependency cache into local ignored cache. No dependency symlink to old checkout and no writes/network/merge outside Writer. Rebuild current registry's deterministic ignored compatibility views if absent. Verify exact upstream core/corpus pins, target working-tree status unchanged, symlink-only rename/restore leaves original target available, dependency/workspace resolution points to Writer, app/tools typecheck and build/static once with local vendor symlink physically absent/restored finally. Docs/governance checks doctor/routing/diff pass. Bounded English AP MD/JSON metadata only, no upstream/source/raw maps/scripts inAP. Functional implementation/acceptance/registry records preserved. Record meaningful operational commit and close task; overall parity goal remains incomplete.

## Verify Steps

1. Confirm Writer clean branch, approved old upstream at9bc445578031fecf56086729d8e4940c77e14d65 and original clean target. Record .gitignore/package/lock and tracked source hashes before setup; explicit human approvals cover only local upstream/dependency read/copy.
2. Create relative vendor symlink ../.. to approved source; exact gitignore entry supports links. Copy root/app dependencies locally without large caches or external writes/network; validate installed manifest versions against local lockfile and any workspace symlink resolves within Writer. Raw optional4 prior maps/proofs only ignored local dependency cache.
3. Generate deterministic ignored registry compatibility views using current canonical registry if absent; check registry using local upstream source. No canonical record mutation. During npm run typecheck and npm run test:static physically rename only local symlink and restore finally, keeping original target reachable/unchanged. No runtime/full functional suite or coverage claim for this environment-only task.
4. Verify original upstream/corpus pins and clean target unchanged, local symlink ignored/untracked upstream content never staged, functional source/tests/metadata unchanged, app/tool package resolution works locally. ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass. Record bounded English evidence and clean final tracked state; meaningful operational commit, same-agent evaluation if required and close. Overall goal active/incomplete.

## Verification

Pending local setup and upstream-absent build/typecheck; no functional parity/coverage claims.

## Rollback Plan

Remove only newly created Writer local symlink/dependency copies if setup invalid; restore renamed local symlink in finally. Original upstream/dependencies remain untouched. Do not reset tracked code or merge branches.

## Findings

Writer fork is clean on writer at069279d9. Dependencies and vendor reference absent. Human explicitly authorized using existing vite-office upstream, prefers symlink, and answered yes to local dependency copy. Original upstream pin verified9bc445578031fecf56086729d8e4940c77e14d65 with clean status. Directory-only gitignore entry does not match a symlink; adapt only this entry. New scoped Writer/Calc/shared test configurations and canonical UUID registry from current branch must be retained.
