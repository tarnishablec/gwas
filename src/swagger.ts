import { ab2str, Obj, UnionToTuple, isObject, forceGet } from './utils'
import * as swagger from 'swagger-schema-official'
import { Source } from './source'

export const methods: [
  'get',
  'post',
  'put',
  'delete',
  'patch',
  'options',
  'head'
] = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head']

const rawProxyMap = new WeakMap()

export type Method = UnionToTuple<typeof methods>

export type MapView = Record<
  string,
  Record<string, Partial<Record<Method, swagger.Operation>>>
>

export class SwaggerSource implements Source {
  mode: 'runtime' | 'compile' = 'compile'
  data?: MapView
  raw?: swagger.Spec
  definitions?: swagger.Spec['definitions']

  static TypeMap = {
    int32: Number,
    int64: String,
    float: Number,
    double: Number,
    string: String,
    byte: String,
    binary: String,
    boolean: Boolean,
    date: String,
    'date-time': String,
    password: String
  }

  formatDataPaths() {
    if (!this.raw) throw new Error('empty source data')
    const { paths } = this.raw
    const res: MapView = {}
    for (const url in paths) {
      const entry = paths[url]
      for (const met in entry) {
        if (!(methods as string[]).includes(met)) continue
        const meth = met as Method
        const tag = (entry[meth] as swagger.Operation).tags?.[0] ?? ''
        const m = res[tag] ?? (res[tag] = {})
        const mm = m[url] ?? (m[url] = {})
        mm[meth] = entry[meth]
      }
    }
    return this.createProxy(res)
  }

  async init(source: File): Promise<void>
  async init(source: string): Promise<void>
  async init(source: string | File) {
    if (source instanceof File) {
      const reader = new FileReader()
      return new Promise((resolve, reject) => {
        reader.onload = (e) => {
          const result = e.target?.result
          if (result) {
            this.raw = JSON.parse(
              typeof result === 'string' ? result : ab2str(result)
            )
            this.definitions = this.raw?.definitions
          }
          resolve()
          this.data = this.formatDataPaths()
        }
        reader.onerror = (err) => reject(err)
        reader.readAsText(source)
      })
    } else {
      const res = await fetch(source)
      this.raw = (res as unknown) as swagger.Spec
      this.definitions = this.raw.definitions
      this.data = this.formatDataPaths()
    }
  }

  queryControllers() {
    return this.raw?.tags?.map((v) => v.name)
  }

  queryPaths(controllerName: string) {
    return this.data ? Reflect.get(this.data, controllerName) : undefined
  }

  queryDetail(controllerName: string, url: string, method: Method) {
    const temp = this.queryPaths(controllerName)?.[url][method]
    if (!temp) return undefined
    const { parameters, responses, summary } = temp
    return { parameters, responses, summary }
  }

  resolveRef(ref: string, definitions = this.raw?.definitions) {
    const arr = ref.split('/').slice(2)
    let res = definitions as Obj
    while (arr.length) {
      const loc = arr.shift()!
      res = res[loc] as Obj
    }
    return res
  }

  protected createProxy<T extends object>(raw: T): T {
    // if (([Map, Set] as Array<Function>).includes(raw.constructor))
    //   return new Proxy(raw, {
    //     get: (target, prop, receiver) => {
    //       const result = Reflect.get(target, prop, receiver)
    //       if (result instanceof Function) {
    //         if (prop === 'get') {
    //           const self = this
    //           return function (this: Map<unknown, unknown>, key: unknown) {
    //             const result = this.get(key)
    //             if (isObject(result)) return self.createProxy(result)
    //             return result
    //           }.bind(target as Map<unknown, unknown>)
    //         }
    //         return result.bind(target)
    //       }
    //       return result
    //     }
    //   })
    return new Proxy(raw, {
      get: (target, p, receiver) => {
        const result = Reflect.get(target, p, receiver)
        if (p === '$ref') {
          const r = this.resolveRef(result)
          return forceGet(rawProxyMap, r, this.createProxy(r))
        }
        if (p === '__raw__') return target
        if (isObject(result))
          return forceGet(rawProxyMap, result, this.createProxy(result))
        return result
      }
    })
  }
}
