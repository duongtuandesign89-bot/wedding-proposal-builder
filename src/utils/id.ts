let sequence = 0
export function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `solis-${Date.now()}-${++sequence}`
}
