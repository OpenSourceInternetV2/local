// == SECTION core - remote requests

// successful remote requests

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'http://grimwire.com:8080', headers: { accept: 'application/json' } });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: {hello: "world"},
  headers: {
    allow: "OPTIONS, HEAD, GET",
    "content-type": "application/json",
    link: [
      {href: "http://grimwire.com:8080/", rel: "self current"},
      {href: "http://grimwire.com:8080/foo", id: "foo", rel: "collection"},
      {href: "http://grimwire.com:8080/{id}", rel: "collection"}
    ]
  },
  reason: "Ok",
  status: 200
}

*/

// unsuccessful remote requests

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'http://grimwire.com:8080/bad/url' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
error
{
  body: "",
  headers: {allow: "OPTIONS, HEAD, GET"},
  reason: "Not Found",
  status: 404
}
*/

// == SECTION core - local requests

// successful local requests

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'httpl://test.com' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "service resource",
  headers: {
    "content-type": "text/plain",
    link: [
      {href: "httpl://test.com/", rel: "self current"},
      {href: "httpl://test.com/events", id: "events", rel: "collection"},
      {href: "httpl://test.com/foo", id: "foo", rel: "collection"},
      {href: "httpl://test.com/{id}", rel: "collection"}
    ]
  },
  reason: "ok",
  status: 200
}
*/

// unsuccessful local requests

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'httpl://test.com/bad/url' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
error
{body: "", headers: {},  reason: "not found", status: 404}
*/

// == SECTION core - rel-uri requests

// successful local requests

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'rel:httpl://test.com||collection=foo||item=baz' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "baz",
  headers: {
    "content-type": "application/json",
    link: [
      {href: "httpl://test.com/", rel: "via service"},
      {href: "httpl://test.com/foo", rel: "up collection index"},
      {href: "httpl://test.com/foo/baz", rel: "self current"},
      {href: "httpl://test.com/foo/bar", rel: "first"},
      {href: "httpl://test.com/foo/blah", rel: "last"},
      {href: "httpl://test.com/foo/bar", rel: "prev"},
      {href: "httpl://test.com/foo/blah", rel: "next"}
    ]
  },
  reason: "ok",
  status: 200
}
*/

// unsuccessful local requests

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'rel:httpl://test.com||collection=lolno||item=baz' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
error
{body: "", headers: {}, reason: "not found", status: 404}
*/

// unsuccessful local requests

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'rel:httpl://test.com||collection=foo||item=blammo' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
error
{body: "", headers: {}, reason: "not found", status: 404}
*/

// == SECTION core - data-uri requests

// non-base64-encoded

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'data:text/html;charset=utf-8,%3Ch1%3EHello%20World%21%3C%2Fh1%3E' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "<h1>Hello World!</h1>",
  headers: {"content-type": "text/html"},
  reason: "ok",
  status: 200
}
*/

// base64-encoded

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'data:text/html;charset=utf-8;base64,PGgxPkhlbGxvIFdvcmxkITwvaDE+' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "<h1>Hello World!</h1>",
  headers: {"content-type": "text/html"},
  reason: "ok",
  status: 200
}
*/

// empty body, non-base64-encoded

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'data:text/html;charset=utf-8,' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {"content-type": "text/html"}, reason: "ok", status: 200}
*/

// empty body, base64-encoded

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'data:text/html;charset=utf-8;base64,' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{body: "", headers: {"content-type": "text/html"}, reason: "ok", status: 200}
*/

// == SECTION core - proxy requests

// successful proxy to local requests

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'proxy:httpl://test.com/proxy|httpl://test.com' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "service resource",
  headers: {
    "content-type": "text/plain",
    link: [
      {href: "httpl://test.com/", rel: "self current"},
      {href: "httpl://test.com/events", id: "events", rel: "collection"},
      {href: "httpl://test.com/foo", id: "foo", rel: "collection"},
      {href: "httpl://test.com/{id}", rel: "collection"}
    ],
    via: ["httpl://test.com"]
  },
  reason: "ok",
  status: 200
}
*/

// unsuccessful proxy to local requests

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'proxy:httpl://test.com/proxy|httpl://test.com/bad/url' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
error
{
  body: "",
  headers: {"content-type": "text/plain"},
  reason: "bad gateway",
  status: 502
}
*/

// successful proxy to remote requests

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'proxy:httpl://test.com/proxy|http://grimwire.com:8080', headers: { accept: 'application/json' } });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: {hello: "world"},
  headers: {
    allow: "OPTIONS, HEAD, GET",
    "content-type": "application/json",
    link: [
      {href: "http://grimwire.com:8080/", rel: "self current"},
      {href: "http://grimwire.com:8080/foo", id: "foo", rel: "collection"},
      {href: "http://grimwire.com:8080/{id}", rel: "collection"}
    ],
    via: ["httpl://test.com"]
  },
  reason: "Ok",
  status: 200
}
*/

// unsuccessful proxy to remote requests

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'proxy:httpl://test.com/proxy|http://grimwire.com:8080/bad/url' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
error
{
  body: "",
  headers: {"content-type": "text/plain"},
  reason: "bad gateway",
  status: 502
}
*/

// successful two-stage proxy to local requests

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'proxy:httpl://test.com/proxy|httpl://test.com/proxy|httpl://test.com' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "service resource",
  headers: {
    "content-type": "text/plain",
    link: [
      {href: "httpl://test.com/", rel: "self current"},
      {href: "httpl://test.com/events", id: "events", rel: "collection"},
      {href: "httpl://test.com/foo", id: "foo", rel: "collection"},
      {href: "httpl://test.com/{id}", rel: "collection"}
    ],
    via: ["httpl://test.com"]
  },
  reason: "ok",
  status: 200
}
*/


// unsuccessful two-stage proxy to local requests

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'proxy:httpl://test.com/proxy|httpl://test.com/proxy|httpl://test.com/bad/url' });
res.then(printSuccess, printError).always(finishTest);
wait(function () { return done; });

/* =>
error
{
  body: "",
  headers: {"content-type": "text/plain"},
  reason: "bad gateway",
  status: 502
}
*/