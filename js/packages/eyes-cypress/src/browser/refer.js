/* global Node */

const uuid = require('uuid');
const REF_ID = 'applitools-ref-id';

class Refer {
  constructor() {
    this.store = new Map();
    this.relation = new Map();
  }

  isRef(ref) {
    return Boolean(ref && ref[REF_ID]);
  }

  check(value) {
    if (!value) return;
    if (value.nodeType === Node.ELEMENT_NODE) {
      return 'element';
    } else if (value.nodeType === Node.DOCUMENT_NODE || value.ownerDocument) {
      return 'context';
    } else if (value.constructor && value.constructor.name === 'Window') {
      return 'driver';
    }
  }

  ref(value, parentRef) {
    const refType = this.check(value);
    if (refType) {
      const ref = uuid.v4();
      this.store.set(ref, value);
      if (parentRef) {
        let childRefs = this.relation.get(parentRef[REF_ID]);
        if (!childRefs) {
          childRefs = new Set();
          this.relation.set(parentRef[REF_ID], childRefs);
        }
        childRefs.add({[REF_ID]: ref});
      }
      return {[REF_ID]: ref, type: refType};
    } else if (Array.isArray(value)) {
      return value.map(value => this.ref(value, parentRef));
    } else if (typeof value === 'object' && value !== null) {
      return Object.entries(value).reduce((obj, [key, value]) => {
        return Object.assign(obj, {[key]: this.ref(value, parentRef)});
      }, {});
    } else {
      return value;
    }
  }

  deref(ref) {
    if (this.isRef(ref)) {
      return this.store.get(ref[REF_ID]);
    } else {
      return ref;
    }
  }

  destroy(ref) {
    if (!this.isRef(ref)) return;
    const childRefs = this.relation.get(ref[REF_ID]);
    if (childRefs) {
      childRefs.forEach(childRef => this.destroy(childRef));
    }
    this.store.delete(ref[REF_ID]);
  }
}

module.exports = Refer;
