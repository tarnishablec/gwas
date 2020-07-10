export type Obj = Record<string, unknown>

export type UnionToTuple<T extends unknown[]> = T[number]

export function ab2str(buf: ArrayBuffer) {
  return String.fromCharCode(...new Uint16Array(buf))
}

export function keysOf<T>(val: T) {
  return Object.keys(val) as Array<keyof T>
}

export function isObject<T = object>(target: unknown): target is T & object {
  return target !== null && typeof target === 'object'
}
