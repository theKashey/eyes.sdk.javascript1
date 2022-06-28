// re: https://trello.com/c/HnnKL5VU
const cwd = process.cwd()
const path = require('path')
const {setupEyes} = require('@applitools/test-utils')
const {testServer} = require('@applitools/test-server')
let eyes, server

fixture`proxying of resources`
  .before(async () => {
    const staticPath = path.join(cwd, 'test', 'custom', 'fixtures')
    server = await testServer({port: 7777, staticPath})
    eyes = setupEyes({vg: true})
  })
  .after(async () => {
    await server.close()
  })
test('works with images', async t => {
  await t.navigateTo('http://localhost:7777/images.html')
  await eyes.open(t, 'eyes-testcafe proxying of resources', 'works with images', {
    width: 1024,
    height: 768,
  })
  await eyes.checkWindow()
  await eyes.close(true)
})
test('works with fonts', async t => {
  await t.navigateTo('http://localhost:7777/fonts.html')
  await eyes.open(t, 'eyes-testcafe proxying of resources', 'works with fonts', {
    width: 1024,
    height: 768,
  })
  await eyes.checkWindow()
  await eyes.close(true)
})
