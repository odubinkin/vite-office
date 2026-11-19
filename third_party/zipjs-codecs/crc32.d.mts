export class Crc32 {
  crc: number;
  constructor(crc?: number);
  append(data: Uint8Array): void;
  get(): number;
}
