$(document).ready(function(){
  jQuery(function($) {
      // Asynchronously Load the map API
      var script = document.createElement('script');
      script.src = "https://maps.googleapis.com/maps/api/js?callback=initialize";
      document.body.appendChild(script);

  });
});

  function initialize() {
    var map;
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        mapTypeId: 'roadmap'
    };
    map = new google.maps.Map(document.getElementById('map_canvas',mapOptions));
    map.setTilt(45);
    var geocoder = new google.maps.Geocoder();
    var places ={};
    var databaseFile = "database1.csv"

    var listener = google.maps.event.addListener(map, "idle", function() {
        if (map.getZoom() > 16) map.setZoom(16);
            google.maps.event.removeListener(listener);
    });
    
    geocodeAddress(geocoder, map,bounds)
  }

  function loadDB(filename, callback){
    $.getJSON(filename, function(json) {
      places = json;
      callback(places);
      //console.log("JSON db here: ",json); // this will show the info it in firebug console 
    });
    
  }
   
  function geocodeAddress(geocoder, resultsMap,bounds) {
    var markers = [];
    var wait = false;
    var infoWindowContent = [];

    loadDB("databaseJSON.json",function(places){
      console.log("callback fcn:", places);
      d3.csv("state_city_bk.csv", function(data) {
        console.log("Raw data: ");
        console.log(data[0].City + ", "+ data[0].State);

        for(i=0;i<data.length;i++){
          console.log("Searching location: ", data[i].City, data[i].State);
          markers.push([data[i].City, data[i].State]);
          infoWindowContent.push(['<div class="info_content">' + '<h3>'+data[i].City+'</h3>' + '<p>'+data[i].State+'</p>' + '</div>']);
          var map_obj = getObjects(places,"city", data[i].City);
          try{
            console.log(data[i].city, map_obj);
            if(map_obj.length>0){
              console.log("found city in DB", map_obj[0].city, map_obj[0].lat, map_obj[0].lng);
              markers.push([map_obj[0].city,map_obj[0].lat, map_obj[0].lng]);
              var position = new google.maps.LatLng(map_obj[0].lat, map_obj[0].lng);
              bounds.extend(position);
              marker = new google.maps.Marker({
                  position: position,
                  map: resultsMap,
                  title: markers[i][0]
              });
            }else{
              console.log("Geocoding location: ", data[i].City, data[i].State);
              geocoder.geocode({'address': data[i].City+", "+data[i].State}, function(results, status) {
                if (status ==google.maps.GeocoderStatus.OK) {
                  resultsMap.setCenter(results[0].geometry.location);
                  console.log(status);
                  var marker = new google.maps.Marker({
                    map: resultsMap,
                    position: results[0].geometry.location,
                    title: markers[i][0]
                  });

                }
                else if(status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT){
                  console.log("overquery limit");
                  wait = true;
                  setTimeout("wait = true", 2000);
                }
                else {
                  console.log("BAD CITY " + data[i].City);
                  alert('Geocode was not successful for the following reason: ' + status);
                }
              });
            }
          }
          catch(err){
            console.log("error at row #: ", i);
          }
            


          // Allow each marker to have an info window
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infoWindow.setContent(infoWindowContent[i][0]);
                infoWindow.open(resultsMap, marker);
            }
        })(marker, i));

          resultsMap.fitBounds(bounds); 
        }//end of for

      }); //end of d3

    });// end of loadDB

    var listener = google.maps.event.addListener(resultsMap, "idle", function() {
        if (resultsMap.getZoom() > 16) resultsMap.setZoom(16);
            google.maps.event.removeListener(listener);
    });
    var infoWindow = new google.maps.InfoWindow(), marker, i;

  }// end of geocodeAddress


//var json = '{"glossary":{"title":"example glossary","GlossDiv":{"title":"S","GlossList":{"GlossEntry":{"ID":"SGML","SortAs":"SGML","GlossTerm":"Standard Generalized Markup Language","Acronym":"SGML","Abbrev":"ISO 8879:1986","GlossDef":{"para":"A meta-markup language, used to create markup languages such as DocBook.","ID":"44","str":"SGML","GlossSeeAlso":["GML","XML"]},"GlossSee":"markup"}}}}}';

//var js = JSON.parse(json);

//example of grabbing objects that match some key and value in JSON
 
 // initialize(geocodeAddress());