/* global expect */
const Refer = require('../../../../../../src/browser/refer');
const refer = new Refer();

describe('test refer', () => {
  it('ref document', () => {
    const obj = {
      nodeType: 9,
      entry1: 'some value',
      entry2: 'some other value',
    };
    const res = refer.ref(obj);

    expect(Object.keys(res).length).to.eql(2);
    expect(Object.keys(res)[0]).to.eq('applitools-ref-id');
    expect(res['type']).to.eq('context');
  });
  it('ref element', () => {
    const obj = {
      nodeType: 1,
      entry1: 'some value',
      entry2: 'some other value',
    };
    const res = refer.ref(obj);

    expect(Object.keys(res).length).to.eql(2);
    expect(Object.keys(res)[0]).to.eq('applitools-ref-id');
    expect(res['type']).to.eq('element');
  });
});
