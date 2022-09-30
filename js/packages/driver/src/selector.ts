export type Selector<TSelector = never> =
  | TSelector
  | string
  | {
      selector: TSelector | string
      type?: string
      shadow?: Selector<TSelector>
      frame?: Selector<TSelector>
    }

export type CommonSelector = Selector
