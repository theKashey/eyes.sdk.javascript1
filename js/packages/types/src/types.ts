export type MaybeArray<T> = T | T[]

export declare type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
