     $( document ).ready(function() {
        $(function() {
            $('.ride-card').matchHeight();
        });
         
        $(function() {
            $('.info-card').matchHeight();
        });
         
        $(function() {
            $('.logo-card').matchHeight();
        });
     });

//beginning of script to load map and add map functionality
 window.onload = function () {

// preload images
$('.modal-thumb').each( function () {
    img = new Image();
    img.src = $(this).data('modal-src');
});

//set sidebar for responsive navigation to width away from being 0px
$('#hamburger').on('click', function() {
    document.getElementById("mySidenav").style.width = "250px";
})
    
//set sidebar for responsive navigation to 0px when closing navigation sidebar
$('.closebtn').on('click', function() {
    document.getElementById("mySidenav").style.width = "0px";
})
   
//when clicking on a rides photo in The Rides section, open up a modal and fill in the photo and title
$('.modal-thumb').on('click', function () {
    var title = $(this).data('modal-title'),
        src = $(this).data('modal-src');
    
    $('#modal h4').text(title);
    $('#modal img').attr('src', src);

    $('#modal').modal('show');
});
     

//***** BEGIN SET ALL STYLES FOR MAP FEATURES *****//  
    var easyRideStyle = {
        "color": "#00803e",
        "weight": 5,
        "opacity": 1,
        "offset": 1.5
    };
     
     
    var easyRideAlternateStyle = {
        "color": "#00803e",
        "lineCap": "butt",
        "dashArray": "6 5",
        "weight": 5,
        "opacity": 1,
        "offset": 1.5
    }
     
    var mediumRideStyle = {
        "color": "#00689e",
        "weight": 5,
        "opacity": 1,
        "offset": 1.5
    };
     
    var mediumRideAlternateStyle = {
        "color": "#00689e",
        "lineCap": "butt",
        "dashArray": "6 5",
        "weight": 5,
        "opacity": 1,
        "offset": 1.5
    };
     
    var difficultRideStyle = {
        "color": "#231f20",
        "weight": 5,
        "opacity": 1,
        "offset": 1.5
    };
     
    var difficultRideAlternateStyle = {
        "color": "#231f20",
        "lineCap": "butt",
        "dashArray": "6 5",
        "weight": 5,
        "opacity": 1,
        "offset": 1.5
    };
     
    var countyStyle = {
        "fill": false,
        "color": "#85807a",
        "weight": 2,
      "opacity": 1
       // "dashArray": "20 15",
    };
     
    var invisibleCountyStyle = {
        "fill": false,
        "color": "#85807a",
        "weight": 2,
        "opacity": 0
    };
     
    var invisibleStyle = {
        "color": "rgba(0,0,0,0.3)",
        "weight": 4,
    };    
     
//***** END SET ALL STYLES FOR MAP FEATURES *****\\
  
//***** BEGIN SET UP BUTTON GROUP FUNCTIONALITY FOR ALL/EASY/MEDIUM/DIFFICULT FILTERING *****// 
      $(".btn-group > button").on("click", function() {
        var defaultClass = "btn btn-default";
        var toBeAssignedClass = $(this).attr("data-btn-class");
        $(".btn-group > button").attr("class", defaultClass);
        $(this).attr("class", toBeAssignedClass);
          selectedLayer.clearLayers();
          ridePOILayers.clearLayers();
        showWhatTrails(this.value);  
    });
//***** END SET UP BUTTON GROUP FUNCTIONALITY FOR ALL/EASY/MEDIUM/DIFFICULT FILTERING *****\\
     
//***** BEGIN CREATE MAP AND ADDED CONTROLS *****//     
        var map = L.map('map').setView([38.274923,-122.056663], 10);
	    L.control.locate().addTo(map);
        L.control.scale({position: 'bottomright'}).addTo(map);
        var CartoDB_Positron = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
	        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB; </a><a href="http:www.lohneswright.com">Map & Site by Lohnes+Wright</a>',
	        subdomains: 'abcd',
	        maxZoom: 19
        }).addTo(map);
     
         var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

// method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = '<h4>Quick Facts</h4>' + (props ? '<b>Name: ' + props.Name + '</b><br />Difficulty: ' + props.Difficulty + '</b><br />Distance: ' + props.Distance + '</b><br />Type: ' + props.Type + '</b><br />Approx. Time: ' + props.Time + '<br>' : 'Hover over a ride to see ride extent and details'); 
    };

    info.addTo(map);
     
var sidebar = L.control.sidebar('sidebar', {
    position: 'left',
    autoPan: true,
    closeButton: true
});

map.addControl(sidebar);
     
setTimeout(function () {
    sidebar.show();
}, 500);
 
   L.easyButton('fa-info', function(btn, map){
       sidebar.toggle();
   }).addTo(map);

//***** END CREATE MAP AND ADDED CONTROLS *****\\
  
//***** BEGIN CREATE MAP LAYERS AND FUNCTIONALITY *****//      
     var rideLayers = L.layerGroup().addTo(map);
     var ridePOILayers = L.layerGroup().addTo(map);
     var difficultBoundsArray = [];
     var mediumBoundsArray = [];
     var easyBoundsArray = [];
               var difficultLayer = L.geoJson(testjson, {
                   //filter to only get Difficult rides
                    filter: function(feature, layer) {
                        return feature.properties.Difficulty === 'Difficult';
                    },
                    onEachFeature: function(feature, layer) {
                        var thisLayer = layer;
                        //filter to get only main trail, not alternate. So only 1 gets listed in the toc
                        if (feature.properties.Section === "Main") {      
                            layer.bindPopup(feature.properties.Name);
                            layer.on({
                                mouseover: highlightFeature,
                                mouseout: unhighlightDifficultFeature
                            });
                            difficultBoundsArray.push([feature.properties.Number, layer.getBounds()]);
                            difficultBoundsArray = difficultBoundsArray.sort(function(a,b) {
                                return a[0] - b[0];
                            });
                            var difficultDiv = $('#difficult-append').append('<div class="col-xs-12 toc-ride-button difficult-ride" id="' + feature.properties.Number + '">' + feature.properties.Name + '</div>');
                            var thisNumber = feature.properties.Number;
                            $("#" + thisNumber).on('click', function(event){
                                //event.preventDefault(); // Prevent the link from scrolling the page.
                                var thisNumberIndex = difficultBoundsArray.filter(function(v,i) {
                                    return v[0] === thisNumber;
                                });
                                map.fitBounds(thisNumberIndex[0][1], {paddingTopLeft: [250,0]});
                                layer.setStyle(invisibleStyle); 
                                var clickedLayer = map._layers[L.Util.stamp(layer)];
                                addDetailsToTOC(clickedLayer);
                                if (easyLayer) { easyLayer.setStyle(invisibleStyle)}; 
                                if (mediumLayer) { mediumLayer.setStyle(invisibleStyle)};
                                difficultLayer.setStyle(invisibleStyle);
                                $('.difficulty-selector-button').removeClass("btn-primary");
                                addSelectedTrail(clickedLayer);  // obtain the layer directly

                            });
                        }
                    },
                    style: function(feature) { 
                        switch (feature.properties.Section) {
                            case 'Main': return difficultRideStyle;
                            default:   return difficultRideAlternateStyle;
                        }
                    }
                }).addTo(rideLayers);

            // MEDIUM
            var mediumLayer = L.geoJson(testjson, {
                    filter: function(feature, layer) {
                        return feature.properties.Difficulty === 'Medium';
                    },
                    onEachFeature: function(feature, layer) {
                        var thisLayer = layer;
                        //make sure only main trail, not alternate gets listed in the toc
                        if (feature.properties.Section === "Main") {
                            layer.bindPopup(feature.properties.Name);
                            layer.on({
                                mouseover: highlightFeature,
                                mouseout: unhighlightMediumFeature
                            });
                            mediumBoundsArray.push([feature.properties.Number, layer.getBounds()]);
                            mediumBoundsArray = mediumBoundsArray.sort(function(a,b) {
                                return a[0] - b[0];
                            });
                            var difficultDiv = $('#medium-append').append('<div class="col-xs-12 toc-ride-button medium-ride" id="' + feature.properties.Number + '">' + feature.properties.Name + '</div>');
                            var thisNumber = feature.properties.Number;
                            $("#" + thisNumber).on('click', function(event){
                                var thisNumberIndex = mediumBoundsArray.filter(function(v,i) {
                                    return v[0] === thisNumber;
                                });
                                map.fitBounds(thisNumberIndex[0][1], {paddingTopLeft: [250,0]});
                                layer.setStyle(invisibleStyle); 
                                //gets the geojson feature of the clicked layer, not sure how this works???
                                var clickedLayer = map._layers[L.Util.stamp(layer)];
                                addDetailsToTOC(clickedLayer);
                                if (easyLayer) {easyLayer.setStyle(invisibleStyle)}; 
                                if (difficultLayer) {difficultLayer.setStyle(invisibleStyle)};
                                $('.difficulty-selector-button').removeClass("active");
                                addSelectedTrail(clickedLayer);  // obtain the layer directly
                            });
                        }
                    },
                    style: function(feature) { 
                        switch (feature.properties.Section) {
                            case 'Main': return mediumRideStyle;
                            default:   return mediumRideAlternateStyle;
                        }
                    }
                }).addTo(rideLayers);
     
     // Add Easy Rides
            var easyLayer = L.geoJson(testjson, {
                    filter: function(feature, layer) {
                        return feature.properties.Difficulty === 'Easy';
                    },
                    onEachFeature: function(feature, layer) {
                        var thisLayer = layer;
                        //make sure only main trail, not alternate gets listed in the toc
                        if (feature.properties.Section === "Main") {
                            layer.bindPopup(feature.properties.Name);
                            layer.on({
                                mouseover: highlightFeature,
                                mouseout: unhighlightEasyFeature
                            });
                            easyBoundsArray.push([feature.properties.Number, layer.getBounds()]);
                            easyBoundsArray = easyBoundsArray.sort(function(a,b) {
                                return a[0] - b[0];
                            });    
                            var easyDiv = $('#easy-append').append('<div class="col-xs-12 toc-ride-button easy-ride" id="' + feature.properties.Number + '">' + feature.properties.Name + '</div>');
                            var thisNumber = feature.properties.Number;
                            $("#" + thisNumber).on('click', function(event){
                                var thisNumberIndex = easyBoundsArray.filter(function(v,i) {
                                    return v[0] === thisNumber;
                                });
                                map.fitBounds(thisNumberIndex[0][1], {paddingTopLeft: [250,0]});
                                //gets the geojson feature of the clicked layer, not sure how this works???
                                var clickedLayer = map._layers[L.Util.stamp(layer)];
                                //Add stats and description of TOC clicked trail
                                addDetailsToTOC(clickedLayer);   
                                if (mediumLayer) { mediumLayer.setStyle(invisibleStyle)};
                                if (difficultLayer) { difficultLayer.setStyle(invisibleStyle)};
                                $('.difficulty-selector-button').removeClass("active");
                                addSelectedTrail(clickedLayer);  // obtain the layer directly
                            });
                       }
                    },
                    style: function(feature) { 
                        switch (feature.properties.Section) {
                            case 'Main': return easyRideStyle;
                            default:   return easyRideAlternateStyle;
                        }
                    }
                }).addTo(rideLayers);
//***** END CREATE MAP LAYERS AND FUNCTIONALITY *****\\

//***** BEGIN ANONYMOUS FUNCTION TO TAKE SIDEBAR CLICKED GEOJSON FEATURE AND STYLE BASED ON DIFFICULTY LEVEL *****//
            var selectedLayer = L.geoJson(false, {
                onEachFeature: function(feature, layer) {
                    var thisLayer = layer;
                    layer.bindPopup(feature.properties.Name);
                },
                style: function(feature) {
                    switch (feature.properties.Difficulty) {
                        case 'Difficult': return difficultRideStyle;
                        case 'Medium':   return mediumRideStyle;
                        case 'Easy':   return easyRideStyle;
                    }
                }

            }).addTo(rideLayers);
//***** END ANONYMOUS FUNCTION TO TAKE SIDEBAR CLICKED GEOJSON FEATURE AND STYLE BASED ON DIFFICULTY LEVEL *****\\
     
     var layerList = ["Easy", "Medium", "Difficult"];
 
//***** FUNCTION CALLED WHEN DIFFICULTY FILTER BUTTON IS CLICKED, DETERMINE BUTTON AND STYLE EACH DIFFICULTY LAYER ACCORDINGLY, ZOOM TO FILTERED FEATURES *****//
     function showWhatTrails (clickedValue) {
        switch (clickedValue) {
            case 'easy': 
                easyLayer.setStyle(easyRideStyle);
                mediumLayer.setStyle(invisibleStyle);
                difficultLayer.setStyle(invisibleStyle);
                map.fitBounds(easyLayer.getBounds(), {paddingTopLeft: [250,0]});
                break;
            case 'medium':   
                mediumLayer.setStyle(mediumRideStyle);
                easyLayer.setStyle(invisibleStyle);
                difficultLayer.setStyle(invisibleStyle);
                map.fitBounds(mediumLayer.getBounds(), {paddingTopLeft: [250,0]});
                break;
            case 'difficult':   
                difficultLayer.setStyle(difficultRideStyle);
                easyLayer.setStyle(invisibleStyle);
                mediumLayer.setStyle(invisibleStyle);
                map.fitBounds(difficultLayer.getBounds(), {paddingTopLeft: [250,0]});
                break;
            case 'all':
                difficultLayer.setStyle(difficultRideStyle);
                easyLayer.setStyle(easyRideStyle);
                mediumLayer.setStyle(mediumRideStyle);
                map.setView([38.274923,-122.056663], 10);
                break;     
        }
         
        //if a table of contents trail was last clicked, remove all trail details and remove the specific trail from the map
        $("#toc-ride-details").remove();
        $("#legend").remove();
        $("#toc-ride-details-id").remove();
        $(".elevation-profile").remove();
        selectedLayer.clearLayers();
     }
//***** END FUNCTION CALLED WHEN DIFFICULTY FILTER BUTTON IS CLICKED, DETERMINE BUTTON AND STYLE EACH DIFFICULTY LAYER ACCORDINGLY, ZOOM TO FILTERED FEATURES *****\\
   
//***** BEING FUNCTION TO REMOVE DIFFICULTY FILTERS WHEN CLICKING ON INDIVIDUAL TRAIL *****//
     //function to take sidebar click and pass to selectedLayer function and add individual layer
     //also removes existing (if any) features from selectedLayer, basically remove previous selected trail
     //might be superflous, could call selectedLayer from on click of sidebar???
     function addSelectedTrail (clicked) {
         // remove classes that color and filter the buttons when clicking on a specific table of contents trail, add btn-default so they all look the same, unselected
         if ($(".btn-group").children().hasClass("btn-primary")) {$(".btn-group").children().removeClass("btn-primary")};
         if ($(".btn-group").children().hasClass("btn-success")) {$(".btn-group").children().removeClass("btn-success")};
         if ($(".btn-group").children().hasClass("btn-danger")) {$(".btn-group").children().removeClass("btn-danger")};
         if ($(".btn-group").children().hasClass("btn-warning")) {$(".btn-group").children().removeClass("btn-warning")};
         $(".btn-group").children().addClass("btn-default");
         if (map.hasLayer(selectedLayer)) { selectedLayer.clearLayers();}
         console.log(clicked.feature);
         selectedLayer.addData(clicked.feature);
     }
//***** END FUNCTION TO REMOVE DIFFICULTY FILTERS WHEN CLICKING ON INDIVIDUAL TRAIL *****\\
     
//***** BEGIN FUNCTION TO ADD DETAILS IN TABLE OF CONTENTS WHEN CLICKING ON INDIVIDUAL TRAIL NAME *****//
     function addDetailsToTOC (clicked) {
         ridePOILayers.clearLayers();
         
         //if legend and details exist in toc, remove them so new ones can be added
          if(document.getElementById('toc-ride-details')){
            $("#toc-ride-details").remove();
            $("#legend").remove();
            $("#toc-ride-details-id").remove();
            $(".elevation-profile").remove();
          }

          //add Quick Facts to clicked trail in toc
          var thisDetailsDiv = $('#' + clicked.feature.properties.Number).after('<div class="col-xs-12 toc-ride-details difficult-ride" id="toc-ride-details">' + '<p class="heading-legend">Quick Facts</p>' + '<div class="col-xs-4 text-left">' + "Difficulty" + '</div><div class="col-xs-8 text-left"><strong>' + clicked.feature.properties.Difficulty + '</strong></div>' + '<br><div class="col-xs-4 text-left">' + "Distance" + '</div><div class="col-xs-8 text-left"><strong>' + clicked.feature.properties.Distance + '</strong></div><div class="col-xs-4 text-left">' + "Type" + '</div><div class="col-xs-8 text-left"><strong>' + clicked.feature.properties.Type + '</strong></div><div class="col-xs-4 text-left">' + "Approx. Time" + '</div><div class="col-xs-8 text-left"><strong>' + clicked.feature.properties.Time + '</strong></div></div>' + '<div class="col-xs-12 toc-ride-details" id="legend">' + '<p class="heading-legend">Legend</p></div>');
         
         
         //make a legend array of icons that may have multiples on a ride. When adding symbols to legend, will check this list to see if one already exists in legend
         var legendSymbolArray = [["Parking", parkingIcon], ["Suggested Start", easyStartIcon], ["Suggested Start", mediumStartIcon]];
         var symbolArray = [];
         
         //EDIT WHEN ADDING NEW RIDES, if adding one new ride, add 'ride11_poi' after ride10_poi, don't forger the comma 
         //make array of variable names for each rides poi variable
         var ridePOIArray = [ride1_poi, ride2_poi, ride3_poi, ride4_poi, ride5_poi, ride6_poi, ride7_poi, ride8_poi, ride9_poi, ride10_poi];
         //assign the current ride poi variable name to 'thisPOIGroup' and use that to add POIs to the map
         var thisPOIGroup = ridePOIArray[clicked.feature.properties.Number - 1];
         // add pois for this clicked ride in table of contents
         var POILayer = L.geoJson(thisPOIGroup, {
            pointToLayer: function(feature, latlng) {
                if (!symbolArray.includes(feature.properties.type)) { symbolArray.push(feature.properties.type)};
                var thisDifficulty = feature.properties.difficulty;
                switch (feature.properties.type) {
                    case 'Parking': 
                        //only want to add this icon to the legend once
                        // if *thisnumber*-parking-legend id doesn't exist, then add this legend icon
                        if ($('#' + feature.properties.number + '-parking-legend').length === 0) {
                            $('#legend').append('<div class="media" id="' + feature.properties.number + '-parking-legend"><div class="media-left"><img class="media-object legend-swatch" src="img/icons/icon-parking.svg" alt="Parking" style="width:25px;height:25px;" /></div><div class="media-body legend-description">Parking</div></div>');
                        }   
                        //add this icon to the map at this location, could be multiple
                        return  L.marker(latlng, {icon: parkingIcon });
                    case 'Suggested Start':
                        //need to concatenate difficulty since the start icon is colored based on difficulty
                        $('#legend').append('<div class="media" id="' + feature.properties.number + '-start-legend"><div class="media-left"><img class="media-object legend-swatch" src="img/icons/icon-start-' + feature.properties.difficulty + '.svg" alt="" style="width:25px;height:25px;" /></div><div class="media-body legend-description">Suggested Start</div></div>');
                        //need to use eval so that that the concat is treated as an object (L.Icon object) instead of a string ???
                        return L.marker(latlng, {icon: eval(thisDifficulty.concat("StartIcon"))});
                    case 'Arrow':
                        return L.marker(latlng, {icon: eval(thisDifficulty.concat("ArrowIcon")),  rotationAngle: feature.properties.rotation});
                    case 'Restroom':
                        //only want to add this icon to the legend once
                        // if *thisnumber*-restroom-legend id doesn't exist, then add this legend icon
                        if ($('#' + feature.properties.number + '-restroom-legend').length === 0) {
                            $('#legend').append('<div class="media" id="' + feature.properties.number + '-restroom-legend"><div class="media-left"><img class="media-object legend-swatch" src="img/icons/icon-restroom.svg" alt="Restroom" style="width:25px;height:25px;" /></div><div class="media-body legend-description">Restrooms</div></div>');
                        } 
                        return L.marker(latlng, {icon: restroomIcon});
                    case 'Picnic Area':
                        //only want to add this icon to the legend once
                        // if *thisnumber*-picnic-legend id doesn't exist, then add this legend icon
                        if ($('#' + feature.properties.number + '-picnic-legend').length === 0) {
                            $('#legend').append('<div class="media" id="' + feature.properties.number + '-picnic-legend"><div class="media-left"><img class="media-object legend-swatch" src="img/icons/icon-picnic.svg" alt="Picnic Area" style="width:25px;height:25px;" /></div><div class="media-body legend-description">Picnic Area</div></div>');
                        } 
                        return L.marker(latlng, {icon: picnicIcon});
                    case 'Turnaround':
                       //need to concatenate difficulty since the turnaround icon is colored based on difficulty
                        $('#legend').append('<div class="media" id="' + feature.properties.number + '-turnaround-legend"><div class="media-left"><img class="media-object legend-swatch" src="img/icons/icon-turnaround-' + feature.properties.difficulty + '.svg" alt="" style="width:25px;height:25px;" /></div><div class="media-body legend-description">Turnaround Point</div></div>');
                        return L.marker(latlng, {icon: eval(thisDifficulty.concat("TurnaroundIcon"))});
                }
            }
        }).addTo(ridePOILayers);
         console.log(clicked.feature.properties);
          var thisDescriptionDiv = $('#legend').after('<div class="col-xs-12 toc-ride-details difficult-ride" id="toc-ride-details-id">' + '<p class="heading-legend text-left">Description</p><p class="col-xs-12 text-left">' + clicked.feature.properties.Description + '</p></div>');
      
        var thisElevation = $('#toc-ride-details-id').after('<div class="col-xs-12 elevation-profile">' + '<img class="img-responsive" src="img/map' + clicked.feature.properties.Number + '_elevationprofile.png"/></div>')
         symbolArray.forEach(function(element) {

         });                                            
     }
//***** END FUNCTION TO ADD DETAILS IN TABLE OF CONTENTS WHEN CLICKING ON INDIVIDUAL TRAIL NAME *****\\ 
      
//***** BEGIN ADD COUNTY DATA AND LABEL *****//
       var solanoCountyLayer = new L.GeoJSON.AJAX(["https://solano-doitgis.opendata.arcgis.com/datasets/b9a4a2a0675e4c8183fa83c968b0b7b0_0.geojson"], {
            style: countyStyle
        });       
        solanoCountyLayer.addTo(map);
     
        var solanoCountyLabel = L.marker([38.274923,-121.9], {
            icon: L.divIcon({
                className: 'label',
                html: "SOLANO COUNTY",
                iconSize: [100, 40]
            })
        }).addTo(map);
//***** END ADD COUNTY DATA AND LABEL *****\\
        
//***** BEGIN HIGHLIGHT TRAIL FUNCTION SET *****//
     var selectedText;
    //highlight trail on hover 
    function highlightFeature(e) {
        var layer = e.target;
        //find out which difficulty button is select
        selectedText = $(".btn-primary").text();
        //only assign highlight hover if difficulty filter = difficulty of hovered trail OR hover if difficulty filter is set to All
        if (layer.feature.properties.Difficulty === selectedText || selectedText === "All") {
            info.update(layer.feature.properties);
            layer.setStyle({
                weight: 7,
                color: '#ff00ff',
                opacity: 1,
            });
        }
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }
     
    //unhighlight features on mouseout, refactor to pass in difficulty
    function unhighlightEasyFeature(e) {
       info.update();
       if (e.target.feature.properties.Difficulty === selectedText || selectedText === "All") {
        easyLayer.resetStyle(e.target);
       }
    }
     
    function unhighlightMediumFeature(e) {
      info.update();
      if (e.target.feature.properties.Difficulty === selectedText || selectedText === "All") {
        mediumLayer.resetStyle(e.target);
      }
    }
     
    function unhighlightDifficultFeature(e) {
       info.update();
       if (e.target.feature.properties.Difficulty === selectedText || selectedText === "All") {
        difficultLayer.resetStyle(e.target);
       }
    }
//***** END HIGHLIGHT TRAIL FUNCTION SET *****\\
 
//set county style when zoomed in to invisible, set to style when zoomed out     
map.on('zoomend', function() {
    if (map.getZoom() < 12) {
        solanoCountyLayer.setStyle(countyStyle);
    } else {
        solanoCountyLayer.setStyle(invisibleCountyStyle);
    }
});

function panToBounds(){
    map.panInsideBounds(bounds); 
};

//closing onload
};

(function($,sr){

  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
      var timeout;

      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null;
          };

          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);

          timeout = setTimeout(delayed, threshold || 100);
      };
  }
  // smartresize 
  jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery,'smartresize');







