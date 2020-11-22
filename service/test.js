const request = require("request");

var runId = "GBRDD1590733239"
var tenant = "GBR"
var payload = {
  query: {
    bool: {
      must: [
        {
          match: {
            runid: runId,
          },
        },
      ],
    },
  },
  size: 100,
  sort: [
    {
      orderdate: {
        order: "desc",
      },
    },
  ],
};

let remote_payload = {
  index: `e2e_${tenant.toLowerCase()}_orderinfo`,
  type: "orders",
  source: payload,
  fetch: true,
};
var jsonpayload = JSON.stringify(remote_payload);
var options = {
  method: "POST",
  url: process.env.COMMON_HOST,
  headers: {
    authorization: process.env.COMMON_AUTH,
    "content-type": " application/json",
    accept: " application/json"
  },
  body: jsonpayload,
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});