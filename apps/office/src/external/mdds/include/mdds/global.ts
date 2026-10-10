/** @fileoverview Original mdds global.hpp runtime exception hierarchy; compile-time macros and traits are native type-system infrastructure. */
// SPDX-FileCopyrightText: 2008 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
/** Original owned diagnostic string over the JavaScript exception runtime. */
export class general_error extends Error {
  private readonly m_msg: string;
  /** Owns the original diagnostic string. @param msg - Message. @returns Error owner. */
  public constructor(msg: string) {
    super(msg);
    this.m_msg = msg;
  }
  /** Returns the original message without formatting. @returns Diagnostic. */
  public what(): string {
    return this.m_msg;
  }
}
/** Original invalid-argument exception specialization. */
export class invalid_arg_error extends general_error {}
/** Original size exception specialization. */
export class size_error extends general_error {}
/** Original type exception specialization. */
export class type_error extends general_error {}
/** Original integrity exception specialization. */
export class integrity_error extends general_error {}
