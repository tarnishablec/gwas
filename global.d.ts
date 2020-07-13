/// <reference types="swagger-schema-official"/>

declare interface Path {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $ref?: any
}

declare namespace Reflect {
  function get<T extends object, P extends PropertyKey>(
    target: T,
    propertyKey: P,
    receiver?: T
  ): P extends '__raw__' ? T : P extends keyof T ? T[P] : undefined
}
