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

export type MapTypes<V = unknown> = Map<unknown, V> | WeakMap<object, V>
export type MapKey<T extends MapTypes> = T extends WeakMap<infer WK, unknown>
  ? WK
  : T extends Map<infer K, unknown>
  ? K
  : never
export type MapValue<T> = T extends MapTypes<infer V> ? V : unknown

export function forceGet<T extends MapTypes>(
  map: T,
  key: MapKey<T>,
  val: MapValue<T>
): MapValue<T> {
  const v = map.get(key)
  if (v) return v as MapValue<T>
  map.set(key, val)
  return val
}
