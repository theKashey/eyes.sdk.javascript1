/* global expect cy */
const Refer = require('../../../../../../src/browser/refer');
const refer = new Refer();

describe('test refer', () => {
  it('ref element', () => {
    cy.visit('https://www.applitools.com/helloworld');
    cy.get('body > div > div:nth-child(1)').then(el => {
      {
        const obj = {
          nodeType: 9,
          entry1: 'some value',
          entry2: 'some other value',
        };
        const res = refer.ref(obj);

        expect(Object.keys(res).length).to.eql(1);
        expect(Object.keys(res)[0]).to.eq('applitools-ref-id');
      }
    });
  });
});
