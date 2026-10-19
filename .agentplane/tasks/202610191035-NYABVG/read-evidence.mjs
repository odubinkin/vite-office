import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
export function readEvidence(path){const value=JSON.parse(readFileSync(path,'utf8'));if(value.archivedEvidence)return readEvidence(value.rawArchivePath);if(value.encoding!=='gzip-base64')return value;const bytes=gunzipSync(Buffer.from(value.data,'base64'));assert.equal(bytes.length,value.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),value.sha256);return JSON.parse(bytes);}
