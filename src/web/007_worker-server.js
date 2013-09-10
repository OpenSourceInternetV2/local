// WorkerServer
// ============
// EXPORTED
// wrapper for servers run within workers
// - `config.src`: required URL
// - `config.shared`: boolean, should the workerserver be shared?
// - `config.namespace`: optional string, what should the shared worker be named?
//   - defaults to `config.src` if undefined
// - `config.bootstrapUrl`: optional string, specifies the URL of the worker bootstrap script
// - `config.log`: optional bool, enables logging of all message traffic
// - `loadCb`: optional function(message)
function WorkerServer(config, loadCb) {
	if (!config || !config.src)
		throw new Error("WorkerServer requires config with `src` attribute.");
	local.web.BridgeServer.call(this, config);
	this.isUserScriptActive = false; // when true, ready for activity
	this.hasHostPrivileges = true; // do we have full control over the worker?
	// ^ set to false by the ready message of a shared worker (if we're not the first page to connect)
	this.loadCb = loadCb;

	// Prep config
	if (!this.config.domain) { // assign a temporary label for logging if no domain is given yet
		this.config.domain = '<'+this.config.src.slice(0,40)+'>';
	}
	this.config.environmentHost = window.location.host; // :TODO: needed? I think workers can access this directly

	// Initialize the worker
	if (this.config.shared) {
		this.worker = new SharedWorker(config.bootstrapUrl || local.workerBootstrapUrl, config.namespace);
		this.worker.port.start();
	} else {
		this.worker = new Worker(config.bootstrapUrl || local.workerBootstrapUrl);
	}

	// Setup the incoming message handler
	this.getPort().addEventListener('message', (function(event) {
		var message = event.data;
		if (!message)
			return console.error('Invalid message from worker: Payload missing', this, event);
		if (this.config.log) { console.debug('WORKER received', message); }

		// Handle messages with an `op` field as worker-control packets rather than HTTPL messages
		switch (message.op) {
			case 'ready':
				// Bootstrap script can now accept commands
				this.onWorkerReady(message.body);
				break;
			case 'loaded':
				// User script has loaded
				this.onWorkerUserScriptLoaded(message.body);
				break;
			case 'log':
				this.onWorkerLog(message.body);
				break;
			case 'terminate':
				this.terminate();
				break;
			default:
				// If no 'op' field is given, treat it as an HTTPL request and pass onto our BridgeServer parent method
				this.onChannelMessage(message);
				break;
		}
	}).bind(this));
}
WorkerServer.prototype = Object.create(local.web.BridgeServer.prototype);
local.web.WorkerServer = WorkerServer;

// Returns the worker's messaging interface
// - varies between shared and normal workers
WorkerServer.prototype.getPort = function() {
	return this.worker.port ? this.worker.port : this.worker;
};

WorkerServer.prototype.terminate = function() {
	this.worker.terminate();
	this.worker = null;
	this.isUserScriptActive = false;
};

// Instructs the worker to set the given name to null
// - eg worker.nullify('XMLHttpRequest'); // no ajax
WorkerServer.prototype.nullify = function(name) {
	this.channelSendMsg({ op: 'nullify', body: name });
};

// Instructs the WorkerServer to import the JS given by the URL
// - eg worker.importScripts('/my/script.js');
// - `urls`: required string|[string]
WorkerServer.prototype.importScripts = function(urls) {
	this.channelSendMsg({ op: 'importScripts', body: urls });
};

// Returns true if the channel is ready for activity
// - returns boolean
WorkerServer.prototype.isChannelActive = function() {
	return this.isUserScriptActive;
};

// Sends a single message across the channel
// - `msg`: required string
WorkerServer.prototype.channelSendMsg = function(msg) {
	if (this.config.log) { console.debug('WORKER sending', msg); }
	this.getPort().postMessage(msg);
};

// Remote request handler
WorkerServer.prototype.handleRemoteWebRequest = function(request, response) {
	// :TODO: proxyyy
	console.warn('WORKER handleRemoteWebRequest not defined', this);
	response.writeHead(500, 'server not implemented');
	response.end();
};

// Sends initialization commands
// - called when the bootstrap signals that it has finished loading
WorkerServer.prototype.onWorkerReady = function(message) {
	this.hasHostPrivileges = message.hostPrivileges;
	if (this.hasHostPrivileges) {
		// Disable undesirable APIs
		this.nullify('XMLHttpRequest');
		this.nullify('Worker');

		// Load user script
		var src = this.config.src;
		if (src.indexOf('data:application/javascript,') === 0)
			src = 'data:application/javacsript;base64,'+btoa(src.slice(28));
		this.channelSendMsg({ op: 'configure', body: this.config });
		this.importScripts(src);
	} else {
		this.onWorkerUserScriptLoaded();
	}
};

// Starts normal operation
// - called when the user script has finished loading
WorkerServer.prototype.onWorkerUserScriptLoaded = function(message) {
	if (this.loadCb && typeof this.loadCb == 'function') {
		this.loadCb(message);
	}
	if (message && message.error) {
		console.error('Failed to load user script in worker, terminating', message, this);
		this.terminate();
	}
	else {
		this.isUserScriptActive = true;
		this.flushBufferedMessages();
	}
};

// Logs message data from the worker
WorkerServer.prototype.onWorkerLog = function(message) {
	if (!message)
		return;
	if (!Array.isArray(message))
		return console.error('Received invalid "log" operation: Payload must be an array', message);

	var type = message.shift();
	var args = ['['+this.config.domain+']'].concat(message);
	switch (type) {
		case 'error':
			console.error.apply(console, args);
			break;
		case 'warn':
			console.warn.apply(console, args);
			break;
		default:
			console.log.apply(console, args);
			break;
	}
};