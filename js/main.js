
names_a2["US"] = "United States of America"
names_a2["TZ"] = "United Republic of Tanzania"
names_a2["CG"] = "Republic of the Congo"
names_a2["CD"] = "Democratic Republic of the Congo"
names_a2["RS"] = "Republic of Serbia"
names_a2["SS"] = "South Sudan"
names_a2["IR"] = "Iran"
names_a2["SY"] = "Syria"
names_a2["MM"] = "Myanmar"
names_a2["LA"] = "Laos"


Chart.defaults.global.defaultFontSize = 15;
Chart.defaults.scale.gridLines.display = false;

function unique(a) {
  return a.sort().filter(function(value, index, array) {
      return (index === 0) || (value !== array[index-1]);
  });
}


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
  population = document.getElementById("pop")
  area = document.getElementById("p_ar")
  p_name = document.getElementById("p_name")
  const Http = new XMLHttpRequest();
  const url='https://restcountries.eu/rest/v2/alpha/' + code;
  Http.open("GET", url);
  Http.send();
  Http.onreadystatechange=(e)=>{
    console.log(Http.responseText)
    info = JSON.parse(Http.responseText)
    population.innerHTML = "Population: " + info["population"]
    area.innerHTML = "Area(km^2): " + info["area"]
    p_name.innerHTML = info["name"]
    create_list_borders(info["borders"]);
  }

  if (code == undefined){
    console.log("indefindio")
  }
  console.log(code)
}

function create_list_borders(borders) {
  div_bord = document.getElementById("borders")
  div_bord.innerHTML = ""
  alpha2_borders = []
  for (border in borders){
    const Http = new XMLHttpRequest();
    const url='https://restcountries.eu/rest/v2/alpha/' + borders[border];
    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange=(e)=>{
      info = JSON.parse(Http.responseText)
      alpha2_borders.push(info["alpha2Code"])
      update_images_borders(unique(alpha2_borders))
  }
  }

}

function update_images_borders(a2) {
  div_bord = document.getElementById("borders")
  div_bord.innerHTML = ""
  for (i in a2){
    div_img_txt = document.createElement("div")
    div_img_txt.style = "display:inline-block"
    imagen = document.createElement('img');
    imagen.src = "https://www.countryflags.io/" + a2[i] + "/shiny/64.png"
    p_country = document.createElement('p');
    p_country.innerHTML = a2[i]
    div_img_txt.appendChild(imagen)
    div_img_txt.appendChild(p_country)
    div_bord.appendChild(div_img_txt)
  }
  
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


var ctx = document.getElementById("canvas1").getContext('2d');

var myChart = new Chart(ctx, {

 
  // The type of chart we want to create
  type: 'radar',

  // The data for our dataset
  data: {
    labels: ["Africa", 
             "Antartica",
             "Asia", 
             "Europa",
             "Norte America", 
             "Oceania",
             "Sur America", 
             ],
    datasets: [{
      label: "Rojo",
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'rgba(179,181,198,1)',
      data: [131.04399717514121,
        98.36808333333335,
        161.63147988505744,
        176.70326923076925,
        128.17267094017095,
        114.58741666666667,
        150.55208333333337]
    }, {
      label: "Verde",
      backgroundColor: 'rgba(0,255,0,0.3)',
      borderColor: 'rgba(179,181,198,1)',
      data: [116.27050847457629,
        76.14641666666667,
        110.25350574712644,
        106.54996794871798,
        108.70940170940172,
        97.50821666666667,
        119.06921875]
    }, {
      label: "Azul",
      backgroundColor: 'rgba(0,0,255,0.3)',
      borderColor: 'rgba(179,181,198,1)',
      data: [91.24826977401125,
        138.22491666666667,
        101.3025287356322,
        110.64713141025638,
        125.08934829059832,
        118.5187,
        93.2134375]
    }]
  },

  // Configuration options go here
  options: {
    scale: {
      pointLabels: {
        fontSize: 10
      },
      ticks: {
        min: 0,
        max: 180
      }

    },
    layout: {
      padding: {
        left: 100,
        right: 100,
        top: 100,
        bottom: 100
      }
    },
    title: {
      display: true,
      text: 'Distribución de RGB por continentes',
      fontSize: 20
    },

  },

});
