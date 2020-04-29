const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config();
const port = process.env.PORT || 8080;
const expressApp = express().use(bodyParser.json());
const util = require('util');
const request = require('request');
const fetch = require('node-fetch');
const request_prom = util.promisify(request);
const elastic_url = process.env.ELASTIC_URL || 'http://fridaywebhook.duckdns.org:9200/';
const setConversationalIntents = require('./webhooks/conversationals');
const {
    dialogflow,
    Image,
  } = require('actions-on-google')

const types = require('./services/types.service'); 

// Create an app instance
const app = dialogflow()

setConversationalIntents(app);

expressApp.post('/fulfillment', app)
expressApp.get('/', (req,res) => {res.send("working...")});


/*
expressApp.get('/test', (req,res) => {
  fetch(elastic_url + 'covid_canada',{
      method: 'GET',
  }).then(response => {
      return response.json();
  }).then(body => {
    types.check_length_many(body.covid_canada.mappings.properties).then((res,err) => { 
    });
    
  });
});
*/

console.log("Server listening in port: " + port);
expressApp.listen(port);

