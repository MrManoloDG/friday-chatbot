
const fetch = require('node-fetch');
const elastic_url = process.env.ELASTIC_URL || 'http://fridaywebhook.duckdns.org:9200/';

module.exports = function(app){
    const types = require('../services/types.service'); 
    const AppContexts = {
        OVERTIME: 'OverTime',
        NO_OVERTIME: 'NoOverTime'
      }

    app.intent('Decision Model - Relationship', conv => {
        return fetch(elastic_url + 'covid_canada',{
            method: 'GET',
        }).then(response => {
            return response.json();
        }).then(body => {
          console.log(body.covid_canada.mappings.properties) // 200
          
          types.check_date(body.covid_canada.mappings.properties).then((res,err) => {
            if(res) {
                conv.contexts.set(AppContexts.OVERTIME,5);
              } else {
                conv.contexts.set(AppContexts.NO_OVERTIME,5);
              }
              conv.ask('¿Que tipo de relación?');
          });
          
        });
    })
}