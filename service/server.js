const express = require('express')
const bodyparser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const request = require("request")
const run = require("./run")

const app = express()

app.use(cors())
app.use(bodyparser.json())

app.get('/testrun/:tenant/:env/:runid', (req, res)=>{
    let testrunId=req.params.runid
    let env = req.params.env
    let tenant = req.params.tenant
    run.getRunInfo(res, testrunId, env, tenant) 
})

app.get('/runs/:tenant/:env', (req, res)=>{
    let tenant=req.params.tenant
    let env = req.params.env
    run.getRuns(res, tenant, env)    
})

app.post('/report/publishreport/:runid', (req, res)=>{
    let runId=req.params.runid

})

app.delete('/runs/orders/:tenant/:env', (req, res)=>{
    let tenant=req.params.tenant
    let env = req.params.env
    let orderIds = req.body
    run.deleteRun(res, tenant, orderIds)
})

/** Suite routes */
app.post('/suites/suite/:tenant', (req, res)=>{
    let tenant=req.params.tenant
    let body=req.body
})

app.listen(3000);