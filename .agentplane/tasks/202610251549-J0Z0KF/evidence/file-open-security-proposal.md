# Original OSL file-open security hook proposal

Baseline: LibreOffice 26.8.0.2, 9bc445578031fecf56086729d8e4940c77e14d65.

Implementation target: apps/office/src/sal/osl/unx/file.ts or a responsibility shard
of that owner. Source: sal/osl/unx/file.cxx, setAllowedPaths (848), isForbidden
(911), openFilePath pre-open hook (1177).

Requested approval covers the original colon-separated r/w/x allowed-path lists,
realpath/parent fallback, read/write/execute selection, literal prefix comparison,
empty-read-list early allow, SAL_ABORT_ON_FORBIDDEN and the isForbidden check
before opening a file. A forbidden open returns original ACCES. No tighter
path-boundary check, different defaults or omitted source hook will be introduced.
Potential source issues will be documented in both upstream issue journals.

The execution backend is the already linked Emscripten MEMFS. No host filesystem
mount, user-directory access, network request or broader filesystem grant is
included. Native abort terminates this realm's native runtime if explicitly
configured as upstream does; it is not replaced by successful continuation.

This is a direct prerequisite of native SvFileStream and TempFile; the earlier
request remains unanswered. Dependent security implementation is not modified
before approval. Independent URL conversion/error/handle work can proceed.

Policy requiring approval:
.agentplane/policy/security.must.md:
"MUST NOT modify auth/crypto/security-critical codepaths without explicit scope approval."
