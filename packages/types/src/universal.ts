import {UniversalSpecDriver} from './driver'
import {Core, EyesManager, Eyes} from './core'

type UnionToIntersection<TUnion> = (TUnion extends any ? (arg: TUnion) => any : never) extends (arg: infer TItem) => any
  ? TItem
  : never

type InputType<TFunc> = TFunc extends (arg: infer TArg) => any ? TArg : never
type OutputType<TFunc> = TFunc extends (...args: any) => infer TRes | Promise<infer TRes>
  ? Promise<TRes extends {(...args: any): any} ? (TRes extends void ? TRes : Ref<TRes>) : TRes>
  : never

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Ref<TValue = never> = {'applitools-ref-id': string}

type Request<
  TTarget extends {[key in keyof TTarget]: (...args: any) => any},
  TDomain extends string,
  TArg extends string = never,
  TName = keyof TTarget,
> = UnionToIntersection<
  TName extends string & keyof TTarget
    ? {
        request(
          name: `${TDomain}.${TName}`,
          options: InputType<TTarget[TName]> & {[key in TArg]: Ref<TTarget>},
        ): OutputType<TTarget[TName]>
      }
    : never
>

type Command<
  TTarget extends {[key in keyof TTarget]: (...args: any) => any},
  TDomain extends string,
  TArg extends string = never,
  TName = keyof TTarget,
> = UnionToIntersection<
  TName extends string & keyof TTarget
    ? {
        command(
          name: `${TDomain}.${TName}`,
          handler: (options: InputType<TTarget[TName]> & {[key in TArg]: Ref<TTarget>}) => OutputType<TTarget[TName]>,
        ): () => void
      }
    : never
>

export type ClientSocket<TDriver, TContext, TElement, TSelector> = unknown &
  Request<Omit<Core<TDriver, TElement, TSelector>, 'isDriver' | 'isElement' | 'isSelector'>, 'Core'> &
  Request<EyesManager<TDriver, TElement, TSelector>, 'EyesManager', 'manager'> &
  Request<Eyes<TElement, TSelector>, 'Eyes', 'eyes'> &
  Command<UniversalSpecDriver<TDriver, TContext, TElement, TSelector>, 'Driver'>

export type ServerSocket<TDriver, TContext, TElement, TSelector> = unknown &
  Command<Omit<Core<TDriver, TElement, TSelector>, 'isDriver' | 'isElement' | 'isSelector'>, 'Core'> &
  Command<EyesManager<TDriver, TElement, TSelector>, 'EyesManager', 'manager'> &
  Command<Eyes<TElement, TSelector>, 'Eyes', 'eyes'> &
  Request<UniversalSpecDriver<TDriver, TContext, TElement, TSelector>, 'Driver'>
