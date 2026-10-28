/** @fileoverview Consumed native FastTokenHandler delegates all exact lexical identities to TokenMap; byte arrays bind XFastTokenHandler UTF8 transport, without registering a UNO service. */
import * as TokenMap from "../token/tokenmap";
import { FastTokenHandlerBase } from "../../../sax/source/tools/fastattribs";

/** Native fast-token receiver used by Writer SAX context dispatch. */
export class FastTokenHandler extends FastTokenHandlerBase {
  /** Original UTF8 identifier value result. @param token - Native local token ID. @returns Owned bytes. */
  getUTF8Identifier(token: number): Uint8Array {
    return TokenMap.getUtf8TokenName(token);
  }
  /** Original UTF8 byte input. @param identifier - Native byte view. @returns Exact local ID or DONTKNOW. */
  getTokenFromUTF8(identifier: Uint8Array): number {
    return TokenMap.getTokenFromUtf8(identifier);
  }
  /** Original direct string-view path. @param token - XML local name. @returns Exact local ID or DONTKNOW. */
  getTokenDirect(token: string | Uint8Array): number {
    return TokenMap.getTokenFromUtf8(token);
  }
}
