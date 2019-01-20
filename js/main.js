
names_a2["US"] = "United States of America"
names_a2["TZ"] = "United Republic of Tanzania"
names_a2["CG"] = "Republic of the Congo"
names_a2["CD"] = "Democratic Republic of the Congo"
names_a2["RS"] = "Republic of Serbia"
names_a2["SS"] = "South Sudan"

var basic_choropleth = new Datamap({
  element: document.getElementById("container"),
  projection: 'mercator',
  done: function(datamap) {
    datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
      show_flag(geography.properties.name);
    });
}
});

basic_choropleth.updateChoropleth(data);

function show_flag(country_name) {

  const code = Object.keys(names_a2).find(key => names_a2[key] === country_name);
  document.getElementById("bandera").src = "https://www.countryflags.io/" + code + "/shiny/64.png";
  if (code == undefined){
    console.log("indefindio")
  }
  console.log(code)
}

