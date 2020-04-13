const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config();
const port = process.env.PORT || 8080;
const expressApp = express().use(bodyParser.json())
const setConversationalIntents = require('./webhooks/conversationals');
const {
    dialogflow,
    Image,
  } = require('actions-on-google')

// Create an app instance
const app = dialogflow()

setConversationalIntents(app);

expressApp.post('/fulfillment', app)
expressApp.get('/', (req,res) => {res.send("working...")});


/*
expressApp.get('/test', (req,res) => {
  request(elastic_url + 'covid_canada',{json: true}, function(err,res,body) {
    //console.log(body.covid_canada.mappings.properties) // 200
    console.log(check_date(body.covid_canada.mappings.properties));
  });
  
});
expressApp.listen(port);
*/


require("greenlock-express")
  .init({
      packageRoot: __dirname,
      configDir: "./greenlock.d",

      // contact for security and critical bug notices
      maintainerEmail: "mandiagil@alum.us.es",

      // whether or not to run at cloudscale
      cluster: false
  })
  // Serves on 80 and 443
  // Get's SSL certificates magically!
  .serve(expressApp);
