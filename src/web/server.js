// Server
// ======
// EXPORTED
// core type for all servers, should be used as a prototype
function Server(config) {
	this.config = { domain: null };
	if (config) {
		for (var k in config)
			this.config[k] = config[k];
	}
}

// request handler, should be overwritten by subclasses
Server.prototype.handleWebRequest = function(request, response) {
	response.writeHead(0, 'server not implemented');
	response.end();
};

// called before server destruction, should be overwritten by subclasses
// - executes syncronously; does not wait for cleanup to finish
Server.prototype.terminate = function() {
};


local.web.Server = Server;