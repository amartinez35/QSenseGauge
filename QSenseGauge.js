define(["./radialProgress", "./d3.min", "css!./QSenseGauge.css", "qlik"],
  function (radial, d3, template, qlik) {
    "use strict";  
    

    //palette de sélection couleur 1
    var ColorArc1 = {
      ref: "Arc1",
      type: "object",
      component: "color-picker",
      label: "First arc",
      defaultValue: {
        index: 3,
        color: "#4477aa"
      },
      show: function(data){
        return data.qHyperCubeDef.qMeasures.length >=1;
      }
    };
    //palette de sélection couleur 2
    var ColorArc2 = {
      ref: "Arc2",
      type: "object",
      component: "color-picker",
      label: "Second arc",
      defaultValue: {
        index: 2,
        color: "#545352"
      },
      show: function(data){
        return data.qHyperCubeDef.qMeasures.length >=2;
      }
    };

    var limite1 = {
      ref: "limite1",
      type: "integer",
      label: "Limit arc 1",
      expression: "always",
      defaultValue: 100,
      show: function(data){
        return data.qHyperCubeDef.qMeasures.length >=1;
      }
    };
    var limite2 = {
      ref: "limite2",
      type: "integer",
      label: "Limit arc 2",
      expression: "always",
      defaultValue: 100,
      show: function(data){
        return data.qHyperCubeDef.qMeasures.length >=2;
      }
    };

    var imageGauge = {
      label: "Gauge image",
      component: "media",
      ref: "iconGauge",
      layoutRef: "myMedia",
      type: "string"
    };

    var affichageMesure1 = {
      type: "boolean",
      component: "switch",
      label: "Display measure 1",
      ref: "affichage1",
      options: [{
        value: true,
        label: "On"
				}, {
        value: false,
        label: "Off"
				}],
      defaultValue: true,
      show: function(data){
        return data.qHyperCubeDef.qMeasures.length >=1;
      }
    };

    var affichageMesure2 = {
      type: "boolean",
      component: "switch",
      label: "Display measure 2",
      ref: "affichage2",
      options: [{
        value: true,
        label: "On"
				}, {
        value: false,
        label: "Off"
				}],
      defaultValue: true,
      show: function(data){
        return data.qHyperCubeDef.qMeasures.length >=2;
      }
    };
  
    var aboutImage = {
      type: "string",
      component: "text",
      ref: "aboutImage",
      label: '<img src="../extensions/QSenseGauge/Excelcio.png">',
      show: function(data){
        $('[tid="aboutImage"]').children().empty();
        $('[tid="aboutImage"]').children().append('<img src="../extensions/QSenseGauge/Excelcio.png">');
        return true;
      }
    };
  
    var aboutLien = {
      type: "string",
      component: "link",
      ref: "aboutLien",
      label: "Excelcio",
      url: "http://www.excelcio.com"
    }

    //définition de l'objet
    return {
      initialProperties: {
        qHyperCubeDef: {
          qDimensions: [],
          qMeasures: [],
          qInitialDataFetch: [{
            qWidth: 2,
            qHeight: 50
          }]
        }
      },
      definition: {
        type: "items",
        component: "accordion",
        items: {
          measures: {
            uses: "measures",
            min: 1,
            max: 4
          },
          Setting: {
            uses: "settings",
            items: {
              Colors: {
                ref: "Color",
                type: "items",
                label: "Display",
                items: {
                  Colors1: ColorArc1,
                  Colors2: ColorArc2,
                  affichage1: affichageMesure1,
                  affichage2: affichageMesure2,
                  MediaGauge: imageGauge,
                }
              },
              Limite: {
                ref: "limite",
                type: "items",
                label: "Limits",
                items: {
                  limite1: limite1,
                  limite2: limite2
                }
              },
              About:{
                ref:"about",
                type: "items",
                label: "About Excelcio" ,
                items:{
                  aboutImage: aboutImage,
                  aboutLien: aboutLien
                }
              }
            }
          }
        }
      },
      support: {
        export: true
      },
      snapshot: {
        canTakeSnapshot: true
      },

      //affichage de l'objet
      paint: function ($element, layout) {

        //Taille de l'objet
        var width = $element.width();
        var height = $element.height();

        var id = "container_" + layout.qInfo.qId;

        //construction de la div
        if (document.getElementById(id)) {
          $("#" + id).empty();
        } else {
          $element.append($('<div />').attr("id", id).attr("class", "viz").width(width).height(height));
        }

        //recup des données
        var hc = layout.qHyperCube;
        //recup de la zone d'affichage
        var div = document.getElementById(id);

        var tooLong = ' ';

        if (hc.qMeasureInfo[0].qFallbackTitle.length > 13) {
          tooLong = '... ';
        }

        //recup de la valeur de la mesure
        var measureName = hc.qMeasureInfo[0].qFallbackTitle.substr(0, 13) + tooLong + hc.qDataPages[0].qMatrix[0][0].qText;
        var value = hc.qDataPages[0].qMatrix[0][0].qNum;

        if (hc.qDataPages[0].qMatrix[0].length > 1) {
          tooLong = ' ';
          if (hc.qMeasureInfo[1].qFallbackTitle.length > 13) {
            tooLong = '... ';
          }

          var value2 = hc.qDataPages[0].qMatrix[0][1].qNum;
          var measureName2 = hc.qMeasureInfo[1].qFallbackTitle.substr(0, 13) + tooLong + hc.qDataPages[0].qMatrix[0][1].qText;
        }
        
        qlik.currApp(this).theme.getApplied().then(function(qtheme){
    console.log(qtheme.properties.palettes);
});


        //couleur arc 1 et 2
        var colorAcr1 = layout.Arc1.color;
        var colorAcr2 = layout.Arc2.color;

        var iconGauge = layout.iconGauge;
        //Création de la jauge
        var rad1 = radialProgress(div, width, height, [colorAcr1, colorAcr2], iconGauge, [layout.affichage1, layout.affichage2])
          .value(value)
          .value2(value2)
          .label(measureName)
          .label2(measureName2)
          .maxValue(layout.limite1)
          .maxValue2(layout.limite2)
          .render();

        return qlik.Promise.resolve();

      }
    };

  });
