const request = require("request");
const Reports = require('./reports')

function getRuns(res, tenant, env) {
  var response = [];
  var payload = { 
    size: 20,
      sort: [
        {
          orderdate: {
            order: "desc"
          }
        }
      ]
  };

  let remote_payload = {
    index: `e2e_${tenant.toLowerCase()}`,
    type: "orders",
    source: payload,
    fetch : true
  }

  if(env === "local"){
    var requrl = `http://localhost:9200/e2e_${tenant.toLowerCase()}/_search`
    request.post(
      {
        url: requrl,
        json: payload
      },
      (err, httpResponse, body) => {
        body.hits.hits.forEach((element) => {
          if(element._source.testrunid.substring(0, 3)==tenant){
            response.push({
              runId:element._source.runid,
              tenant:tenant,
              suite:element._source.suite,
              environment:element._source.environment,
              processMessage:element._source.processMessage,
              rundate:element._source.orderdate,
              orderscount:element._source.orders.length
            });
          }
        });
        res.status(200).json(response)      
      }
    );
  } else if(env === "qa"){
    var requrl = process.env.COMMON_HOST
    var jsonpayload = JSON.stringify(remote_payload)
    request.post(
      {
        url: requrl,
        json: remote_payload,
        headers : {
          authorization : process.env.COMMON_AUTH,
          "content-type":"application/json",              
          accept : "application/json"
        }
      },
      function(err, httpResponse, body) {
        console.log(body)
        console.log(payload)
        if(httpResponse.statusCode>=500){
          res.status(500).json("Some internal error occured. Try again later!")
        } else if(httpResponse.statusCode>=403){
          res.status(403).json("You are restricted to access this environment from your current network.")
        } else if(httpResponse.statusCode==404){
          res.status(404).json("Requested content could not be retrieved") 
        }else {
          body.hits.hits.forEach((element) => {
            if(element._source.runid.substring(0, 3)===tenant){
              response.push({
                runId:element._source.runid,
                tenant:tenant,
                suite:element._source.suite,
                environment:element._source.environment,
                processMessage:element._source.processMessage,
                rundate:element._source.orderdate,
                orderscount:element._source.orders.length
              });
            }
          });
          res.status(200).json(response)      
        }
      }        
    );
  } else {
      res.status(400).json("Invalid Environment")
  }
}

function getRunInfo(res, runId, env, tenant) {
  var response = [];
  var payload = {
    query: {
      bool: {
        must: [
          {
            match: {
              runid: runId
            }
          }
        ]
      }
    },
    size : 100,
    sort : [
      {
        orderdate : {
          order:"desc"
        }
      }
    ]
  };

  let remote_payload = {
    index: `e2e_${tenant.toLowerCase()}`,
    type: "orders",
    source: payload,
    fetch : true
  }

  if(env === "local"){
    var requrl = `http://localhost:9200/e2e_${tenant.toLowerCase()}/_search`
    request.post(
      {
        url: requrl,
        json: payload
      },
      function(err, httpResponse, body) {
        body.hits.hits.forEach(element => {
          response.push(element._source);
        });
        res.status(200).json(response)      
      }
    );
  } else if(env === "qa"){
    var requrl = process.env.COMMON_HOST
    var jsonpayload = JSON.stringify(remote_payload)
    console.log("Payload:\n"+ jsonpayload)
    request.post(
      {
        url: requrl,
        json: remote_payload,      
        headers:{
          "authorization" : process.env.COMMON_AUTH,
          "content-type":"application/json",          
        }  
      },
      function(err, httpResponse, body) {
        console.log(body)
        if(httpResponse.statusCode>=500){
          res.status(500).json("Some internal error occured. Try again later!")
        } else if(httpResponse.statusCode>=403){
          res.status(403).json("You are restricted to access this environment from your current network.")
        } else {
          body.hits.hits.forEach(element => {
            response.push(element._source);
          });
          res.status(200).json(response)      
        }
      }        
    );
  } else {
      res.status(400).json("Invalid Environment")
  }
}

function publishReports(testRunId){
  let reports = new Reports.Reports(testRunId)
  
}

function deleteRun(res, tenant, orderIds){
  orderIds.forEach(orderid=>{
    deleteTestRun(tenant, orderid)
  })
  return true;
}

function deleteRun(tenant, orderid){
  let promise = new Promise((resolve, reject)=>{
    let requrl = `http://localhost:9200/e2e_${tenant.toLowerCase()}/orders/${orderid}`
  request.delete({
    url: requrl
  }, (err, httpResponse, body)=>{
    console.log(httpResponse.statusCode)
    if(httpResponse.statusCode == 200){
      if(body.result == "deleted"){
        resolve("Success")
      } else if(body.result == "not_found"){
        reject("Resource Missing")
      }
    } else{
      reject(`Error occured while deleting the record. StatusCode: ${httpResponse.statusCode}`)
    }
  })
  })

  promise.then((msg)=>{
    res.status(200).json({processing_msg : msg})
  }).catch((msg)=>{
    res.status(400).json({processing_msg : msg})
  })

}


function getCases(res, tenant, suitName){

}

module.exports.publishReports = publishReports
module.exports.getRunInfo = getRunInfo
module.exports.getRuns = getRuns
module.exports.deleteRun = deleteRun