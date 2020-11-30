function showEvents(poid){
  var x = document.getElementById(poid)
  if(x.style.display == "table-row"){
      x.style.display = "none";
  } else {
      x.style.display = "table-row";
  }
}

function getUniqueId(len) { 
  var val = ''; 
  var arr = '12345abcde';
  for (var i = len; i > 0; i--) { 
    val += arr[Math.floor(Math.random() * arr.length)]; 
  } 
  return val; 
} 

function getUrlParams(){
  var parameters = new Map()
  var params = window.location.href.split('?')[1]
  params.split('&').forEach(param=>{
    parameters.set(param.split('=')[0], param.split('=')[1])
  })
  return parameters
}

function disableSearch() {
  var nameInput = document.getElementById('runid').value;
  if (nameInput != "") {
    document.getElementById('searchbtn').removeAttribute("disabled");
  } else {
    document.getElementById('searchbtn').setAttribute("disabled", null);
  }
}

function getTestRuns() {
  document.getElementById('errormsg').innerHTML = ""
  let runs = ""
  let count = 0
  var xhr = new XMLHttpRequest();
  var tenant = document.getElementById('tenant').value
  var env = document.getElementById('env').value
  if(tenant!="default" && env!="default"){
    var fetchRuns = new Promise((resolve, reject) => {      
      xhr.onreadystatechange = function(){
        if(xhr.readyState == 4 ){
          if (xhr.status == 200) {
            resolve(xhr.responseText);
          } else {
            reject("An unexpected error occured. Please try later")
          }
        }
      }
      xhr.open("GET", `http://localhost:3000/testruns/${tenant.toUpperCase()}/${env}`, true);
      xhr.send();
    });
    fetchRuns.then(res => {
      let data = JSON.parse(res);
      data.forEach(run => {
        count++
        runs += `<tr>
        <td class="testruns">${count}</td>
        <td class="testruns">
          <a href="runinfo.html?runid=${run.testRunId}&env=${env}" onclick='fetchRunInfos(\"${run.testRunId}\", \"${env}\")'>${run.testRunId}</a>
        </td>
        <td class="testruns">${run.tenant}</td>
        <td class="testruns">${run.suite}</td>
        <td class="testruns">${run.environment}</td>
        <td class="testruns">${run.processMessage}</td>
        <td class="testruns">${run.rundate}</td>
        <td class="testruns">${run.orderscount}</td>
      </tr>`
      })
      document.getElementById('runids').innerHTML = runs
    })
    .catch(err => {
      document.getElementById('errormsg').innerHTML = `<h1 class="msg">An Unexpected error occured. Please try again</h1>`
    })
  } else if(tenant=="default"){
    document.getElementById("errormsg").innerHTML = `<h1 class="msg">Select Tenant</h1>`;
  } else if(env=="default"){
    document.getElementById("errormsg").innerHTML = `<h1 class="msg">Select Environment</h1>`;
  } 
  
}

function getRunInfo() {
  var testRunId = document.getElementById("runid").value;
  var env = document.getElementById("env").value;
  fetchRunInfos(testRunId, env)
}

function loadRunInfos(){
  var parameters = getUrlParams();
  var testRunId = parameters.get('runid')
  var env = parameters.get('env')
  if(testRunId.length>0&&env.length>0){
    fetchRunInfos(testRunId, env)
  }
}

function fetchRunInfos(testRunId, env){
  let colour = "";
  let classname = "";
  document.getElementById("runinfos").innerHTML = "";
  document.getElementById("errormsg").innerHTML = "";
  var xhr = new XMLHttpRequest();
  var ele = "";
  var tenant = testRunId.substring(0, 3);
  
  let errormsg = ""
  if(env==="default"){
    document.getElementById("errormsg").innerHTML = `<h1 class="msg">Select Environment</h1>`;
  }   
  var fetchRunInfo = new Promise((resolve, reject) => {
    xhr.onreadystatechange = function() {
      console.log(xhr.readyState);
     if(xhr.readyState == 4 ){
      if (xhr.status == 200) {
        resolve(xhr.responseText);
      } else if(xhr.status == 400) {
        reject("INVALID ENVIRONMENT !!")
      } else if(xhr.status == 403) {
        reject("You are restricted to access this environment from your current network.")
      } else {
        reject("Some internal error occured please try later")
      }
     }
    };
    xhr.open("GET", `http://localhost:3000/testrun/${tenant}/${env}/${testRunId}`, true);
    xhr.send();
  });
  fetchRunInfo.then(res => {
    let runinfo = "";
    let data = JSON.parse(res);
    let count = 0
    if (data.length == 0) {
      document.getElementById("errormsg").innerHTML = `<h1 class="msg">No orders found for the "${testRunId}" in ${env} environment</h1>`;
    } else {
      document.getElementById("errormsg").innerHTML = "";
    }
    data.forEach(element => {
      var lineid = getUniqueId(20);
      count++
      if (element.status === "PASSED") {
        colour = "darkgreen";
        classname = "normal";
      } else if (element.status === "INPROGRESS") {
        colour = "blue";
        classname = "animated";
      } else if (element.status === "FAILED") {
        colour = "red";
        classname = "normal";
      } else {
        element.status = "YTD"
        colour = "black";
        classname = "normal";
      }
      if (element.status === "INPROGRESS") {
        runinfo += `<tr style="color: ${colour}" class="${classname}";>
        <td scope="col">
              <button type="button" class="btn btn-light btn-circle btn-sm" onclick="showEvents('${lineid}')">+</button>
            </td>
        <td scope="col">${count}</td>
        <td scope="col">${element.caseid}</td>
        <td scope="col">${element.carts}</td>
        <td scope="col">${element.cartdesc}</td>
        <td scope="col">${element.poId}</td>
        <td scope="col">${element.runid}</td>
        <td scope="col">${element.suite}</td>
        <td scope="col">${element.environment}</td>
        <td scope="col">${element.paymentmethod}</td>
        <td scope="col">${element.orderstatus}</td>
        <td scope="col">${element.processedtag}</td>
        <td scope="col"><blink>${element.status}</blink></td>
      </tr>`;
      } else {
        runinfo += `<tr style="color: ${colour}" class="${classname}";>
        <td scope="col">
              <button type="button" class="btn btn-light btn-circle btn-sm" onclick="showEvents('${lineid}')">+</button>
            </td>
        <td scope="col">${count}</td>
          <td scope="col">${element.caseid}</td>
          <td scope="col">${element.carts}</td>
          <td scope="col">${element.cartdesc}</td>
          <td scope="col">${element.poId}</td>
          <td scope="col">${element.runid}</td>
          <td scope="col">${element.suite}</td>
          <td scope="col">${element.environment}</td>
          <td scope="col">${element.paymentmethod}</td>
          <td scope="col">${element.orderstatus}</td>
          <td scope="col">${element.processedtag}</td>
          <td scope="col">${element.status}</td>
        </tr>`;
      }
      if(element.eventResult.length === 0){
      let failures = ""
      for(var failure in element.failure){
        failures += `<h4>${failure} : ${element.failure[failure]}</h4><br>`
      }
        runinfo += `<tr class="content" id="${lineid}">
        <td colspan="13">
        <div class="failures">${failures}</div>
        <div class="noevents"><h4>No PostOrder Event results found for this case yet</h4></div>
        </td>
      </tr>`

      } else{
        let events = ""
      element.eventResult.forEach(event=>{
        let actions = ""
        event.action.forEach(action=>{
          if(action.actionresult === "PASSED"){
            actions += `<div class="passedaction">
              <h5>ActionName : ${action.actionname}</h5>
              <h5>ActionResult : ${action.actionresult}</h5>
            </div>`
          } else {
            actions += `<div class="failededaction">
              <h5>ActionName : ${action.actionname}</h5>
              <h5>ActionResult : ${action.actionresult}</h5>
              <h5>FailReason : ${action.failReason}</h5>
            </div>`
          }
        })
        events += `<div class="event">
        <div class="eventname">
              <h3><b>EventName :</b>${event.eventname}</h3>
                ${actions}
            </div> </div>`
      })
      let failures = ""
      for(var failure in element.failure){
        failures += `<h4>${failure} : ${element.failure[failure]}</h4><br>`
      }
      runinfo += `<tr class="content" id="${lineid}">
        <td colspan="13">
        <div class="events">${events}</div>
        <div class="failures">${failures}</div></td>
      </tr>`
      }  
      document.getElementById("runinfos").innerHTML = runinfo;
      document.getElementById("runid").value = "";
      document.getElementById('searchbtn').setAttribute("disabled", null);
    });
  })
  .catch(err => {
    document.getElementById("errormsg").innerHTML = `<h1 class="msg">${err}</h1>`;
    document.getElementById("env").value = "default";
    document.getElementById("runid").value = "";
    document.getElementById('searchbtn').setAttribute("disabled", null);
  });
}

function getRun() {
  let testrunid = document.getElementById("runid").value;
  let runinfo = "";
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    console.log(xhr.readyState);
    if (xhr.readyState == 4) {
      let data = JSON.parse(xhr.responseText);
      data.forEach(element => {
        runinfo += `<tr>
          <td scope="col">${element.runid}</td>
          <td scope="col">${element.suite}</td>
          <td scope="col">${element.environment}</td>
          <td scope="col">${element.caseid}</td>
          <td scope="col">${element.carts}</td>
          <td scope="col">${element.cartdesc}</td>
          <td scope="col">${element.poId}</td>
          <td scope="col">${element.paymentmethod}</td>
          <td scope="col">${element.orderstatus}</td>
        </tr>`;
        document.getElementById("runinfos").innerHTML = runinfo;
      });
    }
  };
  xhr.open("GET", `http://localhost:3000/testrun?runid=${testrunid}`, true);
  xhr.send();

  // fetch(`http://localhost:3000/testrun?runid=${testrunid}`)
  // .then(res => res.json())
  //   .then(data => {
  //       console.log(data)
  //     data.hits.hits.forEach(element => {
  //       runinfo += `<tr>
  //       <td scope="col">${element.runid}</td>
  //       <td scope="col">${element.suite}</td>
  //       <td scope="col">${element.environment}</td>
  //       <td scope="col">${element.caseid}</td>
  //       <td scope="col">${element.carts}</td>
  //       <td scope="col">${element.cartdesc}</td>
  //       <td scope="col">${element.poId}</td>
  //       <td scope="col">${element.paymentmethod}</td>
  //       <td scope="col">${element.orderstatus}</td>
  //     </tr>`
  //     document.getElementById("runinfos").innerHTML = runinfo;
  //     });
  //   }).catch().catch(err=>{
  //       console.log(new Error(err))});
}

function fetchRunInfo() {
  let testrunid = document.getElementById("runid").value;
  let runinfo = "";
  fetch(
    `https://${host}/api/console/proxy?${uri}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        authorization: authorization,
        "content-type": "application/json",      
      },
      body: `{"query":{"bool":{"must":[{"match":{"runid":"${testrunid}"}}]}},"size":100,"sort":[{"orderdate":{"order":"desc"}}]}`
    }
  )
    .then(res => res.json())
    .then(data => {
      console.log(data);
      data.hits.hits.forEach(element => {
        runinfo += `<tr>
        <td scope="col">${element.runid}</td>
        <td scope="col">${element.suite}</td>
        <td scope="col">${element.environment}</td>
        <td scope="col">${element.caseid}</td>
        <td scope="col">${element.carts}</td>
        <td scope="col">${element.cartdesc}</td>
        <td scope="col">${element.poId}</td>
        <td scope="col">${element.paymentmethod}</td>
        <td scope="col">${element.orderstatus}</td>
      </tr>`;
        document.getElementById("runinfos").innerHTML = runinfo;
      });
    })
    .catch()
    .catch(err => {
      console.log(new Error(err));
    });
}
