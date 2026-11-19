# Native OFOPXML storage relationships

The internal storage owner holds the relationship folder separately from the ordinary package catalog. Its original `RelationsInfo` and `RelationsInfoStream` properties stage an initialized UNO pair sequence or a seekable input stream. The commit serializes the sequence with the registered SAX Writer or copies the staged stream from byte zero. The relationship child uses the standard OPC media type and the actual writable cache and package factory. If a commit removes its last member, it also removes the relationship folder.

Storage commit synchronizes existing per-part relationship member names when supported by the underlying stream owner. An export can stage root relationship information after opening the storage catalog and write `_rels/.rels` alongside `[Content_Types].xml`. The original first-read reset for a truncated storage and the closed-stream rename failure are recorded in both upstream issue journals.

The public OStorage and OWriteStream property and relationship interfaces, parsed relationship loading through the classic SAX service, and per-part relationship metadata editing remain pending. The focused tests open emitted ZIP bytes and independently check the encoded relationship records and exact copied bytes.
