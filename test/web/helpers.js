// == SECTION helpers - pipe()

done = false;
startTime = Date.now();
var res = local.web.dispatch({ method:'get', url:'httpl://test.com/pipe' });
res.then(printSuccess, printError).then(finishTest);
wait(function () { return done; });

/* =>
success
{
  body: "SERVICE RESOURCE",
  headers: {
    "content-type": "text/piped+plain",
    link: [
      {href: "/", rel: "self current"},
      {href: "/events", id: "events", rel: "collection"},
      {href: "/foo", id: "foo", rel: "collection"},
      {href: "/{id}", rel: "collection"}
    ]
  },
  reason: "ok",
  status: 200
}
*/