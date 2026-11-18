# Package save key-selection prerequisite proposal

The pinned package/source/zippackage/ZipPackage.cxx writeTempFile calls GetEncryptionKey and chooses PBKDF2/Argon2 argument values before saveContents, including for ordinary nonencrypted entries. This is the next prerequisite for the actual original package Commit path.

Requested scope: original GetEncryptionKey selection over actual UNO Sequence<NamedValue>/Sequence<sal_Int8>, its SHA256/SHA1 key-name selection, original missing/unsupported-key RuntimeException behavior, and constructor defaults for those consumed fields. Preserve original PBKDF2 selection and its100000/600000 count decision; preserve Argon2id tuple(3,65536,4) when selected, without executing or implementing a key derivation function. Use normal generated original crypto ID constant bindings if required. Original defaults remain source values, not recommended application settings. No new encryption algorithm, cipher, digest, credential source, password UI, external library, network, host filesystem access or recovery behavior is included.

This proposal requests the source selection/default/argument assembly only. Actual encrypted output remains explicitly unavailable until its original cipher/digest owners are implemented under a separate approved scope. Existing source ZIP/plain stream profiles and registered serialization owners continue independently.

Approval basis: .agentplane/policy/security.must.md says: "MUST NOT modify auth/crypto/security-critical codepaths without explicit scope approval." The existing file/MEMFS/parser/UUID approvals do not cover this distinct package key selection. No proposed security-sensitive implementation has been changed before approval.

Pinned sources: package/source/zippackage/ZipPackage.cxx lines151..167,1388..1411,1751..1778; package/inc/ZipPackage.hxx fields m_aStorageEncryptionKeys/m_aEncryptionKey/m_nStartKeyGenerationID/m_nKeyDerivationFunctionID.
