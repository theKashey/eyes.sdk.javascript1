'use strict';
const { describe, it } = require('mocha');
const fancy = require('../index');
const { TestResults } = require('@applitools/visual-grid-client');
const snap = require('@applitools/snaptdout');

describe('formatter', () => {
  let passed, failed, diffs, header, body, footer;
  beforeEach(() => {
    const newTest = new TestResults({
      name: 'test5',
      hostDisplaySize: { width: 1, height: 2 },
      status: 'Passed',
    })
    newTest.setIsNew(true);
    const err1 = new TestResults({
      name: 'test0',
      hostDisplaySize: { width: 4, height: 5 },
      url: 'url0',
    });
    err1.error = new Error('bla');
    const err2 = new TestResults({
      name: 'test0',
      hostDisplaySize: { width: 6, height: 7 },
      url: 'url0',
    });
    err2.error = new Error('bloo');
    const err3 = new Error('kuku');
    failed = [err1, err2, err3];
    diffs = [
      new TestResults({
        name: 'test1',
        hostDisplaySize: { width: 100, height: 200 },
        url: 'url1',
        status: 'Unresolved',
      }),
      new TestResults({
        name: 'test2',
        hostDisplaySize: { width: 300, height: 400 },
        url: 'url2',
        status: 'Unresolved',
      }),
    ];
    passed = [
      new TestResults({
        name: 'test3',
        hostDisplaySize: { width: 1, height: 2 },
        status: 'Passed',
      }),
      newTest
    ];

    header = 'My Header'
    footer = 'My Footer'

    body = {
      passed,
      failed,
      unresolved: diffs
    }

  })

  it('works', async () => {
    const { output } = fancy({
      body: {
        passed,
        failed,
        unresolved: diffs,
      },
      indent: 4,
      header,
      footer
    });
    await snap(output, 'cypress');
  });

  it('works with custom template', async () => {
    const { output } = fancy({
      body: {
        passed,
        failed,
        unresolved: diffs,
      },
      header,
      footer,
      template: "  HEADER\nBODY\n  FOOTER"
    });
    await snap(output, 'template');
  });

  it('don\'t show non exitent', async () => {
    const { output } = fancy({
      body: {
        passed,
        unresolved: diffs,
      },
      indent: 2,
      header,
      footer,
    });
    await snap(output, 'missing');
  });

  it('should print with no colors', async () => {
    const { output } = fancy({
      body: {
        passed,
        unresolved: diffs,
      },
      indent: 4,
      dull: true,
      header,
      footer,
    });
    await snap(output, 'dull')
  });


  it('should accept a custom formatFunction', async () => {
    const { output } = fancy({
      body: {
        custom: passed,
        custom2: diffs
      },
      indent: 4,
      header: 'custom header',
      footer: 'custom footer',
    },
      (formatter, { body: _body }) => {
        // you should call format.section at some point and add sections to body
        // otherwise the body will remain empty
        // you must return the body at the end;
        const { section, underline } = formatter;
        Object.keys(_body).forEach((key, index) => {
          const color = index === 0 ? 'green' : 'red';
          section(underline(key.toUpperCase(), color), _body[key].map(result => `  ${result.getName()}`), key);
        })
        formatter.body(_body)
    });   
    await snap(output, 'format function')
  });

  it('works without a header', async () => {
    const { output } = fancy({
      body: {
        passed,
        unresolved: diffs,
      },
      indent: 4,
      dull: true,
      footer,
    });
    await snap(output, 'no header')
  });

  it('works without a footer', async () => {
    const { output } = fancy({
      header,
      body: {
        passed,
        unresolved: diffs,
      },
      indent: 4,
      dull: true,
    });
    await snap(output, 'no footer')
  });

  it('works without a body', async () => {
    const { output } = fancy({
      header,
      footer,
      indent: 4,
      dull: true,
    });
    await snap(output, 'no body')
  });

  it('works with background', async () => {
    const { output } = fancy({
      body: {
        COOL: passed,
        COOLER: diffs
      },
      indent: 4,
      header: 'custom header',
      footer: 'custom footer',
    },
      (formatter, { body: _body }) => {
        const { section, background } = formatter;
        Object.keys(_body).forEach((key, index) => {
          const color = index === 0 ? 'green' : 'red';
          section(background(key.toUpperCase(), color), _body[key].map(result => `  ${result.getName()}`), key);
        })
        formatter.body(_body);
    });
    await snap(output, 'background')
  });

  it('works like a charm', async () => {
    const { output } = fancy({
      body: {
        artists: ['tool', 'soundgarden', 'metallica'],
        albums: ['lateralus', 'bad motorfinger', 's&m']
      },
      indent: 4,
      header: 'my cool header',
      footer: 'my awesome footer',
    },
      (formatter, { body: _body, header: _header, footer: _footer }) => {
        const { underline, background, bold, section, italic } = formatter;
        formatter.header(underline(_header.toUpperCase(), 'teal'));
        formatter.footer(background(_footer.toUpperCase(), 'pink'));
        Object.keys(_body).forEach((key, index) => {
          const color = index === 0 ? 'green' : 'red';
          section(bold(key.toUpperCase(), color), _body[key].map(result => ` 👉 ${italic(result, color)}`), key);
        })
        formatter.body(_body);
    });
    await snap(output, 'charm')
  });

  it('real world application', async () => {
    const { output } = fancy({
      body: {
        Passed: [{ name: 'test1' }, { name: 'test2' }, { name: 'test3' }],
        Failed: [{ name: 'test4' }, { name: 'test5' }, { name: 'test6' }]
      },
      indent: 4,
      header: 'Test Results'
      },
      (formatter, { body: _body, header: _header }) => {
        const { bold, section, gray, underline } = formatter;
        formatter.header(underline(_header.toUpperCase(), 'marine'));
        const statuses = {
          Passed: {
            icon: '✔',
            color: 'green'
          },
          Failed: {
            icon: '✖',
            color: 'red'
          }
        }
        Object.keys(_body).forEach(key => {
          const { icon, color } = statuses[key];
          section(bold(key, color), _body[key].map(result => ` ${bold(icon, color)} ${gray(result.name)}`), key);
        })
        formatter.body(_body);
    });
    
    await snap(output, 'real world')
  });
});
