puntos = 0
refrescar_bandera();

var basic_choropleth = new Datamap({
  element: document.getElementById("container"),
  projection: 'mercator',
  done: function(datamap) {
    datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
      check_correct(geography.properties.name);
    });
}
});

basic_choropleth.updateChoropleth(data);

function refrescar_bandera() {
  const a2 = Object.keys(names_a2);
  num_ale = Math.floor(Math.random() * (a2.length-1)); 
  console.log(a2[num_ale])
  name_ale = names_a2[a2[num_ale]]
  console.log(name_ale)
  document.getElementById("bandera").src = "https://www.countryflags.io/" + a2[num_ale] + "/shiny/64.png";
  return 5
}

function check_correct(country_name) {
  if (country_name == name_ale) {
    update_points("correct")
  } else {
    update_points("incorrect")
  }
  refrescar_bandera();
}

function update_points(status){
  if (status=="correct") {
    puntos = puntos + 1 
  } else {
    puntos = puntos - 1
  }
  document.getElementById('puntuacion').innerHTML = puntos
}