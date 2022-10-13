export type MaybeArray<T> = T | T[]

export declare type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type Location = {x: number; y: number}

export type Size = {width: number; height: number}

export type Region = Location & Size
