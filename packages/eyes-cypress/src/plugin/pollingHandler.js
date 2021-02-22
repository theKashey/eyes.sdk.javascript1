'use strict';
const PollingStatus = {
  IDLE: 'IDLE',
  WIP: 'WIP',
  DONE: 'DONE',
  ERROR: 'ERROR',
};

function pollingHandler(doWork) {
  let pollingStatus = PollingStatus.IDLE,
    workError,
    workResults;

  return () => {
    switch (pollingStatus) {
      case PollingStatus.IDLE:
        pollingStatus = PollingStatus.WIP;
        doWork()
          .then(results => {
            pollingStatus = PollingStatus.DONE;
            workResults = results;
          })
          .catch(ex => {
            pollingStatus = PollingStatus.ERROR;
            workError = ex;
          });
        return {status: PollingStatus.IDLE};
      case PollingStatus.WIP:
        return {status: PollingStatus.WIP};

      case PollingStatus.DONE:
        pollingStatus = PollingStatus.IDLE;
        return {status: PollingStatus.DONE, results: workResults};

      case PollingStatus.ERROR:
        pollingStatus = PollingStatus.IDLE;
        throw workError;

      default:
        throw new Error('Unknown error during cy.eyesClose()');
    }
  };
}

module.exports = pollingHandler;
module.exports.PollingStatus = PollingStatus;
