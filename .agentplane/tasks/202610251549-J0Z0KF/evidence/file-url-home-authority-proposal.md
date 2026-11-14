# Original file URL home and authority dependency proposal

Baseline: LibreOffice26.8.0.2,9bc445578031fecf56086729d8e4940c77e14d65.

## Requested scope

Port only the original current-security handle construction/destruction and home
lookup consumed by file URLs: osl_getCurrentSecurity, its grow/free helpers,
osl_freeSecurityHandle, osl_psz_getHomeDir, osl_getHomeDir and the corresponding
Security RAII methods. Source: sal/osl/unx/security.cxx, secimpl.hxx and
include/osl/security.hxx. Preserve the selected Emscripten branch: native
geteuid/getegid, source mobile/Mobile User/* fields and /var/mobile fallback;
prefer actual WASM HOME only when current UID matches, HOME is nonempty and
native access(HOME,0) succeeds. Preserve original conversion/output/error order.
This is the source dependency for ~ expansion, not a new home provider.

Port the original local-host/FQDN accessors and their actually consumed source
address-info dependencies from sal/osl/unx/socket.cxx, including function-static
caching and exact case-insensitive authority comparison in file_url.cxx. Keep
gethostname, selected getaddrinfo/canonical-name behavior, fallback/truncation
and return codes. The pinned Emscripten SDK libcore.js supplies its own existing
realm-local DNS name table; it is not replaced by an invented hostname provider.

## Boundary

Use only the already linked Emscripten runtime environment/MEMFS and pinned SDK.
No host filesystem mount, host user-directory lookup, credential access, login,
password validation, certificate/trust changes, socket connection, external DNS
request or other outgoing network activity is authorized by this proposal.
If a needed source profile requires those, it remains outside this approval.
The existing approved setAllowedPaths/isForbidden hook remains in the open path.

## Verification

Actual native runtime UID/environment/access and original HOME precedence;
valid/missing/empty HOME, source fallback and handle cleanup; actual local-name
cache and file authority acceptance/rejection; all relevant original QA and
main/DOM-free Worker integration. Do not manufacture security/hostname providers
or strengthen original acceptance rules. Retain native OOM/undefined/other OS
profiles as unqualified unless proven. Keep existing intentional app open/save,
autosave and no-recovery behavior.

## Approval gate

.agentplane/policy/security.must.md requires: "MUST NOT modify auth/crypto/security-critical codepaths without explicit scope approval."
This proposal touches the security-context handle and the file-URL authority
acceptance decision. The earlier approval explicitly covered path allowlists
and pre-open flags only. Dependent mutation waits for an actual user reply;
independent buffer/URL-byte work continues.

## Explicit user approval received

The user answered request call_e6d18aceb8f947a69a5134e31a6619ed: “Да, перенести исходные контракты в указанных границах”. The exact security-handle/HOME/local-host-authority scope and exclusions above are approved. Dependent implementation may proceed inside the existing WASM/MEMFS; no host mount, credentials/login, external DNS requests or socket connections are authorized.
