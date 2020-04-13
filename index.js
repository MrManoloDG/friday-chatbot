const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config();
const port = process.env.PORT || 8080;
const expressApp = express().use(bodyParser.json());
const request = require('request');
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
  console.log(request(elastic_url + 'covid_canada',{json: true}, function(err,res,body) {
    console.log(body.covid_canada.mappings.properties) // 200
    types.check_date(body.covid_canada.mappings.properties).then((res,err) => {
      if(res) {
          conv.contexts.set(AppContexts.OVERTIME,5);
        } else {
          conv.contexts.set(AppContexts.NO_OVERTIME,5);
        }
        conv.ask('¿Que tipo de relación?');
    });
  }))
});
*/
console.log("Server listening in port: " + port);
expressApp.listen(port);

