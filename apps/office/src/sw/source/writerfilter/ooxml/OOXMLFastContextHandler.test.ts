/** @fileoverview Runs native Writer fast-context grammar over actual SAX text, native package parser provisioning, property resources and canonical DomainMapper runs. */
import { expect, it } from "vitest";
import {
  OOXMLFastContextHandler as Base,
  OOXMLFastContextHandlerStream as StreamContext,
  OOXMLFastContextHandlerProperties as PropsContext,
  OOXMLFastContextHandlerValue as ValueContext,
  ResourceEnum_t,
} from "./OOXMLFastContextHandler";
import { OOXMLFastDocumentHandler } from "./OOXMLFastDocumentHandler";
import { OOXMLFactory } from "./OOXMLFactory";
import { nativeToken as token } from "./OOXMLFactory_wml";
import { defines } from "./OOXMLFactory_wml.tables";
import { streamNamespaces } from "./OOXMLFactory.tables";
import { FastSaxParser } from "../../../../sax/source/fastparser/fastparser";
import { FastTokenHandler } from "../../../../oox/source/core/fasttokenhandler";
import {
  OOXMLPropertySet as Set,
  OOXMLPropertyType as T,
  OOXMLValue as V,
} from "./OOXMLPropertySet";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import type { Stream, Reference, Properties } from "../inc/dmapper/resourcemodel";
import { unicode, text } from "../../core/unocore/unocrsrhelper";
import { createWriterDocument } from "../../core/doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { DomainMapper } from "../dmapper/DomainMapper";

const transitional = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const strict = "http://purl.oclc.org/ooxml/wordprocessingml/main";
const mce = "http://schemas.openxmlformats.org/markup-compatibility/2006";

/** Reads original generated definition identities. @param name - Native schema name. @returns Identity. */
function define(name: string): number {
  const entry = Object.entries(defines).find(
    /** Finds the exact native schema name. @param entry - Declaration. @returns Match. */ (
      entry,
    ) => entry[1] === name,
  );
  if (!entry) throw new Error("Missing test schema " + name);
  return Number(entry[0]);
}
/** Records native stream events and retains actual properties for separate typed resolution. */
class Receiver implements Stream {
  readonly events: string[] = [];
  readonly sets: Reference<Properties>[] = [];
  /** Section start. @returns Nothing. */ startSectionGroup(): void {
    this.events.push("section+");
  }
  /** Section end. @returns Nothing. */ endSectionGroup(): void {
    this.events.push("section-");
  }
  /** Last section. @returns Nothing. */ markLastSectionGroup(): void {
    this.events.push("section-last");
  }
  /** Paragraph start. @returns Nothing. */ startParagraphGroup(): void {
    this.events.push("paragraph+");
  }
  /** Paragraph end. @returns Nothing. */ endParagraphGroup(): void {
    this.events.push("paragraph-");
  }
  /** Last paragraph. @returns Nothing. */ markLastParagraphInSection(): void {
    this.events.push("paragraph-last");
  }
  /** Run start. @returns Nothing. */ startCharacterGroup(): void {
    this.events.push("run+");
  }
  /** Run end. @returns Nothing. */ endCharacterGroup(): void {
    this.events.push("run-");
  }
  /** Native debug/info stream. @param value - Handle. @returns Nothing. */ info(
    value: string,
  ): void {
    this.events.push("info:" + value);
  }
  /** Native UTF16 delivery. @param data - Units. @param length - Logical size. @returns Nothing. */ utext(
    data: Uint16Array,
    length: number,
  ): void {
    this.events.push(
      "text:" +
        Array.from(
          data.slice(0, length),
          /** Decodes one UTF16 unit. @param c - Unit. @returns Character. */ (c) =>
            String.fromCharCode(c),
        ).join(""),
    );
  }
  /** Native control-byte delivery. @param data - Bytes. @param length - Size. @returns Nothing. */ text(
    data: Uint8Array,
    length: number,
  ): void {
    this.events.push("bytes:" + [...data.slice(0, length)].join(","));
  }
  /** Retains actual native property resources. @param value - Properties. @returns Nothing. */ props(
    value: Reference<Properties>,
  ): void {
    this.sets.push(value);
    this.events.push("props");
  }
}
/** Native borrowed document callback receiver used with the real parser. */
class Document {
  id = 0;
  progress = 0;
  /** Stores note ID. @param id - ID. @returns Nothing. */ setXNoteId(id: number): void {
    this.id = id;
  }
  /** Reads ID. @returns ID. */ getXNoteId(): number {
    return this.id;
  }
  /** Reads current target. @returns Target. */ getTarget(): string {
    return "word/document.xml";
  }
  /** Records paragraph progress. @returns Nothing. */ incrementProgress(): void {
    ++this.progress;
  }
}
/** Creates the actual native parser/document/context chain with original generated namespace IDs. @param stream - Receiver. @returns Owners. */
function parser(stream = new Receiver()) {
  const document = new Document(),
    handler = new OOXMLFastDocumentHandler(stream, document, -3),
    parser = new FastSaxParser();
  for (const [uri, id] of streamNamespaces) parser.registerNamespace(uri, id);
  parser.setTokenHandler(new FastTokenHandler());
  parser.setFastDocumentHandler(handler);
  return { parser, handler, document, stream };
}
/** Sends one native schema child through its start/characters/end lifetime. @param parent - Parent. @param name - QName. @param value - Optional text. @param attributes - Attributes. @returns Context. */
function child(
  parent: Base,
  name: string,
  value = "",
  attributes: readonly { token: number; value: string }[] = [],
): Base {
  const result = parent.createFastChildContext(token(name));
  if (!result) throw new Error("Missing test child " + name);
  result.startFastElement(token(name), attributes);
  if (value !== "") result.characters(value);
  result.endFastElement(token(name));
  return result;
}

it.each([transitional, strict])(
  "parses native document groups, merged text and deferred run closure with namespace %s",
  /** Runs actual fast SAX and generated factory dispatch. @param uri - Namespace. @returns Nothing. */ (
    uri,
  ) => {
    const session = parser();
    session.parser.parseStream(
      `<w:document xmlns:w="${uri}"><w:body><w:p><w:r><w:t> A&amp;B<!--same text--><![CDATA[ C ]]></w:t></w:r></w:p><w:p/></w:body></w:document>`,
    );
    expect(session.stream.events).toEqual([
      "info:0",
      "section+",
      "paragraph+",
      "info:4",
      "run+",
      "text:A&B C",
      "text:\r",
      "run-",
      "paragraph-",
      "paragraph+",
      "info:7",
      "run+",
      "text:\r",
      "run-",
      "paragraph-",
      "section-last",
      "section-",
    ]);
    expect(session.document.progress).toBe(2);
    expect(session.document.id).toBe(-3);
    expect(session.handler.getContextHandler()).toBe(session.handler.getContextHandler());
  },
);

it("inherits exact xml:space and preserves Unicode spaces while normalizing XML whitespace per text element", /** Uses real SAX entity/CDATA aggregation rather than split-fragment trimming. @returns Nothing. */ () => {
  const session = parser();
  session.parser.parseStream(
    `<w:document xmlns:w="${transitional}" xml:space="preserve"><w:body><w:p><w:r><w:t>\t A\n B \t</w:t><w:t xml:space="default"> \tC\tD\nE\r\n \u00a0 </w:t><w:t>  F  </w:t></w:r></w:p></w:body></w:document>`,
  );
  expect(
    session.stream.events.filter(
      /** Selects text deliveries. @param event - Event. @returns Match. */ (event) =>
        event.startsWith("text:"),
    ),
  ).toEqual(["text:\t A  B \t", "text:C D E  \u00a0", "text:  F  ", "text:\r"]);
});

it("distinguishes unknown copied contexts, ignored known-schema mismatches and unknown roots", /** Source defaulted base copy retains identity and does not count a new child context. @returns Nothing. */ () => {
  const session = parser();
  session.parser.parseStream(
    `<w:document xmlns:w="${transitional}"><w:body><w:p><w:r><w:notInTokenDictionary><w:t>kept</w:t></w:notInTokenDictionary><w:document><w:t>ignored</w:t></w:document></w:r></w:p></w:body></w:document>`,
  );
  expect(session.stream.events).toContain("text:kept");
  expect(session.stream.events).not.toContain("text:ignored");
  const root = parser();
  root.parser.parseStream(
    `<unknown xmlns:w="${transitional}"><w:document><w:body><w:p/></w:body></w:document></unknown>`,
  );
  expect(root.stream.events).toEqual([]);
  const base = session.handler.getContextHandler();
  base.setDefine(define("CT_Text"));
  base.setId(31);
  base.setToken(token("doc:t"));
  base.startFastElement(token("doc:t"), [{ token: token("xml:space"), value: "preserve" }]);
  const before = base.getParserState();
  before.setHandle();
  const handle = before.getHandle();
  const copy = base.createUnknownChildContext();
  before.setHandle();
  expect(before.getHandle()).toBe(handle);
  expect(copy).not.toBe(base);
  expect(copy.getParserState()).toBe(before);
  expect(copy.getDefine()).toBe(base.getDefine());
  expect(copy.getId()).toBe(31);
  expect(copy.getToken()).toBe(token("doc:t"));
  expect(copy.IsPreserveSpace()).toBe(true);
});

it("preserves native MCE exact Requires matching, supported choices, fallback and nested state restoration", /** Native Choices share the existing context and the saved alternate vector. @returns Nothing. */ () => {
  const session = parser();
  session.parser.parseStream(
    `<w:document xmlns:w="${transitional}" xmlns:mc="${mce}"><w:body><w:p><w:r><mc:AlternateContent><mc:Choice Requires="wps"><w:t>choice</w:t><mc:AlternateContent><mc:Choice Requires="unsupported"><w:t>discarded</w:t></mc:Choice><mc:Fallback><w:t>inner fallback</w:t></mc:Fallback></mc:AlternateContent></mc:Choice><mc:Fallback><w:t>discarded fallback</w:t></mc:Fallback></mc:AlternateContent><mc:AlternateContent><mc:Choice Requires="wps w14"><w:t>discarded list</w:t></mc:Choice><mc:Fallback><w:t>fallback</w:t></mc:Fallback></mc:AlternateContent><mc:AlternateContent><mc:Choice Requires="wps"><w:t>both 1</w:t></mc:Choice><mc:Choice Requires="w14"><w:t>both 2</w:t></mc:Choice><mc:Fallback><w:t>discarded</w:t></mc:Fallback></mc:AlternateContent></w:r></w:p></w:body></w:document>`,
  );
  expect(
    session.stream.events.filter(
      /** Selects content text. @param event - Event. @returns Match. */ (event) =>
        event.startsWith("text:"),
    ),
  ).toEqual([
    "text:choice",
    "text:inner fallback",
    "text:fallback",
    "text:both 1",
    "text:both 2",
    "text:\r",
  ]);
  expect(session.handler.getContextHandler().getParserState().getSavedAlternateStates()).toEqual(
    [],
  );
});

it("applies schema property/value contexts to a real SwDoc through DomainMapper", /** Checks the actual kernel graph while section mapping remains outside this run-context scope. @returns Nothing. */ () => {
  const doc = createWriterDocument(),
    model = new SwXTextDocument(doc),
    mapper = new DomainMapper(model);
  const stream = new Receiver();
  stream.startParagraphGroup = /** Delegates native paragraph start. @returns Nothing. */ () =>
    mapper.startParagraphGroup();
  stream.endParagraphGroup = /** Delegates native paragraph end. @returns Nothing. */ () =>
    mapper.endParagraphGroup();
  stream.startCharacterGroup = /** Delegates native run start. @returns Nothing. */ () =>
    mapper.startCharacterGroup();
  stream.endCharacterGroup = /** Delegates native run end. @returns Nothing. */ () =>
    mapper.endCharacterGroup();
  stream.props =
    /** Delegates original resource delivery. @param properties - Properties. @returns Nothing. */ (
      properties,
    ) => mapper.props(properties);
  stream.utext =
    /** Delegates original UTF16 delivery. @param data - Units. @param length - Size. @returns Nothing. */ (
      data,
      length,
    ) => mapper.utext(data, length);
  const root = new Base();
  root.setStream(stream);
  root.setDocument(new Document());
  root.getParserState().setInSectionGroup(true);
  root.setDefine(define("CT_P"));
  root.startParagraphGroup();
  try {
    const run = root.createFastChildContext(token("doc:r")) as StreamContext;
    run.startFastElement(token("doc:r"), []);
    const props = run.createFastChildContext(token("doc:rPr")) as PropsContext;
    props.startFastElement(token("doc:rPr"), []);
    child(props, "doc:b");
    child(props, "doc:i", "", [{ token: token("doc:val"), value: "0" }]);
    child(props, "doc:sz", "", [{ token: token("doc:val"), value: "28" }]);
    props.endFastElement(token("doc:rPr"));
    child(run, "doc:t", "native😀 text");
    run.endFastElement(token("doc:r"));
    root.endOfParagraph();
    root.endParagraphGroup();
    mapper.finishDocument();
    const paragraph = doc.paragraphs[0];
    expect(paragraph?.GetText()).toBe("native😀 text");
    const cursor = model.getText().createTextCursor();
    try {
      cursor.gotoStart(false);
      cursor.goRight(6, true);
      const key = unicode("CharWeight"),
        weight = cursor.getPropertyValue(key);
      key.dispose();
      try {
        const result: [number] = [0];
        expect(weight.extract(result, "double")).toBe(true);
        expect(result[0]).toBe(150);
      } finally {
        weight.dispose();
      }
    } finally {
      cursor.dispose();
    }
  } finally {
    mapper.dispose();
    model.dispose();
  }
});

it("retains scalar defaults, property ownership and failure boundaries for unported schema owners", /** Uses original resource classes and schema lookup failures. @returns Nothing. */ () => {
  const base = new Base(),
    stream = new Receiver();
  base.setStream(stream);
  base.setDocument(new Document());
  expect(base.getResource()).toBe(ResourceEnum_t.STREAM);
  expect(base.getPropertySet()).toBeNull();
  expect(base.getValue().hasValue()).toBe(false);
  expect(base.IsPreserveSpace()).toBe(false);
  base.newProperty(1, V.createInteger(1));
  base.setValue(V.createInteger(1));
  base.setPropertySet(new Set());
  base.setDefaultBooleanValue();
  base.setDefaultIntegerValue();
  base.setDefaultStringValue();
  const values = new ValueContext(base);
  values.setDefaultBooleanValue();
  expect(values.getValue().getInt()).toBe(1);
  values.setDefaultBooleanValue();
  values.setValue(V.createInteger(5));
  values.setDefaultIntegerValue();
  expect(values.getValue().getInt()).toBe(5);
  const integer = new ValueContext(base);
  integer.setDefaultIntegerValue();
  expect(integer.getValue().getInt()).toBe(0);
  const string = new ValueContext(base);
  string.setDefaultStringValue();
  string.setDefaultStringValue();
  const result = string.getValue().getString();
  try {
    expect(text(result)).toBe("");
  } finally {
    result.dispose();
  }
  const properties = new PropsContext(base),
    nested = new PropsContext(properties);
  expect(properties.getResource()).toBe(ResourceEnum_t.PROPERTIES);
  properties.newProperty(0, V.createInteger(1));
  properties.newProperty(1, V.createInteger(1));
  nested.newProperty(2, V.createInteger(2));
  nested.setId(3);
  nested.endFastElement(0);
  expect(
    [...properties.getPropertySet()].map(
      /** Reads native property ID. @param property - Property. @returns ID. */ (property) =>
        property.getId(),
    ),
  ).toEqual([1, 3]);
  const replacement = new Set();
  properties.setPropertySet(replacement);
  expect(properties.getValue().getProperties()).toBe(replacement);
  const attrs = new StreamContext(base);
  attrs.newProperty(0, V.createInteger(1));
  attrs.newProperty(2, V.createInteger(2));
  expect([...attrs.getPropertySet()]).toHaveLength(1);
  expect(OOXMLFactory.createFastChildContext(base, 0xffff)).toBeNull();
  expect(OOXMLFactory.createFastChildContext(base, token("doc:p"))).toBeNull();
  base.setDefine(define("CT_Document"));
  expect(
    /** Unsupported native drawing owner. @returns Never. */ () =>
      base.createFastChildContext(token("doc:background")),
  ).toThrow("resource context is not implemented");
  base.setDefine(define("CT_P"));
  expect(
    /** Not yet ported native hyperlink definition. @returns Never. */ () =>
      base.createFastChildContext(token("doc:hyperlink")),
  ).toThrow("definition is not implemented");
  base.setDefine(define("CT_RPr"));
  expect(
    /** Cross-namespace Any requires its native w14 owner. @returns Never. */ () =>
      base.createFastChildContext(token("w14:glow")),
  ).toThrow("start namespace factory is not implemented");
});

/** Native derived contexts own table depth and can forward nested property resources through protected hooks. */
class DerivedContext extends Base {
  /** Native TextTable contexts change inherited depth. @param depth - Depth. @returns Nothing. */ setDepth(
    depth: number,
  ): void {
    this.mnTableDepth = depth;
  }
  /** Exercises the native derived-owner handoff hook. @returns Nothing. */ forwardProperties(): void {
    this.sendPropertiesToParent();
  }
  /** Exercises the native scalar-owner handoff hook. @returns Nothing. */ forwardValue(): void {
    this.sendPropertyToParent();
  }
}

it("retains disabled-forwarding guards, deferred section boundaries, footnote markers and postponed-break order", /** Uses public parser state and actual break resources. @returns Nothing. */ () => {
  const context = new DerivedContext(),
    stream = new Receiver(),
    document = new Document();
  context.setStream(stream);
  context.setDocument(document);
  const state = context.getParserState();
  context.endCharacterGroup();
  context.endParagraphGroup();
  context.endSectionGroup();
  state.SetFloatingTableEnded(true);
  context.setForwardEvents(false);
  context.startCharacterGroup();
  context.startParagraphGroup();
  context.startSectionGroup();
  context.endCharacterGroup();
  context.endParagraphGroup();
  context.endSectionGroup();
  context.text("ignored");
  context.endOfParagraph();
  expect(stream.events).toEqual([]);
  expect(document.progress).toBe(1);
  expect(context.isForwardEvents()).toBe(false);
  context.setForwardEvents(true);
  state.setStartFootnote(true);
  const breakSet = new Set();
  breakSet.add(N.LN_CT_Br_type, V.createInteger(N.LN_Value_ST_BrType_page), T.ATTRIBUTE);
  state.setPostponedBreak(breakSet);
  context.startCharacterGroup();
  expect(stream.events).toEqual([
    "info:0",
    "section+",
    "paragraph+",
    "run+",
    "text:\u0005",
    "bytes:12",
  ]);
  expect(state.GetFloatingTableEnded()).toBe(false);
  context.startCharacterGroup();
  expect(stream.events.slice(-2)).toEqual(["run-", "run+"]);
  context.startSectionGroup();
  expect(stream.events.slice(-5)).toEqual(["run-", "paragraph-", "section-", "info:0", "section+"]);
  context.startParagraphGroup();
  state.setLastParagraphInSection(true);
  context.handleLastParagraphInSection();
  expect(state.isLastParagraphInSection()).toBe(false);
  context.setDepth(2);
  context.sendTableDepth();
  expect(
    [...(stream.sets.at(-1) as Set)].map(
      /** Reads original table-depth modifiers. @param property - Property. @returns ID/value pair. */ (
        property,
      ) => [property.getId(), property.getValue()?.getInt()],
    ),
  ).toEqual([
    [N.LN_tblDepth, 2],
    [N.LN_inTbl, 1],
  ]);
  const absent = new Base();
  expect(
    /** Missing native stream precondition. @returns Never. */ () => absent.setHandle(),
  ).toThrow("stream pointer is null");
  expect(
    /** Missing native document precondition. @returns Never. */ () => absent.endOfParagraph(),
  ).toThrow();
  absent.setStream(stream);
  expect(
    /** Missing native paragraph progress document. @returns Never. */ () =>
      absent.endOfParagraph(),
  ).toThrow("document pointer is null");
});

it("retains paraId string delivery, inherited group state and native resource-ID action guards", /** Resolves actual properties and the native run-start conditional action. @returns Nothing. */ () => {
  const session = parser();
  session.parser.parseStream(
    `<w:document xmlns:w="${transitional}" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"><w:body><w:p w14:paraId="ABC"><w:r><w:t>x</w:t></w:r></w:p></w:body></w:document>`,
  );
  const values: string[] = [];
  session.stream.sets[0]?.resolve({
    /** Captures original paragraph identity. @param id - ID. @param value - Value. @returns Nothing. */ attribute(
      id,
      value,
    ) {
      expect(id).toBe(N.LN_AG_Parids_paraId);
      const string = value.getString();
      try {
        values.push(text(string));
      } finally {
        string.dispose();
      }
    },
    /** Original scalar lookup ignores modifiers. @returns Nothing. */ sprm() {},
  });
  expect(values).toEqual(["ABC"]);
  const base = new Base();
  base.setStream(session.stream);
  base.setDocument(session.document);
  const stream = new StreamContext(base);
  stream.setDefine(define("CT_R"));
  stream.setId(92531);
  stream.startAction();
  const wrapper = [...(session.stream.sets.at(-1) as Set)][0];
  expect(wrapper?.getId()).toBe(92531);
  expect(wrapper?.getProps()).toBe(stream.getPropertySet());
  expect(
    /** Base has no properties for explicit wrapping. @returns Never. */ () =>
      base.sendPropertiesWithId(1),
  ).toThrow("property-set pointer is null");
  const inherited = new Base();
  inherited.getParserState().setInSectionGroup(true);
  inherited.getParserState().setInParagraphGroup(true);
  inherited.getParserState().setInCharacterGroup(true);
  inherited.setStream(session.stream);
  inherited.endSectionGroup();
  const props = new PropsContext(base),
    derived = new DerivedContext(props);
  derived.forwardProperties();
  const detached = new DerivedContext();
  detached.forwardProperties();
  detached.forwardValue();
  const noParentProperties = new ValueContext(base);
  noParentProperties.setValue(V.createInteger(7));
  noParentProperties.endFastElement(0);
  props.setForwardEvents(false);
  props.endFastElement(0);
  props.setForwardEvents(true);
  const scalar = new ValueContext(props);
  scalar.setValue(V.createInteger(9));
  scalar.setDefaultBooleanValue();
  scalar.setDefaultStringValue();
  expect(scalar.getValue().getInt()).toBe(9);
});

it("preserves native reentrant grouping guards through public Stream callbacks", /** Public callbacks may change shared parser flags before a guarded group opens. @returns Nothing. */ () => {
  const context = new Base(),
    stream = new Receiver(),
    state = context.getParserState();
  context.setStream(stream);
  context.setDocument(new Document());
  stream.startSectionGroup =
    /** A receiver can establish nested paragraph/run state. @returns Nothing. */ () => {
      state.setInParagraphGroup(true);
      state.setInCharacterGroup(true);
    };
  context.startCharacterGroup();
  expect(stream.events).toEqual(["info:0"]);
  state.setInSectionGroup(false);
  state.setInParagraphGroup(false);
  state.setInCharacterGroup(false);
  context.startParagraphGroup();
  expect(stream.events).toEqual(["info:0", "info:0"]);
  // A nested section can be established while paragraph close calls the receiver.
  stream.endParagraphGroup =
    /** Reentrant receiver establishes an existing section. @returns Nothing. */ () =>
      state.setInSectionGroup(true);
  state.setInSectionGroup(false);
  context.startSectionGroup();
  expect(state.isInSectionGroup()).toBe(true);
});

it("retains MCE inert unknown branches, base-copy flag state and root/substream lifecycle defaults", /** Covers native document hooks without introducing new document behavior. @returns Nothing. */ () => {
  const session = parser(),
    root = session.handler.getContextHandler();
  root.startFastElement(token("mce:document"), []);
  root.endFastElement(token("mce:document"));
  root.startFastElement(token("mce:AlternateContent"), []);
  root.startFastElement(token("mce:Choice"), []);
  root.startFastElement(token("doc:t"), []);
  root.characters("discarded");
  root.endFastElement(token("doc:t"));
  expect(root.createFastChildContext(token("doc:t"))).toBeNull();
  root.endFastElement(token("mce:Choice"));
  root.endFastElement(token("mce:AlternateContent"));
  expect(
    /** Native unmatched alternate end has no defined saved state. @returns Never. */ () =>
      root.endFastElement(token("mce:AlternateContent")),
  ).toThrow("MCE state stack underflow");
  session.handler.setIsSubstream(true);
  expect(root.getParserState().isInSectionGroup()).toBe(true);
  session.handler.setIsSubstream(false);
  session.handler.startFastElement();
  session.handler.endFastElement();
  session.handler.startUnknownElement();
  session.handler.endUnknownElement();
  session.handler.characters();
  const unknown = session.handler.createUnknownChildContext();
  unknown.setIsSubstream(true);
  expect(unknown.createFastChildContext(token("doc:document"))).toBeNull();
});

it("ignores nonmatching paraId attributes and nested modifiers during paragraph identity lookup", /** Uses actual stream attributes and native helper dispatch. @returns Nothing. */ () => {
  const base = new Base(),
    receiver = new Receiver();
  base.setStream(receiver);
  const context = new StreamContext(base);
  context.getPropertySet().add(1, V.createInteger(1), T.ATTRIBUTE);
  context.getPropertySet().add(2, V.createInteger(2), T.SPRM);
  context.startParagraphGroup();
  expect(receiver.sets).toEqual([]);
});
