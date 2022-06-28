const {describe, it} = require('mocha');
const {expect} = require('chai');
const fakeIE = require('../../src/fakeIE');

describe('fakeIE', () => {
  let msg;
  let userAgent;
  let script;

  const logger = {verbose: txt => (msg = txt)};

  const page = {
    setUserAgent: async ua => (userAgent = ua),
    evaluateOnNewDocument: async s => (script = s.toString().match(/document\..*/)[0]),
  };

  it('should fake useragent and documentMode', async () => {
    const pageId = 1;
    await fakeIE({logger, page, pageId});
    expect(script).to.equal('document.documentMode = 11;');
    expect(userAgent).to.equal(
      'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; rv:11.0) like Gecko',
    );
    expect(msg).to.equal(`[fakeIE] - done faking IE for page id ${pageId}`);
  });
});
