import { createRequire as __WEBPACK_EXTERNAL_createRequire } from "module";
/******/ var __webpack_modules__ = ({

/***/ 407:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 459:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 670:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("timers/promises");

/***/ }),

/***/ 535:
/***/ ((__webpack_module__, __unused_webpack___webpack_exports__, __nccwpck_require__) => {

__nccwpck_require__.a(__webpack_module__, async (__webpack_handle_async_dependencies__) => {
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_0__ = __nccwpck_require__(407);
/* harmony import */ var _actions_github__WEBPACK_IMPORTED_MODULE_1__ = __nccwpck_require__(459);
/* harmony import */ var timers_promises__WEBPACK_IMPORTED_MODULE_2__ = __nccwpck_require__(670);




const workflowId = _actions_core__WEBPACK_IMPORTED_MODULE_0__.getInput('workflow', {required: true})
const inputs = _actions_core__WEBPACK_IMPORTED_MODULE_0__.getInput('inputs')
const ref = _actions_core__WEBPACK_IMPORTED_MODULE_0__.getInput('ref')
const octokit = _actions_github__WEBPACK_IMPORTED_MODULE_1__.getOctokit(process.env.GITHUB_TOKEN)

let run = await runWorkflow(workflowId)

_actions_core__WEBPACK_IMPORTED_MODULE_0__.saveState('runId', run.id)
_actions_core__WEBPACK_IMPORTED_MODULE_0__.saveState('status', 'in_progress')

_actions_core__WEBPACK_IMPORTED_MODULE_0__.notice(`Workflow is running: ${run.html_url}`, {title: run.name})

run = await waitForWorkflowCompleted(run)

if (['cancelled', 'failure', 'timed_out'].includes(run.conclusion)) {
  _actions_core__WEBPACK_IMPORTED_MODULE_0__.saveState('status', 'failure')
  _actions_core__WEBPACK_IMPORTED_MODULE_0__.error(`Workflow was finished with failure status "${run.conclusion}"`, {title: run.name})
  _actions_core__WEBPACK_IMPORTED_MODULE_0__.setFailed(`Workflow "${run.name}" was finished with failure status "${run.conclusion}"`)
  process.exit(1)
}

if (['action_required', 'neutral', 'skipped', 'stale'].includes(run.conclusion)) {
  _actions_core__WEBPACK_IMPORTED_MODULE_0__.saveState('status', 'failure')
  _actions_core__WEBPACK_IMPORTED_MODULE_0__.error(`Workflow was finished with unexpected status "${run.conclusion}"`, {title: run.name})
  _actions_core__WEBPACK_IMPORTED_MODULE_0__.setFailed(`Workflow "${run.name}" was finished with unexpected status "${run.conclusion}"`)
  process.exit(1)
}

_actions_core__WEBPACK_IMPORTED_MODULE_0__.saveState('status', 'success')

_actions_core__WEBPACK_IMPORTED_MODULE_0__.notice('Workflow was finished successfully', {title: run.name})

async function runWorkflow(workflowId) {
  await octokit.rest.actions.createWorkflowDispatch({
    owner: _actions_github__WEBPACK_IMPORTED_MODULE_1__.context.repo.owner,
    repo: _actions_github__WEBPACK_IMPORTED_MODULE_1__.context.repo.repo,
    workflow_id: workflowId,
    ref,
    inputs: inputs ? JSON.parse(inputs) : undefined
  })

  let run

  while (!['queued', 'in_progress'].includes(run?.status)) {
    await (0,timers_promises__WEBPACK_IMPORTED_MODULE_2__.setTimeout)(3000)
  
    const response = await octokit.rest.actions.listWorkflowRuns({
      owner: _actions_github__WEBPACK_IMPORTED_MODULE_1__.context.repo.owner,
      repo: _actions_github__WEBPACK_IMPORTED_MODULE_1__.context.repo.repo,
      workflow_id: workflowId,
      per_page: 1
    })

    run = response.data.workflow_runs[0]
  }

  return run
}

async function waitForWorkflowCompleted(run) {
  while (run.status !== 'completed') {
    await (0,timers_promises__WEBPACK_IMPORTED_MODULE_2__.setTimeout)(3000)

    const response = await octokit.rest.actions.getWorkflowRunAttempt({
      owner: _actions_github__WEBPACK_IMPORTED_MODULE_1__.context.repo.owner,
      repo: _actions_github__WEBPACK_IMPORTED_MODULE_1__.context.repo.repo,
      run_id: run.id,
      attempt_number: run.run_attempt,
    })

    run = response.data
  }

  return run
}


__webpack_handle_async_dependencies__();
}, 1);

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __nccwpck_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	var threw = true;
/******/ 	try {
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 		threw = false;
/******/ 	} finally {
/******/ 		if(threw) delete __webpack_module_cache__[moduleId];
/******/ 	}
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/async module */
/******/ (() => {
/******/ 	var webpackThen = typeof Symbol === "function" ? Symbol("webpack then") : "__webpack_then__";
/******/ 	var webpackExports = typeof Symbol === "function" ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 	var completeQueue = (queue) => {
/******/ 		if(queue) {
/******/ 			queue.forEach((fn) => (fn.r--));
/******/ 			queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 		}
/******/ 	}
/******/ 	var completeFunction = (fn) => (!--fn.r && fn());
/******/ 	var queueFunction = (queue, fn) => (queue ? queue.push(fn) : completeFunction(fn));
/******/ 	var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 		if(dep !== null && typeof dep === "object") {
/******/ 			if(dep[webpackThen]) return dep;
/******/ 			if(dep.then) {
/******/ 				var queue = [];
/******/ 				dep.then((r) => {
/******/ 					obj[webpackExports] = r;
/******/ 					completeQueue(queue);
/******/ 					queue = 0;
/******/ 				});
/******/ 				var obj = {};
/******/ 											obj[webpackThen] = (fn, reject) => (queueFunction(queue, fn), dep['catch'](reject));
/******/ 				return obj;
/******/ 			}
/******/ 		}
/******/ 		var ret = {};
/******/ 							ret[webpackThen] = (fn) => (completeFunction(fn));
/******/ 							ret[webpackExports] = dep;
/******/ 							return ret;
/******/ 	}));
/******/ 	__nccwpck_require__.a = (module, body, hasAwait) => {
/******/ 		var queue = hasAwait && [];
/******/ 		var exports = module.exports;
/******/ 		var currentDeps;
/******/ 		var outerResolve;
/******/ 		var reject;
/******/ 		var isEvaluating = true;
/******/ 		var nested = false;
/******/ 		var whenAll = (deps, onResolve, onReject) => {
/******/ 			if (nested) return;
/******/ 			nested = true;
/******/ 			onResolve.r += deps.length;
/******/ 			deps.map((dep, i) => (dep[webpackThen](onResolve, onReject)));
/******/ 			nested = false;
/******/ 		};
/******/ 		var promise = new Promise((resolve, rej) => {
/******/ 			reject = rej;
/******/ 			outerResolve = () => (resolve(exports), completeQueue(queue), queue = 0);
/******/ 		});
/******/ 		promise[webpackExports] = exports;
/******/ 		promise[webpackThen] = (fn, rejectFn) => {
/******/ 			if (isEvaluating) { return completeFunction(fn); }
/******/ 			if (currentDeps) whenAll(currentDeps, fn, rejectFn);
/******/ 			queueFunction(queue, fn);
/******/ 			promise['catch'](rejectFn);
/******/ 		};
/******/ 		module.exports = promise;
/******/ 		body((deps) => {
/******/ 			if(!deps) return outerResolve();
/******/ 			currentDeps = wrapDeps(deps);
/******/ 			var fn, result;
/******/ 			var promise = new Promise((resolve, reject) => {
/******/ 				fn = () => (resolve(result = currentDeps.map((d) => (d[webpackExports]))));
/******/ 				fn.r = 0;
/******/ 				whenAll(currentDeps, fn, reject);
/******/ 			});
/******/ 			return fn.r ? promise : result;
/******/ 		}).then(outerResolve, reject);
/******/ 		isEvaluating = false;
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
/******/ 
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module used 'module' so it can't be inlined
/******/ var __webpack_exports__ = __nccwpck_require__(535);
/******/ __webpack_exports__ = await __webpack_exports__;
/******/ 
