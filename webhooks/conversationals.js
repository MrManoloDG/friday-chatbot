
const fetch = require('node-fetch');
const elastic_url = process.env.ELASTIC_URL || 'http://fridaywebhook.duckdns.org:9200/';

module.exports = function(app, app_sdk){
    const types = require('../services/types.service'); 
    const AppContexts = {
        OVERTIME: 'OverTime',
        NO_OVERTIME: 'NoOverTime',
        BULLET_GRAPH: 'Bullet_Graph',
        SCATTER_PLOT: 'Scatter_Plot'
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
        conv.contexts.set(AppContexts.SCATTER_PLOT,5);
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

    app.intent('Bullet_Graph - colname - groupField', conv => {
      console.log(conv.parameters);
      let json = {
        resp: "Vale, voy a dibujarlo",
        graph: "bullet_graph",
        colname: conv.parameters.any,
        parameters: conv.parameters
      }
      conv.ask(JSON.stringify(json));
    });

    app.intent('Scatter_Plot - colnames', conv => {
      console.log(conv.parameters);
      let json = {
        resp: "Vale, voy a dibujarlo",
        graph: "scatter_plot",
        colname: [conv.parameters.att1,conv.parameters.att2],
        parameters: conv.parameters
      }
      conv.ask(JSON.stringify(json));
    });

    app.intent('box_plot - TimeField', conv => {
      return fetch(elastic_url + 'covid_canada',{
          method: 'GET',
      }).then(response => {
          return response.json();
      }).then(body => {    
        types.check_date_field(body.covid_canada.mappings.properties, conv.parameters.timeField).then((res,err) => {
          if(res) {
            console.log(conv.parameters);
            let json = {
              resp: "Vale, voy a dibujarlo",
              graph: "box_plot",
              colname: conv.parameters.any,
              parameters: conv.parameters
            }
            conv.ask(JSON.stringify(json));
          } else {
            let json = {
              resp: "No encuentro ese atributo de tiempo, si puedes volver a repetirmelo...",
              graph: "box_plot",
              colname: conv.parameters.any,
              parameters: conv.parameters
            }
            conv.ask(JSON.stringify(json));
          }
        });
      });
    });

    app.intent('Slope_Graph - timeField', conv => {
      console.log(conv.parameters);
      return fetch(elastic_url + 'covid_canada',{
          method: 'GET',
      }).then(response => {
          return response.json();
      }).then(body => {    
        types.check_date_field(body.covid_canada.mappings.properties, conv.parameters.timeField).then((res,err) => {
          if(res) {
            console.log(conv.parameters);
            let json = {
              resp: "Vale, voy a dibujarlo",
              graph: "slope_graph",
              colname: conv.parameters.any,
              parameters: conv.parameters
            }
            conv.ask(JSON.stringify(json));
          } else {
            let json = {
              resp: "No encuentro ese atributo de tiempo, si puedes volver a repetirmelo...",
              graph: "slope_graph",
              colname: conv.parameters.any,
              parameters: conv.parameters
            }
            conv.ask(JSON.stringify(json));
          }
        });
      });
    });
}