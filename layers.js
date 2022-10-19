var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
});
var osm_mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
var map = L.map('mapCanvas', {
    center: [40.85, -8.41],
    zoom: 7,
    maxZoom: 14,
    layers: [osm_mapnik]
});
var baseMaps = {
    "CartoDB": CartoDB_Positron,
    "OpenStreetMap": osm_mapnik,
    "Satélite": Esri_WorldImagery
};
L.control.layers(baseMaps, null, {
    collapsed: false
}).addTo(map);
var sidebar = L.control.sidebar('sidebar', {
    closeButton: true,
    position: 'left'
});
map.addControl(sidebar);
/*
var lc = L.control.locate({
    strings: {
        title: "A minha posição!"
    },
    locateOptions: {
               maxZoom: 15
    }
});
*/
//lc.addTo(map);
var counter = 0;
//var conc = [];
//var lugar = [];
var markers;
var realce;
//var foto;
//var lugs = L.featureGroup();
//var lugsel = false;

//Lê o ficheiro simples
//L.geoJSON(toponimos).addTo(map);


var geojson = L.geoJSON(toponimos, {
    //vai ler os atributos para a tooltip
    onEachFeature: atributos,
    // altera o estilo das marcas
    //1-Circulo: permite a atribuição do raio em metros e, assim, o raio ajusta-se ao nível do zoom (problema: pode ficar demasiado grande quando se amplia)
    /*
    pointToLayer: function(feature, latlng) {
        return L.circle(latlng, 1000, {
            fillColor: '#708598',
            color: '#537898',
            //radius: 30,
            weight: 1,
            fillOpacity: 0.6
        })
    }*/    
    //2- Com CircleMarker; o raio é dado em pixeis e permanece fixo, não se ajusta ao zoom
    pointToLayer: function(feature, latlng) {
        return L.circleMarker (latlng, {
            fillColor: '#7FFF00',
            color: '#537898',
            radius: 4,
            weight: 1,
            fillOpacity: 0.6
        })
    }    

}).addTo(map);



markers = L.markerClusterGroup({
    showCoverageOnHover: false
});
markers.addLayer(geojson);
map.addLayer(markers);
map.fitBounds(markers.getBounds());

document.getElementById('contador').innerHTML = "Nº de topónimos: " + counter;
//var selectbox = document.getElementById('selbox');

/*
var uniqueNames = [];
$.each(conc, function (i, el) {
    if ($.inArray(el, uniqueNames) === -1) {
        uniqueNames.push(el);
    }
});
uniqueNames.sort(function(a, b) {
    return a.localeCompare(b);
});
var i;
for (i = 0; i < uniqueNames.length; i++) {
    var opt = document.createElement('option');
    opt.value = uniqueNames[i];
    opt.innerHTML = uniqueNames[i];
    selectbox.appendChild(opt);
}
*/
L.control.scale({
  position: 'bottomright',
  imperial: false
}).addTo(map);
map.attributionControl.setPrefix(
    '&copy; <a href="https://sites.google.com/view/alminhas">Projecto Alminhas</a>' + ' &copy; Mapa Interactivo: <a href="mailto:ezcorreia@gmail.com">Ezequiel Correia</a> | <a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
);
sidebar.on('hidden', function () {
    //map.removeLayer(realce);
    realce = null;
});


function atributos(feature, layer) {
    counter++;
    //Os três topónimos
    layer.bindTooltip(feature.properties.Top_Orig + "<br>" + feature.properties.Top_SD + "<br>" + feature.properties.Top_Atual);
    //Topónimo original e Atual
    layer.bindTooltip(feature.properties.Top_Orig + "<br>" + feature.properties.Top_Atual);
    layer.on({
        click:
            function populate() {
                
                var obs = feature.properties["Obs_Vdigit"];
                alert(obs);
                if (obs == null) {
                    obs = "--";
                } else {
                    obs = feature.properties["Obs_Vdigit"]
                }
                //foto = feature.properties["gx_media_links"];
                
                sidebar.setContent("<div>Nº de Ordem: " + feature.properties.NO_1 + "<br>Fólio: " + feature.properties.Folio + "<br><b>Topónimos:</b> <br>&nbsp;&nbsp;&nbsp;Códice: " + feature.properties.Top_Orig + "<br>&nbsp;&nbsp;&nbsp;S. Daveau: " + feature.properties.Top_SD + "<br>&nbsp;&nbsp;&nbsp;Atual: " + feature.properties.Top_Atual + "<br>Distrito: " + feature.properties.Distrito + "<br>Concelho: " + feature.properties.Concelho + "<br>Freguesia: " + feature.properties.Freguesia + "<br>Nota: " + obs); //feature.properties.Obs_Vdigit);
  /*              
                if (realce == null) {
                    //realce = L.circleMarker([feature.properties.LAT, feature.properties.LONG], {
                    realce = L.circleMarker(latlng, {
                        "radius": 15,
                        "fillColor": "#9c5f1f",
                        "color": "red",
                        "weight": 1,
                        "opacity": 1
                    }).addTo(map);
                } else {
                    //realce.setLatLng([feature.properties.LAT, feature.properties.LONG]);
                    realce.setLatLng(latlng);
                }
*/
                sidebar.show();
                document.getElementById('toponimo').innerHTML = "<div>Nº de Ordem: " + feature.properties.NO_1 + "<br>Fólio: " + feature.properties.Folio + "<br><br><b>Topónimos:</b> <br>&nbsp;&nbsp;&nbsp;Códice: " + feature.properties.Top_Orig + "<br>&nbsp;&nbsp;&nbsp;S. Daveau: " + feature.properties.Top_SD + "<br>&nbsp;&nbsp;&nbsp;Atual: " + feature.properties.Top_Atual + "<br><br>Distrito: " + feature.properties.Distrito + "<br>Concelho: " + feature.properties.Concelho + "<br>Freguesia: " + feature.properties.Freguesia + "<br><br>Nota: " + obs;
                //removeLugLayer();
            }
    });
    //conc.push(feature.properties.Concelho);
    //lugar.push(feature.properties.Freguesia);
}
/*
function removeLugLayer(){
        if (map.hasLayer(lugs)) {
            map.removeLayer(lugs);
            lugsel=false;
        }
}

function selConc() {
    if (map.hasLayer(lugs)) {
        removeLugLayer();
    }
    map.removeLayer(markers);
    if (realce != null) {
        map.removeLayer(realce);
        realce = null;
    }
    if (sidebar.isVisible() == true) {
        sidebar.hide();
    }
    counter = 0;
    var miConc = document.getElementById('selbox').value;
    var geojson = L.geoJSON(toponimos, {
        filter: function (feature, layer) {
            if (miConc != "Todos") {
                return (feature.properties.Concelho == miConc);
            } else {
                return true;
            }
        },
        onEachFeature: atributos
    });
    markers = L.markerClusterGroup({
        showCoverageOnHover: false
    });
    markers.addLayer(geojson);
    map.addLayer(markers);
    if (lugsel==false){
        map.fitBounds(markers.getBounds());
        }
    document.getElementById('contador').innerHTML = "Nº de toponimos: " + counter;
}

$( function() {
    var listaLugares = [];
    $.each(lugar, function (i, el) {
        if ($.inArray(el, listaLugares) === -1) {
            listaLugares.push(el);
        } 
    });
    listaLugares.sort(function(a, b) {
        return a.localeCompare(b);
    });    
    $( "#lugares" ).autocomplete({
        minLength: 2,
        delay: 500,
        source: listaLugares
    });
});

$( "#lugares" ).on( "autocompleteselect", function( event, ui ) {
    lugarSelect(ui.item.label);
    ui.item.value='';
});

function lugarSelect(a){
    lugsel=true;
    if (map.hasLayer(lugs)) {
        removeLugLayer();
    }
    if (realce != null) {
        map.removeLayer(realce);
        realce = null;
    }
    if (document.getElementById('selbox').value != "Todos") {
        document.getElementById('selbox').value = "Todos";
        selConc();
    }
    if (sidebar.isVisible() == true) {
        sidebar.hide();
    }
    lugs = L.geoJSON(toponimos, {
        filter: function (feature, layer) {
            return (feature.properties.Concelho == a);
        },
        pointToLayer: function(feature, latlng){
            return new L.circleMarker(latlng, {
                "radius": 15,
                "fillColor": "#9c5f1f",
                "color": "red",
                "weight": 1,
                "opacity": 1
            });
        }
    });
    map.addLayer(lugs);
    map.fitBounds(lugs.getBounds());
}*/