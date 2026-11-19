# Native package stream commit

The original ZipPackage stream commit writes directly to an empty writable XStream. When a ZipFile already exists, it writes to TempFileFastService, connects the package reader to that stream, seeks and truncates the original destination, then copies the archive and flushes the destination. Direct output respects NoFileSync. The temporary copy waits for the destination monitor as upstream does. Readonly rejection and typed backup notification remain in the original error scopes.

The archive writer uses the existing native folder/entry owners. PACKAGE writes mimetype and regenerates the manifest. OFOPXML removes the old content-types entry and writes the generated content types after the tree. The package's original key selection and KDF argument preparation are carried through to saveContents in the ordinary unencrypted profile. No cipher or key derivation algorithm was added.

Direct and repeated writes are exercised in all three storage formats and reopened from the actual destination. The combined root/writer branch coverage is 59.1%, below the required 90%. URL transfer, encrypted output, large threaded stream output, full XStorage and SfxMedium integration and document UI roundtrips remain pending. WRITER630 and CALC697 record the source fast-temp backup notification behavior.
