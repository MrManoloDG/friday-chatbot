
const request = require('request');
const elastic_url = process.env.ELASTIC_URL || 'http://elasticsearch:9200/';

module.exports = function(app){
    const types = require('../services/types.service'); 
    const AppContexts = {
        OVERTIME: 'OverTime',
        NO_OVERTIME: 'NoOverTime'
      }

    app.intent('Decision Model - Relationship', conv => {
        request(elastic_url + 'covid_canada',{json: true}, function(err,res,body) {
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