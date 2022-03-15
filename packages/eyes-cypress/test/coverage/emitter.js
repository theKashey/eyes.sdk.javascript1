module.exports = (tracker, test) => {
  const {addSyntax, addCommand} = tracker;

  // addSyntax('var', ({constant, name, value}) => `${value}.then(${name} => {})`)
  addSyntax('getter', ({target, key}) => `${target}['${key}']`);
  const driver = {
    visit(url) {
      addCommand(js`cy.visit(${url})`);
    },

    executeScript(script, ...args) {
      return addCommand(js`cy.window().then(win => {
            const func = new win.Function(${script})
            return func(...${args})
          })`);
    },
    click(button) {
      let selector;
      if (typeof button === 'string') {
        selector = button;
      } else {
        selector = button.selector;
      }
      return addCommand(js`cy.get(${selector}).click()`);
    },
    findElement(element) {
      let selector;
      if (typeof element === 'string') {
        selector = element;
      } else {
        selector = element.selector;
      }

      return addCommand(js`cy.get(${selector})`);
    },
  };

  const eyes = {
    open({appName, testName, viewportSize}) {
      const args = {
        appName: appName || test.config.appName,
        testName: testName || test.config.baselineName,
        displayName: testName || test.name,
        viewportSize: viewportSize,
        branchName: test.config.branchName,
        parentBranchName: test.config.parentBranchName,
        browser: test.config.browsersInfo,
        layoutBreakpoints: test.config.layoutBreakpoints,
      };

      return addCommand(js`cy.eyesOpen(${args})`);
    },
    check(checkSettings = {}) {
      checkSettings = {
        ...checkSettings,
        target: checkSettings.region ? 'region' : undefined, // default is 'window'
        tag: checkSettings.name,
        fully: checkSettings.isFully,
        scriptHooks: checkSettings.hooks,
      };
      return addCommand(js`cy.eyesCheckWindow(${checkSettings})`);
    },
    close(throwEx) {
      return addCommand(js`cy.eyesClose(${throwEx})`);
    },
  };

  const assert = {
    equal(actual, expected, message) {
      addCommand(js`assert.deepEqual(${actual}, ${expected}, ${message})`);
    },
    // notEqual(actual, expected, message) {
    //   addCommand(js`assert.notDeepStrictEqual(${actual}, ${expected}, ${message})`)
    // },
    // ok(value, message) {
    //   addCommand(js`assert.ok(${value}, ${message})`)
    // },
    // instanceOf(object, typeName, message) {
    //   addCommand(js`assert.ok(${object} instanceof sdk[${typeName}], ${message})`)
    // },
    // throws(func, check, message) {
    //   let command
    //   if (check) {
    //     command = js`await assert.rejects(
    //       async () => {${func}},
    //       error => {${withScope(check, ['error'])}},
    //       ${message},
    //     )`
    //   } else {
    //     command = js`await assert.rejects(
    //       async () => {${func}},
    //       undefined,
    //       ${message},
    //     )`
    //   }
    //   addCommand(command)
    // },
  };

  const helpers = {
    // delay(milliseconds) {
    //   return addCommand(js`await new Promise(r => setTimeout(r, ${milliseconds}))`)
    // },
    // getTestInfo(result) {
    //   return addCommand(js`cy.task('getTestInfo', ${result})`)
    // },
    // getDom(result, domId) {
    //   return addCommand(js`await getTestDom(${result}, ${domId})`).methods({
    //     getNodesByAttribute: (dom, name) => addExpression(js`${dom}.getNodesByAttribute(${name})`)
    //   })
    // },
    // math: {
    //   round(number) {
    //     return addExpression(js`(Math.round(${number}) || 0)`)
    //   },
    // }
  };

  return {driver, eyes, assert, helpers};
};

function js(chunks, ...values) {
  const commands = [];
  let code = '';
  values.forEach((value, index) => {
    if (typeof value === 'function' && !value.isRef) {
      code += chunks[index];
      commands.push(code, value);
      code = '';
    } else {
      code += chunks[index] + serialize(value);
    }
  });
  code += chunks[chunks.length - 1];
  commands.push(code);
  return commands;
}

function serialize(data) {
  if (data && data.isRef) {
    return data.ref();
  } else if (Array.isArray(data)) {
    return `[${data.map(serialize).join(', ')}]`;
  } else if (typeof data === 'object' && data !== null) {
    const properties = Object.entries(data).reduce((data, [key, value]) => {
      return value !== undefined ? data.concat(`${key}: ${serialize(value)}`) : data;
    }, []);
    return `{${properties.join(', ')}}`;
  } else {
    return JSON.stringify(data);
  }
}
