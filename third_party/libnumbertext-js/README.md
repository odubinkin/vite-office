# libnumbertext JavaScript dependency

This private package wraps the official `src/Soros.js` at the pinned 1.0.11
commit in `source.json`. It is installed through the application's package.json
file dependency; it is not an official npm publication. No interpreter algorithm
is rewritten. `Soros.js` is the byte-exact upstream file. `index.js` adds only
module-local declarations for its two implicit temporaries and a ES module export,
so browser bundling does not require eval or global script injection.

`data.json` contains every distinct .sor program installed by the pinned
LibreOffice ExternalPackage_numbertext.mk, with original program contents. Its
ordered packaging list (including the repeated fr entry), archive identity and
individual UTF-8 hashes are recorded in source.json. COPYING, AUTHORS and the
upstream README retain the original notices.

The user explicitly accepted the official JavaScript implementation as-is on
2026-10-30, relaxing C++ parity for this dependency only. A 12,412-case comparison
against the pinned C++ archive found seven differing outputs: Italian ordinal 1
and help; Marathi ordinal 1 and 21; Romanian USD 1.25; Ukrainian 0.25 and 1.25.
This is a bounded comparison, not a full parity claim. The JavaScript interpreter
also has no C++ 250-level recursion guard. These differences are not corrected
in this package. Other LibreOffice call sites retain their upstream contracts.
