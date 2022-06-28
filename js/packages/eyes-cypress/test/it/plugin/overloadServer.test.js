// 'use strict';
// // const {describe, it, beforeEach, afterEach} = require('mocha');
// const {describe, it} = require('mocha');
// // const {expect} = require('chai');
// const makePluginExport = require('../../../src/plugin/pluginExport');
// const makeConfig = require('../../../src/plugin/config');
// const axios = require('axios');
// const fetch = require('../../util/fetchWithNoCAVerify');

// describe('overload server', () => {
//   let getCloseServer, eyesConfig, globalHooks;
//   before(() => {
//     eyesConfig = makeConfig().eyesConfig;
//     globalHooks = {};
//     process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
//   });

//   after(async () => {
//     await getCloseServer()();
//   });

//   it('check error message', async () => {
//     try {
//       const basicConfig = {apiKey: process.env.APPLITOOLS_API_KEY};
//       const pluginExport = makePluginExport({eyesConfig, globalHooks, basicConfig});
//       const __module = {
//         exports: () => ({bla: 'blah'}),
//       };
//       getCloseServer = pluginExport(__module);
//       const ret = await __module.exports(() => {}, {});

//       const openContent = {appName: 'some app name', testName: 'some test', command: 'open'};
//       await axios.post(`https://localhost:${ret.eyesPort}/eyes/open`, openContent);

//       const resp = await fetch('https://applitools.com/images/icons/arrow-right-green.svg');
//       const content = await resp.buffer();
//       const headers = {headers: {'Content-Type': 'application/octet-stream'}};
//       // for(let j = 0; j < 10 ; j++){
//       const requests = [];
//       for (let i = 0; i < 400; i++) {
//         const curr = axios.put(
//           `https://localhost:${ret.eyesPort}/eyes/resource/:arrow-right-green.svg`,
//           content,
//           headers,
//         );
//         requests.push(curr);
//       }

//       await Promise.all(requests);
//       // }
//       // https://nodejs.org/api/cluster.html
//       //https://stackoverflow.com/questions/53340878/econnreset-in-express-js-node-js-with-multiple-requests
//     } catch (ex) {
//       const used = process.memoryUsage().heapUsed / 1024 / 1024;
//       // const cpuUsage = process.cpuUsage()
//       console.log(`Catch block:::The script uses approximately ${Math.round(used * 100) / 100} MB`);
//       // console.log(ex);
//       throw ex;
//     }
//   });
// });
