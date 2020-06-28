
const fetch = require('node-fetch');
const elastic_url = process.env.ELASTIC_URL || 'http://fridaywebhook.duckdns.org:9255/';

module.exports = function(app, app_sdk){
    const types = require('../services/types.service'); 
    const AppContexts = {
        PARAMS: 'Fields',
        OVERTIME: 'OverTime',
        NO_OVERTIME: 'NoOverTime',
        BULLET_GRAPH: 'Bullet_Graph',
        MULTIPLE_SCATTER_PLOTS: 'multiple_scatter_plots',
        SCATTER_PLOT: 'Scatter_Plot',
        TABLE: 'Highlight_table',
        LINE_GRAPH: 'Line_Graph'

      }

    app.intent('Default Welcome Intent', conv => {
      console.log('Default Welcome');
      return fetch(elastic_url + '_cat/indices?format=json&pretty=true',{
          method: 'GET',
      }).then(response => {
          return response.json();
      }).then(body => {   
        let datasets = [];
        body.map(e => {
          if(!(/\.\w*/.test(e.index))){
            datasets.push(e.index);
          }
        });
        console.log(datasets);
        conv.data.datasets = datasets;
        conv.sessionEntities.add(types.create_entities('Dataset', datasets));
        conv.ask("¡Hola! Soy su asistente para ayudarle a encontrar las mejores visualizaciones para su KPI. " + 
        "Si necesitas ayuda solo tienes que pedírmelo, diciendome a que dataset quieres referirte. Los datasets que tiene actualmente son: " + datasets);
        conv.sessionEntities.send();
      });
    });

    app.intent('Repeat Option Intent', conv => {
      console.log('Repeat Option Intent');
      return fetch(elastic_url + '_cat/indices?format=json&pretty=true',{
          method: 'GET',
      }).then(response => {
          return response.json();
      }).then(body => {   
        let datasets = [];
        body.map(e => {
          if(!(/\.\w*/.test(e.index))){
            datasets.push(e.index);
          }
        });
        conv.data.datasets = datasets;
        conv.sessionEntities.add(types.create_entities('Dataset', datasets));
        conv.ask("Vale, aquí vamos otra vez. Me podrias decir a qué dataset quieres referirte. " + 
        "Los datasets que tiene actualmente son: " + datasets);
        conv.sessionEntities.send();
      });
    });

    // This intent check the type date in the data for enable Overtime conversations
    // TODO: Check geo for geolocation conversation (the intent have to been enabled)
    app.intent('Decision Model - Relationship', conv => {
        console.log(conv.sessionEntities.get('colnames'));
        console.log('Decision Model - Relationship');
        console.log(elastic_url + conv.parameters.dataset);
        return fetch(elastic_url + conv.data.dataset,{
            method: 'GET',
        }).then(response => {
            return response.json();
        }).then(body => {
          console.log(body);
          types.check_date(body[conv.data.dataset].mappings.properties).then((res,err) => {
            console.log(res);
            if(res) {
                conv.contexts.set(AppContexts.OVERTIME,5);
              } else {
                conv.contexts.set(AppContexts.NO_OVERTIME,5);
              }
              conv.ask('¿Que tipo de relación? Las relaciones que actualmente conozco son: Desviación, Correlación, Distribución y Clasificación');
          });
          
        });
    });

    // This intent check how many values have our dataset for end the conversation
    app.intent('Decision Model', conv => {
      conv.data.dataset = conv.parameters.dataset;
      return fetch(elastic_url + conv.parameters.dataset,{
          method: 'GET',
      }).then(response => {
          return response.json();
      }).then(body => {    
        conv.data.fields = types.getFields(body[conv.parameters.dataset].mappings.properties);
        console.log(conv.data.fields);
        conv.contexts.set(AppContexts.PARAMS, 60, {fields: conv.data.fields});
        conv.sessionEntities.add(types.create_entities('colnames', conv.data.fields));
        types.check_length_many(body[conv.parameters.dataset].mappings.properties).then((res,err) => {
          if(res) {
            //Dialog to more than 1 set of values
            conv.ask("Claro, ¿Cuál sería el propósito? ¿Echar un vistazo a los datos o ver qué relaciones tienen sus atributos?");
          } else {
            //Dialog to 1 set of value
            conv.contexts.set(AppContexts.BULLET_GRAPH,5);
            conv.ask("Veo que solo tienes un atributo, deberias usar un grafico de bala. Si me lo pides podría dibujarlo.");
          }
          conv.sessionEntities.send();
        });
        
      });
    });

    // This intent check how many values have our dataset for end the conversation
    app.intent('Decision Model - Relationship - Correlation - N Categories', conv => {
      if (conv.parameters.number > 2) {
        conv.ask("Estaría bien usar varios gráficos de dispersión. Si me lo pides podría dibujarlo.");
        conv.contexts.set(AppContexts.MULTIPLE_SCATTER_PLOTS,5);
      } else {
        conv.ask("Estaría bien usar un gráfico de dispersión. Si me lo pides podría dibujarlo. ");
        conv.contexts.set(AppContexts.SCATTER_PLOT,5);
      }
    });

    // Intents for draw

    // HISTOGRAM
    app.intent('histogram - colname', conv => {
      console.log(conv.parameters.any);
      conv.parameters['url']=conv.data.dataset;
      let json = {
        resp: "Vale, voy a dibujarlo. Si quieres otra visualización solo me tienes que decir que repita el proceso. ",
        graph: "histogram",
        colname: conv.parameters.any,
        parameters: conv.parameters
      }
      conv.close(JSON.stringify(json));
    });

    app.intent('frequency_polygon - colname', conv => {
      console.log(conv.parameters.any);
      conv.parameters['url']=conv.data.dataset;
      let json = {
        resp: "Vale, voy a dibujarlo. Si quieres otra visualización solo me tienes que decir que repita el proceso. ",
        graph: "frequency_polygon",
        colname: conv.parameters.any,
        parameters: conv.parameters
      }
      conv.close(JSON.stringify(json));
    });

    app.intent('Bullet_Graph - colname - groupField', conv => {
      console.log(conv.parameters);
      conv.parameters['url']=conv.data.dataset;
      let json = {
        resp: "Vale, voy a dibujarlo. Si quieres otra visualización solo me tienes que decir que repita el proceso. ",
        graph: "bullet_graph",
        colname: conv.parameters.any,
        parameters: conv.parameters
      }
      conv.close(JSON.stringify(json));
    });

    app.intent('Scatter_Plot - colnames', conv => {
      console.log(conv.parameters);
      conv.parameters['url']=conv.data.dataset;
      let json = {
        resp: "Vale, voy a dibujarlo. Si quieres otra visualización solo me tienes que decir que repita el proceso. ",
        graph: "scatter_plot",
        colname: [conv.parameters.att1,conv.parameters.att2],
        parameters: conv.parameters
      }
      conv.close(JSON.stringify(json));
    });

    app.intent('box_plot - TimeField', conv => {
      conv.parameters['url']=conv.data.dataset;
      return fetch(elastic_url + conv.data.dataset,{
          method: 'GET',
      }).then(response => {
          return response.json();
      }).then(body => {    
        types.check_date_field(body[conv.data.dataset].mappings.properties, conv.parameters.timeField).then((res,err) => {
          if(res) {
            console.log(conv.parameters);
            let json = {
              resp: "Vale, voy a dibujarlo. Si quieres otra visualización solo me tienes que decir que repita el proceso. ",
              graph: "box_plot",
              colname: conv.parameters.any,
              parameters: conv.parameters
            }
            conv.close(JSON.stringify(json));
          } else {
            let json = {
              resp: "No encuentro ese atributo de tiempo, si puedes volver a repetirmelo...",
              graph: "timeField_error",
              colname: conv.parameters.any,
              parameters: conv.parameters
            }
            conv.ask(JSON.stringify(json));
          }
        });
      });
    });

    app.intent('Slope_Graph - timeField', conv => {
      conv.parameters['url']=conv.data.dataset;
      console.log(conv.parameters);
      return fetch(elastic_url + conv.data.dataset,{
          method: 'GET',
      }).then(response => {
          return response.json();
      }).then(body => {    
        types.check_date_field(body[conv.data.dataset].mappings.properties, conv.parameters.timeField).then((res,err) => {
          if(res) {
            console.log(conv.parameters);
            let json = {
              resp: "Vale, voy a dibujarlo. Si quieres otra visualización solo me tienes que decir que repita el proceso. ",
              graph: "slope_graph",
              colname: conv.parameters.any,
              parameters: conv.parameters
            }
            conv.close(JSON.stringify(json));
          } else {
            let json = {
              resp: "No encuentro ese atributo de tiempo, si puedes volver a repetirmelo...",
              graph: "timeField_error",
              colname: conv.parameters.any,
              parameters: conv.parameters
            }
            conv.ask(JSON.stringify(json));
          }
        });
      });
    });

    app.intent('Line Graph - fieldTime', conv => {
      conv.parameters['url']=conv.data.dataset;
      console.log(conv.parameters);
      return fetch(elastic_url + conv.data.dataset,{
          method: 'GET',
      }).then(response => {
          return response.json();
      }).then(body => {    
        types.check_date_field(body[conv.data.dataset].mappings.properties, conv.parameters.timeField).then((res,err) => {
          if(res) {
            console.log(conv.parameters);
            let json = {
              resp: "Vale, voy a dibujarlo. Si quieres otra visualización solo me tienes que decir que repita el proceso. ",
              graph: "line_graph",
              colname: conv.parameters.any,
              parameters: conv.parameters
            }
            conv.close(JSON.stringify(json));
          } else {
            let json = {
              resp: "No encuentro ese atributo de tiempo, si puedes volver a repetirmelo...",
              graph: "timeField_error",
              colname: conv.parameters.any,
              parameters: conv.parameters
            }
            conv.ask(JSON.stringify(json));
          }
        });
      });
    });

    app.intent('HeatMap - value', conv => {
      conv.parameters['url']=conv.data.dataset;
      console.log(conv.parameters);
      let json = {
        resp: "Vale, voy a dibujarlo. Si quieres otra visualización solo me tienes que decir que repita el proceso. ",
        graph: "heatmap",
        colname: [conv.parameters.col1,conv.parameters.col2],
        parameters: conv.parameters
      }
      conv.close(JSON.stringify(json));
    });

    app.intent('Variance Graph - group col', conv => {
      conv.parameters['url']=conv.data.dataset;
      console.log(conv.parameters);
      let json = {
        resp: "Vale, voy a dibujarlo. Si quieres otra visualización solo me tienes que decir que repita el proceso. ",
        graph: "variace_graph",
        colname: [conv.parameters.col1,conv.parameters.col2],
        parameters: conv.parameters
      }
      conv.close(JSON.stringify(json));
    });

    app.intent('Highlight Table - range', conv => {
      conv.parameters['url']=conv.data.dataset;
      console.log(conv.parameters);
      conv.parameters.fields = conv.data.fields
      let json = {
        resp: "Vale, voy a dibujarlo. Si quieres otra visualización solo me tienes que decir que repita el proceso. ",
        graph: "highlight_table",
        colname: conv.parameters.any,
        parameters: conv.parameters
      }
      conv.close(JSON.stringify(json));
    });

    app.intent('Multiple Scatter Plots - attrs', conv => {
      conv.parameters['url']=conv.data.dataset;
      console.log(conv.parameters.any);
      let json = {
        resp: "Vale, voy a dibujarlo. Si quieres otra visualización solo me tienes que decir que repita el proceso. ",
        graph: "multiple_scatter_plots",
        colname: conv.parameters.any,
        parameters: conv.parameters
      }
      conv.close(JSON.stringify(json));
      
    });
}