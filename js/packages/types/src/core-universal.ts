import {UniversalSpecDriver} from './driver'
import {Core, EyesManager, Eyes} from './core'

type UnionToIntersection<TUnion> = (TUnion extends any ? (arg: TUnion) => any : never) extends (arg: infer TItem) => any
  ? TItem
  : never

type InputType<TFunc> = TFunc extends (arg: infer TArg) => any ? TArg : never
type OutputType<TFunc> = TFunc extends (...args: any) => infer TRes | Promise<infer TRes>
  ? Promise<Refify<TRes>>
  : never

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

interface Debug<TDriver, TContext, TElement, TSelector> {
  getHistory(): any
  checkSpecDriver(options: {
    driver: TDriver
    commands: (keyof UniversalSpecDriver<TDriver, TContext, TElement, TSelector>)[]
  }): any
}

interface Server {
  getInfo(): Record<string, any>
}

type UniversalCore<TDriver, TElement, TSelector> = Omit<
  Core<TDriver, TElement, TSelector>,
  'isDriver' | 'isElement' | 'isSelector'
>

type UniversalEyes<TDriver, TElement, TSelector, TType extends 'classic' | 'ufg'> = Omit<
  Eyes<TDriver, TElement, TSelector, TType>,
  'test' | 'running' | 'closed' | 'aborted'
>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Ref<TValue = never> = {'applitools-ref-id': string}

/* eslint-disable prettier/prettier */
export type Refify<TValue> = TValue extends string | number | boolean | null | undefined ? TValue
  : TValue extends Array<infer TItem> ? Refify<TItem>[]
  : Extract<TValue[keyof TValue], (...args: any) => any> extends never ? TValue
  : Ref<TValue>
/* eslint-enable prettier/prettier */

export type ClientSocket<TDriver, TContext, TElement, TSelector> = unknown &
  Request<UniversalCore<TDriver, TElement, TSelector>, 'Core'> &
  Request<EyesManager<TDriver, TElement, TSelector, 'classic' | 'ufg'>, 'EyesManager', 'manager'> &
  Request<UniversalEyes<TDriver, TElement, TSelector, 'classic' | 'ufg'>, 'Eyes', 'eyes'> &
  Request<Server, 'Server'> &
  Request<Debug<TDriver, TContext, TElement, TSelector>, 'Debug'> &
  Command<UniversalSpecDriver<TDriver, TContext, TElement, TSelector>, 'Driver'>

export type ServerSocket<TDriver, TContext, TElement, TSelector> = unknown &
  Command<UniversalCore<TDriver, TElement, TSelector>, 'Core'> &
  Command<EyesManager<TDriver, TElement, TSelector, 'classic' | 'ufg'>, 'EyesManager', 'manager'> &
  Command<UniversalEyes<TDriver, TElement, TSelector, 'classic' | 'ufg'>, 'Eyes', 'eyes'> &
  Command<Server, 'Server'> &
  Command<Debug<TDriver, TContext, TElement, TSelector>, 'Debug'> &
  Request<UniversalSpecDriver<TDriver, TContext, TElement, TSelector>, 'Driver'>
