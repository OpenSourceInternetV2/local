src = src/
src-promises-files =\
	${src}promises.js
src-util-files =\
	${src}util/000_header.js\
	${src}util/001_event-emitter.js\
	${src}util/002_dom.js\
	${src}util/003_helpers.js\
	${src}util/module_footer.js
src-web-files =\
	${src}web/000_header.js\
	${src}web/001_constants.js\
	${src}web/002_helpers.js\
	${src}web/003_content-types.js\
	${src}web/004_httpheaders.js\
	${src}web/005_request.js\
	${src}web/006_response.js\
	${src}web/007_server.js\
	${src}web/008_worker-server.js\
	${src}web/009_rtcpeer-server.js\
	${src}web/010_schemes.js\
	${src}web/011_dispatch.js\
	${src}web/012_subscribe.js\
	${src}web/013_uri-template.js\
	${src}web/014_agent.js\
	${src}web/015_hosts-service.js\
	${src}web/module_footer.js
src-worker-files =\
	${src}worker/000_header.js\
	${src}worker/001_page-server.js\
	${src}worker/002_worker-env.js\
	${src}worker/module_footer.js
src-toplevel-files =\
	${src}000_header.js\
	${src}001_config.js\
	${src}002_spawners.js\
	${src}003_request-dom-events.js\
	${src}module_footer.js

setup: clean concat buildmin
	@echo "Done!"

clean:
	@-rm local.js local.min.js
	@echo Cleaned Out Libraries

concat: local.js
	@echo Concatted Libraries
local.js: ${src-promises-files} ${src-util-files} ${src-web-files} ${src-worker-files} ${src-toplevel-files}
	@cat > $@ $^

buildmin: local.min.js
	@echo Built Minified Versions
local.min.js: local.js
	@./scripts/minify.sh $@ $^

deps: uglifyjs
uglifyjs:
	-git clone git://github.com/mishoo/UglifyJS2.git
	(cd UglifyJS2 && npm link .)