const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config();
const port = process.env.PORT || 8080;
const expressApp = express().use(bodyParser.json());
const util = require('util');
const request = require('request');
const fetch = require('node-fetch');
const request_prom = util.promisify(request);
const { sessionEntitiesHelper } = require('actions-on-google-dialogflow-session-entities-plugin')
const elastic_url = process.env.ELASTIC_URL || 'http://fridaywebhook.duckdns.org:9200/';
const setConversationalIntents = require('./webhooks/conversationals');
const {
    dialogflow,
    actionssdk,
    Image,
  } = require('actions-on-google')

const types = require('./services/types.service'); 

// Create an app instance
const app = dialogflow().use(sessionEntitiesHelper());
const app_sdk = actionssdk();

setConversationalIntents(app, app_sdk);

expressApp.post('/fulfillment', app)
expressApp.get('/', (req,res) => {res.send('<iframe allow="microphone;" width="350" height="430" src="https://console.dialogflow.com/api-client/demo/embedded/faf41e9c-6271-42be-bb9f-141008d52e33"> </iframe>')});


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

