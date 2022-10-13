import type {Ref} from './types'
import * as utils from '@applitools/utils'

const REF_ID = 'applitools-ref-id'

export interface Refer {
  isRef<TValue = any>(ref: any): ref is Ref<TValue>
  ref<TValue>(value: TValue, parentRef?: Ref<unknown>): Ref<TValue>
  deref<TValue>(ref: Ref<TValue>): TValue
  destroy(ref: Ref<any>): void
}

export function makeRefer(): Refer {
  const store = new Map<string, any>()
  const relation = new Map<string, Set<Ref<any>>>()

  return {isRef, ref, deref, destroy}

  function isRef<TValue = any>(ref: any): ref is Ref<TValue> {
    return Boolean(ref[REF_ID])
  }

  function ref<TValue>(value: TValue, parentRef?: Ref<unknown>): Ref<TValue> {
    const ref = utils.general.guid()
    store.set(ref, value)
    if (parentRef) {
      let childRefs = relation.get(parentRef[REF_ID])
      if (!childRefs) {
        childRefs = new Set()
        relation.set(parentRef[REF_ID], childRefs)
      }
      childRefs.add({[REF_ID]: ref})
    }
    return {[REF_ID]: ref}
  }

  function deref<TValue>(ref: Ref<TValue>): TValue {
    if (isRef(ref)) {
      return store.get(ref[REF_ID])
    } else {
      return ref
    }
  }

  function destroy(ref: Ref<any>): void {
    if (!isRef(ref)) return
    const childRefs = relation.get(ref[REF_ID])
    if (childRefs) {
      childRefs.forEach(childRef => destroy(childRef))
    }
    store.delete(ref[REF_ID])
  }
}
