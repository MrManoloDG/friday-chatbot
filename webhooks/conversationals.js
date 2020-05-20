
const fetch = require('node-fetch');
const elastic_url = process.env.ELASTIC_URL || 'http://fridaywebhook.duckdns.org:9200/';

module.exports = function(app){
    const types = require('../services/types.service'); 
    const AppContexts = {
        OVERTIME: 'OverTime',
        NO_OVERTIME: 'NoOverTime',
        BULLET_GRAPH: 'Bullet_Graph'
      }

    // This intent check the type date in the data for enable Overtime conversations
    // TODO: Check geo for geolocation conversation (the intent have to been enabled)
    app.intent('Decision Model - Relationship', conv => {
        console.log('Decision Model - Relationship');
        return fetch(elastic_url + 'covid_canada',{
            method: 'GET',
        }).then(response => {
            return response.json();
        }).then(body => {   
          types.check_date(body.covid_canada.mappings.properties).then((res,err) => {
            console.log(res);
            if(res) {
                conv.contexts.set(AppContexts.OVERTIME,5);
              } else {
                conv.contexts.set(AppContexts.NO_OVERTIME,5);
              }
              conv.ask('¿Que tipo de relación?');
          });
          
        });
    });

    // This intent check how many values have our dataset for end the conversation
    app.intent('Decision Model', conv => {
      console.log("llegado");
      return fetch(elastic_url + 'covid_canada',{
          method: 'GET',
      }).then(response => {
          return response.json();
      }).then(body => {    
        types.check_length_many(body.covid_canada.mappings.properties).then((res,err) => {
          if(res) {
            //Dialog to more than 1 set of values
            conv.ask("Claro,  ¿Cuál sería el propósito?");
          } else {
            //Dialog to 1 set of value
            conv.contexts.set(AppContexts.BULLET_GRAPH,5);
            conv.ask("Veo que solo tienes un atributo, deberias de usar un grafico de bala");
          }
        });
        
      });
    });

    // This intent check how many values have our dataset for end the conversation
    app.intent('Decision Model - Relationship - Correlation - N Categories', conv => {
      if (conv.parameters.number > 2) {
        conv.ask("Estaría bien usar varios gráficos de dispersión.");
      } else {
        conv.ask("Estaría bien usar un gráfico de dispersión.");
      }
    });

    // Intents for draw

    // HISTOGRAM
    app.intent('histogram - colname', conv => {
      console.log(conv.parameters.any);
      let json = {
        resp: "Vale, voy a dibujarlo",
        graph: "histogram",
        colname: conv.parameters.any,
        parameters: conv.parameters
      }
      conv.ask(JSON.stringify(json));
    });

    app.intent('frequency_polygon - colname', conv => {
      console.log(conv.parameters.any);
      let json = {
        resp: "Vale, voy a dibujarlo",
        graph: "frequency_polygon",
        colname: conv.parameters.any,
        parameters: conv.parameters
      }
      conv.ask(JSON.stringify(json));
    });

    app.intent('Bullet_Graph - colname - target', conv => {
      console.log(conv.parameters);
      let json = {
        resp: "Vale, voy a dibujarlo",
        graph: "bullet_graph",
        colname: conv.parameters.any,
        parameters: conv.parameters
      }
      conv.ask(JSON.stringify(json));
    });
}