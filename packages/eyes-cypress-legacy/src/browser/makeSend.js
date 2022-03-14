'use strict';
const throat = require('throat');
const CONCURRENCY_LIMITATION = 100;

function makeSend(port, fetch) {
  const send = function send({
    command,
    data,
    method = 'POST',
    headers = {'Content-Type': 'application/json'},
  }) {
    return fetch(`https://localhost:${port}/eyes/${command}`, {
      method,
      body: headers['Content-Type'] === 'application/json' ? JSON.stringify(data) : data,
      headers,
    });
  };

  return throat(CONCURRENCY_LIMITATION, send);
}

module.exports = makeSend;
