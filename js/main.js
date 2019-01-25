
names_a2["US"] = "United States of America"
names_a2["TZ"] = "United Republic of Tanzania"
names_a2["CG"] = "Republic of the Congo"
names_a2["CD"] = "Democratic Republic of the Congo"
names_a2["RS"] = "Republic of Serbia"
names_a2["SS"] = "South Sudan"
names_a2["IR"] = "Iran"
names_a2["SY"] = "Syria"
var basic_choropleth = new Datamap({
  element: document.getElementById("container"),
  projection: 'mercator',
  geographyConfig: {
    highlightBorderColor: '#bada55',
    popupTemplate: function hover_flag(geography) {
      const code = Object.keys(names_a2).find(key => names_a2[key] === geography.properties.name);
      image_template = "<img src=" + "https://www.countryflags.io/" + code + "/shiny/64.png" + ">"
      text_template = '<p style="background-color: #d0d4db; display: inline;">' + geography.properties.name + "</p>"
      return image_template + text_template
    }
  },
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



var slider_red = document.getElementById("slider_red");
var output_red = document.getElementById("p_red");
output_red.innerHTML = slider_red.value;

var slider_green = document.getElementById("slider_green");
var output_green = document.getElementById("p_green");
output_red.innerHTML = slider_green.value;

var slider_blue = document.getElementById("slider_blue");
var output_blue = document.getElementById("p_blue");
output_red.innerHTML = slider_blue.value;


slider_red.oninput = function() {
  output_red.innerHTML = this.value;
}
slider_green.oninput = function() {
  output_green.innerHTML = this.value;
}
slider_blue.oninput = function() {
  output_blue.innerHTML = this.value;
}

function update_map() {
  r = slider_red.value
  g = slider_green.value
  b = slider_blue.value
  console.log(r,g,b)
  data_aux = JSON.parse(JSON.stringify(data));
  for (var key in data){
    valores = data[key].split("(")[1].split(")")[0].split(",")
    rr = parseFloat(valores[0])
    gg = parseFloat(valores[1])
    bb = parseFloat(valores[2])
    if (rr<r || gg<g || bb<b){
      data_aux[key] = "rgb(200,200,200)"
    } else {
      data_aux[key] = data[key]
    }

  basic_choropleth.updateChoropleth(data_aux)

  }
  console.log(data)
}