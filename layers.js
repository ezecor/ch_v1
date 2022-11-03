/// --------------
//1. Mapas de baseMaps
//2. Configuração do alojamento do Mapa
//3. Elementos do mapa: controles
//4. Variáveis globais
//5. Carregamento do ficheiro geojson
//6. Preenche as dropdown lists com os nomes dos distritos
//7. Funções:
//7.1 atributos() : lê o ficheiro geojson e
//7.2 atributos_filter() : lê o ficheiro com o filtro aplicado; para poder manter sempre todos os pontos, cria-se uma nova função atributos
//7.3 selDist() : seleccionao um distritos
//7.4 selConc() : selecciona uma concelho
//7.5 selLetra() : selecciona todos os topónimos começados por uma letra do alfabeto
//7.6 linhaSel() : "selecciona" o topónimo da lista para poder deslocar o mapa para esse ponto (na verdade não deve ser uma selcção; deve ser um pan
//7.7 sortTable() : apresenta a tabela ordenada alfabeticamente
//7.8 removeLugLayer() : remove o layer de lugares seleccionados

// -------------
var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
});
var osm_mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
// ------------
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
/*
var sidebar = L.control.sidebar('sidebar', {
  closeButton: true,
  position: 'left'
});
*/

//map.addControl(sidebar);

//----- VARIÁVEIS GLOBAIS
var counter = 0; // nº de elementos seleccionados
var dist = []; // array com o nome dos distritos
var conc = []; // array com o nome dos concelhos
//var freg = [];
var lugar = L.featureGroup();
//var markers;
var realce = null; // para construir um layer coma seleçã
//var foto;
var lugs = L.featureGroup(); // layer group para conter os pontos seleccionados
var lugsel = false; // boleano para controlar a existência de lugares seleccionados

// variáveis para conter o nome do distrito ou do concelho que for seleccionado
var miDist = document.getElementById('selbx_dist').value;
var miConc = document.getElementById('selbx_conc').value;
//-------------- carregamento do ficheiro geojson
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
      fillColor: 'A9A9A', //'#7FFF00',
      color: '00000', //'#537898',
      radius: 3,
      weight: 1,
      fillOpacity: 0.6
    })
  }
}).addTo(map);

//Ajusta o mapa ao extent
map.fitBounds(geojson.getBounds());
//Atualiza o nº de topónimos
document.getElementById('contador').innerHTML = "Nº de topónimos: " + counter;

//------------------- Drop-down lists com os nomes dos distritos e concelhos
// Distritos
var lista_dist = document.getElementById('selbx_dist');
var uniqueNames = []; //array com os nomes dos distritos
$.each(dist, function (i, el) {
  if ($.inArray(el, uniqueNames) === -1) {
    uniqueNames.push(el);
  }
});
//Ordena os nomes por ordem alfabética
uniqueNames.sort(function(a, b) {
  return a.localeCompare(b);
});
//adiciona os nomes à dropdown list
var i;
for (i = 0; i < uniqueNames.length; i++) {
  var opt = document.createElement('option');
  opt.value = uniqueNames[i];
  opt.innerHTML = uniqueNames[i];
  lista_dist.appendChild(opt);
}
//Concelhos
var lista_conc = document.getElementById('selbx_conc');
var uniqueNames = []; //array com os nomes dos concelhos
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
  lista_conc.appendChild(opt);
}
// ---------------------------------------------------------------------------
// Escala
L.control.scale({
  position: 'bottomright',
  imperial: false
}).addTo(map);
//Créditos
map.attributionControl.setPrefix(
  '&copy; <a href="https://sites.google.com/view/alminhas">Projecto Alminhas</a>' + ' &copy; Mapa Interactivo: <a href="mailto:ezcorreia@gmail.com">Ezequiel Correia</a> | <a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
);
//Side bar
/*
sidebar.on('hidden', function () {
    //map.removeLayer(realce);
  realce = null;
});
*/
// -------------- ler e acarregar os atibutos
function atributos(feature, layer) {
  counter++;
  //Topónimo original e Atual
  layer.bindTooltip(feature.properties.Top_Orig + "<br>" + feature.properties.Top_Atual);
  layer.on({
    click:
      function populate() {
        var obs = feature.properties["Obs_Vdigit"];
        if (obs == null) {
            obs = "--";
        } else {
            obs = feature.properties["Obs_Vdigit"]
        }

/*
        sidebar.setContent("<div>Nº de Ordem: " + feature.properties.NO_1 + "<br>Fólio: " + feature.properties.Folio + "<br><b>Topónimos:</b> <br>&nbsp;&nbsp;&nbsp;Códice: " + feature.properties.Top_Orig + "<br>&nbsp;&nbsp;&nbsp;S. Daveau: " + feature.properties.Top_SD + "<br>&nbsp;&nbsp;&nbsp;Atual: " + feature.properties.Top_Atual + "<br>Distrito: " + feature.properties.Distrito + "<br>Concelho: " + feature.properties.Concelho + "<br>Freguesia: " + feature.properties.Freguesia + "<br>Nota: " + obs); //feature.properties.Obs_Vdigit);
*/
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
//        sidebar.show();
        document.getElementById('toponimo').innerHTML = "<div>Nº de Ordem: " + feature.properties.NO_1 + "<br>Fólio: " + feature.properties.Folio + "<br><br><b>Topónimos:</b> <br>&nbsp;&nbsp;&nbsp;Códice: " + feature.properties.Top_Orig + "<br>&nbsp;&nbsp;&nbsp;S. Daveau: " + feature.properties.Top_SD + "<br>&nbsp;&nbsp;&nbsp;Atual: " + feature.properties.Top_Atual + "<br><br>Distrito: " + feature.properties.Distrito + "<br>Concelho: " + feature.properties.Concelho + "<br>Freguesia: " + feature.properties.Freguesia + "<br><br>Nota: " + obs;
        //removeLugLayer();
      }
  });
  dist.push(feature.properties.Distrito);
  conc.push(feature.properties.Concelho);
  //freg.push(feature.properties.Freguesia);
  //lugar.push(feature.properties.Freguesia);
}

function atributos_filter(feature, layer) {
  counter++;
  layer.bindTooltip(feature.properties.Top_Orig + "<br>" + feature.properties.Top_Atual);
  //Cria uma tabela com os lugares
  document.getElementById("jsoncontent").innerHTML += "<tr onclick='linhaSel(this)'><td style='text-align:right'>" + feature.properties.NO_1 + "</td><td>" + feature.properties.Top_Orig + "</td><td>" + feature.properties.Top_SD + "</td><td>" + feature.properties.Top_Atual + "</td></tr>";
  layer.on({
    click:
      function populate() {
        var obs = feature.properties["Obs_Vdigit"];
        if (obs == null) {
          obs = "--";
        } else {
          obs = feature.properties["Obs_Vdigit"]
        }
        var circle = L.circle(latLng, {radius: 200}).addTo(map);

/*
        if (realce == null) {
            //realce = L.circleMarker([feature.properties.LAT, feature.properties.LONG], {

            L.circleMarker(LatLng, {
                "radius": 15,
                "fillColor": "#9c5f1f",
                "color": "red",
                "weight": 1,
                "opacity": 1
            }).addTo(map);
        } else {
            //realce.setLatLng([feature.properties.LAT, feature.properties.LONG]);
            realce.setLatLng(latlng);
        }*/
        document.getElementById('toponimo').innerHTML = "<div>Nº de Ordem: " + feature.properties.NO_1 + "<br>Fólio: " + feature.properties.Folio + "<br><br><b>Topónimos:</b> <br>&nbsp;&nbsp;&nbsp;Códice: " + feature.properties.Top_Orig + "<br>&nbsp;&nbsp;&nbsp;S. Daveau: " + feature.properties.Top_SD + "<br>&nbsp;&nbsp;&nbsp;Atual: " + feature.properties.Top_Atual + "<br><br>Distrito: " + feature.properties.Distrito + "<br>Concelho: " + feature.properties.Concelho + "<br>Freguesia: " + feature.properties.Freguesia + "<br><br>Nota: " + obs;
      }/*,
      pointToLayer: function(feature, latlng){
        alert(realce);
        alert(feature.latLng);
      //Cria marcas em todos
        return new L.circleMarker(latlng, {

            "radius": 15,
            "fillColor": "#9c5f1f", //"#012999",
            "color": "red", //"#874703", //"#012999",
            "weight": 1,
            "opacity": 1
        })

    }*/
  });
  dist.push(feature.properties.Distrito);
  conc.push(feature.properties.Concelho);
}

function removeLugLayer(){
  if (map.hasLayer(lugs)) {
      map.removeLayer(lugs);
      lugsel=false;
  }
}

function selDist() {
    if (map.hasLayer(lugs)) {
        removeLugLayer();
    }
    //map.removeLayer(markers);
/*
    if (realce != null) {
        map.removeLayer(realce);
        realce = null;
    }
*/
/*
    if (sidebar.isVisible() == true) {
        sidebar.hide();
    }
*/
  counter = 0;
  //Limpa a tabela antes de atualizar; é feito através do jQuery e remove apenas as linhas, deixando o cabeçalho
  $("#jsoncontent tbody tr").remove();
  miDist = document.getElementById('selbx_dist').value;
  //Esvazia o array dos concelhos para criar uma lista subordinada ao distrito
  conc=[];
  if (miDist =="Todos") {
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
          fillColor: 'A9A9A', //'#7FFF00',
          color: '00000', //'#537898',
          radius: 3,
          weight: 1,
          fillOpacity: 0.6
        })
      }
    }).addTo(map);
    //Cria a lista de concelhos
    var uniqueNames = [];
    $.each(conc, function (i, el) {
        if ($.inArray(el, uniqueNames) === -1) {
            uniqueNames.push(el);
        }
    });

    /*uniqueNames.sort(function(a, b) {
        return a.localeCompare(b);
    });*/
    uniqueNames.sort(Intl.Collator().compare);
    //Esvazia a dropdown
    $(lista_conc).empty();
    //Cria o primeiro elemento da lista, que fica no topo: todos
    var opt = document.createElement('option');
    opt.value = "Todos";
    opt.innerHTML = "Todos";
    lista_conc.appendChild(opt);
    //Prrenche o resto da lista com a lista dos concelhos contida no array conc e ordena
    var i;
    for (i = 0; i < uniqueNames.length; i++) {
        opt = document.createElement('option');
        opt.value = uniqueNames[i];
        opt.innerHTML = uniqueNames[i];
        lista_conc.appendChild(opt);
    }

  } else {
    /*
    var geojson = L.geoJSON(toponimos, {
      filter: function (feature, layer) {
        if (miDist != "Todos") {
          return (feature.properties.Distrito == miDist);
        } else {
          return true;
        }
      },
      onEachFeature: atributos_filter, //vai buscar os atributos filtrados pelo distrito seleccionado
      pointToLayer: function(feature, latlng) {
        return L.circleMarker (latlng, {
          fillColor: '#7CFC00', //#8A2B0E',
          color: '#537898',
          radius: 4,
          weight: 1,
          fillOpacity: 0.6
        })
      }
    }).addTo(map); //cria um novo layer só com o seleccionados, com o ícone default, mas não esconde os outros
    */
    lugs = L.geoJSON(toponimos, {
      filter: function (feature, layer) {
        if (miDist != "Todos") {
          return (feature.properties.Distrito == miDist);
        } else {
          return true;
        }
      },
      onEachFeature: atributos_filter
    });
    //Cria a lista de concelhos
    var uniqueNames = [];
    $.each(conc, function (i, el) {
        if ($.inArray(el, uniqueNames) === -1) {
            uniqueNames.push(el);
        }
    });
/*
    uniqueNames.sort(function(a, b) {
        return a.localeCompare(b);
    });
*/
    uniqueNames.sort(Intl.Collator().compare);

    //Esvazia a dropdown
    $(lista_conc).empty();
    //Cria o primeiro elemento da lista, que fica no topo: todos
    var opt = document.createElement('option');
    opt.value = "Todos";
    opt.innerHTML = "Todos";
    lista_conc.appendChild(opt);
    //Prrenche o resto da lista com a lista dos concelhos contida no array conc e ordena
    var i;
    for (i = 0; i < uniqueNames.length; i++) {
        opt = document.createElement('option');
        opt.value = uniqueNames[i];
        opt.innerHTML = uniqueNames[i];
        lista_conc.appendChild(opt);
    }
  }
  /*
  markers = L.markerClusterGroup({
      showCoverageOnHover: false
  });
  markers.addLayer(geojson);
  map.addLayer(markers);
  if (lugsel==false){
      map.fitBounds(markers.getBounds());
    }*/

  document.getElementById('contador').innerHTML = "Nº de topónimos: " + counter;
  sortTable();
  $("#jsoncontent tr:nth-child(2n)").css("background-color","#f2f2f2");
  //estiloTable();

  if (miDist =="Todos") {
    map.fitBounds(geojson.getBounds());
  } else {
    map.addLayer(lugs);
    map.fitBounds(lugs.getBounds());
  }
}

function selConc() {

  if (map.hasLayer(lugs)) {
      removeLugLayer();
  }

  //map.removeLayer(markers);
/*
  if (realce != null) {
      map.removeLayer(realce);
      realce = null;
  }
*/
/*
  if (sidebar.isVisible() == true) {
      sidebar.hide();
  }
*/
  counter = 0;
  //document.getElementById("jsoncontent").innerHTML ="";
  $("#jsoncontent tbody tr").remove();
  miConc = document.getElementById('selbx_conc').value;
    //Esvazia o array dos distritos para criar uma lista subordinada ao concelho
    //dist=[];
  miDist = document.getElementById('selbx_dist').value;
  //Se não houver um distrito seleccionado
  if (miDist == "Todos" && miConc == "Todos") {
    var geojson = L.geoJSON(toponimos, {
      onEachFeature: atributos,
      //2- Com CircleMarker; o raio é dado em pixeis e permanece fixo, não se ajusta ao zoom
      pointToLayer: function(feature, latlng) {
        return L.circleMarker (latlng, {
          fillColor: 'A9A9A', //'#7FFF00',
          color: '00000', //'#537898',
          radius: 3,
          weight: 1,
          fillOpacity: 0.6
        })
      }
    }).addTo(map);
  } else {
      lugs = L.geoJSON(toponimos, {
        filter: function (feature, layer) {
          if (miConc != "Todos") {
            return (feature.properties.Concelho == miConc);
          } else {
            return (feature.properties.Distrito == miDist);
          }
        },
        onEachFeature: atributos_filter
      });
  }

  document.getElementById('contador').innerHTML = "Nº de topónimos: " + counter;
  sortTable();
  $("#jsoncontent tr:nth-child(2n)").css("background-color","#f2f2f2");

  if (miDist =="Todos" && miConc == "Todos") {
    map.fitBounds(geojson.getBounds());
  } else {
    map.addLayer(lugs);
    map.fitBounds(lugs.getBounds());
  }

  //map.fitBounds(geojson.getBounds());

}

function selLetra(x){
  if (map.hasLayer(lugs)) {
      removeLugLayer();
  }
  counter = 0;
  $("#jsoncontent tbody tr").remove();
  miConc = document.getElementById('selbx_conc').value;
  miDist = document.getElementById('selbx_dist').value;

  if (miDist == "Todos" && miConc == "Todos") {
    if (x != "C") {
      lugs = L.geoJSON(toponimos, {
        filter: function (feature, layer) {
          if (feature.properties.Top_Orig.charAt(0) == x) return true },
        onEachFeature: atributos_filter
        });
    } else {
      lugs = L.geoJSON(toponimos, {
        filter: function (feature, layer) {
          if (feature.properties.Top_Orig.charAt(0) == "C" || feature.properties.Top_Orig.charAt(0) == "Ç") return true },
          onEachFeature: atributos_filter
        });
    }
  } else if (miDist != "Todos" && miConc == "Todos") {
    if (x != "C") {
      lugs = L.geoJSON(toponimos, {
        filter: function (feature, layer) {
          if ((feature.properties.Distrito == miDist) && (feature.properties.Top_Orig.charAt(0) == x)) return true },
        onEachFeature: atributos_filter
        });
    } else {
      lugs = L.geoJSON(toponimos, {
        filter: function (feature, layer) {
          if ((feature.properties.Distrito == miDist) &&  (feature.properties.Top_Orig.charAt(0) == "C" || feature.properties.Top_Orig.charAt(0) == "Ç")) return true },
        onEachFeature: atributos_filter
      });
    }
  } else if (miConc != "Todos") {
    if (x != "C") {
      lugs = L.geoJSON(toponimos, {
        filter: function (feature, layer) {
          if ((feature.properties.Concelho == miConc) && (feature.properties.Top_Orig.charAt(0) == x)) return true },
        onEachFeature: atributos_filter
        });
    } else {
      lugs = L.geoJSON(toponimos, {
        filter: function (feature, layer) {
          if ((feature.properties.Concelho == miConc) &&  (feature.properties.Top_Orig.charAt(0) == "C" || feature.properties.Top_Orig.charAt(0) == "Ç")) return true },
        onEachFeature: atributos_filter
      });
    }
  }
  document.getElementById('contador').innerHTML = "Nº de topónimos: " + counter;
  sortTable();
  $("#jsoncontent tr:nth-child(2n)").css("background-color","#f2f2f2");

  map.addLayer(lugs);
  map.fitBounds(lugs.getBounds());
}

function linhaSel(x){
  //Limpa os lugares seleccionados
if (map.hasLayer(lugar)) {
    map.removeLayer(lugar);
    //realcelugar = null;
}
//Limpa o realce
/*if (realce != null) {
    map.removeLayer(realce);
    realce = null;
}*/
  //Número de Ordem
  var nordem = document.getElementById("jsoncontent").rows[x.rowIndex].cells.item(0).innerHTML;
/*
  lugs = L.geoJSON(toponimos, {
    filter: function (feature, layer) {
      if (feature.properties.NO_1 == nordem) return true
    },
    onEachFeature: atributos_filter
  });
  map.addLayer(lugs);
  map.fitBounds(lugs.getBounds())
*/

  lugar = L.geoJSON(toponimos, {
    filter: function(feature, layer) {
      if (feature.properties.NO_1 == nordem) return true
    },
    pointToLayer: function(feature, latlng){
    //Cria marcas em todos
      return new L.circleMarker(latlng, {
          "radius": 15,
          "fillColor": "#9c5f1f", //"#012999",
          "color": "red", //"#874703", //"#012999",
          "weight": 1,
          "opacity": 1
      });
    }
  });
  map.addLayer(lugar);
  map.fitBounds(lugar.getBounds());
  //var latlng = L.latLng(latlngs[0]);
  //map.flyTo(latlng);


}

function sortTable() {
  //FONTE: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_sort_table
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("jsoncontent");
  switching = true;
  /*Make a loop that will continue until
  no switching has been done:*/

  //tentativa
  //table.sort(Intl.Collator().compare);

  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("td")[1];
      y = rows[i + 1].getElementsByTagName("td")[1];
      //check if the two rows should switch place:
//      if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
        //if so, mark as a switch and break the loop:
//        shouldSwitch = true;
//        break;
//      }

      //EC: fazer com localCompare para poder ordenar sem ter em conta os acentos
      var topx = x.innerHTML.toLowerCase();
      var topy = y.innerHTML.toLowerCase();
      var result = topx.localeCompare(topy);
      //alert (result);
      if (result > 0) {
        //if so, mark as a switch and break the loop:
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}

/*
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
