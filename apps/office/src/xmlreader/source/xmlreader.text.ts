/** @fileoverview Original raw and normalized text event modes with their native state transitions. */
import { State, Result, peek, span, assign, fail, literal } from "./xmlreader.state";
import type { ReaderState } from "./xmlreader.state";
import type { Span } from "../inc/span";
import {
  normalizeLineEnds,
  skipComment,
  scanCdataSection,
  skipProcessingInstruction,
  skipDocumentTypeDeclaration,
} from "./xmlreader.lexical";
import { handleReference } from "./xmlreader.references";
/** Original raw text mode normalizes line ends and expands references. @param r - Reader. @param text - Text output. @returns Text. */
export function handleRawText(r: ReaderState, text: Span): Result {
  r.pad_.clear();
  let begin = r.pos_;
  for (;;) {
    switch (peek(r)) {
      case 0:
        return fail(r, "premature end of ");
      case 13:
        r.pad_.add(span(r, begin, r.pos_).begin as Uint8Array, r.pos_ - begin);
        ++r.pos_;
        if (peek(r) !== 10) r.pad_.add(literal("\n"), 1);
        begin = r.pos_;
        break;
      case 38:
        r.pad_.add(span(r, begin, r.pos_).begin as Uint8Array, r.pos_ - begin);
        r.pos_ = handleReference(r, r.pos_, r.end_);
        begin = r.pos_;
        break;
      case 60:
        r.pad_.add(span(r, begin, r.pos_).begin as Uint8Array, r.pos_ - begin);
        ++r.pos_;
        switch (peek(r)) {
          case 33:
            ++r.pos_;
            if (!skipComment(r)) {
              const cdata = scanCdataSection(r);
              if (cdata.is()) normalizeLineEnds(r, cdata);
              else skipDocumentTypeDeclaration(r);
            }
            begin = r.pos_;
            break;
          case 47:
            assign(text, r.pad_.get());
            ++r.pos_;
            r.state_ = State.EndTag;
            return Result.Text;
          case 63:
            ++r.pos_;
            skipProcessingInstruction(r);
            begin = r.pos_;
            break;
          default:
            assign(text, r.pad_.get());
            r.state_ = State.StartTag;
            return Result.Text;
        }
        break;
      default:
        ++r.pos_;
        break;
    }
  }
}
/** Original normalized text mode; CDATA retains the upstream flow-prefix behavior. @param r - Reader. @param text - Text output. @returns Text. */
export function handleNormalizedText(r: ReaderState, text: Span): Result {
  r.pad_.clear();
  let flowBegin = r.pos_,
    flowEnd = r.pos_;
  let space: "Start" | "None" | "Span" | "Break" = "Start";
  for (;;) {
    switch (peek(r)) {
      case 0:
        return fail(r, "premature end of ");
      case 9:
      case 10:
      case 13:
        switch (space) {
          case "Start":
          case "Break":
            break;
          case "None":
          case "Span":
            space = "Break";
            break;
        }
        ++r.pos_;
        break;
      case 32:
        switch (space) {
          case "Start":
          case "Break":
            break;
          case "None":
            space = "Span";
            break;
          case "Span":
            space = "Break";
            break;
        }
        ++r.pos_;
        break;
      case 38:
        switch (space) {
          case "Start":
            break;
          case "None":
          case "Span":
            r.pad_.add(span(r, flowBegin, r.pos_).begin as Uint8Array, r.pos_ - flowBegin);
            break;
          case "Break":
            r.pad_.add(span(r, flowBegin, flowEnd).begin as Uint8Array, flowEnd - flowBegin);
            r.pad_.add(literal(" "), 1);
            break;
        }
        r.pos_ = handleReference(r, r.pos_, r.end_);
        flowBegin = r.pos_;
        flowEnd = r.pos_;
        space = "None";
        break;
      case 60:
        ++r.pos_;
        switch (peek(r)) {
          case 33:
            ++r.pos_;
            if (skipComment(r)) space = "Break";
            else {
              const cdata = scanCdataSection(r);
              if (cdata.is()) {
                switch (space) {
                  case "Start":
                    break;
                  case "None":
                  case "Span":
                    r.pad_.add(span(r, flowBegin, r.pos_).begin as Uint8Array, r.pos_ - flowBegin);
                    break;
                  case "Break":
                    r.pad_.add(
                      span(r, flowBegin, flowEnd).begin as Uint8Array,
                      flowEnd - flowBegin,
                    );
                    r.pad_.add(literal(" "), 1);
                    break;
                }
                normalizeLineEnds(r, cdata);
                flowBegin = r.pos_;
                flowEnd = r.pos_;
                space = "None";
              } else skipDocumentTypeDeclaration(r);
            }
            break;
          case 47:
            ++r.pos_;
            r.pad_.add(span(r, flowBegin, flowEnd).begin as Uint8Array, flowEnd - flowBegin);
            assign(text, r.pad_.get());
            r.state_ = State.EndTag;
            return Result.Text;
          case 63:
            ++r.pos_;
            skipProcessingInstruction(r);
            space = "Break";
            break;
          default:
            r.pad_.add(span(r, flowBegin, flowEnd).begin as Uint8Array, flowEnd - flowBegin);
            assign(text, r.pad_.get());
            r.state_ = State.StartTag;
            return Result.Text;
        }
        break;
      default:
        switch (space) {
          case "Start":
            flowBegin = r.pos_;
            break;
          case "None":
          case "Span":
            break;
          case "Break":
            r.pad_.add(span(r, flowBegin, flowEnd).begin as Uint8Array, flowEnd - flowBegin);
            r.pad_.add(literal(" "), 1);
            flowBegin = r.pos_;
            break;
        }
        flowEnd = ++r.pos_;
        space = "None";
        break;
    }
  }
}
